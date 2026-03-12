# BuildHive PRD (Phase 1)

## 1. Problem Statement
Software teams miss critical issues during pull request review because review quality is inconsistent and reviewers are overloaded. This causes production incidents, slower releases, and expensive rework.

## 2. Value Proposition
BuildHive acts as a PR Risk Gate that automatically analyzes pull requests, highlights high-risk changes, and provides actionable guidance before merge.

Primary value:
- Faster, more consistent review quality.
- Reduced incident risk.
- Better visibility into engineering risk trends.

## 3. Target Users
- Indie builders shipping quickly.
- Startup engineering teams (3-20 developers).
- Agencies managing multiple repositories.

## 4. Roles and Permissions (V1)
- Owner:
  - Full account control.
  - Billing access.
  - Organization and policy management.
- Admin:
  - Manage repositories and team members.
  - Manage policy profiles.
  - View analytics and review history.
- Developer:
  - View review runs and findings.
  - Connect personal repositories if allowed.
  - Configure personal notification preferences.

## 5. Core User Journeys

### 5.1 Signup and Login
1. User signs up with email or OAuth.
2. User verifies account.
3. User lands in onboarding flow.

Acceptance criteria:
- New user can create account in under 3 minutes.
- Authentication session persists securely.

### 5.2 Create Organization
1. User creates organization.
2. User becomes owner.
3. User can invite first teammate.

Acceptance criteria:
- Owner role is assigned automatically.
- Organization appears in dashboard immediately.

### 5.3 Connect GitHub App
1. Owner/admin clicks "Connect GitHub".
2. User installs GitHub App for selected repositories.
3. BuildHive receives installation webhook.

Acceptance criteria:
- Connected repositories are listed in dashboard.
- Installation is stored with valid metadata.

### 5.4 Receive First PR Analysis
1. Developer opens or updates a PR in connected repository.
2. Webhook triggers review job.
3. BuildHive posts summary and check result.

Acceptance criteria:
- First result appears within 5 minutes for standard PR sizes.
- Finding list includes severity, file path, and recommendation.

### 5.5 Upgrade to Paid Plan
1. Owner opens billing page.
2. Owner selects plan and completes checkout.
3. Subscription status updates automatically via webhook.

Acceptance criteria:
- Paid features unlock without manual support intervention.
- Invoice and billing history are visible to owner.

## 6. User Stories
- As a developer, I want an automated risk summary on my PR so I can fix critical issues before human review.
- As an engineering manager, I want trend analytics so I can identify recurring quality risks.
- As an owner, I want billing controls and plan limits so I can manage spend.
- As an admin, I want repo-level policies so I can enforce standards.

## 7. Functional Scope (V1)
- Authentication and team accounts.
- GitHub App installation and webhook ingestion.
- PR analysis pipeline (deterministic + AI-assisted).
- Findings dashboard with filtering and history.
- Billing and subscription gating.
- Notification channels (email and Slack).

## 8. Out of Scope (V1)
- Full CI replacement.
- Self-hosted enterprise offering.
- GitLab/Bitbucket support.
- Auto-generated code patching in IDE.

## 9. Metrics and Success
- Time-to-first-value under 15 minutes.
- Weekly active connected repositories over 40%.
- Paid conversion over 5% in first 90 days.

## 10. Risks and Mitigation
- False positives may reduce trust:
  - Mitigation: feedback loop and tunable policies.
- LLM costs may spike:
  - Mitigation: token budgeting, caching, and per-plan limits.
- Webhook reliability issues:
  - Mitigation: retries, idempotency, dead-letter queues.

## 11. Release Milestones
- Milestone A: Foundation and auth.
- Milestone B: GitHub integration and first review output.
- Milestone C: Billing and launch-ready hardening.

Status: Draft complete for Phase 1 and ready for sign-off.
