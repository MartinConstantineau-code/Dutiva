import { bi } from '@/i18n/core'
import { contrast, li, p } from '../guideModel'
import type { ReferenceGuide } from '../guideModel'

/**
 * Ring 2, Pillar D — the parental leave guide
 * (docs/FOUR_RING_FRAMEWORK.md). All FR is [FR self-authored].
 *
 * **Written without figures, and that is the decision, not an omission.**
 * The framework doc flagged this guide as inherently figure-heavy — leave
 * durations, notice periods, EI weeks, top-up percentages — and said the
 * policy had to be settled before authoring rather than after. It is settled
 * here the same way the rest of the product settles it: name the statute,
 * describe the shape of the rule, send the reader to the official text.
 *
 * The reason is not squeamishness. These numbers differ across the three
 * jurisdictions, differ again between the provincial leave and the federal
 * benefit that funds it, and move. A guide carrying them is a guide someone
 * has to re-audit every year, and the year nobody does is the year an
 * employer plans a return date around a figure that changed.
 *
 * What the reader needs from an employer-side guide is the structure —
 * that job protection and income replacement are different systems with
 * different administrators — which is exactly what does not go stale.
 */
export const parentalLeaveGuide: ReferenceGuide = {
  slug: 'parental-leave',
  ring: 2,
  jurisdictions: ['ON', 'QC', 'FED'],
  readingMinutes: 7,
  title: bi(
    'Parental leave, from the employer’s side',
    'Le congé parental, du point de vue de l’employeur',
  ),
  summary: bi(
    'Which system does what, what you owe and when, and the parts of a return that go wrong long before anyone notices.',
    'Quel système fait quoi, ce que vous devez et quand, et les aspects du retour qui déraillent bien avant qu’on ne s’en aperçoive.',
  ),
  tag: bi('Leave · All jurisdictions', 'Congé · Toutes les juridictions'),
  relatedTemplates: ['T33', 'T27', 'T29'],
  relatedFlows: ['leave-of-absence'],
  sections: [
    {
      heading: bi('Two systems, not one', 'Deux systèmes, et non un seul'),
      blocks: [
        p(
          'The single most useful thing an employer can understand here is that the leave and the money are separate systems, run by different bodies, with different rules and different clocks.',
          'La chose la plus utile à comprendre pour un employeur est que le congé et l’argent constituent deux systèmes distincts, administrés par des organismes différents, avec des règles et des échéanciers différents.',
        ),
        li(
          'Job protection comes from employment standards legislation — your provincial act, or the Canada Labour Code if you are federally regulated. It is what says the employee can go, for how long, and what they come back to. This is your obligation.',
          'La protection d’emploi découle de la législation sur les normes du travail — votre loi provinciale, ou le Code canadien du travail si vous êtes de compétence fédérale. C’est elle qui prévoit le droit de s’absenter, la durée et ce à quoi la personne revient. C’est votre obligation.',
        ),
        li(
          'Income replacement comes from Employment Insurance, or from the Québec Parental Insurance Plan in Québec. It is what the employee is paid while away, it is not paid by you, and you do not administer it.',
          'Le remplacement du revenu provient de l’assurance-emploi ou, au Québec, du Régime québécois d’assurance parentale. C’est ce que touche l’employé(e) pendant son absence; ce n’est pas vous qui le versez ni ne l’administrez.',
        ),
        p(
          'They interact, but neither one drives the other. The employee applies for the benefit themselves, and they are told not to wait for your Record of Employment to do it — your ROE supports a claim they have already started, it does not open it, and being on protected leave is not what makes them eligible. Nor do the two have to line up: an employee can be on protected leave after their benefit ends. Planning a return date from the benefit rather than from the leave is a common and consequential mistake.',
          'Les deux interagissent, mais ni l’un ni l’autre ne commande l’autre. C’est l’employé(e) qui présente lui-même sa demande de prestations, et on lui indique de ne pas attendre votre relevé d’emploi pour le faire : votre relevé appuie une demande déjà entamée, il ne l’ouvre pas, et le fait d’être en congé protégé n’est pas ce qui rend admissible. Les deux ne coïncident pas nécessairement non plus : une personne peut demeurer en congé protégé après la fin de sa prestation. Fixer une date de retour à partir de la prestation plutôt que du congé est une erreur courante et lourde de conséquences.',
        ),
        contrast(
          bi(
            'Your leave runs to the date in your letter. Your benefit is a separate arrangement with whoever pays it — Service Canada, or the QPIP if you work in Québec — and if it ends sooner your leave does not.',
            'Votre congé court jusqu’à la date indiquée dans votre lettre. Votre prestation constitue une entente distincte avec l’organisme qui la verse — Service Canada, ou le RQAP si vous travaillez au Québec — et, si elle se termine plus tôt, votre congé se poursuit.',
          ),
          bi(
            'You are back when your EI runs out.',
            'Vous revenez lorsque votre assurance-emploi prend fin.',
          ),
        ),
      ],
    },
    {
      heading: bi('More than one leave', 'Plus d’un congé'),
      blocks: [
        p(
          'Pregnancy leave and parental leave are separate entitlements with separate eligibility, and in most cases they are taken back to back rather than instead of one another. Parental leave is generally available to a parent who did not give birth, including on adoption, which is the part employers most often miss.',
          'Le congé de maternité et le congé parental constituent des droits distincts, avec des conditions d’admissibilité distinctes, et sont le plus souvent pris l’un à la suite de l’autre plutôt que l’un au lieu de l’autre. Le congé parental est généralement accessible au parent qui n’a pas accouché, y compris en cas d’adoption — c’est l’aspect le plus souvent négligé par les employeurs.',
        ),
        li(
          'Confirm which leaves the employee is taking and in what order, and record both. Two leaves recorded as one is how a return date ends up wrong.',
          'Confirmez quels congés sont pris et dans quel ordre, et consignez les deux. Deux congés consignés comme un seul mènent à une date de retour erronée.',
        ),
        li(
          'Do not assume from who is asking. The entitlement follows the role in the child’s life, not the employee’s gender.',
          'Ne présumez rien à partir de la personne qui demande. Le droit suit le rôle auprès de l’enfant, non le genre de l’employé(e).',
        ),
        li(
          'Where two parents work for you, each has their own entitlement. Check whether your jurisdiction caps what they can take together.',
          'Lorsque deux parents travaillent chez vous, chacun détient son propre droit. Vérifiez si votre juridiction plafonne ce qu’ils peuvent prendre conjointement.',
        ),
      ],
    },
    {
      heading: bi('Notice runs both ways', 'Le préavis va dans les deux sens'),
      blocks: [
        p(
          'The employee owes you notice before starting and before changing the end date; you owe them a position and, in some circumstances, notice of your own. Look both up rather than only the first — the obligation employers forget is usually theirs.',
          'L’employé(e) vous doit un préavis avant le début du congé et avant toute modification de la date de fin; vous lui devez un poste et, dans certains cas, un préavis de votre part. Vérifiez les deux plutôt que le premier seulement — l’obligation qu’oublient les employeurs est généralement la leur.',
        ),
        li(
          'Diarise the expected return the day the leave is confirmed, not the month it is due.',
          'Inscrivez le retour prévu à l’agenda dès la confirmation du congé, et non le mois où il approche.',
        ),
        li(
          'A leave that shortens or extends is normal. Check what notice the change requires and apply the same rule each time.',
          'Un congé écourté ou prolongé est chose normale. Vérifiez le préavis exigé par la modification et appliquez la même règle chaque fois.',
        ),
        li(
          'Failing to give notice does not usually cost the employee the leave. Do not treat a missed deadline as a forfeiture without checking.',
          'L’omission de donner un préavis ne fait généralement pas perdre le droit au congé. Ne traitez pas un délai manqué comme une déchéance sans vérification.',
        ),
      ],
    },
    {
      heading: bi('What continues while they are away', 'Ce qui se poursuit pendant l’absence'),
      blocks: [
        p(
          'Service usually keeps accruing, and benefit plans usually keep running with the employee continuing their share where they had one. What is easy to get wrong is not the rule but the execution — a premium that quietly stopped, a pension contribution nobody restarted.',
          'Le service continue habituellement de s’accumuler, et les régimes d’avantages se poursuivent généralement, l’employé(e) continuant d’assumer sa part le cas échéant. Ce qui se gâte n’est pas la règle mais son exécution : une prime discrètement interrompue, une cotisation de retraite que personne n’a relancée.',
        ),
        li(
          'Write down what continues at the start, and check once mid-leave that it actually did.',
          'Consignez au départ ce qui se poursuit, et vérifiez une fois en cours de congé que cela s’est réellement produit.',
        ),
        li(
          'If you offer a top-up, be precise about how long it lasts and what happens if the employee does not return — an unclear repayment term is unenforceable and sours a return.',
          'Si vous offrez un complément salarial, précisez sa durée et les conséquences d’un non-retour — une clause de remboursement imprécise est inexécutoire et empoisonne le retour.',
        ),
        li(
          'Vacation continues to accrue in most cases. Confirm whether yours must be paid out or carried over.',
          'Les vacances continuent généralement de s’accumuler. Vérifiez si les vôtres doivent être payées ou reportées.',
        ),
      ],
    },
    {
      heading: bi('The return is the risk', 'Le retour, c’est là qu’est le risque'),
      blocks: [
        p(
          'Almost everything that goes legally wrong with a parental leave goes wrong at the end of it, and rarely through bad intent. A year is long enough for a team to reorganise, for a covering hire to become indispensable, and for a role to be quietly redefined around whoever has been doing it.',
          'Presque tout ce qui déraille juridiquement dans un congé parental déraille à sa fin, et rarement par mauvaise intention. Un an suffit pour qu’une équipe se réorganise, qu’un remplacement devienne indispensable et qu’un poste soit discrètement redéfini autour de la personne qui l’occupe.',
        ),
        p(
          'The obligation is to the position they left, or a comparable one if it genuinely no longer exists, at no less than the pay they would have been earning — including increases the role received while they were away.',
          'L’obligation vise le poste quitté ou, s’il n’existe véritablement plus, un poste comparable, à une rémunération au moins égale à celle qu’ils auraient touchée — augmentations reçues par le poste pendant l’absence comprises.',
        ),
        contrast(
          bi(
            'Same title, same duties, same reporting line, plus the increase the role got in April.',
            'Même titre, mêmes tâches, même lien hiérarchique, plus l’augmentation accordée au poste en avril.',
          ),
          bi(
            'Same title, but the accounts moved to whoever covered, and the increase applied to them.',
            'Même titre, mais les dossiers sont passés à la personne qui remplaçait, et l’augmentation lui a été accordée.',
          ),
        ),
        li(
          'Plan the coverage as temporary from day one, and tell the person covering that it is.',
          'Planifiez le remplacement comme temporaire dès le premier jour, et dites-le à la personne qui remplace.',
        ),
        li(
          'If the position genuinely no longer exists, document why before you offer a comparable one — afterwards is too late to be credible.',
          'Si le poste n’existe véritablement plus, consignez-en la raison avant d’offrir un poste comparable — après coup, ce n’est plus crédible.',
        ),
        li(
          'If they need adjustments to come back — phased hours, a period of expressing milk, a changed schedule — that is accommodation, not a favour.',
          'S’ils ont besoin d’ajustements pour revenir — retour progressif, période d’allaitement, horaire modifié — il s’agit d’un accommodement, non d’une faveur.',
        ),
        li(
          'Confirm the return in writing. It is a short document that resolves most of what is otherwise argued about later.',
          'Confirmez le retour par écrit. C’est un court document qui règle l’essentiel de ce qui serait autrement contesté plus tard.',
        ),
      ],
    },
    {
      heading: bi('Where the numbers are', 'Où trouver les chiffres'),
      blocks: [
        p(
          'This guide deliberately states no durations, notice periods or benefit amounts. They differ between the three jurisdictions Dutiva covers, differ again between the leave and the benefit that funds it, and they change — a figure repeated here would be one nobody re-audits.',
          'Le présent guide n’énonce délibérément aucune durée, aucun délai de préavis ni aucun montant de prestation. Ces éléments varient entre les trois juridictions couvertes par Dutiva, varient encore entre le congé et la prestation qui le finance, et ils changent — un chiffre repris ici serait un chiffre que personne ne réviserait.',
        ),
        li(
          'For the leave: your employment standards act, or the Canada Labour Code if you are federally regulated. Your provincial ministry publishes a current summary.',
          'Pour le congé : votre loi sur les normes du travail, ou le Code canadien du travail si vous êtes de compétence fédérale. Votre ministère provincial en publie un résumé à jour.',
        ),
        li(
          'For the benefit: Service Canada for Employment Insurance, or the QPIP administrator in Québec.',
          'Pour la prestation : Service Canada pour l’assurance-emploi, ou l’administrateur du RQAP au Québec.',
        ),
        li(
          'Check both at the time you are advising, not from a note taken last year.',
          'Consultez les deux au moment où vous conseillez, et non à partir d’une note prise l’an dernier.',
        ),
      ],
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Pregnancy leave and parental leave are separate entitlements under the Employment Standards Act, 2000, with their own eligibility and notice rules, and reinstatement is to the position most recently held or a comparable one. Income replacement runs through federal Employment Insurance, so the leave and the benefit are administered by different governments and should be checked separately.',
      fr: 'Le congé de maternité et le congé parental constituent des droits distincts sous la Loi de 2000 sur les normes d’emploi, avec leurs propres conditions d’admissibilité et de préavis, et la réintégration se fait dans le poste occupé en dernier lieu ou un poste comparable. Le remplacement du revenu passe par l’assurance-emploi fédérale : le congé et la prestation relèvent donc de gouvernements différents et doivent être vérifiés séparément.',
    },
    QC: {
      en: 'Québec is the one place where the income side is provincial: the Québec Parental Insurance Plan replaces federal Employment Insurance for maternity, paternity, parental and adoption benefits, with its own eligibility and its own administrator. The leave itself comes from the Act respecting labour standards, which also provides a paternity leave that has no direct equivalent in the other jurisdictions Dutiva covers.',
      fr: 'Le Québec est le seul endroit où le volet financier est provincial : le Régime québécois d’assurance parentale remplace l’assurance-emploi fédérale pour les prestations de maternité, de paternité, parentales et d’adoption, avec ses propres conditions d’admissibilité et son propre administrateur. Le congé lui-même découle de la Loi sur les normes du travail, qui prévoit en outre un congé de paternité sans équivalent direct dans les autres juridictions couvertes par Dutiva.',
    },
    FED: {
      en: 'Federally regulated employers take the leave from the Canada Labour Code, Part III rather than from any provincial act, including for employees working in Québec — though those employees still claim through QPIP, so the leave and the benefit come from different levels of government for the same person.',
      fr: 'Les employeurs de compétence fédérale tirent le congé du Code canadien du travail, Partie III plutôt que d’une loi provinciale, y compris pour les employés travaillant au Québec — ces derniers réclamant néanmoins auprès du RQAP, de sorte que le congé et la prestation relèvent, pour une même personne, de paliers de gouvernement différents.',
    },
  },
}
