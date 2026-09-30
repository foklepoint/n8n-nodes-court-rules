import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { courtRulesApiRequest } from '../shared/transport';

type Judge = {
	slug: string;
	name: string;
	judge_type: string | null;
};

type JudgesResponse = {
	judges: Judge[];
};

const PAGE_SIZE = 100;

/**
 * Lists the judges of the court selected in the Court field. The API returns the whole
 * roster in one response, so filtering and paging happen here.
 */
export async function getJudges(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const districtId = this.getCurrentNodeParameter('districtId', { extractValue: true }) as
		| string
		| undefined;

	if (!districtId) {
		return { results: [] };
	}

	const response = (await courtRulesApiRequest.call(this, 'GET', '/api/v1/judges', {
		district_id: districtId,
	})) as JudgesResponse;

	const term = (filter ?? '').trim().toLowerCase();
	const matches = (response.judges ?? [])
		.filter(
			(judge) =>
				term === '' ||
				judge.name.toLowerCase().includes(term) ||
				judge.slug.toLowerCase().includes(term),
		)
		.sort((a, b) => a.name.localeCompare(b.name));

	const start = paginationToken ? Number(paginationToken) : 0;
	const results: INodeListSearchItems[] = matches.slice(start, start + PAGE_SIZE).map((judge) => ({
		name: judge.name,
		value: judge.slug,
		description: judge.judge_type ?? undefined,
	}));

	const nextStart = start + PAGE_SIZE;
	return {
		results,
		paginationToken: nextStart < matches.length ? String(nextStart) : undefined,
	};
}
