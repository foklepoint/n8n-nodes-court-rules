import type { INodeProperties } from 'n8n-workflow';

const showOnlyForJudgeGetMany = {
	operation: ['getAll'],
	resource: ['judge'],
};

export const judgeGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForJudgeGetMany,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForJudgeGetMany,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		routing: {
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
			show: showOnlyForJudgeGetMany,
		},
		options: [
			{
				displayName: 'Only Judges With Rules',
				name: 'withRulesOnly',
				type: 'boolean',
				default: true,
				description: 'Whether to return only judges whose own rules are published',
			},
		],
	},
];
