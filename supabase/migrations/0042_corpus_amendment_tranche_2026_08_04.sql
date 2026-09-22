-- Advisor grounding corpus — amendment tranche of 2026-08-04.
--
-- STATUS: APPLIED 2026-08-05, via direct Supabase MCP access to the live
-- project. Retrieval smoke test run afterward through match_advisor_guidance
-- for each amended topic in EN and FR — see
-- docs/advisor-guidance-corpus-2026-08-04.md § Not done, and why.
--
-- Closes the three work items that docs/advisor-corpus-verification-2026-08-02.md
-- recorded as blocked. That cycle stopped because every official host was refused
-- at its sandbox's egress proxy. The block was environmental: from a workstation
-- ontario.ca, canada.ca, cnesst.gouv.qc.ca, legisquebec.gouv.qc.ca and
-- laws-lois.justice.gc.ca all answer (three need a browser User-Agent).
--
-- Every figure below was fetched TWICE by two independent agents, the second
-- instructed to refute rather than confirm. Full provenance, per-figure citation
-- table and the list of what was deliberately NOT changed:
--   docs/advisor-guidance-corpus-2026-08-04.md
--
-- review_status is NOT touched — every row stays 'machine_curated'. Only a human
-- flips a row to 'reviewed' (TODO.md L5).
--
-- fts and fts_fr are STORED GENERATED columns (0022, 0029). Postgres recomputes
-- them on every UPDATE below. Never hand-write them.

-- ===========================================================================
-- WI3 (time-sensitive) — [ON] minimum wage: add the post-2026-10-01
-- special-category rates. The row carried the general rate correctly but gave
-- special-category rates only for the period ending 2026-09-30, so it went
-- stale on 2026-10-01. All four categories confirmed from the live page in both
-- languages; page "Date modified" = 2026-04-01 / « Mis à jour : 01 avril 2026 ».
-- ===========================================================================

UPDATE public.advisor_guidance_chunks SET
  content = 'Ontario''s general minimum wage (salaire minimum général) under the Employment Standards Act, 2000 (Loi de 2000 sur les normes d''emploi) is $17.60 per hour from October 1, 2025 to September 30, 2026, and rises to $17.95 per hour from October 1, 2026 to September 30, 2027. Minimum wage rates are indexed annually to the rate of inflation, and a new rate is published on or before April 1 to take effect the following October 1. Special rates for October 1, 2025 to September 30, 2026: student minimum wage (salaire minimum des étudiants) $16.60 per hour; homeworkers minimum wage (salaire minimum des travailleurs à domicile) $19.35 per hour; hunting, fishing and wilderness guides $88.05 per day when working less than five consecutive hours in a day, and $176.15 per day when working five or more hours in a day whether or not the hours are consecutive. Special rates for October 1, 2026 to September 30, 2027: student minimum wage $16.90 per hour; homeworkers minimum wage $19.70 per hour; hunting, fishing and wilderness guides $89.75 per day for less than five consecutive hours, and $179.50 per day for five or more hours. The student rate applies to students under the age of 18 who work 28 hours a week or less when school is in session, or who work during a school break or the summer holidays.',
  title_fr = 'Ontario — Salaire minimum : taux général et taux particuliers, dates d''entrée en vigueur',
  content_fr = 'En Ontario, le salaire minimum général prévu par la Loi de 2000 sur les normes d''emploi est de 17,60 $ l''heure du 1er octobre 2025 au 30 septembre 2026, et passe à 17,95 $ l''heure du 1er octobre 2026 au 30 septembre 2027. Les taux de salaire minimum font l''objet d''une indexation annuelle axée sur le taux d''inflation; le nouveau taux est publié au plus tard le 1er avril et entre en vigueur le 1er octobre suivant. Taux particuliers du 1er octobre 2025 au 30 septembre 2026 : salaire minimum des étudiants 16,60 $ l''heure; salaire minimum des travailleurs à domicile 19,35 $ l''heure; guides de chasse, de pêche et de pourvoirie 88,05 $ par jour pour moins de cinq heures consécutives dans une journée et 176,15 $ par jour pour cinq heures ou plus. Taux particuliers du 1er octobre 2026 au 30 septembre 2027 : salaire minimum des étudiants 16,90 $ l''heure; salaire minimum des travailleurs à domicile 19,70 $ l''heure; guides de chasse, de pêche et de pourvoirie 89,75 $ par jour pour moins de cinq heures consécutives et 179,50 $ par jour pour cinq heures ou plus. Le taux des étudiants s''applique aux étudiants de moins de 18 ans qui travaillent 28 heures par semaine ou moins pendant les périodes scolaires, ou qui travaillent pendant un congé scolaire ou les vacances d''été.',
  effective_note = 'General rate $17.60/hour to 2026-09-30, then $17.95/hour from 2026-10-01 through 2027-09-30. Special-category rates carried for BOTH periods. Indexed annually to inflation; the next rate is published on or before April 1 2027 for October 1 2027. Verified from ontario.ca EN + FR on 2026-08-04 (two independent fetches); page Date modified 2026-04-01.',
  retrieved_at = DATE '2026-08-04'
WHERE jurisdiction = 'ON' AND topic = 'minimum_wage';

-- ===========================================================================
-- WI1 — [FED] Canada Labour Code statutory leaves: the concern was OMISSION.
--
-- Pregnancy Loss Leave EXISTS (CLC s. 206.51, enacted 2024, c. 15, s. 198) and
-- the chunk omitted it. "Leave for the Placement of a Child" DOES NOT EXIST —
-- zero occurrences of "placement" in either language edition, and no such
-- section in Part III Division VII. Nothing was added for it.
--
-- On the in-force date: the section page shows no per-section CIF date. The
-- Act's Amendments table lists `2024, c. 15` under a column headed "Amendment
-- date" with the value 2025-12-12, matching the Act currency line "last amended
-- on 2025-12-12". The text below names the instrument and that date, and makes
-- no bare "in force on" claim, because Justice Canada does not label it one.
--
-- The page's Date modified is 2026-05-13 and the chunk was authored 2026-07-27
-- — AFTER it. So these were authoring omissions, not later amendments, and a
-- change-detection watcher would never have surfaced them.
-- ===========================================================================

UPDATE public.advisor_guidance_chunks SET
  content = 'Under Part III of the Canada Labour Code (Code canadien du travail), federally regulated employees have job-protected leaves. Medical leave with pay (congé payé pour raisons médicales): up to 10 days per year, accrued as 3 days after 30 days'' continuous employment then 1 day per completed month, with unused days carrying over to a maximum of 10. Unpaid medical leave: up to 27 weeks. Bereavement leave (congé de décès): up to 10 days, first 3 paid after 3 months'' continuous employment; up to 8 weeks if the employee''s child dies. Personal leave (congé personnel): up to 5 days per calendar year, first 3 paid after 3 months. Leave for victims of family violence (congé pour les victimes de violence familiale): up to 10 days per calendar year, first 5 paid after 3 months. Leave for traditional Aboriginal practices (congé pour pratiques autochtones traditionnelles): up to 5 days per calendar year, unpaid, after 3 months. Leave related to pregnancy loss (congé en cas de perte de grossesse), Canada Labour Code s. 206.51: up to 8 weeks if the pregnancy resulted in a stillbirth, or 3 days in any other case where a pregnancy does not result in a live birth; available to the employee, their spouse or common-law partner, and a person who intended to be the legal parent; the period begins on the day the pregnancy does not result in a live birth and ends 26 weeks after that day; the first 3 days are paid after 3 consecutive months of continuous employment; the leave may be taken in one or two periods. Compassionate care leave (congé de soignant): up to 28 weeks within 52 weeks. Critical illness leave (congé en cas de maladie grave): up to 37 weeks for a child under 18, 17 weeks for an adult, within 52 weeks. Maternity leave (congé de maternité): up to 17 weeks; parental leave (congé parental): up to 63 weeks, or 71 weeks shared between two federally regulated parents; combined maternity and parental maximum 78 weeks, or 86 weeks shared. Maternity and parental leaves are unpaid; Employment Insurance (or QPIP in Quebec) benefits are separate.',
  content_fr = 'En vertu de la partie III du Code canadien du travail, les employés sous réglementation fédérale ont droit à des congés protégés. Congé payé pour raisons médicales : jusqu''à 10 jours par année, acquis à raison de 3 jours après 30 jours d''emploi continu, puis 1 jour par mois complet, les jours inutilisés étant reportés jusqu''à un maximum de 10. Congé non payé pour raisons médicales : jusqu''à 27 semaines. Congé de décès : jusqu''à 10 jours, dont les 3 premiers payés après 3 mois d''emploi continu; jusqu''à 8 semaines en cas de décès d''un enfant de l''employé. Congé personnel : au plus 5 jours par année civile, dont les 3 premiers payés après 3 mois. Congé pour les victimes de violence familiale : jusqu''à 10 jours par année civile, dont les 5 premiers payés après 3 mois. Congé pour pratiques autochtones traditionnelles : jusqu''à 5 jours par année civile, non payé, après 3 mois d''emploi continu. Congé en cas de perte de grossesse, article 206.51 du Code canadien du travail : jusqu''à 8 semaines si la grossesse s''est soldée par une mortinaissance, ou 3 jours dans tout autre cas où la grossesse ne se termine pas par une naissance vivante; le congé est offert à l''employé, à son conjoint ou conjoint de fait, ainsi qu''à la personne qui avait l''intention d''être le parent légal; la période commence à la date où la grossesse se termine sans naissance vivante et se termine vingt-six semaines après cette date; les 3 premiers jours sont payés après 3 mois d''emploi continu; le congé peut être pris en une ou deux périodes. Congé de soignant : jusqu''à 28 semaines au cours d''une période de 52 semaines. Congé en cas de maladie grave : jusqu''à 37 semaines pour un enfant de moins de 18 ans et 17 semaines pour un adulte, au cours d''une période de 52 semaines. Congé de maternité : au plus 17 semaines; congé parental : jusqu''à 63 semaines, ou 71 semaines lorsqu''il est partagé entre deux parents sous réglementation fédérale; maximum combiné de 78 semaines, ou 86 semaines en cas de partage. Les congés de maternité et parental ne sont pas payés; les prestations de revenu relèvent de l''assurance-emploi (ou du RQAP au Québec).',
  effective_note = 'Official page last modified 2026-05-13 (EN and FR identical). Medical leave with pay has applied since December 1, 2022 — the only leave on the page carrying a stated in-force date. Leave related to pregnancy loss was enacted by 2024, c. 15, s. 198; the Canada Labour Code Amendments table gives that instrument an "Amendment date" of 2025-12-12, matching the Act currency line "last amended on 2025-12-12"; no per-section coming-into-force date is published. NOT on the official page and NOT in the corpus: any "leave for the placement of a child" — no such section exists in Part III Division VII. Verified 2026-08-04 (two independent fetches, EN + FR, plus the consolidated statute).',
  retrieved_at = DATE '2026-08-04'
WHERE jurisdiction = 'FED' AND topic = 'leaves';

-- ===========================================================================
-- Correction to a figure the corpus already carried — [FED] minimum wage.
--
-- The RATE was right ($18.15 from 2026-04-01, up from $17.75 from 2025-04-01,
-- both confirmed in both languages). Three things around it were not:
--   1. "CPI rose 2.1% in 2025" appears on NO official page. Removed rather than
--      re-sourced: any ratio from ~+1.98% to +2.25% yields the same $18.15, so
--      the published rate does not pin the increase to 2.1%.
--   2. "rounded up to the nearest $0.05" is correct but canada.ca is SILENT on
--      rounding in both languages. It comes from CLC s. 178.1(2), now cited.
--   3. s. 178.1(3) specifies the CPI far more tightly than "CPI", and
--      s. 178.1(4) adds a ratchet the chunk never mentioned.
-- ===========================================================================

UPDATE public.advisor_guidance_chunks SET
  content = 'Effective April 1, 2026, the federal minimum wage (salaire minimum fédéral) is $18.15 per hour for employees, including interns, working in federally regulated businesses and industries; the previous rate, effective April 1, 2025, was $17.75 per hour. Under Canada Labour Code s. 178.1, the federal minimum wage is adjusted on April 1 each year by multiplying the previous rate by the ratio of the Consumer Price Index for the preceding calendar year to the index for the year before that, and rounding the result up to the nearest $0.05. Section 178.1(3) defines that index precisely as the average of the all-items Consumer Price Index for Canada, not seasonally adjusted, for each month in the calendar year. Section 178.1(4) provides that no adjustment is made where the calculation would produce a rate lower than the rate already in force, so the federal minimum wage cannot fall. If the minimum wage set by the province or territory where the employee works is greater than the federal minimum wage, the higher provincial or territorial rate applies. Employees not paid on an hourly basis must receive at least the equivalent of the minimum wage, and an employee who reports to work at the call of the employer must receive wages for at least 3 hours at their regular rate, whether or not work is performed.',
  content_fr = 'Depuis le 1er avril 2026, le salaire minimum fédéral est de 18,15 $ l''heure pour les employés, y compris les stagiaires, qui travaillent dans les entreprises et les industries sous réglementation fédérale; le taux précédent, en vigueur depuis le 1er avril 2025, était de 17,75 $ l''heure. En vertu de l''article 178.1 du Code canadien du travail, le salaire minimum fédéral est rajusté le 1er avril de chaque année en multipliant le taux précédent par le rapport entre l''indice des prix à la consommation de l''année civile précédente et celui de l''année antérieure, le résultat étant arrondi au multiple de cinq cents supérieur. Le paragraphe 178.1(3) précise qu''il s''agit de la moyenne de l''indice des prix à la consommation d''ensemble pour le Canada, non désaisonnalisé, pour chaque mois de l''année civile. Le paragraphe 178.1(4) prévoit qu''aucun rajustement n''est effectué si le calcul donnait un taux inférieur à celui déjà en vigueur : le salaire minimum fédéral ne peut donc pas diminuer. Si le salaire minimum de la province ou du territoire où travaille l''employé est plus élevé que le taux fédéral, c''est le taux provincial ou territorial qui s''applique. Les employés qui ne sont pas payés à l''heure doivent recevoir au moins l''équivalent du salaire minimum, et l''employé qui se présente au travail à la demande de son employeur doit être rémunéré pour au moins 3 heures à son taux normal, qu''il ait ou non effectué du travail.',
  effective_note = 'Rate $18.15/hour effective 2026-04-01 (previous $17.75 effective 2025-04-01); canada.ca page dcterms.modified 2026-04-01. Next adjustment falls on 2027-04-01 by operation of CLC s. 178.1(2); no successor rate is published. The indexation, rounding and no-downward-adjustment rules are sourced to CLC s. 178.1(2)-(4), NOT to the canada.ca page, which is silent on rounding in both languages. The prior claim that CPI "rose 2.1% in 2025" was removed as unverifiable from any official source. Verified 2026-08-04 (two independent fetches, EN + FR, plus the consolidated statute).',
  retrieved_at = DATE '2026-08-04'
WHERE jurisdiction = 'FED' AND topic = 'minimum_wage';

-- ===========================================================================
-- WI2 — CNESST URL canonicalization.
--
-- Settled by live redirect trace: the LONG form 301s permanently to the SHORT
-- form (Cache-Control: max-age=31536000), the SHORT forms are terminal 200s
-- that self-declare rel="canonical", and the direction is one-way.
--
-- ⚠ KEYED ON THE EXACT STALE URL, ON PURPOSE — never on the path prefix.
-- `work-schedule-and-termination-employment` is dead for these two children and
-- simultaneously LIVE for others: `.../work-schedule-and-termination-employment/
-- work-schedule` returns 200 and self-canonicalizes to the LONG form, and it is
-- cited by the QC hours-of-work row. A prefix-wide rewrite would break a
-- currently-valid citation. Two rows change; the other ten CNESST-citing rows,
-- including the SHORT-form layoff/recall row, are untouched.
-- ===========================================================================

UPDATE public.advisor_guidance_chunks SET
  source_url = 'https://www.cnesst.gouv.qc.ca/en/working-conditions/termination-employment/notice-termination-employment-and-indemnity'
WHERE source_url = 'https://www.cnesst.gouv.qc.ca/en/working-conditions/work-schedule-and-termination-employment/termination-employment/notice-termination-employment-and-indemnity';

UPDATE public.advisor_guidance_chunks SET
  source_url = 'https://www.cnesst.gouv.qc.ca/en/working-conditions/termination-employment/termination-layoff-dismissal-and-resignation'
WHERE source_url = 'https://www.cnesst.gouv.qc.ca/en/working-conditions/work-schedule-and-termination-employment/termination-employment/termination-layoff-dismissal-and-resignation';

-- The French canonicals for these two page identities, for whoever adds French
-- citations later. Obtained from the pages' own hreflang tags and confirmed by a
-- bidirectional round-trip — NOT by translating the English slug, which does not
-- work here (the French tree has no work-schedule-and- segment at all; the
-- constructed mirror 404s):
--   licenciement-mise-pied-congediement-demission ->
--     https://www.cnesst.gouv.qc.ca/fr/conditions-travail/fin-demploi/licenciement-mise-pied-congediement-demission
--   avis-cessation-demploi-indemnite ->
--     https://www.cnesst.gouv.qc.ca/fr/conditions-travail/fin-demploi/avis-cessation-demploi-indemnite
-- Cite all four WITHOUT a trailing slash; a trailing slash 301s to the bare path.

-- ===========================================================================
-- POST-APPLY: done 2026-08-05. Retrieval smoke test run through
-- match_advisor_guidance for the amended topics in EN and FR — all rank first
-- for their own topic's query in both languages. See
-- docs/advisor-guidance-corpus-2026-08-04.md § Not done, and why.
-- ===========================================================================
