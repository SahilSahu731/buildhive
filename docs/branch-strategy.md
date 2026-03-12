# Branch Strategy

## Branches
- `main`: stable production branch.
- `dev`: integration branch for validated feature work.
- `feature/<scope>-<short-name>`: short-lived feature branches.
- `hotfix/<scope>-<short-name>`: urgent production fixes.

## Pull Request Rules
- All changes must go through pull requests.
- Minimum 1 reviewer required for merge into `dev`.
- Minimum 1 reviewer and passing CI required for merge into `main`.
- No direct commits to `main`.

## Merge Flow
1. Create feature branch from `dev`.
2. Open PR to `dev`.
3. Resolve feedback and pass CI.
4. Squash merge into `dev`.
5. Release PR from `dev` to `main`.

## Release Cadence
- Planned: weekly release train from `dev` to `main`.
- Hotfixes: branch from `main`, merge back into both `main` and `dev`.
