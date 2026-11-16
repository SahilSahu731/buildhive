# BuildWithMe

A community for builders: share progress, launch products, find a cofounder, and start building together.

Built with **Next.js App Router, React, TypeScript, Tailwind CSS v4, and Supabase**. Google and GitHub OAuth and passwordless email OTP use Supabase Auth. Authentication emails are delivered by **Resend through Supabase custom SMTP**.

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With no Supabase configuration, the app runs an explicitly labeled **local preview**. Sample builders, products, posts, conversations, and your changes are saved in this browser only. Reset it with “Reset demo workspace” in the sidebar’s Settings panel. Preview identities are never sent to Supabase.

To enable real accounts and durable data, follow [the setup guide](docs/setup.md), apply the migration, set the public Supabase URL/key, and restart Next.js. Provider secrets and the Resend SMTP password belong in Supabase, never browser code.

## Interface

A minimal dark interface with pure black page backgrounds and subtle dark panels, soft white text, customizable brand accents, locally hosted Inter, and React Icons. Shared semantic color tokens cover forms, dialogs, navigation, selection states, and native browser controls. The sidebar collapses into an icon rail, reveals its expand control on logo hover or focus, remembers the preference across visits, and becomes a keyboard-accessible drawer on mobile. Active links use filled icons; Settings and the profile sit at the bottom. The feed uses a single column; project discovery uses compact rows. Authentication shares the same typography and centered form layout, with a decorative animated backdrop, six OTP inputs, paste/autofill support, and Enter-to-verify. Motion respects reduced-motion preferences.

Styles live directly in each component’s Tailwind `className`, including responsive and interaction states. Edit shared colors and the Inter font in the `@theme` block of `src/app/globals.css`; that file also contains base browser defaults and animation keyframes. There are no separate component stylesheets or inline React styles. `data-ui` attributes used by Tailwind variants identify nested elements or conditional UI states. Avatar sizes use a typed map of literal utilities so every size is generated at build time.

## Included flows

- Community feed with updates, launches, cofounder posts, comments, likes, private bookmarks, following, sorting, and ownership-checked editing/deletion.
- Product discovery with category filters, search, upvotes, linked product details, and create/edit/delete flows for makers.
- Cofounder discovery with skill/role search, availability filters, pass/connect actions, and incoming/outgoing requests.
- Accepted connections open one private conversation per pair. Messaging refreshes every 15 seconds while the tab is visible.
- Editable builder profiles with skills, interests, availability, social links, and projects.
- Google/GitHub sign-in and six-digit email verification with expiry/error feedback and resend cooldown.
- Responsive navigation, native accessible dialogs, keyboard search, loading/error/empty states, validation, and same-origin mutation protection.

## Structure

```text
src/
  app/
    (platform)/          # Workspace pages and shared shell
    (auth)/login/        # OAuth and OTP UI
    auth/callback/      # PKCE authorization-code exchange
    api/                # Authenticated, validated route handlers
  components/
    auth/               # Authentication components
    features/           # Product, matching, messaging, profile features
    feed/               # Posts, comments, composition
    layout/             # Navigation and global search
    providers/          # Workspace state and data lifecycle
    ui/                 # Reusable avatars, icons, dialogs
  lib/
    server/             # Server-only Supabase repository
    supabase/           # Browser/server clients and session refresh
    types.ts            # Domain models and mutation contract
    validation.ts       # Shared runtime input schemas
    demo-data.ts         # Isolated sample content
    demo-reducer.ts      # Deterministic preview transitions
  proxy.ts              # Cookie-based auth refresh
supabase/
  migrations/           # Tables, RLS, grants, indexes, RPCs, limits
  templates/            # OTP email templates
  tests/                # Executable authorization assertions
tests/                  # Domain and security regression tests
docs/                   # Setup, deployment, and operational notes
```

## Verification

```bash
npm run typecheck
npm test
npm run build
```

CI runs the same checks plus migration and authorization tests against a disposable PostgreSQL service. `supabase/tests/authorization.sql` can be run against a disposable local database with the migration applied; it rolls back its fixtures. The CI scaffold simulates Supabase's auth roles and must never be run on a hosted Supabase database. Do not run test fixtures against production.

## Deployment

Deploy as a standard server-rendered Next.js application to Vercel or another Node.js host. Configure the public Supabase environment variables, production Site URL, both providers, redirect allowlist, Resend SMTP, and email templates before testing real sign-in. This repository does not contain production credentials or create external projects automatically.

This implementation is a functional initial platform, with bounded queries (100 posts/projects, 200 discoverable profiles/connections, 50 conversations and the latest 100 messages per conversation). Before larger-scale rollout, add cursor pagination, moderation/reporting and account deletion tools, monitoring, backups, and your privacy/terms content. The setup guide records the remaining infrastructure checks. Uploads and image hosting are intentionally outside this first version; projects use neutral letter monograms.
