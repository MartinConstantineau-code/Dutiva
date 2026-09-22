/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 1, Compliance & Admin (docs/FOUR_RING_FRAMEWORK.md). One of the eight
   Ring 1 tools the framework lists that had no template.

   The framework calls this a reference doc, but there is no surface for
   reference content in the product (see the framework doc's "what the
   remaining tools need"). Built instead as a preparation record — the same
   shape as the ported offboarding checklist (T18) — so it is an artifact
   that goes on the file rather than an article nobody opens.

   It deliberately does not state a filing deadline. The deadline depends on
   whether you file electronically or on paper and on your pay-period
   schedule, and a wrong date here would be a compliance defect, not a typo.
   The employer computes it and records it. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT29: DocTemplate = {
  id: 'tpl_t29',
  tid: 'T29',
  key: 'roe_preparation_guide',
  kind: 'checklist',
  category: 'termination',
  core: true,
  name: {
    en: 'Record of Employment preparation',
    fr: 'Préparation du relevé d’emploi',
  },
  desc: {
    en: 'Assembles what the ROE needs before you file it, and records the reason code you used — the field that decides the EI claim.',
    fr: 'Rassemble les éléments requis au relevé d’emploi avant sa transmission et consigne le code de motif utilisé — le champ qui détermine la demande d’assurance-emploi.',
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
      en: 'Employment Insurance Act and its regulations — the ROE is a federal obligation for every employer',
      fr: 'Loi sur l’assurance-emploi et ses règlements — le relevé d’emploi est une obligation fédérale pour tout employeur',
    },
    {
      en: 'Filed with Service Canada — and on paper, Part 1 goes to the employee',
      fr: 'Transmis à Service Canada — et, sur papier, la partie 1 est remise à l’employé',
    },
    {
      en: 'Employment standards — final pay and vacation pay feed the insurable amounts',
      fr: 'Normes du travail — la paie finale et l’indemnité de vacances alimentent les montants assurables',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'The ROE obligation is federal and applies whichever employment standards act covers you. Final pay and accrued vacation pay owed under the Employment Standards Act, 2000 must be settled correctly first, because they feed the insurable earnings you report.',
      fr: 'L’obligation de produire un relevé d’emploi est fédérale et s’applique quelle que soit la loi sur les normes du travail dont vous relevez. La paie finale et l’indemnité de vacances accumulée dues sous la Loi de 2000 sur les normes d’emploi doivent d’abord être établies correctement, car elles alimentent la rémunération assurable déclarée.',
    },
    QC: {
      en: 'The federal ROE is required in addition to any Québec obligation, and its reason code should be consistent with the notice position you took under the Act respecting labour standards. Where the separation follows an employment injury, the CNESST file is separate and does not replace the ROE.',
      fr: 'Le relevé d’emploi fédéral est requis en sus de toute obligation québécoise, et son code de motif doit concorder avec la position adoptée quant au préavis sous la Loi sur les normes du travail. Lorsque la fin d’emploi fait suite à une lésion professionnelle, le dossier CNESST est distinct et ne remplace pas le relevé d’emploi.',
    },
    FED: {
      en: 'Federally regulated employers file the same ROE. Keep its reason code consistent with the position taken under the Canada Labour Code, Part III — a code implying misconduct alongside a without-cause notice payment is a contradiction on the record.',
      fr: 'Les employeurs de compétence fédérale produisent le même relevé d’emploi. Veillez à ce que le code de motif concorde avec la position adoptée sous le Code canadien du travail, Partie III — un code évoquant l’inconduite accompagné d’une indemnité de préavis sans motif constitue une contradiction au dossier.',
    },
  },
  includes: [
    {
      en: 'Interruption of earnings date',
      fr: 'Date d’arrêt de la rémunération',
    },
    {
      en: 'Filing deadline you computed',
      fr: 'Date limite de transmission calculée',
    },
    {
      en: 'Insurable hours and earnings',
      fr: 'Heures et rémunération assurables',
    },
    {
      en: 'Final payments included',
      fr: 'Paiements finaux inclus',
    },
    {
      en: 'Reason code and why it fits',
      fr: 'Code de motif et sa justification',
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
      id: 'last_day_paid',
      section: {
        en: 'Dates',
        fr: 'Dates',
      },
      label: {
        en: 'Last day for which paid',
        fr: 'Dernier jour rémunéré',
      },
      type: 'date',
      required: true,
      hint: {
        en: 'Not the last day worked, if those differ — this is the date the interruption of earnings is measured from.',
        fr: 'Ce n’est pas le dernier jour travaillé s’ils diffèrent — c’est la date à partir de laquelle l’arrêt de la rémunération se calcule.',
      },
    },
    {
      id: 'filing_deadline',
      section: {
        en: 'Dates',
        fr: 'Dates',
      },
      label: {
        en: 'Filing deadline you computed',
        fr: 'Date limite de transmission calculée',
      },
      type: 'date',
      required: true,
      hint: {
        en: 'The deadline depends on whether you file electronically or on paper and on your pay-period schedule. Confirm the current rule with Service Canada and record the date you arrived at.',
        fr: 'La date limite dépend du mode de transmission — électronique ou papier — et de votre calendrier de paie. Validez la règle en vigueur auprès de Service Canada et consignez la date obtenue.',
      },
    },
    {
      id: 'insurable_totals',
      section: {
        en: 'Amounts',
        fr: 'Montants',
      },
      label: {
        en: 'Insurable hours and earnings',
        fr: 'Heures et rémunération assurables',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Totals for the reportable periods, and where they were pulled from.',
        fr: 'Totaux pour les périodes à déclarer et leur source.',
      },
    },
    {
      id: 'final_payments',
      section: {
        en: 'Amounts',
        fr: 'Montants',
      },
      label: {
        en: 'Final payments included',
        fr: 'Paiements finaux inclus',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Vacation pay, pay in lieu, severance, bonus — and which block each was reported in.',
        fr: 'Indemnité de vacances, indemnité tenant lieu de préavis, indemnité de départ, prime — et le bloc où chacun a été déclaré.',
      },
      hint: {
        en: 'Reporting these in the wrong block delays the claim, and the employee finds out before you do.',
        fr: 'Déclarer ces montants dans le mauvais bloc retarde la demande, et l’employé(e) s’en aperçoit avant vous.',
      },
    },
    {
      id: 'reason_code',
      section: {
        en: 'Reason',
        fr: 'Motif',
      },
      label: {
        en: 'Reason code used, and why it fits',
        fr: 'Code de motif utilisé et sa justification',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'The code, and the facts that support it.',
        fr: 'Le code et les faits qui l’appuient.',
      },
      hint: {
        en: 'This is the field that decides the claim. It has to match what actually happened and what your separation letter says.',
        fr: 'C’est le champ qui détermine la demande. Il doit correspondre aux faits réels et au contenu de votre lettre de fin d’emploi.',
      },
    },
    {
      id: 'prepared_by',
      section: {
        en: 'Reason',
        fr: 'Motif',
      },
      label: {
        en: 'Prepared by',
        fr: 'Préparé par',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Name and role',
        fr: 'Nom et fonction',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Record of Employment — Preparation Record',
        fr: 'Relevé d’emploi — dossier de préparation',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{employee_name}} · Internal — this record is not the ROE',
        fr: '{{org}} · {{employee_name}} · Interne — le présent dossier n’est pas le relevé d’emploi',
      },
    },
    {
      type: 'para',
      text: {
        en: 'This record assembles what the Record of Employment for {{employee_name}} needs, and keeps the reasoning behind the reason code on file. It is not the ROE itself. Where you file electronically, the ROE goes to Service Canada and the employee reaches it through their own Service Canada account — you do not hand them a copy. Where you file on paper, Part 1 of the form is the employee’s and must be given to them.',
        fr: 'Le présent dossier rassemble les éléments requis au relevé d’emploi de {{employee_name}} et conserve le raisonnement justifiant le code de motif. Il ne constitue pas le relevé d’emploi lui-même. En cas de transmission électronique, le relevé est acheminé à Service Canada et l’employé(e) y accède par son propre compte Service Canada — vous ne lui remettez aucune copie. En cas de transmission papier, la partie 1 du formulaire lui revient et doit lui être remise.',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Earnings were interrupted after {{last_day_paid}}. The filing deadline computed for this ROE is {{filing_deadline}}.',
        fr: 'La rémunération a été interrompue après le {{last_day_paid}}. La date limite de transmission calculée pour ce relevé d’emploi est le {{filing_deadline}}.',
      },
      n: 1,
      heading: {
        en: 'Dates',
        fr: 'Dates',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{insurable_totals}}',
        fr: '{{insurable_totals}}',
      },
      n: 2,
      heading: {
        en: 'Insurable hours and earnings',
        fr: 'Heures et rémunération assurables',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{final_payments}} Final pay and accrued vacation pay owed under {{statute}} are settled before filing, because what is owed determines what is reported.',
        fr: '{{final_payments}} La paie finale et l’indemnité de vacances accumulée dues en vertu de {{statute}} sont réglées avant la transmission, car ce qui est dû détermine ce qui est déclaré.',
      },
      n: 3,
      heading: {
        en: 'Final payments',
        fr: 'Paiements finaux',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{reason_code}} This code is consistent with the separation documents on file. Prepared by {{prepared_by}} on {{today}}.',
        fr: '{{reason_code}} Ce code concorde avec les documents de fin d’emploi au dossier. Préparé par {{prepared_by}} le {{today}}.',
      },
      n: 4,
      heading: {
        en: 'Reason code',
        fr: 'Code de motif',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Where the separation follows an employment injury, the CNESST file is separate and does not replace this filing.',
        fr: 'Lorsque la fin d’emploi fait suite à une lésion professionnelle, le dossier CNESST est distinct et ne remplace pas la présente transmission.',
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
      type: 'note',
      text: {
        en: 'The reason code is the consequential field. A code that mischaracterises the separation — misconduct where the file says without cause, or quit where the employee was let go — can cost the employee their claim and will be read as the employer’s own account of what happened if the separation is later disputed.',
        fr: 'Le code de motif est le champ déterminant. Un code qui dénature la fin d’emploi — inconduite alors que le dossier indique une cessation sans motif, ou départ volontaire alors que la personne a été congédiée — peut priver l’employé(e) de sa prestation et sera interprété comme la version même de l’employeur si la fin d’emploi est ultérieurement contestée.',
      },
      tone: 'risk',
    },
    {
      type: 'note',
      tone: 'info',
      text: {
        en: 'Filing deadlines and reason codes are set by Service Canada and change from time to time. Confirm both against the current employer guide before you file.',
        fr: 'Les délais de transmission et les codes de motif sont établis par Service Canada et changent à l’occasion. Validez les deux auprès du guide de l’employeur en vigueur avant de transmettre.',
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
