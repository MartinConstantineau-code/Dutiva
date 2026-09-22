create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  province text not null default 'Ontario',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists conversations_user_id_idx on public.conversations (user_id);

create or replace trigger set_conversations_updated_at
  before update on public.conversations
  for each row
  execute procedure public.set_updated_at();

alter table public.conversations enable row level security;

grant select, insert, update, delete on public.conversations to authenticated;

drop policy if exists "Users can manage their own conversations" on public.conversations;
create policy "Users can manage their own conversations"
  on public.conversations
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
