alter table public.gaming_weekly_reports
  add column if not exists mode_skywars integer not null default 0 check (mode_skywars >= 0),
  add column if not exists mode_bedwars integer not null default 0 check (mode_bedwars >= 0),
  add column if not exists mode_hardcore integer not null default 0 check (mode_hardcore >= 0),
  add column if not exists mode_speedrun integer not null default 0 check (mode_speedrun >= 0),
  add column if not exists mode_pvp integer not null default 0 check (mode_pvp >= 0),
  add column if not exists mode_build integer not null default 0 check (mode_build >= 0);
