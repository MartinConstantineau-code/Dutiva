/* Originally GENERATED from the HR Documents Library handoff (dutiva-data.js)
   by scripts/generate-doclib.mjs. **That generator is retired** — its own
   header says so, its source JSON was never committed, and it fails at the
   first read. The "regenerate rather than edit" instruction it left here
   pointed at a process that no longer exists, so this file is hand-maintained
   like the rest of the catalogue. Edit it deliberately and keep the FR in
   step; docs/FOUR_RING_FRAMEWORK.md records why. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT05: DocTemplate = {
  id: 'tpl_t05',
  tid: 'T05',
  key: 'confidentiality_agreement',
  kind: 'agreement',
  category: 'agreements',
  core: true,
  name: {
    en: 'Confidentiality agreement',
    fr: 'Entente de confidentialité',
  },
  desc: {
    en: 'Protects confidential business, client, and personal information handled during employment.',
    fr: 'Protège les renseignements confidentiels d’affaires, clients et personnels traités durant l’emploi.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v2',
  versionNumber: 2,
  effectiveDate: '2026-02-15',
  updatedAt: '2026-05-14',
  estMinutes: 7,
  usageCount: 38,
  statutory: [
    {
      en: 'Common-law duty of confidence',
      fr: 'Obligation de confidentialité de common law',
    },
    {
      en: 'PIPEDA / Law 25 for personal information',
      fr: 'LPRPDE / Loi 25 pour les renseignements personnels',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Protected disclosures to a regulator and discussion of wages remain permitted.',
      fr: 'Les divulgations protégées à un organisme et les discussions salariales demeurent permises.',
    },
    QC: {
      en: 'Personal information is also governed by Law 25 obligations.',
      fr: 'Les renseignements personnels sont aussi régis par les obligations de la Loi 25.',
    },
    FED: {
      en: 'Whistleblower protections under federal law are preserved.',
      fr: 'Les protections des dénonciateurs de la loi fédérale sont préservées.',
    },
  },
  includes: [
    {
      en: 'Definition of confidential information',
      fr: 'Définition des renseignements confidentiels',
    },
    {
      en: 'Permitted use',
      fr: 'Usage permis',
    },
    {
      en: 'Return of materials',
      fr: 'Retour des documents',
    },
    {
      en: 'Protected disclosures',
      fr: 'Divulgations protégées',
    },
    {
      en: 'Survival after employment',
      fr: 'Survie après l’emploi',
    },
  ],
  questions: [
    {
      id: 'employee_name',
      section: {
        en: 'Party',
        fr: 'Partie',
      },
      label: {
        en: 'Employee full name',
        fr: 'Nom complet de l’employé(e)',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Full legal name',
        fr: 'Nom légal complet',
      },
    },
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
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Confidentiality Agreement',
        fr: 'Entente de confidentialité',
      },
    },
    {
      type: 'para',
      text: {
        en: 'Between {{org}} and {{employee_name}}, effective {{effective_date}}.',
        fr: 'Entre {{org}} et {{employee_name}}, en vigueur le {{effective_date}}.',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'The Employee will keep confidential all non-public information about {{org}}, its clients, personnel, finances, and technology, and use it only to perform the role.',
        fr: 'L’employé(e) gardera confidentiels tous les renseignements non publics sur {{org}}, ses clients, son personnel, ses finances et sa technologie, et les utilisera uniquement pour ses fonctions.',
      },
      n: 1,
      heading: {
        en: 'Confidential information',
        fr: 'Renseignements confidentiels',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'This does not limit protected disclosures to a regulator, whistleblower or human-rights complaints, or discussing wages and working conditions as permitted by law.',
        fr: 'Ceci ne limite pas les divulgations protégées à un organisme, les plaintes de dénonciation ou de droits de la personne, ni la discussion des salaires et conditions permise par la loi.',
      },
      n: 2,
      heading: {
        en: 'Protected disclosures',
        fr: 'Divulgations protégées',
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
  bodyHtmlEn:
    '<h1 class="center">Confidentiality Agreement</h1>\n<p>This Confidentiality Agreement (the <strong>Agreement</strong>) is made on <strong><span class="mf">{{agreement_date}}</span></strong>.</p>\n<h2>Between</h2>\n<p><strong><span class="mf">{{employer_legal_name}}</span></strong>, with its principal office at <strong><span class="mf">{{employer_address}}</span></strong> (the <strong>Company</strong>),</p>\n<p>— and —</p>\n<p><strong><span class="mf">{{recipient_name}}</span></strong>, of <strong><span class="mf">{{recipient_address}}</span></strong> (the <strong>Recipient</strong>).</p>\n<h2>Why we\'re asking you to sign this</h2>\n<p>In the course of your relationship with us — as an employee, contractor, advisor or counterparty — you will learn things about our business, our people, our customers and our technology that aren\'t public. Those things are how we compete, how we serve our customers, and sometimes how we keep other people\'s information safe. This Agreement is about protecting all of that, and about being clear with you about what we\'re asking.</p>\n<h2>1. What counts as Confidential Information</h2>\n<p><strong>Confidential Information</strong> means any non-public information, in any form (written, oral, electronic, visual or any other), that the Company discloses to the Recipient or that the Recipient learns from the Company, whether before or after the date of this Agreement, including:</p>\n<ul><li>Business plans, strategies, forecasts, pricing and financial information.</li><li>Customer, supplier and partner information, contracts, and communications.</li><li>Product designs, source code, algorithms, architectures, research and development.</li><li>Personnel information, including compensation, performance and personal information protected under applicable privacy law.</li><li>Any information the Company marks as confidential, or that a reasonable person would understand to be confidential in the circumstances.</li></ul>\n<p>Confidential Information does not include information that: (a) was already lawfully in the Recipient\'s possession without a duty of confidentiality before disclosure; (b) is or becomes publicly available through no fault of the Recipient; (c) is independently developed by the Recipient without using the Confidential Information; or (d) is lawfully obtained from a third party who is free to disclose it.</p>\n<h2>2. How the Recipient must treat it</h2>\n<p>The Recipient will:</p>\n<ul><li>Use the Confidential Information only for the purpose described in section 3.</li><li>Keep it secret — with at least the same care the Recipient uses for their own confidential information, and in any event no less than a reasonable standard of care.</li><li>Not disclose it to any third party without the Company\'s prior written consent, except to the Recipient\'s legal, tax or financial advisors who are bound by equivalent confidentiality obligations.</li><li>Not copy, reverse engineer, decompile or disassemble it, except as necessary for the Purpose.</li><li>Protect Confidential Information with reasonable administrative, technical and physical safeguards.</li></ul>\n<h2>3. Purpose</h2>\n<p>The Recipient may use Confidential Information only for <strong><span class="mf">{{purpose_description}}</span></strong> (the <strong>Purpose</strong>). Any other use requires the Company\'s prior written consent.</p>\n<h2>4. Required disclosures</h2>\n<p>If the Recipient is required by law, court order, or a regulator to disclose any Confidential Information, the Recipient will (where legally permitted) promptly notify the Company so that the Company may seek a protective order or other appropriate remedy, and will cooperate reasonably with any such effort. The Recipient will disclose only the portion of Confidential Information that is legally required.</p>\n<p>Nothing in this Agreement prevents the Recipient from making a protected disclosure to a regulator, law-enforcement agency or court, participating in a human-rights, whistleblower or similar complaint, or discussing wages or working conditions with coworkers as permitted by law.</p>\n<h2>5. Personal information and privacy</h2>\n<p>If Confidential Information includes personal information, the Recipient will handle it in accordance with <strong>PIPEDA (federal baseline); Ontario has no private-sector privacy statute — federal PIPEDA fills the gap</strong>. The Recipient will promptly notify the Company of any privacy incident or suspected incident.</p>\n<h2>6. Term</h2>\n<p>The Recipient\'s obligations under this Agreement begin on the date above and continue for <strong><span class="mf">{{confidentiality_term_years}}</span></strong> years after the end of the Recipient\'s relationship with the Company, or indefinitely for information that is a trade secret. Obligations under privacy law continue for as long as that law requires.</p>\n<h2>7. Return or destruction</h2>\n<p>At the Company\'s request, and in any event within <strong><span class="mf">{{return_period_days}}</span></strong> days after the end of the Recipient\'s relationship with the Company, the Recipient will return or (at the Company\'s option) securely destroy all Confidential Information, including copies, notes and derivative works. The Recipient may retain one archival copy in encrypted form solely to comply with legal or regulatory retention obligations; that copy remains subject to this Agreement for as long as it is retained.</p>\n<h2>8. No ownership transfer</h2>\n<p>All Confidential Information remains the property of the Company. Nothing in this Agreement grants the Recipient any licence or other right to the Confidential Information, except the limited right to use it for the Purpose.</p>\n<h2>9. No warranty</h2>\n<p>The Company provides the Confidential Information "as is" and makes no representation or warranty about its accuracy or completeness, except as expressly set out in another written agreement between the Parties.</p>\n<h2>10. Remedies</h2>\n<p>The Parties acknowledge that money damages alone may not be enough to remedy a breach of this Agreement, and that the Company may seek injunctive relief in addition to any other legal or equitable remedy, without having to prove actual damages and without being required to post a bond (where permitted by law).</p>\n<h2>11. General</h2>\n<p>This Agreement is governed by the laws of the Province of <strong>Province of Ontario</strong>. If any part of this Agreement is found unenforceable, the rest continues in full force. This Agreement is the entire agreement between the Parties concerning its subject matter, and may only be amended in writing signed by both Parties. The Recipient confirms that the Recipient has had the opportunity to obtain independent legal advice before signing.</p>\n<p>By signing below, the Parties confirm they have read and accept the terms of this Agreement.</p>\n<div class="spacer">&nbsp;</div>\n<table class="sig"><tr>\n        <td>\n          <div class="sig-line">______________________________________</div>\n          <div class="sig-under">Signature — <span class="mf">{{employer_signer_name}}</span></div>\n          <div class="sig-under"><span class="mf">{{employer_signer_title}}</span></div>\n          <div class="sig-under">Date: <span class="mf">{{employer_signature_date}}</span></div>\n          <div class="sig-label">COMPANY</div>\n        </td>\n        <td>\n          <div class="sig-line">______________________________________</div>\n          <div class="sig-under">Signature — <span class="mf">{{recipient_name}}</span></div>\n          <div class="sig-under"><span class="mf">{{recipient_title}}</span></div>\n          <div class="sig-under">Date: <span class="mf">{{employee_signature_date}}</span></div>\n          <div class="sig-label">RECIPIENT</div>\n        </td></tr></table>',
}
