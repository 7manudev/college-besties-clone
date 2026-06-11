create table if not exists public.email_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'besties-site',
  creator_name text,
  profile_url text,
  age_confirmed boolean not null default true,
  ip_hash text,
  created_at timestamptz not null default now()
);

create unique index if not exists email_signups_email_unique
  on public.email_signups (lower(email));

create index if not exists email_signups_created_idx
  on public.email_signups (created_at desc);

create index if not exists email_signups_creator_idx
  on public.email_signups (creator_name);

alter table public.email_signups enable row level security;