import type { INodeProperties } from 'n8n-workflow';
import { districtSelect } from '../../shared/descriptions';
import { courtGetManyDescription } from './getAll';

const showOnlyForCourts = {
	resource: ['court'],
};

export const courtDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCourts,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get court',
				description: 'Retrieve one court by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/courts/{{encodeURIComponent($parameter.districtId)}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many courts',
				description: 'Retrieve the courts that Court Rules maps',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/courts',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'courts',
								},
							},
							{
								type: 'filter',
								enabled: '={{ !!$parameter.filters?.withRulesOnly }}',
								properties: {
									pass: '={{ $responseItem.status === "live" }}',
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
			show: {
				...showOnlyForCourts,
				operation: ['get'],
			},
		},
	},
	...courtGetManyDescription,
];
