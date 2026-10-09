# BuildHive

**Automated browser testing for developers who ship.**

BuildHive connects verified websites to repeatable Chromium tests. Developers build or review a test plan, execute it in a separate worker, inspect step-level evidence, and schedule recurring checks.

## Architecture

- `client/`: Next.js 16, React 19, TypeScript, responsive light/dark UI.
- `server/`: Express API, existing GitHub/Google OAuth, database-backed HttpOnly sessions.
- `server/prisma/`: Prisma 6 schema and additive PostgreSQL migrations, compatible with Supabase.
- `server/src/hive/worker.ts`: independent BullMQ/Redis runner and scheduler.
- `server/src/hive/egress.ts`: public-HTTPS CONNECT proxy with DNS resolution pinned to each socket.
- Supabase private Storage: screenshots and traces with authorized, 60-second signed links.
- Optional Gemini drafting/explanations, SMTP notifications, Razorpay recurring subscriptions.
- `legacy/`: preserved previous application sources, including the edits present before this refactor. Legacy routes are not mounted.

The original database tables remain in place. The new product uses `Hive*` tables and the existing `User` table. No existing Supabase data was migrated or deleted during development.

## Start locally

Use Node 22.12+ (Node 24 also tested), PostgreSQL and Redis.

```bash
npm ci --prefix server
npm ci --prefix client
# If needed, create backing services:
docker compose up -d
```

Keep your existing `server/.env` OAuth/database values. Compare it with [server/.env.example](server/.env.example) and add the missing variables. Do not overwrite real credentials with example values.

```bash
npm run check:config
npm run db:generate
npm run db:deploy
cd server
npx playwright install --with-deps chromium
cd ..
```

For Docker’s local PostgreSQL, both `DATABASE_URL` and `DIRECT_URL` are `postgresql://buildhive:local-development-only@localhost:5432/buildhive`.

Run these processes in separate terminals:

```bash
npm run dev:api                 # API :5000
npm run dev                    # Web :3000
npm --prefix server run egress  # Egress proxy :3128
npm run dev:worker              # Queue, browser execution, schedules, alerts, retention
```

The client proxies `/api` to the backend; browser requests use same-origin session cookies. For new OAuth registrations, use `http://localhost:3000/api/auth/github/callback` and `/google/callback`. Existing localhost:5000 callbacks also work locally when browser hostnames match. Production callbacks must use the public web origin so the login session cookie remains on that host.

## What is implemented

- Public homepage, features, workflow, pricing, documentation, FAQ, login, contact, legal drafts, interactive sample report, metadata and sitemap.
- Personal workspaces, profiles, notification settings, logout, session revocation, data export and account deletion.
- Projects with production/staging labels, DNS/file ownership verification, pause/archive/delete, encrypted variables and signed deployment hooks.
- Manual step editor and optional AI draft review, 12 allowed actions, assertions, desktop/mobile viewport, bounded timeouts, tags, immutable versions, duplicate/pause/delete.
- Durable run outbox, isolated Chromium contexts, cancellation, global queue concurrency, worker crash recovery, run and browser-time metering.
- Step timelines, expected/observed diagnostics, screenshots/traces where eligible, private artifact links, previous-pass comparison, optional AI explanations.
- Real dashboard metrics, searchable/filterable/paginated run history, timezone-aware schedules and failure/recovery alert deduplication.
- Server-enforced Free/Starter/Growth allowances, Razorpay subscription checkout/cancellation and signed idempotent payment events.
- Internal user suspension, sanitized job inspection/retry, worker health, storage and AI metering, feedback inbox.

All paid-provider features require real configuration. Manual tests do not require an AI key. The app reports unavailable services instead of manufacturing successful results.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm test                       # Fast unit checks; integration suites explicitly skip without fixtures
```

For the full suite, migrate a **separate database whose name contains `test`**, then:

```bash
TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/buildhive_test \
TEST_REDIS_URL=redis://localhost:6379/1 \
RUN_BROWSER_TESTS=1 npm test
```

For installed Google Chrome instead of Playwright Chromium, add `PLAYWRIGHT_CHANNEL=chrome`. Test setup overrides database URLs **before imports** and never falls back to your Supabase database. Browser fixtures use synthetic HTML and mocked artifact uploads; they do not send tests to third-party websites.

For interactive UI QA, start a separate web instance:

```bash
BUILDHIVE_DIST_DIR=.next-qa API_INTERNAL_URL=http://127.0.0.1:5100 \
npm --prefix client run dev -- --hostname 127.0.0.1 --port 3101

TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/buildhive_test \
PLAYWRIGHT_CHANNEL=chrome \
node --import ./server/node_modules/tsx/dist/loader.mjs infra/qa-ui.mjs
```

This creates/removes a fixture account, starts a test-only API on :5100, and writes screenshots under ignored `artifacts/qa/`. It never adds a production authentication or domain-verification bypass.

## Production and launch

Read [Setup and deployment](docs/SETUP.md), [Security and operations](docs/OPERATIONS.md), and the [V1 delivery checklist](docs/V1-STATUS.md). Dockerfiles and CI are included. Production browser execution must be deployed behind enforced network restrictions and container resource limits; configuring a proxy URL alone is not a network-isolation guarantee.

The blueprint’s customer interviews, legal approval, external-service provisioning, production deployment, real payment/email/OAuth acceptance tests, backup restoration, load/security review and beta/public launch are external release work. They are not marked complete merely because code exists.
