# BuildHive Implementation Plan (Start From Scratch)

This document is the master execution plan to rebuild BuildHive from zero into a production-grade, paid SaaS that solves a critical problem for programmers.

## 1. Product Direction

### 1.1 Core Product (What We Are Building)
BuildHive will be a **PR Risk Gate for software teams**.

It will:
- Connect to GitHub repositories.
- Analyze pull requests (diff + changed files + commit context).
- Detect high-risk issues (security, regression risk, test gaps, performance hotspots).
- Generate actionable AI review comments and a merge confidence score.
- Enforce policy checks before merge.

### 1.2 Critical Problem It Solves
Developers ship avoidable bugs because review quality and speed are inconsistent. BuildHive reduces:
- Production incidents.
- Slow review cycles.
- Missed edge-case/security issues.

### 1.3 Who Pays
- Indie founders with active repos.
- Small startup teams (3-20 engineers).
- Agencies maintaining multiple client repos.

### 1.4 Monetization Model
- Free: limited monthly PR analyses.
- Pro: per-user or per-repo monthly subscription.
- Team: org-level plan with policy controls + Slack alerts + analytics.

### 1.5 Non-Goals for V1
- Full CI replacement.
- Self-hosted enterprise deployment.
- Support for non-GitHub SCM.

## 2. Success Criteria and KPIs

### 2.1 Product KPIs
- Time-to-first-value: user gets first PR analysis in less than 15 minutes after signup.
- PR adoption rate: at least 40% of connected repos run checks weekly.
- Weekly active teams: at least 25% week-over-week growth during beta.
- Paid conversion: at least 5% free to paid in first 90 days.

### 2.2 Engineering KPIs
- API p95 latency under 600ms for non-AI endpoints.
- Webhook processing success over 99.5%.
- Queue retry success over 98%.
- Incident MTTR under 1 hour.

### 2.3 Reliability Targets
- Availability: 99.9% monthly uptime.
- RPO: 24h.
- RTO: 2h.

## 3. Final Architecture (Production Target)

### 3.1 High-Level Components
- `apps/web`: Next.js app (dashboard, onboarding, billing).
- `apps/api`: Node.js API (auth, orgs, repos, reviews, billing, webhooks).
- `apps/worker`: background processor (AI review jobs, retries, notifications).
- `packages/shared`: shared types, Zod schemas, constants.
- `packages/config`: lint, tsconfig, prettier presets.
- PostgreSQL: primary relational database.
- Redis: queue + rate limiting + cache.
- Object storage (S3 compatible): store diff snapshots/reports.
- Monitoring stack: logs + traces + metrics + alerting.

### 3.2 Core Integrations
- GitHub App (install + webhook + checks API).
- LLM provider (OpenAI or Gemini; keep provider abstraction).
- Billing (Razorpay first, Stripe optional later).
- Email provider (Resend, Postmark, or SES).
- Slack notifications.

### 3.3 Security Baseline
- JWT in HTTP-only secure cookies (no localStorage auth tokens).
- OAuth state + CSRF protection.
- Signed webhook verification.
- Per-IP and per-user rate limits.
- Secrets via environment manager (never hardcoded defaults).

## 4. Phase-by-Phase Implementation Plan

Each phase contains: scope, tasks, deliverables, and exit criteria.

---

## Phase 0: Repository Reset and Bootstrap

### Goal
Start from a clean repository with only a planning and scaffold baseline.

### Tasks
- [x] Confirm branch strategy (`main`, `dev`, feature branches).
- [x] Initialize monorepo structure:
  - [x] `apps/web`
  - [x] `apps/api`
  - [x] `apps/worker`
  - [x] `packages/shared`
  - [x] `packages/config`
  - [x] `infrastructure/`
  - [x] `docs/`
- [x] Create root `README.md` with setup quickstart.
- [x] Configure package manager (`pnpm` recommended).
- [x] Create base `package.json` workspaces.
- [x] Add root `.gitignore` with strict env/build ignore rules.
- [x] Add `.editorconfig`.
- [x] Add `.nvmrc` with locked Node LTS version.
- [x] Add `LICENSE`.

### Deliverables
- Clean monorepo committed.
- New CI pipeline runs on every PR.

### Exit Criteria
- `pnpm install` works.
- Workspace scripts run from root.

Status: Completed on 2026-03-12.

---

## Phase 1: Product and Requirement Locking

### Goal
Translate vision into implementable requirements and acceptance criteria.

### Tasks
- [x] Define user roles:
  - [x] owner
  - [x] admin
  - [x] developer
- [x] Define user journeys:
  - [x] signup/login
  - [x] create organization
  - [x] connect GitHub app
  - [x] select repositories
  - [x] receive first PR analysis
  - [x] upgrade to paid plan
- [x] Write PRD in `docs/prd.md` with:
  - [x] problem statement
  - [x] value proposition
  - [x] user stories
  - [x] out-of-scope list
- [x] Define policy templates for V1:
  - [x] security focus
  - [x] test coverage expectations
  - [x] critical file protections
- [x] Define pricing model details in `docs/pricing.md`.

### Deliverables
- Approved PRD and pricing plan.

### Exit Criteria
- Every core flow has clear acceptance criteria.

Status: Completed on 2026-03-12.

---

## Phase 2: Technical Design and Data Modeling

### Goal
Finalize schema and API contracts before coding core logic.

### Tasks
- [ ] Create ERD in `docs/erd.md`.
- [ ] Define database schema for:
  - [ ] users
  - [ ] organizations
  - [ ] organization_members
  - [ ] repositories
  - [ ] github_installations
  - [ ] pull_requests
  - [ ] pull_request_files
  - [ ] review_runs
  - [ ] review_findings
  - [ ] policy_rules
  - [ ] billing_customers
  - [ ] subscriptions
  - [ ] invoices
  - [ ] usage_events
  - [ ] audit_logs
- [ ] Define lifecycle states:
  - [ ] review run statuses (`queued`, `processing`, `completed`, `failed`)
  - [ ] finding severities (`critical`, `high`, `medium`, `low`, `info`)
- [ ] Define API contracts (OpenAPI spec):
  - [ ] auth endpoints
  - [ ] org/repo management
  - [ ] review history
  - [ ] billing and usage
- [ ] Define queue job payload contracts.

### Deliverables
- Approved schema + OpenAPI + queue contract docs.

### Exit Criteria
- Backend and frontend teams can work independently from contracts.

---

## Phase 3: Developer Experience and Quality Gates

### Goal
Establish a strict engineering baseline from day one.

### Tasks
- [ ] Set up TypeScript strict mode in all apps.
- [ ] Add ESLint + Prettier shared config.
- [ ] Add Husky + lint-staged pre-commit checks.
- [ ] Add commit convention (`feat/fix/chore/docs/test`).
- [ ] Add CI workflows:
  - [ ] install/cache
  - [ ] lint
  - [ ] typecheck
  - [ ] unit tests
  - [ ] integration tests
- [ ] Add code coverage reporting and required threshold.
- [ ] Add dependency vulnerability scan (`npm audit`/Snyk/GitHub alerts).

### Deliverables
- Failing CI blocks merge.

### Exit Criteria
- No direct merge to `main` without passing checks.

---

## Phase 4: Authentication and Account System

### Goal
Build secure auth foundation suitable for paid SaaS.

### Tasks
- [ ] Implement email/password auth (magic-link optional).
- [ ] Implement GitHub OAuth login.
- [ ] Optional Google OAuth (secondary).
- [ ] Store auth in HTTP-only secure cookie.
- [ ] Implement refresh token rotation.
- [ ] Add session management UI (active sessions).
- [ ] Add password reset flow.
- [ ] Add email verification flow.
- [ ] Add rate limits for auth endpoints.
- [ ] Add brute force protection and lockouts.
- [ ] Add audit logging for auth events.

### Deliverables
- Secure login/signup/logout/session flows.

### Exit Criteria
- OWASP auth checklist passes for V1 scope.

---

## Phase 5: Organization, Team, and Permissions

### Goal
Support collaborative teams and paid account structures.

### Tasks
- [ ] Create organization CRUD.
- [ ] Invite members via email.
- [ ] Implement role-based access control.
- [ ] Add member management UI.
- [ ] Add invitation acceptance/expiry flow.
- [ ] Implement permission checks in backend middleware.
- [ ] Add unauthorized access test suite.

### Deliverables
- Team account model ready for billing.

### Exit Criteria
- Role restrictions work across all protected endpoints.

---

## Phase 6: GitHub App Integration

### Goal
Connect repositories and receive PR events reliably.

### Tasks
- [ ] Create GitHub App in GitHub settings.
- [ ] Configure permissions:
  - [ ] pull requests (read/write checks/comments)
  - [ ] contents (read)
  - [ ] checks (write)
  - [ ] metadata (read)
- [ ] Implement app installation callback endpoint.
- [ ] Store installation IDs and repo mappings.
- [ ] Implement webhook endpoint with signature verification.
- [ ] Handle events:
  - [ ] `installation`
  - [ ] `installation_repositories`
  - [ ] `pull_request` (opened, synchronize, reopened)
- [ ] Build replay-safe idempotency with delivery ID tracking.
- [ ] Add dead-letter handling for failed webhook jobs.

### Deliverables
- Repo connection and webhook ingestion pipeline.

### Exit Criteria
- New PR triggers a queued review job within 30 seconds.

---

## Phase 7: Review Pipeline (Core Value Engine)

### Goal
Process PR data and produce useful risk insights.

### Tasks
- [ ] Fetch PR metadata and changed files from GitHub API.
- [ ] Build file filters (ignore generated/vendor binaries).
- [ ] Build deterministic rule engine for baseline checks:
  - [ ] missing tests in changed critical modules
  - [ ] dangerous patterns (`eval`, raw SQL, secret literals)
  - [ ] large diff risk flag
  - [ ] no changelog/update in specific paths
- [ ] Build AI prompt assembly service with:
  - [ ] repository context
  - [ ] diff chunks
  - [ ] coding standards
  - [ ] policy profile
- [ ] Add token budgeting and chunking strategy.
- [ ] Implement LLM provider abstraction layer.
- [ ] Store full review artifacts and normalized findings.
- [ ] Post summary comment to GitHub PR.
- [ ] Publish GitHub check run with pass/fail + score.
- [ ] Add retry strategy and exponential backoff.

### Deliverables
- End-to-end review output visible in GitHub PR.

### Exit Criteria
- 90% of queued jobs complete successfully under normal load.

---

## Phase 8: Findings UX and Dashboard

### Goal
Make review output actionable for developers and leads.

### Tasks
- [ ] Build dashboard pages:
  - [ ] recent review runs
  - [ ] findings list/filter
  - [ ] repository health trend
  - [ ] team performance view
- [ ] Build finding detail panel with:
  - [ ] severity
  - [ ] file path
  - [ ] line references
  - [ ] remediation guidance
- [ ] Add "false positive" feedback capture.
- [ ] Add "mark resolved" state.
- [ ] Build search/filter by repo, severity, author, date.
- [ ] Add dark/light themes and responsive layout.

### Deliverables
- Dashboard with live value demonstration for users.

### Exit Criteria
- User can inspect and act on findings in less than 3 clicks.

---

## Phase 9: Billing and Paywall

### Goal
Enable seamless user payments and subscription enforcement.

### Tasks
- [ ] Select billing provider (Razorpay-first for your region).
- [ ] Implement customer creation and plan mapping.
- [ ] Implement subscription checkout flow.
- [ ] Implement webhook handlers for billing events:
  - [ ] payment success
  - [ ] payment failed
  - [ ] subscription active/cancelled/expired
- [ ] Implement invoice history UI.
- [ ] Implement usage metering (PR checks/month).
- [ ] Build feature gating middleware.
- [ ] Add grace period logic for failed payments.
- [ ] Add tax/GST fields for invoices if required.

### Deliverables
- Paid plan upgrade path works from app UI.

### Exit Criteria
- End-to-end sandbox payment flow tested and logged.

---

## Phase 10: Notifications and Engagement

### Goal
Increase retention and product stickiness.

### Tasks
- [ ] Email notifications for critical findings.
- [ ] Slack integration for team alerts.
- [ ] Weekly digest email:
  - [ ] top risk trends
  - [ ] unresolved critical items
  - [ ] team score trend
- [ ] In-app notification center.
- [ ] User-level notification preferences.

### Deliverables
- Multi-channel alerting operational.

### Exit Criteria
- Critical findings produce timely notifications under 2 minutes.

---

## Phase 11: Admin and Internal Tools

### Goal
Enable operations and support without engineering bottlenecks.

### Tasks
- [ ] Build internal admin panel (protected):
  - [ ] user lookup
  - [ ] org status
  - [ ] subscription state
  - [ ] webhook replay tool
  - [ ] job queue health
- [ ] Add support tooling for account recovery.
- [ ] Add safety controls for feature flags and kill switches.

### Deliverables
- Operational control panel for support and incidents.

### Exit Criteria
- Common support requests can be handled without DB manual edits.

---

## Phase 12: Security Hardening and Compliance

### Goal
Make platform safe for real team usage.

### Tasks
- [ ] Add strict input validation (Zod on all APIs).
- [ ] Add output escaping and CSP headers.
- [ ] Add CSRF protection where needed.
- [ ] Add API rate limiting and abuse controls.
- [ ] Add secret scanning in CI.
- [ ] Implement data encryption at rest for sensitive fields.
- [ ] Add dependency and container image scans.
- [ ] Add regular backup policy and restore drill.
- [ ] Publish privacy policy and terms of service.
- [ ] Build account deletion + data export features.

### Deliverables
- Security checklist and policy docs.

### Exit Criteria
- Security review completed with no critical unresolved risks.

---

## Phase 13: Testing Strategy (Mandatory)

### Goal
Prevent regressions and confidently ship features.

### Tasks
- [ ] Unit tests:
  - [ ] auth services
  - [ ] policy/rule engine
  - [ ] usage metering
  - [ ] billing adapters
- [ ] Integration tests:
  - [ ] API endpoints
  - [ ] DB transactions
  - [ ] queue workers
- [ ] Contract tests for GitHub and billing webhooks.
- [ ] E2E tests (Playwright):
  - [ ] signup to first PR analysis
  - [ ] billing upgrade
  - [ ] cancellation and downgrade
- [ ] Load tests:
  - [ ] webhook bursts
  - [ ] review queue throughput

### Deliverables
- Full test pyramid with CI execution.

### Exit Criteria
- Coverage target reached (example: 80% critical modules).

---

## Phase 14: Deployment and Infrastructure

### Goal
Deploy reproducible, scalable, and observable production systems.

### Tasks
- [ ] Provision environments:
  - [ ] local
  - [ ] staging
  - [ ] production
- [ ] Set up infrastructure as code (Terraform/Pulumi).
- [ ] Set up PostgreSQL managed instance.
- [ ] Set up Redis managed instance.
- [ ] Set up object storage bucket.
- [ ] Configure DNS and SSL certificates.
- [ ] Deploy web app.
- [ ] Deploy API and worker.
- [ ] Configure autoscaling.
- [ ] Configure log aggregation.
- [ ] Configure metrics dashboard and alerts.
- [ ] Configure uptime monitoring and synthetic checks.

### Deliverables
- Staging and production live.

### Exit Criteria
- Blue/green or rolling deploy verified with rollback path.

---

## Phase 15: Launch Readiness and GTM

### Goal
Ship publicly with a clear value proposition and conversion funnel.

### Tasks
- [ ] Build marketing site with:
  - [ ] clear pain statement
  - [ ] feature proof screenshots
  - [ ] pricing page
  - [ ] FAQ and trust section
- [ ] Create onboarding checklist in product.
- [ ] Add in-app analytics events.
- [ ] Add conversion funnel dashboard.
- [ ] Launch beta waitlist.
- [ ] Onboard first 10 design partner teams.
- [ ] Gather testimonials and case studies.

### Deliverables
- Public launch assets + working signup funnel.

### Exit Criteria
- At least 3 active pilot teams using product weekly.

---

## Phase 16: Post-Launch Growth and Optimization

### Goal
Improve retention, accuracy, and revenue.

### Tasks
- [ ] Track false positive rate and reduce it monthly.
- [ ] Add user-tunable policy settings per repo.
- [ ] Add team-level SSO (future paid tier).
- [ ] Add bitbucket/gitlab support (future expansion).
- [ ] Add suggested code patches as optional feature.
- [ ] Add ROI reporting (incidents avoided/time saved estimate).

### Deliverables
- Growth roadmap aligned with revenue data.

### Exit Criteria
- Positive retention trend and consistent monthly recurring revenue growth.

## 5. Detailed Build Checklist by Workstream

### 5.1 Backend Workstream
- [ ] Set up framework, routing, and global middleware.
- [ ] Implement health and readiness probes.
- [ ] Implement auth module.
- [ ] Implement org and membership module.
- [ ] Implement repository and installation module.
- [ ] Implement webhook module.
- [ ] Implement review run orchestration module.
- [ ] Implement findings and analytics module.
- [ ] Implement billing and subscription module.
- [ ] Implement admin/support module.

### 5.2 Frontend Workstream
- [ ] Landing pages.
- [ ] Auth pages.
- [ ] Onboarding wizard.
- [ ] Repo connection pages.
- [ ] Review history page.
- [ ] Findings detail page.
- [ ] Billing page.
- [ ] Settings and profile pages.
- [ ] Team management page.

### 5.3 Worker/Queue Workstream
- [ ] Queue setup and worker process.
- [ ] Job schemas and validators.
- [ ] Retry, backoff, dead-letter queues.
- [ ] Job observability metrics.

### 5.4 DevOps Workstream
- [ ] CI/CD pipeline.
- [ ] Environment promotion strategy.
- [ ] Database migration pipeline.
- [ ] Backups and disaster recovery automation.

## 6. Environment Variables (Production Checklist)

### 6.1 API
- [ ] `NODE_ENV`
- [ ] `PORT`
- [ ] `DATABASE_URL`
- [ ] `REDIS_URL`
- [ ] `JWT_ACCESS_SECRET`
- [ ] `JWT_REFRESH_SECRET`
- [ ] `COOKIE_SECRET`
- [ ] `APP_URL`
- [ ] `WEB_URL`
- [ ] `CORS_ALLOWED_ORIGINS`
- [ ] `GITHUB_APP_ID`
- [ ] `GITHUB_APP_PRIVATE_KEY`
- [ ] `GITHUB_WEBHOOK_SECRET`
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`
- [ ] `LLM_PROVIDER`
- [ ] `LLM_API_KEY`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `RAZORPAY_WEBHOOK_SECRET`
- [ ] `EMAIL_PROVIDER_API_KEY`
- [ ] `SLACK_BOT_TOKEN`
- [ ] `SLACK_SIGNING_SECRET`
- [ ] `SENTRY_DSN`

### 6.2 Web
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_ENV`
- [ ] `NEXT_PUBLIC_ANALYTICS_KEY`

### 6.3 Worker
- [ ] `QUEUE_CONCURRENCY`
- [ ] `MAX_RETRY_ATTEMPTS`
- [ ] `LLM_TIMEOUT_MS`

## 7. API Surface (Minimum V1)

### Auth
- [ ] `POST /v1/auth/signup`
- [ ] `POST /v1/auth/login`
- [ ] `POST /v1/auth/logout`
- [ ] `POST /v1/auth/refresh`
- [ ] `GET /v1/auth/me`

### Organizations
- [ ] `POST /v1/orgs`
- [ ] `GET /v1/orgs/:orgId`
- [ ] `PATCH /v1/orgs/:orgId`
- [ ] `POST /v1/orgs/:orgId/invites`
- [ ] `POST /v1/invites/:token/accept`

### Repositories and GitHub
- [ ] `GET /v1/orgs/:orgId/repos`
- [ ] `POST /v1/orgs/:orgId/repos/sync`
- [ ] `POST /v1/github/webhook`

### Reviews
- [ ] `GET /v1/orgs/:orgId/reviews`
- [ ] `GET /v1/reviews/:reviewId`
- [ ] `GET /v1/reviews/:reviewId/findings`

### Billing
- [ ] `GET /v1/billing/plans`
- [ ] `POST /v1/billing/checkout`
- [ ] `GET /v1/billing/subscription`
- [ ] `POST /v1/billing/webhook`

## 8. Data Model (Core Tables)

- [ ] `users`
- [ ] `sessions`
- [ ] `organizations`
- [ ] `organization_members`
- [ ] `invitations`
- [ ] `github_installations`
- [ ] `repositories`
- [ ] `pull_requests`
- [ ] `review_runs`
- [ ] `review_findings`
- [ ] `policy_profiles`
- [ ] `subscriptions`
- [ ] `payments`
- [ ] `usage_events`
- [ ] `audit_logs`

## 9. Production Readiness Checklist

### Security
- [ ] No hardcoded fallback secrets.
- [ ] Secrets rotated and versioned.
- [ ] Webhook signatures validated.
- [ ] Rate limits enabled.
- [ ] Auth cookie HTTP-only + secure + sameSite strategy verified.

### Reliability
- [ ] Queue retries and dead-letter configured.
- [ ] Background jobs idempotent.
- [ ] Health probes configured for all services.
- [ ] Backups tested and restore tested.

### Observability
- [ ] Request correlation IDs.
- [ ] Error tracking configured.
- [ ] Metrics dashboards for API, worker, queue, billing.
- [ ] Pager alerts for critical failures.

### Performance
- [ ] DB indexes for all high-volume queries.
- [ ] Caching strategy documented.
- [ ] Load test baseline completed.

### Compliance and Legal
- [ ] Terms of service.
- [ ] Privacy policy.
- [ ] Data deletion process.
- [ ] Billing and tax compliance checks.

## 10. Launch Plan (30-Day Execution)

### Week 1
- [ ] Complete Phase 0 to Phase 3.
- [ ] Ship basic auth and org setup.

### Week 2
- [ ] Ship GitHub App integration and webhook ingestion.
- [ ] Ship first review pipeline result in dashboard.

### Week 3
- [ ] Ship billing and paywall.
- [ ] Add notifications and analytics.

### Week 4
- [ ] Harden security, run load tests, fix critical bugs.
- [ ] Launch beta to first paying users.

## 11. Team Roles and Ownership

- [ ] Product owner: PRD, prioritization, feedback loop.
- [ ] Backend engineer: API, queue, integrations.
- [ ] Frontend engineer: onboarding, dashboard, billing UI.
- [ ] DevOps engineer: infra, observability, CI/CD.
- [ ] QA engineer: test automation and release checks.

If solo founder, execute in this order:
1. Backend foundation.
2. GitHub integration.
3. Review pipeline.
4. Minimal dashboard.
5. Billing.
6. Security hardening.

## 12. Definition of Done (Per Feature)

A feature is done only if all are true:
- [ ] Acceptance criteria met.
- [ ] Unit and integration tests added.
- [ ] API and docs updated.
- [ ] Metrics and logs added.
- [ ] Security review completed.
- [ ] Feature flag available if risky.
- [ ] Deployed to staging and validated.

## 13. Immediate Next Actions (Today)

- [ ] Recreate clean monorepo scaffold.
- [ ] Decide final stack and lock architecture choices.
- [ ] Build auth module first with secure cookie strategy.
- [ ] Build GitHub App integration next.
- [ ] Build first end-to-end PR review run before any advanced UI work.

---

Use this file as the single source of truth. Do not start new feature coding unless the phase and acceptance criteria are first checked here.
