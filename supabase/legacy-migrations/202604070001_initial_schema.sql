create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_email text,
  primary_email text not null default 'info@dutiva.ca',
  company_name text not null default 'Dutiva Canada',
  legal_name text not null default 'Dutiva Canada Inc.',
  website text not null default 'dutiva.ca',
  province text not null default 'Ontario',
  city text not null default 'Ottawa',
  primary_contact text not null default 'Martin Constantineau',
  company_size text not null default '1-10',
  language_default text not null default 'English',
  theme_default text not null default 'Dark',
  compliance_mode text not null default 'Canadian SMB',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_company_size_check
    check (company_size in ('1-10', '11-50', '51-200', '200+')),
  constraint profiles_language_default_check
    check (language_default in ('English', 'French', 'Bilingual')),
  constraint profiles_theme_default_check
    check (theme_default in ('Dark', 'Light', 'System')),
  constraint profiles_compliance_mode_check
    check (compliance_mode in ('Canadian SMB', 'Multi-province employer', 'Custom'))
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled document',
  content text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.documents
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create index if not exists documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, account_email)
  values (new.id, new.email)
  on conflict (id) do update
    set account_email = excluded.account_email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row
  execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.documents enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.documents to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can view their own documents" on public.documents;
create policy "Users can view their own documents"
  on public.documents
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own documents" on public.documents;
create policy "Users can insert their own documents"
  on public.documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own documents" on public.documents;
create policy "Users can update their own documents"
  on public.documents
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own documents" on public.documents;
create policy "Users can delete their own documents"
  on public.documents
  for delete
  to authenticated
  using (auth.uid() = user_id);
