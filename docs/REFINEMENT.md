# Homepage refinement — 12 October 2026

All seven browser comments are implemented: centered hero; removed white scene overlays; botanical diamond paper behind the evidence workspace; upright evidence and threshold stamps; sage linen buyer section; clear courtyard closing scene; redesigned garden-green footer with brass rules, monogram, expanded wordmark, organized links and a study CTA.

The original hero image also contained baked-in haze. The built-in image-generation tool edited that image into `../flowbacktest-brand-kit/assets/imagery/garden/garden-hero-clear.png`. Local optimized derivatives are `public/media/garden/garden-hero-clear.webp` and `garden-hero-clear-900.webp`. The original asset remains available. The complete edit prompt and provenance are in ASSET_SOURCES.txt. The scene remains an illustrative brand asset, not an operating-product capture.

Scroll entrances alternate left/right and stagger by 110ms within each section. They reverse on leaving the viewport and play again on re-entry from above or below. The homepage now animates evidence, module cards, calibration copy, buyer roles, study pricing rows, FAQs and closing copy; the footer also animates on all public pages. Existing desktop process chapters remain scroll-linked, while mobile chapters use individual entrances. Motion off or the OS reduced-motion preference restores still content.

## Observed checks

- At 1063 × 804, buyer cards settled at x=0 / opacity=1. Scrolling to the footer restored alternating x=-72/+72/-72 and opacity=0.12 offscreen. Returning upward replayed the entrance toward x=0 / opacity=1.
- Both stamp images have identity transforms or no transform and zero rotation. The closing copy computes background-image:none.
- At 390 × 844, hero copy computes text-align:center, the white overlay element is absent and document width equals viewport width. The footer also has no horizontal overflow.
- Motion off removes the entrance displacements and leaves all copy/controls readable. The mobile closing scene separates copy and the clean photograph without a white overlay.
- Genuine refinement captures are in screenshots/refinement/. Desktop captures use 1440 × 900, mobile captures 390 × 844, and comment-matched captures 1063 × 804. Operational screenshots retain their synthetic boundaries.

Public access remains enabled. Forms, authentication preview, instrumentation and scenario interactions remain synthetic/local. No backend or customer-validation claim changes.
