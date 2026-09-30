import type { INodeProperties } from 'n8n-workflow';
import { districtSelect } from '../../shared/descriptions';
import { judgeGetManyDescription } from './getAll';

const showOnlyForJudges = {
	resource: ['judge'],
};

export const judgeDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForJudges,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many judges',
				description: 'Retrieve the current judges, departments or courtrooms of a court',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/judges',
						qs: {
							district_id: '={{$parameter.districtId}}',
						},
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'judges',
								},
							},
							{
								type: 'filter',
								enabled: '={{ !!$parameter.filters?.withRulesOnly }}',
								properties: {
									pass: '={{ $responseItem.has_rules === true }}',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		...districtSelect,
		displayOptions: {
			show: showOnlyForJudges,
		},
	},
	...judgeGetManyDescription,
];
