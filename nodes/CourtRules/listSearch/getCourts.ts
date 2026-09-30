import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { courtRulesApiRequest } from '../shared/transport';

type Court = {
	district_id: string;
	name: string | null;
	status: 'live' | 'coming_soon';
};

type CourtsResponse = {
	courts: Court[];
};

const PAGE_SIZE = 100;

/**
 * Lists the courts that have published rules. The API returns every mapped court in one
 * response, so filtering and paging happen here.
 */
export async function getCourts(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const response = (await courtRulesApiRequest.call(
		this,
		'GET',
		'/api/v1/courts',
	)) as CourtsResponse;

	const term = (filter ?? '').trim().toLowerCase();
	const matches = (response.courts ?? [])
		.filter((court) => court.status === 'live')
		.map((court) => ({ id: court.district_id, label: court.name ?? court.district_id }))
		.filter(
			(court) =>
				term === '' ||
				court.label.toLowerCase().includes(term) ||
				court.id.toLowerCase().includes(term),
		)
		.sort((a, b) => a.label.localeCompare(b.label));

	const start = paginationToken ? Number(paginationToken) : 0;
	const results: INodeListSearchItems[] = matches
		.slice(start, start + PAGE_SIZE)
		.map((court) => ({ name: `${court.label} (${court.id})`, value: court.id }));

	const nextStart = start + PAGE_SIZE;
	return {
		results,
		paginationToken: nextStart < matches.length ? String(nextStart) : undefined,
	};
}
