/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 1, Employment Changes (docs/FOUR_RING_FRAMEWORK.md). One of the eight
   Ring 1 tools the framework lists that had no template.

   Reinstatement is the point. Every jurisdiction Dutiva covers gives a
   returning employee the same position, or a comparable one at no less pay —
   and "the role changed while you were away" is where that goes wrong. Where
   the return needs adjustments, this hands off to the accommodation plan
   (T23) rather than improvising them here. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT27: DocTemplate = {
  id: 'tpl_t27',
  tid: 'T27',
  key: 'return_from_leave_confirmation',
  kind: 'letter',
  category: 'changes',
  core: true,
  name: {
    en: 'Return from leave confirmation',
    fr: 'Confirmation de retour de congé',
  },
  desc: {
    en: 'Confirms the return date and the position being returned to — same role or a comparable one, at no less than the pay the leave started at.',
    fr: 'Confirme la date de retour et le poste réintégré — le même ou un poste comparable, à une rémunération au moins égale à celle du début du congé.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-01',
  updatedAt: '2026-08-01',
  estMinutes: 6,
  usageCount: 0,
  statutory: [
    {
      en: 'Employment standards — reinstatement to the same or a comparable position',
      fr: 'Normes du travail — réintégration dans le même poste ou un poste comparable',
    },
    {
      en: 'Reprisal prohibition — taking a statutory leave cannot be held against an employee',
      fr: 'Interdiction de représailles — un congé prévu par la loi ne peut être reproché à un employé',
    },
    {
      en: 'Human rights legislation — duty to accommodate on return where limitations remain',
      fr: 'Législation sur les droits de la personne — obligation d’accommodement au retour si des limitations subsistent',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'The Employment Standards Act, 2000 requires reinstatement to the position most recently held if it still exists, or to a comparable one if it does not, at no less than the rate the employee was earning — including any increase they would have received had they not been on leave. Reprisal for taking a leave is prohibited.',
      fr: 'La Loi de 2000 sur les normes d’emploi exige la réintégration dans le poste occupé en dernier lieu s’il existe toujours, ou dans un poste comparable à défaut, à un taux au moins égal à celui que touchait l’employé(e) — y compris toute augmentation qu’il ou elle aurait reçue sans le congé. Les représailles liées à la prise d’un congé sont interdites.',
    },
    QC: {
      en: 'The Act respecting labour standards requires reinstatement to the former position with the same benefits, including the wage the employee would be entitled to had they remained at work. Where the absence followed an employment injury, the CNESST return-to-work rules govern the return itself.',
      fr: 'La Loi sur les normes du travail exige la réintégration dans le poste habituel avec les mêmes avantages, y compris le salaire auquel l’employé(e) aurait droit s’il ou elle était resté(e) au travail. Lorsque l’absence fait suite à une lésion professionnelle, les règles de retour au travail de la CNESST régissent le retour lui-même.',
    },
    FED: {
      en: 'The Canada Labour Code, Part III requires reinstatement to the former position or a comparable one at no less than the former wages and benefits, and pension, health and disability plans continue to accrue across the leave. Reprisal for taking a leave is prohibited.',
      fr: 'Le Code canadien du travail, Partie III exige la réintégration dans le poste antérieur ou un poste comparable, à un salaire et à des avantages au moins équivalents, et les régimes de retraite, de santé et d’invalidité continuent de s’accumuler pendant le congé. Les représailles liées à la prise d’un congé sont interdites.',
    },
  },
  includes: [
    {
      en: 'Return date',
      fr: 'Date de retour',
    },
    {
      en: 'Position being returned to',
      fr: 'Poste réintégré',
    },
    {
      en: 'Pay, benefits and service continuity',
      fr: 'Rémunération, avantages et continuité du service',
    },
    {
      en: 'Any adjustments on return',
      fr: 'Ajustements au retour',
    },
    {
      en: 'What changed while they were away',
      fr: 'Ce qui a changé pendant l’absence',
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
      id: 'return_date',
      section: {
        en: 'Return',
        fr: 'Retour',
      },
      label: {
        en: 'Return date',
        fr: 'Date de retour',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'position_title',
      section: {
        en: 'Return',
        fr: 'Retour',
      },
      label: {
        en: 'Position being returned to',
        fr: 'Poste réintégré',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Job title',
        fr: 'Titre du poste',
      },
      hint: {
        en: 'If this is not the position they left, the standard is comparable — same pay, comparable duties and status. A quieter or narrower version of the job is not comparable.',
        fr: 'S’il ne s’agit pas du poste quitté, la norme est la comparabilité — même rémunération, tâches et statut comparables. Une version plus effacée ou plus étroite du poste n’est pas comparable.',
      },
    },
    {
      id: 'compensation',
      section: {
        en: 'Return',
        fr: 'Retour',
      },
      label: {
        en: 'Pay and benefits on return',
        fr: 'Rémunération et avantages au retour',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Include any increase applied to the role while they were away.',
        fr: 'Incluez toute augmentation appliquée au poste pendant l’absence.',
      },
    },
    {
      id: 'whats_changed',
      section: {
        en: 'Re-onboarding',
        fr: 'Réintégration',
      },
      label: {
        en: 'What changed while they were away',
        fr: 'Ce qui a changé pendant l’absence',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Team, systems, policies, clients — and who will bring them up to speed.',
        fr: 'Équipe, systèmes, politiques, clients — et qui les mettra à jour.',
      },
    },
    {
      id: 'adjustments',
      section: {
        en: 'Re-onboarding',
        fr: 'Réintégration',
      },
      label: {
        en: 'Adjustments on return',
        fr: 'Ajustements au retour',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Phased hours, modified duties, or none — say which, and for how long.',
        fr: 'Retour progressif, tâches modifiées ou aucun ajustement — précisez lesquels et pour quelle durée.',
      },
      hint: {
        en: 'Anything ongoing belongs in an accommodation plan (T23), not in a return letter.',
        fr: 'Tout ajustement durable relève d’un plan d’accommodement (T23), non d’une lettre de retour.',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Confirmation of Return from Leave',
        fr: 'Confirmation de retour de congé',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{employee_name}} · Returning {{return_date}}',
        fr: '{{org}} · {{employee_name}} · Retour le {{return_date}}',
      },
    },
    {
      type: 'para',
      text: {
        en: 'Welcome back, {{employee_name}}. This letter confirms your return on {{return_date}} and the terms you return on.',
        fr: 'Bon retour, {{employee_name}}. La présente lettre confirme votre retour le {{return_date}} ainsi que les conditions qui s’y rattachent.',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'You return to the position of {{position_title}}. {{compensation}}',
        fr: 'Vous réintégrez le poste de {{position_title}}. {{compensation}}',
      },
      n: 1,
      heading: {
        en: 'Your position and pay',
        fr: 'Votre poste et votre rémunération',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Your service is continuous across the leave under {{statute}}. Nothing about having taken it affects your standing, your entitlements, or how your work is assessed from here.',
        fr: 'Votre service demeure continu pendant le congé au sens de {{statute}}. Le fait de l’avoir pris n’a aucune incidence sur votre statut, vos droits ou l’appréciation de votre travail à compter de maintenant.',
      },
      n: 2,
      heading: {
        en: 'Service and standing',
        fr: 'Service et statut',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{whats_changed}}',
        fr: '{{whats_changed}}',
      },
      n: 3,
      heading: {
        en: 'What changed while you were away',
        fr: 'Ce qui a changé pendant votre absence',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{adjustments}} If you need something adjusted that is not listed here, tell your manager — we can look at it, and doing so is not a mark against your return.',
        fr: '{{adjustments}} Si vous avez besoin d’un ajustement qui ne figure pas ici, informez-en votre gestionnaire — nous pouvons l’examiner, et une telle demande ne compte pas contre vous.',
      },
      n: 4,
      heading: {
        en: 'Adjustments',
        fr: 'Ajustements',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Where the absence followed an employment injury, the CNESST return-to-work process governs the return and its timelines, and this letter operates alongside it.',
        fr: 'Lorsque l’absence fait suite à une lésion professionnelle, le processus de retour au travail de la CNESST régit le retour et ses délais, et la présente lettre s’applique parallèlement.',
      },
      heading: {
        en: 'Employment injury',
        fr: 'Lésion professionnelle',
      },
      when: {
        juris: 'QC',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'This workplace is unionized: seniority accrual across the leave and the placement rights on return are set by the collective agreement.',
        fr: 'Ce milieu de travail est syndiqué : l’accumulation de l’ancienneté pendant le congé et les droits de placement au retour sont fixés par la convention collective.',
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
          en: 'Employer representative',
          fr: 'Représentant de l’employeur',
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
        en: 'Returning someone to a lesser role, or to the same title with the interesting work removed, is the most common way a reinstatement obligation is breached — and it reads as reprisal for having taken the leave. If the position genuinely no longer exists, document why before offering a comparable one.',
        fr: 'Réintégrer une personne dans un poste inférieur, ou dans le même titre vidé de ses tâches intéressantes, est la façon la plus courante de manquer à l’obligation de réintégration — et cela s’interprète comme des représailles pour avoir pris le congé. Si le poste n’existe véritablement plus, documentez-en la raison avant d’offrir un poste comparable.',
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
