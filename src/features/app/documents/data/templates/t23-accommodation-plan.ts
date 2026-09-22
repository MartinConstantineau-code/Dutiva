/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 2, Pillar B (docs/FOUR_RING_FRAMEWORK.md). The framework calls this
   "documented agreement between employer and employee" — so it is written as
   a two-signature record of what each side committed to, not as a decision
   handed down. T22 is the decision; this is how it gets operated. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT23: DocTemplate = {
  id: 'tpl_t23',
  tid: 'T23',
  key: 'accommodation_plan',
  kind: 'plan',
  category: 'accommodation',
  core: false,
  name: {
    en: 'Accommodation plan',
    fr: 'Plan d’accommodement',
  },
  desc: {
    en: 'The working agreement once an accommodation is in place — the measures, who is responsible for each, and when it gets reviewed.',
    fr: 'L’entente de fonctionnement une fois l’accommodement en place : les mesures, la personne responsable de chacune et le moment de la révision.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-01',
  updatedAt: '2026-08-01',
  estMinutes: 9,
  usageCount: 0,
  statutory: [
    {
      en: 'Human rights legislation — duty to accommodate to the point of undue hardship',
      fr: 'Législation sur les droits de la personne — obligation d’accommodement jusqu’à la contrainte excessive',
    },
    {
      en: 'Shared duty — employer, employee and, where there is one, the union',
      fr: 'Obligation partagée — employeur, employé et, le cas échéant, syndicat',
    },
    {
      en: 'Occupational health and safety — the arrangement must be safe to operate',
      fr: 'Santé et sécurité du travail — l’arrangement doit pouvoir être appliqué en sécurité',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Under the Human Rights Code the duty continues for as long as the need does. A plan with no review date is the most common way an employer stops accommodating without deciding to.',
      fr: 'Sous le Code des droits de la personne, l’obligation subsiste tant que le besoin existe. Un plan sans date de révision est la façon la plus courante pour un employeur de cesser d’accommoder sans l’avoir décidé.',
    },
    QC: {
      en: 'The Charter of human rights and freedoms governs, and the plan must be available in French. Where the file is a CNESST return to work, that plan governs the medical side and this one should not contradict it.',
      fr: 'La Charte des droits et libertés de la personne s’applique et le plan doit être disponible en français. Lorsque le dossier est un retour au travail CNESST, ce plan-là régit le volet médical et le présent plan ne doit pas le contredire.',
    },
    FED: {
      en: 'The Canadian Human Rights Act applies. Where the plan changes hours, scheduling or leave, record the change against the Canada Labour Code, Part III entitlement it touches.',
      fr: 'La Loi canadienne sur les droits de la personne s’applique. Lorsque le plan modifie les heures, l’horaire ou les congés, consignez la modification en regard du droit visé au Code canadien du travail, Partie III.',
    },
  },
  includes: [
    {
      en: 'Functional limitations being accommodated',
      fr: 'Limitations fonctionnelles visées',
    },
    {
      en: 'Measures in place',
      fr: 'Mesures en place',
    },
    {
      en: 'Who is responsible for what',
      fr: 'Qui est responsable de quoi',
    },
    {
      en: 'Review date',
      fr: 'Date de révision',
    },
    {
      en: 'How to change the plan',
      fr: 'Comment modifier le plan',
    },
    {
      en: 'Confidentiality',
      fr: 'Confidentialité',
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
        en: 'Plan starts',
        fr: 'Début du plan',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'limitations_summary',
      section: {
        en: 'What is being accommodated',
        fr: 'Ce qui est accommodé',
      },
      label: {
        en: 'Functional limitations',
        fr: 'Limitations fonctionnelles',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'What the employee cannot do, or can do only with support — in task terms.',
        fr: 'Ce que l’employé(e) ne peut pas faire, ou ne peut faire qu’avec du soutien — en termes de tâches.',
      },
      hint: {
        en: 'Limitations, not diagnosis. This document circulates further than the medical note does.',
        fr: 'Des limitations, non un diagnostic. Ce document circule plus largement que la note médicale.',
      },
    },
    {
      id: 'measures',
      section: {
        en: 'The plan',
        fr: 'Le plan',
      },
      label: {
        en: 'Measures in place',
        fr: 'Mesures en place',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Equipment, schedule, duties, location, leave — each with the date it starts.',
        fr: 'Équipement, horaire, tâches, lieu, congés — chacun avec sa date d’entrée en vigueur.',
      },
    },
    {
      id: 'responsibilities',
      section: {
        en: 'The plan',
        fr: 'Le plan',
      },
      label: {
        en: 'Who is responsible for what',
        fr: 'Qui est responsable de quoi',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Name each measure’s owner, including what the employee agreed to do.',
        fr: 'Nommez le responsable de chaque mesure, y compris ce que l’employé(e) s’est engagé(e) à faire.',
      },
      hint: {
        en: 'An accommodation the employee is not part of operating tends not to survive contact with a busy week.',
        fr: 'Un accommodement dont l’employé(e) n’assure pas une part de l’application survit rarement à une semaine chargée.',
      },
    },
    {
      id: 'review_days',
      section: {
        en: 'Review',
        fr: 'Révision',
      },
      label: {
        en: 'Review this plan in',
        fr: 'Réviser ce plan dans',
      },
      type: 'select',
      required: true,
      options: [
        {
          value: '30',
          label: {
            en: '30 days',
            fr: '30 jours',
          },
        },
        {
          value: '60',
          label: {
            en: '60 days',
            fr: '60 jours',
          },
        },
        {
          value: '90',
          label: {
            en: '90 days',
            fr: '90 jours',
          },
        },
      ],
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Accommodation Plan',
        fr: 'Plan d’accommodement',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{employee_name}} · In effect {{start_date}} · Confidential',
        fr: '{{org}} · {{employee_name}} · En vigueur le {{start_date}} · Confidentiel',
      },
    },
    {
      type: 'para',
      text: {
        en: 'This plan records what {{org}} and {{employee_name}} agreed so that {{employee_name}} can do the job. It takes effect on {{start_date}} and stays in place until it is reviewed and changed.',
        fr: 'Le présent plan consigne ce que {{org}} et {{employee_name}} ont convenu afin que {{employee_name}} puisse accomplir son travail. Il prend effet le {{start_date}} et demeure en vigueur jusqu’à sa révision et sa modification.',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{limitations_summary}} This plan records limitations only. No diagnosis is recorded here, and none is required.',
        fr: '{{limitations_summary}} Le présent plan ne consigne que des limitations. Aucun diagnostic n’y figure et aucun n’est exigé.',
      },
      n: 1,
      heading: {
        en: 'What is being accommodated',
        fr: 'Ce qui est accommodé',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{measures}}',
        fr: '{{measures}}',
      },
      n: 2,
      heading: {
        en: 'Measures in place',
        fr: 'Mesures en place',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{responsibilities}} Making an accommodation work is shared: {{org}} puts the measures in place, and {{employee_name}} tells us if they stop working or if the limitations change.',
        fr: '{{responsibilities}} Le bon fonctionnement d’un accommodement est une responsabilité partagée : {{org}} met les mesures en place et {{employee_name}} nous informe si elles cessent d’être efficaces ou si les limitations changent.',
      },
      n: 3,
      heading: {
        en: 'Who does what',
        fr: 'Qui fait quoi',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'We will review this plan together in {{review_days}} days. Either of us can ask for a review sooner. A review is not a threat to the accommodation — it is how we check that it still fits.',
        fr: 'Nous réviserons ce plan ensemble dans {{review_days}} jours. Chacun de nous peut demander une révision plus tôt. Une révision ne menace pas l’accommodement : elle sert à vérifier qu’il demeure adapté.',
      },
      n: 4,
      heading: {
        en: 'Review',
        fr: 'Révision',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'This plan is kept separately from the general personnel file. Managers and colleagues are told what they need to do differently, not why. If the plan changes, the change is written down and both of us sign it.',
        fr: 'Le présent plan est conservé séparément du dossier d’employé général. Les gestionnaires et les collègues sont informés de ce qu’ils doivent faire différemment, non des motifs. Toute modification du plan est consignée par écrit et signée par les deux parties.',
      },
      n: 5,
      heading: {
        en: 'Confidentiality and changes',
        fr: 'Confidentialité et modifications',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Where this plan is part of a CNESST return to work, the CNESST plan governs the medical side of the file and this plan operates alongside it.',
        fr: 'Lorsque le présent plan s’inscrit dans un retour au travail CNESST, le plan de la CNESST régit le volet médical du dossier et le présent plan s’applique parallèlement.',
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
        en: 'This workplace is unionized: the union shares the duty to accommodate, the collective agreement applies to this plan, and the union representative has been given the opportunity to take part.',
        fr: 'Ce milieu de travail est syndiqué : le syndicat partage l’obligation d’accommodement, la convention collective s’applique au présent plan et le représentant syndical a eu l’occasion d’y participer.',
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
      type: 'ack',
      text: {
        en: 'I have read this plan, taken part in setting it, and understand how to ask for it to be changed.',
        fr: 'J’ai lu le présent plan, participé à son élaboration et je comprends comment en demander la modification.',
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
