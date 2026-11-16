begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated,service_role;
create function private.valid_labels(value text[],maximum integer) returns boolean language sql immutable set search_path='' as $$
select case when value is null then false when cardinality(value)=0 then true when array_ndims(value)<>1 then false when cardinality(value)>maximum then false else not exists(select 1 from unnest(value) as label where label is null or char_length(btrim(label)) not between 1 and 60) end;
$$;
revoke all on function private.valid_labels(text[],integer) from public;
grant execute on function private.valid_labels(text[],integer) to authenticated,service_role;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,40}$'),
  name text not null default 'Builder' check (char_length(btrim(name)) between 1 and 80),
  role text not null default '' check (char_length(role) <= 100),
  bio text not null default '' check (char_length(bio) <= 1200),
  location text not null default '' check (char_length(location) <= 100),
  avatar_url text check (avatar_url is null or (char_length(avatar_url) <= 2048 and avatar_url ~ '^https?://')),
  skills text[] not null default '{}' check (cardinality(skills) <= 20),
  looking_for text[] not null default '{}' check (cardinality(looking_for) <= 10),
  availability text not null default 'open' check (availability in ('open','busy')),
  website text check (website is null or (char_length(website) <= 2048 and website ~ '^https?://')),
  github text check (github is null or (char_length(github) <= 2048 and github ~ '^https?://')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  tagline text not null check (char_length(btrim(tagline)) between 1 and 180),
  description text not null default '' check (char_length(description) <= 6000),
  url text check (url is null or (char_length(url) <= 2048 and url ~ '^https?://')),
  category text not null default 'Other' check (char_length(category) between 1 and 60),
  tags text[] not null default '{}' check (cardinality(tags) <= 10),
  cover text not null default 'violet' check (cover in ('violet','mint','peach','blue')),
  stage text not null default 'building' check (stage in ('idea','building','beta','launched')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles add constraint profiles_skills_valid check(private.valid_labels(skills,20)),add constraint profiles_looking_for_valid check(private.valid_labels(looking_for,10));
alter table public.projects add constraint projects_tags_valid check(private.valid_labels(tags,10));
create table public.posts (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 3000),
  kind text not null default 'update' check (kind in ('update','launch','looking')),
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.post_likes (post_id uuid not null references public.posts(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,created_at timestamptz not null default now(),primary key(post_id,user_id));
create table public.bookmarks (post_id uuid not null references public.posts(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,created_at timestamptz not null default now(),primary key(post_id,user_id));
create table public.comments (id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id) on delete cascade,author_id uuid not null references public.profiles(id) on delete cascade,content text not null check(char_length(btrim(content)) between 1 and 1200),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.project_upvotes (project_id uuid not null references public.projects(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,created_at timestamptz not null default now(),primary key(project_id,user_id));
create table public.conversations (
  id uuid primary key default gen_random_uuid(),participant_low uuid not null references public.profiles(id) on delete cascade,participant_high uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),check(participant_low<participant_high),unique(participant_low,participant_high)
);
create table public.conversation_members (conversation_id uuid not null references public.conversations(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,created_at timestamptz not null default now(),primary key(conversation_id,user_id));
create table public.connections (
  id uuid primary key default gen_random_uuid(),sender_id uuid not null references public.profiles(id) on delete cascade,recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check(status in('pending','accepted','declined')),conversation_id uuid unique references public.conversations(id) on delete set null,
  user_low uuid generated always as(least(sender_id,recipient_id)) stored,user_high uuid generated always as(greatest(sender_id,recipient_id)) stored,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(sender_id<>recipient_id),unique(user_low,user_high)
);
create table public.messages (id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.conversations(id) on delete cascade,sender_id uuid not null references public.profiles(id) on delete cascade,content text not null check(char_length(btrim(content)) between 1 and 4000),created_at timestamptz not null default now(),read_at timestamptz);

create index profiles_skills_idx on public.profiles using gin(skills);
create index profiles_looking_for_idx on public.profiles using gin(looking_for);
create index profiles_created_idx on public.profiles(created_at desc);
create index projects_created_idx on public.projects(created_at desc);
create index projects_owner_idx on public.projects(owner_id,created_at desc);
create index projects_tags_idx on public.projects using gin(tags);
create index posts_created_idx on public.posts(created_at desc);
create index posts_author_idx on public.posts(author_id,created_at desc);
create index posts_project_idx on public.posts(project_id) where project_id is not null;
create index likes_user_idx on public.post_likes(user_id);
create index bookmarks_user_idx on public.bookmarks(user_id,created_at desc);
create index comments_post_idx on public.comments(post_id,created_at);
create index comments_author_idx on public.comments(author_id);
create index upvotes_user_idx on public.project_upvotes(user_id);
create index connections_sender_idx on public.connections(sender_id,status,created_at desc);
create index connections_recipient_idx on public.connections(recipient_id,status,created_at desc);
create index members_user_idx on public.conversation_members(user_id,conversation_id);
create index messages_conversation_idx on public.messages(conversation_id,created_at,id);
create index messages_sender_idx on public.messages(sender_id,created_at desc);

create function private.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end;$$;
create trigger profiles_updated before update on public.profiles for each row execute function private.set_updated_at();
create trigger projects_updated before update on public.projects for each row execute function private.set_updated_at();
create trigger posts_updated before update on public.posts for each row execute function private.set_updated_at();
create trigger comments_updated before update on public.comments for each row execute function private.set_updated_at();
create trigger connections_updated before update on public.connections for each row execute function private.set_updated_at();

create function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare base text;candidate text;display_name text;attempt integer:=0;avatar text;
begin
  display_name:=left(coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'),''),nullif(btrim(new.raw_user_meta_data->>'name'),''),'Builder'),80);
  base:=left(lower(regexp_replace(coalesce(nullif(new.raw_user_meta_data->>'user_name',''),nullif(split_part(coalesce(new.email,''),'@',1),''),'builder'),'[^a-zA-Z0-9_]','','g')),24);
  if char_length(base)<3 then base:='builder';end if;
  avatar:=coalesce(nullif(new.raw_user_meta_data->>'avatar_url',''),nullif(new.raw_user_meta_data->>'picture',''));
  if avatar !~ '^https?://' or char_length(avatar)>2048 then avatar:=null;end if;
  loop
    candidate:=case when attempt=0 then base else left(base,20)||'_'||left(replace(new.id::text,'-',''),12)||attempt::text end;
    begin
      insert into public.profiles(id,username,name,avatar_url) values(new.id,candidate,display_name,avatar);return new;
    exception when unique_violation then
      if exists(select 1 from public.profiles where id=new.id) then return new;end if;
      attempt:=attempt+1;
    end;
  end loop;
end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

-- A definer helper avoids recursive RLS membership checks. It returns only the caller's membership.
create function private.is_conversation_member(conversation uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.conversation_members where conversation_id=conversation and user_id=(select auth.uid()));$$;
revoke all on function private.set_updated_at(),private.handle_new_user(),private.is_conversation_member(uuid) from public;
grant execute on function private.is_conversation_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.project_upvotes enable row level security;
alter table public.connections enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy profiles_read on public.profiles for select to anon,authenticated using(true);
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy projects_read on public.projects for select to anon,authenticated using(true);
create policy projects_insert on public.projects for insert to authenticated with check(owner_id=(select auth.uid()));
create policy projects_update on public.projects for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy projects_delete on public.projects for delete to authenticated using(owner_id=(select auth.uid()));
create policy posts_read on public.posts for select to anon,authenticated using(true);
create policy posts_insert on public.posts for insert to authenticated with check(author_id=(select auth.uid()) and(project_id is null or exists(select 1 from public.projects p where p.id=project_id and p.owner_id=(select auth.uid()))));
create policy posts_update on public.posts for update to authenticated using(author_id=(select auth.uid())) with check(author_id=(select auth.uid()) and(project_id is null or exists(select 1 from public.projects p where p.id=project_id and p.owner_id=(select auth.uid()))));
create policy posts_delete on public.posts for delete to authenticated using(author_id=(select auth.uid()));
create policy likes_read on public.post_likes for select to anon,authenticated using(true);
create policy likes_insert on public.post_likes for insert to authenticated with check(user_id=(select auth.uid()));
create policy likes_delete on public.post_likes for delete to authenticated using(user_id=(select auth.uid()));
create policy bookmarks_read on public.bookmarks for select to authenticated using(user_id=(select auth.uid()));
create policy bookmarks_insert on public.bookmarks for insert to authenticated with check(user_id=(select auth.uid()));
create policy bookmarks_delete on public.bookmarks for delete to authenticated using(user_id=(select auth.uid()));
create policy comments_read on public.comments for select to anon,authenticated using(true);
create policy comments_insert on public.comments for insert to authenticated with check(author_id=(select auth.uid()));
create policy comments_update on public.comments for update to authenticated using(author_id=(select auth.uid())) with check(author_id=(select auth.uid()));
create policy comments_delete on public.comments for delete to authenticated using(author_id=(select auth.uid()));
create policy votes_read on public.project_upvotes for select to anon,authenticated using(true);
create policy votes_insert on public.project_upvotes for insert to authenticated with check(user_id=(select auth.uid()));
create policy votes_delete on public.project_upvotes for delete to authenticated using(user_id=(select auth.uid()));
create policy connections_read on public.connections for select to authenticated using(sender_id=(select auth.uid()) or recipient_id=(select auth.uid()));
create policy conversations_read on public.conversations for select to authenticated using(private.is_conversation_member(id));
create policy members_read on public.conversation_members for select to authenticated using(private.is_conversation_member(conversation_id));
create policy messages_read on public.messages for select to authenticated using(private.is_conversation_member(conversation_id));
create policy messages_insert on public.messages for insert to authenticated with check(sender_id=(select auth.uid()) and private.is_conversation_member(conversation_id));
create policy messages_read_receipt on public.messages for update to authenticated using(sender_id<>(select auth.uid()) and private.is_conversation_member(conversation_id)) with check(sender_id<>(select auth.uid()) and private.is_conversation_member(conversation_id));

-- Column-level privileges make identity, ownership and timestamps immutable to clients.
revoke all on public.profiles,public.projects,public.posts,public.post_likes,public.bookmarks,public.comments,public.project_upvotes,public.connections,public.conversations,public.conversation_members,public.messages from anon,authenticated;
grant select on public.profiles,public.projects,public.posts,public.post_likes,public.comments,public.project_upvotes to anon,authenticated;
grant update(username,name,role,bio,location,skills,looking_for,availability,website,github,onboarding_completed) on public.profiles to authenticated;
grant insert(owner_id,name,tagline,description,url,category,tags,cover,stage),update(name,tagline,description,url,category,tags,cover,stage),delete on public.projects to authenticated;
grant insert(author_id,content,kind,project_id),update(content,kind,project_id),delete on public.posts to authenticated;
grant insert(post_id,user_id),delete on public.post_likes to authenticated;
grant select,insert(post_id,user_id),delete on public.bookmarks to authenticated;
grant insert(post_id,author_id,content),update(content),delete on public.comments to authenticated;
grant insert(project_id,user_id),delete on public.project_upvotes to authenticated;
grant select on public.connections,public.conversations,public.conversation_members,public.messages to authenticated;
grant insert(conversation_id,sender_id,content),update(read_at) on public.messages to authenticated;

create function public.request_connection(target uuid) returns public.connections language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();result public.connections;
begin
  if actor is null then raise exception 'Authentication required' using errcode='28000';end if;
  if target is null or actor=target then raise exception 'Choose another builder' using errcode='22023';end if;
  if not exists(select 1 from public.profiles where id=target) then raise exception 'Builder not found' using errcode='P0002';end if;
  insert into public.connections(sender_id,recipient_id) values(actor,target) on conflict(user_low,user_high) do nothing;
  select * into strict result from public.connections where user_low=least(actor,target) and user_high=greatest(actor,target);
  return result;
end;$$;
create function public.accept_connection(request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();request public.connections;conversation uuid;
begin
  if actor is null then raise exception 'Authentication required' using errcode='28000';end if;
  select * into request from public.connections where id=request_id for update;
  if not found or request.recipient_id<>actor then raise exception 'Connection request not found' using errcode='P0002';end if;
  if request.status='declined' then raise exception 'Request was declined' using errcode='22023';end if;
  insert into public.conversations(participant_low,participant_high) values(request.user_low,request.user_high) on conflict(participant_low,participant_high) do update set participant_low=excluded.participant_low returning id into conversation;
  insert into public.conversation_members(conversation_id,user_id) values(conversation,request.sender_id),(conversation,request.recipient_id) on conflict do nothing;
  update public.connections set status='accepted',conversation_id=conversation where id=request.id;
  return conversation;
end;$$;
create function public.decline_connection(request_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();request public.connections;
begin
  if actor is null then raise exception 'Authentication required' using errcode='28000';end if;
  select * into request from public.connections where id=request_id for update;
  if not found or request.recipient_id<>actor then raise exception 'Request not found' using errcode='P0002';end if;
  if request.status='accepted' then raise exception 'Connection already accepted' using errcode='22023';end if;
  update public.connections set status='declined' where id=request.id;
end;$$;
revoke all on function public.request_connection(uuid),public.accept_connection(uuid),public.decline_connection(uuid) from public,anon;
grant execute on function public.request_connection(uuid),public.accept_connection(uuid),public.decline_connection(uuid) to authenticated;

-- One bounded counter per actor/resource. Deleting content cannot reset the limit.
create table private.write_limits (
  actor_id uuid not null references auth.users(id) on delete cascade,
  resource text not null,
  window_started timestamptz not null,
  write_count integer not null,
  primary key(actor_id,resource)
);
revoke all on private.write_limits from public,anon,authenticated;
create function private.limit_content_writes() returns trigger language plpgsql security definer set search_path='' as $$
declare actor uuid;write_limit integer;recorded integer;instant timestamptz:=clock_timestamp();
begin
  actor:=auth.uid();if actor is null then return new;end if;
  write_limit:=case when tg_table_name='messages' then 40 when tg_table_name='comments' then 20 when tg_table_name='connections' then 15 else 10 end;
  insert into private.write_limits(actor_id,resource,window_started,write_count) values(actor,tg_table_name,instant,1)
  on conflict(actor_id,resource) do update set
    write_count=case when private.write_limits.window_started<=instant-interval '1 minute' then 1 else private.write_limits.write_count+1 end,
    window_started=case when private.write_limits.window_started<=instant-interval '1 minute' then instant else private.write_limits.window_started end
  where private.write_limits.window_started<=instant-interval '1 minute' or private.write_limits.write_count<write_limit
  returning write_count into recorded;
  if not found then raise exception 'Please wait before posting again' using errcode='P0001';end if;
  return new;
end;$$;
revoke all on function private.limit_content_writes() from public;
create trigger posts_rate_limit before insert on public.posts for each row execute function private.limit_content_writes();
create trigger projects_rate_limit before insert on public.projects for each row execute function private.limit_content_writes();
create trigger comments_rate_limit before insert on public.comments for each row execute function private.limit_content_writes();
create trigger messages_rate_limit before insert on public.messages for each row execute function private.limit_content_writes();
create trigger connections_rate_limit before insert on public.connections for each row execute function private.limit_content_writes();
commit;
