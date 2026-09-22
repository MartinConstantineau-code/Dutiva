import { AuthProvider } from '@/features/app/auth/AuthProvider'
import { PlanProvider } from '@/features/app/billing/PlanProvider'
import { PricingPage } from './PricingPage'

/**
 * /pricing needs a Supabase session (to resolve plan + the internal-account
 * billing bypass, see features/app/billing/PlanProvider) but none of the
 * other workspace providers. Composed in its own module so the providers —
 * and supabase-js — stay out of the marketing entry chunk and load only
 * with this route.
 */
export function PricingShell() {
  return (
    <AuthProvider>
      <PlanProvider>
        <PricingPage />
      </PlanProvider>
    </AuthProvider>
  )
}
