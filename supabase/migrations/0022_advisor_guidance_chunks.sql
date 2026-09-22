-- Curated grounding corpus for the AI Advisor (audit item 5, July 2026).
-- Each row is one reviewable fact-chunk (statutory figures with their official
-- source URL and retrieval date). advisor-chat retrieves matching chunks per
-- turn via full-text search and instructs the model to treat them as the only
-- authoritative basis for statutory figures.
--
-- Content provenance: machine-curated from live official pages (Ontario.ca,
-- CNESST, Canada.ca) with an independent verification pass; `review_status`
-- stays 'machine_curated' until a human review flips it to 'reviewed'.
-- Retrieval intentionally does NOT filter on review_status — the operator
-- decides when/whether to gate on it.

create table public.advisor_guidance_chunks (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null check (jurisdiction in ('ON', 'QC', 'FED', 'ALL')),
  topic text not null,
  title text not null,
  content text not null,
  source_url text not null,
  source_name text not null,
  effective_note text,
  retrieved_at date not null,
  status text not null default 'active' check (status in ('active', 'retired')),
  review_status text not null default 'machine_curated'
    check (review_status in ('machine_curated', 'reviewed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  -- English config for stemming; chunks embed key French terms inline so
  -- French queries still match (bilingual columns are the phase-2 upgrade).
  fts tsvector generated always as (
    to_tsvector('english', title || ' ' || content)
  ) stored
);

create index advisor_guidance_chunks_fts_idx
  on public.advisor_guidance_chunks using gin (fts);

-- Service-role access only (advisor-chat): RLS on with no policies denies
-- anon/authenticated; the service role bypasses RLS. Same posture as the
-- other advisor-internal tables.
alter table public.advisor_guidance_chunks enable row level security;

-- Keep updated_at honest on manual review/retire updates (repo convention:
-- 0013 profiles, 0014 support tables) — freshness auditing is this
-- corpus's whole point.
create or replace function public.touch_advisor_guidance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end
$$;

create trigger advisor_guidance_chunks_touch_updated_at
  before update on public.advisor_guidance_chunks
  for each row execute function public.touch_advisor_guidance_updated_at();
