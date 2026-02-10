create table if not exists public.admin_system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_admin_system_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_admin_system_settings_updated_at on public.admin_system_settings;
create trigger trg_admin_system_settings_updated_at
before update on public.admin_system_settings
for each row execute function public.touch_admin_system_settings_updated_at();

alter table public.admin_system_settings enable row level security;
