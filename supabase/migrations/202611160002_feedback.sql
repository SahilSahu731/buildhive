begin;

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('idea','bug','other')),
  message text not null check (char_length(btrim(message)) between 10 and 3000),
  path text not null check (char_length(path) between 1 and 500 and path like '/%' and path not like '//%'),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
revoke all on public.feedback from public, anon, authenticated;
grant insert(user_id,category,message,path) on public.feedback to authenticated;
create policy feedback_insert on public.feedback for insert to authenticated
  with check (user_id = (select auth.uid()));
-- Feedback is reviewed in the dashboard; other users cannot read submitted reports.
create trigger feedback_rate_limit before insert on public.feedback
  for each row execute function private.limit_content_writes();

commit;
