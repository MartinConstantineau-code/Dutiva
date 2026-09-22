/* Originally GENERATED from the HR Documents Library handoff (dutiva-data.js)
   by scripts/generate-doclib.mjs. **That generator is retired** — its own
   header says so, its source JSON was never committed, and it fails at the
   first read. The "regenerate rather than edit" instruction it left here
   pointed at a process that no longer exists, so this file is hand-maintained
   like the rest of the catalogue. Edit it deliberately and keep the FR in
   step; docs/FOUR_RING_FRAMEWORK.md records why. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT12: DocTemplate = {
  id: 'tpl_t12',
  tid: 'T12',
  key: 'code_of_conduct',
  kind: 'policy',
  category: 'policies',
  core: true,
  name: {
    en: 'Code of conduct',
    fr: 'Code de conduite',
  },
  desc: {
    en: 'The baseline behavioural standard — respect, integrity, conflicts of interest, and how concerns are raised.',
    fr: 'La norme de comportement de base — respect, intégrité, conflits d’intérêts et façon de soulever des préoccupations.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'low',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v5',
  versionNumber: 5,
  effectiveDate: '2026-01-10',
  updatedAt: '2026-05-30',
  estMinutes: 7,
  usageCount: 96,
  statutory: [
    {
      en: 'Human Rights Code — respectful workplace',
      fr: 'Code des droits de la personne — milieu respectueux',
    },
    {
      en: 'Occupational Health and Safety Act',
      fr: 'Loi sur la santé et la sécurité au travail',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Align conduct expectations with OHSA workplace-harassment duties.',
      fr: 'Aligner les attentes de conduite sur les obligations de la LSST.',
    },
    QC: {
      en: 'Reflect the psychological-harassment provisions of the LSA.',
      fr: 'Refléter les dispositions sur le harcèlement psychologique de la LNT.',
    },
    FED: {
      en: 'Reflect the Work Place Harassment and Violence Prevention Regulations.',
      fr: 'Refléter le Règlement sur la prévention du harcèlement et de la violence.',
    },
  },
  includes: [
    {
      en: 'Purpose & scope',
      fr: 'Objet et portée',
    },
    {
      en: 'Respectful conduct',
      fr: 'Conduite respectueuse',
    },
    {
      en: 'Conflicts of interest',
      fr: 'Conflits d’intérêts',
    },
    {
      en: 'Company property',
      fr: 'Biens de l’entreprise',
    },
    {
      en: 'Raising concerns',
      fr: 'Soulever une préoccupation',
    },
    {
      en: 'Consequences',
      fr: 'Conséquences',
    },
  ],
  questions: [
    {
      id: 'effective_date',
      section: {
        en: 'Basics',
        fr: 'Bases',
      },
      label: {
        en: 'Effective date',
        fr: 'Date d’entrée en vigueur',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'contact',
      section: {
        en: 'Reporting',
        fr: 'Signalement',
      },
      label: {
        en: 'Who concerns go to',
        fr: 'À qui adresser les préoccupations',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'e.g. People & Culture',
        fr: 'p. ex. Personnes et culture',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Code of Conduct',
        fr: 'Code de conduite',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · Effective {{effective_date}} · {{jurisdiction}}',
        fr: '{{org}} · En vigueur le {{effective_date}} · {{jurisdiction}}',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Everyone at {{org}} is entitled to a workplace free from discrimination, harassment, and violence.',
        fr: 'Chacun chez {{org}} a droit à un milieu exempt de discrimination, de harcèlement et de violence.',
      },
      n: 1,
      heading: {
        en: 'Respectful conduct',
        fr: 'Conduite respectueuse',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Concerns may be raised in good faith to {{contact}} without fear of reprisal.',
        fr: 'Les préoccupations peuvent être soulevées de bonne foi auprès de {{contact}} sans crainte de représailles.',
      },
      n: 2,
      heading: {
        en: 'Raising concerns',
        fr: 'Soulever une préoccupation',
      },
    },
    {
      type: 'ack',
      text: {
        en: 'I acknowledge I have read and understood this document.',
        fr: 'Je reconnais avoir lu et compris le présent document.',
      },
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
  subject: 'org',
  bodyHtmlEn:
    '<h1 class="center">Code of Business Conduct and Ethics</h1>\n<p class="center"><strong>Effective:</strong> <span class="mf">{{policy_effective_date}}</span></p>\n<h2>Who this applies to</h2>\n<p>This Code applies to everyone at <span class="mf">{{employer_legal_name}}</span> — employees, officers, directors, contractors and anyone else acting for us. If you are not sure what to do, ask.</p>\n<h2>1. Our guiding principles</h2>\n<p>Good business is built on a few simple things: telling the truth, keeping promises, treating people well, and taking responsibility when something goes wrong.</p>\n<h2>2. Honesty and integrity</h2>\n<p>Be truthful with customers, partners, colleagues, and regulators. If you make a mistake, say so — early and clearly.</p>\n<h2>3. Respect and inclusion</h2>\n<p>Discrimination, harassment and retaliation — on the basis of any ground protected by the Human Rights Code, R.S.O. 1990, c. H.19 — are not permitted. Our Harassment, Discrimination and Violence Prevention Policy sets out the details.</p>\n<h2>4. Conflicts of interest</h2>\n<p>Avoid situations where your personal interests could reasonably conflict with your duty to the Company. When in doubt, disclose to your manager or <span class="mf">{{ethics_contact_name}}</span>.</p>\n<h2>5. Bribery, gifts and entertainment</h2>\n<p>We do not give or accept bribes or anything that would compromise our judgment, consistent with Canada\'s Corruption of Foreign Public Officials Act, S.C. 1998, c. 34.</p>\n<h2>6. Fair dealing</h2>\n<p>Compete on the merits of what we offer. When a contract is in place, we act in good faith and with honesty, consistent with <em>Bhasin v. Hrynew</em>, 2014 SCC 71.</p>\n<h2>7. Protection of Company assets</h2>\n<p>Use Company assets for legitimate business purposes and take reasonable care of them.</p>\n<h2>8. Accurate books and records</h2>\n<p>Our financial and business records must accurately reflect underlying transactions.</p>\n<h2>9. Confidentiality and privacy</h2>\n<p>Keep confidential information confidential. Handle personal information in accordance with PIPEDA (federal baseline).</p>\n<h2>10. Insider information</h2>\n<p>Do not trade on or share material non-public information about the Company.</p>\n<h2>11. Health, safety and the environment</h2>\n<p>Follow our health, safety and environmental policies. You have the right to refuse unsafe work under the Occupational Health and Safety Act, R.S.O. 1990, c. O.1.</p>\n<h2>12. Social media and external communications</h2>\n<p>You are personally responsible for what you post online. When in doubt, ask <span class="mf">{{ethics_contact_name}}</span> before posting.</p>\n<h2>13. Reporting a concern</h2>\n<p>If you see something that is — or might be — a violation of this Code, report it to your manager, HR, or (for anonymous reports) <span class="mf">{{whistleblower_channel}}</span>. We will not retaliate against anyone who reports in good faith.</p>\n<h2>14. Consequences of violating this Code</h2>\n<p>Violations can lead to disciplinary action, up to and including termination, consistent with <em>McKinley v. BC Tel</em>, 2001 SCC 38.</p>\n<h2>15. Review and updates</h2>\n<p>This Code is reviewed annually. The current version is available at <span class="mf">{{policy_url}}</span>.</p>',
}
