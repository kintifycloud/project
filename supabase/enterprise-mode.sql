alter table public.profiles
  add column if not exists active_organization_id uuid;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_active_organization_id_fkey;

alter table public.profiles
  add constraint profiles_active_organization_id_fkey
  foreign key (active_organization_id)
  references public.organizations (id)
  on delete set null;

alter table public.teams
  add column if not exists organization_id uuid references public.organizations (id) on delete set null;

alter table public.incidents
  add column if not exists organization_id uuid references public.organizations (id) on delete set null;

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('admin', 'engineer', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  team_id uuid references public.teams (id) on delete cascade,
  incident_id uuid references public.incidents (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  user_email text not null default '',
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_teams_organization_id on public.teams (organization_id);
create index if not exists idx_incidents_organization_id on public.incidents (organization_id, created_at desc);
create index if not exists idx_organization_members_user_id on public.organization_members (user_id);
create index if not exists idx_audit_logs_organization_id on public.audit_logs (organization_id, created_at desc);
create index if not exists idx_audit_logs_incident_id on public.audit_logs (incident_id, created_at asc);

create or replace trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_row_updated_at();

create or replace trigger audit_logs_set_updated_at
before update on public.audit_logs
for each row
execute function public.set_row_updated_at();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.audit_logs enable row level security;

create policy organizations_member_select
on public.organizations
for select
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
  )
);

create policy organizations_owner_insert
on public.organizations
for insert
with check (owner_id = auth.uid());

create policy organizations_admin_update
on public.organizations
for update
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'admin'
  )
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'admin'
  )
);

create policy organization_members_member_select
on public.organization_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.organization_members as memberships
    where memberships.organization_id = organization_members.organization_id
      and memberships.user_id = auth.uid()
  )
);

create policy organization_members_admin_insert
on public.organization_members
for insert
with check (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.organization_members as memberships
    where memberships.organization_id = organization_members.organization_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'admin'
  )
);

create policy organization_members_admin_update
on public.organization_members
for update
using (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.organization_members as memberships
    where memberships.organization_id = organization_members.organization_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.organization_members as memberships
    where memberships.organization_id = organization_members.organization_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'admin'
  )
);

create policy audit_logs_member_select
on public.audit_logs
for select
using (
  organization_id is null
  or exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = audit_logs.organization_id
      and organization_members.user_id = auth.uid()
  )
);

create policy audit_logs_member_insert
on public.audit_logs
for insert
with check (
  user_id = auth.uid()
  and organization_id is not null
  and exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = audit_logs.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('admin', 'engineer')
  )
);

create policy audit_logs_member_update
on public.audit_logs
for update
using (
  exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = audit_logs.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = audit_logs.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'admin'
  )
);
