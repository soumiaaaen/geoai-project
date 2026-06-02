-- Run this ONLY if 001_plans.sql failed partway (profiles exists without plan column)

alter table public.profiles add column if not exists plan text default 'free';
alter table public.profiles add column if not exists plan_expires_at timestamptz;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

update public.profiles set plan = 'free' where plan is null;
alter table public.profiles alter column plan set not null;
alter table public.profiles alter column plan set default 'free';
