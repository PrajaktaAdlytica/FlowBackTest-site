# FlowBackTest — observed QA

12 October 2026. Tested in the Codex in-app browser. This record concerns the concept website and fixture-only demo; it does not establish customer accuracy, demand, pricing acceptance or production readiness of a backend.

## Executed checks

| Check | Observed result |
|---|---|
| Garden hero at 1440 × 900 and 390 × 844 | Genuine captures saved. Mobile copy/image overlap fixed; title and CTAs readable. |
| Scroll chapters and reversal | Native desktop scroll changes the stage and evidence. Clicking chapter 03 reaches human review. Still mode reveals all four chapters. |
| Motion toggle / reduced-motion code path | Motion off removes the sticky animated sequence and exposes static content. OS preference initializes the same mode; no OS setting was changed. |
| Navigation | Product menu opens; Escape closes it. Mobile menu opens at 390px and Escape closes it. Footer destinations point to implemented pages. |
| Responsive overflow | Home, pricing, demo map, demo scenarios and Workflow Proof measured document width equal to 390px viewport. |
| Pricing | Both study/pilot hypothesis prices are visible; no checkout. Desktop/mobile captures saved. |
| Study form | Native required-field/email validation; explicit unchecked consent. Fictional example produces local success stating “Nothing was submitted.” Desktop/mobile captures saved. |
| Draft deletion | Clear data resets name, email, company, role, owner, date, stack, decision and checkboxes. Only default Order-to-cash prompt remains. |
| Consent | Default 0 events. Opt-in records a local view. Revocation clears events and turns recording off. Tests cover no PII, allowlisted UTMs, dedupe and disabled conversion events. |
| Demo source and counts | 40 fictional cases, 236 source events, 24 completed histories, 10 staged records. Exported CSV contains synthetic label on every row. |
| Scenario sensitivity | Changing exception rate 18% → 80% worsens agent mean from 3.2 to 4.4 model days; range changes from 3.1–3.3 to 4.0–5.0. Human-only mean remains 3.5. These are synthetic model outputs. |
| Reset | Restores exception rate 18%, seed/defaults and reviewer state. |
| Reviewer control | Mock approve disabled until evidence is acknowledged. It produces local feedback and explicitly stops before release. Reset restores disabled state. |
| Report download | Genuine local JSON download inspected: synthetic boundary retained. No sending or ERP operation occurs. |
| Demo sign-in | Empty entry cannot continue. Fictional email reaches “Your demo is ready”; no account or authentication service. |
| Supporting page controls | Tabs, sign-in error/success and resource downloads checked. Workflow Proof captures demonstrate selected Cloister direction. |
| Meaningful automated tests | Seven simulation checks plus telemetry consent/dedupe/privacy check pass via npm test. |

## Final build and route evidence

`npm run build` passed with 40 transformed modules and 23 static route entries. Asset/link source scan passed with no missing referenced files. Initial JS is 399.30 KB (131.97 KB gzip); supporting pages 65.21 KB (18.04 KB gzip); demo 45.16 KB (12.78 KB gzip). The 1024 × 768 homepage also measured no horizontal overflow or broken images. No browser console errors were observed in the final local check.

## Accessibility and performance implementation

Labels use native controls; focus styles and skip links are present. Charts have descriptive accessible labels, units, assumptions and unvalidated status. Hover details also respond to keyboard focus, and touch layouts expose the underlying content. Decorative assets are separated from native operational UI. Font subset files total approximately 188 KB; images are local WebP with responsive hero selection and lazy loading below the fold. Supporting routes and demo load in separate JS/CSS chunks.

No Lighthouse score, screen-reader certification or universal accessibility conformance is claimed. OS-level reduced-motion behavior was source-reviewed through the same verified still-mode branch. Full assistive-technology testing and measured field Web Vitals are future checks. There is no real analytics transport or conversion evidence.

## Network and storage boundary

Source inspection found no fetch/XHR, form action endpoint, payment SDK, identity provider, storage API or analytics destination in the application. Native external documentation links navigate only when clicked. The development server loads Vite runtime resources; those are not form/fixture submission. Drafts and event buffers are module/component memory; refresh or full navigation clears them. The static deployed build uses only its local assets and user-triggered Blob downloads.

Private deployment status is recorded separately after the hosting service confirms it. The shipped handoff retains the experiment protocol and unknown buyer metrics; no completed demo state is counted as validation.
