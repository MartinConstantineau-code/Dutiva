import { bi } from '@/i18n/core'
import type { Policy } from './types'

/** Policies, transcribed from the prototype's `buildPolicies()`. */

export const policies: Policy[] = [
  {
    id: 'p1',
    title: bi('Remote Work Policy', 'Politique de télétravail'),
    status: bi('Needs review', 'À réviser'),
    tone: 'warning',
    updated: bi('14 months ago', 'Il y a 14 mois'),
  },
  {
    id: 'p2',
    title: bi('Vacation & Time Off Policy', 'Politique de vacances et congés'),
    status: bi('Up to date', 'À jour'),
    tone: 'success',
    updated: bi('2 months ago', 'Il y a 2 mois'),
  },
  {
    id: 'p3',
    title: bi('Code of Conduct', 'Code de conduite'),
    status: bi('Up to date', 'À jour'),
    tone: 'success',
    updated: bi('5 months ago', 'Il y a 5 mois'),
  },
  {
    id: 'p4',
    title: bi('Workplace Accommodation Policy', 'Politique d’accommodement en milieu de travail'),
    status: bi('Up to date', 'À jour'),
    tone: 'success',
    updated: bi('3 months ago', 'Il y a 3 mois'),
  },
  {
    id: 'p5',
    title: bi(
      'Anti-Harassment & Violence Policy',
      'Politique contre le harcèlement et la violence',
    ),
    status: bi('Needs review', 'À réviser'),
    tone: 'warning',
    updated: bi('19 months ago', 'Il y a 19 mois'),
  },
  {
    id: 'p6',
    title: bi('Expense Reimbursement Policy', 'Politique de remboursement des dépenses'),
    status: bi('Missing', 'Manquant'),
    tone: 'risk',
    updated: bi('never generated', 'jamais généré'),
  },
]
