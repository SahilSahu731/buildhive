# Verification

Validated locally on November 16, 2026 with Node.js 22.22.1.

- `npm ci` completed using the committed lockfile.
- `npm run typecheck` passed, including generated Next.js route types and strict unused-symbol checks.
- `npm test` passed all **42** tests: 35 domain, persistence, authorization-lifecycle, URL, and request-origin tests, plus seven auth interaction tests with Supabase mocked.
- Before the Tailwind migration, `npm run build` produced the optimized Next.js application successfully. See the migration checks below for the current build status.
- `npm run format:check` and `git diff --check` passed.
- The migration and all SQL authorization assertions executed successfully in an isolated PGlite PostgreSQL runtime. All 11 public application tables have RLS enabled. Assertions cover private conversations/bookmarks, forged authorship, immutable ownership, recipient-only acceptance, duplicate-request/acceptance behavior, message membership, read-receipt permissions, label constraints, and rate limits after content deletion.
- OTP interaction tests cover email submission by Enter, six-digit entry with leading zeros, formatted paste, simulated full-code autofill, focus and deletion navigation, incomplete codes, composition, duplicate submission protection, and keyboard retry after an expired code.
- Dark mode uses shared semantic colors across all routes, dialogs, inputs, and native controls. The eight checked foreground/background token pairs exceed 4.5:1 contrast, including muted text, placeholders, orange actions, and error feedback. Browser theme and color-scheme metadata are set to dark.
- The simplified interface uses local Inter fonts and React Icons throughout. Checks found no diagonal-arrow icons or Lucide imports. All seven primary pages, the auth controls, stylesheets, and four Inter weights passed HTTP checks.
- Production HTTP checks returned 200 for feed, projects, cofounders, messages, bookmarks, profile, login, product-detail URLs, fonts, and portraits. Missing pages returned 404. Cross-origin writes returned 403. Legitimate local-origin writes passed the origin boundary and returned the expected configuration-required response. Unsafe callback destinations stayed on the public application origin.

Real Google/GitHub sign-in, OTP delivery through Resend, and a hosted Supabase connection require the environment and dashboard configuration described in [setup.md](setup.md). Those external flows were not exercised without credentials. Real-browser visual and interaction QA was unavailable because the browser access host was unavailable; HTTP checks do not replace that visual pass.

## Tailwind migration checks

The site now uses Tailwind CSS v4 with its PostCSS integration. All component stylesheets and React `style` props were removed; shared font faces, theme values, base browser defaults, and keyframes remain in `src/app/globals.css`. The existing theme values were preserved. Email HTML keeps inline styles for email-client compatibility.

- All 42 tests and strict TypeScript checks passed after the migration. Formatting checks passed.
- Every collected component utility compiled successfully. The real PostCSS pipeline produced optimized CSS with no warnings.
- The standard Turbopack production build is blocked in this execution environment by `binding to a port: Operation not permitted` when starting its CSS worker, including with elevated execution requested. A plain Webpack build encounters empty output from Next.js’s TypeScript configuration subprocess; standalone TypeScript checks pass. These are build-environment limitations, not successful production-build checks.
- Real-browser visual QA remains unavailable; responsive styles and interaction states were migrated, but layout parity has not been verified in a browser.
