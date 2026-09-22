-- Support system foundation: tickets, messages, attachments, events,
-- assignments, and feedback, with Row Level Security so customers only ever
-- see their own tickets (and, where applicable, tickets in a workspace they
-- belong to). All privileged writes (triage, priority, internal notes, status
-- transitions) go through the service-role key inside a Supabase edge function
-- and bypass RLS; the policies here only grant customers the minimum they need
-- (read their own tickets, add a non-internal reply, leave feedback).
--
-- Enum-like columns use CHECK constraints that mirror src/config/support.ts —
-- keep the two in sync. UUIDs are internal; `public_reference` (DUT-YYYY-NNNNNN)
-- is the human-readable id shown to customers and used in email/URLs.
--
-- DEPENDENCY: the RLS policies below call is_admin(uuid) and
-- is_org_member(uuid, uuid). Those helpers were created directly on the live
-- project (khtwpxnvziiyplaflwru), not by a repo migration — the same situation
-- as the guidance/law-update tables noted in 0011. They are present in
-- production; a from-scratch replay of the repo migrations alone must create
-- them first.
--
-- ROLLBACK: drop the objects in reverse dependency order and remove the bucket:
--   drop table if exists public.support_ticket_feedback, public.support_ticket_assignments,
--     public.support_ticket_events, public.support_attachments, public.support_messages,
--     public.support_tickets cascade;
--   drop function if exists public.set_support_ticket_reference() cascade;
--   drop function if exists public.touch_support_updated_at() cascade;
--   drop sequence if exists public.support_ticket_ref_seq;
--   delete from storage.buckets where id = 'support-attachments';

-- Human-readable reference sequence.
create sequence if not exists public.support_ticket_ref_seq;

-- ── support_tickets ──────────────────────────────────────────────────────
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  public_reference text unique not null,
  requester_user_id uuid references auth.users (id) on delete set null,
  workspace_id uuid,
  category text not null check (category in (
    'account_access', 'billing', 'technical', 'product_question', 'privacy',
    'security', 'accessibility', 'complaint', 'sales', 'other'
  )),
  subject text not null check (char_length(subject) between 1 and 200),
  description text not null check (char_length(description) between 1 and 20000),
  status text not null default 'new' check (status in (
    'new', 'triaged', 'in_progress', 'waiting_on_customer', 'waiting_on_dutiva',
    'scheduled_call', 'resolved', 'closed'
  )),
  priority text not null default 'standard' check (priority in (
    'critical', 'high', 'standard', 'low'
  )),
  impact text check (impact in ('blocking', 'major', 'minor', 'none')),
  urgency text check (urgency in ('urgent', 'soon', 'whenever')),
  language text not null default 'en' check (language in ('en', 'fr')),
  preferred_response_method text not null default 'email'
    check (preferred_response_method in ('email', 'in_app', 'scheduled_call')),
  source text not null default 'app_form'
    check (source in ('app_form', 'public_form', 'email', 'ai_escalation')),
  -- Privacy/security/complaint tickets: restricted internal visibility and
  -- excluded from ordinary analytics.
  restricted boolean not null default false,
  assigned_to uuid references auth.users (id) on delete set null,
  escalation_type text not null default 'none' check (escalation_type in ('none', 'phone', 'video')),
  escalation_reason text,
  requester_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  first_response_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  retention_review_at timestamptz
);

create index if not exists support_tickets_requester_idx on public.support_tickets (requester_user_id);
create index if not exists support_tickets_workspace_idx on public.support_tickets (workspace_id) where workspace_id is not null;
create index if not exists support_tickets_status_idx on public.support_tickets (status);
create index if not exists support_tickets_priority_idx on public.support_tickets (priority);
create index if not exists support_tickets_category_idx on public.support_tickets (category);
create index if not exists support_tickets_assigned_idx on public.support_tickets (assigned_to) where assigned_to is not null;
create index if not exists support_tickets_open_created_idx on public.support_tickets (created_at desc)
  where status not in ('resolved', 'closed');

-- ── support_messages ─────────────────────────────────────────────────────
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  author_user_id uuid references auth.users (id) on delete set null,
  author_role text not null check (author_role in ('customer', 'agent', 'system')),
  body text not null check (char_length(body) between 1 and 20000),
  -- Internal notes are never visible to customers (service-role / admin only).
  is_internal_note boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists support_messages_ticket_idx on public.support_messages (ticket_id, created_at);

-- ── support_attachments ──────────────────────────────────────────────────
-- Files live in the private `support-attachments` storage bucket; rows hold
-- metadata only (never base64). storage_path is uid-scoped
-- (`<uid>/<ticket>/<file>`), matching the storage.objects policies below.
create table if not exists public.support_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  message_id uuid references public.support_messages (id) on delete set null,
  uploaded_by uuid references auth.users (id) on delete set null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0 and size_bytes <= 26214400), -- 25 MB
  scan_status text not null default 'pending' check (scan_status in ('pending', 'clean', 'flagged', 'skipped')),
  created_at timestamptz not null default timezone('utc', now()),
  retention_review_at timestamptz
);
create index if not exists support_attachments_ticket_idx on public.support_attachments (ticket_id);

-- ── support_ticket_events (audit trail) ──────────────────────────────────
create table if not exists public.support_ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists support_ticket_events_ticket_idx on public.support_ticket_events (ticket_id, created_at);

-- ── support_ticket_assignments ───────────────────────────────────────────
create table if not exists public.support_ticket_assignments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  assigned_to uuid references auth.users (id) on delete set null,
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default timezone('utc', now()),
  unassigned_at timestamptz
);
create index if not exists support_ticket_assignments_ticket_idx on public.support_ticket_assignments (ticket_id);

-- ── support_ticket_feedback ("Was this helpful?" / closure feedback) ─────
create table if not exists public.support_ticket_feedback (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.support_tickets (id) on delete cascade,
  submitted_by uuid references auth.users (id) on delete set null,
  rating text not null check (rating in ('positive', 'neutral', 'negative')),
  comment text check (comment is null or char_length(comment) <= 4000),
  created_at timestamptz not null default timezone('utc', now())
);

-- ── Triggers: public reference + updated_at ──────────────────────────────
create or replace function public.set_support_ticket_reference()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.public_reference is null or new.public_reference = '' then
    new.public_reference :=
      'DUT-' || to_char(timezone('utc', now()), 'YYYY') || '-' ||
      lpad(nextval('public.support_ticket_ref_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists support_tickets_set_reference on public.support_tickets;
create trigger support_tickets_set_reference
  before insert on public.support_tickets
  for each row execute function public.set_support_ticket_reference();

create or replace function public.touch_support_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists support_tickets_touch_updated_at on public.support_tickets;
create trigger support_tickets_touch_updated_at
  before update on public.support_tickets
  for each row execute function public.touch_support_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_attachments enable row level security;
alter table public.support_ticket_events enable row level security;
alter table public.support_ticket_assignments enable row level security;
alter table public.support_ticket_feedback enable row level security;

-- A ticket is visible to its requester, to members of its workspace, and to
-- admins. Everything else (events, assignments, internal notes) is admin-only.
-- `restricted` tickets (privacy/security/complaint) are NOT visible to workspace
-- peers — only the requester and admins — so a co-worker can't read someone
-- else's privacy request or security report.
create policy "Requester or workspace member can read own tickets"
  on public.support_tickets for select
  using (
    requester_user_id = (select auth.uid())
    or (workspace_id is not null and not restricted and is_org_member(workspace_id, (select auth.uid())))
    or is_admin((select auth.uid()))
  );

-- Customers create tickets through the service-role edge function (validated,
-- rate-limited, priority assigned server-side). No authenticated INSERT policy
-- is defined here, so the browser cannot write tickets directly.

create policy "Read messages on a visible, non-internal ticket"
  on public.support_messages for select
  using (
    (not is_internal_note or is_admin((select auth.uid())))
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id
        and (
          t.requester_user_id = (select auth.uid())
          or (t.workspace_id is not null and not t.restricted and is_org_member(t.workspace_id, (select auth.uid())))
          or is_admin((select auth.uid()))
        )
    )
  );

-- A customer may add a non-internal reply to their own ticket.
create policy "Requester can reply to own ticket"
  on public.support_messages for insert
  with check (
    is_internal_note = false
    and author_role = 'customer'
    and author_user_id = (select auth.uid())
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.requester_user_id = (select auth.uid())
    )
  );

create policy "Read attachments on a visible ticket"
  on public.support_attachments for select
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id
        and (
          t.requester_user_id = (select auth.uid())
          or (t.workspace_id is not null and not t.restricted and is_org_member(t.workspace_id, (select auth.uid())))
          or is_admin((select auth.uid()))
        )
    )
  );

-- Events and assignments are internal only: admin read, service-role write.
create policy "Admins read ticket events" on public.support_ticket_events for select
  using (is_admin((select auth.uid())));
create policy "Admins read ticket assignments" on public.support_ticket_assignments for select
  using (is_admin((select auth.uid())));

-- Feedback: the requester may leave feedback on their own ticket; admins read all.
create policy "Requester leaves feedback on own ticket"
  on public.support_ticket_feedback for insert
  with check (
    submitted_by = (select auth.uid())
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.requester_user_id = (select auth.uid())
    )
  );
create policy "Requester or admin reads feedback"
  on public.support_ticket_feedback for select
  using (
    submitted_by = (select auth.uid()) or is_admin((select auth.uid()))
  );

-- ── Private attachments bucket ───────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments', 'support-attachments', false, 26214400,
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Object keys are namespaced by the uploader's uid: `<uid>/<ticket>/<file>`.
-- Authenticated users may write and read only under their own uid prefix;
-- the service role (edge function) manages everything else. Nothing is public.
create policy "Users upload own support attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'support-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users read own support attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'support-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
-- Deletion is permitted for any object under the user's own uid prefix; the
-- "before submit" intent (removing a not-yet-attached file) is a UX convention,
-- not a DB constraint. Once an object is linked to a ticket its lifecycle is
-- managed by the service role.
create policy "Users remove own support attachments before submit"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'support-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
