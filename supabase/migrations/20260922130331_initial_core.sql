create schema if not exists private;

create type public.organization_role as enum ('business_owner', 'platform_admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  industry text not null check (industry in ('real_estate', 'automotive', 'food')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.organization_role not null default 'business_owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.brand_kits (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  logo_asset_id uuid,
  primary_color text,
  secondary_color text,
  contact_name text,
  contact_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organization_members_user_id_idx
  on public.organization_members (user_id);

create function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.organization_members
      where organization_id = target_organization_id
        and user_id = (select auth.uid())
    );
$$;

create function private.is_organization_creator(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organizations
    where id = target_organization_id
      and created_by = (select auth.uid())
  );
$$;

revoke all on function private.is_organization_member(uuid) from public;
revoke all on function private.is_organization_creator(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.is_organization_creator(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.brand_kits enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "organizations_select_member"
on public.organizations for select
to authenticated
using ((select private.is_organization_member(id)));

create policy "organizations_insert_creator"
on public.organizations for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy "organizations_update_member"
on public.organizations for update
to authenticated
using ((select private.is_organization_member(id)))
with check ((select private.is_organization_member(id)));

create policy "organization_members_select_member"
on public.organization_members for select
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy "organization_members_insert_creator"
on public.organization_members for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_organization_creator(organization_id))
);

create policy "brand_kits_select_member"
on public.brand_kits for select
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy "brand_kits_insert_member"
on public.brand_kits for insert
to authenticated
with check ((select private.is_organization_member(organization_id)));

create policy "brand_kits_update_member"
on public.brand_kits for update
to authenticated
using ((select private.is_organization_member(organization_id)))
with check ((select private.is_organization_member(organization_id)));
