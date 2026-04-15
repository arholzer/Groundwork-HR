-- Run once if you already created `consultation_submissions` without a `status` column.
-- Supabase → SQL Editor → paste → Run

alter table public.consultation_submissions
  add column if not exists status text not null default 'new';

update public.consultation_submissions
set status = 'new'
where status is null
   or trim(status) = ''
   or status not in ('new', 'archived', 'deleted');

alter table public.consultation_submissions
  drop constraint if exists consultation_submissions_status_check;

alter table public.consultation_submissions
  add constraint consultation_submissions_status_check
  check (status in ('new', 'archived', 'deleted'));

drop policy if exists "Allow update consultation_submissions" on public.consultation_submissions;
create policy "Allow update consultation_submissions"
  on public.consultation_submissions
  for update
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update on public.consultation_submissions to anon, authenticated;
