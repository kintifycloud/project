create extension if not exists pgcrypto;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text,
  active_team_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_active_team_id_fkey;

alter table public.profiles
  add constraint profiles_active_team_id_fkey
  foreign key (active_team_id)
  references public.teams (id)
  on delete set null;

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  email text,
  token text not null unique,
  role text not null default 'member' check (role in ('owner', 'member')),
  accepted_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_by_email text not null,
  input text not null,
  output text not null,
  trace text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_team_members_user_id on public.team_members (user_id);
create index if not exists idx_team_invites_team_id on public.team_invites (team_id);
create index if not exists idx_team_invites_token on public.team_invites (token);
create index if not exists idx_incidents_team_created_at on public.incidents (team_id, created_at desc);
create index if not exists idx_incidents_personal_created_at on public.incidents (created_by, created_at desc) where team_id is null;

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_row_updated_at();

create or replace trigger teams_set_updated_at
before update on public.teams
for each row
execute function public.set_row_updated_at();

create or replace trigger team_invites_set_updated_at
before update on public.team_invites
for each row
execute function public.set_row_updated_at();

create or replace trigger incidents_set_updated_at
before update on public.incidents
for each row
execute function public.set_row_updated_at();

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;
alter table public.incidents enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists teams_member_select on public.teams;
create policy teams_member_select
on public.teams
for select
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.team_members
    where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
  )
);

drop policy if exists teams_owner_insert on public.teams;
create policy teams_owner_insert
on public.teams
for insert
with check (owner_id = auth.uid());

drop policy if exists teams_owner_update on public.teams;
create policy teams_owner_update
on public.teams
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists team_members_member_select on public.team_members;
create policy team_members_member_select
on public.team_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.team_members as memberships
    where memberships.team_id = team_members.team_id
      and memberships.user_id = auth.uid()
  )
);

drop policy if exists team_members_owner_insert on public.team_members;
create policy team_members_owner_insert
on public.team_members
for insert
with check (
  exists (
    select 1
    from public.teams
    where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
  )
  or (
    user_id = auth.uid()
    and exists (
      select 1
      from public.team_invites
      where team_invites.team_id = team_members.team_id
        and team_invites.accepted_at is null
        and (
          team_invites.email is null
          or team_invites.email = (
            select profiles.email
            from public.profiles
            where profiles.id = auth.uid()
          )
        )
        and (
          team_invites.expires_at is null
          or team_invites.expires_at > now()
        )
    )
  )
);

drop policy if exists team_members_owner_update on public.team_members;
create policy team_members_owner_update
on public.team_members
for update
using (
  exists (
    select 1
    from public.teams
    where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.teams
    where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
  )
);

drop policy if exists team_members_owner_delete on public.team_members;
create policy team_members_owner_delete
on public.team_members
for delete
using (
  exists (
    select 1
    from public.teams
    where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
  )
  or user_id = auth.uid()
);

drop policy if exists team_invites_owner_select on public.team_invites;
create policy team_invites_owner_select
on public.team_invites
for select
using (
  exists (
    select 1
    from public.teams
    where teams.id = team_invites.team_id
      and teams.owner_id = auth.uid()
  )
  or (
    accepted_at is null
    and (
      email is null
      or email = (
        select profiles.email
        from public.profiles
        where profiles.id = auth.uid()
      )
    )
  )
);

drop policy if exists team_invites_owner_insert on public.team_invites;
create policy team_invites_owner_insert
on public.team_invites
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.teams
    where teams.id = team_invites.team_id
      and teams.owner_id = auth.uid()
  )
);

drop policy if exists team_invites_owner_update on public.team_invites;
create policy team_invites_owner_update
on public.team_invites
for update
using (
  exists (
    select 1
    from public.teams
    where teams.id = team_invites.team_id
      and teams.owner_id = auth.uid()
  )
  or (
    accepted_at is null
    and (
      email is null
      or email = (
        select profiles.email
        from public.profiles
        where profiles.id = auth.uid()
      )
    )
  )
)
with check (
  exists (
    select 1
    from public.teams
    where teams.id = team_invites.team_id
      and teams.owner_id = auth.uid()
  )
  or accepted_by = auth.uid()
);

drop policy if exists incidents_workspace_select on public.incidents;
create policy incidents_workspace_select
on public.incidents
for select
using (
  (team_id is null and created_by = auth.uid())
  or exists (
    select 1
    from public.team_members
    where team_members.team_id = incidents.team_id
      and team_members.user_id = auth.uid()
  )
);

drop policy if exists incidents_workspace_insert on public.incidents;
create policy incidents_workspace_insert
on public.incidents
for insert
with check (
  created_by = auth.uid()
  and (
    team_id is null
    or exists (
      select 1
      from public.team_members
      where team_members.team_id = incidents.team_id
        and team_members.user_id = auth.uid()
    )
  )
);

drop policy if exists incidents_workspace_update on public.incidents;
create policy incidents_workspace_update
on public.incidents
for update
using (
  (team_id is null and created_by = auth.uid())
  or exists (
    select 1
    from public.team_members
    where team_members.team_id = incidents.team_id
      and team_members.user_id = auth.uid()
  )
)
with check (
  (team_id is null and created_by = auth.uid())
  or exists (
    select 1
    from public.team_members
    where team_members.team_id = incidents.team_id
      and team_members.user_id = auth.uid()
  )
);
