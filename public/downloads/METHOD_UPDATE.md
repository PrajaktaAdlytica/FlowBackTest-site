# Method interactions — 12 October 2026

The Simulation and Calibration cards now have bottom-to-top shutter hovers using the approved linen and botanical materials. Keyboard focus invokes the same visual treatment; text remains above the shutter throughout. Motion-off and OS reduced-motion preferences remove the transition.

The study protocol advances through all five stages using native page scrolling. A sticky presentation retains the stage buttons and current evidence pane. Clicking a stage moves to that point in the scroll sequence; the skip link leads to the build decision. Motion-off mode and viewports shorter than 760px use the complete manual stage selector without a long pinned region.

Continue and Pause panels enter from opposite sides. Entrances reverse on exit and replay on re-entry, and cleanup removes transforms when motion is turned off.

## Observed QA

- Desktop 1063 × 804: forward scrolling produced 01, 02, 03, 04, 05; reverse scrolling produced 04, 03, 02, 01. The pinned presentation stayed at y=100 with height 704.
- Mobile 390 × 844: native scrolling advanced 01 through 05. The pin occupied y=100–844 without horizontal overflow. The compact stage buttons retain full accessible labels.
- At 390 × 640 with motion on, the short-screen manual fallback was active and document width equaled viewport width.
- Motion off removed the scroll region and restored both decision panels to opacity 1 / transform none. Manual selection successfully reached stage 03.
- Both cards responded to hover and showed their corresponding material backgrounds. Decision panels showed equal and opposite horizontal translations while entering.
- Genuine browser captures are in screenshots/method-refinement/.

The protocol content, validation gates, synthetic evidence boundaries and public access remain unchanged. The website still has no live lead, ERP, payment or authentication backend.
