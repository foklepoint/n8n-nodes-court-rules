#!/usr/bin/env node
// Offline checks for the compiled node. No n8n instance and no API key are needed.
//
//   npm run build && npm run verify
//   node scripts/verify-routing.js --dist dist --spec https://api.courtrules.app/openapi.json
//
// What it checks:
//   - every operation has a GET request with the expected /api/v1 URL
//   - every query parameter the node sends exists in the API (and its enum values match the spec, with --spec)
//   - the expressions in the routing definitions evaluate to the expected URLs and values
//   - the credential sends a Bearer header and tests against GET /api/v1/courts
//   - the court and judge pickers filter and page a mocked API response
//   - the paths in package.json point at compiled files

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let distDir = path.join(root, 'dist');
let specSource = null;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--dist') {
		distDir = path.resolve(args[i + 1]);
		i++;
	} else if (args[i] === '--spec') {
		specSource = args[i + 1];
		i++;
	}
}

let checks = 0;
let failures = 0;

function check(condition, message) {
	checks++;
	if (condition) {
		console.log('ok   ' + message);
	} else {
		failures++;
		console.log('FAIL ' + message);
	}
}

function sameSet(a, b) {
	const left = a.slice().sort();
	const right = b.slice().sort();
	return JSON.stringify(left) === JSON.stringify(right);
}

// Evaluates an n8n expression such as '={{ $value || undefined }}' with the given variables.
function evalExpression(expression, context) {
	let body = expression;
	if (body.charAt(0) === '=') {
		body = body.slice(1);
	}
	body = body.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '');
	const names = Object.keys(context);
	const values = [];
	for (let i = 0; i < names.length; i++) {
		values.push(context[names[i]]);
	}
	const fn = new Function(...names, 'return (' + body + ');');
	return fn(...values);
}

// Renders a string such as '=/api/v1/courts/{{encodeURIComponent($parameter.districtId)}}'.
function renderTemplate(template, context) {
	let text = template;
	if (text.charAt(0) === '=') {
		text = text.slice(1);
	}
	return text.replace(/\{\{([\s\S]*?)\}\}/g, function (whole, inner) {
		return String(evalExpression('{{' + inner + '}}', context));
	});
}

function showsFor(property, resource, operation) {
	const show = property.displayOptions && property.displayOptions.show;
	if (!show) {
		return false;
	}
	if (!show.resource || show.resource.indexOf(resource) === -1) {
		return false;
	}
	if (operation && (!show.operation || show.operation.indexOf(operation) === -1)) {
		return false;
	}
	return true;
}

// Collects every routing.send definition that is visible for a resource and operation.
function sendDefinitions(description, resource, operation) {
	const found = [];
	for (let i = 0; i < description.properties.length; i++) {
		const property = description.properties[i];
		if (!showsFor(property, resource, operation)) {
			continue;
		}
		if (property.routing && property.routing.send && property.routing.send.property) {
			found.push({ property: property, send: property.routing.send });
		}
		if (property.type === 'collection') {
			for (let j = 0; j < property.options.length; j++) {
				const option = property.options[j];
				if (option.routing && option.routing.send && option.routing.send.property) {
					found.push({ property: option, send: option.routing.send });
				}
			}
		}
	}
	return found;
}

function findOperation(description, resource, operation) {
	for (let i = 0; i < description.properties.length; i++) {
		const property = description.properties[i];
		if (property.name !== 'operation') {
			continue;
		}
		const show = property.displayOptions && property.displayOptions.show;
		if (!show || !show.resource || show.resource.indexOf(resource) === -1) {
			continue;
		}
		for (let j = 0; j < property.options.length; j++) {
			if (property.options[j].value === operation) {
				return property.options[j];
			}
		}
	}
	return null;
}

const expectedOperations = [
	{
		resource: 'court',
		operation: 'get',
		url: '/api/v1/courts/edny',
		sent: [],
	},
	{
		resource: 'court',
		operation: 'getAll',
		url: '/api/v1/courts',
		root: 'courts',
		sent: [],
	},
	{
		resource: 'judge',
		operation: 'getAll',
		url: '/api/v1/judges',
		root: 'judges',
		qs: ['district_id'],
		sent: [],
	},
	{
		resource: 'rule',
		operation: 'getForJudge',
		url: '/api/v1/rules',
		qs: ['district_id', 'judge_slug'],
		sent: ['document_scope', 'motion_type'],
	},
	{
		resource: 'rule',
		operation: 'search',
		url: '/api/v1/extracted-rules',
		root: 'rules',
		sent: [
			'q',
			'limit',
			'district_id',
			'judge_slug',
			'include_court_rules',
			'logic_type',
			'workflow_phase',
			'case_type',
		],
	},
	{
		resource: 'holiday',
		operation: 'getAll',
		url: '/api/v1/holidays',
		root: 'holidays',
		sent: ['limit', 'district_id', 'year', 'date_from', 'date_to'],
	},
];

function checkOperations(description) {
	const context = {
		$parameter: { districtId: 'edny', judgeSlug: 'gary-r-brown' },
		$value: undefined,
	};

	for (let i = 0; i < expectedOperations.length; i++) {
		const expected = expectedOperations[i];
		const label = expected.resource + ':' + expected.operation;
		const option = findOperation(description, expected.resource, expected.operation);
		check(option !== null, label + ' exists');
		if (option === null) {
			continue;
		}

		const request = option.routing && option.routing.request;
		check(request && request.method === 'GET', label + ' uses GET');
		if (!request) {
			continue;
		}

		let renderedUrl = request.url;
		if (typeof renderedUrl === 'string' && renderedUrl.charAt(0) === '=') {
			renderedUrl = renderTemplate(renderedUrl, context);
		}
		check(renderedUrl === expected.url, label + ' url renders to ' + expected.url);

		if (expected.qs) {
			const keys = Object.keys(request.qs || {});
			check(sameSet(keys, expected.qs), label + ' sends query ' + expected.qs.join(', '));
			const rendered = {};
			for (let k = 0; k < keys.length; k++) {
				rendered[keys[k]] = evalExpression(request.qs[keys[k]], context);
			}
			check(
				rendered.district_id === 'edny' &&
					(expected.qs.indexOf('judge_slug') === -1 || rendered.judge_slug === 'gary-r-brown'),
				label + ' query expressions read the selected court and judge',
			);
		}

		if (expected.root) {
			const actions = (option.routing.output && option.routing.output.postReceive) || [];
			let rootProperty = null;
			for (let a = 0; a < actions.length; a++) {
				if (actions[a].type === 'rootProperty') {
					rootProperty = actions[a].properties.property;
				}
			}
			check(
				rootProperty === expected.root,
				label + ' returns one item per "' + expected.root + '" entry',
			);
		}

		const sentNames = [];
		const definitions = sendDefinitions(description, expected.resource, expected.operation);
		for (let d = 0; d < definitions.length; d++) {
			sentNames.push(definitions[d].send.property);
		}
		check(
			sameSet(sentNames, expected.sent),
			label + ' can send query ' + (expected.sent.join(', ') || '(none)'),
		);
	}
}

function checkExpressions(description) {
	// Optional string filters drop empty values instead of sending "district_id=".
	const search = sendDefinitions(description, 'rule', 'search');
	for (let i = 0; i < search.length; i++) {
		const send = search[i].send;
		if (typeof send.value === 'string') {
			const emptyResult = evalExpression(send.value, { $value: '' });
			const filledResult = evalExpression(send.value, { $value: 'edny' });
			check(
				emptyResult === undefined && filledResult === 'edny',
				'search ' + send.property + ' is omitted when empty and sent when set',
			);
		}
	}

	// Dates go out as YYYY-MM-DD.
	const holidays = sendDefinitions(description, 'holiday', 'getAll');
	for (let i = 0; i < holidays.length; i++) {
		const send = holidays[i].send;
		if (send.property === 'date_from' || send.property === 'date_to') {
			const dateOnly = evalExpression(send.value, { $value: '2026-01-15T00:00:00.000-08:00' });
			check(dateOnly === '2026-01-15', 'holiday ' + send.property + ' is sent as YYYY-MM-DD');
		}
	}

	// The client-side filters read the response item and the filter switch.
	const courtGetMany = findOperation(description, 'court', 'getAll');
	const courtFilter = courtGetMany.routing.output.postReceive[1];
	const enabledOn = evalExpression(courtFilter.enabled, {
		$parameter: { filters: { withRulesOnly: true } },
	});
	const enabledOff = evalExpression(courtFilter.enabled, { $parameter: { filters: {} } });
	check(
		enabledOn === true && enabledOff === false,
		'court filter switch follows the "Only Courts With Rules" option',
	);
	check(
		evalExpression(courtFilter.properties.pass, { $responseItem: { status: 'live' } }) === true &&
			evalExpression(courtFilter.properties.pass, { $responseItem: { status: 'coming_soon' } }) ===
				false,
		'court filter keeps live courts only',
	);

	const judgeGetMany = findOperation(description, 'judge', 'getAll');
	const judgeFilter = judgeGetMany.routing.output.postReceive[1];
	check(
		evalExpression(judgeFilter.properties.pass, { $responseItem: { has_rules: true } }) === true &&
			evalExpression(judgeFilter.properties.pass, { $responseItem: { has_rules: false } }) ===
				false,
		'judge filter keeps judges with rules only',
	);
}

function checkPagination(description) {
	let returnAll = null;
	for (let i = 0; i < description.properties.length; i++) {
		const property = description.properties[i];
		if (property.name === 'returnAll' && showsFor(property, 'rule', 'search')) {
			returnAll = property;
		}
	}
	check(returnAll !== null, 'rule:search has a Return All switch');
	if (returnAll === null) {
		return;
	}
	const pagination = returnAll.routing.operations.pagination;
	check(
		pagination.type === 'offset' &&
			pagination.properties.limitParameter === 'limit' &&
			pagination.properties.offsetParameter === 'offset' &&
			pagination.properties.type === 'query' &&
			pagination.properties.pageSize <= 500,
		'rule:search pages with limit and offset (page size ' +
			pagination.properties.pageSize +
			', API maximum 500)',
	);
}

function checkCredential() {
	const credentialModule = require(path.join(distDir, 'credentials/CourtRulesApi.credentials.js'));
	const credential = new credentialModule.CourtRulesApi();
	check(credential.name === 'courtRulesApi', 'credential is named courtRulesApi');
	check(
		credential.properties.length === 1 &&
			credential.properties[0].name === 'apiKey' &&
			credential.properties[0].typeOptions.password === true,
		'credential has one password field, apiKey',
	);
	const header = credential.authenticate.properties.headers.Authorization;
	check(
		renderTemplate(header, { $credentials: { apiKey: 'test-key' } }) === 'Bearer test-key',
		'credential sends Authorization: Bearer <key>',
	);
	check(
		credential.test.request.baseURL === 'https://api.courtrules.app' &&
			credential.test.request.url === '/api/v1/courts' &&
			credential.test.request.method === 'GET',
		'credential test calls GET https://api.courtrules.app/api/v1/courts',
	);
}

function checkPackageJson(description) {
	const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
	const files = pkg.n8n.nodes.concat(pkg.n8n.credentials);
	for (let i = 0; i < files.length; i++) {
		const relative = files[i].replace(/^dist\//, '');
		check(
			fs.existsSync(path.join(distDir, relative)),
			'package.json path exists in the build: ' + files[i],
		);
	}
	check(
		description.credentials.length === 1 && description.credentials[0].name === 'courtRulesApi',
		'node uses the courtRulesApi credential',
	);
	check(description.usableAsTool === true, 'node is usable as an AI tool');
	check(
		pkg.keywords.indexOf('n8n-community-node-package') !== -1,
		'package has the n8n-community-node-package keyword',
	);
	check(pkg.dependencies === undefined, 'package has no runtime dependencies');
	check(pkg.license === 'MIT', 'package license is MIT');
}

async function loadSpec() {
	if (specSource === null) {
		return null;
	}
	if (/^https?:\/\//.test(specSource)) {
		const response = await fetch(specSource);
		return await response.json();
	}
	return JSON.parse(fs.readFileSync(specSource, 'utf8'));
}

function resolveRef(spec, value) {
	let current = value;
	while (current && current.$ref) {
		let target = spec;
		const parts = current.$ref.replace(/^#\//, '').split('/');
		for (let i = 0; i < parts.length; i++) {
			target = target[parts[i]];
		}
		current = target;
	}
	return current;
}

function checkAgainstSpec(description, spec) {
	const endpoints = [
		{ resource: 'rule', operation: 'getForJudge', path: '/api/v1/rules' },
		{ resource: 'rule', operation: 'search', path: '/api/v1/extracted-rules' },
		{ resource: 'holiday', operation: 'getAll', path: '/api/v1/holidays' },
		{ resource: 'judge', operation: 'getAll', path: '/api/v1/judges' },
		{ resource: 'court', operation: 'getAll', path: '/api/v1/courts' },
	];
	for (let i = 0; i < endpoints.length; i++) {
		const endpoint = endpoints[i];
		const label = endpoint.resource + ':' + endpoint.operation;
		const operation = spec.paths[endpoint.path].get;
		const documented = {};
		const parameters = operation.parameters || [];
		for (let p = 0; p < parameters.length; p++) {
			const parameter = resolveRef(spec, parameters[p]);
			documented[parameter.name] = resolveRef(spec, parameter.schema);
		}
		const definitions = sendDefinitions(description, endpoint.resource, endpoint.operation);
		for (let d = 0; d < definitions.length; d++) {
			const name = definitions[d].send.property;
			check(
				documented[name] !== undefined,
				label + ' query "' + name + '" is documented in the spec',
			);
			const option = definitions[d].property;
			if (documented[name] && documented[name].enum && Array.isArray(option.options)) {
				const values = [];
				for (let v = 0; v < option.options.length; v++) {
					values.push(option.options[v].value);
				}
				check(
					sameSet(values, documented[name].enum),
					label + ' "' + name + '" options match the spec enum',
				);
			}
		}
		const requestQs = Object.keys(
			findOperation(description, endpoint.resource, endpoint.operation).routing.request.qs || {},
		);
		for (let q = 0; q < requestQs.length; q++) {
			check(
				documented[requestQs[q]] !== undefined,
				label + ' query "' + requestQs[q] + '" is documented in the spec',
			);
		}
	}
	check(
		spec.paths['/api/v1/courts/{district_id}'] !== undefined,
		'spec documents GET /api/v1/courts/{district_id}',
	);
}

function makeCourts(count) {
	const courts = [];
	for (let i = 0; i < count; i++) {
		const number = String(1000 + i);
		courts.push({ district_id: 'court-' + number, name: 'Court ' + number, status: 'live' });
	}
	return courts;
}

async function checkListSearch() {
	const courtsModule = require(path.join(distDir, 'nodes/CourtRules/listSearch/getCourts.js'));
	const judgesModule = require(path.join(distDir, 'nodes/CourtRules/listSearch/getJudges.js'));

	let response = null;
	const calls = [];
	const context = {
		helpers: {
			httpRequestWithAuthentication: async function (credentialType, options) {
				calls.push({ credentialType: credentialType, options: options });
				return response;
			},
		},
		getCurrentNodeParameter: function (name, options) {
			calls.push({ parameter: name, options: options });
			return context.districtId;
		},
		districtId: 'edny',
	};

	response = {
		courts: [
			{ district_id: 'sdny', name: 'Southern District of New York', status: 'live' },
			{ district_id: 'edny', name: 'Eastern District of New York', status: 'live' },
			{ district_id: 'soon', name: 'Coming Soon Court', status: 'coming_soon' },
			{ district_id: 'no-name', name: null, status: 'live' },
		],
	};
	let result = await courtsModule.getCourts.call(context);
	check(
		result.results.length === 3 && result.paginationToken === undefined,
		'court picker lists live courts only',
	);
	check(
		result.results[0].value === 'edny' &&
			result.results[0].name === 'Eastern District of New York (edny)',
		'court picker sorts by name and shows "Name (id)"',
	);
	check(
		result.results[1].value === 'no-name' && result.results[2].value === 'sdny',
		'court picker keeps courts without a name and falls back to the ID',
	);
	check(
		calls[0].credentialType === 'courtRulesApi' &&
			calls[0].options.method === 'GET' &&
			calls[0].options.url === 'https://api.courtrules.app/api/v1/courts',
		'court picker calls GET /api/v1/courts with the Court Rules credential',
	);

	result = await courtsModule.getCourts.call(context, 'new york');
	check(result.results.length === 2, 'court picker filters by name');
	result = await courtsModule.getCourts.call(context, 'EDNY');
	check(
		result.results.length === 1 && result.results[0].value === 'edny',
		'court picker filters by ID, ignoring case',
	);

	response = { courts: makeCourts(250) };
	const first = await courtsModule.getCourts.call(context);
	const second = await courtsModule.getCourts.call(context, undefined, first.paginationToken);
	const third = await courtsModule.getCourts.call(context, undefined, second.paginationToken);
	check(
		first.results.length === 100 &&
			first.paginationToken === '100' &&
			second.results.length === 100 &&
			second.paginationToken === '200' &&
			third.results.length === 50 &&
			third.paginationToken === undefined,
		'court picker pages 250 courts as 100, 100 and 50',
	);

	calls.length = 0;
	response = {
		judges: [
			{ slug: 'z-judge', name: 'Zed Judge', judge_type: 'magistrate' },
			{ slug: 'a-judge', name: 'Ann Judge', judge_type: null },
		],
	};
	result = await judgesModule.getJudges.call(context);
	check(
		result.results.length === 2 &&
			result.results[0].value === 'a-judge' &&
			result.results[0].description === undefined &&
			result.results[1].description === 'magistrate',
		'judge picker sorts by name and shows the judge type',
	);
	check(
		calls[0].parameter === 'districtId' && calls[0].options.extractValue === true,
		'judge picker reads the selected court',
	);
	check(
		calls[1].options.url === 'https://api.courtrules.app/api/v1/judges' &&
			calls[1].options.qs.district_id === 'edny',
		'judge picker calls GET /api/v1/judges for that court',
	);
	result = await judgesModule.getJudges.call(context, 'zed');
	check(
		result.results.length === 1 && result.results[0].value === 'z-judge',
		'judge picker filters by name',
	);

	calls.length = 0;
	context.districtId = '';
	result = await judgesModule.getJudges.call(context);
	check(
		result.results.length === 0 && calls.length === 1 && calls[0].parameter === 'districtId',
		'judge picker returns nothing and makes no request before a court is chosen',
	);
}

async function main() {
	const nodeModule = require(path.join(distDir, 'nodes/CourtRules/CourtRules.node.js'));
	const description = new nodeModule.CourtRules().description;

	checkOperations(description);
	checkExpressions(description);
	checkPagination(description);
	checkCredential();
	checkPackageJson(description);
	await checkListSearch();

	const spec = await loadSpec();
	if (spec !== null) {
		checkAgainstSpec(description, spec);
	} else {
		console.log('skip spec cross-check (pass --spec <path or URL of openapi.json> to run it)');
	}

	console.log('');
	console.log(checks + ' checks, ' + failures + ' failed');
	if (failures > 0) {
		process.exit(1);
	}
}

main().catch(function (error) {
	console.error(error);
	process.exit(1);
});
