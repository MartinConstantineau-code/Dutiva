-- Fix: beta_signups.created_at has no DEFAULT, so the edge function
-- (which doesn't set it explicitly) stores NULL.  Add the same
-- timezone('utc', now()) default the rest of this project uses.
do $$
begin
  if to_regclass('public.beta_signups') is not null then
    alter table public.beta_signups
      alter column created_at set default timezone('utc', now());
  else
    raise notice 'public.beta_signups not present — skipping';
  end if;
end $$;
