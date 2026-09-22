-- Migration: law monitoring tables
-- Tracks detected changes in Canadian employment legislation pages

CREATE TABLE IF NOT EXISTS law_updates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction   TEXT NOT NULL,
  law_name       TEXT NOT NULL,
  url            TEXT NOT NULL,
  content_hash   TEXT,
  change_summary TEXT,
  raw_diff       TEXT,
  detected_at    TIMESTAMPTZ DEFAULT timezone('utc', now()),
  is_new         BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS law_updates_detected_at_idx ON law_updates (detected_at DESC);

ALTER TABLE law_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read law updates" ON law_updates;
CREATE POLICY "Authenticated users can read law updates"
  ON law_updates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role can insert law updates" ON law_updates;
CREATE POLICY "Service role can insert law updates"
  ON law_updates FOR INSERT TO service_role WITH CHECK (true);

-- Tracks last-seen content hash per monitored URL
CREATE TABLE IF NOT EXISTS law_page_hashes (
  url          TEXT PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  law_name     TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  last_checked TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE law_page_hashes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages hashes" ON law_page_hashes;
CREATE POLICY "Service role manages hashes"
  ON law_page_hashes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Also add signature columns (idempotent)
ALTER TABLE signatures
  ADD COLUMN IF NOT EXISTS signature_type TEXT DEFAULT 'drawn'
    CHECK (signature_type IN ('drawn', 'typed')),
  ADD COLUMN IF NOT EXISTS signer_role TEXT DEFAULT 'employee'
    CHECK (signer_role IN ('employee', 'employer'));
