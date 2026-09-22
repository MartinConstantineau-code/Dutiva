# Design handoff — Analytics (Reports rebuild)

`dutiva-reports-mockup.html` is the static mobile mockup (393px phone frame)
that accompanied the Analytics rebuild brief — the visual reference for the
Phase 1 card system: compliance score (hero + windowed trend + driver
meters), needs attention, headcount by jurisdiction, open cases, and policy
acknowledgments.

Provenance: received 2026-08-07 with the rebuild prompt. Phase 1 (PR #170)
was built from the written brief before the mockup file arrived; a
reconciliation pass confirmed the shipped page matches its layout, card
order, chart specs (windowed 70–85 axis, endpoint-only labels, tooltip-only
interior points) and copy. Deltas adopted from the mockup afterwards, in the
Phase 2 PR: the gold current-month end marker on trend lines, and the
acknowledgments card pointing its outstanding-signatures action at the
Communications program.

Deliberate divergences (house system wins over the mockup's raw values):

- Colours come from the app tokens (`--chart-mark`, `--navy`, chip tone
  classes), not the mockup's inline hexes — the mockup's `--data-navy`
  `#2f4f8f` is the light value of `--chart-mark`, with a validated lighter
  step for dark mode.
- Chips use the shared `statusChipClass` vocabulary (the mockup's blue-tinted
  "info" chip renders as the house neutral chip).
- The demo diorama's fixed "today" is July 5, 2026 (calendar fixture), so the
  score window runs Feb–Jul rather than the mockup's Mar–Aug, and card
  numbers are computed from the `src/data` fixtures rather than the mockup's
  illustrative values.

The mockup shows Phase 1 only; the Phase 2 cards (certifications & training,
score by jurisdiction, probation, document expiries, leave, headcount &
turnover) were built from the written brief's specs and these established
patterns.
