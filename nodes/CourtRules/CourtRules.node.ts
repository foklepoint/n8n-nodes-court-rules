import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { getCourts } from './listSearch/getCourts';
import { getJudges } from './listSearch/getJudges';
import { courtDescription } from './resources/court';
import { holidayDescription } from './resources/holiday';
import { judgeDescription } from './resources/judge';
import { ruleDescription } from './resources/rule';

export class CourtRules implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Court Rules',
		name: 'courtRules',
		icon: {
			light: 'file:../../icons/courtrules.svg',
			dark: 'file:../../icons/courtrules.dark.svg',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Look up U.S. court filing rules, judge standing orders and court holidays',
		defaults: {
			name: 'Court Rules',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'courtRulesApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.courtrules.app',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Court',
						value: 'court',
					},
					{
						name: 'Holiday',
						value: 'holiday',
					},
					{
						name: 'Judge',
						value: 'judge',
					},
					{
						name: 'Rule',
						value: 'rule',
					},
				],
				default: 'rule',
			},
			...courtDescription,
			...holidayDescription,
			...judgeDescription,
			...ruleDescription,
		],
	};

	methods = {
		listSearch: {
			getCourts,
			getJudges,
		},
	};
}
