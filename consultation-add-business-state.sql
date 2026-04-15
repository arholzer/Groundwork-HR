-- Add business location (US state) for existing consultation_submissions tables.
-- Run in the Supabase SQL editor for the GroundWork HR project.

alter table public.consultation_submissions
  add column if not exists business_state text;
