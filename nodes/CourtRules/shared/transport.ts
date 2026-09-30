import type {
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export const COURT_RULES_API_URL = 'https://api.courtrules.app';

/**
 * Authenticated request used by the list search methods (court and judge pickers).
 * The operations themselves use the declarative `routing` definitions.
 */
export async function courtRulesApiRequest(
	this: ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
) {
	const options: IHttpRequestOptions = {
		method,
		qs,
		url: `${COURT_RULES_API_URL}${resource}`,
		json: true,
	};

	return await this.helpers.httpRequestWithAuthentication.call(this, 'courtRulesApi', options);
}
