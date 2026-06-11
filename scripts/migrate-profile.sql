alter table public.email_signups
  add column if not exists creator_name text,
  add column if not exists profile_url text;

create index if not exists email_signups_creator_idx
  on public.email_signups (creator_name);