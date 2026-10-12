# BuildHive operations and security

This is an operator runbook, not a completed production security assessment. The implementation was validated against isolated local fixtures. Validate the controls below in your hosting environment before accepting public browser jobs.

## Services and boundaries

| Service | Required access | Must not be public |
|---|---|---|
| Next.js web | Internal API; public HTTPS ingress | Build secrets and environment files |
| API | PostgreSQL, OAuth providers, storage, AI, billing, SMTP | Database and provider credentials |
| Worker | PostgreSQL, Redis, private Storage, SMTP; browser through egress proxy | Worker process, debugger ports, browser profiles |
| Egress proxy | DNS and public TCP 443 | CONNECT listener |
| PostgreSQL / Redis | Trusted API and workers only | Database ports |

The runner launches a separate Chromium browser for each job and a fresh context. It accepts only validated steps, never executable JavaScript from customers. Cross-origin navigation, popups, downloads, service workers and WebSockets are blocked. Target domains must be verified before queueing. Network addresses are validated and the CONNECT proxy pins the resolved public IP to the socket.

**A proxy setting alone does not prevent a compromised browser process from making direct connections.** Separate browser traffic from control-plane traffic with container/network policies or a browser sandbox service. Enforce public-only egress, block metadata/private ranges and UDP, and allow only the proxy. The worker's database/Redis privileges must not be available to browser processes. Chromium receives a stripped environment, but this does not replace OS-level isolation.

Run the worker as a non-root user with the Chromium sandbox enabled. Use a reviewed seccomp profile that supports Chromium user namespaces, such as the version-pinned `infra/chromium-seccomp.json`, following [Playwright’s Docker guidance](https://playwright.dev/docs/docker#crawling-and-scraping); do not solve sandbox errors by disabling the sandbox or granting broad production privileges. Start with two concurrent jobs per worker, 2 CPUs, 2 GiB memory, a bounded temporary filesystem and a PID limit appropriate to Chromium (for example 512). Measure these values under real workload. Configure an external watchdog to terminate a hung worker/container; a JavaScript timeout cannot recover a completely stalled host. The web and worker images have been built and smoke-tested locally. Provider-specific isolation still needs deployment validation.

## Authorization, credentials and privacy

- Every customer resource query checks workspace ownership. Admin APIs require `User.role=admin`. Admin metadata excludes stored credentials, browser traces and account session contents.
- OAuth sessions live in PostgreSQL. Cookie security depends on the correct public origin and trusted proxy count. Use TLS and same-origin `/api` routing.
- `Hive*`, `User` and `Feedback` have RLS enabled. Use the privileged database connection only on the server. Verify existing Supabase policies and grants; enabling RLS does not remove pre-existing policies.
- Variables and deployment webhook secrets use AES-256-GCM with random nonces and authenticated tags. Back up the encryption key in a secret manager, separately from the database.
- Known secrets and encoded forms are redacted from diagnostics. Secret-bearing tests restrict network requests to the verified origin and disable screenshots/traces entirely. Use dedicated test accounts; never paste passwords as literal test values or AI instructions.
- Public-page traces may include page content, cookies and response data. Use only non-sensitive public fixtures when recording artifacts. This is not a universal PII scrubber.
- Artifact buckets must remain private. API authorization precedes issuance of short-lived signed links. Do not log signed URLs. Expired artifacts are deleted by worker maintenance.
- Deletion checks and run enqueueing share workspace locks. Cancel active runs first. Storage deletion must succeed before project/account deletion; provider outages surface as errors so the user can retry. Account deletion requires prior subscription cancellation.
- Product activation statistics are aggregates of existing product records. No third-party tracking script or advertising cookie is installed.

## Monitoring and recovery

Probe `/api/health` through the public proxy; it checks the database. In the admin page, monitor worker heartbeats, queue counts, infrastructure errors, email delivery failures, AI tokens/cost estimates and artifact storage.

Configure hosting alerts for missing worker heartbeats (>30 seconds), growing queue age, database/Redis connectivity, repeated HTTP 5xx, disk/memory pressure and failed emails. No external monitoring account has been provisioned by this change.

Accepted runs are committed to PostgreSQL before queue dispatch. Maintenance retries dispatch every five seconds. Jobs claim a queued run once; redelivery does not rerun a completed test. Expired worker heartbeats become infrastructure errors, never fabricated passes. Explicit retry creates another run and consumes allowance. Browser steps are not automatically retried as complete journeys because actions can have side effects.

Scheduling advances the next occurrence and queues its run under a workspace transaction. Overlapping jobs, suspended accounts, inactive tests and exhausted entitlements are rejected and the schedule records its reason. Missed schedules produce one current check, not a burst of historical checks. Email attempts are bounded; delivery is at-least-once, so a crash after provider acceptance may cause a duplicate.

## Release, backups and rollback

1. Back up production PostgreSQL and confirm artifact backup/retention policy. Record the current release and migration versions.
2. Restore a backup into an isolated staging database. Use staging credentials and disable live payment/email delivery there.
3. Run `prisma migrate status`, review pending SQL, and apply `npm run db:deploy` against the intended database. Do not use `db push` or `migrate reset` in production.
4. Deploy compatible API and worker images, then the web image. Run the acceptance checklist in `V1-STATUS.md`.
5. Roll back application images if necessary. The new migrations are additive and old application sources remain in `legacy/`. Do not drop testing tables to roll back an application deployment.
6. If a database rollback is essential, stop writers, preserve a fresh forensic backup and restore the tested snapshot under the operator's recovery plan. Confirm billing event consistency before resuming webhook processing.

Test restores and document actual recovery time and recovery point objectives before launch. Supabase backup settings and restore permissions must be configured in your account.

## Secret rotation

Rotate OAuth, SMTP, AI, payment and storage credentials in their provider consoles, update the hosting secret store, then restart affected services and test the flow. Rotate deployment-hook secrets using the project's regenerate action and update CI atomically.

Encryption-key rotation requires re-encrypting every `HiveSecret.encryptedValue` and `HiveProject.webhookSecret` with fresh nonces under the new key. Pause API writes and workers, back up the database plus old key, perform a transactional migration with an audited operator script, verify decryption, then switch all services together. Simply replacing the environment value makes existing secrets unreadable. No automatic key rotation was run.

## Known release limits

V1 uses Chromium only. Mobile is a viewport, not real-device coverage. Federated login redirects, third-party authenticated subresources, CAPTCHAs, OTP prompts, popups, WebSockets and arbitrary uploaded scripts are not supported. Deterministic tests require stable locators and dedicated test data. A saved-test pass rate measures those journeys, not total website uptime or bug coverage.

All payment amounts, provider terms, production isolation, accessibility, realistic load, legal text and live provider flows require release review. See the delivery checklist for what was and was not verified.

## Reproduce the container sandbox check

The worker image was built locally and this check passed with Chromium's sandbox enabled. The bundled profile adds `chroot` inside the user-namespace sandbox to support `--cap-drop ALL`; provenance and the precise change are in `infra/THIRD-PARTY.md`.

```bash
docker build -f infra/Dockerfile.worker -t buildhive-worker:local-check .
docker run --rm -i --network none --memory 1g --cpus 1 \
  --pids-limit 512 --shm-size 256m --cap-drop ALL \
  --security-opt no-new-privileges \
  --security-opt seccomp=infra/chromium-seccomp.json \
  buildhive-worker:local-check node --input-type=module <<'JS'
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ chromiumSandbox: true });
try {
  const page = await browser.newPage();
  await page.setContent('<h1>Sandbox ready</h1>');
  if (await page.locator('h1').textContent() !== 'Sandbox ready') {
    throw new Error('Browser assertion failed');
  }
  console.log('Sandbox smoke passed');
} finally {
  await browser.close();
}
JS
```

This isolated fixture verifies browser startup and execution under those restrictions. Production requires actual service networking and must separately prove browser egress restrictions; this smoke does not establish that.
