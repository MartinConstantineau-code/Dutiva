/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 4, Compensation & Financial Literacy (docs/FOUR_RING_FRAMEWORK.md).

   **The failure this document is built to avoid is the inflated headline.**
   A total compensation statement is normally written to make a number look
   larger than the salary, and the usual way to get there is to add in the
   employer's own costs — its share of statutory payroll contributions, its
   insurance premiums, the cost of the office. None of that is money the
   employee receives, and presenting it as compensation is the thing that
   turns a goodwill document into a resented one. Employees compare the
   headline to their bank account, and the gap is what they remember.

   So the summary separates what you are paid from what is provided to you
   and from what your employer contributes on your behalf, and it does not
   total the three. Where a figure is worth showing it is shown in its own
   column, honestly labelled.

   It also creates nothing. A summary that reads as a promise of next year's
   bonus is a summary an employer can be held to, so the closing clause says
   plainly that this describes the current position and varies no term. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT45: DocTemplate = {
  id: 'tpl_t45',
  tid: 'T45',
  key: 'total_compensation_summary',
  kind: 'record',
  category: 'compensation',
  core: false,
  name: {
    en: 'Total compensation summary',
    fr: 'Sommaire de la rémunération globale',
  },
  desc: {
    en: 'What someone receives beyond salary, separated honestly — pay, benefits provided, and employer contributions — without one inflated total.',
    fr: 'Ce qu’une personne reçoit au-delà du salaire, présenté honnêtement — rémunération, avantages fournis et cotisations de l’employeur — sans total gonflé.',
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
      en: 'A summary describes the current position and varies no term of employment',
      fr: 'Un sommaire décrit la situation actuelle et ne modifie aucune condition d’emploi',
    },
    {
      en: 'Discretionary amounts must read as discretionary, not as an entitlement',
      fr: 'Les montants discrétionnaires doivent se lire comme tels, non comme un droit acquis',
    },
    {
      en: 'Employer contributions are not employee earnings and are not totalled with them',
      fr: 'Les cotisations de l’employeur ne sont pas la rémunération de l’employé et ne s’y additionnent pas',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Nothing requires this document, and its risk is contractual rather than statutory: a summary that describes a discretionary bonus in the language of an entitlement can support an argument that it became one, particularly where it is issued annually and the wording never changes. Two related cautions. Vacation and public holiday pay are Employment Standards Act, 2000 entitlements and stating them at less than the Act requires does not reduce them. And where the Pay Transparency framework applies to what you publish, the same figures should not be described one way here and another in a posting.',
      fr: 'Rien n’exige ce document, et son risque est contractuel plutôt que législatif : un sommaire décrivant une prime discrétionnaire dans le vocabulaire d’un droit acquis peut appuyer la thèse qu’elle en est devenue un, surtout s’il est émis chaque année avec la même formulation. Deux mises en garde connexes. L’indemnité de vacances et celle des jours fériés sont des droits prévus par la Loi de 2000 sur les normes d’emploi, et les énoncer en deçà de ce qu’elle exige ne les réduit pas. Et lorsque le cadre de transparence salariale s’applique à ce que vous publiez, les mêmes montants ne devraient pas être décrits d’une façon ici et d’une autre dans une offre d’emploi.',
    },
    QC: {
      en: 'The Act respecting labour standards sets the vacation and statutory holiday minimums a summary cannot state below, and the Pay Equity Act applies to enterprises above its threshold — where it does, how compensation is described should be consistent with the pay equity plan rather than a separate account of it. The summary must be available in French where French is the language of work. Québec is a civil-law jurisdiction: whether repeated wording has turned a discretionary payment into an obligation is assessed under the Civil Code, not through the common law of contractual variation.',
      fr: 'La Loi sur les normes du travail fixe les minimums de vacances et de jours fériés sous lesquels un sommaire ne peut se situer, et la Loi sur l’équité salariale s’applique aux entreprises dépassant son seuil — le cas échéant, la description de la rémunération devrait concorder avec le plan d’équité salariale plutôt que d’en donner une version distincte. Le sommaire doit être disponible en français lorsque le français est la langue du travail. Le Québec est une juridiction de droit civil : la question de savoir si une formulation répétée a transformé un versement discrétionnaire en obligation s’apprécie sous le Code civil et non par la common law de la modification contractuelle.',
    },
    FED: {
      en: 'The Canada Labour Code, Part III sets the vacation and general holiday minimums, and the Employment Equity and pay transparency reporting obligations that apply to federally regulated employers mean the categories used here should line up with what is reported rather than being invented for this document. In a unionised workplace, the collective agreement is the source for everything in it and a summary that paraphrases it loosely will be read against it.',
      fr: 'Le Code canadien du travail, Partie III fixe les minimums de vacances et de jours fériés, et les obligations de déclaration en matière d’équité en emploi et de transparence salariale applicables aux employeurs de compétence fédérale impliquent que les catégories utilisées ici concordent avec ce qui est déclaré plutôt que d’être inventées pour ce document. En milieu syndiqué, la convention collective est la source de tout ce qu’elle contient, et un sommaire qui la paraphrase librement sera interprété au regard de celle-ci.',
    },
  },
  includes: [
    {
      en: 'What you are paid',
      fr: 'Ce qui vous est versé',
    },
    {
      en: 'What is provided to you',
      fr: 'Ce qui vous est fourni',
    },
    {
      en: 'What your employer contributes on your behalf',
      fr: 'Ce que votre employeur verse pour vous',
    },
    {
      en: 'Time away, and what it is worth',
      fr: 'Le temps de congé et sa valeur',
    },
    {
      en: 'What this document does not do',
      fr: 'Ce que le présent document ne fait pas',
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
    },
    {
      id: 'period',
      section: {
        en: 'Employee',
        fr: 'Employé',
      },
      label: {
        en: 'Period this describes',
        fr: 'Période visée',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'e.g. the year to 31 December 2026, or the position as at today.',
        fr: 'p. ex. l’année se terminant le 31 décembre 2026, ou la situation à ce jour.',
      },
    },
    {
      id: 'cash',
      section: {
        en: 'Paid to you',
        fr: 'Versé à vous',
      },
      label: {
        en: 'Salary and any other cash',
        fr: 'Salaire et autres sommes en espèces',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Base salary or rate, overtime, shift premiums, commission, allowances paid to the employee.',
        fr: 'Salaire ou taux de base, heures supplémentaires, primes de quart, commissions, indemnités versées à la personne.',
      },
      hint: {
        en: 'Only money that reaches the employee. This is the number they will check against their own records, so it has to be the one they recognise.',
        fr: 'Uniquement les sommes qui parviennent à la personne. C’est le montant qu’elle vérifiera par rapport à ses propres relevés, il doit donc être celui qu’elle reconnaît.',
      },
    },
    {
      id: 'variable',
      section: {
        en: 'Paid to you',
        fr: 'Versé à vous',
      },
      label: {
        en: 'Bonus or variable pay, and how it is decided',
        fr: 'Prime ou rémunération variable, et son mode de détermination',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'What was paid, and whether it is discretionary, formula-based, or contractual.',
        fr: 'Ce qui a été versé, et si cela est discrétionnaire, calculé par formule ou contractuel.',
      },
      hint: {
        en: 'Say which it is, in the same words every year. A discretionary bonus described as though it were part of the package, repeatedly, is how an employer ends up owing one.',
        fr: 'Précisez de quoi il s’agit, dans les mêmes termes chaque année. Une prime discrétionnaire présentée à répétition comme faisant partie de l’ensemble est la façon dont un employeur finit par en devoir une.',
      },
    },
    {
      id: 'provided',
      section: {
        en: 'Provided to you',
        fr: 'Fourni à vous',
      },
      label: {
        en: 'Benefits and other things provided',
        fr: 'Avantages et autres éléments fournis',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Health and dental coverage, life and disability insurance, assistance programme, equipment, learning budget.',
        fr: 'Couverture santé et dentaire, assurance vie et invalidité, programme d’aide, équipement, budget de formation.',
      },
    },
    {
      id: 'employer_contributions',
      section: {
        en: 'Contributed for you',
        fr: 'Versé pour vous',
      },
      label: {
        en: 'What the employer contributes on the employee’s behalf',
        fr: 'Ce que l’employeur verse pour la personne salariée',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Pension or RRSP matching, and the employer share of statutory contributions.',
        fr: 'Cotisations de retraite ou REER équivalentes, et part patronale des cotisations légales.',
      },
      hint: {
        en: 'Kept in its own section on purpose. These are real and worth knowing about, and they are not money the employee receives — adding them into one headline figure is the single fastest way to make this document resented.',
        fr: 'Placé dans sa propre section à dessein. Ces montants sont réels et méritent d’être connus, et ce ne sont pas des sommes que la personne reçoit — les fondre dans un seul chiffre global est la façon la plus rapide de rendre ce document irritant.',
      },
    },
    {
      id: 'time_off',
      section: {
        en: 'Contributed for you',
        fr: 'Versé pour vous',
      },
      label: {
        en: 'Paid time away',
        fr: 'Congés payés',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Vacation, statutory holidays, paid sick leave, any additional paid days.',
        fr: 'Vacances, jours fériés, congés de maladie payés et autres journées payées.',
      },
      hint: {
        en: 'Describe the entitlement rather than pricing it. Vacation and holiday pay are statutory minimums you cannot state below, and converting paid leave into a dollar figure reads as though the employee is being charged for taking it.',
        fr: 'Décrivez le droit plutôt que d’en chiffrer la valeur. L’indemnité de vacances et celle des jours fériés sont des minimums légaux que vous ne pouvez énoncer en deçà, et convertir un congé payé en montant donne l’impression de facturer à la personne le fait de le prendre.',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Your compensation summary',
        fr: 'Votre sommaire de rémunération',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{employee_name}} · {{org}} · {{period}} · Issued {{today}}',
        fr: '{{employee_name}} · {{org}} · {{period}} · Émis le {{today}}',
      },
    },
    {
      type: 'para',
      text: {
        en: 'This sets out what you receive from {{org}}, in three parts kept separate because they are three different things. It does not add them together — a single headline number would mix money you are paid with money you are not, and we would rather you could check every line of this against your own records.',
        fr: 'Le présent document expose ce que vous recevez de {{org}}, en trois volets tenus distincts parce qu’il s’agit de trois choses différentes. Il ne les additionne pas — un chiffre global unique mêlerait des sommes qui vous sont versées à d’autres qui ne le sont pas, et nous préférons que vous puissiez vérifier chaque ligne au regard de vos propres relevés.',
      },
    },
    {
      type: 'clause',
      n: 1,
      heading: {
        en: 'Paid to you',
        fr: 'Versé à vous',
      },
      text: {
        en: '{{cash}}',
        fr: '{{cash}}',
      },
    },
    {
      type: 'clause',
      n: 2,
      heading: {
        en: 'Bonus and variable pay',
        fr: 'Prime et rémunération variable',
      },
      text: {
        en: '{{variable}}',
        fr: '{{variable}}',
      },
    },
    {
      type: 'clause',
      n: 3,
      heading: {
        en: 'Provided to you',
        fr: 'Fourni à vous',
      },
      text: {
        en: '{{provided}}',
        fr: '{{provided}}',
      },
    },
    {
      type: 'clause',
      n: 4,
      heading: {
        en: 'Paid time away',
        fr: 'Congés payés',
      },
      text: {
        en: '{{time_off}}',
        fr: '{{time_off}}',
      },
    },
    {
      type: 'clause',
      n: 5,
      heading: {
        en: 'Contributed on your behalf',
        fr: 'Versé pour vous',
      },
      text: {
        en: '{{employer_contributions}} These are amounts {{org}} pays out because you work here. They are not part of your pay and you will not see them in your bank account — they are here because they are part of the picture, not because they are yours to spend.',
        fr: '{{employer_contributions}} Il s’agit de sommes que {{org}} verse du fait que vous travaillez ici. Elles ne font pas partie de votre rémunération et n’apparaîtront pas dans votre compte bancaire — elles figurent ici parce qu’elles font partie du portrait, non parce qu’elles vous appartiennent.',
      },
    },
    {
      type: 'clause',
      n: 6,
      heading: {
        en: 'What this document does not do',
        fr: 'Ce que le présent document ne fait pas',
      },
      text: {
        en: 'It describes the position for {{period}} and changes nothing. It is not a contract, it does not vary the terms you work under, and nothing in it is a promise about a future year — a discretionary payment described here stays discretionary. Where this summary and your employment agreement, a policy, or a collective agreement disagree, those govern and this is the document that is wrong. If a line does not match your own records, tell us: it is more likely to be an error here than there.',
        fr: 'Il décrit la situation pour la période {{period}} et ne change rien. Il ne constitue pas un contrat, ne modifie pas les conditions dans lesquelles vous travaillez, et rien de ce qu’il contient ne constitue une promesse pour une année future — un versement discrétionnaire décrit ici demeure discrétionnaire. En cas de divergence entre le présent sommaire et votre contrat de travail, une politique ou une convention collective, ce sont ces derniers qui prévalent et c’est le présent document qui est erroné. Si une ligne ne correspond pas à vos propres relevés, dites-le-nous : l’erreur est plus probable ici que chez vous.',
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
