/**
 * Vercel deployment environment, baked in at build time from the `VERCEL_ENV`
 * system env var via vite.config.ts `define`. On Vercel this is
 * 'production' | 'preview' | 'development'; locally and in tests the var is
 * unset and this collapses to '' — so isVercelPreview() is false and nothing
 * bypasses the auth gate outside a real preview deployment.
 *
 * `typeof` guards a bundler that doesn't apply the define (the identifier is
 * then simply undeclared, which `typeof` reports as 'undefined' without
 * throwing) so this never blows up at module load.
 */
declare const __VERCEL_ENV__: string

export const VERCEL_ENV: string = typeof __VERCEL_ENV__ === 'string' ? __VERCEL_ENV__ : ''

/**
 * True only on Vercel *preview* deployments (branch/PR builds). Preview
 * builds are private and noindex (see vercel.json) and exist for internal
 * review, so the workspace's invite-only auth gate is dropped there
 * (RequireAdminSession). Matches 'preview' exactly: production
 * (VERCEL_ENV === 'production') and every other value keep the gate.
 */
export function isVercelPreview(): boolean {
  return VERCEL_ENV === 'preview'
}
