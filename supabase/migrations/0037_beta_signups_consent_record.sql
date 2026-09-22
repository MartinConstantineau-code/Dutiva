-- Record the CASL consent the signup already collects.
--
-- The landing form asks for express consent, the client refuses to submit
-- without it, and `create-beta-signup` returns 422 when `consent` is not true.
-- All correct — and then the insert dropped it, because `beta_signups` had no
-- column to put it in. Consent was being validated and discarded.
--
-- CASL places the burden of proving consent on the SENDER. Consent nobody
-- wrote down cannot be produced when asked, so in evidentiary terms Dutiva has
-- been asking properly and keeping no answer.
--
-- Three columns, because proving consent means proving all three together:
-- that they agreed, WHAT WORDING they agreed to, and when. The wording is
-- stored verbatim rather than as a reference to the i18n string, since that
-- string will be edited and a record pointing at it would silently change what
-- past signups appear to have agreed to.
--
-- NULLABLE ON PURPOSE. Existing rows are left NULL rather than backfilled to
-- true. Those people did consent — the function has always enforced it — but
-- there is no contemporaneous record, and manufacturing one is precisely the
-- wrong instinct for a proof-of-consent table. NULL reads as "consent was
-- required at submission but not evidenced", which is the truth. If those
-- addresses are ever mailed under a consent theory rather than a
-- service/transactional one, re-confirm them first.
--
-- ROLLBACK:
--   alter table public.beta_signups
--     drop column if exists consent_granted,
--     drop column if exists consent_text,
--     drop column if exists consent_at;

alter table public.beta_signups
  add column if not exists consent_granted boolean,
  add column if not exists consent_text    text,
  add column if not exists consent_at      timestamptz;

comment on column public.beta_signups.consent_granted is
  'CASL express consent. NULL = signed up before consent was recorded; consent was enforced at submission but is not evidenced.';
comment on column public.beta_signups.consent_text is
  'Verbatim wording the signer agreed to, in the language shown. Stored literally so later copy edits cannot rewrite what past signups consented to.';
comment on column public.beta_signups.consent_at is
  'When consent was given.';

-- Finding the rows that can be relied on, and the ones that cannot.
create index if not exists beta_signups_consent_idx
  on public.beta_signups (consent_granted);
