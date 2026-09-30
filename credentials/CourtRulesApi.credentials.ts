import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CourtRulesApi implements ICredentialType {
	name = 'courtRulesApi';

	displayName = 'Court Rules API';

	icon: Icon = { light: 'file:../icons/courtrules.svg', dark: 'file:../icons/courtrules.dark.svg' };

	documentationUrl = 'https://docs.courtrules.app/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Sign in at console.courtrules.app with Google or email to create a free API key. Keys look like crm_prod_...',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.courtrules.app',
			url: '/api/v1/courts',
			method: 'GET',
		},
	};
}
