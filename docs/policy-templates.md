# Policy Templates (V1)

These policies are configurable at organization and repository level.

## 1. Security Focus Policy
Rules:
- Flag use of dangerous APIs (`eval`, shell exec without sanitization).
- Flag hardcoded secrets or tokens.
- Flag direct database queries without parameterization.

Outcome:
- Any critical finding fails the PR check.

## 2. Test Coverage Expectation Policy
Rules:
- If files in critical paths change, require test file changes in same PR.
- Flag PRs with high code churn and no tests.

Outcome:
- Medium-risk warning if missing tests.
- High-risk status for critical module changes without tests.

## 3. Critical File Protection Policy
Rules:
- Apply stricter scoring to changes in auth, billing, and permissions modules.
- Require owner/admin approval for critical-path findings above threshold.

Outcome:
- Lower merge confidence score threshold for sensitive areas.

## 4. Large PR Risk Policy
Rules:
- Flag PRs exceeding configurable diff size limits.
- Encourage splitting into smaller PRs.

Outcome:
- Add risk annotation and recommendation, does not auto-fail by default.

## 5. Policy Defaults
- Default profile on new org: balanced security + testing.
- Owners and admins can switch profiles per repository.
- Developers can view but cannot edit policy definitions.

Status: Draft complete for Phase 1 and ready for sign-off.
