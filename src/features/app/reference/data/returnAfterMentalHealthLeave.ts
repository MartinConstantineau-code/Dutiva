import { bi } from '@/i18n/core'
import { contrast, li, p } from '../guideModel'
import type { ReferenceGuide } from '../guideModel'

/**
 * Ring 2, Pillar A — return to work after a mental health leave
 * (docs/FOUR_RING_FRAMEWORK.md). All FR is [FR self-authored].
 *
 * **Built as a guide, not a template, on purpose.** The obvious reading of
 * the framework's "return-to-work after mental health leave" is a plan
 * document — and that document already exists twice. T27 confirms the return
 * and the position; T23 records the adjustments and who owns each. A third
 * template would have sat between them repeating both, which is the
 * near-duplicate trap this doc has now recorded twice.
 *
 * What is genuinely missing is not a form. It is the judgement: that a
 * graduated return is a real accommodation rather than a favour, that a
 * return date is not a recovery date, that the manager receiving the person
 * back must be told what changes and never why, and that the plan needs a
 * relapse path decided while everyone is calm.
 *
 * No figures. Ramp lengths, benefit durations and insurer requirements are
 * set by the plan and the treating clinician, not by anything general — and a
 * guide carrying a "typical four weeks" is a guide that becomes the standard
 * someone is measured against.
 */
export const returnAfterMentalHealthLeaveGuide: ReferenceGuide = {
  slug: 'return-after-mental-health-leave',
  ring: 2,
  jurisdictions: ['ON', 'QC', 'FED'],
  readingMinutes: 8,
  title: bi(
    'Coming back after a mental health leave',
    'Le retour après un congé pour santé mentale',
  ),
  summary: bi(
    'Why the return is the part that fails, what a graduated return actually is, and what the receiving manager is allowed to know.',
    'Pourquoi le retour est l’étape qui échoue, ce qu’est réellement un retour progressif, et ce que le gestionnaire d’accueil a le droit de savoir.',
  ),
  tag: bi('Wellness · All jurisdictions', 'Mieux-être · Toutes les juridictions'),
  relatedTemplates: ['T27', 'T23', 'T21', 'T33'],
  relatedFlows: ['leave-of-absence', 'duty-to-accommodate'],
  sections: [
    {
      heading: bi('The return is where it fails', 'C’est au retour que cela échoue'),
      blocks: [
        p(
          'Employers put their attention into the departure — the leave approved, the cover arranged, the benefit claim started — and treat the return as the day the problem ends. It is the day the risk starts. Mental health conditions recur, a return that goes badly is one of the things a plan can do something about, and an employee who tried to come back and found it unworkable has learned something about doing it again.',
          'Les employeurs concentrent leur attention sur le départ — le congé approuvé, le remplacement organisé, la demande de prestations lancée — et voient le retour comme le jour où le problème se termine. C’est le jour où le risque commence. Les troubles de santé mentale sont récurrents, un retour qui se passe mal fait partie de ce sur quoi un plan peut agir, et la personne qui a tenté de revenir et a constaté que ce n’était pas viable en a tiré une leçon sur l’idée de recommencer.',
        ),
        p(
          'Two assumptions cause most of it. The first is that a fitness-to-return note means recovered; it means able to work under stated conditions, which is a different claim. The second is that the job the person left is the job waiting for them — after months of redistributed work, reorganised teams and a temporary replacement who is now good at it, that is rarely automatically true, and the obligation to make it true does not soften because it became inconvenient.',
          'Deux présomptions en sont largement responsables. La première : qu’un certificat d’aptitude au retour signifie « rétabli »; il signifie « apte à travailler à des conditions précisées », ce qui est tout autre chose. La seconde : que le poste quitté est celui qui attend la personne — après des mois de tâches redistribuées, d’équipes réorganisées et d’un remplaçant devenu compétent, cela est rarement vrai d’office, et l’obligation de le rendre vrai ne s’atténue pas parce qu’elle est devenue incommode.',
        ),
        p(
          'Plan the return when the leave starts, not when it ends. Nobody is at their most reasonable in the week of a return date.',
          'Planifiez le retour au début du congé, non à sa fin. Personne n’est au sommet de sa lucidité dans la semaine précédant une date de retour.',
        ),
      ],
    },
    {
      heading: bi('What a graduated return is', 'Ce qu’est un retour progressif'),
      blocks: [
        p(
          'A graduated return is a temporary reduction in hours, duties or both, ramping toward the full role over an agreed period. It is an accommodation — not a favour, not a probation, and not something to be quietly withdrawn when the team gets busy.',
          'Un retour progressif est une réduction temporaire des heures, des tâches ou des deux, avec une montée en charge vers le poste complet sur une période convenue. Il s’agit d’un accommodement — non d’une faveur, ni d’une probation, ni de quelque chose à retirer discrètement lorsque l’équipe est débordée.',
        ),
        p(
          'That characterisation has consequences, and they are the reason to be clear about it: it has to be documented like one, reviewed like one, and it cannot be refused without the undue hardship analysis that any other accommodation would require.',
          'Cette qualification a des conséquences, et c’est pourquoi il faut être clair : le retour progressif doit être consigné comme un accommodement, révisé comme tel, et ne peut être refusé sans l’analyse de contrainte excessive qu’exigerait tout autre accommodement.',
        ),
        li(
          'Set the ramp from what the clinician says about capacity, not from what the calendar or the workload would prefer.',
          'Établissez la progression à partir de ce que le clinicien indique sur la capacité, non de ce que le calendrier ou la charge de travail préféreraient.',
        ),
        li(
          'Reduce duties as well as hours where it applies. Three days of the full job is not a reduced load — it is the same pressure compressed, and it is the most common way a graduated return is designed to fail.',
          'Réduisez les tâches autant que les heures lorsque cela s’applique. Trois jours du poste complet ne constituent pas une charge réduite : c’est la même pression comprimée, et c’est la façon la plus courante de concevoir un retour progressif voué à l’échec.',
        ),
        li(
          'Name the review points in advance, and make the ramp adjustable in both directions. A schedule that can only move forward is a schedule that gets abandoned the first time it should have slowed.',
          'Fixez les points de révision à l’avance et rendez la progression ajustable dans les deux sens. Un calendrier qui ne peut qu’avancer est un calendrier abandonné dès la première fois où il aurait fallu ralentir.',
        ),
        li(
          'Decide what happens to pay and to benefits during the ramp before it starts, and write it down. This is the question that sours an otherwise good return.',
          'Décidez avant le début ce qu’il advient de la rémunération et des avantages pendant la progression, et consignez-le. C’est la question qui gâte un retour par ailleurs réussi.',
        ),
        contrast(
          bi(
            'Two days a week for the first three weeks, no client-facing work, and we look at it together on the 24th.',
            'Deux jours par semaine les trois premières semaines, sans travail auprès des clients, et nous faisons le point ensemble le 24.',
          ),
          bi(
            'Ease back in — take it at your own pace and let me know if it is too much.',
            'Revenez tranquillement — allez à votre rythme et dites-moi si c’est trop.',
          ),
        ),
        p(
          'The second sounds generous and delegates the whole plan to the person least placed to enforce it. It also leaves nothing to review, so nothing gets reviewed, and the ramp ends whenever the work happens to demand it.',
          'La seconde formule paraît généreuse et délègue tout le plan à la personne la moins en mesure de le faire respecter. Elle ne laisse rien à réviser, donc rien n’est révisé, et la progression prend fin dès que le travail l’exige.',
        ),
      ],
    },
    {
      heading: bi(
        'What the receiving manager is told',
        'Ce que l’on dit au gestionnaire d’accueil',
      ),
      blocks: [
        p(
          'Someone has to manage this person on Monday, and they need enough to do it. What they need is the adjustment and its duration. What they do not need, ever, is the diagnosis, the reason for the leave, or what was discussed with anyone clinical.',
          'Quelqu’un doit encadrer cette personne dès lundi et doit disposer du nécessaire pour le faire. Ce dont ce gestionnaire a besoin, c’est de l’ajustement et de sa durée. Ce dont il n’a jamais besoin, c’est du diagnostic, du motif du congé ou de la teneur des échanges avec un intervenant clinique.',
        ),
        contrast(
          bi(
            'Sam is back Monday, two days a week until the review on the 24th, and not on the on-call rota during that time.',
            'Sam revient lundi, deux jours par semaine jusqu’à la révision du 24, et sans garde pendant cette période.',
          ),
          bi(
            'Sam is back Monday — go easy, they have had a rough time.',
            'Sam revient lundi — allez-y doucement, il a traversé une période difficile.',
          ),
        ),
        p(
          'The second discloses a health matter to someone with no need for it and gives them no operational information at all. It also invites the treatment that returning employees report as the worst part: being handled.',
          'La seconde divulgue un enjeu de santé à une personne qui n’a pas à le connaître, sans lui fournir la moindre information opérationnelle. Elle invite en outre le traitement que les personnes de retour décrivent comme le plus pénible : être ménagées.',
        ),
        li(
          'Agree with the employee, before the return, what colleagues will be told about their absence — including "nothing". Most people want the ordinariness back more than they want the sympathy.',
          'Convenez avec la personne, avant le retour, de ce qui sera dit aux collègues au sujet de son absence — y compris « rien ». La plupart souhaitent davantage retrouver la normalité que recevoir de la sympathie.',
        ),
        li(
          'Keep medical documentation out of the personnel file and away from the manager. Whoever administers the accommodation holds it; the manager holds the schedule.',
          'Gardez la documentation médicale hors du dossier d’employé et hors de portée du gestionnaire. La personne qui administre l’accommodement la détient; le gestionnaire détient l’horaire.',
        ),
      ],
    },
    {
      heading: bi('The first weeks', 'Les premières semaines'),
      blocks: [
        li(
          'Have the return conversation on day one and make it short and practical: what changed while they were away, what they are picking up, what they are not.',
          'Tenez la conversation de retour dès le premier jour, brève et concrète : ce qui a changé pendant l’absence, ce que la personne reprend, ce qu’elle ne reprend pas.',
        ),
        li(
          'Do not open with an appraisal, a backlog, or a restructure announcement. Whatever is waiting, it can wait a week.',
          'N’ouvrez pas sur une évaluation, un arriéré ou l’annonce d’une réorganisation. Quoi qu’il en soit, cela peut attendre une semaine.',
        ),
        li(
          'Book short, regular check-ins with a fixed end. Standing daily contact reads as monitoring; a fortnightly fifteen minutes with a review date does not.',
          'Prévoyez des points de suivi courts et réguliers, avec une fin déterminée. Un contact quotidien permanent passe pour de la surveillance; quinze minutes aux deux semaines avec une date de révision, non.',
        ),
        li(
          'Watch for the pressure the plan does not cover — the colleague who covered and is now resentful, the client who wants continuity, the meeting that quietly gets rescheduled onto a non-working day.',
          'Surveillez les pressions que le plan ne couvre pas : le collègue qui a assuré le remplacement et en garde de l’amertume, le client qui veut de la continuité, la réunion discrètement déplacée vers une journée non travaillée.',
        ),
        li(
          'Do not let performance concerns accumulate silently during the ramp. If the adjusted expectations are not being met, say so within the adjusted expectations — the alternative is a year of unspoken notes and a conversation nobody can defend.',
          'Ne laissez pas les préoccupations de rendement s’accumuler en silence pendant la progression. Si les attentes ajustées ne sont pas satisfaites, dites-le dans le cadre de ces attentes ajustées — l’autre voie mène à un an de notes tues et à une conversation indéfendable.',
        ),
      ],
    },
    {
      heading: bi('Decide the relapse path early', 'Décidez tôt du scénario de rechute'),
      blocks: [
        p(
          'Mental health conditions recur, and a plan written as though this return is final is a plan that treats a recurrence as a failure by the employee. Agree while everyone is calm: what the person does if it becomes too much, who they tell, and what happens next.',
          'Les troubles de santé mentale sont récurrents, et un plan rédigé comme si ce retour était définitif traite une rechute comme un échec de la personne. Convenez-en pendant que tout le monde est serein : ce que la personne fait si cela devient trop, à qui elle le dit, et ce qui se passe ensuite.',
        ),
        li(
          'Name one person they can go to, and make sure that person knows they are named.',
          'Désignez une personne-ressource, et assurez-vous qu’elle sait qu’elle l’est.',
        ),
        li(
          'Establish that stepping the ramp back is a normal adjustment and not a new leave. How far back, and for how long, comes from what the person can currently do — the same functional information the ramp was set from — and not from a rule of thumb.',
          'Établissez que revenir à une étape antérieure de la progression est un ajustement normal et non un nouveau congé. Jusqu’où et pour combien de temps découle de ce que la personne peut faire à ce moment — la même information fonctionnelle qui a servi à établir la progression — et non d’une règle générale.',
        ),
        li(
          'If time away is needed again, work out what it rests on before you name it. A statutory leave is an entitlement with its own eligibility and its own remaining duration, and it may already be spent; where it is, time away can still be required as an accommodation, which is a separate analysis with a separate limit. What you must not do is promise a protection you have not checked applies.',
          'Si un nouvel arrêt est nécessaire, déterminez sur quoi il repose avant de le qualifier. Un congé prévu par la loi est un droit assorti de ses propres conditions d’admissibilité et de sa propre durée résiduelle, qui peut déjà être épuisée; le cas échéant, l’absence peut tout de même s’imposer à titre d’accommodement, ce qui constitue une analyse distincte assortie de sa propre limite. Ce qu’il ne faut pas faire, c’est promettre une protection dont vous n’avez pas vérifié l’applicabilité.',
        ),
        p(
          'One thing to be plain about with yourself: absence connected to a disability is never a discipline matter, because there is no misconduct in it, and a graduated return is not a probationary period with a pass mark. If the arrangement is being administered as though either were true, the problem is the arrangement.',
          'Une chose à vous dire clairement : une absence liée à un handicap ne relève jamais de la discipline, faute d’inconduite, et un retour progressif n’est pas une période probatoire assortie d’une note de passage. Si l’arrangement est administré comme si l’un ou l’autre était vrai, c’est l’arrangement qui pose problème.',
        ),
        p(
          'That is not the same as saying attendance can never be looked at, and an employer told the stronger version will eventually discover it was not true. Where an employee cannot attend at a workable level for the foreseeable future, the employment relationship can be brought to an end — but only on the non-culpable footing, only after the accommodation has genuinely been worked through to the point of undue hardship, and on evidence of the prognosis rather than on a count of days. Nothing about that resembles a warning, a final warning, or a threshold in an attendance policy.',
          'Cela ne revient pas à dire que la présence au travail ne peut jamais être examinée, et l’employeur à qui l’on a présenté la version forte finira par découvrir qu’elle était inexacte. Lorsqu’une personne ne peut se présenter au travail à un niveau viable dans un avenir prévisible, il est possible de mettre fin à la relation d’emploi — mais uniquement sur un fondement non disciplinaire, uniquement après que l’accommodement a véritablement été mené jusqu’à la contrainte excessive, et sur la foi du pronostic plutôt que d’un décompte de journées. Rien là-dedans ne ressemble à un avertissement, à un avertissement final ou à un seuil inscrit dans une politique de présence.',
        ),
        p(
          'This is the point at which to take advice rather than to rely on a guide. It is the single most litigated decision in this area, the record you built along the way is what it turns on, and a step taken early is not recoverable later.',
          'C’est ici qu’il faut prendre conseil plutôt que de s’en remettre à un guide. Il s’agit de la décision la plus contestée en la matière, tout repose sur le dossier constitué en cours de route, et une étape franchie trop tôt ne se rattrape pas.',
        ),
      ],
    },
  ],
  jurisdictionNotes: {
    ON: bi(
      'The Human Rights Code duty applies to the return as much as to the leave, and refusing a graduated return requires the same undue hardship analysis as any other accommodation — measured against the Code’s closed statutory list of cost, outside sources of funding, and health and safety. Where the absence arose from a workplace injury, WSIB return-to-work obligations run alongside and are separate.',
      'L’obligation prévue au Code des droits de la personne s’applique au retour autant qu’au congé, et refuser un retour progressif exige la même analyse de contrainte excessive que tout autre accommodement — appréciée au regard de la liste légale fermée du Code : le coût, les sources extérieures de financement, et la santé et la sécurité. Lorsque l’absence découle d’une lésion professionnelle, les obligations de retour au travail de la CSPAAT s’appliquent en parallèle et demeurent distinctes.',
    ),
    QC: bi(
      'The Charter of human rights and freedoms carries the duty, and Québec names no closed list of hardship factors — the analysis weighs more, so a refusal rests on more. The Act respecting labour standards protects the return itself: an employee returning from a statutory absence is reinstated to their former position with the pay and benefits they would have had. Where the absence followed a workplace injury or illness, the CNESST regime applies in addition.',
      'La Charte des droits et libertés de la personne porte l’obligation, et le Québec n’énonce aucune liste fermée de facteurs de contrainte — l’analyse pèse davantage, et un refus repose donc sur davantage. La Loi sur les normes du travail protège le retour lui-même : la personne qui revient d’une absence prévue par la loi réintègre son poste avec la rémunération et les avantages dont elle aurait bénéficié. Lorsque l’absence fait suite à une lésion professionnelle, le régime de la CNESST s’applique en sus.',
    ),
    FED: bi(
      'The Canadian Human Rights Act carries the duty, and the Canada Labour Code, Part III protects reinstatement after a statutory leave. Note the split that catches federally regulated employers with staff in Québec: the leave comes from the Code, while the benefit that funded it may have come from a provincial plan — so the leave’s end and the benefit’s end are set by different bodies and should never be assumed to be the same date.',
      'La Loi canadienne sur les droits de la personne porte l’obligation, et le Code canadien du travail, Partie III protège la réintégration après un congé prévu par la loi. Notez la dissociation qui piège les employeurs de compétence fédérale ayant du personnel au Québec : le congé découle du Code, tandis que la prestation qui l’a financé peut provenir d’un régime provincial — la fin du congé et celle de la prestation sont donc fixées par des organismes différents et ne doivent jamais être présumées coïncider.',
    ),
  },
}
