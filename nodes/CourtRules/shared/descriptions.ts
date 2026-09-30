import type { INodeProperties } from 'n8n-workflow';

/**
 * Court picker used by operations that need a court. The list only shows courts that have
 * published rules; any other court ID can be typed with the "By ID" mode.
 */
export const districtSelect: INodeProperties = {
	displayName: 'Court',
	name: 'districtId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'The court to look up',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a court...',
			typeOptions: {
				searchListMethod: 'getCourts',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. edny',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[A-Za-z0-9_-]+$',
						errorMessage: 'Not a valid court ID',
					},
				},
			],
		},
	],
};

/**
 * Judge picker. It lists the judges of the court chosen in the Court field above it.
 */
export const judgeSelect: INodeProperties = {
	displayName: 'Judge',
	name: 'judgeSlug',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'The judge, calendar, department or courtroom to look up',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a judge...',
			typeOptions: {
				searchListMethod: 'getJudges',
				searchable: true,
			},
		},
		{
			displayName: 'By Slug',
			name: 'slug',
			type: 'string',
			placeholder: 'e.g. nicholas-g-garaufis',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[A-Za-z0-9_-]+$',
						errorMessage: 'Not a valid judge slug',
					},
				},
			],
		},
	],
};
