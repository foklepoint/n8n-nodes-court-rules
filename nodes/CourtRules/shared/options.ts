import type { INodePropertyOptions } from 'n8n-workflow';

// Values come from the Court Rules OpenAPI spec (https://api.courtrules.app/openapi.json).

export const documentScopeOptions: INodePropertyOptions[] = [
	{ name: 'Affidavit', value: 'affidavit' },
	{ name: 'Brief in Opposition', value: 'brief_opposition' },
	{ name: 'Brief in Reply', value: 'brief_reply' },
	{ name: 'Brief in Support', value: 'brief_support' },
	{ name: 'Discovery Letter', value: 'discovery_letter' },
	{ name: 'Letter', value: 'letter' },
	{ name: 'Objection Response', value: 'objection_response' },
	{ name: 'Proposed Findings', value: 'proposed_findings' },
	{ name: 'Reconsideration Reply', value: 'reconsideration_reply' },
	{ name: 'Reconsideration Support', value: 'reconsideration_support' },
	{ name: 'Rule 56.1 Statement', value: 'rule_56_1_statement' },
	{ name: 'Settlement Statement', value: 'settlement_statement' },
];

export const motionTypeOptions: INodePropertyOptions[] = [
	{ name: 'Daubert', value: 'Daubert' },
	{ name: 'Discovery', value: 'discovery' },
	{ name: 'General', value: 'general' },
	{ name: 'Motion in Limine', value: 'motion_in_limine' },
	{ name: 'Motion to Amend', value: 'motion_to_amend' },
	{ name: 'Preliminary Injunction', value: 'preliminary_injunction' },
	{ name: 'Reconsideration', value: 'reconsideration' },
	{ name: 'Rule 12', value: 'Rule_12' },
	{ name: 'Rule 50', value: 'Rule_50' },
	{ name: 'Rule 56', value: 'Rule_56' },
	{ name: 'Rule 59', value: 'Rule_59' },
	{ name: 'Rule 60', value: 'Rule_60' },
	{ name: 'Temporary Restraining Order', value: 'TRO' },
];

export const ruleTypeOptions: INodePropertyOptions[] = [
	{ name: 'Adjournment Requirement', value: 'AdjournmentRequirementRule' },
	{ name: 'Bundling', value: 'BundlingRule' },
	{ name: 'Communication', value: 'CommunicationRule' },
	{ name: 'Courtesy Copy', value: 'CourtesyCopyRule' },
	{ name: 'Document Requirement', value: 'DocumentRequirement' },
	{ name: 'Electronic Filing', value: 'ElectronicFilingRule' },
	{ name: 'Filing Fee', value: 'FilingFeeRule' },
	{ name: 'Filing Timing', value: 'FilingTimingRule' },
	{ name: 'Format Constraint', value: 'FormatConstraint' },
	{ name: 'Junior Lawyer Incentive', value: 'JuniorLawyerIncentive' },
	{ name: 'Page or Word Limit', value: 'PageWordLimitRule' },
	{ name: 'Pre-Motion Conference', value: 'PreMotionConferenceRule' },
	{ name: 'Sealing Procedure', value: 'SealingProcedure' },
	{ name: 'Service', value: 'ServiceRule' },
];

export const workflowPhaseOptions: INodePropertyOptions[] = [
	{ name: 'Case Initiation', value: 'CASE_INITIATION' },
	{ name: 'Filing', value: 'FILING' },
	{ name: 'Motion Practice', value: 'MOTION_PRACTICE' },
	{ name: 'Post-Judgment', value: 'POST_JUDGMENT' },
	{ name: 'Trial Preparation', value: 'TRIAL_PREP' },
];

export const caseTypeOptions: INodePropertyOptions[] = [
	{ name: 'Bankruptcy', value: 'bankruptcy' },
	{ name: 'Chancery', value: 'chancery' },
	{ name: 'Civil', value: 'civil' },
	{ name: 'Civil Limited', value: 'civil_limited' },
	{ name: 'Civil Unlimited', value: 'civil_unlimited' },
	{ name: 'Commercial', value: 'commercial' },
	{ name: 'Complex Civil', value: 'complex_civil' },
	{ name: 'County', value: 'county' },
	{ name: 'Criminal', value: 'criminal' },
	{ name: 'Domestic Relations', value: 'domestic_relations' },
	{ name: 'Domestic Violence', value: 'domestic_violence' },
	{ name: 'Family', value: 'family' },
	{ name: 'Foreclosure', value: 'foreclosure' },
	{ name: 'General', value: 'general' },
	{ name: 'Habeas', value: 'habeas' },
	{ name: 'Juvenile', value: 'juvenile' },
	{ name: 'Law', value: 'law' },
	{ name: 'Limited Civil', value: 'limited_civil' },
	{ name: 'Mental Health', value: 'mental_health' },
	{ name: 'Municipal', value: 'municipal' },
	{ name: 'Prisoner', value: 'prisoner' },
	{ name: 'Pro Se', value: 'pro_se' },
	{ name: 'Probate', value: 'probate' },
	{ name: 'Small Claims', value: 'small_claims' },
	{ name: 'Social Security', value: 'social_security' },
	{ name: 'Traffic', value: 'traffic' },
	{ name: 'Unlawful Detainer', value: 'unlawful_detainer' },
	{ name: 'Unlimited Civil', value: 'unlimited_civil' },
];
