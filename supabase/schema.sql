-- EcoQuest Bhutan Supabase schema
-- Run this in Supabase Dashboard > SQL Editor after creating your project.

create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  campus text not null default 'CST Campus',
  level int not null default 1,
  eco_points int not null default 0,
  rank int,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  user_id text not null unique,
  team_id uuid references public.teams(id) on delete set null,
  name text not null,
  email text unique,
  phone text,
  campus text,
  role text not null default 'user' check (role in ('user', 'admin')),
  level int not null default 1,
  eco_points int not null default 0,
  streak_days int not null default 0,
  current_rank int,
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null unique,
  title text not null,
  description text not null,
  proof_type text not null check (proof_type in ('photo', 'smart_bin', 'quiz', 'peer_vote')),
  points_value int not null default 0,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  cadence text not null default 'daily' check (cadence in ('daily', 'weekly', 'event')),
  category text not null default 'recycling',
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  deadline timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.smart_bins (
  id uuid primary key default gen_random_uuid(),
  bin_id text not null unique,
  location_name text not null,
  fill_level_pct int not null default 0 check (fill_level_pct between 0 and 100),
  battery_level_pct int not null default 100 check (battery_level_pct between 0 and 100),
  is_full boolean not null default false,
  online boolean not null default true,
  total_deposits int not null default 0,
  user_id_last text,
  last_deposit_at timestamptz,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null unique,
  user_id text not null references public.profiles(user_id) on delete cascade,
  challenge_id text not null references public.challenges(challenge_id) on delete cascade,
  proof_url text,
  ai_label text,
  ai_confidence numeric(5,4),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  rejection_reason text,
  submitted_at timestamptz not null default now()
);

create table if not exists public.detections (
  id uuid primary key default gen_random_uuid(),
  bin_id text references public.smart_bins(bin_id) on delete set null,
  user_id text references public.profiles(user_id) on delete set null,
  submission_id text references public.submissions(submission_id) on delete set null,
  image_url text,
  waste_label text not null,
  confidence numeric(5,4) not null,
  fill_level_pct int check (fill_level_pct between 0 and 100),
  status text not null default 'not_full' check (status in ('not_full', 'full', 'review_needed')),
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  badge_id text not null unique,
  name text not null,
  description text not null,
  category text not null,
  points_required int not null default 0,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_badges (
  profile_user_id text references public.profiles(user_id) on delete cascade,
  badge_id text references public.badges(badge_id) on delete cascade,
  unlocked boolean not null default false,
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  unlocked_at timestamptz,
  primary key (profile_user_id, badge_id)
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  reward_id text not null unique,
  title text not null,
  description text not null,
  cost_points int not null default 0,
  stock int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.campus_insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  severity text not null default 'info' check (severity in ('info', 'success', 'warning')),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('proof-images', 'proof-images', false)
on conflict (id) do nothing;

alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.smart_bins enable row level security;
alter table public.submissions enable row level security;
alter table public.detections enable row level security;
alter table public.badges enable row level security;
alter table public.profile_badges enable row level security;
alter table public.rewards enable row level security;
alter table public.campus_insights enable row level security;

drop policy if exists "Authenticated users can read teams" on public.teams;
create policy "Authenticated users can read teams"
on public.teams for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read challenges" on public.challenges;
create policy "Authenticated users can read challenges"
on public.challenges for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read smart bins" on public.smart_bins;
create policy "Authenticated users can read smart bins"
on public.smart_bins for select
to authenticated
using (true);

drop policy if exists "Users can read their submissions" on public.submissions;
create policy "Users can read their submissions"
on public.submissions for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = submissions.user_id
    and profiles.auth_user_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles
    where profiles.auth_user_id = auth.uid()
    and profiles.role = 'admin'
  )
);

drop policy if exists "Users can read their detections" on public.detections;
create policy "Users can read their detections"
on public.detections for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = detections.user_id
    and profiles.auth_user_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles
    where profiles.auth_user_id = auth.uid()
    and profiles.role = 'admin'
  )
);

drop policy if exists "Authenticated users can read badges" on public.badges;
create policy "Authenticated users can read badges"
on public.badges for select
to authenticated
using (true);

drop policy if exists "Users can read badge progress" on public.profile_badges;
create policy "Users can read badge progress"
on public.profile_badges for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = profile_badges.profile_user_id
    and profiles.auth_user_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles
    where profiles.auth_user_id = auth.uid()
    and profiles.role = 'admin'
  )
);

drop policy if exists "Authenticated users can read rewards" on public.rewards;
create policy "Authenticated users can read rewards"
on public.rewards for select
to authenticated
using (active = true);

drop policy if exists "Authenticated users can read campus insights" on public.campus_insights;
create policy "Authenticated users can read campus insights"
on public.campus_insights for select
to authenticated
using (true);

drop policy if exists "Users can upload proof images" on storage.objects;
create policy "Users can upload proof images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'proof-images');

drop policy if exists "Users can read proof images" on storage.objects;
create policy "Users can read proof images"
on storage.objects for select
to authenticated
using (bucket_id = 'proof-images');
