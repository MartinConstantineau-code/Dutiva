/**
 * Release identifier, baked in at build time from Vercel's
 * `VERCEL_GIT_COMMIT_SHA` system env var (vite.config.ts `define`). It tags
 * client error reports so a minified stack trace can be tied back to the exact
 * deployed commit — and thus to the matching source maps
 * (scripts/relocate-sourcemaps.mjs). Unset locally and under Vitest, where it
 * collapses to '' (the reporter is inert there anyway).
 *
 * `typeof` guards a bundler that doesn't apply the define (the identifier is
 * then undeclared, which `typeof` reports as 'undefined' without throwing),
 * mirroring src/lib/deployEnv.
 */
declare const __RELEASE_SHA__: string

export const RELEASE_SHA: string = typeof __RELEASE_SHA__ === 'string' ? __RELEASE_SHA__ : ''
