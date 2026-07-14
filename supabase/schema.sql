create table if not exists public.weekly_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  revenue numeric not null default 0,
  clients integer not null default 0,
  hours numeric not null default 0,
  rebooked integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);
alter table public.weekly_metrics enable row level security;
create policy "Users manage their own metrics" on public.weekly_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
