/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. Ported from the legacy fixture
   src/data/documents.ts (EF7). All FR is [FR self-authored]. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT48: DocTemplate = {
  id: 'tpl_t48',
  tid: 'T48',
  key: 'expense_reimbursement_policy',
  kind: 'policy',
  category: 'policies',
  core: false,
  name: {
    en: 'Expense reimbursement policy',
    fr: 'Politique de remboursement des dépenses',
  },
  desc: {
    en: 'Defines eligible expenses, submission timelines, and reimbursement obligations. Sets a company floor that meets or exceeds every province you operate in.',
    fr: 'Définit les dépenses admissibles, les délais de soumission et les obligations de remboursement. Établit un seuil d’entreprise qui atteint ou dépasse celui de chaque province où vous exercez.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'low',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-06',
  updatedAt: '2026-08-06',
  estMinutes: 5,
  usageCount: 0,
  statutory: [
    {
      en: 'Provincial employment standards — reimbursement of work-related expenses',
      fr: 'Normes d’emploi provinciales — remboursement des dépenses liées au travail',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Ontario does not have a standalone expense-reimbursement statute, but deductions from wages are regulated under the ESA.',
      fr: 'L’Ontario n’a pas de loi distincte sur le remboursement des dépenses, mais les retenues sur le salaire sont régies par la LNE.',
    },
    QC: {
      en: 'Quebec requires reimbursement of expenses incurred at the employer’s request under the Act respecting labour standards.',
      fr: 'Le Québec exige le remboursement des dépenses engagées à la demande de l’employeur en vertu de la Loi sur les normes du travail.',
    },
    FED: {
      en: 'Federally regulated employers must follow the Canada Labour Code on deductions and expenses.',
      fr: 'Les employeurs sous réglementation fédérale doivent suivre le Code canadien du travail sur les retenues et les dépenses.',
    },
  },
  includes: [
    { en: 'Eligible expenses', fr: 'Dépenses admissibles' },
    { en: 'Submission timeline and receipts', fr: 'Délai de soumission et reçus' },
    { en: 'Provincial floor note', fr: 'Note sur le seuil provincial' },
  ],
  questions: [
    {
      id: 'submission_days',
      section: { en: 'Submission', fr: 'Soumission' },
      label: { en: 'Submit claims within (days)', fr: 'Soumettre les demandes dans les (jours)' },
      type: 'number',
      required: true,
      placeholder: { en: '30', fr: '30' },
    },
  ],
  preview: [
    {
      type: 'title',
      text: { en: 'Expense Reimbursement Policy', fr: 'Politique de remboursement des dépenses' },
    },
    {
      type: 'meta',
      text: { en: '{{org}} · {{jurisdiction}}', fr: '{{org}} · {{jurisdiction}}' },
    },
    {
      type: 'para',
      text: {
        en: 'Eligible expenses include client travel, approved software, and remote work equipment. Submit claims within {{submission_days}} days with itemized receipts.',
        fr: 'Les dépenses admissibles comprennent les déplacements chez les clients, les logiciels approuvés et l’équipement de télétravail. Soumettez les demandes dans les {{submission_days}} jours avec des reçus détaillés.',
      },
    },
    {
      type: 'clause',
      n: 1,
      heading: { en: 'Provincial note', fr: 'Note provinciale' },
      text: {
        en: 'Reimbursement obligations for work-related expenses vary by province — this policy sets a company floor that meets or exceeds every province you operate in.',
        fr: 'Les obligations de remboursement des dépenses liées au travail varient selon la province — cette politique établit un seuil d’entreprise qui atteint ou dépasse celui de chaque province où vous exercez.',
      },
    },
    {
      type: 'note',
      tone: 'info',
      text: DOC_DISCLAIMER_NOTE,
    },
  ],
  subject: 'org',
}
