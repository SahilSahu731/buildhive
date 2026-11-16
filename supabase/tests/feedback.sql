-- Disposable database only; fixtures and helpers are rolled back.
begin;
create function private.feedback_test_error(statement text, expected text) returns void language plpgsql set search_path='' as $$
declare actual text;
begin
  begin execute statement;
  exception when others then get stacked diagnostics actual=returned_sqlstate;
  end;
  if actual is distinct from expected then raise exception 'Expected %, got %', expected, coalesce(actual,'success'); end if;
end;$$;
grant execute on function private.feedback_test_error(text,text) to authenticated,anon;
grant usage on schema private to anon;
insert into auth.users(id,email) values
  ('00000000-0000-4000-8000-000000000001','feedback-a@example.test'),
  ('00000000-0000-4000-8000-000000000002','feedback-b@example.test');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
insert into public.feedback(user_id,category,message,path) values(auth.uid(),'idea','A useful idea for the platform','/');
select private.feedback_test_error($q$select * from public.feedback$q$,'42501');
select private.feedback_test_error($q$update public.feedback set message='Changed report'$q$,'42501');
select private.feedback_test_error($q$insert into public.feedback(user_id,category,message,path) values('00000000-0000-4000-8000-000000000002','bug','Forged report by another user','/')$q$,'42501');
select private.feedback_test_error($q$insert into public.feedback(user_id,category,message,path) values(auth.uid(),'idea','short','/')$q$,'23514');
select private.feedback_test_error($q$insert into public.feedback(user_id,category,message,path,created_at) values(auth.uid(),'idea','Forged creation timestamp','/','2000-01-01')$q$,'42501');
insert into public.feedback(user_id,category,message,path) select auth.uid(),'idea','Rate test feedback '||n,'/' from generate_series(1,9) n;
select private.feedback_test_error($q$insert into public.feedback(user_id,category,message,path) values(auth.uid(),'idea','Rate limit must be enforced','/')$q$,'P0001');
reset role;
set local role anon;
select private.feedback_test_error($q$insert into public.feedback(user_id,category,message,path) values('00000000-0000-4000-8000-000000000001','idea','Anonymous feedback is forbidden','/')$q$,'42501');
rollback;
