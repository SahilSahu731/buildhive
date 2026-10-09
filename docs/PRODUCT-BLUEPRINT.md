# BuildHive — Complete Product Blueprint & Development Roadmap

Product specification v1.0

October 2026

We're going to build BuildHive as a real SaaS business, not just a developer portfolio project.

The goal is to create a platform developers can use to test their websites, catch broken functionality, monitor important user journeys, and confidently ship new features.

This roadmap covers the product vision, every planned feature, user experience, design system, architecture, database, backend, security, payments, deployment, testing, and launch.

Most importantly, it separates what we must build for V1 from what should come later.

# Part 1 — What exactly is BuildHive?

# BuildHive

Automated testing for developers who ship.

## Build it. Test it. Ship it.

Developers describe what should work. BuildHive runs browser tests, checks their applications, and shows exactly what went wrong.

AI-assisted tests

Real browser runs

Failure alerts

## 1.1 The problem we're solving

Imagine someone builds a SaaS application.

Their application has:

- Authentication and signup
- A dashboard
- Forms and user settings
- Subscription checkout
- Multiple pages and user workflows

Everything works on their computer. They deploy an update, but they don't realize the update broke login.

Customers start encountering errors.

BuildHive's job is to catch this kind of failure by continuously checking explicitly defined user journeys.

## 1.2 How BuildHive works

1\. Connect website

Enter and verify the website domain

2\. Define expected behavior

Write instructions or build test steps manually

3\. Run browser test

Playwright executes the approved steps

4\. Receive results

Passed steps, failed steps, screenshots and logs

5\. Keep testing

Schedule runs and check future deployments

An important product principle: AI assists in creating and explaining tests, but the saved tests must be repeatable. We should not depend on an unpredictable AI agent to decide whether each run succeeded.

Playwright provides locator-based interactions, automatic waiting, and retrying assertions, which make it a strong foundation for this product.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://playwright.dev\&sz=32)

Playwright

+1



## 1.3 Our target customers

We shouldn't initially target huge engineering organizations.

Our first audience should be indie hackers, solo developers, startup founders, and small SaaS teams deploying web applications frequently.

These people often lack dedicated QA engineers and want something simpler than building and maintaining their own browser-testing infrastructure.

BuildHive's differentiation must be ease of setup, understandable failures, and affordable recurring monitoring—not simply the presence of AI. Products such as&#x20;

Momentic

&#x20;already offer AI-based testing, so we'll need to validate that our simpler workflow is compelling.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://momentic.ai\&sz=32)

Momentic

+1



# Part 2 — Every feature BuildHive will have

We will use three release categories.

V1 — Required

V1.1 — After launch

V2 — Expansion

## Feature 1 — Authentication and accounts

V1

Users need an account to manage websites, preserve test history, and receive alerts.

Sign-in options

- Continue with GitHub
- Continue with Google
- Secure sign-out
- Persistent authenticated sessions

For our audience, GitHub login should be prominently supported.

Account management

Users can change their display name, profile picture, notification preferences, and account settings.

They can also sign out from sessions, manage their connected login providers where supported, export account data, and request deletion.

Onboarding

The onboarding should be extremely short.

After signup, the user goes directly to the project-creation flow.

Do not force them through six screens asking for company information.

## Feature 2 — Project management

V1

A project represents one application being tested.

A user might have:

- Their personal portfolio
- A SaaS dashboard
- An e-commerce website

Each can be a separate BuildHive project.

Project properties

| Property    | Description                |
| ----------- | -------------------------- |
| Name        | User-defined project name  |
| Website URL | Main HTTPS address         |
| Environment | Production or staging      |
| Status      | Active, paused, unverified |
| Tests       | Saved browser tests        |
| Last run    | Latest execution result    |
| Monitoring  | Enabled or disabled        |

Project actions

Users can create, rename, update, pause, archive, or permanently delete a project.

They can view the total saved tests, recent failures, run history, and monitoring status.

Domain verification

Before running automated browser tests, BuildHive should verify the user controls or is authorized to test the target.

We can support DNS TXT records and HTML verification files. This prevents the public service from becoming an easy way to automate unwanted activity against arbitrary websites.

Later: project groups, custom domains for test reports, and organization-wide project management.

## Feature 3 — Test creation

V1 — Core feature

This is one of BuildHive's most important interfaces.

Users will have two ways to create a test.

Create a new test

Describe with AI

Example: Open the pricing page, select the monthly plan, and verify that the checkout page appears.

Create manually

Build a test using individual browser actions and expected results.

### Manual test builder

Users should be able to add ordered steps.

Supported V1 actions:

| Action               | Example                      |
| -------------------- | ---------------------------- |
| Navigate             | Open `/login`                |
| Click                | Click "Sign in"              |
| Fill                 | Enter email into email field |
| Select               | Choose a country             |
| Check                | Check a checkbox             |
| Press key            | Press Enter                  |
| Assert visible       | Dashboard heading appears    |
| Assert text          | Page contains "Welcome"      |
| Assert URL           | URL contains `/dashboard`    |
| Assert element state | Submit button is enabled     |
| Assert title         | Browser title matches        |
| Wait for condition   | Wait for success message     |

Every test must include at least one meaningful assertion. Merely loading a page should not count as proof that an entire user journey works.

### Test settings

Each saved test will have:

- Test name and description
- Project and environment
- Starting URL or relative route
- Browser viewport (desktop or mobile-sized)
- Ordered test steps
- Timeout
- Status: draft, active, or paused
- Tags
- Created and updated timestamps

### Test management

Users can edit, duplicate, run, pause, and delete tests.

Changes to tests should be versioned so that old execution reports still show which version was actually executed.

Later: reusable test-step groups, imported Playwright tests, drag-and-drop browser recording, and cross-browser execution.

## Feature 4 — AI Test Builder

V1 — Core differentiator

A developer should be able to write:

> Open my application, click Login, enter the provided test credentials, submit the form, and check whether the dashboard is visible.

BuildHive generates a proposed test plan.

AI-generated test plan

Needs review

1. Navigate to `/login`
2. Fill the email field with `TEST_EMAIL`
3. Fill the password field with `TEST_PASSWORD`
4. Click the Login button
5. Verify `/dashboard` is reached
6. Verify the dashboard heading is visible

Editable plan

Save after approval

Example of the review screen BuildHive would display.

AI builder behavior

1. Receive the user's natural-language instructions.
2. Generate a structured sequence of allowed browser actions.
3. Identify missing information, such as credentials or an unclear expected outcome.
4. Allow users to review and edit all steps.
5. Validate that the steps reference permitted actions and target destinations.
6. Save the approved sequence as a reusable test.

AI must not silently invent a successful result, bypass authentication, or rewrite a failing test simply to make it pass.

The first implementation can use AI to draft structured test steps. Runtime AI-assisted element discovery can be added later after the deterministic test runner is reliable.

## Feature 5 — Secure test credentials and variables

V1, introduced after basic public-page testing

Developers need to test authenticated workflows.

Instead of storing passwords directly in test instructions, the platform will provide project-level secrets.

For example:

```
TEST_EMAIL
TEST_PASSWORD
TEST_USERNAME
```

A test will reference these variables without revealing their values.

Security requirements

- Encrypt secrets at rest.
- Restrict secret access by project and authorized account.
- Never return plaintext secrets in ordinary API responses.
- Redact passwords and sensitive fields from logs and AI context.
- Ensure screenshot and trace collection doesn't expose credentials.
- Prevent secrets from being sent to unapproved destinations.
- Use dedicated test accounts, never real customer accounts.

We should not promise support for every OAuth provider, CAPTCHA, or two-factor login in V1. Those flows require additional infrastructure and explicitly supported test strategies.

## Feature 6 — Real browser test execution

V1 — Most important backend system

When users click Run Test, BuildHive executes the saved workflow using Playwright.

Execution behavior

Every run receives an isolated browser context.

The runner performs the steps in order, records results, evaluates assertions, and stops or fails appropriately when a required action cannot complete.

Each run is associated with an immutable test version.

Execution statuses

| Status               | Meaning                              |
| -------------------- | ------------------------------------ |
| Queued               | Waiting for a worker                 |
| Preparing            | Setting up browser                   |
| Running              | Executing steps                      |
| Passed               | All required assertions passed       |
| Failed               | A user-flow step or assertion failed |
| Timed out            | Execution exceeded its limit         |
| Cancelled            | Cancelled by user or system          |
| Infrastructure error | Browser or BuildHive system failed   |
| Flaky                | Result changed across retry attempts |

A failed login and a crashed testing worker must not be reported as the same problem.

Runner safeguards

- Separate browser sessions.
- Per-step and overall timeouts.
- Strict concurrency limits.
- Cleanup after completion.
- Retry rules for transient failures.
- Hard CPU, memory, and runtime limits.
- No execution of arbitrary AI-generated JavaScript.
- Restricted network access.

This is necessary because testing users' websites involves opening untrusted content.

## Feature 7 — Test execution reports

V1 — Core feature

This is where BuildHive can provide substantial value.

A good report should make it easy to identify and reproduce a problem without having to rerun everything manually.

Run #BH-2048

Login flow · Production

Failed

Duration

8.4s

Completed

3 / 5

Browser

Chromium

Execution timeline

1\. Navigate to login page

Passed

2\. Enter test credentials

Passed

3\. Click Sign In

Passed

4\. Verify dashboard appears

Failed

5\. Verify welcome heading

Skipped

Failure at step 4

Expected URL to contain `/dashboard`. Current URL remained `/login`.

Screenshot available

Trace available

Illustrative report design.

### Every report should contain

- Run ID and timestamp
- Project, environment, and test name
- Test version
- Final status
- Total duration
- Individual step outcomes and durations
- Expected versus actual result
- Failure screenshot
- Relevant console errors
- Relevant failed network requests
- Playwright error details
- Trace artifact, where available
- Retry information
- AI explanation, if requested

Playwright supports traces containing execution actions, network details, DOM snapshots, and screenshots. This gives us much of the raw debugging evidence required for a useful report.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://playwright.dev\&sz=32)

Playwright

+1



Later: short video recordings, visual timeline playback, downloadable bug reports, and direct issue creation.

## Feature 8 — AI Failure Explanation

V1

When a test fails, BuildHive should provide an optional AI explanation.

Example:

Observed issue: The dashboard did not open after submitting the login form.

Evidence: The login page remained visible, and the application returned a 401 response from the authentication endpoint.

Possible causes: Expired test credentials, an authentication configuration issue, or a backend rejection.

Suggested investigation: Verify the test account, inspect the login API response, and compare the result with the last successful run.

Crucially, AI must distinguish actual recorded evidence from possible causes. It should never confidently invent a root cause.

For V1, generate the explanation on demand or once per failed run with a usage limit to control AI costs.

## Feature 9 — Test history and comparisons

V1

Every completed run should be saved.

Users can filter history by test, environment, result, date, or trigger.

They should be able to answer:

- When did this test last pass?
- When did it start failing?
- Has this failure happened before?
- Did the most recent deployment fix the issue?

Basic V1 comparison: show the previous passing run beside the current failed run, including relevant screenshots and step differences.

Later: full side-by-side visual regression diffing, automatic regression clustering, and performance trend comparisons.

## Feature 10 — Dashboard and analytics

V1

We need two dashboards.

### Global dashboard

Shows all projects and account-level metrics.

- Total projects
- Active tests
- Runs in selected period
- Passed and failed runs
- Recent failures
- Upcoming scheduled runs
- Account usage
- Quick actions

### Project dashboard

Shows only one project's testing activity.

- Project status
- Most recent run
- Test pass rate
- Frequently failing tests
- Recent execution history
- Monitoring schedules
- Test creation shortcuts

We should label pass-rate metrics correctly. A 100% pass rate across five saved tests does not mean the entire website is bug-free or has 100% uptime.

## Feature 11 — Scheduled monitoring

V1

Developers should not have to manually launch every test.

They can schedule important tests to run automatically.

For example:

- Run login test daily.
- Run homepage test every few hours.
- Run signup test before a weekly release.

Scheduling features

- Enable or disable scheduling.
- Select supported frequencies.
- Choose timezone and schedule.
- View next scheduled run.
- Pause monitoring.
- Prevent duplicate overlapping executions.
- Enforce plan-based execution limits.

Free accounts will have more restrictive scheduling options.

## Feature 12 — Failure notifications

V1

When an important test starts failing, BuildHive sends an email.

Each alert includes the project, test name, environment, failure summary, time, and report link.

Alert controls

- Enable/disable email alerts.
- Alert on new failures.
- Optionally alert when a previously failing test recovers.
- Avoid sending repeated notifications for the same unresolved issue.
- Send a test notification.

Later: Slack, Discord, and custom webhooks.

## Feature 13 — Deployment-triggered testing

V1 — Basic webhook

Users should be able to trigger saved tests after deploying a new version of their application.

Example:

```
Developer deploys new version
        ↓
Deployment webhook reaches BuildHive
        ↓
BuildHive validates request
        ↓
Selected tests enter the queue
        ↓
BuildHive executes browser tests
        ↓
Developer receives the result
```

V1 can support a signed deployment-trigger webhook.

We should build direct Vercel and GitHub integrations after the basic webhook flow works.

Later: GitHub commit statuses, pull-request checks, deployment comparisons, release gates, and environment-specific automatic test selection.

## Feature 14 — Usage and billing

V1

Users will be able to view their plan, usage, and remaining testing allowance.

Usage needs to be transparent because AI calls and browser execution both cost money.

The usage dashboard will show:

- Plan name
- Project allowance
- Number of tests
- Browser runs consumed
- AI requests consumed
- Renewal date
- Upgrade and billing management
- Usage-limit messages

We should implement server-side entitlement checks—not simply hide paid buttons in the frontend.

## Feature 15 — Internal admin panel

V1 — Minimal

This is not a customer-facing feature, but it is important.

As the founder, you need a secure admin interface to understand how the platform is operating.

It should display user counts, active subscriptions, browser execution volume, failed worker jobs, AI costs, storage usage, and abuse signals.

Support staff or administrators should be able to inspect sanitized execution metadata, retry infrastructure failures, and suspend abusive usage.

They should not automatically receive access to customer secrets or raw authenticated browser sessions.

## Features we deliberately postpone

These may become valuable, but building all of them before getting paying customers would delay launch.

| Feature                                    | Target |
| ------------------------------------------ | ------ |
| Slack and Discord notifications            | V1.1   |
| GitHub and Vercel integrations             | V1.1   |
| Team workspaces and invitations            | V1.1   |
| Reusable test-step groups                  | V1.1   |
| Shared report links with expiration        | V1.1   |
| Video recordings                           | V1.1   |
| Test templates library                     | V1.1   |
| Browser recording to create tests          | V2     |
| AI exploratory website testing             | V2     |
| Visual regression testing                  | V2     |
| Chromium, Firefox, WebKit coverage         | V2     |
| AI-suggested selector repair               | V2     |
| API testing                                | V2     |
| Accessibility testing                      | V2     |
| Hosted test-data management                | V2     |
| Self-hosted runners / private environments | V2     |
| Public API and SDK                         | V2     |
| Enterprise SSO and advanced permissions    | V2     |

V1 must already feel complete for its intended purpose: create tests, run them reliably, understand failures, and monitor an application continuously.

# Part 3 — Complete website structure

We have two primary parts: the public marketing website and the authenticated application.

## 3.1 Public website

| Page          | Route           | Purpose                            |
| ------------- | --------------- | ---------------------------------- |
| Homepage      | `/`             | Explain BuildHive and drive signup |
| Features      | `/features`     | Explain the main capabilities      |
| How it works  | `/how-it-works` | Show the product workflow          |
| Pricing       | `/pricing`      | Compare plans                      |
| Login         | `/login`        | Authenticate users                 |
| Documentation | `/docs`         | User guides and examples           |
| FAQ           | `/faq`          | Answer common questions            |
| Privacy       | `/privacy`      | Privacy policy                     |
| Terms         | `/terms`        | Terms of service                   |
| Contact       | `/contact`      | Support and inquiries              |

A public demo report should also be available so visitors can understand the product before registering.

## 3.2 Authenticated application

```
/dashboard
│
├── projects
│   ├── new
│   └── [projectId]
│       ├── overview
│       ├── tests
│       │   ├── new
│       │   └── [testId]/edit
│       ├── runs
│       │   └── [runId]
│       ├── monitoring
│       └── settings
│
├── activity
│
├── usage
│
├── settings
│   ├── profile
│   ├── notifications
│   ├── security
│   └── billing
│
└── admin
    ├── overview
    ├── users
    └── jobs
```

The admin area is restricted to internal accounts and needs server-side authorization.

## 3.3 Dashboard navigation

BuildHive

NAVIGATION

Overview

Projects

Activity

Usage

Settings

Dashboard

Active projects

# 4

Test success rate

# 98.6%

Issues detected

# 3

Illustrative layout direction. Actual dashboard uses the full width with a responsive sidebar.

## 3.4 Design direction

I recommend a minimal, professional developer-tool aesthetic.

Base

Surface

Success

Error

Accent

Use neutral surfaces, readable typography, restrained accent colors, generous spacing, and clear data visualizations.

The dashboard should support light and dark themes, mobile-friendly layouts, accessible keyboard navigation, loading skeletons, and useful empty states.

Avoid overdesigned gradients and unnecessary animations. The main value of the interface is helping developers find failures quickly.

# Part 4 — Technology and system architecture

I recommend using TypeScript across the entire BuildHive platform.

## 4.1 Technology stack

| Layer            | Technology                    | Purpose                            |
| ---------------- | ----------------------------- | ---------------------------------- |
| Frontend         | Next.js + React               | Marketing website and dashboard    |
| Language         | TypeScript                    | Shared frontend/backend types      |
| Styling          | Tailwind CSS                  | Styling                            |
| Components       | shadcn/ui                     | Reusable UI                        |
| Client state     | Zustand                       | Lightweight UI state               |
| Server data      | TanStack Query                | Interactive data fetching          |
| Validation       | Zod                           | Runtime validation                 |
| Authentication   | Auth.js                       | Google/GitHub login                |
| Database         | PostgreSQL                    | Primary persistent storage         |
| ORM              | Drizzle                       | Database access and migrations     |
| Jobs             | BullMQ                        | Background test queues             |
| Queue backend    | Redis                         | Job coordination                   |
| Browser testing  | Playwright                    | Automated browser execution        |
| AI               | Model provider via server SDK | Test planning and failure analysis |
| Artifact storage | S3-compatible storage         | Screenshots and traces             |
| Email            | Transactional email provider  | Notifications                      |
| Billing          | Subscription payment provider | Paid plans                         |
| Monitoring       | Sentry + structured logs      | Application errors and operations  |

PostgreSQL is my preferred choice here because projects, test runs, subscriptions, usage, and permissions have clear relational relationships.

Next.js is suitable for the website and its API layer, but we should run browser jobs in separate long-lived workers. Next.js documentation specifically warns that some serverless deployment environments terminate long-running handlers and have filesystem or connection limitations.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://nextjs.org\&sz=32)

Next.js

+1



## 4.2 Architecture

Next.js application

Dashboard · Public website · Auth · APIs

PostgreSQL

Persistent data

Redis / BullMQ

Execution queue

Worker service

Playwright browser runner

Object storage

Evidence artifacts

The API records requests and queues work. Separate workers execute browser tests and write results.

BullMQ supports workers, job events, failure handling, and configurable retries. We should also use durable job IDs and idempotent processing because queue jobs may be attempted again after failures.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.bullmq.io\&sz=32)

BullMQ

+2



## 4.3 Repository structure

Use a monorepo.

```
buildhive/
│
├── apps/
│   ├── web/                  # Next.js
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── public/
│   │
│   └── worker/               # Background jobs
│       ├── src/
│       │   ├── jobs/
│       │   ├── runner/
│       │   ├── security/
│       │   └── services/
│       └── Dockerfile
│
├── packages/
│   ├── db/                   # Schema, migrations
│   ├── shared/               # Types, validation
│   ├── test-engine/          # Test step definitions
│   └── config/               # Shared configuration
│
├── infra/
│   ├── docker/
│   └── scripts/
│
├── docs/
│
├── package.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

This separates the website from test execution while allowing them to share type definitions and database models.

## 4.4 Main database entities

We should design the database before implementing the feature screens.

| Entity                 | What it stores                       |
| ---------------------- | ------------------------------------ |
| User                   | User profile and account state       |
| Account / Session      | Authentication data                  |
| Workspace              | Billing and resource ownership       |
| WorkspaceMember        | Membership and role, expanded later  |
| Project                | Website being tested                 |
| DomainVerification     | Ownership-verification attempts      |
| Environment            | Production/staging URLs              |
| TestCase               | Saved test metadata                  |
| TestVersion            | Immutable sequence of approved steps |
| ProjectSecret          | Encrypted project variables          |
| TestRun                | One execution instance               |
| TestRunStep            | Individual step results              |
| RunArtifact            | Screenshot or trace metadata         |
| TestSchedule           | Recurring schedule                   |
| NotificationPreference | Alert settings                       |
| NotificationEvent      | Alert delivery and deduplication     |
| UsageEvent             | Metered usage                        |
| Subscription           | Plan and billing state               |
| Integration            | External integration configuration   |
| AuditLog               | Important security/account actions   |

Use UUID primary keys, foreign keys, timestamps, and indexes on commonly queried project/run fields.

The workspace entity may initially have only one owner, but including it now simplifies future team accounts.

# Part 5 — Pricing and business model

These are proposed launch experiments, not validated pricing.

FREE

# $0

For trying BuildHive

1 project

2 saved tests

20 browser runs/month

Limited AI generation

Basic reports

STARTER

# $19

/mo

For solo SaaS developers

3 projects

15 saved tests

300 browser runs/month

Scheduled monitoring

Failure email alerts

Growth

## $49/mo

10 projects · 100 saved tests · 1,500 runs/month · More AI usage · Deployment triggers · Longer history

Draft pricing only. Limits and margins must be tested against actual browser, AI, storage, and infrastructure costs.

Browser runs should have limits on duration, steps, parallel sessions, and scheduling frequency. We should meter actual browser time internally even if the customer-facing plan uses run counts.

When users exhaust their allowance, additional paid executions should stop unless they've explicitly opted into an authorized overage arrangement. No surprise charges.

# Part 6 — Chronological development roadmap

This is the build sequence I recommend.

Implementation sequence

Complete each phase's exit checklist before starting the next.

1. Validation & repository audit
2. Monorepo and tooling
3. Design system and public shell
4. Database and authentication
5. Projects and domain verification
6. Test definitions and editor
7. Local browser execution engine
8. Queue and background workers
9. Reports and artifacts
10. AI test builder and explanations
11. Dashboard and run history
12. Schedules and notifications
13. Usage and subscriptions
14. Deployment webhooks
15. Production security and operations
16. Marketing, documentation and legal
17. End-to-end QA and production deployment
18. Private beta and public launch

## Phase 0 — Validate the idea and inspect the existing repository

Goal: Verify that we are building something developers want and identify reusable code.

### Tasks

- Review the existing BuildHive repository.
- Identify reusable authentication, layout, database, and UI components.
- Remove obsolete code-review-specific product logic.
- Document current project structure and dependencies.
- Research comparable products and onboarding workflows.
- Interview at least 10 developers who deploy web apps.
- Identify the three browser workflows they most worry about breaking.
- Demonstrate a sample failure report.
- Ask whether they would pay for recurring tests, rather than just whether they like the idea.
- Finalize the V1 requirements and postpone optional features.

Exit criteria: We know exactly which developer segment we're targeting, have evidence of interest, and have a written decision about what existing code to keep.

Do not spend months building without validating this.

## Phase 1 — Repository and development infrastructure

Goal: Establish a maintainable foundation.

### Tasks

- Establish the pnpm monorepo structure.
- Configure the Next.js web app.
- Create the separate Node.js worker package.
- Create shared TypeScript configuration.
- Configure Tailwind and shadcn/ui.
- Configure ESLint and formatting.
- Add Zod and shared validation utilities.
- Configure environment-variable validation.
- Add `.env.example` and appropriate `.gitignore` files.
- Configure Docker for local PostgreSQL and Redis.
- Set up repository scripts for development, builds, migrations, and tests.
- Add GitHub Actions for linting, typechecking, and test runs.
- Write the initial README and development setup instructions.

### Exit checklist

- The web application runs locally.
- The worker service starts independently.
- Database and Redis connections work.
- TypeScript builds without errors.
- Another developer could follow the README and start the project.

## Phase 2 — Design system and website shell

Goal: Build the reusable interface foundation before adding complex behavior.

### Tasks

- Establish the visual design tokens for colors, typography, spacing, and borders.
- Add light and dark themes.
- Create reusable buttons, inputs, selects, dialogs, tables, and cards.
- Build the public site header and footer.
- Build the dashboard shell and sidebar.
- Build mobile navigation.
- Add error pages, loading skeletons, and empty states.
- Design the project's main dashboard.
- Design project details, test editor, and execution report screens.
- Build responsive layouts and ensure keyboard accessibility.
- Add toast notifications and confirmation dialogs.

The screens can use placeholder data during this phase. Do not yet implement complex business behavior.

### Exit checklist

- All primary screen layouts exist.
- Navigation works.
- Dark and light modes work.
- Layouts behave correctly on mobile.
- UI components are reused rather than repeatedly rewritten.

## Phase 3 — Database, authentication and account management

Goal: Establish real persisted user accounts and authorization.

### Tasks

- Provision local and staging PostgreSQL databases.
- Configure Drizzle and create initial migrations.
- Implement User, Account, Session, and Workspace tables.
- Implement GitHub OAuth sign-in.
- Implement Google OAuth sign-in.
- Create login and onboarding routes.
- Add server-side session validation.
- Protect dashboard routes and APIs.
- Create a default workspace after first login.
- Build profile settings and logout.
- Add consistent account deletion and data-cleanup rules.
- Implement workspace authorization checks.
- Add authentication rate limiting and audit events.

### Exit checklist

- New users can sign in.
- Returning users retain their accounts.
- Unauthorized visitors cannot access the dashboard.
- One user's data is not accessible to another.
- Account settings save correctly.

## Phase 4 — Projects and domain verification

Goal: Users can safely register websites they want to test.

### Tasks

- Create Project, Environment, and DomainVerification tables.
- Implement project creation and editing.
- Validate and normalize site URLs.
- Add a domain-verification challenge mechanism.
- Implement DNS TXT verification.
- Implement HTML file verification.
- Add verification retries and expiration.
- Show project verification status.
- Add production and staging environments.
- Add project archive and deletion workflows.
- Implement ownership checks on all project endpoints.
- Prevent test execution until authorization requirements are satisfied.

### Exit checklist

- Users can create projects.
- Valid domains can be verified.
- Unauthorized or invalid targets are rejected.
- Projects are stored persistently.
- Projects can be managed and deleted.

## Phase 5 — Test definitions and test editor

Goal: Define precisely what the browser runner will execute.

### Tasks

- Design a typed test-step schema.
- Implement allowed actions such as navigate, click, fill, and assert.
- Define selector formats and locator fallback rules.
- Add a test versioning model.
- Build manual test creation.
- Build the step editor with add, reorder, edit, and remove actions.
- Add expected-result assertions.
- Add timeout and viewport settings.
- Implement draft, active, and paused statuses.
- Add test duplication and deletion.
- Create reusable project variables and encrypted secrets.
- Validate that tests contain meaningful assertions.
- Prevent unsafe or unsupported steps.

### Exit checklist

- A user can create a complete test manually.
- Every test passes schema validation.
- Test versions are preserved.
- Secrets are protected.
- A saved test can be loaded back into the editor without losing information.

## Phase 6 — Build the Playwright execution engine

Goal: Make the first real browser test work independently of the UI.

This is probably the most technically demanding phase.

Begin with a locally executed test against an application you own.

### Tasks

- Install and configure Playwright.
- Set up isolated browser execution.
- Implement safe URL navigation.
- Build the step interpreter for the approved test schema.
- Implement locator resolution and action execution.
- Add retrying Playwright assertions.
- Capture individual step results.
- Add step timeout and total-run timeout handling.
- Capture browser console errors and failed requests.
- Capture screenshots on test failure.
- Generate trace artifacts.
- Implement browser cleanup and cancellation.
- Validate redirects and all network destinations.
- Block access to internal network ranges, cloud metadata endpoints, and local services.
- Run browsers with resource and network restrictions.
- Test the runner against known passing and intentionally failing websites.

The network-safety requirements are important. User-controlled URLs and redirects are a potential server-side request forgery risk, as described in OWASP's&#x20;

SSRF prevention guidance

. The worker must have network-level restrictions, not just URL validation.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://cheatsheetseries.owasp.org\&sz=32)

OWASP Cheat Sheet Series



### Exit checklist

- Passing workflows are correctly marked passed.
- Broken workflows are correctly marked failed.
- A real browser performs every step.
- Timeouts and redirects are handled safely.
- Screenshots and traces are produced.
- Browser processes are reliably cleaned up.

Do not add AI until this works reliably.

## Phase 7 — Queue system and background execution

Goal: Connect the website to the browser runner without blocking requests.

### Tasks

- Configure Redis for job processing.
- Create BullMQ execution queues.
- Implement an API endpoint for starting test runs.
- Persist the queued run before dispatching work.
- Have workers fetch approved test versions.
- Implement queued, preparing, and running status transitions.
- Add job deduplication and idempotency.
- Implement retry handling for infrastructure errors.
- Add configurable concurrency limits.
- Implement user-requested cancellation.
- Record duration and job-failure details.
- Recover or mark runs after worker crashes.
- Provide run-status updates through polling initially.
- Test simultaneous runs and worker failures.

### Exit checklist

- Starting a test does not freeze the dashboard.
- Tests run in background workers.
- Users can see current execution status.
- Crashes don't leave tests permanently running.
- Duplicate executions are controlled.

## Phase 8 — Reports, artifacts, and debugging

Goal: Turn raw browser execution into actionable product value.

### Tasks

- Create TestRun, TestRunStep, and RunArtifact tables.
- Persist final statuses and timestamps.
- Store screenshots in S3-compatible storage.
- Store traces and relevant sanitized logs.
- Implement short-lived authorized artifact URLs.
- Build the complete run-report page.
- Build the step-by-step timeline.
- Highlight the first important failure.
- Display expected versus observed behavior.
- Show browser console and failed network requests.
- Provide links to trace artifacts.
- Build test-run retry functionality.
- Implement artifact retention and cleanup.
- Add a readable explanation for infrastructure failures.

### Exit checklist

- Every completed run has a report.
- Failed runs show useful evidence.
- Users can inspect the step that failed.
- Artifacts remain private to authorized users.
- Old artifacts expire according to the retention policy.

This phase is the first major product milestone: we now have a functioning browser-testing SaaS, even without AI.

## Phase 9 — AI test generation and failure explanations

Goal: Make creating and understanding tests substantially easier.

### Tasks

- Choose an AI provider and create a server-side abstraction.
- Design the structured output schema for generated steps.
- Create the natural-language test prompt interface.
- Generate allowed test steps from user instructions.
- Validate AI output with Zod.
- Reject unsafe, unsupported, or unauthorized actions.
- Add a review/edit screen before saving.
- Implement test-plan regeneration and correction.
- Detect when the user hasn't specified an expected result.
- Add AI-assisted explanations to failed run reports.
- Separate observed evidence from suggested possible causes.
- Redact sensitive information before AI requests.
- Treat website content as untrusted data, not AI instructions.
- Add AI usage limits and cost tracking.
- Create a small evaluation dataset of successful and unsuccessful test plans.

### Exit checklist

- AI generates valid editable steps.
- Users approve the plan before execution.
- Generated steps run through the same deterministic engine.
- Unsupported instructions fail clearly.
- AI doesn't expose secrets or invent successful results.
- AI costs are measured.

## Phase 10 — Dashboards, history, and analytics

Goal: Make BuildHive useful for ongoing development, not just individual test runs.

### Tasks

- Replace dummy dashboard data with real queries.
- Build global project summaries.
- Build project-specific overview pages.
- Display test totals and status counts.
- Calculate pass rates for selected time periods.
- Build recent failures and activity views.
- Create searchable and filterable run history.
- Show the previous successful run for failed tests.
- Add useful empty states and first-time-user guidance.
- Add dashboard query pagination and indexing.
- Ensure metrics correctly exclude cancelled and infrastructure-error runs where appropriate.

### Exit checklist

- Every dashboard metric comes from real data.
- Historical reports are accessible.
- Users can quickly identify problematic tests.
- Filtering and pagination work.
- The dashboard remains usable as run volume grows.

## Phase 11 — Monitoring schedules and notifications

Goal: Deliver recurring value without users opening BuildHive every day.

### Tasks

- Create TestSchedule records.
- Build the monitoring settings UI.
- Add daily and other plan-appropriate schedules.
- Implement timezone-aware scheduling.
- Enqueue due tests reliably.
- Prevent overlapping runs where required.
- Implement pause and resume.
- Connect a transactional email provider.
- Build failure and recovery email templates.
- Add notification preferences.
- Suppress duplicate alerts for unresolved failures.
- Record delivery attempts and results.
- Test schedule interruptions and missed-run recovery.

### Exit checklist

- Saved tests run on schedule.
- Results are persisted.
- Users receive relevant failure alerts.
- Duplicate notifications are controlled.
- Scheduled runs respect account limits.

This is the second major product milestone: BuildHive now delivers value automatically.

## Phase 12 — Usage metering, payments, and subscriptions

Goal: Turn the application into a sustainable paid SaaS.

### Tasks

- Finalize initial plan limits using real infrastructure costs.
- Create Plan, Subscription, and UsageEvent models.
- Implement usage recording for browser runs.
- Meter AI requests and browser execution time internally.
- Create centralized server-side entitlement checks.
- Add a billing provider compatible with the business's jurisdiction.
- Implement subscription checkout.
- Validate signed payment webhooks.
- Make webhook processing idempotent.
- Implement plan upgrades and downgrades.
- Handle failed payments, cancellations, and renewal states.
- Create the billing settings page.
- Build the usage dashboard.
- Enforce project, test, scheduling, and execution limits.
- Test all plan transitions in the provider's sandbox.

### Exit checklist

- Customers can subscribe successfully.
- Payments update entitlements correctly.
- Free-plan limits cannot be bypassed.
- Cancellation and payment failures work.
- Users can see remaining allowance.
- Usage and costs are recorded accurately.

## Phase 13 — Deployment-trigger webhooks

Goal: Make BuildHive part of a developer's deployment workflow.

### Tasks

- Create project-specific webhook configuration.
- Generate securely stored webhook credentials.
- Build a signed webhook receiver.
- Validate webhook authorization and replay protection.
- Allow users to choose tests triggered by deployment.
- Capture optional deployment identifiers and environment names.
- Enqueue selected tests after a valid trigger.
- Associate runs with the triggering deployment.
- Show webhook event history.
- Add retry and error feedback.
- Document how to invoke the webhook from CI/CD.

### Exit checklist

- Valid deployment events trigger tests.
- Invalid or replayed requests are rejected.
- Duplicate events don't create unexpected extra runs.
- Results are associated with the correct project/environment.

Direct GitHub and Vercel integrations can build on this foundation later.

## Phase 14 — Security, reliability, and internal operations

Goal: Make the system safe and supportable for real customers.

Security must be designed into every earlier phase. This is the final comprehensive hardening pass, not the first time we address security.

### Tasks

- Audit project and workspace authorization across all APIs.
- Verify SSRF defenses, including DNS rebinding and redirects.
- Review browser container isolation and egress controls.
- Audit credentials, logs, screenshots, and trace redaction.
- Add rate limits for account creation and expensive operations.
- Add abuse prevention and test execution quotas.
- Verify secret encryption and rotation procedures.
- Apply storage lifecycle policies and retention periods.
- Configure database backups and restore tests.
- Add structured operational logs and error monitoring.
- Create an internal admin dashboard.
- Add worker-health and queue-depth monitoring.
- Configure alerts for infrastructure failures.
- Implement data export and account deletion workflows.
- Run dependency and security scans.
- Perform authorization, webhook, billing, and malicious-target tests.

### Exit checklist

- Cross-user data-access attempts fail.
- Internal network targets cannot be reached.
- Secrets do not appear in user-visible diagnostics.
- Workers are resource-constrained and recover from crashes.
- Database backup restoration works.
- System errors are observable.
- Sensitive endpoints are protected.

## Phase 15 — Public website, documentation, and legal pages

Goal: Explain the product clearly and make it ready for customers.

The public shell was built earlier; now we finish the real content and conversion flows.

### Tasks

- Write homepage messaging focused on preventing broken releases.
- Build an interactive or illustrated product walkthrough.
- Finish the features page.
- Finish the how-it-works page.
- Finish pricing with verified plan limits.
- Create a public sample test report using safe demonstration data.
- Add onboarding walkthroughs and documentation.
- Explain domain verification and permitted testing.
- Document supported test actions and authentication limitations.
- Add troubleshooting articles.
- Create support and contact workflows.
- Draft and review Terms of Service, Privacy Policy, and acceptable-use terms.
- Explain data retention, recorded artifacts, and AI processing.
- Configure metadata, social preview images, sitemap, and robots rules.
- Add privacy-conscious product analytics.
- Add an in-product feedback mechanism.

### Exit checklist

- New users understand the value proposition.
- Pricing and usage rules are transparent.
- Users can learn the product without contacting support.
- Essential legal and privacy information is available.
- Marketing links and signup flows work.

## Phase 16 — Quality assurance and production deployment

Goal: Make the complete platform deployable and reliable.

### Tasks

- Create a staging environment.
- Provision managed production PostgreSQL and Redis.
- Deploy the Next.js website.
- Deploy isolated background worker infrastructure.
- Configure production artifact storage.
- Configure domains, HTTPS, and DNS.
- Apply production database migrations.
- Configure OAuth callbacks.
- Configure payment and notification webhooks.
- Set deployment secrets and environment variables.
- Add database migration and rollback procedures.
- Add unit tests for step validation and usage calculations.
- Add integration tests for APIs and queues.
- Add end-to-end tests for the BuildHive application itself.
- Test the entire signup-to-first-report flow.
- Test scheduling, emails, payments, and cancellations.
- Test failing workers, unavailable databases, and provider errors.
- Conduct a security and accessibility review.
- Test performance under realistic concurrent workloads.
- Configure production monitoring and alerts.

### Exit checklist

- The entire customer journey works in production.
- Worker failures are recoverable.
- Payment and usage entitlements behave correctly.
- Monitoring schedules survive restarts.
- User data and artifacts remain secure.
- There are no known critical release-blocking bugs.

## Phase 17 — Private beta and public launch

Goal: Get real developers to use BuildHive and establish whether they will pay for it.

### Tasks

- Invite a small group of developers from validation interviews.
- Watch how they set up their first project.
- Track signup-to-project and project-to-first-test conversion.
- Measure how often they create valid tests without help.
- Investigate false failures and flaky executions.
- Measure browser execution cost per customer.
- Collect feedback on report usefulness.
- Resolve the most frequent setup problems.
- Ask beta users to pay for ongoing monitoring.
- Refine pricing and plan allowances.
- Publish an explanatory launch post and demonstration.
- Announce BuildHive on relevant developer communities.
- Reach out individually to developers running live SaaS products.
- Add a changelog and collect feature requests.
- Establish a recurring review of usage, retention, and infrastructure cost.

### Launch success criteria

Rather than focusing only on registrations, track whether users reach a valuable outcome and continue using the product.

| Metric          | Initial signal to seek                                   |
| --------------- | -------------------------------------------------------- |
| Activation      | User verifies a project and completes a first test       |
| Test usefulness | Tests catch genuine failures or confirm important flows  |
| Reliability     | Few misleading or flaky results                          |
| Retention       | Users keep tests scheduled and active                    |
| Monetization    | Some users choose to pay for recurring monitoring        |
| Economics       | Revenue can exceed recurring execution and service costs |

For the initial beta, I would specifically aim to find at least three customers willing to pay, and investigate why others do not convert.

# Part 7 — Backend API contract

Here is the approximate API surface we should plan around.

These route definitions are a starting contract, not a requirement to implement all of them immediately.

| Method | Endpoint                       | Purpose               |
| ------ | ------------------------------ | --------------------- |
| GET    | `/api/me`                      | Current user          |
| GET    | `/api/projects`                | List projects         |
| POST   | `/api/projects`                | Create project        |
| GET    | `/api/projects/:id`            | Project details       |
| PATCH  | `/api/projects/:id`            | Edit project          |
| DELETE | `/api/projects/:id`            | Delete project        |
| POST   | `/api/projects/:id/verify`     | Verify domain         |
| GET    | `/api/projects/:id/tests`      | List tests            |
| POST   | `/api/projects/:id/tests`      | Create test           |
| GET    | `/api/tests/:id`               | Test details          |
| PATCH  | `/api/tests/:id`               | Update test           |
| DELETE | `/api/tests/:id`               | Delete test           |
| POST   | `/api/tests/:id/runs`          | Queue a new run       |
| GET    | `/api/runs/:id`                | Run status and report |
| POST   | `/api/runs/:id/cancel`         | Cancel running test   |
| GET    | `/api/projects/:id/runs`       | Execution history     |
| POST   | `/api/ai/generate-test`        | Generate test draft   |
| POST   | `/api/runs/:id/explain`        | Explain failure       |
| GET    | `/api/usage`                   | Account usage         |
| GET    | `/api/subscription`            | Current subscription  |
| POST   | `/api/billing/checkout`        | Start checkout        |
| POST   | `/api/webhooks/billing`        | Payment events        |
| POST   | `/api/webhooks/deployment/:id` | Deployment triggers   |

Schedules, secret management, and project environment APIs will be added as their respective phases are implemented.

All API handlers must validate inputs and authorize the user against the relevant workspace/project on the server.

# Part 8 — Important product rules

These are decisions we should establish before writing feature code.

## Rule 1: Test results must be trustworthy

A test passes only when its required assertions pass. A successful HTTP request or visible homepage does not automatically mean login, checkout, or another entire user flow is working.

## Rule 2: Failures must be reproducible

Every report should preserve the approved test version, runtime configuration, and evidence required to investigate a failure.

## Rule 3: We don't silently fix tests

If a locator breaks, we may suggest a repair. We should not silently change an assertion or expected outcome simply to produce a green result.

## Rule 4: Testing must be authorized

Users may only test sites and accounts they control or are explicitly authorized to test. Destructive actions must require explicit approval, and payment tests should use sandbox environments.

## Rule 5: Cost must be controlled

Browser runs, screenshot retention, tracing, and AI usage all consume resources. We need quotas, expiration policies, and cost accounting from the beginning.

## Rule 6: No false promise of complete coverage

BuildHive only verifies the workflows configured and successfully executed. We should never claim it guarantees that a whole application is bug-free.

# Part 9 — What the first customer experience must feel like

Imagine a developer hears about BuildHive for the first time.

1. They visit BuildHive.

   They understand immediately that it automatically tests important flows in deployed websites.
2. They sign in with GitHub.

   Their account and workspace are created automatically.
3. They add their SaaS URL.

   They verify domain ownership with a provided challenge.
4. They create a test.

   They write: "Open the login page, sign in using the test account, and confirm the dashboard opens."
5. They review the proposed steps.

   They supply dedicated test credentials and confirm the required assertions.
6. They click Run.

   A real browser executes the steps. They can watch the execution status.
7. They receive a clear report.

   If login fails, BuildHive shows the failed step, observed error, and screenshot.
8. They turn on monitoring.

   BuildHive repeats the test automatically and sends an alert when the workflow breaks.
9. They upgrade when they need more.

   Additional projects, more runs, and more frequent monitoring justify a paid plan.

This entire journey should feel simple even though the technology behind it is complicated.

# Part 10 — Milestone tracker

You can use this checklist as the master roadmap while building.

## BuildHive V1 progress

Track completed phases as you implement them.

## 0/18

0\. Validation & repo audit

1\. Project setup

2\. Design system

3\. Database & auth

4\. Projects & verification

5\. Test editor

6\. Playwright engine

7\. Job processing

8\. Reports & artifacts

9\. AI features

10\. Dashboard & history

11\. Monitoring & alerts

12\. Billing & usage

13\. Deployment hooks

14\. Security & operations

15\. Marketing & docs

16\. Production QA & deployment

17\. Beta & public launch

0% of major phases marked complete Copy checklist

# Final product priorities

If we keep adding features without prioritizing, BuildHive can easily become a large, expensive project that nobody pays for.

I'd organize our engineering effort around three milestones:

Milestone A — A working test engine

Complete Phases 0–8. A developer can connect a verified website, create a test manually, execute it, and receive a useful report.

This proves our technical foundation.

Milestone B — A product worth using repeatedly

Complete Phases 9–11. Add AI-assisted creation, dashboards, saved history, monitoring, and notifications.

This gives customers a reason to return and keep tests active.

Milestone C — A paid production SaaS

Complete Phases 12–17. Add subscriptions, deployment hooks, production hardening, documentation, and launch.

This tests whether BuildHive can become a real business.

The single most important thing to build first is the browser execution engine. Everything else—AI, analytics, alerts, and billing—depends on it being accurate.

For the existing repository, the plan is to inspect its reusable parts during Phase 0 rather than discard everything blindly. Then implement the phases in order, using real data and complete functionality instead of accumulating dummy features.

That gives BuildHive a clear path from its current code-review concept to a focused automated-testing SaaS developers could genuinely use and potentially pay for.