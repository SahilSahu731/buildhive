# BuildHive Monorepo

BuildHive is being rebuilt from scratch as a PR Risk Gate SaaS for software teams.

## Workspace Layout

- `apps/web`: frontend app (dashboard and onboarding)
- `apps/api`: backend API (auth, repos, billing, webhooks)
- `apps/worker`: background workers (review processing and notifications)
- `packages/shared`: shared types and utilities
- `packages/config`: shared lint and tsconfig presets
- `docs`: product and implementation documents
- `infrastructure`: deployment and infra-as-code assets

## Quickstart

1. Enable and activate pnpm via Corepack:
   - `corepack enable`
   - `corepack prepare pnpm@10.8.1 --activate`
2. Install workspace dependencies:
   - `pnpm install`
3. Validate baseline checks from root:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`

## Branches

- `main`: production-ready branch
- `dev`: integration branch for ongoing feature work
- `feature/*`: short-lived feature branches

See `docs/branch-strategy.md` for full workflow.
