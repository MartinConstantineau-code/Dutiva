/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 1 (docs/FOUR_RING_FRAMEWORK.md). The framework lists this among the
   Ring 1 tools and calls it the document the whole Ring 2 accommodation
   process produces; it was missing from the shipped catalogue, which left
   Pillar B with nothing to hand off to. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT22: DocTemplate = {
  id: 'tpl_t22',
  tid: 'T22',
  key: 'accommodation_response',
  kind: 'letter',
  category: 'accommodation',
  core: true,
  name: {
    en: 'Accommodation request response',
    fr: 'Réponse à une demande d’accommodement',
  },
  desc: {
    en: 'The written answer to an accommodation request — what was asked, what was considered, what was decided, and when it will be reviewed.',
    fr: 'La réponse écrite à une demande d’accommodement : ce qui a été demandé, ce qui a été examiné, ce qui a été décidé et quand la décision sera révisée.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'high',
  review: 'lawyer_review_recommended',
  requiresLawyerReview: true,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-01',
  updatedAt: '2026-08-01',
  estMinutes: 10,
  usageCount: 0,
  statutory: [
    {
      en: 'Human rights legislation — duty to accommodate to the point of undue hardship',
      fr: 'Législation sur les droits de la personne — obligation d’accommodement jusqu’à la contrainte excessive',
    },
    {
      en: 'Procedural duty — the process is assessed, not only the outcome',
      fr: 'Obligation procédurale — le processus est évalué, pas seulement le résultat',
    },
    {
      en: 'Privacy — functional limitations, not diagnosis',
      fr: 'Vie privée — limitations fonctionnelles, et non diagnostic',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'The Human Rights Code sets the duty, and confines undue hardship to cost, outside sources of funding, and health and safety. Record the analysis behind the decision, not only the decision.',
      fr: 'Le Code des droits de la personne établit l’obligation et limite la contrainte excessive au coût, aux sources externes de financement et à la santé et sécurité. Consigner l’analyse qui fonde la décision, et non seulement la décision.',
    },
    QC: {
      en: 'The Charter of human rights and freedoms governs. Where the limitation arises from an employment injury, the CNESST return-to-work process runs alongside this letter rather than replacing it.',
      fr: 'La Charte des droits et libertés de la personne s’applique. Lorsque la limitation découle d’une lésion professionnelle, le processus de retour au travail de la CNESST se déroule parallèlement à la présente lettre sans s’y substituer.',
    },
    FED: {
      en: 'The Canadian Human Rights Act applies. Where the accommodation changes hours, scheduling or leave, the Canada Labour Code, Part III governs those changes.',
      fr: 'La Loi canadienne sur les droits de la personne s’applique. Lorsque l’accommodement modifie les heures, l’horaire ou les congés, le Code canadien du travail, Partie III régit ces modifications.',
    },
  },
  includes: [
    {
      en: 'What was requested',
      fr: 'Ce qui a été demandé',
    },
    {
      en: 'Information relied on',
      fr: 'Renseignements pris en compte',
    },
    {
      en: 'Decision & reasons',
      fr: 'Décision et motifs',
    },
    {
      en: 'Measures & start dates',
      fr: 'Mesures et dates d’entrée en vigueur',
    },
    {
      en: 'Review date',
      fr: 'Date de révision',
    },
    {
      en: 'What to do if circumstances change',
      fr: 'Que faire si la situation change',
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
      id: 'request_date',
      section: {
        en: 'Employee',
        fr: 'Employé',
      },
      label: {
        en: 'Date the request was received',
        fr: 'Date de réception de la demande',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'request_summary',
      section: {
        en: 'The request',
        fr: 'La demande',
      },
      label: {
        en: 'What was requested',
        fr: 'Ce qui a été demandé',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'In the employee’s own words where you have them.',
        fr: 'Dans les mots de l’employé(e) lorsque vous les avez.',
      },
      hint: {
        en: 'Restating the request accurately is part of the procedural duty — it shows what you actually assessed.',
        fr: 'Reformuler fidèlement la demande fait partie de l’obligation procédurale : cela démontre ce qui a réellement été évalué.',
      },
    },
    {
      id: 'information_relied_on',
      section: {
        en: 'The request',
        fr: 'La demande',
      },
      label: {
        en: 'Information you relied on',
        fr: 'Renseignements sur lesquels vous vous êtes appuyé',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Functional limitations, restrictions and expected duration.',
        fr: 'Limitations fonctionnelles, restrictions et durée prévue.',
      },
      hint: {
        en: 'Do not record a diagnosis. You are entitled to the limitations and the prognosis, not the medical condition behind them.',
        fr: 'Ne consignez pas de diagnostic. Vous avez droit aux limitations et au pronostic, non à la condition médicale sous-jacente.',
      },
    },
    {
      id: 'decision_summary',
      section: {
        en: 'Decision',
        fr: 'Décision',
      },
      label: {
        en: 'The decision and the reasons for it',
        fr: 'La décision et ses motifs',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'What was agreed, what was not, and why — including options explored and set aside.',
        fr: 'Ce qui a été accepté, ce qui ne l’a pas été et pourquoi — y compris les options envisagées puis écartées.',
      },
    },
    {
      id: 'measures',
      section: {
        en: 'Decision',
        fr: 'Décision',
      },
      label: {
        en: 'Measures being put in place',
        fr: 'Mesures mises en place',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Each measure and the date it starts.',
        fr: 'Chaque mesure et sa date d’entrée en vigueur.',
      },
    },
    {
      id: 'review_days',
      section: {
        en: 'Review',
        fr: 'Révision',
      },
      label: {
        en: 'Review the arrangement in',
        fr: 'Réviser l’arrangement dans',
      },
      type: 'select',
      required: true,
      hint: {
        en: 'Accommodation is ongoing, not a one-time decision. A booked review date is the evidence that it stayed under review.',
        fr: 'L’accommodement est continu et non une décision ponctuelle. Une date de révision fixée démontre qu’il est demeuré sous examen.',
      },
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
        en: 'Response to Accommodation Request',
        fr: 'Réponse à une demande d’accommodement',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{today}} · Confidential',
        fr: '{{org}} · {{today}} · Confidentiel',
      },
    },
    {
      type: 'para',
      text: {
        en: 'Dear {{employee_name}}, this letter responds to the accommodation request you made on {{request_date}}. It sets out what we understood you to be asking for, what we considered, what we have decided, and when we will look at the arrangement again.',
        fr: 'Bonjour {{employee_name}}, la présente lettre répond à la demande d’accommodement que vous avez présentée le {{request_date}}. Elle expose ce que nous avons compris de votre demande, ce que nous avons examiné, ce que nous avons décidé et le moment où nous réexaminerons l’arrangement.',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{request_summary}}',
        fr: '{{request_summary}}',
      },
      n: 1,
      heading: {
        en: 'What you asked for',
        fr: 'Ce que vous avez demandé',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'We relied on the following: {{information_relied_on}} We did not ask for, and have not recorded, your diagnosis. Information about your limitations is kept separately from your general personnel file and shared only with those who need it to put the accommodation in place.',
        fr: 'Nous nous sommes appuyés sur ce qui suit : {{information_relied_on}} Nous n’avons pas demandé votre diagnostic et ne l’avons pas consigné. Les renseignements sur vos limitations sont conservés séparément de votre dossier d’employé général et communiqués uniquement aux personnes qui en ont besoin pour mettre l’accommodement en place.',
      },
      n: 2,
      heading: {
        en: 'What we considered',
        fr: 'Ce que nous avons examiné',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{decision_summary}}',
        fr: '{{decision_summary}}',
      },
      n: 3,
      heading: {
        en: 'Our decision and why',
        fr: 'Notre décision et ses motifs',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{measures}}',
        fr: '{{measures}}',
      },
      n: 4,
      heading: {
        en: 'What we are putting in place',
        fr: 'Ce que nous mettons en place',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'We will review this arrangement with you in {{review_days}} days, and sooner if your circumstances or ours change. Accommodation is an ongoing obligation, not a single decision. If the arrangement is not working, or your limitations change, tell your manager or {{org}} and we will reopen it.',
        fr: 'Nous réviserons cet arrangement avec vous dans {{review_days}} jours, et plus tôt si votre situation ou la nôtre change. L’accommodement est une obligation continue et non une décision unique. Si l’arrangement ne fonctionne pas ou si vos limitations changent, informez-en votre gestionnaire ou {{org}} et nous le réexaminerons.',
      },
      n: 5,
      heading: {
        en: 'Review and changes',
        fr: 'Révision et modifications',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Where the limitation arises from an employment injury, the CNESST return-to-work process applies in addition to this letter and its timelines govern that part of the file.',
        fr: 'Lorsque la limitation découle d’une lésion professionnelle, le processus de retour au travail de la CNESST s’applique en sus de la présente lettre et ses délais régissent cette partie du dossier.',
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
        en: 'This workplace is unionized: the union shares the duty to accommodate. The collective agreement and its grievance procedure apply, and the union has been involved in this process to the extent the agreement requires.',
        fr: 'Ce milieu de travail est syndiqué : le syndicat partage l’obligation d’accommodement. La convention collective et sa procédure de grief s’appliquent, et le syndicat a participé au processus dans la mesure prévue par la convention.',
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
      tone: 'risk',
      text: {
        en: 'Higher-risk document. A refusal, or an accommodation that falls short of what was asked for, is the decision most often challenged — lawyer review is recommended before this is sent.',
        fr: 'Document à risque élevé. Un refus, ou un accommodement en deçà de ce qui était demandé, est la décision la plus souvent contestée — une révision juridique est recommandée avant l’envoi.',
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
