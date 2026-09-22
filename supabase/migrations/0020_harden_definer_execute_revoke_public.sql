-- Effective lockdown of anon-executable SECURITY DEFINER functions.
--
-- 0004 revoked EXECUTE only FROM anon. That is insufficient: these functions
-- also carry Postgres' default grant to PUBLIC (grantee 0), which anon
-- inherits — so after 0004 the Supabase security linter still reported anon
-- could execute them (confirmed on the live project:
-- has_function_privilege('anon', …, 'EXECUTE') was still true). This migration
-- revokes the PUBLIC grant (and any explicit anon grant) to actually close it.
--
-- Trust model afterwards:
--   * anon               — cannot execute any of these (the fix).
--   * authenticated      — kept ONLY where required: is_admin_user is
--                          evaluated inside RLS policies (e.g.
--                          workspace_preferences) and called by the signed-in
--                          client; is_super_admin and the token-gated
--                          signature RPCs may be driven by a signed-in caller.
--                          Dropping the PUBLIC grant would otherwise remove
--                          authenticated too, so we re-grant it explicitly.
--   * authenticated      — removed for the pure background/trigger jobs
--                          (process_expired_data_deletions,
--                          archive_old_document_versions,
--                          cleanup_old_activity_logs,
--                          record_signature_link_created): pg_cron runs them
--                          as the owner and trigger functions don't require
--                          caller EXECUTE, so no PostgREST role needs them.
--   * service_role / owner — unaffected (edge functions + cron keep working).
--
-- Verified safe before applying: none of these are referenced by
-- supabase.rpc(...) in the browser client or by any edge function (grep of
-- src/** and supabase/functions/** — only is_admin_user is called, from
-- authenticated code in src/features/app/workspaceMode/api.ts, and that
-- caller tolerates a permission error by resolving "not admin").
--
-- Idempotent + defensive: functions are looked up by name in pg_proc, so this
-- no-ops for absent/renamed functions and can be re-run safely.

do $$
declare
  fn record;
  keep_authenticated text[] := array[
    'is_admin_user',
    'is_super_admin',
    'get_signature_by_token',
    'submit_signature_by_token'
  ];
  lock_fully text[] := array[
    'process_expired_data_deletions',
    'archive_old_document_versions',
    'cleanup_old_activity_logs',
    'record_signature_link_created'
  ];
begin
  for fn in
    select p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any(keep_authenticated || lock_fully)
  loop
    execute format('revoke execute on function public.%I(%s) from public, anon', fn.proname, fn.args);
    if fn.proname = any(keep_authenticated) then
      execute format('grant execute on function public.%I(%s) to authenticated', fn.proname, fn.args);
      raise notice 'anon-locked (authenticated kept): public.%(%)', fn.proname, fn.args;
    else
      execute format('revoke execute on function public.%I(%s) from authenticated', fn.proname, fn.args);
      raise notice 'fully locked to owner/service_role: public.%(%)', fn.proname, fn.args;
    end if;
  end loop;
end
$$;
