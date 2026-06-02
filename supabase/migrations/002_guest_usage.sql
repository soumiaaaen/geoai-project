-- Daily analysis quota for anonymous demo users
create table if not exists public.guest_usage (
  guest_id uuid not null,
  day date not null default (timezone('utc', now()))::date,
  analysis_count int not null default 0 check (analysis_count >= 0),
  primary key (guest_id, day)
);

create index if not exists guest_usage_day_idx on public.guest_usage (day);

alter table public.guest_usage enable row level security;

-- Backend service role only (no client access)
create policy "guest_usage_service_only"
  on public.guest_usage
  for all
  using (false)
  with check (false);
