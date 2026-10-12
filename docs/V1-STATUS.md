# V1 delivery status

Updated 12 October 2026. This checklist separates implemented functionality from deployment and business work. The original requirements are preserved in `PRODUCT-BLUEPRINT.md`.

## Implementation by roadmap phase

| Phase | Implemented | Remaining acceptance or external work |
|---|---|---|
| 0 — Validation/audit | Existing repository inspected; previous sources and edits preserved in `legacy/` | Customer interviews and willingness-to-pay validation |
| 1 — Infrastructure | Next/Express/Prisma layout, Redis worker, CI, Dockerfiles, local fixtures | Provision and test hosting services |
| 2 — Design | Responsive marketing/dashboard, light/dark themes, forms, navigation, empty/error/loading states | Independent accessibility/user review |
| 3 — Accounts | Google/GitHub OAuth, persisted single-use state, account-linking guards, login error recovery, sessions, profiles, session revocation, export/delete | Complete real OAuth callback acceptance on public domain |
| 4 — Projects | CRUD, archive/pause, HTTPS validation, DNS/file challenges, workspace authorization | Verify an owned production/staging domain |
| 5 — Test editor | All 12 specified actions, assertions, mobile/desktop viewports, settings, tags, versions, duplicate/delete | Validate locators for actual customer apps |
| 6 — Browser engine | Deterministic Chromium runner, bounded execution, diagnostics, cancellation, secret references | Enforce and probe hosting network/container isolation |
| 7 — Queue | Durable DB outbox, BullMQ/Redis, concurrency, heartbeat recovery, no overlapping runs | Load and failure testing on managed infrastructure |
| 8 — Reports | Timelines, step evidence, private artifact links, screenshots and previous-pass comparison | Real Supabase upload/sign/delete test |
| 9 — AI | Reviewed plan drafts, strict schemas, missing information, optional explanations, metering | Add key; run `AI-EVALUATION.md` |
| 10 — Analytics | Real workspace/project metrics, history filters, pass rates, frequent failures, aggregate activation counts | Review usability and business conversion outcomes |
| 11 — Monitoring | Timezone schedules, atomic scheduling, email failure/recovery deduplication, preferences | Real SMTP delivery/recovery check; provider DNS |
| 12 — Billing | Server entitlements, Razorpay subscriptions, cancellation, signed/idempotent ordered events | Actual test-mode checkout/renewal; align advertised prices/currency |
| 13 — Deployment hooks | Signed payloads, expiry/replay protection, selected tests, CI helper | Connect your authorized deployment pipeline |
| 14 — Operations | Ownership guards, encryption, RLS, network checks, admin/suspension/feedback/worker health, runbook | Backup restore, isolation assessment, external monitoring, load/security review |
| 15 — Public website | Home/features/how-it-works/pricing/docs/FAQ/sample/contact/legal drafts/changelog/SEO | Real support address and legal/business approval |
| 16 — QA/release | Local unit/API/queue/real-browser fixtures, UI acceptance script, production build | Deploy staging/production and pass live provider acceptance |
| 17 — Beta/launch | Feedback collection, activation aggregates, launch checklist | Invite/watch customers, establish pricing/economics, publish/announce |

These rows are not a claim that all 18 phases have passed their production exit criteria.

## Local evidence

- Fresh PostgreSQL installation: all 12 migrations applied successfully without `db push`.
- 85 tests: validators, private-network boundaries, authenticated encryption, schedules, account isolation, quotas/versioning, real Chromium fixtures, Redis execution, cancellation, alert deduplication, payment/deployment signatures, feedback access, and 16 OAuth cases covering both callbacks, cookie rotation, expiry, concurrent replay and database failures.
- UI acceptance: project creation, encrypted variables, test editor, verification gate, queue/cancel, reports, schedules, profile, admin pages, public routes, dark theme and mobile layouts. Screenshots are written to ignored `artifacts/qa/`.
- Lint, TypeScript and production compilation passed locally and are required by CI.
- Web, API and worker Docker images built successfully before the final OAuth changes; the final source also passes the production build. The web runtime served public pages with networking disabled and contained no `.env` or ESLint package. Chromium passed a non-root sandbox smoke with networking disabled, all outer capabilities dropped and CPU/memory/PID limits.
- Tests use isolated local databases. OAuth tests exercise Passport with mocked provider token/profile responses and real persisted sessions; other API/UI fixtures use signed test sessions. Storage uploads and target pages in runner tests are fixtures. No production auth bypass endpoint exists.

## Required configuration

Your existing OAuth credentials were retained. Both Supabase database URLs now connect, the missing migrations have been applied after verifying the legacy baseline, and `npm run doctor:auth` passes. The running login entry routes redirect to Google/GitHub with persisted state. Add the missing values listed in `SETUP.md` and `server/.env.example`: Redis, encryption key, Supabase private Storage, worker/egress setup, Gemini, SMTP and Razorpay plans/keys/webhook secret. Set the final public URLs, provider callbacks and support email. `npm run check:config` shows presence only and never prints values.

## Production acceptance checklist

- [ ] Back up/restore the database; apply reviewed migrations to staging then production.
- [ ] Deploy web/API/Redis/worker/proxy with private networking, TLS, resource limits and enforced egress.
- [ ] Google and GitHub sign in, sign out, expired sessions and session revocation work under the public origin.
- [ ] Verify an owned domain through both supported methods; changed URLs require re-verification.
- [ ] Run a passing and failing public journey and a secret-based same-origin login journey.
- [ ] Confirm private artifact upload, preview, access denial for a second account, expiry and deletion.
- [ ] Kill a worker, restart Redis, exhaust allowance and confirm honest outcomes/recovery.
- [ ] Schedule a run, restart services and verify its result and failure/recovery email delivery.
- [ ] Exercise Razorpay test-mode purchase, replayed/out-of-order events, cancellation and renewal; reconcile prices.
- [ ] Run the AI evaluation cases and verify no secret appears in provider inputs or artifacts.
- [ ] Configure hosting alerts and investigate dependency advisories; perform accessibility/load/security reviews.
- [ ] Replace legal drafts/support details; review privacy, refunds, billing and retention promises.
- [ ] Recruit beta customers, observe activation, measure false failures/costs and validate paid demand.

## Scope intentionally deferred by the blueprint

Team invites/roles, Firefox/WebKit, visual-diff algorithms, recording/importing arbitrary scripts, native GitHub/Vercel integrations, Slack/Discord, videos, issue creation and autonomous self-healing remain V1.1/V2 work.

## Dependency review

On 10 October 2026, npm reported zero advisories for frontend production dependencies and zero for the entire backend tree. Frontend development tools still have five high findings along the ESLint → fast-glob → micromatch → braces chain (GHSA-vfj7-8cjw-p6xm). The reported fix would downgrade the Next ESLint configuration to a different major version; it has not been applied. Treat untrusted build/lint inputs accordingly and update when a compatible upstream fix is available. The web Docker runtime uses standalone output and does not ship the development dependency tree. A clean audit is not a security certification.
