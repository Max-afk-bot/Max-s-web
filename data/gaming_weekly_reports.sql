create table if not exists public.gaming_weekly_reports (
  id bigint generated always as identity primary key,
  week_label text not null unique,
  period_start date not null,
  period_end date not null,
  matches_played integer not null default 0 check (matches_played >= 0),
  wins integer not null default 0 check (wins >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  attack integer not null default 0 check (attack between 0 and 100),
  defense integer not null default 0 check (defense between 0 and 100),
  loss_rate integer not null default 0 check (loss_rate between 0 and 100),
  strategies integer not null default 0 check (strategies between 0 and 100),
  mid_game_skill_use integer not null default 0 check (mid_game_skill_use between 0 and 100),
  mode_skywars integer not null default 0 check (mode_skywars >= 0),
  mode_bedwars integer not null default 0 check (mode_bedwars >= 0),
  mode_hardcore integer not null default 0 check (mode_hardcore >= 0),
  mode_speedrun integer not null default 0 check (mode_speedrun >= 0),
  mode_pvp integer not null default 0 check (mode_pvp >= 0),
  mode_build integer not null default 0 check (mode_build >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_gaming_weekly_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_gaming_weekly_reports_updated_at on public.gaming_weekly_reports;
create trigger trg_gaming_weekly_reports_updated_at
before update on public.gaming_weekly_reports
for each row execute function public.touch_gaming_weekly_reports_updated_at();

alter table public.gaming_weekly_reports enable row level security;
