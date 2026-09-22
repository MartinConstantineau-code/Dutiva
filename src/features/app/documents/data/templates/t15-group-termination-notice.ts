/* Originally GENERATED from the HR Documents Library handoff (dutiva-data.js)
   by scripts/generate-doclib.mjs. **That generator is retired** — its own
   header says so, its source JSON was never committed, and it fails at the
   first read. The "regenerate rather than edit" instruction it left here
   pointed at a process that no longer exists, so this file is hand-maintained
   like the rest of the catalogue. Edit it deliberately and keep the FR in
   step; docs/FOUR_RING_FRAMEWORK.md records why. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT15: DocTemplate = {
  id: 'tpl_t15',
  tid: 'T15',
  key: 'group_termination_notice',
  kind: 'notice',
  category: 'termination',
  core: true,
  name: {
    en: 'Group termination notice',
    fr: 'Avis de licenciement collectif',
  },
  desc: {
    en: 'For terminating 50+ employees in a short window. Triggers enhanced notice and government-notification duties.',
    fr: 'Pour la cessation de 50 employés et plus dans une courte période. Déclenche un avis bonifié et l’obligation d’aviser le gouvernement.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'high',
  review: 'lawyer_review_recommended',
  requiresLawyerReview: true,
  version: 'v2',
  versionNumber: 2,
  effectiveDate: '2026-01-30',
  updatedAt: '2026-06-16',
  estMinutes: 11,
  usageCount: 6,
  statutory: [
    {
      en: 'ESA, 2000 ss. 58–59 — mass termination',
      fr: 'LNE, 2000 art. 58–59 — licenciement collectif',
    },
    {
      en: 'Canada Labour Code ss. 212–214 — group termination',
      fr: 'Code canadien du travail art. 212–214 — licenciement collectif',
    },
    {
      en: 'Ministry / ministère notification',
      fr: 'Avis au ministère',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Terminating 50+ employees in 4 weeks triggers enhanced ESA notice (8–16 weeks) and Ministry Form 1.',
      fr: 'La cessation de 50 employés et plus en 4 semaines déclenche un avis LNE bonifié (8–16 semaines) et le formulaire 1 du ministère.',
    },
    QC: {
      en: 'The LSA requires notice to the Minister scaled by the number of employees affected.',
      fr: 'La LNT exige un avis au ministre proportionnel au nombre d’employés touchés.',
    },
    FED: {
      en: 'CLC group-termination provisions require notice to the Minister and a joint planning committee.',
      fr: 'Les dispositions du CCT exigent un avis au ministre et un comité mixte de planification.',
    },
  },
  includes: [
    {
      en: 'Affected group & count',
      fr: 'Groupe touché et nombre',
    },
    {
      en: 'Enhanced notice period',
      fr: 'Période d’avis bonifiée',
    },
    {
      en: 'Government notification',
      fr: 'Avis au gouvernement',
    },
    {
      en: 'Support & re-employment',
      fr: 'Soutien et réembauche',
    },
    {
      en: 'Individual entitlements',
      fr: 'Droits individuels',
    },
  ],
  questions: [
    {
      id: 'employee_count',
      section: {
        en: 'Scope',
        fr: 'Portée',
      },
      label: {
        en: 'Number of employees affected',
        fr: 'Nombre d’employés touchés',
      },
      type: 'number',
      required: true,
      placeholder: {
        en: 'e.g. 60',
        fr: 'p. ex. 60',
      },
    },
    {
      id: 'effective_date',
      section: {
        en: 'Timing',
        fr: 'Échéancier',
      },
      label: {
        en: 'Termination effective date',
        fr: 'Date d’effet',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'notice_weeks',
      section: {
        en: 'Entitlements',
        fr: 'Droits',
      },
      label: {
        en: 'Enhanced notice (weeks)',
        fr: 'Avis bonifié (semaines)',
      },
      type: 'number',
      required: true,
      hint: {
        en: 'Scales with the number of employees under the applicable statute.',
        fr: 'Proportionnel au nombre d’employés selon la loi applicable.',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Group Termination Notice',
        fr: 'Avis de licenciement collectif',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{today}} · {{jurisdiction}}',
        fr: '{{org}} · {{today}} · {{jurisdiction}}',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'This notice affects {{employee_count}} employees, with terminations effective {{effective_date}}.',
        fr: 'Le présent avis touche {{employee_count}} employés, avec effet le {{effective_date}}.',
      },
      n: 1,
      heading: {
        en: 'Affected group',
        fr: 'Groupe touché',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Affected employees receive {{notice_weeks}} weeks of enhanced notice, and the applicable Minister for {{jurisdiction}} will be notified as required.',
        fr: 'Les employés touchés reçoivent {{notice_weeks}} semaines d’avis bonifié, et le ministre applicable pour {{jurisdiction}} sera avisé comme l’exige la loi.',
      },
      n: 2,
      heading: {
        en: 'Enhanced notice & notification',
        fr: 'Avis bonifié et notification',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Re-employment and outplacement support will be offered to all affected employees.',
        fr: 'Un soutien à la réembauche et au reclassement sera offert à tous les employés touchés.',
      },
      n: 3,
      heading: {
        en: 'Support',
        fr: 'Soutien',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'This workplace is unionized: the collective agreement and its grievance procedure govern this process, and this document must follow the negotiated steps and timelines.',
        fr: 'Ce milieu de travail est syndiqué : la convention collective et sa procédure de grief régissent ce processus, et le présent document doit suivre les étapes et les délais négociés.',
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
        en: 'Higher-risk document. Lawyer review is recommended before this is sent or signed.',
        fr: 'Document à risque élevé. Une révision juridique est recommandée avant l’envoi ou la signature.',
      },
    },
    {
      type: 'note',
      tone: 'info',
      text: DOC_DISCLAIMER_NOTE,
    },
  ],
  subject: 'org',
  bodyHtmlEn:
    '<h1 class="center">Notice of Group Termination of Employment</h1>\n<p class="center"><strong>Issued by:</strong> <span class="mf">{{employer_legal_name}}</span> &nbsp;•&nbsp; <strong>Date:</strong> <span class="mf">{{notice_date}}</span></p>\n<p>This notice is provided to employees affected by a group termination of employment, to the Minister of Labour (or equivalent authority), and — where required — to the employees\' bargaining agent. We are issuing it because 50 or more employees are affected within a 4-week period.</p>\n<h2>1. Why this is happening</h2>\n<p><span class="mf">{{employer_legal_name}}</span> has made the difficult decision to eliminate approximately <span class="mf">{{affected_headcount}}</span> positions at <span class="mf">{{affected_location}}</span>, effective <span class="mf">{{effective_date}}</span>, for the following reason: <span class="mf">{{reason_for_group_termination}}</span>.</p>\n<h2>2. Legal framework</h2>\n<p>Group terminations in Canada are subject to enhanced notice rules. In Ontario: ESA s. 58; O. Reg. 288/01 (Form 1 required for 50+ employees). This group notice does not reduce any individual\'s entitlements under their contract, the common law, or any collective agreement.</p>\n<h2>3. Notice period and last day of work</h2>\n<p>Affected employees will receive working notice beginning on <span class="mf">{{notice_date}}</span>, with a last day of work on <span class="mf">{{effective_date}}</span>. The statutory notice period applicable to this group termination is <span class="mf">{{statutory_notice_weeks}}</span> weeks, based on the headcount of affected employees.</p>\n<h2>4. Severance, termination pay and individual entitlements</h2>\n<p>In addition to statutory notice, affected employees may be entitled to statutory severance pay where applicable legislation provides for it. The details are set out in each individual\'s termination letter.</p>\n<h2>5. Continuation of benefits</h2>\n<p>Group benefits coverage will continue through the statutory notice period at minimum. Specific end dates are set out in each affected employee\'s individual notice.</p>\n<h2>6. Employment Insurance and Record of Employment</h2>\n<p>Records of Employment will be issued promptly in accordance with the Employment Insurance Regulations, SOR/96-332, s. 19(3).</p>\n<h2>7. Career transition support</h2>\n<p>The Company is providing the following career transition support to affected employees: <span class="mf">{{career_transition_support}}</span>.</p>\n<h2>8. Union and bargaining agent notification</h2>\n<p>Where affected employees are represented by a union, that organization has been or is being notified at the same time as this notice.</p>\n<h2>9. Employee and Family Assistance Program</h2>\n<p>Our Employee and Family Assistance Program (EFAP) is available to all affected employees and their immediate family members at no cost through the transition period. Contact the EFAP at <span class="mf">{{efap_contact}}</span>.</p>\n<h2>10. Questions and contact</h2>\n<p>Please reach out to <span class="mf">{{hr_contact_name}}</span> at <span class="mf">{{hr_contact_email}}</span> or <span class="mf">{{hr_contact_phone}}</span>. We will also hold information sessions on <span class="mf">{{info_session_dates}}</span> for any affected employee who would like to attend.</p>',
}
