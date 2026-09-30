import type { INodeProperties } from 'n8n-workflow';
import { districtSelect, judgeSelect } from '../../shared/descriptions';
import { documentScopeOptions, motionTypeOptions } from '../../shared/options';

const showOnlyForRuleGetForJudge = {
	operation: ['getForJudge'],
	resource: ['rule'],
};

export const ruleGetForJudgeDescription: INodeProperties[] = [
	{
		...districtSelect,
		displayOptions: {
			show: showOnlyForRuleGetForJudge,
		},
	},
	{
		...judgeSelect,
		displayOptions: {
			show: showOnlyForRuleGetForJudge,
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForRuleGetForJudge,
		},
		options: [
			{
				displayName: 'Document Scope',
				name: 'documentScope',
				type: 'options',
				options: documentScopeOptions,
				default: 'brief_support',
				description:
					'Only return rules for this kind of document. Applies to courts with compliance profiles, currently the Eastern District of New York (edny).',
				routing: {
					send: {
						type: 'query',
						property: 'document_scope',
					},
				},
			},
			{
				displayName: 'Motion Type',
				name: 'motionType',
				type: 'options',
				options: motionTypeOptions,
				default: 'general',
				description:
					'Only return rules for this kind of motion. Applies to courts with compliance profiles, currently the Eastern District of New York (edny).',
				routing: {
					send: {
						type: 'query',
						property: 'motion_type',
					},
				},
			},
		],
	},
];
