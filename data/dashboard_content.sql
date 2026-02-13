create table if not exists public.dashboard_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_dashboard_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_dashboard_content_updated_at on public.dashboard_content;
create trigger trg_dashboard_content_updated_at
before update on public.dashboard_content
for each row execute function public.touch_dashboard_content_updated_at();

alter table public.dashboard_content enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dashboard_content'
      and policyname = 'dashboard_content_public_read'
  ) then
    create policy dashboard_content_public_read
      on public.dashboard_content
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dashboard_content'
      and policyname = 'dashboard_content_admin_insert'
  ) then
    create policy dashboard_content_admin_insert
      on public.dashboard_content
      for insert
      to authenticated
      with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dashboard_content'
      and policyname = 'dashboard_content_admin_update'
  ) then
    create policy dashboard_content_admin_update
      on public.dashboard_content
      for update
      to authenticated
      using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com')
      with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dashboard_content'
      and policyname = 'dashboard_content_admin_delete'
  ) then
    create policy dashboard_content_admin_delete
      on public.dashboard_content
      for delete
      to authenticated
      using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;
end
$$;
