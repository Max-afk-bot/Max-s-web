create table if not exists public.about_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_about_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_about_content_updated_at on public.about_content;
create trigger trg_about_content_updated_at
before update on public.about_content
for each row execute function public.touch_about_content_updated_at();

alter table public.about_content enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'about_content'
      and policyname = 'about_content_public_read'
  ) then
    create policy about_content_public_read
      on public.about_content
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'about_content'
      and policyname = 'about_content_admin_insert'
  ) then
    create policy about_content_admin_insert
      on public.about_content
      for insert
      to authenticated
      with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'about_content'
      and policyname = 'about_content_admin_update'
  ) then
    create policy about_content_admin_update
      on public.about_content
      for update
      to authenticated
      using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com')
      with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'about_content'
      and policyname = 'about_content_admin_delete'
  ) then
    create policy about_content_admin_delete
      on public.about_content
      for delete
      to authenticated
      using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'manishacc2009@gmail.com');
  end if;
end
$$;
