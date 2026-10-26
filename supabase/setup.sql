-- Run once in the SQL Editor of the intended Supabase project.
create table if not exists public.advisor_content (
  slug text primary key,
  payload jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint advisor_content_payload_object check (jsonb_typeof(payload) = 'object')
);
alter table public.advisor_content enable row level security;
revoke all on table public.advisor_content from anon, authenticated;
grant select, insert, update on table public.advisor_content to service_role;

-- Only server credentials may write. Images are public like the profile pages.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('advisor-media', 'advisor-media', true, 10485760, array['image/webp'])
on conflict (id) do nothing;
