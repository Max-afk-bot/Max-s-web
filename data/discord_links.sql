create table if not exists public.discord_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  discord_user_id text unique not null,
  discord_username text,
  discord_avatar text,
  discord_roles text[] not null default '{}',
  is_in_guild boolean not null default false,
  linked_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_discord_links_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_discord_links_updated_at on public.discord_links;
create trigger trg_discord_links_updated_at
before update on public.discord_links
for each row execute function public.touch_discord_links_updated_at();

alter table public.discord_links enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'discord_links'
      and policyname = 'discord_links_select_own'
  ) then
    create policy discord_links_select_own
      on public.discord_links
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'discord_links'
      and policyname = 'discord_links_insert_own'
  ) then
    create policy discord_links_insert_own
      on public.discord_links
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'discord_links'
      and policyname = 'discord_links_update_own'
  ) then
    create policy discord_links_update_own
      on public.discord_links
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;
