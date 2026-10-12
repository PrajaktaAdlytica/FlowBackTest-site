# Data & trust refinement — 12 October 2026

The minimum event-record section now uses warm blush/limestone paper, with an opaque readable table. The five log-review checks reveal sequentially with scroll position and reverse on upward scrolling. Narrow layouts use individual row reveals; motion-off restores all rows immediately.

Celonis, UiPath and substitute comparison cards have distinct sage, rose and stone backgrounds. Their bottom-to-top shutters use the approved botanical diamond, quiet linen and rose/lace materials. Keyboard focus within the cards invokes the same treatment. Motion-off and reduced-motion preferences remove shutter transitions.

## Observed QA

- Desktop 1063 × 804: at an intermediate scroll point rows 01–03 were fully visible, 04 was entering and 05 was still at its initial opacity. Further scrolling completed all five; upward scrolling reversed the sequence, with later rows returning to the initial state first.
- All three comparison cards responded to hover and displayed their corresponding material backgrounds.
- Mobile 390 × 844: the record section and comparison cards had document width equal to viewport width. The table retains its independent horizontal-scroll region.
- Motion off restored all five review rows to opacity 1 and transform none; shutter transition duration computed as 0s.
- Genuine captures are in screenshots/data-refinement/.

Existing competitor facts, documentation links, data boundaries and synthetic examples are unchanged. Public access and demo-only operational behavior remain in place.
