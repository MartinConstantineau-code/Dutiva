-- Migration: law monitoring v2 — redirect/broken detection + event_type
-- Extends the tables created in 202604080001

-- Add URL-health tracking columns to law_page_hashes
ALTER TABLE law_page_hashes
  ADD COLUMN IF NOT EXISTS redirect_url          TEXT,
  ADD COLUMN IF NOT EXISTS is_broken             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_broken_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consecutive_failures  INT DEFAULT 0;

COMMENT ON COLUMN law_page_hashes.redirect_url         IS 'Permanent redirect destination, auto-detected and stored';
COMMENT ON COLUMN law_page_hashes.is_broken            IS 'TRUE when last fetch returned non-2xx and no redirect was found';
COMMENT ON COLUMN law_page_hashes.consecutive_failures IS 'Counter incremented on each failed fetch; resets to 0 on success';

-- Add event classification to law_updates
ALTER TABLE law_updates
  ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'change'
    CHECK (event_type IN ('change', 'redirect', 'broken', 'first_seen'));

COMMENT ON COLUMN law_updates.event_type IS 'Type of monitoring event: change (content diff), redirect (URL moved), broken (persistent 404/5xx), first_seen (baseline)';

-- Useful index for filtering by event type
CREATE INDEX IF NOT EXISTS law_updates_event_type_idx ON law_updates (event_type, detected_at DESC);
