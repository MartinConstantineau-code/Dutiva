-- Export audit trail + velocity guard for content leaving the product.
--
-- Everything a user exports (Document Studio PDFs/Word files, the Advisor
-- memory JSON) is company-generated work product. The client stamps every
-- artifact with an export id (visible watermark + invisible zero-width tag +
-- file metadata — src/lib/exportProtection/); this table is where that id
-- resolves back to a person: one row per authorized export, written by the
-- record-export edge function, keyed by the id embedded in the artifact.
-- Recovering an id from a leaked copy answers "who exported this, when, and
-- was it byte-identical" (content_sha256).
--
-- The claim function is the enforcement half: the same check-and-reserve
-- shape as claim_ai_usage (0027) — advisory lock, ceilings as parameters,
-- service-role only — because the threat is the same shape too: a scripted
-- client hammering an endpoint, here to bulk-exfiltrate the document library
-- rather than to burn model credit. Limits live in
-- supabase/functions/_shared/exportGuard.ts.
--
-- Denials are not recorded (same rationale as 0027: unbounded write
-- amplification under a hammering client); the edge function logs them.
--
-- ROLLBACK:
--   drop function if exists public.claim_export_slot(
--     uuid, text, text, text, text, integer, text, integer, integer, integer);
--   drop table if exists public.export_events;

create table public.export_events (
  id uuid primary key default gen_random_uuid(),
  -- The export id embedded in the artifact IS this row's id. On account
  -- deletion the row is kept but unlinked (set null), so an already-leaked
  -- artifact stays resolvable to "a deleted account, exported at T" without
  -- retaining the person's identity — the same privacy-first posture as the
  -- error-reporting pipeline (0019, no persistent client id).
  user_id uuid references auth.users (id) on delete set null,
  surface text not null check (surface in ('docstudio', 'doclib', 'memory', 'advisor')),
  kind text not null check (kind in ('pdf', 'word', 'link', 'json', 'text')),
  -- Display title only, for reading the trail; capped hard so the audit
  -- table can never become a copy of the content it guards.
  title text not null default '' check (char_length(title) <= 200),
  -- sha-256 hex of the exported text (or 'fnv1a:…' from the client's
  -- fallback hasher on pre-WebCrypto browsers).
  content_sha256 text not null check (content_sha256 ~ '^([0-9a-f]{64}|fnv1a:[0-9a-f]{16})$'),
  content_chars integer not null default 0 check (content_chars >= 0),
  lang text not null default 'en' check (lang in ('en', 'fr')),
  created_at timestamptz not null default now()
);

comment on table public.export_events is
  'One row per authorized export of company-generated content; the artifact''s embedded export id is this row''s id. Written only by record-export (service role).';

-- The guard's two counts: this user's exports in a rolling window, and the
-- forensic lookup "resolve an export id" is the primary key itself.
create index export_events_user_created_idx
  on public.export_events (user_id, created_at desc);

-- Service-role only, like ai_telemetry_events: the client reads its own
-- device trail (localStorage) and admins read this one through service-role
-- tooling. No RLS policies on purpose — enabled RLS with none grants nothing
-- to anon/authenticated, which is exactly the intended surface.
alter table public.export_events enable row level security;
revoke all on table public.export_events from anon, authenticated;

-- Check-and-reserve: refuse past a ceiling, otherwise insert the audit row
-- and return its id (which becomes the artifact's embedded export id). The
-- advisory lock serializes concurrent claims so N parallel export clicks
-- cannot all read a count below the limit and all proceed — the exact race
-- the AI guardrails closed in 0027.
create or replace function public.claim_export_slot(
  p_user_id uuid,
  p_surface text,
  p_kind text,
  p_title text,
  p_sha256 text,
  p_content_chars integer,
  p_lang text,
  p_burst_window_seconds integer,
  p_burst_limit integer,
  p_daily_limit integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_burst_since timestamptz := v_now - make_interval(secs => greatest(p_burst_window_seconds, 1));
  v_day_since timestamptz := v_now - interval '24 hours';
  v_count integer;
  v_oldest timestamptz;
  v_id uuid;
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'scope', 'unauthenticated');
  end if;

  perform pg_advisory_xact_lock(hashtext('export_claim'));

  -- Burst: the scripted / button-hammering shape.
  select count(*), min(created_at) into v_count, v_oldest
    from public.export_events
    where user_id = p_user_id
      and created_at >= v_burst_since;
  if v_count >= greatest(p_burst_limit, 1) then
    return jsonb_build_object(
      'allowed', false,
      'scope', 'burst',
      'limit', p_burst_limit,
      'used', v_count,
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from
          (v_oldest + make_interval(secs => greatest(p_burst_window_seconds, 1)) - v_now)))::integer)
    );
  end if;

  -- Rolling daily ceiling: the walk-out-with-the-library shape. One budget
  -- across every surface — moving between Document Studio and Memory must
  -- not double it.
  select count(*), min(created_at) into v_count, v_oldest
    from public.export_events
    where user_id = p_user_id
      and created_at >= v_day_since;
  if v_count >= greatest(p_daily_limit, 1) then
    return jsonb_build_object(
      'allowed', false,
      'scope', 'daily',
      'limit', p_daily_limit,
      'used', v_count,
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from (v_oldest + interval '24 hours' - v_now)))::integer)
    );
  end if;

  insert into public.export_events
    (user_id, surface, kind, title, content_sha256, content_chars, lang)
  values
    (p_user_id, p_surface, p_kind, left(coalesce(p_title, ''), 200), p_sha256,
     greatest(coalesce(p_content_chars, 0), 0), p_lang)
  returning id into v_id;

  return jsonb_build_object('allowed', true, 'export_id', v_id);
end;
$$;

-- The parameters ARE the limits — callable only by the edge functions
-- holding the service role, never by a PostgREST role (same posture as
-- claim_ai_usage).
revoke all on function public.claim_export_slot(
  uuid, text, text, text, text, integer, text, integer, integer, integer) from public;
revoke all on function public.claim_export_slot(
  uuid, text, text, text, text, integer, text, integer, integer, integer) from anon, authenticated;
grant execute on function public.claim_export_slot(
  uuid, text, text, text, text, integer, text, integer, integer, integer) to service_role;
