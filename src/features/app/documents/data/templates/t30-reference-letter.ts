/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 1, Compliance & Admin (docs/FOUR_RING_FRAMEWORK.md). One of the eight
   Ring 1 tools the framework lists that had no template.

   Two exposures pull in opposite directions here: saying too much invites a
   defamation or negligent-misstatement claim, and saying pointedly little
   about one departing employee while writing warmly about others is itself
   evidence. The answer is a consistent house standard, which is what this
   document records. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT30: DocTemplate = {
  id: 'tpl_t30',
  tid: 'T30',
  key: 'reference_letter',
  kind: 'letter',
  category: 'termination',
  core: true,
  name: {
    en: 'Reference letter',
    fr: 'Lettre de recommandation',
  },
  desc: {
    en: 'Confirms role, dates and — where you choose to give one — an assessment you can stand behind, written to one consistent standard.',
    fr: 'Confirme le poste, les dates et, si vous choisissez d’en donner une, une appréciation que vous pouvez soutenir, rédigée selon une norme constante.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-01',
  updatedAt: '2026-08-01',
  estMinutes: 5,
  usageCount: 0,
  statutory: [
    {
      en: 'Defamation and negligent misstatement — say only what you can support',
      fr: 'Diffamation et déclaration inexacte faite avec négligence — n’affirmez que ce que vous pouvez appuyer',
    },
    {
      en: 'Human rights legislation — no reference to a protected ground, leave or complaint',
      fr: 'Législation sur les droits de la personne — aucune mention d’un motif protégé, d’un congé ou d’une plainte',
    },
    {
      en: 'Privacy — the employee decides who receives this',
      fr: 'Vie privée — l’employé(e) décide qui reçoit ce document',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'There is no obligation under the Employment Standards Act, 2000 to give a reference. But an employer who refuses one to a departing employee, or gives a notably thin one, can find that treated as a factor in a wrongful-dismissal or Human Rights Code claim — particularly where others received better.',
      fr: 'La Loi de 2000 sur les normes d’emploi n’impose aucune obligation de fournir une lettre de recommandation. Toutefois, l’employeur qui la refuse à une personne qui quitte, ou qui en donne une notablement mince, peut voir ce fait retenu comme élément d’une réclamation pour congédiement injustifié ou fondée sur le Code des droits de la personne — surtout si d’autres ont obtenu mieux.',
    },
    QC: {
      en: 'The Civil Code obliges an employer to provide, on request, a certificate stating the nature and duration of the employment and identifying the parties — and it must say nothing more unless the employee agrees. The Charter of human rights and freedoms bars reference to a protected ground.',
      fr: 'Le Code civil oblige l’employeur à fournir, sur demande, un certificat de travail énonçant la nature et la durée de l’emploi et identifiant les parties — et ce certificat ne peut rien contenir de plus sans l’accord de l’employé(e). La Charte des droits et libertés de la personne interdit toute mention d’un motif protégé.',
    },
    FED: {
      en: 'The Canada Labour Code, Part III does not require a reference letter. The Canadian Human Rights Act applies to its content, and a reference that alludes to a leave, a complaint or an accommodation is a live exposure regardless of how it is phrased.',
      fr: 'Le Code canadien du travail, Partie III n’exige pas de lettre de recommandation. La Loi canadienne sur les droits de la personne s’applique à son contenu, et une lettre qui fait allusion à un congé, à une plainte ou à un accommodement constitue une exposition réelle, quelle qu’en soit la formulation.',
    },
  },
  includes: [
    {
      en: 'Role and dates of employment',
      fr: 'Poste et dates d’emploi',
    },
    {
      en: 'What the role covered',
      fr: 'Ce que le poste couvrait',
    },
    {
      en: 'Assessment, where one is given',
      fr: 'Appréciation, le cas échéant',
    },
    {
      en: 'Contact for verification',
      fr: 'Personne-ressource pour vérification',
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
      id: 'position_title',
      section: {
        en: 'Employment',
        fr: 'Emploi',
      },
      label: {
        en: 'Position held',
        fr: 'Poste occupé',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Job title',
        fr: 'Titre du poste',
      },
    },
    {
      id: 'from_date',
      section: {
        en: 'Employment',
        fr: 'Emploi',
      },
      label: {
        en: 'Employed from',
        fr: 'En poste du',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'to_date',
      section: {
        en: 'Employment',
        fr: 'Emploi',
      },
      label: {
        en: 'Employed until',
        fr: 'Jusqu’au',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'scope',
      section: {
        en: 'Content',
        fr: 'Contenu',
      },
      label: {
        en: 'What the role covered',
        fr: 'Ce que le poste couvrait',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Duties and scope, stated factually.',
        fr: 'Tâches et portée, énoncées factuellement.',
      },
    },
    {
      id: 'assessment',
      section: {
        en: 'Content',
        fr: 'Contenu',
      },
      label: {
        en: 'Assessment',
        fr: 'Appréciation',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'What you can support from the record — or state that your practice is to confirm role and dates only.',
        fr: 'Ce que le dossier permet d’appuyer — ou indiquez que votre pratique se limite à confirmer le poste et les dates.',
      },
      hint: {
        en: 'Whichever you choose, apply it to everyone. A warm letter for most people and a bare one for this employee is a comparison someone can draw.',
        fr: 'Quel que soit votre choix, appliquez-le à tous. Une lettre chaleureuse pour la plupart et une lettre minimale pour cette personne constitue une comparaison qui peut être établie.',
      },
    },
    {
      id: 'contact',
      section: {
        en: 'Content',
        fr: 'Contenu',
      },
      label: {
        en: 'Contact for verification',
        fr: 'Personne-ressource pour vérification',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Name, role and how to reach them.',
        fr: 'Nom, fonction et coordonnées.',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Letter of Reference',
        fr: 'Lettre de recommandation',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{today}}',
        fr: '{{org}} · {{today}}',
      },
    },
    {
      type: 'para',
      text: {
        en: 'To whom it may concern: {{employee_name}} was employed by {{org}} as {{position_title}} from {{from_date}} to {{to_date}}.',
        fr: 'À qui de droit : {{employee_name}} a été employé(e) par {{org}} à titre de {{position_title}} du {{from_date}} au {{to_date}}.',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{scope}}',
        fr: '{{scope}}',
      },
      n: 1,
      heading: {
        en: 'The role',
        fr: 'Le poste',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{assessment}}',
        fr: '{{assessment}}',
      },
      n: 2,
      heading: {
        en: 'Assessment',
        fr: 'Appréciation',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Questions about this letter can go to {{contact}}.',
        fr: 'Toute question relative à la présente lettre peut être adressée à {{contact}}.',
      },
      n: 3,
      heading: {
        en: 'Verification',
        fr: 'Vérification',
      },
    },
    {
      type: 'sig',
      roles: [
        {
          en: 'Employer representative',
          fr: 'Représentant de l’employeur',
        },
      ],
    },
    {
      type: 'note',
      text: {
        en: 'Leave out the reason for departure, any absence or leave, any accommodation, any complaint or investigation, and anything you could not evidence from the file if asked. A reference is given to the employee to use as they choose — {{org}} does not send it to prospective employers directly.',
        fr: 'Omettez le motif du départ, toute absence ou tout congé, tout accommodement, toute plainte ou enquête, ainsi que tout élément que vous ne pourriez appuyer par le dossier si on vous le demandait. La lettre est remise à l’employé(e), qui en dispose comme il ou elle l’entend — {{org}} ne la transmet pas directement aux employeurs éventuels.',
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
