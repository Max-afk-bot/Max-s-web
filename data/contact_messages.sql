create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  subject text,
  topic text,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
