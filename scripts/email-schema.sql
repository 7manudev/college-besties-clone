create table if not exists public.email_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'besties-site',
  age_confirmed boolean not null default true,
  ip_hash text,
  created_at timestamptz not null default now()
);

create unique index if not exists email_signups_email_unique
  on public.email_signups (lower(email));

create index if not exists email_signups_ip_created_idx
  on public.email_signups (ip_hash, created_at desc);

alter table public.email_signups enable row level security;