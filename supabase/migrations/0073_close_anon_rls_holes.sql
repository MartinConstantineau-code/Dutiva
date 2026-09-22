-- Close three anonymous-read RLS holes on legacy tables (security audit,
-- 2026-08-08). Confirmed live via pg_policies against the project, not just
-- the committed dump: beta_signups, hr_documents and signatures each carry a
-- USING(true) / anon policy reachable by unauthenticated callers.
--
-- Safe to remove: none of the three tables is read or written anywhere in
-- src/ or supabase/functions/ (the Document Studio runs on bundled fixtures;
-- these are pre-repo platform remnants). A full policy scan confirmed these
-- are the only anon-open policies besides the intentionally-public
-- service_status page; every HR PII and support table is correctly
-- org-scoped.
--
-- These policies have NO creating migration — they were applied to the
-- project out-of-band, and supabase/schema.sql is stale (it also predates
-- migrations 0039–0072). This migration brings the fix into version
-- control; regenerate the dump (npm run db:snapshot) after applying so the
-- repo reflects reality, and re-run get_advisors('security').
--
-- ROLLBACK: these policies were world-open by mistake — do NOT recreate
-- them. If external token-based signing is ever needed, route it through the
-- existing SECURITY DEFINER RPCs (get_signature_by_token /
-- submit_signature_by_token), never a USING(true) table policy.

-- ── beta_signups — prospect PII, CASL consent, and the workspace-membership
-- allowlist (current_user_is_workspace_member keys off this table). The
-- admin-read ("Admins read beta signups") and public-INSERT ("Public can
-- submit beta signups with valid email") policies remain, so signups still
-- work and admins still read; only the anonymous SELECT is removed.
drop policy if exists "public_read_beta_signups" on public.beta_signups;

-- ── hr_documents — the document-template catalogue (prompt_template,
-- generator_schema, storage paths). No non-service caller reads it today;
-- dropping the public read lets it fall to deny-all (service-role only),
-- matching the other internal tables.
drop policy if exists "hr_documents_public_read" on public.hr_documents;

-- ── signatures — anon could read every signature AND flip pending→signed
-- while overwriting signature_data (forge an executed document). Remove both
-- anon policies; the authenticated owner policy ("Owners can manage their
-- signatures", auth.uid() = user_id) stays. Also revoke the out-of-band anon
-- write grants as defense-in-depth — RLS is the gate, but anon has no
-- business holding write on this table.
drop policy if exists "Anyone can view and sign by token" on public.signatures;
drop policy if exists "Anyone can update signature by token" on public.signatures;
revoke insert, update, delete on public.signatures from anon;

-- ── Hardening (Supabase linter 0011_function_search_path_mutable): pin
-- search_path on two trigger functions that lacked it. Both reference only
-- schema-qualified (auth.role()) or pg_catalog built-ins, so pinning changes
-- resolution, never behaviour. pin_profile_billing_columns is
-- security-relevant — it blocks a client from editing billing columns
-- (plan, subscription_status, stripe ids) on its own profile row.
alter function public.pin_profile_billing_columns() set search_path = pg_catalog, public;
alter function public.touch_advisor_guidance_updated_at() set search_path = pg_catalog, public;
