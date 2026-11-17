# Connect Supabase, OAuth, and Resend

## Development

1. Copy `.env.example` to `.env.local`.
2. For local Supabase, install Docker, run `npx supabase start`, then `npx supabase db reset`. Get the URL and public anon/publishable key from `npx supabase status` and place them in `.env.local`. Local OTP emails appear at http://localhost:54324.
3. For hosted Supabase, create a project and run:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to that project's public values. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported. Restart Next.js after changing public environment variables.
5. The migration provisions profiles for **new** auth users. An existing project with existing users needs a reviewed profile backfill before those users can access the workspace.
6. For deployment, set server-only `APP_URL` to the canonical public origin (for example, `https://your-domain.com`). This pins OAuth redirects and same-origin checks to your public domain. Locally, leave it empty to derive the origin from the incoming Host header.

No persistent demo accounts are seeded. Demo data remains separate from real account data.

## Email login and verification

Email login is passwordless: Supabase issues and validates the OTP and creates the verified session. The app does not generate, store, or compare OTPs. Both new and returning users enter a six-digit code.

In the hosted Supabase dashboard:

- Enable email signup and confirmations.
- Set OTP length to **6** and expiry to **600 seconds**.
- Set the production Site URL under Authentication → URL Configuration.
- Add exact application callback URLs, such as `https://your-domain.com/auth/callback`, to the redirect allowlist. Add the localhost callback only for development.
- Copy the repository's `confirmation.html` and `magic-link.html` into their respective email templates. Both contain `{{ .Token }}`. A magic-link-only template will not satisfy this app's OTP screen.

`supabase/config.toml` configures local development; it does not reconfigure an existing hosted project.

## Deliver emails with Resend

1. Verify your sending domain in Resend and publish the required DNS records.
2. Create a Resend sending API key.
3. Open **Authentication → Email → SMTP Settings** in the hosted Supabase dashboard and enable **custom SMTP**.
4. Use host `smtp.resend.com`, port `465`, username `resend`, and the Resend API key as the password.
5. Set **Sender name** to `BuildWithMe` and **Sender email** to an address on your verified domain, for example `hello@your-domain.com`. This controls the inbox sender label; changing an HTML template alone does not replace “Supabase Auth.”
6. In **Email Templates**, set the Confirm signup subject to `Your BuildWithMe verification code` and Magic link subject to `Your BuildWithMe sign-in code`, then copy the matching HTML files from `supabase/templates/`. Keep `{{ .Token }}` in both. Repository templates and `supabase/config.toml` do not automatically update a hosted project.
7. Request fresh signup and returning-user codes through the application. Check that the From header uses your sender name and domain and that the messages appear in Resend’s logs. Old emails retain their original sender.

The API key stays in Supabase's SMTP configuration. No Resend runtime key or service-role key is required in Next.js. See [Resend's official Supabase SMTP guide](https://resend.com/docs/send-with-supabase-smtp) and [Supabase custom SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

## Troubleshoot failed email codes

The development sign-in page shows a controlled explanation, the Auth error code (when available), HTTP status, and an actionable hint. Production shows only the user-facing explanation; raw provider responses are never rendered.

If the request returns HTTP 500 with an email-delivery error, open the project's Authentication logs and inspect the underlying SMTP/template error. The public Auth settings endpoint can confirm email sign-in is enabled, but does not expose SMTP configuration or email delivery logs. Fix the hosted settings rather than adding a Resend key to client code:

- Check that custom SMTP uses `smtp.resend.com`, port `465`, username `resend`, and an active Resend sending API key as its password.
- Check that the sender email belongs to a domain shown as Verified in the same Resend account. Set the sender name to `BuildWithMe`.
- Inspect the matching Resend log, if one exists, for the provider rejection. If the Auth log reports a template parsing error, replace the affected hosted template with the corresponding repository HTML file.
- Save the settings, then retry once through the app. HTTP 429 indicates a rate limit; repeated retries will not repair it.

A generic 500 alone does not identify which SMTP credential, domain, template, or provider setting failed. Use the Auth log's error detail before changing unrelated authentication settings.

## Google and GitHub

Create a Google Cloud OAuth **web** client and a GitHub OAuth App. Enable each provider in Supabase Authentication → Providers and enter its client ID and secret **there**.

The provider's authorized callback is the URL Supabase displays, usually:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

This is different from the Next.js `/auth/callback` route, which belongs in **Supabase's redirect allowlist**. Use separate provider apps for development where provider callback constraints require them.

The application callback performs the PKCE code exchange and accepts only same-origin relative redirects. Auth refresh uses server-validated claims; data handlers independently call `getUser()`.

## Security model

- Profiles, posts, projects, comments, likes and vote totals are public. Emails remain in `auth.users`.
- Bookmarks are private. Connections are visible to their participants. Only members can read conversations and send messages.
- Column-level grants prevent altering ownership, IDs, sender identity, and creation times.
- Connection RPCs reject self-connections; only the recipient accepts/declines. Acceptance atomically creates one conversation with exactly two members, even if retried.
- A declined pair cannot re-request in this version. Pass and meet another builder instead.
- Database constraints enforce size limits and unique likes/bookmarks/upvotes. Atomic per-user database counters rate-limit content and requests, including direct Supabase calls. Deleting content does not reset a counter.
- Every app mutation verifies the session, checks the browser origin, limits body size, and validates input. All database operations use the user's session and remain subject to RLS.
- Configure Supabase auth rate limits and bot protection for your expected traffic. If you enable CAPTCHA, add its token collection to the auth form before exposing signup to the public.
- A public Supabase key is expected in the browser; a secret/service-role key must never be placed in a `NEXT_PUBLIC_` variable.

## Launch checks

The topbar's feedback form requires `supabase/migrations/202611160002_feedback.sql` after the initial migration. Apply it with your normal Supabase migration workflow. Reports are private and can be reviewed in the dashboard's `public.feedback` table; signed-in users have insert-only access, and the existing per-user write limiter applies. Preview users are prompted to sign in before sending. Feedback does not send an email.

The feed's promotion form uses the same private feedback endpoint and table, with category `other` and a `Product promotion request` prefix. It collects placement requests; it does not charge users or automatically create paid campaigns. Products in the discovery rail are ranked by their actual upvotes and are organic recommendations. Suggested builders are available people who have no existing connection/request with the current user.

The notification dropdown combines messages, connection requests/acceptances, replies to your posts, and individual likes/upvotes on your work. It uses the workspace's bounded queries and polling, so it is recent activity rather than a permanent audit log. Marking notifications read saves that state per account on the current device; it does not mark conversation messages read or synchronize read state across devices.

1. Run type checking, tests, production build, and the disposable-database authorization assertions.
2. Test Google, GitHub, new-user email OTP, returning-user OTP, wrong/expired code, resend, sign-out, and session refresh against the actual project.
3. Use two real accounts to test request/accept/message flows; use a third to verify message/bookmark isolation.
4. Verify your production callback allowlist, sender domain, deliverability and auth rate limits.
5. Add your policies, abuse reporting/moderation, account deletion, monitoring, backup and recovery process before general public rollout.
6. Plan cursor pagination before exceeding the bounded initial workspace queries described in README.

Messaging currently polls while the tab is visible; it does not depend on enabling Supabase Realtime. Deploy Next.js behind HTTPS and ensure your reverse proxy preserves the request host/origin consistently for same-origin checks.
