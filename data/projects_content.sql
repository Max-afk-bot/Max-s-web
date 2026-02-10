create table if not exists public.projects_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_projects_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_projects_content_updated_at on public.projects_content;
create trigger trg_projects_content_updated_at
before update on public.projects_content
for each row execute function public.touch_projects_content_updated_at();

alter table public.projects_content enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'projects_content'
      and policyname = 'projects_content_public_read'
  ) then
    create policy projects_content_public_read
      on public.projects_content
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'projects_content'
      and policyname = 'projects_content_admin_insert'
  ) then
    create policy projects_content_admin_insert
      on public.projects_content
      for insert
      to authenticated
      with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'projects_content'
      and policyname = 'projects_content_admin_update'
  ) then
    create policy projects_content_admin_update
      on public.projects_content
      for update
      to authenticated
      using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com')
      with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'projects_content'
      and policyname = 'projects_content_admin_delete'
  ) then
    create policy projects_content_admin_delete
      on public.projects_content
      for delete
      to authenticated
      using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;
end
$$;
