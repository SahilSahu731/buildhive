# Configure and deploy BuildHive V1

## Your existing credentials

The existing Google/GitHub OAuth client IDs and secrets and PostgreSQL URLs were preserved. Their presence was checked without exposing values. The actual provider callbacks have not been completed on your behalf.

Your current `.env` has placeholder/missing values for the services below. Run `npm run check:config` for an updated presence-only report.

| Service | Variables or setup |
|---|---|
| Redis | `REDIS_URL`; persistent Redis with `noeviction` |
| Secret encryption | `SECRETS_ENCRYPTION_KEY`, exactly 64 hex characters (`openssl rand -hex 32`) |
| Private Supabase Storage | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET=buildhive-artifacts` |
| Browser execution | Separate worker, installed Chromium, `RUNNER_EGRESS_PROXY`; enforced network restrictions |
| AI | `GEMINI_API_KEY`; optionally `GEMINI_MODEL` |
| Transactional email | SMTP host/port/user/password/from, or Gmail app-password settings |
| Paid subscriptions | Razorpay keys, signed webhook secret, Starter/Growth recurring plan IDs |
| Public URLs | `FRONTEND_URL`, `SERVER_URL`, OAuth callback URLs; client `NEXT_PUBLIC_SITE_URL` |
| Support | `NEXT_PUBLIC_SUPPORT_EMAIL` with a real monitored address |

Never place database passwords, OAuth secrets, the encryption key or Supabase service-role key in `NEXT_PUBLIC_*` variables.

## Supabase and Prisma

1. Use the project’s connection details from Supabase. Runtime can use the transaction pooler with `pgbouncer=true`; migrations must use a direct or session-pooler URL. Preserve TLS (`sslmode=require`).
2. Back up the database before production migration.
3. Run `npm run db:deploy` from the repository root with the intended database environment.
4. New testing tables enable RLS without browser-client policies. The API connects as the privileged server role and enforces workspace ownership on every request. Do not expose a privileged role to browsers.
5. Create a **private** `buildhive-artifacts` bucket. `node infra/setup-storage.mjs` creates or updates it using `server/.env`; run this only against the intended Supabase project.
6. Verify upload, authenticated access, expiration and deletion with a real run in staging. Artifact cleanup runs in the worker.

Official references: [Supabase Prisma integration](https://supabase.com/docs/guides/database/prisma), [private Storage](https://supabase.com/docs/guides/storage/buckets/fundamentals).

## OAuth and cookies

Production should expose both the website and `/api` under the same HTTPS origin. The Next.js rewrite forwards API traffic to the internal backend. Set `API_INTERNAL_URL` during the web build, and keep the backend behind that proxy.

Example public URLs:

```text
FRONTEND_URL=https://your-buildhive-domain.example
SERVER_URL=https://your-buildhive-domain.example
GITHUB_CALLBACK_URL=https://your-buildhive-domain.example/api/auth/github/callback
GOOGLE_CALLBACK_URL=https://your-buildhive-domain.example/api/auth/google/callback
```

Register the same exact callbacks in both OAuth provider consoles. GitHub needs only `user:email`; Google needs profile/email. OAuth state is stored in PostgreSQL sessions. Sessions are HttpOnly, SameSite=Lax and Secure in production. Set `TRUST_PROXY_HOPS` to your actual trusted proxy topology; do not expose an API that blindly trusts arbitrary forwarding headers.

## Queue and browser worker

Run API, worker and egress proxy as separate services. The queue contains only run IDs. PostgreSQL persists accepted runs before dispatch, so temporary Redis outages do not discard accepted requests. The worker reconciles queued runs every five seconds.

- `WORKER_CONCURRENCY=2`: local worker concurrency, capped at four.
- `WORKER_GLOBAL_CONCURRENCY=4`: queue-wide cap, configurable up to twenty.
- Run Redis durably with `noeviction` and authentication/private networking.
- Run Chromium as a non-root user with its sandbox enabled, memory/CPU/pid limits and a read-only root filesystem where supported.
- The supplied CONNECT proxy allows only public addresses on port 443 and pins each resolved IP. Never expose it as a public open proxy.
- Apply network policy so browser processes cannot bypass the proxy, reach metadata/internal networks, or use UDP. Validate this in the actual hosting environment.
- The worker requires long-lived infrastructure. Do not execute browser jobs in serverless web handlers.

The Dockerfiles are buildable starting points, not proof that your hosting provider enforces those controls. See [Playwright’s Docker guidance](https://playwright.dev/docs/docker) and [network interception](https://playwright.dev/docs/network).

## Email

Configure SMTP on the worker and API. Choose a verified sender, configure SPF/DKIM/DMARC with the provider, and use the in-app **Send test email** button. Exercise both a new failure and a recovery. Repeated unresolved failures are deduplicated; delivery is at-least-once and a crash between provider acceptance and database acknowledgement can still result in a duplicate email.

## AI

Set a real Gemini key, test the configured model, then review generated plans before execution. Provider-reported input/output tokens are recorded. Optional `AI_INPUT_USD_PER_MILLION` and `AI_OUTPUT_USD_PER_MILLION` record an estimate; use your actual contracted model rates. Cost estimates are not billing-provider invoices.

Test known scenarios from `docs/AI-EVALUATION.md`. Check valid schema, same-origin navigation, assertions, missing-information flags and absent secrets. Provider calls have a 45-second deadline and monthly entitlements.

## Razorpay subscriptions

1. Confirm recurring billing eligibility, supported currency and applicable business requirements in your Razorpay account.
2. Create monthly Starter/Growth plans matching the prices you intend to charge. The website’s $19/$49 pricing is a launch experiment; align plan amounts/currency with checkout before selling.
3. Set `RAZORPAY_STARTER_PLAN_ID`, `RAZORPAY_GROWTH_PLAN_ID` and test-mode API keys.
4. Register `https://PUBLIC_ORIGIN/api/webhooks/billing` for subscription lifecycle events; configure its signing secret.
5. Test successful payment, duplicates, out-of-order events, failed payment, cancellation, renewal and plan changes in provider sandbox.
6. Move to live keys only after this acceptance test and legal/business review.

Webhook events are authenticated using the raw request bytes, idempotent event IDs and per-subscription ordering. Paid entitlements require an active prepaid period. Cancellation preserves already-paid access until expiry. Changing plans is an explicit cancel-and-resubscribe flow; there is no silent prorating.

## Deploy and operate

Build from repository root using `infra/Dockerfile.web`, `.api`, and `.worker`. The API Dockerfile can also run `node dist/hive/egress.js` as the separate proxy service. Supply production secrets through the hosting secret store. Do not bake `.env` files into images.

Apply migrations as a controlled release step before rolling out API/worker code. Configure private service networking, TLS/public DNS, backup retention, infrastructure logs, CPU/memory limits and alerts. Promote one existing trusted user by setting `User.role` to `admin` in a controlled database session; there is no public admin-registration route.

Complete the release checks in [V1-STATUS.md](V1-STATUS.md). A successful build and local fixture suite cannot establish production security, successful OAuth/payment delivery, or customer validation.
