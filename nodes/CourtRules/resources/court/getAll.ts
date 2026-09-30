import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCourtGetMany = {
	operation: ['getAll'],
	resource: ['court'],
};

export const courtGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForCourtGetMany,
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
				...showOnlyForCourtGetMany,
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
		default: { withRulesOnly: true },
		displayOptions: {
			show: showOnlyForCourtGetMany,
		},
		options: [
			{
				displayName: 'Only Courts With Rules',
				name: 'withRulesOnly',
				type: 'boolean',
				default: true,
				description: 'Whether to return only courts that have published rules',
			},
		],
	},
];
