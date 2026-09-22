create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  signer_name text not null default '',
  signer_email text not null default '',
  signed_at timestamptz,
  signature_data text not null default '',
  status text not null default 'pending',
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  constraint signatures_status_check check (status in ('pending', 'signed'))
);

create unique index if not exists signatures_token_idx on public.signatures (token);
create index if not exists signatures_user_id_idx on public.signatures (user_id);
create index if not exists signatures_document_id_idx on public.signatures (document_id);

alter table public.signatures enable row level security;

grant select, insert, update on public.signatures to authenticated;
grant select, update on public.signatures to anon;

drop policy if exists "Owners can manage their signatures" on public.signatures;
create policy "Owners can manage their signatures"
  on public.signatures
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can view and sign by token" on public.signatures;
create policy "Anyone can view and sign by token"
  on public.signatures
  for select
  to anon
  using (true);

drop policy if exists "Anyone can update signature by token" on public.signatures;
create policy "Anyone can update signature by token"
  on public.signatures
  for update
  to anon
  using (status = 'pending')
  with check (status = 'signed');
