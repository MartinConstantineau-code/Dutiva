# Advisor grounding corpus — amendment tranche of 2026-08-04

The amendment tranche that
[advisor-corpus-verification-2026-08-02.md](advisor-corpus-verification-2026-08-02.md)
recorded as blocked. That cycle stopped because every official host was refused at its
sandbox's egress proxy; it was right to stop. **The block was environmental, not real** —
run from a workstation, `ontario.ca`, `canada.ca`, `cnesst.gouv.qc.ca`,
`legisquebec.gouv.qc.ca` and `laws-lois.justice.gc.ca` all answer normally. Three of the
five need a browser `User-Agent`, which is a bot filter on the fetching tool rather than a
network policy.

Every figure below was fetched **twice by two independent agents**, the second instructed
to refute rather than confirm, per the corpus standard. Rows keep
`review_status = machine_curated`; only a human flips a row to `reviewed`.

The 07-26 / 07-27 / 07-29 snapshots are point-in-time records and are **not** edited here,
with one exception noted under WI2 — two URLs in the 07-26 snapshot are corrected in place
because a citation is a pointer, not a historical figure.

## Per-figure citation table

| Figure                                        | Official URL fetched                                                                                                                                                 | Author fetch | Verify fetch | Page "Date modified"                               | In force               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------ | -------------------------------------------------- | ---------------------- |
| ON general minimum wage $17.60 → **$17.95**   | [ontario.ca EN](https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage)                                                                  | 2026-08-04   | 2026-08-04   | Updated: April 01, 2026                            | 2026-10-01             |
| ON student $16.60 → **$16.90**                | same                                                                                                                                                                 | 2026-08-04   | 2026-08-04   | Updated: April 01, 2026                            | 2026-10-01             |
| ON homeworkers $19.35 → **$19.70**            | same                                                                                                                                                                 | 2026-08-04   | 2026-08-04   | Updated: April 01, 2026                            | 2026-10-01             |
| ON guides $88.05/$176.15 → **$89.75/$179.50** | same                                                                                                                                                                 | 2026-08-04   | 2026-08-04   | Updated: April 01, 2026                            | 2026-10-01             |
| ON rates, French edition                      | [ontario.ca FR](https://www.ontario.ca/fr/document/votre-guide-de-la-loi-sur-les-normes-demploi-0/salaire-minimum)                                                   | 2026-08-04   | 2026-08-04   | Mis à jour : 01 avril 2026                         | 2026-10-01             |
| FED pregnancy loss leave — 8 weeks / 3 days   | [canada.ca EN](https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards/leaves.html)                                                                | 2026-08-04   | 2026-08-04   | 2026-05-13                                         | see below              |
| FED pregnancy loss leave — statute            | [CLC s. 206.51 EN](https://laws-lois.justice.gc.ca/eng/acts/L-2/section-206.51.html) · [FR](https://laws-lois.justice.gc.ca/fra/lois/L-2/section-206.51.html)        | 2026-08-04   | 2026-08-04   | Act current to 2026-06-14, last amended 2025-12-12 | 2025-12-12 (qualified) |
| FED minimum wage $18.15                       | [canada.ca EN](https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards/pay-deductions.html)                                                        | 2026-08-04   | 2026-08-04   | dcterms.modified 2026-04-01                        | 2026-04-01             |
| FED indexation + rounding                     | [CLC s. 178.1](https://laws-lois.justice.gc.ca/eng/acts/L-2/section-178.1.html)                                                                                      | 2026-08-04   | 2026-08-04   | last amended 2025-12-12                            | in force               |
| QC $16.60 general / $13.30 tipped             | [CNESST EN](https://www.cnesst.gouv.qc.ca/en/working-conditions/wage-and-pay/wages) · [FR](https://www.cnesst.gouv.qc.ca/fr/conditions-travail/salaire-paye/salaire) | 2026-08-04   | 2026-08-04   | none published                                     | 2026-05-01             |
| CNESST canonical URLs (WI2)                   | live 301 trace, both languages                                                                                                                                       | 2026-08-04   | 2026-08-04   | none published                                     | n/a                    |

---

## WI3 — Ontario minimum wage (the time-sensitive one) — **CLOSED**

The chunk carried the general rate correctly but gave special-category rates only for the
period ending **2026-09-30**, so it went stale on 2026-10-01. All four special categories
are now confirmed from the live page for the period beginning 2026-10-01.

The three figures the 08-02 cycle had recorded as unverified search-snippet leads — student
$16.90, homeworkers $19.70, guides $89.75/$179.50 — are **all correct**. Recorded because
"the snippet turned out to be right" is only knowable after checking, and the next author
should know the check was actually run.

| Category                                                                   | Oct 1 2025 – Sep 30 2026 | **Oct 1 2026 – Sep 30 2027** |
| -------------------------------------------------------------------------- | ------------------------ | ---------------------------- |
| General                                                                    | $17.60/hr                | **$17.95/hr**                |
| Student (under 18, ≤28 h/week when school is in session, or school breaks) | $16.60/hr                | **$16.90/hr**                |
| Homeworkers                                                                | $19.35/hr                | **$19.70/hr**                |
| Hunting, fishing and wilderness guides, <5 consecutive hours               | $88.05/day               | **$89.75/day**               |
| Hunting, fishing and wilderness guides, 5+ hours                           | $176.15/day              | **$179.50/day**              |

The whole minimum-wage cluster was re-verified from primary sources in the same pass, since
it is the highest-churn part of the corpus and the last check on it was snippet-based:

- **Federal $18.15/hr effective 2026-04-01** (previous $17.75 effective 2025-04-01) —
  confirmed in both languages. See the corrections below, which are separate from the rate.
- **Québec $16.60 general / $13.30 tipped, in effect since 2026-05-01** — confirmed verbatim
  in both languages, with no end date and no successor rate stated. The string "2027" occurs
  **zero** times in the raw HTML of both language editions. No change required; the chunk is
  already accurate.

Indexation, quoted from the French page: « Les taux de salaire minimum font l’objet d’une
indexation annuelle axée sur le taux d’inflation. »

---

## WI1 — Federal statutory leaves — **CLOSED, and one lead was wrong**

An omission check, not a figure check. The stakeholder expected at least one of the two
suspected leaves to be wrong. One was.

### Pregnancy Loss Leave — EXISTS, and the chunk omits it

Confirmed on canada.ca in both languages and against the statute, **Canada Labour Code
s. 206.51**, enacted by 2024, c. 15, s. 198:

- **8 weeks** if the pregnancy resulted in a stillbirth; **3 days** in any other case. The
  lead's phrasing ("~3 days extending to 8 weeks") mis-describes the structure — the statute
  is either/or, not an extension.
- Window **begins on the day the pregnancy does not result in a live birth and ends 26 weeks
  after that day**.
- **First 3 days paid** at the regular rate, after **3 consecutive months** of continuous
  employment.
- May be taken in **one or two periods**; the employer may require each period to be at
  least one day.

**On the in-force date, precisely.** The section page displays no section-specific
coming-into-force date, and canada.ca states none. What _is_ published: the Act's own
Amendments table on the `L-2` index lists the enacting instrument `2024, c. 15` under a
column headed **"Amendment date"** with the value **2025-12-12**, matching the Act-level
currency line "Act current to 2026-06-14 and last amended on 2025-12-12". So 2025-12-12 is
supported by a primary source as the date this amendment entered the consolidated statute —
but Justice Canada does not label it a per-section CIF date, and the corpus text should not
either. The chunk therefore names the enacting instrument and the amendment date, and makes
no bare "in force on" claim.

### Leave for the Placement of a Child — DOES NOT EXIST

The secondary-source claim of "up to 16 weeks via a 2026 Order in Council" is **not
supported by any official source**. The string "placement" occurs **zero** times in the
English page's HTML and zero times in the French. Canada Labour Code Part III, Division VII
enumerates ss. 204, 206, 206.1, 206.3, 206.4, 206.5, 206.51, 206.6, 206.7, 206.8, 206.9 —
there is no placement-of-a-child section. **Nothing was added to the corpus for it.**

### The page has not changed since the chunk was written

`Date modified` is **2026-05-13** on both language editions, identical in the visible footer
and in `dcterms.modified`. The chunk was authored 2026-07-27, _after_ that date. So every
gap below is an **authoring omission, not a subsequent amendment** — which matters, because
it means a "re-check when the page changes" watcher would never have caught them.

Leaves present on the live page and absent from the chunk: pregnancy loss; leave for victims
of family violence (10 days/year, first 5 paid after 3 months); leave for traditional
Aboriginal practices (5 days/year, 3 months' service); court or jury duty; reserve-force
leave (24 months in 60); leave for work-related illness and injury; and maternity-related
reassignment and leave. The amended chunk adds pregnancy loss, family violence and
traditional Aboriginal practices — the three with concrete, paid-day-bearing entitlements an
HR question is likely to turn on — and leaves the rest for a later tranche rather than
padding a single row past useful retrieval length.

---

## WI2 — CNESST URL canonicalization — **CLOSED**

Settled by live redirect trace, which is the only way it could be settled.

**The SHORT form is canonical.** In English the LONG form issues a `301 Moved Permanently`
to the SHORT form with `Cache-Control: max-age=31536000, public`; the SHORT forms return
`200` with `num_redirects=0` and self-declare `rel="canonical"` at themselves. The direction
is one-way, never the reverse. In French there is **no long form at all** — the constructed
mirror 404s, and the French canonical was obtained from the pages' own `hreflang` tags and
confirmed by a bidirectional round-trip, never by translating the English slug.

| Page identity                                     | Canonical EN                                                                                  | Canonical FR                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Termination, layoff, dismissal and resignation    | `…/en/working-conditions/termination-employment/termination-layoff-dismissal-and-resignation` | `…/fr/conditions-travail/fin-demploi/licenciement-mise-pied-congediement-demission` |
| Notice of termination of employment and indemnity | `…/en/working-conditions/termination-employment/notice-termination-employment-and-indemnity`  | `…/fr/conditions-travail/fin-demploi/avis-cessation-demploi-indemnite`              |

Cite all four **without a trailing slash** — a trailing slash 301s back to the bare path in
both languages.

> **Do not blanket find/replace the `work-schedule-and-termination-employment` prefix.**
> This is the single most important finding in WI2 and it was caught by the verify pass, not
> the author pass. That prefix is dead for the two termination children and simultaneously
> **live** for others: `…/work-schedule-and-termination-employment/work-schedule` returns 200
> and self-canonicalizes to the LONG form, and it is cited at
> `advisor-guidance-corpus-2026-07-27.md`. The verifier found a second counterexample,
> `…/work-schedule-and-termination-employment/termination-employment/how-calculate-regular-wage`,
> which is canonical under the LONG form while its SHORT form 404s. CNESST's tree is
> per-page mixed. **Fix per URL; never by pattern.**

Scope is 4 of the 12 CNESST-citing rows, exactly as the 08-02 cycle predicted. The 07-29
snapshot already used the SHORT form and is untouched; the two LONG-form citations in the
07-26 snapshot are corrected in place.

**Dating the drift.** The two `301` responses carry a real `last-modified` — 2026-06-28,
about an hour apart — distinct from their `Date` header. That dates CNESST's URL migration
to **28 June 2026**, i.e. roughly a month _before_ the 07-26 snapshot was authored. Those
citations were stale when written, not stale since. (The `200` responses' `last-modified`
tracks fetch time and is worthless as a content date; CNESST publishes no content date on
these pages, and none was invented.)

---

## Corrections to figures the corpus already carried

Not part of the three work items. Found while re-verifying the minimum-wage cluster, and
material enough to fix in the same tranche.

**1. "an increase … which rose 2.1% in 2025" — REMOVED as unverifiable.** No percentage
appears anywhere on either canada.ca language edition or in the statute. It is arithmetically
_plausible_ — $17.75 × 1.021 = $18.12275, which rounds up to $18.15 — but any CPI ratio from
roughly +1.98% to +2.25% produces the same $18.15, so the published rate does not pin the
increase to 2.1%. Sourcing it would require the Statistics Canada annual-average all-items
NSA series, which is a different primary source than the ones this tranche fetched. The
statutory formula is fully verifiable and now carries the claim on its own.

**2. "rounded up to the nearest $0.05" — RE-ATTRIBUTED.** The claim is correct but the
canada.ca page is **silent on rounding in both languages**. The rule is in **Canada Labour
Code s. 178.1(2)**, and the citation now says so. A correct fact behind a wrong citation is
still a defect in a compliance product: the next person to verify it would have gone to the
cited page and not found it.

**3. The CPI is specified far more tightly than "CPI".** s. 178.1(3): the **average of the
all-items Consumer Price Index for Canada, not seasonally adjusted** — the annual average of
the monthly NSA index, not a headline monthly or December-over-December figure.

**4. s. 178.1(4) added — the ratchet.** The rate is **not** adjusted on April 1 if the
computed rate would be lower than the preceding year's. The federal minimum wage can never
fall. The chunk never mentioned this.

**5. Both French source URLs in the prior notes were wrong**, and each 404s:
`…/normes-travail-federales/paie-retenues.html` is really
**`…/normes-travail-federales/retenues-salariales.html`**, and
`…/fr/conditions-travail/salaire-paie/salaire` is really
**`…/fr/conditions-travail/salaire-paye/salaire`**. Both correct paths were taken from the
English pages' own language-toggle hrefs.

---

## Not done, and why

- **`review_status` unchanged.** Every row stays `machine_curated`. Only a human flips a row
  to `reviewed` (TODO.md **L5**), and that gate has still never been exercised.
- **Update 2026-08-05 — the migration is applied.** Run against the live project via the
  Supabase MCP tooling (this session had direct DB access, unlike prior ones). All five target
  rows were confirmed to match the migration's `WHERE` clauses before the run and to carry the
  new `content` / `content_fr` / `effective_note` / `retrieved_at` / `source_url` afterward.
- **Update 2026-08-05 — retrieval smoke test run and passing.** Queried
  `match_advisor_guidance` for each amended topic in both languages: `ON minimum_wage` and
  `FED leaves` and `FED minimum_wage` each rank first for both their English and French query,
  and the two re-pointed CNESST `QC termination_notice` / `QC severance` rows still surface in
  the top 4 for a Québec termination-notice query. `fts`/`fts_fr` recomputed correctly on
  `UPDATE`, as expected of stored generated columns.
- **Québec berry piece rates not added.** CNESST publishes strawberry $1.32/kg and raspberry
  $4.93/kg, but hedges them with "At this time" / « actuellement » and gives **no effective
  date**. Adding them would mean either inventing an effective date or shipping a rate whose
  currency cannot be stated. Left out deliberately.
- **Update 2026-08-05 — the four remaining omitted federal leaves are authored.** Court/jury
  duty, reserve force (Canada Labour Code s. 247.5), work-related illness and injury, and
  maternity-related reassignment are added to the `[FED] leaves` chunk in
  `0044_federal_leaves_omission_tranche_2026_08_05.sql` (applied), sourced from the same
  canada.ca EN/FR pages, fetched twice, with the same 2026-05-13 `Date modified`. Retrieval
  smoke-tested in EN and FR — see that migration's header for detail.
- **No StatCan fetch** to source the 2.1% CPI figure. The percentage was removed instead,
  which needs no source.
