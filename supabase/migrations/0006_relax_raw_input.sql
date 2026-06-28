-- The legacy projects.raw_input column (from 0001_init) is NOT NULL, but the
-- V2 flow stores the actual text in the scripts table instead. Drop the
-- not-null constraint so project creation no longer requires it.
alter table public.projects alter column raw_input drop not null;
