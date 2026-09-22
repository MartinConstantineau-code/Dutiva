-- Bug fix: create-beta-signup (supabase/functions/create-beta-signup)
-- inserts `language` on every signup, but public.beta_signups never had
-- that column — every insert since the landing-page form was wired to this
-- function (see docs/BILLING_BETA_AUDIT.md) has been failing with
-- "column \"language\" of relation \"beta_signups\" does not exist",
-- surfaced to the visitor as a generic "could not record your signup"
-- error. Confirmed empty table in production despite live traffic through
-- the form.
--
-- Same defensive to_regclass guard as the other migrations touching this
-- live-project-only table.
do $$
begin
  if to_regclass('public.beta_signups') is not null then
    alter table public.beta_signups add column if not exists language text;
    alter table public.beta_signups drop constraint if exists beta_signups_language_check;
    alter table public.beta_signups add constraint beta_signups_language_check
      check (language is null or language in ('en', 'fr'));
  else
    raise notice 'public.beta_signups not present (live-project-only schema) - skipping';
  end if;
end $$;
