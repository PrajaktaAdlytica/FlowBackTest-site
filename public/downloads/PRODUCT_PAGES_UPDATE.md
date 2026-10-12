# Product-page refinement — 12 October 2026

Applied the four browser comments to Workflow Desk, Workflow Review, Workflow Proof, Workflow Signal and Workflow Report through their shared module layout.

- Specification sections use pale eucalyptus/sage with the approved quiet rose linen texture.
- Inputs, Evidence to produce and Control boundary reveal sequentially with scroll position. The desktop timeline alternates horizontal entrances; reverse scrolling reverses the sequence. Narrow screens use individual row entrances so longer stacked sections remain readable.
- FAQ sections use the brand burgundy with ivory text and brass accents.
- Related-product sections use the approved rose/lace material, with calm paper cards and distinct hover/focus boundaries.

## Observed QA

At 1063 × 804 all five routes rendered exactly three specification rows, the burgundy FAQ, four related-product links and the rose/lace background. Each document width equaled the viewport width. On Desk, forward scrolling showed Inputs at opacity 0.999, Evidence at 0.564 and Control at 0.12, demonstrating the ordered reveal. Further scrolling showed all three at approximately 1. Reverse scrolling restored Control toward 0.423 before Evidence/Input, as intended.

At 390 × 844, Report rendered stacked sections without horizontal overflow. Motion off restored every specification row to opacity 1 and transform none. Genuine captures are in screenshots/product-refinement/. No simulator, form, lead transport or evidence claim changed.

The existing public Site is retained. Build and deployment provenance are recorded in the adjacent deployment record after publication.
