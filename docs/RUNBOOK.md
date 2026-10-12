# FlowBackTest — demo website runbook

Prepared 12 October 2026 for the implemented React/Vite preview. See QA.md for observed verification; deployment is confirmed separately by the host. No business service is connected. The user's current direction is **everything demo for now**.

## Local operation

From `outputs/flowbacktest-website/`, using the repository's declared Node/package manager version and lockfile:

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/`. For a production bundle and local review:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 5173
```

Use `npm ci` for repeatable installation once the committed lockfile exists. Check `package.json` for any additional lint/typecheck scripts and run the scripts actually supplied. Record command results in QA notes; do not assume these commands have passed merely because they are documented here.

## Boundaries

- Public pages are a research-stage company/product preview.
- Product workspace uses deterministic, fictional fixture data only. The expected sample is Kestrel Wholesale, O-248, with 40 synthetic process cases and an inspectable selection of records.
- Scenario controls, reset, reviewer controls and report/export controls may alter explicit local mock state. They must not send messages, perform ERP writes, collect payments, execute external actions or contact third-party services.
- Results are illustrative and assumption-based. Every chart/report/product capture keeps its DEMO / Synthetic sample data / Concept preview context, assumptions and calibration status.
- Authentication is a polished demo presentation with no identity provider, password transmission or real account creation.
- No production integrations or credentials are needed to run the fixture preview. Do not imply an ERP/Celonis/UiPath connection is active.

## Form behavior for this phase

Study forms hold browser-memory drafts; contact directs to the study flow. They demonstrate complete labels, required-field errors, explicit unchecked consent and a local success state. A demo submission sends nothing, creates no CRM record, verifies no signup and books no interview. Use fictional test entries during QA.

The study fields are work email, role, company, process/pending-decision qualification, event-log owner, decision date, existing mining stack, optional interview opt-in and explicit privacy consent. No public file upload for logs, contracts or secrets.

Before describing browser persistence, inspect the implementation. If the form is memory-only, describe it as a temporary page draft and explain that reset/reload removes it. If draft or consent state is saved in local/session storage, list the actual keys and add a visible clear-data/revoke action. Do not invent a server retention period or say data is stored only in memory unless checked.

| Implementation observation | Verified implementation |
|---|---|
| Form endpoint / network requests | None; inspected source and local flow |
| Draft storage location and keys | Browser/component memory; no persistent keys |
| Consent preference storage and keys | Browser/component memory; no persistent keys |
| Demo/event storage and keys | Browser/component memory; no persistent keys |
| Clear-data control location | Floating Demo preferences panel; also privacy page |
| What reset clears | Draft fields/events/consent; workspace reset restores fixture state and assumptions |
| What browser reload clears | All in-memory drafts, events, consent and mock state |

`/privacy` must match the checked behavior. `/contact` must remain a working local demo path rather than inventing an email, address or operating team. Supplied LinkedIn/Crunchbase artwork may be displayed, but no fictional company profile destination should be connected.

## Analytics and later adapters

`EVENT_SCHEMA.json` defines the eight requested event names, UTMs, consent, namespace and dedupe rules. The demo uses a downloadable debug log of consent-aware synthetic events held in browser memory, with session dedupe, separated from real leads. Server-side dedupe is not connected in this phase. Do not send a user's entered email, company, free text or fixtures as event properties.

`verified_signup` and `interview_booked` are reserved for actual verification/booking evidence. A local submit/success state must never emit those conversion events. A demo completion is not a qualified buyer commitment.

Later, after a destination is supplied and real collection is explicitly activated:

1. Replace the local form adapter with a server-controlled endpoint/CRM adapter and publish its actual behavior.
2. Confirm data minimization, access, deletion route, exact retention and destination; adjust privacy copy to those facts.
3. Implement required verification/double opt-in only where applicable, with genuine confirmation evidence.
4. Configure consent-aware analytics and a server-side event dedupe store; do not rely solely on browser dedupe for real conversions.
5. Separate production namespace from synthetic demo events and exclude fixtures from outbound payloads.
6. Re-run error, success, consent revocation, duplicate submission and network checks against the real adapter before traffic tests.

No credentials or environment secrets belong in browser code, fixtures, screenshots, source control or handoff artifacts. Put server secrets in the hosting environment and document only variable names. Current static demo is expected to require no secret variables.

## Preview hosting and routing

The expected handoff target is a **public Sites preview**. Record the actual URL/access mode only after the host confirms it. Public hosting is verified. No operating product, custom domain reservation or trademark clearance is claimed.

| Hosting field | Actual value |
|---|---|
| Build output | `dist/`; Vite build with 23 direct-load HTML routes |
| Preview URL | https://flowbacktest-preview.artfullarch32.chatgpt.site |
| Visibility / owner access | Public; access policy revision 2 confirmed |
| Source repository | Not supplied |
| Public domain | Not connected / no availability claim |
| Hosting QA | Public homepage opened without sign-in; refreshed-layout QA recorded in REFINEMENT.md |

This build includes route directory index files and 404.html. On other hosts configure route fallback to `index.html` so direct loads of `/demo/map`, `/demo/scenarios`, `/demo/backtest`, `/demo/records`, `/pricing`, `/study` and `/product/{desk,review,proof,signal,report}` work. Exclude real static assets from rewrite fallback and check the useful 404 behavior. Include local asset paths and licenses; no absolute personal filesystem paths in shipped markup.

An authorized future GitHub/Vercel/custom-domain workflow is a separate milestone. Preserve the working preview and record exact repository/host/domain status rather than treating a local build as deployment.

## Asset and visual handoff

Use the selected Returning Wordmark SVGs, branded favicon, local EB Garamond/Source Sans 3 fonts, approved garden/cloister images and heritage materials from the brand kit. Retain OFL and icon/source notices. Background masters have not been verified as seamless tiles; use deliberate single-panel crops. Keep ornate materials behind editorial/image sections, with solid surfaces beneath operational data and fields.

Generated scenery is illustration; only real browser renders may be labeled website/product screenshots. Charts and diagrams should remain editable native UI with clear units and sample labels. Do not use a stamp or green check ornament to imply certification, proven accuracy or a compliance outcome.

## QA and screenshot handoff

The implemented public route set is `/`, `/product`, `/product/{desk,review,proof,signal,report}`, `/method`, `/data`, `/pricing`, `/solutions`, `/about`, `/contact`, `/privacy`, `/terms`, `/sign-in`, `/resources`, `/study`, and the nested `/demo/{map,scenarios,backtest,records}` workspace. `/resources` exposes the downloadable handoff/experiment documents.

Use `BRIEF_COVERAGE.md` for route, accessibility/performance and screenshot acceptance. Required shot widths are desktop 1440px and mobile 390px for hero, core workflow, pricing, DEMO boundary and local form success, plus a narrow demo detail view. Keep synthetic watermarks on every product frame and export.

For each check, record expected behavior, observed behavior, browser/viewport, date and evidence file. Check native scrolling, scroll reversal, mobile stacking, reduced motion, keyboard access, menu focus, form errors/success, charts, every CTA, asset failures, runtime/build output and no outbound fixture/form leakage. Performance notes should contain actual measurements when taken; until then label them planned.

## Reset and troubleshooting

- If a scenario looks inconsistent, restore the declared seed and defaults using the demo reset control; confirm it matches fixture counts and case provenance.
- If animation obscures reading, use the skip/still or reduced-motion path and log the affected viewport/section.
- If a direct route fails on hosting, check SPA fallback before changing route links.
- If assets fail, check relative build paths/case sensitivity and the host's base path.
- If a local port is occupied, stop only the task's known dev process or choose another documented port; do not terminate unrelated processes.
- If form data survives reload unexpectedly, identify the actual storage mechanism, clear it through the provided control and correct privacy copy.
- If an outbound request appears, inspect its destination/payload and disable the relevant adapter until the demo boundary is restored.

Implementation readiness and buyer validation remain separate: a complete demo does not establish demand, model accuracy, pricing acceptance or willingness to pay beyond incumbents.
