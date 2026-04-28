-- Evaluation System for /fix Output Quality Tracking
-- This schema enables continuous improvement through automatic scoring and feedback

create extension if not exists pgcrypto;

-- Evaluation records table
create table if not exists public.evaluation_records (
  id uuid primary key default gen_random_uuid(),
  input text not null,
  output text not null,
  model_used text not null, -- gemini, deepseek, mistral, openrouter, fallback
  is_valid boolean not null default false,
  score integer not null check (score >= 0 and score <= 100),
  user_feedback boolean, -- null = no feedback, true = 👍, false = 👎
  input_cluster_id uuid, -- For grouping similar inputs
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Input clusters for grouping similar issues
create table if not exists public.input_clusters (
  id uuid primary key default gen_random_uuid(),
  cluster_name text not null,
  cluster_pattern text not null, -- Pattern that matches this cluster
  best_score integer default 0,
  best_output_id uuid references public.evaluation_records(id) on delete set null,
  total_evaluations integer default 0,
  success_rate numeric(5,2) default 0, -- Percentage
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Model performance tracking
create table if not exists public.model_performance (
  id uuid primary key default gen_random_uuid(),
  model_name text not null unique,
  total_requests integer default 0,
  successful_requests integer default 0, -- user_feedback = true
  failed_requests integer default 0, -- user_feedback = false
  avg_score numeric(5,2) default 0,
  success_rate numeric(5,2) default 0,
  priority_weight numeric(5,2) default 1.0, -- Higher = more likely to be used
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Response cache for repeated issues
create table if not exists public.response_cache (
  id uuid primary key default gen_random_uuid(),
  input_hash text not null unique, -- Hash of normalized input
  input text not null,
  output text not null,
  model_used text not null,
  score integer not null,
  hit_count integer default 0,
  last_hit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_evaluation_records_model_created on public.evaluation_records (model_used, created_at desc);
create index if not exists idx_evaluation_records_score on public.evaluation_records (score desc);
create index if not exists idx_evaluation_records_cluster on public.evaluation_records (input_cluster_id);
create index if not exists idx_evaluation_records_feedback on public.evaluation_records (user_feedback) where user_feedback is not null;
create index if not exists idx_input_clusters_pattern on public.input_clusters (cluster_pattern);
create index if not exists idx_input_clusters_success_rate on public.input_clusters (success_rate desc);
create index if not exists idx_model_performance_priority on public.model_performance (priority_weight desc);
create index if not exists idx_response_cache_hash on public.response_cache (input_hash);
create index if not exists idx_response_cache_hits on public.response_cache (hit_count desc);

-- Triggers for updated_at
create or replace trigger evaluation_records_set_updated_at
before update on public.evaluation_records
for each row
execute function public.set_row_updated_at();

create or replace trigger input_clusters_set_updated_at
before update on public.input_clusters
for each row
execute function public.set_row_updated_at();

create or replace trigger response_cache_set_updated_at
before update on public.response_cache
for each row
execute function public.set_row_updated_at();

-- Enable RLS
alter table public.evaluation_records enable row level security;
alter table public.input_clusters enable row level security;
alter table public.model_performance enable row level security;
alter table public.response_cache enable row level security;

-- Policies: Evaluation records are insert-only from API, read-only for admins
drop policy if exists evaluation_records_api_insert on public.evaluation_records;
create policy evaluation_records_api_insert
on public.evaluation_records
for insert
with check (true);

drop policy if exists evaluation_records_admin_select on public.evaluation_records;
create policy evaluation_records_admin_select
on public.evaluation_records
for select
using (true);

-- Policies: Input clusters are managed by system
drop policy if exists input_clusters_system_insert on public.input_clusters;
create policy input_clusters_system_insert
on public.input_clusters
for insert
with check (true);

drop policy if exists input_clusters_system_select on public.input_clusters;
create policy input_clusters_system_select
on public.input_clusters
for select
using (true);

-- Policies: Model performance is managed by system
drop policy if exists model_performance_system_insert on public.model_performance;
create policy model_performance_system_insert
on public.model_performance
for insert
with check (true);

drop policy if exists model_performance_system_select on public.model_performance;
create policy model_performance_system_select
on public.model_performance
for select
using (true);

-- Policies: Response cache is managed by system
drop policy if exists response_cache_system_insert on public.response_cache;
create policy response_cache_system_insert
on public.response_cache
for insert
with check (true);

drop policy if exists response_cache_system_select on public.response_cache;
create policy response_cache_system_select
on public.response_cache
for select
using (true);

-- Initialize model performance records
insert into public.model_performance (model_name, priority_weight)
values 
  ('gemini', 1.0),
  ('deepseek', 0.9),
  ('mistral', 0.8),
  ('openrouter', 0.7),
  ('fallback', 0.5)
on conflict (model_name) do nothing;

-- Function to update model performance stats
create or replace function public.update_model_performance(
  p_model_name text,
  p_score integer,
  p_feedback boolean
)
returns void
language plpgsql
as $$
declare
  v_current record;
begin
  select * into v_current 
  from public.model_performance 
  where model_name = p_model_name
  for update;

  if not found then
    insert into public.model_performance (model_name, total_requests, successful_requests, failed_requests, avg_score, success_rate, priority_weight)
    values (p_model_name, 1, 
      case when p_feedback = true then 1 else 0 end,
      case when p_feedback = false then 1 else 0 end,
      p_score::numeric,
      case when p_feedback is not null then (case when p_feedback = true then 100.0 else 0.0 end) else null end,
      1.0);
  else
    update public.model_performance
    set 
      total_requests = total_requests + 1,
      successful_requests = successful_requests + case when p_feedback = true then 1 else 0 end,
      failed_requests = failed_requests + case when p_feedback = false then 1 else 0 end,
      avg_score = ((avg_score * (total_requests - 1)) + p_score) / total_requests::numeric,
      success_rate = case 
        when (successful_requests + failed_requests) > 0 
        then (successful_requests::numeric / (successful_requests + failed_requests)::numeric) * 100 
        else null 
      end,
      priority_weight = case 
        when success_rate >= 70 then 1.0
        when success_rate >= 50 then 0.8
        when success_rate >= 30 then 0.6
        else 0.4
      end,
      last_updated = now()
    where model_name = p_model_name;
  end if;
end;
$$;

-- Function to find or create input cluster
create or replace function public.find_or_create_cluster(
  p_input text,
  p_score integer
)
returns uuid
language plpgsql
as $$
declare
  v_cluster_id uuid;
  v_pattern text;
begin
  -- Simple clustering: check for keyword matches
  -- This is a basic implementation; can be enhanced with embeddings
  if p_input ilike '%api%' or p_input ilike '%latency%' or p_input ilike '%slow%' then
    v_pattern := 'api-latency';
  elsif p_input ilike '%kubernetes%' or p_input ilike '%k8s%' or p_input ilike '%crashloop%' then
    v_pattern := 'kubernetes-crash';
  elsif p_input ilike '%docker%' or p_input ilike '%container%' then
    v_pattern := 'docker-container';
  elsif p_input ilike '%ssl%' or p_input ilike '%tls%' or p_input ilike '%cert%' then
    v_pattern := 'ssl-tls';
  elsif p_input ilike '%dns%' or p_input ilike '%resolve%' then
    v_pattern := 'dns-resolution';
  elsif p_input ilike '%database%' or p_input ilike '%db%' or p_input ilike '%query%' then
    v_pattern := 'database';
  else
    v_pattern := 'general';
  end if;

  -- Try to find existing cluster
  select id into v_cluster_id
  from public.input_clusters
  where cluster_pattern = v_pattern
  limit 1;

  if not found then
    insert into public.input_clusters (cluster_name, cluster_pattern, best_score, total_evaluations)
    values (v_pattern, v_pattern, p_score, 1)
    returning id into v_cluster_id;
  else
    -- Update cluster stats
    update public.input_clusters
    set 
      best_score = greatest(best_score, p_score),
      total_evaluations = total_evaluations + 1,
      updated_at = now()
    where id = v_cluster_id
    returning id into v_cluster_id;
  end if;

  return v_cluster_id;
end;
$$;
