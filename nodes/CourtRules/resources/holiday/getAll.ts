import type { INodeProperties } from 'n8n-workflow';

const showOnlyForHolidayGetMany = {
	operation: ['getAll'],
	resource: ['holiday'],
};

export const holidayGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: showOnlyForHolidayGetMany,
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
		},
		description: 'Max number of results to return',
		hint: 'The API returns at most 500 holidays per request',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: showOnlyForHolidayGetMany,
		},
		options: [
			{
				displayName: 'Court ID',
				name: 'courtId',
				type: 'string',
				default: '',
				placeholder: 'e.g. edny',
				description:
					'Only return holidays for this court. Use the Court > Get Many operation to find court IDs.',
				routing: {
					send: {
						type: 'query',
						property: 'district_id',
						value: '={{ $value || undefined }}',
					},
				},
			},
			{
				displayName: 'From Date',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Only return holidays on or after this date',
				routing: {
					send: {
						type: 'query',
						property: 'date_from',
						value: '={{ String($value).slice(0, 10) }}',
					},
				},
			},
			{
				displayName: 'To Date',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'Only return holidays on or before this date',
				routing: {
					send: {
						type: 'query',
						property: 'date_to',
						value: '={{ String($value).slice(0, 10) }}',
					},
				},
			},
			{
				displayName: 'Year',
				name: 'year',
				type: 'number',
				typeOptions: {
					minValue: 1900,
					maxValue: 2200,
				},
				default: 2026,
				description: 'Only return holidays in this calendar year',
				routing: {
					send: {
						type: 'query',
						property: 'year',
					},
				},
			},
		],
	},
];
