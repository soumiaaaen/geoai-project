-- HydroSight subscription: profiles + monthly usage
-- Safe if public.profiles already exists (adds missing columns).

-- ── profiles (create minimal table, then add subscription columns) ──
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key
);

alter table public.profiles add column if not exists plan text default 'free';
alter table public.profiles add column if not exists plan_expires_at timestamptz;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

update public.profiles set plan = 'free' where plan is null;

alter table public.profiles alter column plan set default 'free';
alter table public.profiles alter column plan set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_plan_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_plan_check
      check (plan in ('free', 'pro', 'premium'));
  end if;
end $$;

-- ── usage_monthly ──
create table if not exists public.usage_monthly (
  user_id uuid references auth.users on delete cascade not null,
  year_month text not null,
  analysis_count int not null default 0 check (analysis_count >= 0),
  primary key (user_id, year_month)
);

create index if not exists idx_usage_monthly_user on public.usage_monthly (user_id);

-- ── auto-create profile on signup ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, plan)
  values (new.id, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill: only insert users missing a profile row
insert into public.profiles (id, plan)
select u.id, 'free'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- ── RLS ──
alter table public.profiles enable row level security;
alter table public.usage_monthly enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users read own usage" on public.usage_monthly;
create policy "Users read own usage"
  on public.usage_monthly for select
  using (auth.uid() = user_id);

-- Service role (backend) bypasses RLS for writes to usage_monthly
