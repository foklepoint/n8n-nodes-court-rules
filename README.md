# n8n-nodes-court-rules

This is an n8n community node for [Court Rules](https://www.courtrules.app/), a free reference for U.S. federal and state court rules, local rules and judge standing orders. It lets your workflows look up courts, judges, filing rules and court holidays through the [Court Rules REST API](https://docs.courtrules.app).

Every rule the API returns carries the URL of the court document it came from, so a workflow can hand the source to a person for review.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Status

- This package is prepared but not published to npm yet. Publishing is waiting on an npm account. Until then, install it from a local build (see [Development](#development)).
- The node compiles against the `n8n-workflow` types with `tsc --strict`, and `npm run verify` checks its request definitions offline against the Court Rules OpenAPI spec.
- It has not been run inside an n8n instance, and it has not been tested with a real API key.

## Installation

After the package is published, follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/): open **Settings > Community Nodes**, choose **Install**, and enter `n8n-nodes-court-rules`.

## Credentials

1. Sign in at [console.courtrules.app](https://console.courtrules.app) with Google or email. Sign-in is open to anyone.
2. Create an API key. Keys look like `crm_prod_...`.
3. In n8n, create a **Court Rules API** credential and paste the key.

The node sends the key as `Authorization: Bearer <key>` to `https://api.courtrules.app`. The credential test calls `GET /api/v1/courts`. Authentication details are in the [API docs](https://docs.courtrules.app/authentication).

## Operations

| Resource | Operation    | API call                                     | Output                                 |
| -------- | ------------ | -------------------------------------------- | -------------------------------------- |
| Court    | Get          | `GET /api/v1/courts/{district_id}`           | One item: the court                    |
| Court    | Get Many     | `GET /api/v1/courts`                         | One item per court                     |
| Judge    | Get Many     | `GET /api/v1/judges?district_id=`            | One item per judge or courtroom        |
| Rule     | Get for Judge | `GET /api/v1/rules?district_id=&judge_slug=` | One item: the rules, grouped by source |
| Rule     | Search       | `GET /api/v1/extracted-rules`                | One item per extracted rule            |
| Holiday  | Get Many     | `GET /api/v1/holidays`                       | One item per holiday or closure date   |

Notes:

- **Court and Judge fields** show a list. The court list shows courts that have published rules. To use any other court ID or a judge slug directly, switch the field to **By ID** or **By Slug**, or use an expression.
- **Rule > Search** takes free text and filters for court, judge, rule type, workflow phase and case type. With **Return All** on, it pages through the results 100 rules at a time. Broad searches can be rejected by the API with a 422; add a court, judge or rule type filter.
- **Rule > Get for Judge** accepts a document scope and a motion type. The API applies them only to courts with a compliance profile, currently the Eastern District of New York (`edny`).
- **Holiday > Get Many** returns at most 500 holidays per request.
- **Court > Get Many** starts with the **Only Courts With Rules** filter on, because most mapped courts have no published rules yet. **Judge > Get Many** has a similar **Only Judges With Rules** filter.
- Rate limit: 300 requests per minute per key. The court and judge lists in the editor each make one request.

Compliance checks (`POST /api/v1/check`) and PDF classification are not part of this node yet.

## Using the node as an AI tool

The node sets `usableAsTool`, so n8n offers it to AI Agent nodes as a tool.

## Development

```bash
git clone https://github.com/foklepoint/n8n-nodes-court-rules.git
cd n8n-nodes-court-rules
npm install
npm run dev      # starts n8n with the node loaded and rebuilds on change
npm run lint
npm run build
npm run verify   # offline checks of the built node, no n8n and no API key needed
```

`npm run verify` also accepts `--spec <path or URL>` to compare the query parameters and enum values with the Court Rules OpenAPI spec:

```bash
node scripts/verify-routing.js --spec https://api.courtrules.app/openapi.json
```

The package follows the [n8n-nodes-starter](https://github.com/n8n-io/n8n-nodes-starter) layout and uses the declarative style, with no runtime dependencies.

## Resources

- [Court Rules](https://www.courtrules.app/)
- [Court Rules API documentation](https://docs.courtrules.app)
- [Court Rules API keys](https://console.courtrules.app)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE.md)
