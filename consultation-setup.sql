-- GroundWork HR — consultation submissions table
-- Run in a DEDICATED Supabase project for this site only (new org/project).
-- Do not run against or reuse credentials from Route of Flight or other unrelated apps.
-- Supabase dashboard: SQL Editor → New query → paste → Run

create table if not exists public.consultation_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  business_name text not null,
  business_state text,
  phone_number text not null,
  email text not null,
  employee_count integer not null,
  service_type text not null,
  notes text,
  status text not null default 'new',
  constraint consultation_submissions_status_check
    check (status in ('new', 'archived', 'deleted'))
);

alter table public.consultation_submissions enable row level security;

drop policy if exists "Allow public insert consultation_submissions" on public.consultation_submissions;
create policy "Allow public insert consultation_submissions"
  on public.consultation_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public select consultation_submissions" on public.consultation_submissions;
create policy "Allow public select consultation_submissions"
  on public.consultation_submissions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow update consultation_submissions" on public.consultation_submissions;
create policy "Allow update consultation_submissions"
  on public.consultation_submissions
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Allow the browser anon key to change folder (inbox / archive / trash).
grant select, insert, update on public.consultation_submissions to anon, authenticated;

-- MVP: anon can read all rows so the admin page (using the anon key) can list them.
-- For production, replace the SELECT policy with server-side access or Supabase Auth.
