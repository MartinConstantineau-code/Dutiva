-- Advisor grounding corpus -- closes L1b in docs/TODO.md.
--
-- STATUS: APPLIED 2026-08-05, via direct Supabase MCP access to the live
-- project (same access path as 0042).
--
-- 0042 (2026-08-04) fixed the FED leaves chunk's omission of pregnancy loss
-- leave, family violence leave and traditional Aboriginal practices leave,
-- and recorded that four more leaves were still missing (TODO.md L1b): court
-- or jury duty, leave of absence for members of the reserve force, leave for
-- work-related illness and injury, and maternity-related reassignment and
-- leave. This migration adds those four.
--
-- Source: https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards/leaves.html
-- and https://www.canada.ca/fr/services/emplois/milieu-travail/normes-travail-federales/conges.html
-- Fetched twice independently (2026-08-05); both fetches of the English page
-- were byte-identical. Page "Date modified" / "Date de modification" is
-- 2026-05-13 in both languages, unchanged from the 0042 tranche -- these are
-- authoring omissions in the original 2026-07-27 chunk, not later amendments.
--
-- The reserve-force leave section number (Canada Labour Code s. 247.5,
-- 24-months-in-60 cap at s. 247.5(1.1)) is not stated on the canada.ca page
-- and was cross-checked separately against the consolidated statute
-- (laws-lois.justice.gc.ca) before being added -- it is the one figure in
-- this tranche not sourced from the canada.ca page itself.
--
-- Every other figure below is a direct paraphrase of the official page text,
-- kept in the chunk's existing "leave name (bilingual term): entitlement"
-- style. content_fr is authored from the LIVE FRENCH page, not translated
-- from the English addition below.
--
-- review_status is NOT touched -- stays 'machine_curated' (TODO.md L5).
-- fts / fts_fr are stored generated columns and recompute on UPDATE.

UPDATE public.advisor_guidance_chunks SET
  content = content || ' Leave for court or jury duty (congé pour fonctions judiciaires): unpaid leave for the time necessary to participate in a judicial proceeding as a witness, juror, or candidate in a jury selection process; requires written notice to the employer, who may request supporting documents. Leave for work-related illness and injury (congé pour accident ou maladie professionnel): unpaid leave for an employee who suffers a work-related illness or injury; employers must subscribe to a plan replacing wages at a rate equivalent to the workers'' compensation rate in the employee''s province of permanent residence; where reasonably practicable the employer must return the employee to work afterward, or may reassign them to a different position with different terms and conditions if they cannot perform their original job. Leave of absence for members of the reserve force (congé pour les membres de la force de réserve), Canada Labour Code s. 247.5: after 3 consecutive months of continuous employment, unpaid leave to take part in an operation in Canada or abroad designated by the Minister of National Defence, a prescribed activity, Canadian Armed Forces military skills training, training or duties the reservist is ordered or called out to perform, service in aid of the civil power, or treatment, recovery or rehabilitation for a physical or mental health problem resulting from such service, all under the National Defence Act; reservists are entitled to 24 months of leave in a 60-month period, except during a national emergency within the meaning of the Emergencies Act; the Labour Program may deny the leave if it would cause undue hardship to the employer or an adverse effect on public health or safety. Maternity-related reassignment and leave (réaffectation et congé liés à la maternité): a pregnant or nursing employee may ask their employer, with a healthcare practitioner''s certificate, to modify their job or reassign them where continuing their present work poses a risk to their health, the health of their unborn child, or the health of their child; while the employer examines the request the employee is entitled to leave with pay at their regular rate of wages; where reassignment or job modification is not reasonably practicable, the employee is entitled to an unpaid leave of absence for the duration of the risk, available from the beginning of the pregnancy to the end of the 24th week following the birth.',
  content_fr = content_fr || ' Congé pour fonctions judiciaires : congé non payé pour le temps nécessaire pour participer à une instance judiciaire comme témoin, juré ou candidat à un processus de sélection des jurés; un avis écrit à l''employeur est requis, qui peut demander des documents justificatifs. Congé pour accident ou maladie professionnel : congé non payé pour l''employé qui a subi un accident au travail ou qui souffre d''une maladie professionnelle; les employeurs doivent adhérer à un régime qui remplace le salaire à un taux équivalent à l''indemnisation provinciale ou territoriale des accidents du travail de la province ou du territoire de résidence permanente de l''employé; dans la mesure du possible, l''employeur doit le réintégrer après l''accident ou la maladie professionnelle, ou peut le réaffecter à un autre poste comportant des conditions d''emploi différentes s''il est incapable d''accomplir ses fonctions. Congé pour les membres de la force de réserve, article 247.5 du Code canadien du travail : après 3 mois consécutifs d''emploi continu, congé non payé pour participer à une opération au Canada ou à l''étranger désignée par le ministre de la Défense nationale, à une activité prévue par règlement, à une activité de développement des compétences militaires des Forces armées canadiennes, à l''instruction ou aux fonctions auxquelles le réserviste est astreint ou appelé, au service prêté au pouvoir civil, ou à un traitement, un rétablissement ou une réadaptation à la suite d''un problème de santé physique ou mentale découlant d''un tel service, le tout en vertu de la Loi sur la défense nationale; le réserviste a droit à 24 mois de congé au cours d''une période de 60 mois, sauf en cas d''urgence nationale au sens de la Loi sur les mesures d''urgence; le Programme du travail peut refuser le congé s''il cause un préjudice injustifié à l''employeur ou nuit à la santé ou à la sécurité publiques. Réaffectation et congé liés à la maternité : l''employée enceinte ou qui allaite peut demander à son employeur, avec un certificat d''un professionnel de la santé, de modifier ses fonctions ou de la réaffecter si la poursuite de son travail actuel pose un risque pour sa santé, celle de son enfant à naître ou de son enfant; pendant l''examen de la demande, elle a droit à un congé payé à son taux de salaire normal; si la réaffectation ou la modification des tâches n''est pas possible dans la pratique, elle a droit à un congé non payé pour la durée du risque, offert depuis le début de la grossesse jusqu''à la fin de la 24e semaine suivant la naissance.',
  effective_note = effective_note || ' Update 2026-08-05: added the four leaves TODO.md L1b recorded as still-omitted -- court or jury duty, work-related illness and injury, reserve force (24 months in a 60-month period, Canada Labour Code s. 247.5(1.1)), and maternity-related reassignment and leave -- none of which carry a stated per-section coming-into-force date on the official page. Page Date modified / Date de modification unchanged at 2026-05-13 in both languages; these were 2026-07-27 authoring omissions, confirmed by two independent EN fetches (byte-identical) plus one FR fetch on 2026-08-05, and the s. 247.5 citation cross-checked against the consolidated statute text.',
  retrieved_at = DATE '2026-08-05'
WHERE jurisdiction = 'FED' AND topic = 'leaves';
