import type { INodeProperties } from 'n8n-workflow';
import { holidayGetManyDescription } from './getAll';

const showOnlyForHolidays = {
	resource: ['holiday'],
};

export const holidayDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForHolidays,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many holidays',
				description: 'Retrieve court holidays and closure dates',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/holidays',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'holidays',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	...holidayGetManyDescription,
];
