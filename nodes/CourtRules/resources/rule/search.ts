import type { INodeProperties } from 'n8n-workflow';
import { caseTypeOptions, ruleTypeOptions, workflowPhaseOptions } from '../../shared/options';

const showOnlyForRuleSearch = {
	operation: ['search'],
	resource: ['rule'],
};

export const ruleSearchDescription: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		placeholder: 'e.g. courtesy copies',
		displayOptions: {
			show: showOnlyForRuleSearch,
		},
		description:
			'Words that must appear in the rule summary, source text or tags. Narrow broad searches with a court, judge or rule type filter.',
		routing: {
			send: {
				type: 'query',
				property: 'q',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForRuleSearch,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
			},
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						limitParameter: 'limit',
						offsetParameter: 'offset',
						pageSize: 100,
						type: 'query',
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForRuleSearch,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: showOnlyForRuleSearch,
		},
		options: [
			{
				displayName: 'Case Type',
				name: 'caseType',
				type: 'options',
				options: caseTypeOptions,
				default: 'civil',
				description:
					'Only return rules for this case type. General rules and rules without a case-type limit are included.',
				routing: {
					send: {
						type: 'query',
						property: 'case_type',
					},
				},
			},
			{
				displayName: 'Court ID',
				name: 'courtId',
				type: 'string',
				default: '',
				placeholder: 'e.g. il-cook-circuit',
				description:
					'Only return rules for this court. Use the Court > Get Many operation to find court IDs.',
				routing: {
					send: {
						type: 'query',
						property: 'district_id',
						value: '={{ $value || undefined }}',
					},
				},
			},
			{
				displayName: 'Include Court-Wide Rules',
				name: 'includeCourtRules',
				type: 'boolean',
				default: true,
				description:
					'Whether to also return court-wide rules when a judge is set. Has no effect without a judge.',
				routing: {
					send: {
						type: 'query',
						property: 'include_court_rules',
					},
				},
			},
			{
				displayName: 'Judge Slug',
				name: 'judgeSlug',
				type: 'string',
				default: '',
				placeholder: 'e.g. il-cook-reilly-eve-m',
				description:
					'Only return rules for this judge, calendar, department or courtroom. Use "court" for court-wide rules. Use the Judge > Get Many operation to find slugs.',
				routing: {
					send: {
						type: 'query',
						property: 'judge_slug',
						value: '={{ $value || undefined }}',
					},
				},
			},
			{
				displayName: 'Rule Type',
				name: 'ruleType',
				type: 'options',
				options: ruleTypeOptions,
				default: 'ElectronicFilingRule',
				description: 'Only return rules of this type',
				routing: {
					send: {
						type: 'query',
						property: 'logic_type',
					},
				},
			},
			{
				displayName: 'Workflow Phase',
				name: 'workflowPhase',
				type: 'options',
				options: workflowPhaseOptions,
				default: 'FILING',
				description: 'Only return rules for this phase of a case',
				routing: {
					send: {
						type: 'query',
						property: 'workflow_phase',
					},
				},
			},
		],
	},
];
