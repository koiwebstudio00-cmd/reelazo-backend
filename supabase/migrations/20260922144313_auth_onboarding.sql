create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by <> (select auth.uid()) then
    raise exception 'The organization creator must match the authenticated user';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.created_by, 'business_owner');

  return new;
end;
$$;

revoke all on function private.handle_new_organization() from public;

create trigger on_organization_created
  after insert on public.organizations
  for each row execute function private.handle_new_organization();

create policy "organizations_delete_creator"
on public.organizations for delete
to authenticated
using ((select auth.uid()) = created_by);

create policy "brand_kits_delete_member"
on public.brand_kits for delete
to authenticated
using ((select private.is_organization_member(organization_id)));
