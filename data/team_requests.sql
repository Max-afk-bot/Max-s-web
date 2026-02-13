create table if not exists public.team_requests (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  discord_username text,
  discord_user_id text,
  role text,
  experience text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_team_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_team_requests_updated_at on public.team_requests;
create trigger trg_team_requests_updated_at
before update on public.team_requests
for each row execute function public.touch_team_requests_updated_at();

alter table public.team_requests enable row level security;
