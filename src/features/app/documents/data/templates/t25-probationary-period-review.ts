/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 1, Hiring & Onboarding (docs/FOUR_RING_FRAMEWORK.md). One of the eight
   Ring 1 tools the framework lists that had no template.

   The load-bearing point of this document is that "probation" is a term of
   the contract, not a status the employment standards acts recognise — so
   the review has to be a real assessment, not a formality that assumes the
   employer can end things freely. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT25: DocTemplate = {
  id: 'tpl_t25',
  tid: 'T25',
  key: 'probationary_period_review',
  kind: 'review',
  category: 'hiring',
  core: true,
  name: {
    en: 'Probationary period review',
    fr: 'Évaluation de la période de probation',
  },
  desc: {
    en: 'The end-of-probation assessment and its outcome — confirmed, extended, or ended — recorded while the statutory notice clock is still short.',
    fr: 'L’évaluation de fin de probation et son résultat — confirmation, prolongation ou fin d’emploi — consignée pendant que le délai de préavis légal est encore court.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-01',
  updatedAt: '2026-08-01',
  estMinutes: 7,
  usageCount: 0,
  statutory: [
    {
      en: 'Employment standards — statutory notice begins at three months of service',
      fr: 'Normes du travail — le préavis légal commence à trois mois de service',
    },
    {
      en: 'Probation is contractual, not statutory — it does not suspend any obligation',
      fr: 'La probation est contractuelle et non légale — elle ne suspend aucune obligation',
    },
    {
      en: 'Human rights legislation — applies in full from the first day',
      fr: 'Législation sur les droits de la personne — s’applique intégralement dès le premier jour',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Under the Employment Standards Act, 2000 no notice is owed below three months of continuous employment — but the Act does not create probation, and a contract that promises more than the statutory minimum is enforceable against you. Human Rights Code obligations, including the duty to accommodate, apply from day one.',
      fr: 'Sous la Loi de 2000 sur les normes d’emploi, aucun préavis n’est dû avant trois mois d’emploi continu — mais la Loi ne crée pas la probation, et un contrat promettant davantage que le minimum légal vous lie. Les obligations du Code des droits de la personne, dont l’obligation d’accommodement, s’appliquent dès le premier jour.',
    },
    QC: {
      en: 'The Act respecting labour standards requires notice from three months of uninterrupted service. Separately, the Civil Code obligation to give reasonable notice is not removed by calling a period probationary, and the Charter of human rights and freedoms applies throughout.',
      fr: 'La Loi sur les normes du travail exige un préavis à compter de trois mois de service continu. Par ailleurs, l’obligation du Code civil de donner un délai de congé raisonnable n’est pas écartée du fait qu’une période est qualifiée de probatoire, et la Charte des droits et libertés de la personne s’applique en tout temps.',
    },
    FED: {
      en: 'The Canada Labour Code, Part III requires notice from three consecutive months of continuous employment. Unjust-dismissal recourse opens later, at twelve consecutive months — ending employment before that does not make the reasons unreviewable, only the route different.',
      fr: 'Le Code canadien du travail, Partie III exige un préavis à compter de trois mois consécutifs d’emploi continu. Le recours pour congédiement injuste s’ouvre plus tard, à douze mois consécutifs — mettre fin à l’emploi avant ce seuil ne rend pas les motifs inattaquables, seulement la voie de recours différente.',
    },
  },
  includes: [
    {
      en: 'What was expected',
      fr: 'Ce qui était attendu',
    },
    {
      en: 'What was observed',
      fr: 'Ce qui a été observé',
    },
    {
      en: 'Support and feedback given',
      fr: 'Soutien et rétroaction fournis',
    },
    {
      en: 'Outcome and effective date',
      fr: 'Résultat et date d’effet',
    },
    {
      en: 'Next steps',
      fr: 'Prochaines étapes',
    },
  ],
  questions: [
    {
      id: 'employee_name',
      section: {
        en: 'Employee',
        fr: 'Employé',
      },
      label: {
        en: 'Employee full name',
        fr: 'Nom complet de l’employé(e)',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Full name',
        fr: 'Nom complet',
      },
    },
    {
      id: 'start_date',
      section: {
        en: 'Employee',
        fr: 'Employé',
      },
      label: {
        en: 'Employment start date',
        fr: 'Date d’entrée en fonction',
      },
      type: 'date',
      required: true,
      hint: {
        en: 'The service clock runs from here, and it does not reset if probation is extended.',
        fr: 'Le calcul du service commence ici et ne recommence pas si la probation est prolongée.',
      },
    },
    {
      id: 'expectations',
      section: {
        en: 'Assessment',
        fr: 'Évaluation',
      },
      label: {
        en: 'What was expected',
        fr: 'Ce qui était attendu',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'The standard set at hire, in the terms it was communicated.',
        fr: 'La norme fixée à l’embauche, dans les termes où elle a été communiquée.',
      },
    },
    {
      id: 'observations',
      section: {
        en: 'Assessment',
        fr: 'Évaluation',
      },
      label: {
        en: 'What was observed',
        fr: 'Ce qui a été observé',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Specific work, with dates where you have them — not a general impression.',
        fr: 'Des faits précis, avec dates lorsque vous les avez — non une impression générale.',
      },
    },
    {
      id: 'support_given',
      section: {
        en: 'Assessment',
        fr: 'Évaluation',
      },
      label: {
        en: 'Support and feedback given',
        fr: 'Soutien et rétroaction fournis',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Training, coaching, and when the employee was told about any concern.',
        fr: 'Formation, encadrement, et le moment où l’employé(e) a été informé(e) d’une préoccupation.',
      },
      hint: {
        en: 'A concern raised for the first time in this review is a concern the employee never had a chance to fix.',
        fr: 'Une préoccupation soulevée pour la première fois dans cette évaluation n’a jamais pu être corrigée par l’employé(e).',
      },
    },
    {
      id: 'outcome',
      section: {
        en: 'Outcome',
        fr: 'Résultat',
      },
      label: {
        en: 'Outcome and what happens next',
        fr: 'Résultat et suite des choses',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Confirmed in the role, probation extended, or employment ending — and what follows from that.',
        fr: 'Confirmation dans le poste, prolongation de la probation ou fin d’emploi — et ce qui en découle.',
      },
      hint: {
        en: 'If employment is ending, this document is the record — the notice itself is a separate letter (T03).',
        fr: 'Si l’emploi prend fin, ce document constitue le dossier — l’avis lui-même fait l’objet d’une lettre distincte (T03).',
      },
    },
    {
      id: 'effective_date',
      section: {
        en: 'Outcome',
        fr: 'Résultat',
      },
      label: {
        en: 'Effective date',
        fr: 'Date d’effet',
      },
      type: 'date',
      required: true,
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Probationary Period Review',
        fr: 'Évaluation de la période de probation',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{employee_name}} · Started {{start_date}} · {{today}}',
        fr: '{{org}} · {{employee_name}} · En poste depuis le {{start_date}} · {{today}}',
      },
    },
    {
      type: 'para',
      text: {
        en: 'This review records how the first months of {{employee_name}}’s employment went, against what was set out at hire, and what {{org}} has decided as a result.',
        fr: 'La présente évaluation consigne le déroulement des premiers mois d’emploi de {{employee_name}} au regard de ce qui avait été convenu à l’embauche, ainsi que la décision qu’en tire {{org}}.',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{expectations}}',
        fr: '{{expectations}}',
      },
      n: 1,
      heading: {
        en: 'What was expected',
        fr: 'Ce qui était attendu',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{observations}}',
        fr: '{{observations}}',
      },
      n: 2,
      heading: {
        en: 'What was observed',
        fr: 'Ce qui a été observé',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{support_given}}',
        fr: '{{support_given}}',
      },
      n: 3,
      heading: {
        en: 'Support and feedback provided',
        fr: 'Soutien et rétroaction fournis',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{outcome}} This takes effect on {{effective_date}}.',
        fr: '{{outcome}} Cette décision prend effet le {{effective_date}}.',
      },
      n: 4,
      heading: {
        en: 'Outcome',
        fr: 'Résultat',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Service is counted from {{start_date}} under {{statute}}, and an extended probation does not restart it. Extending a probationary period changes a term of the contract, so it needs the employee’s agreement to hold.',
        fr: 'Le service est calculé depuis le {{start_date}} sous {{statute}}, et une probation prolongée ne le fait pas recommencer. Prolonger une période de probation modifie une condition du contrat et requiert donc l’accord de l’employé(e) pour être valide.',
      },
      n: 5,
      heading: {
        en: 'Service and any extension',
        fr: 'Service et prolongation',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'This workplace is unionized: the collective agreement sets the probationary period, what may be assessed during it, and the recourse available at its end. Those terms govern this review.',
        fr: 'Ce milieu de travail est syndiqué : la convention collective fixe la période de probation, ce qui peut y être évalué et les recours ouverts à son terme. Ces conditions régissent la présente évaluation.',
      },
      heading: {
        en: 'Collective agreement',
        fr: 'Convention collective',
      },
      when: {
        union: true,
      },
    },
    {
      type: 'sig',
      roles: [
        {
          en: 'Manager',
          fr: 'Gestionnaire',
        },
        {
          en: 'Employee',
          fr: 'Employé(e)',
        },
      ],
    },
    {
      type: 'note',
      text: {
        en: 'A probationary period is a term of the contract, not a status employment standards legislation recognises. It does not suspend human rights obligations, the duty to accommodate, or any protection against reprisal — all of which apply from the first day.',
        fr: 'La période de probation est une condition du contrat et non un statut reconnu par la législation sur les normes du travail. Elle ne suspend ni les obligations en matière de droits de la personne, ni l’obligation d’accommodement, ni la protection contre les représailles — toutes applicables dès le premier jour.',
      },
      tone: 'risk',
    },
    {
      type: 'note',
      tone: 'info',
      text: {
        en: 'Generated from your answers as a starting point.',
        fr: 'Généré à partir de vos réponses comme point de départ.',
      },
    },
    {
      type: 'note',
      tone: 'info',
      text: DOC_DISCLAIMER_NOTE,
    },
  ],
  subject: 'employee',
}
