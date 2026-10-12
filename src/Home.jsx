import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import OpeningIntro from "./OpeningIntro.jsx";
import { Arrow } from "./ui.jsx";
gsap.registerPlugin(ScrollTrigger);
const chapters = [
  {
    title: "Begin with what happened.",
    sub: "Source evidence",
    text: "Case IDs, activity names and timestamps make the process visible. Establish the queues and handoffs before adding an agent.",
    image: "cloister-source",
    note: "40 fictional cases · 6 event types",
    to: "/product/desk",
  },
  {
    title: "Give the handoff a shape.",
    sub: "Agent insertion",
    text: "Place an agent at one decision point. Set handling time, exceptions and the review policy you want to test.",
    image: "cloister-triage",
    note: "Assumptions exposed · human release gate retained",
    to: "/product/review",
  },
  {
    title: "Follow the exception.",
    sub: "Queues & controls",
    text: "A faster task can still create a slower queue. Inspect where work waits, when it escalates and who must approve release.",
    image: "cloister-human-review",
    note: "Human approval is compulsory before external action",
    to: "/product/signal",
  },
  {
    title: "Return to the evidence.",
    sub: "Holdout backtest",
    text: "Hold out a known historical change. Compare the model’s directional effects with what happened—and with a naive baseline and the incumbent workflow.",
    image: "cloister-release",
    note: "Synthetic demonstration · accuracy unvalidated",
    to: "/method",
  },
];
const modules = [
  {
    slug: "desk",
    name: "Workflow Desk",
    line: "Find the process in the evidence.",
    desc: "Import event logs and inspect the baseline activity and queue distributions.",
    image: "garden-workflow-desk",
    effect: "lift",
    number: "01",
  },
  {
    slug: "review",
    name: "Workflow Review",
    line: "A place for every possible path.",
    desc: "Configure one agent handoff, exception routing and the human review policy.",
    image: "garden-workflow-review",
    effect: "route",
    number: "02",
  },
  {
    slug: "proof",
    name: "Workflow Proof",
    line: "Make the uncertainty visible.",
    desc: "Explore seeded stochastic scenarios, throughput and queue bottlenecks.",
    image: "garden-workflow-proof",
    effect: "ripples",
    number: "03",
  },
  {
    slug: "signal",
    name: "Workflow Signal",
    line: "Know where judgment belongs.",
    desc: "Test proposed controls, failures and escalation paths before a pilot.",
    image: "garden-workflow-signal",
    effect: "shutters",
    number: "04",
  },
  {
    slug: "report",
    name: "Workflow Report",
    line: "A clear account of what held up.",
    desc: "Compare assumptions and predictions with the outcomes of a real pilot.",
    image: "garden-workflow-report",
    effect: "report",
    number: "05",
  },
];
function Journey({ motion }) {
  const ref = useRef(),
    [active, setActive] = useState(0);
  useEffect(() => {
    if (!motion) return;
    const el = ref.current,
      f = () => {
        if (window.innerWidth < 900) return;
        const r = el.getBoundingClientRect(),
          p = Math.max(
            0,
            Math.min(0.999, -r.top / (el.offsetHeight - window.innerHeight)),
          );
        setActive(Math.floor(p * 4));
        el.style.setProperty("--journey-progress", p);
      };
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => {
      window.removeEventListener("scroll", f);
      window.removeEventListener("resize", f);
    };
  }, [motion]);
  function go(i) {
    setActive(i);
    if (motion && innerWidth >= 900)
      window.scrollTo({
        top:
          window.scrollY +
          ref.current.getBoundingClientRect().top +
          (i * (ref.current.offsetHeight - innerHeight)) / 4 +
          1,
        behavior: "instant",
      });
  }
  return (
    <section
      className={`journey ${!motion ? "journey-static" : ""}`}
      id="journey"
      ref={ref}
    >
      <div className="journey-pin">
        <div className="journey-top">
          <span className="eyebrow">
            01 — From a question to a clearer path
          </span>
          <a className="text-link" href="#workspace">
            Skip the journey <Arrow />
          </a>
        </div>
        <div className="journey-layout">
          <div className="journey-left">
            <div className="journey-title">
              <span className="chapter-count">
                0{active + 1} <span>/ 04</span>
              </span>
              <h2>
                A handoff is
                <br />a <em>threshold.</em>
              </h2>
              <p>
                See the process.
                <br />
                Shape the alternative.
                <br />
                Test what you believe.
              </p>
            </div>
            <div className="journey-nav" aria-label="Journey chapters">
              {chapters.map((c, i) => (
                <button
                  key={c.sub}
                  onClick={() => go(i)}
                  aria-pressed={active === i}
                  className={active === i ? "selected" : ""}
                >
                  <span>0{i + 1}</span>
                  {c.sub}
                  <Arrow />
                </button>
              ))}
            </div>
          </div>
          <div className="journey-scene">
            <div className="scene-label">
              <span className="eyebrow">
                Same orders. More considered options.
              </span>
              <span className="scene-status">Concept illustration</span>
            </div>
            <div className="threshold-object">
              {chapters.map((c, i) => (
                <img
                  key={c.image}
                  src={"/media/cloister/" + c.image + ".webp"}
                  width="1254"
                  height="1254"
                  alt={c.sub + " limestone sculpture"}
                  className={active === i ? "visible" : ""}
                  loading="lazy"
                />
              ))}
              <span className="object-caption">{chapters[active].sub}</span>
              <svg
                className="object-path"
                viewBox="0 0 700 100"
                aria-hidden="true"
              >
                <path d="M0 45 C130 45 120 20 230 20 S330 80 450 70 S560 42 700 42" />
                <circle cx={80 + active * 165} cy="46" r="8" />
              </svg>
            </div>
            <div className="chapter-copy" key={active}>
              <h3>{chapters[active].title}</h3>
              <p>{chapters[active].text}</p>
              <div className="chapter-note">
                <span>↳</span> {chapters[active].note}
              </div>
              <a href={chapters[active].to} className="text-link">
                Explore this step <Arrow />
              </a>
            </div>
          </div>
        </div>
        <div className="journey-line">
          <span />
        </div>
      </div>
      <div className="mobile-chapters">
        {chapters.map((c, i) => (
          <article key={c.sub}>
            <div className="mobile-chapter-number">
              0{i + 1} / {c.sub}
            </div>
            <img
              src={"/media/cloister/" + c.image + ".webp"}
              loading="lazy"
              alt={c.sub + " limestone sculpture"}
              width="1254"
              height="1254"
            />
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            <p className="fine">{c.note}</p>
            <a className="text-link" href={c.to}>
              Explore this step <Arrow />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
function IntervalChart({ assist }) {
  return (
    <div className="interval-chart">
      <div className="chart-title">
        <h4>Cycle-time range</h4>
        <span>Illustrative · days</span>
      </div>
      <svg
        viewBox="0 0 500 210"
        role="img"
        aria-label={`Illustrative human-only cycle-time interval 4 to 9 days. ${assist ? "Agent-assisted interval 3 to 7 days." : "Agent-assisted interval hidden."} Not a calibrated prediction.`}
      >
        <g className="chart-grid">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line x1={120 + i * 80} y1="20" x2={120 + i * 80} y2="170" />
              <text x={120 + i * 80} y="200">
                {2 + i * 2}
              </text>
            </g>
          ))}
        </g>
        <text x="0" y="65" className="chart-label">
          Human-only
        </text>
        <g className="human-interval">
          <path d="M200 60h200M200 53v14M400 53v14" />
          <circle cx="284" cy="60" r="7" />
        </g>
        <text x="0" y="135" className="chart-label">
          Agent-assisted
        </text>
        <g className={`agent-interval ${assist ? "is-visible" : ""}`}>
          <path d="M160 130h160M160 123v14M320 123v14" />
          <circle cx="238" cy="130" r="7" />
        </g>
      </svg>
      <p>
        These ranges explain the interface. Real predictions need calibration on
        consented process logs.
      </p>
    </div>
  );
}
function Workspace() {
  const [assist, setAssist] = useState(true);
  return (
    <section className="workspace-section section-pad" id="workspace">
      <div className="section-header">
        <div>
          <span className="eyebrow">02 — Evidence beside every outcome</span>
          <h2>
            One process.
            <br />
            <em>Two scenarios.</em>
          </h2>
        </div>
        <div className="section-side">
          <p>
            A process map is a beginning. The assumptions, exceptions and
            holdout are what make it worth testing.
          </p>
          <a className="text-link" href="/demo">
            Open the interactive demo <Arrow />
          </a>
        </div>
      </div>
      <div className="workspace-preview">
        <div className="preview-ribbon">
          <span>
            <i /> DEMO — SYNTHETIC DATA
          </span>
          <span>Concept preview · no live integrations</span>
        </div>
        <div className="preview-toolbar">
          <div>
            <span className="order-symbol">K</span>
            <strong>Kestrel Wholesale</strong>
            <span className="fine">Order-to-cash / O-248</span>
          </div>
          <span className="badge">Not calibrated</span>
        </div>
        <div className="preview-grid">
          <div className="record-preview">
            <span className="eyebrow">One example order</span>
            <h3>Order O-248</h3>
            <p className="fine">Fictional credit-review B2B order</p>
            <dl>
              <div>
                <dt>Current step</dt>
                <dd>Human review</dd>
              </div>
              <div>
                <dt>Reviewer</dt>
                <dd>Ada Bell</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>4 timestamped events</dd>
              </div>
              <div>
                <dt>Release approval</dt>
                <dd>Always required</dd>
              </div>
            </dl>
            <a href="/demo/records" className="text-link">
              Inspect source evidence <Arrow />
            </a>
          </div>
          <div className="comparison-preview">
            <div
              className="segmented"
              role="group"
              aria-label="Scenario illustration"
            >
              <button
                className={!assist ? "selected" : ""}
                onClick={() => setAssist(false)}
                aria-pressed={!assist}
              >
                Human-only
              </button>
              <button
                className={assist ? "selected" : ""}
                onClick={() => setAssist(true)}
                aria-pressed={assist}
              >
                Agent-assisted
              </button>
            </div>
            <IntervalChart assist={assist} />
          </div>
          <div className="assumptions-preview">
            <span className="eyebrow">In plain view</span>
            {[
              ["Source", "40 synthetic cases"],
              ["Handoff", "Triage → credit review"],
              ["Exceptions", "Routed to a human"],
              ["Intervals", "Conditional on assumptions"],
              ["Holdout", "Synthetic example only"],
            ].map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
            <a href="/demo/scenarios" className="btn secondary">
              Change the assumptions <Arrow />
            </a>
          </div>
        </div>
      </div>
      <div className="workspace-notes">
        <span>Source provenance</span>
        <span>Exception queues</span>
        <span>Uncertainty intervals</span>
        <span>Holdout status</span>
        <a href="/method">
          Simulation ≠ calibration <Arrow />
        </a>
      </div>
    </section>
  );
}
function ModuleCard({ module: m }) {
  return (
    <a href={"/product/" + m.slug} className={`module-card effect-${m.effect}`}>
      <div className="module-image">
        <img
          src={"/media/garden/" + m.image + ".webp"}
          width="1672"
          height="941"
          alt=""
          loading="lazy"
        />
        <span className="module-number">{m.number} / Proposed module</span>
        <span className="module-reveal">{m.line}</span>
        {m.effect === "route" && (
          <svg
            className="route-overlay"
            viewBox="0 0 500 260"
            aria-hidden="true"
          >
            <path d="M80 245Q75 165 250 135T420 35" />
          </svg>
        )}
        {m.effect === "ripples" && (
          <span className="pond-ripples" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
        {m.effect === "shutters" && (
          <>
            <span className="shutter shutter-left" />
            <span className="shutter shutter-right" />
          </>
        )}
      </div>
      <div className="module-text">
        <div>
          <h3>{m.name}</h3>
          <p>{m.desc}</p>
        </div>
        <span className="card-arrow">
          <Arrow diagonal />
        </span>
      </div>
    </a>
  );
}
function Home({ motion }) {
  const scope = useRef();
  const introScroll = useRef(null);
  useEffect(() => {
    if (!motion) return;
    let lenis;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        lenis = new Lenis({ duration: 0.85, smoothWheel: true, anchors: true });
        introScroll.current = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.to(".hero-visual", {
          y: 100,
          scale: 1.065,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero-copy", {
          y: 60,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "35% top",
            end: "bottom top",
            scrub: true,
          },
        });
        return () => {
          gsap.ticker.remove(raf);
          lenis.destroy();
          introScroll.current = null;
        };
      });
      const entrances = [
        [".early-proof", ":scope > *"],
        [
          ".workspace-section",
          ".section-header > div, .workspace-preview, .workspace-notes > *",
        ],
        [
          ".modules-section",
          ".section-header > div, .module-card, .module-caption",
        ],
        [".belief", ".belief-stamp, .belief-copy > *"],
        [
          ".people-section",
          ".section-header > div, .people-grid article, .incumbent-note > *",
        ],
        [
          ".study-teaser",
          ".teaser-image, .teaser-copy > :not(.price-lines), .price-lines > a",
        ],
        [".faq-section", ":scope > div:first-child, .faq-list details"],
        [".closing-cta", ".cta-copy > *"],
      ];
      if (innerWidth < 900)
        entrances.push([".journey", ".mobile-chapters article"]);
      const distance = innerWidth < 600 ? 24 : 72;
      entrances.forEach(([section, selector]) => {
        const parent = scope.current.querySelector(section);
        parent?.querySelectorAll(selector).forEach((el, i) => {
          gsap.from(el, {
            x: i % 2 ? distance : -distance,
            opacity: 0.12,
            duration: 0.8,
            delay: (i % 3) * 0.11,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 91%",
              end: "bottom 8%",
              toggleActions: "play reverse play reverse",
            },
          });
        });
      });
      return () => mm.revert();
    }, scope);
    const update = () => ScrollTrigger.refresh();
    document.fonts.ready.then(update);
    const images = scope.current.querySelectorAll("img");
    images.forEach((i) => i.addEventListener("load", update, { once: true }));
    return () => {
      ctx.revert();
      images.forEach((i) => i.removeEventListener("load", update));
    };
  }, [motion]);
  return (
    <div className="home" ref={scope}>
      <OpeningIntro motion={motion} onEnter={() => {
        const hero = document.getElementById("home-hero");
        if (introScroll.current) introScroll.current.scrollTo(hero, { duration: 1.4 });
        else if (hero) window.scrollTo({ top: hero.offsetTop, behavior: motion ? "smooth" : "instant" });
      }} />
      <section
        className="hero"
        id="home-hero"
        onPointerMove={(e) => {
          if (!motion || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--pointer-x",
            `${(e.clientX / r.width - 0.5) * 10}px`,
          );
          e.currentTarget.style.setProperty(
            "--pointer-y",
            `${(e.clientY / r.height - 0.5) * 6}px`,
          );
        }}
      >
        <picture className="hero-visual">
          <source
            media="(max-width:700px)"
            srcSet="/media/garden/garden-hero-clear-900.webp"
          />
          <img
            src="/media/garden/garden-hero-clear.webp"
            alt="A rose-covered stone arch and two sculptural figures beside branching paths in an English walled garden"
            width="1774"
            height="887"
            fetchPriority="high"
          />
        </picture>
        <div className="hero-copy">
          <span className="eyebrow">Before the agent. Before the rollout.</span>
          <h1>
            Model the handoff
            <br />
            before <em>rollout.</em>
          </h1>
          <p>
            Explore agent-assisted order-to-cash scenarios.
            <br className="desktop-only" /> With assumptions, uncertainty and
            historical
            <br className="desktop-only" /> evidence in view.
          </p>
          <div className="hero-ctas">
            <a className="btn" href="/study">
              Backtest one deployment <Arrow />
            </a>
            <a className="text-link" href="/demo">
              Explore the demo <Arrow />
            </a>
          </div>
          <div className="hero-small-note">
            <span />
            Better questions.
            <br />
            More considered decisions.
          </div>
        </div>
        <div className="hero-caption">
          <span>
            Same process.
            <br />
            Different paths.
            <br />A clearer way forward.
          </span>
          <i aria-hidden="true" />
        </div>
        <div className="hero-bottom">
          <a href="#journey" className="scroll-cue">
            <span className="scroll-icon" aria-hidden="true">
              ↓
            </span>
            Scroll to follow the process
          </a>
          <span className="hero-disclosure">
            Research-stage concept · Synthetic product preview
          </span>
          <span className="chapter-tiny">01 / 06</span>
        </div>
      </section>
      <div className="early-proof">
        <span className="eyebrow">A proposed planning workspace</span>
        <p>
          No claimed customer outcomes.
          <br />
          The evidence comes <em>first.</em>
        </p>
        <a href="/method">
          Read our validation approach <Arrow />
        </a>
      </div>
      <Journey motion={motion} />
      <Workspace />
      <section className="modules-section section-pad" id="modules">
        <div className="section-header">
          <div>
            <span className="eyebrow">03 — Five proposed modules</span>
            <h2>
              A complete
              <br />
              backtesting <em>workspace.</em>
            </h2>
          </div>
          <div className="section-side">
            <p>
              From source evidence to post-pilot calibration. Five distinct
              offers to test, starting with one process and one pending
              decision.
            </p>
            <a className="text-link" href="/product">
              See how they fit together <Arrow />
            </a>
          </div>
        </div>
        <div className="module-grid">
          {modules.map((m) => (
            <ModuleCard key={m.slug} module={m} />
          ))}
        </div>
        <div className="module-caption">
          <span>Thoughtfully connected. Individually testable.</span>
          <span>Proposed modules · Not live products</span>
        </div>
      </section>
      <section className="belief section-pad">
        <img
          className="belief-stamp"
          src="/media/heritage/evidence-postage-illustration.webp"
          width="1122"
          height="1402"
          alt="Decorative stamp illustration of a report with uncertainty intervals"
          loading="lazy"
        />
        <div className="belief-copy">
          <span className="eyebrow">04 — A simulation is a question</span>
          <h2>
            A beautiful map
            <br />
            isn’t <em>the evidence.</em>
          </h2>
          <p className="lead">The model has to earn your trust.</p>
          <p>
            Start with consented historical logs. Hold out a known process
            change. Test the direction of the outcome against actual history, a
            naive baseline and your existing mining workflow.
          </p>
          <a href="/method" className="text-link">
            Simulation vs calibration <Arrow />
          </a>
          <div className="evidence-levels">
            <div>
              <strong>Established</strong>
              <span>Adjacent mining & simulation</span>
            </div>
            <div>
              <strong>Hypothesis</strong>
              <span>Agent-specific calibration wedge</span>
            </div>
            <div>
              <strong>Unvalidated</strong>
              <span>Accuracy & willingness to pay</span>
            </div>
          </div>
        </div>
      </section>
      <section className="people-section section-pad">
        <div className="section-header">
          <div>
            <span className="eyebrow">05 — A decision with an owner</span>
            <h2>
              The right process.
              <br />
              The right <em>people.</em>
            </h2>
          </div>
          <div className="section-side">
            <p>
              Designed around a process excellence director at a mid-to-large
              B2B distributor with order-to-cash logs and an automation decision
              ahead.
            </p>
            <a className="text-link" href="/solutions">
              Explore the buyer journey <Arrow />
            </a>
          </div>
        </div>
        <div className="people-grid">
          {[
            [
              "01",
              "The process champion",
              "Process excellence director",
              "Owns the question, agrees the holdout and connects operational evidence.",
            ],
            [
              "02",
              "The budget owner",
              "Operations VP / COO",
              "Sponsors a paid, decision-specific planning study before any platform commitment.",
            ],
            [
              "03",
              "The data partner",
              "ERP process owner",
              "Supplies consented event logs, explains the process and confirms integration rights.",
            ],
          ].map(([n, h, r, t]) => (
            <article key={n}>
              <span className="people-number">{n}</span>
              <h3>{h}</h3>
              <span className="eyebrow">{r}</span>
              <p>{t}</p>
            </article>
          ))}
        </div>
        <div className="incumbent-note">
          <span>Fits the existing conversation.</span>
          <p>
            Celonis already describes process simulation. UiPath links process
            findings to automation ideas. Our proposed question is whether agent
            behavior and control assumptions can be calibrated usefully beyond
            those workflows.
          </p>
          <a href="/data">
            View the comparison <Arrow />
          </a>
        </div>
      </section>
      <section className="study-teaser section-pad">
        <div className="teaser-image">
          <img
            src="/media/heritage/threshold-postage-illustration.webp"
            alt="Decorative stamp of two paths through a stone arch"
            width="1122"
            height="1402"
            loading="lazy"
          />
        </div>
        <div className="teaser-copy">
          <span className="eyebrow">A study before a platform</span>
          <h2>
            Begin with
            <br />
            one <em>pending decision.</em>
          </h2>
          <p>
            Proposed engagements to test—not established prices or validated
            offers.
          </p>
          <div className="price-lines">
            <a href="/pricing">
              <div>
                <strong>One-process backtest study</strong>
                <span>Hypothetical test price</span>
              </div>
              <b>
                $8,000 <Arrow />
              </b>
            </a>
            <a href="/pricing">
              <div>
                <strong>Monitored twin pilot</strong>
                <span>Hypothetical test price</span>
              </div>
              <b>
                $3,000<span>/mo</span> <Arrow />
              </b>
            </a>
          </div>
          <p className="fine">
            No active checkout. No forecast gains. Paid sponsor and
            pre-registered comparison criteria required before advancing.
          </p>
          <a className="text-link" href="/pricing">
            What a planning study includes <Arrow />
          </a>
        </div>
      </section>
      <section className="faq-section section-pad">
        <div>
          <span className="eyebrow">Questions worth asking</span>
          <h2>
            Before you
            <br />
            <em>take the next step.</em>
          </h2>
        </div>
        <div className="faq-list">
          {[
            [
              "Is FlowBackTest an operating product?",
              "This is a research-stage website and synthetic product preview. No customer demand, live integrations or predictive accuracy has been demonstrated.",
            ],
            [
              "How is this different from process mining?",
              "The proposed distinction is agent-specific behavioral calibration and policy/control modeling. Process mining and simulation already exist; a generic process map would not be enough.",
            ],
            [
              "What data would a real study need?",
              "Consented historical case IDs, activity timestamps, process context and a known historical change for holdout testing. Do not upload raw logs through this public preview.",
            ],
            [
              "What would make the build go ahead?",
              "A real pending decision, a paid sponsor and a backtest that meets agreed directional/control criteria against both a naive baseline and the existing process-mining workflow. Incomplete logs or unstable calibration are pause conditions.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="closing-cta">
        <img
          src="/media/cloister/cloister-courtyard-banner.webp"
          alt="Quiet limestone courtyard with topiary and a fountain"
          width="1774"
          height="887"
          loading="lazy"
        />
        <div className="cta-copy">
          <span className="eyebrow">
            06 — From a question to a clearer path
          </span>
          <h2>
            Run a backtest
            <br />
            for your <em>environment.</em>
          </h2>
          <p>
            Your process. Your assumptions.
            <br />A decision worth testing.
          </p>
          <div className="hero-ctas">
            <a href="/study" className="btn burgundy">
              Backtest one deployment <Arrow />
            </a>
            <a href="/demo" className="text-link">
              Explore the demo <Arrow />
            </a>
          </div>
          <span className="fine">Study request is a local demo only.</span>
        </div>
      </section>
    </div>
  );
}
export default Home;
