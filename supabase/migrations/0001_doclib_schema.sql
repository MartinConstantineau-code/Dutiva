-- HR Documents Library — demo schema.
--
-- Everything lives in the dedicated `doclib` schema: the shared Supabase
-- project also hosts the production product's own tables in `public`, whose
-- names (documents, templates, organizations, …) would collide. This
-- migration is strictly additive and touches nothing outside `doclib`
-- except the prefixed `public.doclib_*` read views at the bottom.
--
-- Demo posture (per project decision): anonymous read-only. RLS is enabled
-- with SELECT-only policies and only SELECT is granted — there is no write
-- path from the client at all. Ids are semantic text slugs to match the
-- handoff's sample data; production would use uuids (see docs/DATA_MODEL.md).

create schema if not exists doclib;

-- ── Identity & access ────────────────────────────────────────────────────────

create table doclib.organizations (
  id text primary key,
  name text not null,
  employee_count int not null,
  size_tier text not null check (size_tier in ('micro', 'small', 'mid', 'large')),
  unionized boolean not null default false,
  sector text not null,
  federally_regulated boolean not null default false,
  primary_jurisdiction text not null check (primary_jurisdiction in ('ON', 'QC', 'FED')),
  created_at timestamptz not null default now()
);

create table doclib.profiles (
  id text primary key,
  full_name text not null,
  email text,
  avatar_url text
);

create table doclib.organization_members (
  id text primary key,
  organization_id text not null references doclib.organizations (id),
  profile_id text not null references doclib.profiles (id),
  role text not null check (role in ('owner', 'hr', 'manager', 'viewer', 'external')),
  created_at timestamptz not null default now()
);

-- ── People & cases ───────────────────────────────────────────────────────────

create table doclib.employees (
  id text primary key,
  organization_id text not null references doclib.organizations (id),
  name text not null,
  jurisdiction text not null check (jurisdiction in ('ON', 'QC', 'FED')),
  status text not null default 'active'
);

create table doclib.employee_cases (
  id text primary key,
  organization_id text not null references doclib.organizations (id),
  employee_id text not null references doclib.employees (id),
  title_en text not null,
  title_fr text not null,
  jurisdiction text not null check (jurisdiction in ('ON', 'QC', 'FED')),
  risk text not null check (risk in ('low', 'medium', 'high'))
);

-- ── Template library ─────────────────────────────────────────────────────────

create table doclib.document_template_categories (
  id text primary key,
  name_en text not null,
  name_fr text not null,
  "order" int not null,
  icon text,
  desc_en text,
  desc_fr text
);

create table doclib.document_templates (
  id text primary key,
  category_id text not null references doclib.document_template_categories (id),
  template_key text not null unique,
  tid text not null unique,
  kind text,
  core boolean not null default false,
  subject text not null check (subject in ('candidate', 'employee', 'org', 'external')),
  name_en text not null,
  name_fr text not null,
  desc_en text,
  desc_fr text,
  jurisdictions_supported text[] not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  review_status text not null,
  requires_lawyer_review boolean not null default false,
  est_minutes int,
  usage_count int not null default 0,
  is_active boolean not null default true,
  status text not null default 'published',
  effective_date date,
  updated_at date
);

create table doclib.document_template_versions (
  id text primary key,
  template_id text not null references doclib.document_templates (id),
  version_number int not null,
  question_flow_json jsonb not null,
  clause_library_json jsonb not null,
  statutory_references_json jsonb,
  jurisdiction_notes_json jsonb,
  includes_json jsonb,
  body_content text,
  effective_date date,
  deprecated_at date,
  created_by text,
  unique (template_id, version_number)
);

-- ── Generated documents ──────────────────────────────────────────────────────

create table doclib.document_generation_sessions (
  id text primary key,
  organization_id text not null references doclib.organizations (id),
  template_version_id text references doclib.document_template_versions (id),
  employee_id text references doclib.employees (id),
  case_id text references doclib.employee_cases (id),
  answers_json jsonb not null default '{}'::jsonb,
  language text,
  jurisdiction text,
  created_by text,
  created_at timestamptz not null default now()
);

create table doclib.documents (
  id text primary key,
  organization_id text not null references doclib.organizations (id),
  employee_id text references doclib.employees (id),
  case_id text references doclib.employee_cases (id),
  template_id text not null references doclib.document_templates (id),
  template_version_id text references doclib.document_template_versions (id),
  ref text not null,
  title_en text not null,
  title_fr text not null,
  language text not null check (language in ('en', 'fr')),
  jurisdiction text not null check (jurisdiction in ('ON', 'QC', 'FED')),
  status text not null check (
    status in (
      'draft', 'in_review', 'needs_revision', 'approved', 'sent_for_signature',
      'partially_signed', 'signed', 'exported', 'archived', 'voided', 'deleted'
    )
  ),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  review_status text not null check (
    review_status in ('not_reviewed', 'hr_review_required', 'lawyer_review_recommended', 'approved_for_use')
  ),
  signature_status text not null check (
    signature_status in (
      'not_sent', 'sent', 'viewed', 'pending', 'partially_signed',
      'signed', 'declined', 'expired', 'voided'
    )
  ),
  current_version int not null default 1,
  created_by text,
  updated_by text,
  created_at date,
  updated_at date,
  archived_at date,
  answers_json jsonb not null default '{}'::jsonb
);

create table doclib.document_versions (
  id text primary key,
  document_id text not null references doclib.documents (id),
  version_number int not null,
  change_summary_en text,
  change_summary_fr text,
  created_by text,
  created_at date,
  unique (document_id, version_number)
);

-- ── Signatures & audit ───────────────────────────────────────────────────────

create table doclib.document_recipients (
  id text primary key,
  document_id text not null references doclib.documents (id),
  recipient_type text not null check (recipient_type in ('employer', 'employee', 'manager', 'hr', 'external')),
  name text not null,
  email text,
  signing_order int not null default 1,
  status text not null,
  signed_at date
);

create table doclib.document_signatures (
  id text primary key,
  document_id text not null references doclib.documents (id),
  provider text not null,
  external_envelope_id text,
  status text not null,
  sent_at date,
  viewed_at date,
  signed_at date,
  declined_at date,
  expires_at date
);

create table doclib.document_exports (
  id text primary key,
  document_id text not null references doclib.documents (id),
  format text not null,
  exported_by text,
  created_at timestamptz not null default now()
);

-- Append-only by construction: only SELECT is ever granted on this table,
-- and no UPDATE/DELETE policy exists.
create table doclib.document_audit_events (
  id text primary key,
  organization_id text not null references doclib.organizations (id),
  document_id text not null references doclib.documents (id),
  actor_name text not null,
  event_type text not null,
  event_metadata text,
  created_at timestamptz not null
);

-- ── RLS: demo read-only ──────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations', 'profiles', 'organization_members', 'employees', 'employee_cases',
    'document_template_categories', 'document_templates', 'document_template_versions',
    'document_generation_sessions', 'documents', 'document_versions',
    'document_recipients', 'document_signatures', 'document_exports', 'document_audit_events'
  ]
  loop
    execute format('alter table doclib.%I enable row level security', t);
    execute format(
      'create policy "doclib demo read" on doclib.%I for select to anon, authenticated using (true)', t
    );
  end loop;
end
$$;

grant usage on schema doclib to anon, authenticated;
grant select on all tables in schema doclib to anon, authenticated;

-- ── Client read path ─────────────────────────────────────────────────────────
-- PostgREST exposes only `public`; these prefixed, security-invoker views are
-- the supabase-js read surface (RLS on the base tables still applies).

create view public.doclib_organizations with (security_invoker = true) as
  select * from doclib.organizations;
create view public.doclib_employees with (security_invoker = true) as
  select * from doclib.employees;
create view public.doclib_employee_cases with (security_invoker = true) as
  select * from doclib.employee_cases;
create view public.doclib_template_categories with (security_invoker = true) as
  select * from doclib.document_template_categories;
create view public.doclib_templates with (security_invoker = true) as
  select * from doclib.document_templates;
create view public.doclib_template_versions with (security_invoker = true) as
  select * from doclib.document_template_versions;
create view public.doclib_documents with (security_invoker = true) as
  select * from doclib.documents;
create view public.doclib_document_versions with (security_invoker = true) as
  select * from doclib.document_versions;
create view public.doclib_document_recipients with (security_invoker = true) as
  select * from doclib.document_recipients;
create view public.doclib_document_signatures with (security_invoker = true) as
  select * from doclib.document_signatures;
create view public.doclib_document_audit_events with (security_invoker = true) as
  select * from doclib.document_audit_events;

grant select on
  public.doclib_organizations, public.doclib_employees, public.doclib_employee_cases,
  public.doclib_template_categories, public.doclib_templates, public.doclib_template_versions,
  public.doclib_documents, public.doclib_document_versions, public.doclib_document_recipients,
  public.doclib_document_signatures, public.doclib_document_audit_events
to anon, authenticated;
