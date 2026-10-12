# FlowBackTest

A complete research-stage website and isolated synthetic workflow workbench. The user's approved direction is **everything demo for now**. Forms, sign-in, reviewer actions, analytics and exports have no external operational side effects.

## Run

Use Node 20.19+ or 22.12+ and npm. From this folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. For a production build:

```sh
npm test
npm run build
npm run preview
```

The build produces `dist/`, including 23 direct-load routes and a branded 404 view. `.openai/hosting.json` binds the private Sites preview. GitHub, Vercel, a custom domain and real business services are separate future setup steps.

## Experience

- Garden homepage with scroll-linked process chapters, image parallax, five individual animated module cards, a botanical calibration spread and a courtyard closing scene.
- Cloister supporting pages for all five modules, method, data/competitor comparison, use cases, research purpose, hypothetical pricing and resources.
- Responsive synthetic workspace: 40 fictional cases, 236 timestamped source events, 10 staged records, seeded scenarios, uncertainty ranges, holdout report, required human review, mock feedback, reset, dictionary and labeled exports.
- Complete study form and demo sign-in. Study drafts and optional events stay in browser memory, with export and deletion controls. Explicit analytics opt-in defaults off.
- Motion toggle, reduced-motion fallback, visible keyboard focus, skip links and native mobile scrolling.

The hypothesis is agent-specific calibration. Celonis already offers process simulation; FlowBackTest does not claim otherwise. No accuracy, purchase intent, operating integrations or revenue has been demonstrated.

## Handoff

See `docs/QA.md`, `docs/RUNBOOK.md`, `docs/BRIEF_COVERAGE.md`, `docs/EXPERIMENT_READOUT.md` and `docs/EVENT_SCHEMA.json`. Open `screenshots/index.html` for genuine 1440px and 390px browser captures. `docs/SCREENSHOTS.json` records routes, viewports and asset provenance. Source font/icon notices remain with the assets.

Built with React, Vite, GSAP ScrollTrigger and Lenis. Animation follows the official [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [GSAP matchMedia cleanup](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/); [Lenis](https://github.com/darkroomengineering/lenis) is limited to the desktop motion path. Typography is self-hosted EB Garamond and Source Sans 3. Approved generated garden/cloister images and heritage materials are brand illustrations, not product screenshots.
