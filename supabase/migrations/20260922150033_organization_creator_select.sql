drop policy "organizations_select_member" on public.organizations;

create policy "organizations_select_member_or_creator"
on public.organizations for select
to authenticated
using (
  (select auth.uid()) = created_by
  or (select private.is_organization_member(id))
);
