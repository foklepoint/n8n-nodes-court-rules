import type { INodeProperties } from 'n8n-workflow';
import { ruleGetForJudgeDescription } from './getForJudge';
import { ruleSearchDescription } from './search';

const showOnlyForRules = {
	resource: ['rule'],
};

export const ruleDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRules,
		},
		options: [
			{
				name: 'Get for Judge',
				value: 'getForJudge',
				action: 'Get rules for judge',
				description: 'Retrieve the rules that apply to one judge, with their sources',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/rules',
						qs: {
							district_id: '={{$parameter.districtId}}',
							judge_slug: '={{$parameter.judgeSlug}}',
						},
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search rules',
				description: 'Search extracted filing rules by text, court, judge or rule type',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/extracted-rules',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'rules',
								},
							},
						],
					},
				},
			},
		],
		default: 'search',
	},
	...ruleGetForJudgeDescription,
	...ruleSearchDescription,
];
