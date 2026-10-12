import React, { useId, useState } from "react";
import { clearDemoData as clearPreviewData } from "./telemetry";
import { HISTORICAL_CASES } from "./fixtures";
const previewRecord = HISTORICAL_CASES.find((record) => record.id === "O-248");
import "./pages.css";

const ASSET = "/media/cloister/";
const modules = [
  {
    slug: "desk",
    name: "Workflow Desk",
    n: "01",
    line: "Begin with what actually happened.",
    job: "Event-log ingest & process baseline",
    image: "cloister-workflow-desk.webp",
    intro:
      "Put timestamps, activities and case IDs into a traceable baseline before changing a single handoff.",
    input:
      "Consented event records, case identifiers, activity names and timestamps.",
    steps: [
      "Inspect event coverage",
      "Reconstruct the current route",
      "Measure queues and variation",
      "Document gaps and exclusions",
    ],
    proof:
      "A baseline report with source references, missing-event checks and clearly bounded process coverage.",
    control:
      "Incomplete or ambiguous events stay visible. The study pauses when the log cannot support the decision.",
    outputs: [
      "Event coverage and data dictionary",
      "Activity and queue distributions",
      "Process owner review and exclusions",
    ],
    faq: [
      [
        "Does this connect to my ERP?",
        "This preview does not connect to an ERP. A study would first establish export access, permitted use and integration rights with the ERP process owner.",
      ],
      [
        "Is a process map enough?",
        "A map helps describe the process. Baseline timing, coverage and variation are also needed before a scenario can be tested.",
      ],
    ],
  },
  {
    slug: "review",
    name: "Workflow Review",
    n: "02",
    line: "Give every new path an assumption.",
    job: "Agent insertion & exception scenarios",
    image: "cloister-workflow-review.webp",
    intro:
      "Choose where an agent may enter the process, which cases it may handle and when a person must take over.",
    input:
      "A reviewed baseline, a pending deployment decision and explicit handoff, exception and review rules.",
    steps: [
      "Select one handoff",
      "Define eligible cases",
      "Set exception routing",
      "Assign human review",
    ],
    proof:
      "A versioned scenario showing the changed activity, eligibility rules, escalation owner and assumptions to test.",
    control:
      "The preview never performs an external action. Human approval remains required for external, payment or physical actions.",
    outputs: [
      "Human-only and agent-assisted scenarios",
      "Exception routes and reviewer ownership",
      "Versioned behavioral assumptions",
    ],
    faq: [
      [
        "Can an agent complete an order here?",
        "No. The demo is an isolated scenario workbench. It cannot send, approve an actual payment, update an ERP or perform other external actions.",
      ],
      [
        "How is agent behavior represented?",
        "Handling time, eligible cases, exceptions and review rules are explicit assumptions. They need calibration against consented observations.",
      ],
    ],
  },
  {
    slug: "proof",
    name: "Workflow Proof",
    n: "03",
    line: "A result needs a range, and a test.",
    job: "Stochastic throughput & handoff simulation",
    image: "cloister-workflow-proof.webp",
    intro:
      "Explore how queues and handoffs could respond under a seeded scenario, then compare the model with a withheld historical change.",
    input:
      "Baseline activity distributions, scenario assumptions, seed and a separate historical holdout period.",
    steps: [
      "Run seeded scenarios",
      "Inspect outcome intervals",
      "Compare the holdout",
      "Review baseline comparisons",
    ],
    proof:
      "An uncertainty-aware report with the run seed, assumptions, holdout status and comparison to a naive baseline and existing workflow.",
    control:
      "An illustrative interval is not a measured forecast. Unvalidated runs are clearly labeled until a relevant backtest supports them.",
    outputs: [
      "Throughput, handoff and queue intervals",
      "Reproducible scenario settings",
      "Holdout and baseline comparison report",
    ],
    faq: [
      [
        "What accuracy is promised?",
        "None. Predictive accuracy is unvalidated. A real study must agree decision-specific, pre-registered directional and control criteria before the holdout is examined.",
      ],
      [
        "Why keep the random seed?",
        "It makes a run reproducible. Reproducibility helps review a model; it does not establish that the assumptions are accurate.",
      ],
    ],
  },
  {
    slug: "signal",
    name: "Workflow Signal",
    n: "04",
    line: "An exception is a path to review.",
    job: "Compliance & control failure modeling",
    image: "cloister-workflow-signal.webp",
    intro:
      "Represent approval gates, exception queues and potential control failures alongside operational outcomes.",
    input:
      "Documented control rules, exception categories, review capacity and a named control owner.",
    steps: [
      "Identify control gates",
      "Model failure assumptions",
      "Route review and escalation",
      "Evaluate the holdout criteria",
    ],
    proof:
      "A control scenario report showing the assumed failure route, responsible reviewer and open questions.",
    control:
      "Modeled controls do not establish compliance or certification. A qualified owner must review the actual policy and proposed deployment.",
    outputs: [
      "Control and exception scenarios",
      "Review queue sensitivity",
      "Open risks and ownership register",
    ],
    faq: [
      [
        "Does FlowBackTest certify compliance?",
        "No. This is a proposed modeling module. It does not provide a certification, legal opinion or guarantee that a control will prevent a failure.",
      ],
      [
        "Can a reviewer release a real order?",
        "No. All reviewer actions in this website are explicit synthetic demo state changes with no outbound effects.",
      ],
    ],
  },
  {
    slug: "report",
    name: "Workflow Report",
    n: "05",
    line: "Keep the model answerable to reality.",
    job: "Predicted-versus-actual calibration",
    image: "cloister-workflow-report.webp",
    intro:
      "After a real pilot, compare what the model expected with what the process actually did and decide what needs recalibration.",
    input:
      "A frozen pre-pilot scenario, consented pilot observations and agreed comparison periods.",
    steps: [
      "Freeze the prediction",
      "Review pilot observations",
      "Measure model discrepancy",
      "Recalibrate or pause",
    ],
    proof:
      "A dated predicted-versus-actual readout with model version, exclusions, discrepancies and a clear continue-or-pause decision.",
    control:
      "Process drift and changing agent behavior can invalidate a previously useful model. Discrepancies stay visible.",
    outputs: [
      "Predicted-versus-actual comparison",
      "Drift and assumption review",
      "Calibration history and decision record",
    ],
    faq: [
      [
        "Is the monitoring platform live?",
        "No. Connected monitoring is a proposed expansion after a validated study and pilot. This website uses synthetic fixtures only.",
      ],
      [
        "What happens when the process changes?",
        "The process owner reviews data quality and drift. If calibration becomes unstable, pause decision use and revisit the model rather than carrying forward old certainty.",
      ],
    ],
  },
];

function Icon({ type = "arrow", size = 22, ...props }) {
  const shapes = {
    arrow: (
      <>
        <path d="M4 12h15M13 6l6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    source: (
      <>
        <path d="M6 3h8l4 4v14H6Z M14 3v5h4M9 12h6m-6 4h6" />
      </>
    ),
    gate: (
      <>
        <path d="M5 21V10a7 7 0 0 1 14 0v11M5 11h14M8 11v10m4-10v10m4-10v10" />
      </>
    ),
    interval: (
      <>
        <path d="M3 7h18M3 17h18M3 4v6m18-6v6M3 14v6m18-6v6" />
        <circle cx="10" cy="7" r="2" />
        <circle cx="14" cy="17" r="2" />
      </>
    ),
    reset: (
      <>
        <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
      </>
    ),
    branch: (
      <>
        <path d="M5 12h5m0 0V5h9m-9 7v7h9M16 2l3 3-3 3m0 8 3 3-3 3" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {shapes[type] || shapes.arrow}
    </svg>
  );
}

function Action({
  href = "/study",
  children = "Backtest one deployment",
  secondary = false,
}) {
  return (
    <a
      className={`sub-action ${secondary ? "sub-action-secondary" : ""}`}
      href={href}
    >
      {children}
      <Icon size={19} />
    </a>
  );
}

function Hero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt = "Sunlit limestone arches opening onto an English garden.",
  compact = false,
  children,
}) {
  return (
    <section
      className={`sub-hero ${compact ? "sub-hero-compact" : ""} ${image ? "" : "sub-hero-paper"}`}
    >
      <div className="sub-hero-copy">
        <div className="sub-eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p className="sub-intro">{intro}</p>
        {children}
      </div>
      {image && (
        <div className="sub-hero-art">
          <img src={image} alt={imageAlt} fetchPriority="high" />
          <span className="sub-art-caption">A considered path forward.</span>
        </div>
      )}
    </section>
  );
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="sub-section-title">
      <div>
        <p className="sub-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  );
}

function Notice({ children, label = "Concept preview" }) {
  return (
    <div className="sub-notice">
      <Icon type="eye" />
      <div>
        <strong>{label}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Closing({
  title = "Start with one real decision.",
  text = "A proposed planning study begins with a process owner, consented event logs and one pending agent deployment decision.",
}) {
  return (
    <section className="sub-closing">
      <div>
        <p className="sub-eyebrow">From question to a clearer path</p>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="sub-actions">
          <Action />
          <Action href="/demo" secondary>
            Explore the synthetic demo
          </Action>
        </div>
        <small>
          All forms on this website are local demo drafts. Nothing is sent.
        </small>
      </div>
      <img
        src={`${ASSET}cloister-courtyard-banner.webp`}
        alt="A peaceful limestone courtyard with clipped garden hedges."
        loading="lazy"
      />
    </section>
  );
}

function Accordion({ items }) {
  return (
    <div className="sub-faq">
      {items.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

function ModuleCards({ compact = false }) {
  return (
    <div
      className={`sub-module-grid ${compact ? "sub-module-grid-compact" : ""}`}
    >
      {modules.map((m) => (
        <a className="sub-module-card" href={`/product/${m.slug}`} key={m.slug}>
          <div className="sub-module-image">
            <img
              src={ASSET + m.image}
              alt={
                m.slug === "proof"
                  ? "Sage and burgundy sculptural bars on a limestone base."
                  : m.slug === "signal"
                    ? "An oak gateway in a limestone arch, open to the garden."
                    : m.slug === "review"
                      ? "Two colored routes through sunlit limestone arches."
                      : m.slug === "desk"
                        ? "Stone document blocks arranged on a sunlit oak table."
                        : "An ivory report beside muted burgundy checked fabric."
              }
              loading="lazy"
            />
            <span>{m.n}</span>
          </div>
          <div className="sub-module-copy">
            <p>{m.job}</p>
            <h3>
              {m.name}
              <Icon />
            </h3>
            <span>{m.line}</span>
            <small>Proposed module</small>
          </div>
        </a>
      ))}
    </div>
  );
}

const runTabs = [
  {
    label: "Baseline",
    icon: "source",
    title: "Keep the evidence in view.",
    text: "Case O-248 follows the same order-to-cash process as 39 other synthetic cases. Inspect its event trail before configuring a new handoff.",
    rows: previewRecord.events.map((event) => [
      event.activity,
      `${event.timestamp.slice(11, 16)} UTC`,
      event.event_id,
    ]),
    foot: "40 synthetic cases · fictional Kestrel Wholesale · no ERP connection",
  },
  {
    label: "Scenario",
    icon: "branch",
    title: "Make the changed handoff explicit.",
    text: "An illustrative agent triages eligible orders. Exceptions enter a human review queue. Approval stays with the responsible person.",
    rows: [
      ["Eligible activity", "Triage", "Proposed"],
      ["Exception routing", "Human review", "Required"],
      ["External actions", "Human approval", "Required"],
      ["Agent behavior", "Uncalibrated", "Assumption"],
    ],
    foot: "Illustrative scenario · no real actions or writes",
  },
  {
    label: "Evidence",
    icon: "interval",
    title: "A comparison, with its limits attached.",
    text: "The preview illustrates where uncertainty and holdout status would appear. It does not establish predictive accuracy on customer data.",
    rows: [
      ["Scenario interval", "Illustrative", "Assumption-dependent"],
      ["Historical holdout", "Not validated", "Synthetic fixture"],
      ["Naive comparison", "Required", "Future study"],
      ["Incumbent comparison", "Required", "Future study"],
    ],
    foot: "Synthetic demonstration · no measured savings or validated accuracy",
  },
];

function EvidenceWorkbench() {
  const [tab, setTab] = useState(0);
  const id = useId();
  const item = runTabs[tab];
  const handleKey = (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 2
          : (tab + (event.key === "ArrowRight" ? 1 : 2)) % 3;
    setTab(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  return (
    <div className="sub-workbench">
      <div className="sub-workbench-ribbon">
        <span className="sub-demo-dot" /> DEMO — SYNTHETIC SAMPLE DATA
        <span>Read-only concept preview</span>
      </div>
      <div
        className="sub-workbench-tabs"
        role="tablist"
        aria-label="Evidence workbench steps"
      >
        {runTabs.map((t, i) => (
          <button
            key={t.label}
            id={`${id}-tab-${i}`}
            role="tab"
            aria-selected={tab === i}
            aria-controls={`${id}-panel`}
            tabIndex={tab === i ? 0 : -1}
            onKeyDown={handleKey}
            onClick={() => setTab(i)}
          >
            <Icon type={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="sub-workbench-content"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${tab}`}
        tabIndex="0"
      >
        <div>
          <span className="sub-eyebrow">O-248 / Kestrel Wholesale</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <a href="/demo" className="sub-text-link">
            Open the full demo
            <Icon size={18} />
          </a>
        </div>
        <div className="sub-event-list">
          {item.rows.map(([name, value, status], i) => (
            <div key={name}>
              <span className="sub-event-index">0{i + 1}</span>
              <span>
                {name}
                <small>{status}</small>
              </span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="sub-workbench-foot">{item.foot}</div>
    </div>
  );
}

function Product() {
  return (
    <>
      <Hero
        eyebrow="Five proposed modules · one considered process"
        title={
          <>
            A workspace for
            <br />
            <em>what happens next.</em>
          </>
        }
        intro="Explore where an agent belongs in an order-to-cash process, then put the assumptions through a historical backtest."
        image={`${ASSET}cloister-hero.webp`}
      >
        <div className="sub-actions">
          <Action />
          <Action href="/demo" secondary>
            Explore demo
          </Action>
        </div>
        <p className="sub-hero-note">
          Research-stage concept. Synthetic preview. No production ERP access.
        </p>
      </Hero>
      <section className="sub-section">
        <SectionTitle
          eyebrow="A connected evidence chain"
          title="From source events to a decision."
          text="Each proposed module owns a different question. A first study selects one process and one module to test before expanding."
        />
        <div className="sub-chain">
          {[
            "Baseline",
            "Scenario",
            "Simulation",
            "Controls",
            "Calibration",
          ].map((s, i) => (
            <div key={s}>
              <span>0{i + 1}</span>
              <strong>{s}</strong>
              <Icon />
            </div>
          ))}
        </div>
        <ModuleCards />
      </section>
      <section className="sub-section sub-evidence-section">
        <SectionTitle
          eyebrow="The product, in context"
          title="The record stays beside the result."
          text="A useful workbench makes provenance, ownership, assumptions and validation status visible together."
        />
        <EvidenceWorkbench />
      </section>
      <section className="sub-section sub-two-column">
        <div>
          <p className="sub-eyebrow">A planning study before a platform</p>
          <h2>
            Describe. Test.
            <br />
            <em>Then decide.</em>
          </h2>
        </div>
        <div>
          <p className="sub-body-large">
            The first proposed engagement is a decision-specific study using
            consented historical process logs. Connected twins and live
            monitoring would come only after useful calibration evidence and
            buyer commitment.
          </p>
          <Notice>
            Accuracy, demand and willingness to pay remain unvalidated. These
            modules are product directions, not five live subscription plans.
          </Notice>
          <a className="sub-text-link" href="/method">
            Read the validation method
            <Icon />
          </a>
        </div>
      </section>
      <Closing />
    </>
  );
}

function Module({ module: m }) {
  const type = {
    desk: "source",
    review: "branch",
    proof: "interval",
    signal: "gate",
    report: "source",
  }[m.slug];
  return (
    <>
      <Hero
        eyebrow={`${m.name} / Proposed module ${m.n}`}
        title={m.line}
        intro={m.intro}
        image={ASSET + m.image}
        imageAlt={`Original illustrative visual for ${m.name}.`}
      >
        <div className="sub-actions">
          <Action>Plan a one-process study</Action>
          <Action href="/demo" secondary>
            See synthetic demo
          </Action>
        </div>
        <p className="sub-hero-note">
          Proposed module · no active checkout or production integration
        </p>
      </Hero>
      <section className="sub-section sub-module-spec">
        <div className="sub-spec-heading">
          <Icon type={type} size={34} />
          <h2>{m.job}</h2>
          <p>
            Built around a process excellence director, with an ERP process
            owner supplying the evidence and an operations VP sponsoring the
            decision.
          </p>
        </div>
        <div className="sub-spec-data">
          <div>
            <span>Inputs</span>
            <p>{m.input}</p>
          </div>
          <div>
            <span>Evidence to produce</span>
            <p>{m.proof}</p>
          </div>
          <div>
            <span>Control boundary</span>
            <p>{m.control}</p>
          </div>
        </div>
      </section>
      <section className="sub-section sub-steps-section">
        <SectionTitle
          eyebrow="A clear sequence"
          title="The proposed workflow."
        />
        <div className="sub-numbered-steps">
          {m.steps.map((s, i) => (
            <div key={s}>
              <span>0{i + 1}</span>
              <h3>{s}</h3>
              <span className="sub-step-rule" />
            </div>
          ))}
        </div>
      </section>
      <section className="sub-section">
        <EvidenceWorkbench />
        <div className="sub-deliverables">
          <p className="sub-eyebrow">Study outputs</p>
          {m.outputs.map((o) => (
            <p key={o}>
              <Icon type="check" size={18} />
              {o}
            </p>
          ))}
        </div>
      </section>
      <section className="sub-section sub-two-column">
        <div>
          <p className="sub-eyebrow">Questions worth asking</p>
          <h2>
            Know the limits
            <br />
            before the rollout.
          </h2>
        </div>
        <Accordion items={m.faq} />
      </section>
      <section className="sub-section sub-related">
        <SectionTitle
          eyebrow="The wider workspace"
          title="Follow the next question."
        />
        <div className="sub-related-links">
          {modules
            .filter((other) => other.slug !== m.slug)
            .map((other) => (
              <a href={`/product/${other.slug}`} key={other.slug}>
                <span>{other.n}</span>
                <div>
                  <h3>{other.name}</h3>
                  <p>{other.job}</p>
                </div>
                <Icon />
              </a>
            ))}
        </div>
      </section>
      <Closing />
    </>
  );
}

const methodSteps = [
  [
    "Agree the decision",
    "Name the process owner, budget owner, pending agent deployment and decision date. Record the present mining stack and the actual workaround.",
    "A sponsor and a specific decision",
  ],
  [
    "Review consented logs",
    "Inspect event coverage, timestamps, activity meanings and integration rights. Use redacted, consented artifacts through an agreed private study channel.",
    "A reviewed baseline and exclusions",
  ],
  [
    "Freeze the test",
    "Hold out a known historical process change. Pre-register directional accuracy and control criteria before inspecting the withheld result.",
    "A frozen model and pass/fail criteria",
  ],
  [
    "Backtest the scenario",
    "Test directional effects against actual history. Compare the model with a naive baseline and the customer’s existing process-mining workflow.",
    "A dated comparison, including failures",
  ],
  [
    "Continue or pause",
    "Continue only if the study beats both comparisons for the named decision with a paid sponsor. Pause when logs are incomplete or calibration is unstable.",
    "A recorded decision and conversion path",
  ],
];

function Method() {
  const [step, setStep] = useState(0);
  return (
    <>
      <Hero
        eyebrow="Simulation & calibration"
        title={
          <>
            A map describes.
            <br />A backtest <em>questions.</em>
          </>
        }
        intro="The value of a scenario depends on whether its assumptions survive a relevant test against historical evidence."
        image={`${ASSET}cloister-workflow-review.webp`}
      >
        <div className="sub-actions">
          <Action href="/demo">Explore a synthetic backtest</Action>
          <Action href="/resources" secondary>
            Get the worksheet
          </Action>
        </div>
      </Hero>
      <section className="sub-section">
        <div className="sub-principle-pair">
          <article>
            <span className="sub-eyebrow">Simulation</span>
            <h2>What could happen?</h2>
            <p>
              A discrete-event model explores changes to handling time,
              exception routing and queues. Every outcome depends on
              assumptions.
            </p>
            <div className="sub-principle-bottom">
              Scenario + distributions + seed <Icon /> illustrative range
            </div>
          </article>
          <article>
            <span className="sub-eyebrow">Calibration</span>
            <h2>How well did it match?</h2>
            <p>
              A withheld historical change tests whether the model gets the
              direction right and respects agreed control criteria.
            </p>
            <div className="sub-principle-bottom">
              Frozen model + holdout <Icon /> observed comparison
            </div>
          </article>
        </div>
      </section>
      <section className="sub-section sub-method-section">
        <SectionTitle
          eyebrow="The proposed study protocol"
          title="Evidence, before expansion."
          text="No universal accuracy target is invented here. The sponsor and process owner agree criteria for their specific decision."
        />
        <div className="sub-method-workflow">
          <div className="sub-method-nav" aria-label="Study protocol stages">
            {methodSteps.map((s, i) => (
              <button
                className={step === i ? "is-active" : ""}
                key={s[0]}
                aria-pressed={step === i}
                onClick={() => setStep(i)}
              >
                <span>0{i + 1}</span>
                {s[0]}
                <Icon />
              </button>
            ))}
          </div>
          <div className="sub-method-detail" aria-live="polite">
            <span className="sub-method-number">0{step + 1}</span>
            <h3>{methodSteps[step][0]}</h3>
            <p>{methodSteps[step][1]}</p>
            <div>
              <Icon type="source" />
              <span>
                Evidence at this stage<strong>{methodSteps[step][2]}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="sub-section">
        <SectionTitle
          eyebrow="A falsifiable build decision"
          title="The threshold is useful evidence."
        />
        <div className="sub-go-pause">
          <article>
            <p className="sub-eyebrow">Continue only when</p>
            <h3>The model improves the decision.</h3>
            <ul>
              <li>A process owner sponsors a paid planning study.</li>
              <li>Consented logs support the process being tested.</li>
              <li>A pending deployment decision and budget owner are named.</li>
              <li>
                The holdout beats a naive baseline and the existing
                process-mining workflow under agreed criteria.
              </li>
            </ul>
          </article>
          <article>
            <p className="sub-eyebrow">Pause when</p>
            <h3>The evidence cannot carry the claim.</h3>
            <ul>
              <li>Logs are incomplete, ambiguous or unavailable.</li>
              <li>Calibration is unstable or fails the pre-registered test.</li>
              <li>Agent behavior changes beyond modeled assumptions.</li>
              <li>
                The incumbent workflow already answers the decision well enough.
              </li>
            </ul>
          </article>
        </div>
      </section>
      <section className="sub-section sub-two-column">
        <div>
          <p className="sub-eyebrow">Uncertainty belongs in the workbench</p>
          <h2>
            Keep the caveats
            <br />
            <em>close to the chart.</em>
          </h2>
        </div>
        <Accordion
          items={[
            [
              "Data quality and event access",
              "Missing timestamps, inconsistent case IDs and unclear activities weaken the baseline. Export permissions and integration rights must be established before a real study.",
            ],
            [
              "Process drift",
              "Seasonality, workload and policy changes can shift process behavior. A model calibrated to one period needs review before being used for another.",
            ],
            [
              "Nonstationary agent behavior",
              "Models, prompts, tools and routing policies can change. Observed behavior should be versioned and compared with the assumptions used in the scenario.",
            ],
            [
              "Incumbent substitution",
              "Celonis already documents process simulation. UiPath links process-mining findings to automation ideas. The proposed wedge is agent-specific behavioral calibration and control modeling, which still needs validation.",
            ],
            [
              "Current evidence level",
              "There is strong adjacent evidence for process mining and simulation, a plausible but unvalidated agent-specific wedge, and low evidence for predictive accuracy or purchase intent. TAM, sales cycle, price acceptance and buyer commitment remain unknown.",
            ],
          ]}
        />
      </section>
      <Closing title="Bring a decision. Ask for a test." />
    </>
  );
}

function Data() {
  return (
    <>
      <Hero
        eyebrow="Data & incumbent comparison"
        title={
          <>
            The source matters
            <br />
            as much as <em>the scenario.</em>
          </>
        }
        intro="A trustworthy study starts with event provenance, permitted use and an honest comparison with the tools a customer already has."
        image={`${ASSET}cloister-source.webp`}
        imageAlt="An ivory stack of paper held in a limestone document block."
      />
      <section className="sub-section">
        <SectionTitle
          eyebrow="A minimum useful event record"
          title="Four fields. Context alongside them."
          text="Requirements vary by decision. These are starting fields to review with the ERP process owner, not a guarantee that a log is sufficient."
        />
        <div
          className="sub-schema-table"
          role="region"
          aria-label="Event record data dictionary"
          tabIndex="0"
        >
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Why it is needed</th>
                <th>Synthetic example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>case_id</code>
                </td>
                <td>Connect events belonging to the same order.</td>
                <td>O-248</td>
              </tr>
              <tr>
                <td>
                  <code>activity</code>
                </td>
                <td>Describe the process step consistently.</td>
                <td>{previewRecord.events[1].activity}</td>
              </tr>
              <tr>
                <td>
                  <code>timestamp</code>
                </td>
                <td>
                  Reconstruct order, timing and queues with a known time zone.
                </td>
                <td>{previewRecord.events[1].timestamp}</td>
              </tr>
              <tr>
                <td>
                  <code>event_id</code>
                </td>
                <td>Trace a modeled event to its permitted source.</td>
                <td>{previewRecord.events[1].event_id}</td>
              </tr>
              <tr>
                <td>Useful context</td>
                <td>
                  Owner or role, exception category, case attributes, change
                  date, timestamp meaning.
                </td>
                <td>Accounts team / human review</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Notice label="Data boundary">
          Do not upload raw logs, credentials, contracts or sensitive records
          through the public demo form. Real data access would be agreed
          privately with the process owner.
        </Notice>
      </section>
      <section className="sub-section sub-data-review">
        <div>
          <span className="sub-eyebrow">Before a model runs</span>
          <h2>
            Ask what the log
            <br />
            <em>leaves out.</em>
          </h2>
          <p>
            Queue waiting, missing activities, duplicate events and clock
            inconsistencies can change the story. Exclusions should remain
            visible to the sponsor.
          </p>
        </div>
        <div className="sub-data-checks">
          {[
            [
              "Coverage",
              "Which cases, activities and periods are included or absent?",
            ],
            [
              "Time",
              "Are time zones, start/end meanings and clock quality understood?",
            ],
            [
              "Identity",
              "Are case keys stable across exports and source systems?",
            ],
            [
              "Rights",
              "Has the owner authorized export, analysis, retention and integration use?",
            ],
            [
              "Change",
              "Can a historical change be held out without contaminating the baseline?",
            ],
          ].map(([h, t], i) => (
            <div key={h}>
              <span>0{i + 1}</span>
              <strong>{h}</strong>
              <p>{t}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="sub-section">
        <SectionTitle
          eyebrow="Existing approaches deserve a real comparison"
          title="Simulation is an established category."
          text="FlowBackTest is a proposed agent-specific study approach. It must demonstrate value beyond an incumbent workflow, consultant or manual model."
        />
        <div className="sub-comparison">
          <article>
            <p className="sub-eyebrow">Celonis</p>
            <h3>Process intelligence & simulation</h3>
            <p>
              Celonis documentation describes process simulation. It must not be
              represented as lacking simulation or digital twins.
            </p>
            <a
              href="https://docs.celonis.com/en/process-simulation.html"
              target="_blank"
              rel="noreferrer"
              className="sub-text-link"
            >
              Process simulation documentation
              <Icon size={18} />
            </a>
          </article>
          <article>
            <p className="sub-eyebrow">UiPath</p>
            <h3>Process mining & automation ideas</h3>
            <p>
              UiPath Process Mining connects process findings to Automation Hub
              ideas, supporting an established path from discovery to automation
              planning.
            </p>
            <a
              href="https://docs.uipath.com/process-mining/automation-cloud/latest/user-guide/sending-automation-ideas-to-uipath-automation-hub"
              target="_blank"
              rel="noreferrer"
              className="sub-text-link"
            >
              Automation ideas documentation
              <Icon size={18} />
            </a>
          </article>
          <article>
            <p className="sub-eyebrow">Other substitutes</p>
            <h3>BPM, consultants & manual mapping</h3>
            <p>
              BPM simulation, process consultants, spreadsheets and manual
              mapping may already answer the decision. A study should compare
              with the customer's actual workflow.
            </p>
            <a href="/method" className="sub-text-link">
              How the comparison works
              <Icon size={18} />
            </a>
          </article>
        </div>
        <div className="sub-wedge">
          <Icon type="branch" size={38} />
          <div>
            <h3>The proposed wedge: agent behavior and controls.</h3>
            <p>
              Calibrate agent handling and exception assumptions, model review
              policies, and backtest the result. Accuracy, integration access
              and willingness to pay beyond incumbents are still open questions.
            </p>
          </div>
          <span>
            Hypothesis
            <br />
            to validate
          </span>
        </div>
        <small className="sub-source-note">
          Vendor names are factual comparators, not endorsements. The Celonis
          source previously redirected direct extraction to sign-in; its
          accessible search excerpt supported the simulation claim. No live
          integrations are asserted.
        </small>
      </section>
      <Closing />
    </>
  );
}

function Pricing() {
  return (
    <>
      <Hero
        compact
        eyebrow="Commercial hypotheses"
        title={
          <>
            A study first.
            <br />
            <em>A platform, if earned.</em>
          </>
        }
        intro="Two proposed price tests for decision-specific work. Demand, willingness to pay, sales cycle and these rates have not been validated."
      >
        <Notice label="Hypothetical pricing — not active offers">
          This website has no checkout, payment collection or live subscription.
          Every request is a local demo draft.
        </Notice>
      </Hero>
      <section className="sub-section sub-pricing-section">
        <div className="sub-pricing-grid">
          <article className="sub-price-card">
            <div className="sub-price-head">
              <span className="sub-eyebrow">Start with evidence</span>
              <span className="sub-price-badge">Price hypothesis</span>
            </div>
            <h2>
              One-process
              <br />
              backtest study
            </h2>
            <p className="sub-price">
              $8,000<span>proposed one-time study</span>
            </p>
            <p>
              One process, one pending agent deployment decision, one historical
              holdout.
            </p>
            <ul>
              <li>Consented event-log review and baseline</li>
              <li>One agent insertion and exception scenario</li>
              <li>Seeded discrete-event model with intervals</li>
              <li>Holdout, naive and incumbent comparison</li>
              <li>Decision readout with limitations and criteria</li>
            </ul>
            <Action>Draft a study request</Action>
            <small>Scope and commercial terms would need agreement.</small>
          </article>
          <article className="sub-price-card sub-price-pilot">
            <div className="sub-price-head">
              <span className="sub-eyebrow">After a useful study</span>
              <span className="sub-price-badge">Price hypothesis</span>
            </div>
            <h2>
              Monitored twin
              <br />
              pilot
            </h2>
            <p className="sub-price">
              $3,000<span>proposed per month</span>
            </p>
            <p>
              A proposed follow-on pilot to compare a frozen scenario with
              observed process behavior.
            </p>
            <ul>
              <li>Predicted-versus-actual calibration review</li>
              <li>Assumption and process drift monitoring</li>
              <li>Exception and control review</li>
              <li>Versioned scenario and decision history</li>
              <li>Continue, recalibrate or pause readout</li>
            </ul>
            <Action>Draft a pilot conversation</Action>
            <small>
              Connected monitoring is a future direction, not a live service.
            </small>
          </article>
        </div>
      </section>
      <section className="sub-section sub-pricing-fit">
        <div>
          <p className="sub-eyebrow">A useful first conversation</p>
          <h2>
            A sponsor.
            <br />A log owner.
            <br />
            <em>A decision date.</em>
          </h2>
        </div>
        <div>
          <p className="sub-body-large">
            The working buyer is a process excellence director at a mid or large
            B2B distributor. An operations VP funds the work; an ERP process
            owner supplies permitted data.
          </p>
          <p>
            The first study needs a specific automation decision and agreed
            success criteria. It should select one process and one module to
            test.
          </p>
          <a className="sub-text-link" href="/solutions">
            See who the study is for
            <Icon />
          </a>
        </div>
      </section>
      <section className="sub-section sub-two-column">
        <div>
          <p className="sub-eyebrow">Commercial questions</p>
          <h2>
            What is known.
            <br />
            What is still open.
          </h2>
        </div>
        <Accordion
          items={[
            [
              "Are these current prices?",
              "No. $8,000 for a one-process study and $3,000 per month for a monitored pilot are test hypotheses from the research brief. No price acceptance or actual offer is demonstrated.",
            ],
            [
              "Can I pay or subscribe here?",
              "No. There is no payment collection. The form creates a clearly labeled local draft so the journey can be evaluated safely.",
            ],
            [
              "What must happen before a real engagement?",
              "The parties need a paid sponsor, permitted log access, a named deployment decision, a comparison workflow, agreed scope and pre-registered holdout criteria.",
            ],
            [
              "Is implementation or ERP access included?",
              "There are no live integrations in this preview. Integration rights, data access and any implementation work would have to be reviewed and agreed separately.",
            ],
            [
              "Is an operational improvement guaranteed?",
              "No. A study can fail its test. The model must beat a naive baseline and the existing process-mining workflow for the pending decision; otherwise the appropriate result is to pause.",
            ],
          ]}
        />
      </section>
      <Closing title="Begin with a decision worth testing." />
    </>
  );
}

function Solutions() {
  return (
    <>
      <Hero
        eyebrow="For operations decisions"
        title={
          <>
            One process.
            <br />
            Three people.
            <br />
            <em>A shared decision.</em>
          </>
        }
        intro="The proposed first use case is an order-to-cash process at a mid or large B2B distributor with event logs and a pending agent deployment."
        image={`${ASSET}cloister-human-review.webp`}
        imageAlt="An abstract ivory human figure under a carved limestone arch."
      >
        <div className="sub-actions">
          <Action>Draft a planning study</Action>
          <Action href="/demo" secondary>
            Walk through O-248
          </Action>
        </div>
      </Hero>
      <section className="sub-section">
        <SectionTitle
          eyebrow="The buying group"
          title="Evidence has an owner. So does the decision."
        />
        <div className="sub-personas">
          {[
            [
              "01",
              "Process excellence director",
              "Champions the study",
              "Define the handoff, exception queue and control question. Compare the proposal with the existing process-mining workflow.",
              "A decision-specific backtest and a useful readout.",
            ],
            [
              "02",
              "Operations VP",
              "Funds the decision",
              "Sponsor a paid planning study, name the decision date and agree what evidence would justify continuing.",
              "A clear pass/fail outcome, with practical limits.",
            ],
            [
              "03",
              "ERP process owner",
              "Supplies permitted data",
              "Review event meaning, export rights, quality, process changes and consented artifact access.",
              "Traceable source records and explicit exclusions.",
            ],
          ].map(([n, title, role, detail, output]) => (
            <article key={n}>
              <span className="sub-persona-number">{n}</span>
              <p className="sub-eyebrow">{role}</p>
              <h3>{title}</h3>
              <p>{detail}</p>
              <div>
                <Icon type="source" size={18} />
                {output}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="sub-section sub-solution-case">
        <div>
          <p className="sub-eyebrow">A concrete order-to-cash question</p>
          <h2>
            Does faster triage
            <br />
            move the queue
            <br />
            <em>somewhere else?</em>
          </h2>
          <p>
            An agent-assisted handoff might change review workload, exception
            routing or throughput. The study asks where the work goes and
            whether the controls still behave as intended.
          </p>
          <a className="sub-text-link" href="/method">
            Follow the study method
            <Icon />
          </a>
        </div>
        <div className="sub-solution-route">
          <span className="sub-demo-label">DEMO · SYNTHETIC PROCESS</span>
          <div>Order received</div>
          <span aria-hidden="true">↓</span>
          <div>
            Agent-assisted triage <small>Assumed eligible tasks</small>
          </div>
          <span aria-hidden="true">↓</span>
          <div className="sub-solution-review">
            Human review <small>Exceptions & approval required</small>
          </div>
          <span aria-hidden="true">↓</span>
          <div>
            Release <small>Illustrative state only</small>
          </div>
        </div>
      </section>
      <section className="sub-section sub-two-column">
        <div>
          <p className="sub-eyebrow">A decision-specific first study</p>
          <h2>
            Bring the real
            <br />
            <em>constraint.</em>
          </h2>
        </div>
        <div className="sub-use-cases">
          {[
            [
              "A pending agent rollout",
              "Which activity and cases would change? When must the decision be made?",
            ],
            [
              "An exception queue",
              "Who reviews exceptions, and what review capacity is actually available?",
            ],
            [
              "A known historical change",
              "Can it be withheld to test whether the model predicts directional effects?",
            ],
            [
              "An existing mining stack",
              "What does Celonis, UiPath or the current consultant already answer?",
            ],
          ].map(([h, t]) => (
            <article key={h}>
              <h3>{h}</h3>
              <p>{t}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="sub-section">
        <Notice label="Who else may help evaluate the hypothesis">
          Process-mining consultants and ERP/CRM transformation system
          integrators may introduce a suitable study sponsor. No channel
          partnership or customer relationship is claimed.
        </Notice>
      </section>
      <Closing />
    </>
  );
}

function About() {
  return (
    <>
      <Hero
        eyebrow="About the concept"
        title={
          <>
            Better questions.
            <br />
            <em>More accountable models.</em>
          </>
        }
        intro="FlowBackTest is a research-stage concept for agent-specific process planning. The aim is to make scenarios answerable to evidence before rollout."
        image={`${ASSET}cloister-courtyard-banner.webp`}
      />
      <section className="sub-section sub-about-beliefs">
        <div>
          <p className="sub-eyebrow">Vision</p>
          <h2>Operations decisions with uncertainty in view.</h2>
          <p>
            Help operations leaders use calibrated process scenarios rather than
            polished, untested maps to decide where agents belong.
          </p>
        </div>
        <div>
          <p className="sub-eyebrow">Mission</p>
          <h2>Backtest the handoff before the rollout.</h2>
          <p>
            Test agent handoff and exception assumptions on consented event
            logs, beginning with a specific deployment decision.
          </p>
        </div>
      </section>
      <section className="sub-section">
        <SectionTitle
          eyebrow="A possible path, not a forecast"
          title="Expansion should follow trust."
        />
        <div className="sub-expansion">
          {[
            [
              "01",
              "One-process planning study",
              "Prove that a decision-specific historical backtest is useful beyond the existing workflow.",
            ],
            [
              "02",
              "Connected process families",
              "Reuse calibrated models only where log quality, behavior and ownership support them.",
            ],
            [
              "03",
              "Monitoring & intervention planning",
              "Compare predicted with actual process behavior and revisit the assumptions as the process changes.",
            ],
          ].map(([n, h, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="sub-section sub-about-evidence">
        <div>
          <p className="sub-eyebrow">Where the research stands</p>
          <h2>
            Keep the unknowns
            <br />
            <em>visible.</em>
          </h2>
          <p>
            There are no demonstrated real customers, validated forecasts, live
            integrations, revenue or published price acceptance.
          </p>
        </div>
        <dl>
          <div>
            <dt>Adjacent simulation & mining</dt>
            <dd>Strong evidence</dd>
          </div>
          <div>
            <dt>Agent-specific wedge</dt>
            <dd>Plausible hypothesis</dd>
          </div>
          <div>
            <dt>Counterfactual accuracy</dt>
            <dd>Unvalidated</dd>
          </div>
          <div>
            <dt>Purchase intent & price acceptance</dt>
            <dd>Unvalidated</dd>
          </div>
          <div>
            <dt>TAM, sales cycle & commitment</dt>
            <dd>Unknown</dd>
          </div>
        </dl>
      </section>
      <section className="sub-section">
        <Notice label="Identity status">
          FlowBackTest is the selected brand for this preview. Trademark and
          domain clearance have not been established. This site does not
          represent an operating SaaS company.
        </Notice>
      </section>
      <Closing />
    </>
  );
}

function Contact() {
  return (
    <>
      <Hero
        compact
        eyebrow="Start a conversation · demo only"
        title={
          <>
            A useful conversation
            <br />
            starts with <em>your process.</em>
          </>
        }
        intro="Explore the study request flow and the information a future sponsor would need to bring. No request is sent from this website."
      />
      <section className="sub-section sub-contact-layout">
        <div className="sub-contact-card">
          <Icon type="branch" size={40} />
          <p className="sub-eyebrow">A pending deployment</p>
          <h2>Draft a study request.</h2>
          <p>
            Describe the process, event-log owner, existing mining stack and
            planned decision date. Use fictional information for this preview.
          </p>
          <Action>Create a local demo draft</Action>
          <small>No email, CRM or third-party service is connected.</small>
        </div>
        <div>
          <p className="sub-eyebrow">What a future study would involve</p>
          <h2>
            The right people,
            <br />
            <em>in the room.</em>
          </h2>
          <ol className="sub-contact-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Process owner</h3>
                <p>
                  Explain the actual handoff, exception and control question.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Budget owner</h3>
                <p>Name the decision date and paid study sponsorship.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>ERP data owner</h3>
                <p>
                  Review consent, event access, quality and integration rights.
                </p>
              </div>
            </li>
          </ol>
          <a href="/privacy" className="sub-text-link">
            How this preview handles data
            <Icon />
          </a>
        </div>
      </section>
      <section className="sub-section">
        <Accordion
          items={[
            [
              "Where can I send logs?",
              "There is no upload or data receiving service on this demo. A real study would establish a private, permitted artifact channel with the process owner. Do not include logs, credentials or sensitive records in the demo form.",
            ],
            [
              "Will someone reply to my demo request?",
              "No. The request flow is entirely local and cannot notify a person. A future contact destination must be configured before real submissions are enabled.",
            ],
          ]}
        />
      </section>
    </>
  );
}

function Privacy() {
  const [cleared, setCleared] = useState(false);
  return (
    <>
      <Hero
        compact
        eyebrow="Demo privacy notice"
        title={
          <>
            Your browser.
            <br />
            <em>Your local draft.</em>
          </>
        }
        intro="This notice describes the current concept preview. Real lead collection and customer data processing are not enabled."
      />
      <section className="sub-section sub-policy-layout">
        <nav aria-label="Privacy notice sections">
          <a href="#privacy-scope">Preview scope</a>
          <a href="#privacy-form">Form information</a>
          <a href="#privacy-retention">Retention & deletion</a>
          <a href="#privacy-events">Demo events</a>
          <a href="#privacy-future">Before a real launch</a>
        </nav>
        <div className="sub-policy-content">
          <article id="privacy-scope">
            <p className="sub-eyebrow">01 / Scope</p>
            <h2>A synthetic, local preview.</h2>
            <p>
              The product workspace uses fictional organizations, names, orders
              and events. It does not connect to an ERP, CRM, payment service or
              identity provider. The study form and sign-in presentation are
              mock interactions.
            </p>
            <p>
              Normal browser requests load website files and imagery. No real
              study request is submitted by the preview form.
            </p>
          </article>
          <article id="privacy-form">
            <p className="sub-eyebrow">02 / Form information</p>
            <h2>Use fictional information.</h2>
            <p>
              The form illustrates minimum qualification fields: work email,
              role, company, process, event-log owner, decision date and
              existing mining stack. Optional interview preference and explicit
              consent are shown for the proposed future flow.
            </p>
            <p>
              Do not enter credentials, sensitive personal information,
              contracts, raw logs or confidential business records. There is no
              file upload.
            </p>
          </article>
          <article id="privacy-retention">
            <p className="sub-eyebrow">03 / Local retention</p>
            <h2>Reset the preview when finished.</h2>
            <p>
              The study draft and optional journey events stay in this tab's
              memory and clear on refresh. They are not sent or written to
              persistent local storage. The reset control below deletes the
              local draft, clears optional journey events and revokes demo
              analytics consent.
            </p>
            <p>
              The mock sign-in email is held only in the component's current
              view and is not an authentication credential.
            </p>
            <button
              className="sub-action sub-reset-action"
              onClick={() => {
                clearPreviewData();
                setCleared(true);
              }}
            >
              <Icon type="reset" size={18} />
              Clear local draft & demo events
            </button>
            {cleared && (
              <p role="status" className="sub-success">
                Local draft and demo events cleared. Optional analytics consent
                revoked.
              </p>
            )}
          </article>
          <article id="privacy-events">
            <p className="sub-eyebrow">04 / Instrumentation preview</p>
            <h2>Consent-aware, local events.</h2>
            <p>
              Only with optional consent, the preview records local journey
              events such as page views, demo opens, pricing views and form
              interactions. These are demo events and remain separate from real
              leads. A real verified signup, meeting or paid commitment is never
              inferred from a demo click.
            </p>
            <p>
              No third-party tracking provider is connected in this preview.
              Revoking optional analytics consent stops optional event
              collection and clears the in-memory event list.
            </p>
          </article>
          <article id="privacy-future">
            <p className="sub-eyebrow">05 / A future live service</p>
            <h2>A live notice needs a real operator.</h2>
            <p>
              Before collecting real requests, the website needs a verified
              contact destination, responsible operator, defined retention
              period, deletion route, consent handling and any region-specific
              requirements. No invented company address or email is published
              here.
            </p>
            <p>
              This is a product preview notice, not a completed policy for an
              operating service or legal advice.
            </p>
            <a href="/contact" className="sub-text-link">
              Preview the contact journey
              <Icon />
            </a>
          </article>
        </div>
      </section>
    </>
  );
}

function Terms() {
  return (
    <>
      <Hero
        compact
        eyebrow="Preview terms & boundaries"
        title={
          <>
            Explore the model.
            <br />
            <em>Respect the boundary.</em>
          </>
        }
        intro="FlowBackTest is a research-stage website and isolated synthetic product demo. It is not an operating service."
      />
      <section className="sub-section sub-policy-layout">
        <nav aria-label="Preview terms sections">
          <a href="#terms-demo">Concept preview</a>
          <a href="#terms-outcomes">Illustrative outcomes</a>
          <a href="#terms-commercial">Commercial status</a>
          <a href="#terms-data">Data & actions</a>
          <a href="#terms-assets">Brand & references</a>
        </nav>
        <div className="sub-policy-content">
          <article id="terms-demo">
            <p className="sub-eyebrow">01 / Availability</p>
            <h2>A demonstration, with safe local states.</h2>
            <p>
              All product records are fictional. The interface may show
              simulated review, scenario or form states so the journey can be
              tested. These states do not represent actual order processing,
              external approvals or customer activity.
            </p>
          </article>
          <article id="terms-outcomes">
            <p className="sub-eyebrow">02 / Model outcomes</p>
            <h2>Assumptions remain assumptions.</h2>
            <p>
              Charts, intervals, case counts and scenario comparisons are
              illustrative synthetic examples. They are not operational
              predictions, measured savings or evidence of validated customer
              accuracy.
            </p>
            <p>
              A real planning study would require consented logs, a paid
              sponsor, a named pending decision, pre-registered holdout and
              control criteria, and comparison with a naive baseline and
              existing process-mining workflow.
            </p>
          </article>
          <article id="terms-commercial">
            <p className="sub-eyebrow">03 / Commercial hypotheses</p>
            <h2>No purchase or subscription is created.</h2>
            <p>
              The proposed $8,000 study and $3,000/month monitored pilot are
              unvalidated test prices. There is no payment collection, active
              checkout, contract acceptance or subscription creation.
            </p>
          </article>
          <article id="terms-data">
            <p className="sub-eyebrow">04 / Data & actions</p>
            <h2>Keep real records outside this preview.</h2>
            <p>
              Do not enter sensitive information, raw logs, secrets or
              contracts. The demo does not send messages, perform third-party
              writes, collect payment or access production ERP systems. A mock
              sign-in does not create an account.
            </p>
            <a href="/privacy" className="sub-text-link">
              Read the demo privacy notice
              <Icon />
            </a>
          </article>
          <article id="terms-assets">
            <p className="sub-eyebrow">05 / Brand & references</p>
            <h2>A visual concept, not a customer claim.</h2>
            <p>
              Original scenery and UI illustrations are brand assets. They are
              not screenshots of a deployed customer product. Celonis and UiPath
              are named as factual comparators, without endorsement.
            </p>
            <p>
              Brand and domain clearance remain separate future work. A real
              service would need reviewed terms and a verified responsible
              entity before launch.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid fictional email address to preview this step.");
      return;
    }
    setError("");
    setReady(true);
  }
  return (
    <section className="sub-sign-in">
      <div className="sub-sign-art">
        <img
          src={`${ASSET}cloister-hero.webp`}
          alt="Sunlit limestone arches with two colored routes into a garden."
        />
        <div>
          <p className="sub-eyebrow">A quieter way to question a process.</p>
          <h1>
            Follow the evidence.
            <br />
            <em>Test the handoff.</em>
          </h1>
          <span>CONCEPT PREVIEW · SYNTHETIC DATA</span>
        </div>
      </div>
      <div className="sub-sign-form">
        <a href="/" className="sub-text-link sub-back-link">
          ← Back to FlowBackTest
        </a>
        <p className="sub-eyebrow">Isolated demonstration workspace</p>
        <h2>
          {ready ? "Your demo is ready." : "A considered place to begin."}
        </h2>
        {ready ? (
          <div className="sub-sign-ready">
            <span className="sub-ready-check">
              <Icon type="check" size={28} />
            </span>
            <p>
              No account was created. Your email was not sent to an identity
              service or stored as a credential.
            </p>
            <Action href="/demo">Enter synthetic workspace</Action>
            <button
              onClick={() => {
                setReady(false);
                setEmail("");
              }}
              className="sub-text-button"
            >
              Reset sign-in preview
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={submit}>
            <p>
              Use a fictional email to preview the sign-in state. No password or
              authentication service is connected.
            </p>
            <label htmlFor="demo-email">Demo work email</label>
            <input
              id="demo-email"
              type="email"
              autoComplete="off"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "demo-email-error" : "demo-email-help"}
              required
            />
            {error ? (
              <p id="demo-email-error" role="alert" className="sub-field-error">
                {error}
              </p>
            ) : (
              <small id="demo-email-help">
                This email stays in this view. Nothing is sent.
              </small>
            )}
            <button type="submit" className="sub-action">
              Preview workspace access
              <Icon />
            </button>
            <p className="sub-sign-privacy">
              Read the <a href="/privacy">demo privacy notice</a> and{" "}
              <a href="/terms">preview terms</a>.
            </p>
          </form>
        )}
        <div className="sub-sign-support">
          <span>Prefer a walkthrough?</span>
          <a href="/demo">
            Open demo directly
            <Icon size={18} />
          </a>
          <a href="/contact">
            Access & study help
            <Icon size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

const downloads = {
  worksheet: {
    file: "FlowBackTest-Backtest-Worksheet.txt",
    type: "text/plain",
    text: `FLOWBACKTEST — PLANNING STUDY WORKSHEET\nResearch-stage template. No real data has been collected.\n\n1. DECISION\nProcess:\nPending agent deployment decision:\nDecision date:\nBudget owner:\nProcess owner:\nERP event-log owner:\nExisting process-mining stack and vendor contract:\nLast actual incident or workaround:\n\n2. DATA AND RIGHTS\nArtifact owner and consent:\nPermitted export and analysis scope:\nCase ID, activity, timestamp and source event ID meanings:\nCoverage, missing events, duplicate events and time-zone checks:\nKnown historical change to hold out:\n\n3. PRE-REGISTER THE TEST BEFORE EXAMINING HOLDOUT\nDirectional effect to predict:\nNaive baseline:\nExisting process-mining workflow comparison:\nDirectional accuracy pass/fail criterion (agree, do not invent):\nControl criterion and owner:\nModel/agent version and random seed:\nExclusions and process drift review:\n\n4. SPONSOR AND CONVERSION\nPaid planning study sponsor:\nAgreed scope and terms:\nExplicit conversion path after useful evidence:\nContinue only if the model beats the naive baseline and existing workflow for the named pending decision. Pause if logs are incomplete or calibration unstable.\n\nDo not submit logs, secrets, contracts or sensitive records through a public form.\n`,
  },
  readout: {
    file: "FlowBackTest-Experiment-Readout.csv",
    type: "text/csv",
    text: "field,value,evidence_reference\nexperiment_id,,\npending_decision,,\nprocess_owner,,\nbudget_owner,,\ndata_consent_and_rights,,\nmodel_version,,\nrandom_seed,,\nholdout_period,,\npreregistered_directional_criterion,,\npreregistered_control_criterion,,\nnaive_baseline_result,,\nincumbent_workflow_result,,\nmodel_holdout_result,,\nexclusions_and_data_quality,,\nprocess_drift_review,,\nagent_behavior_change_review,,\npaid_sponsor_commitment,,\nconversion_path,,\npass_fail_or_pause,,\nreason_and_next_action,,\nlast_updated,,\n",
  },
  events: {
    file: "FlowBackTest-Demo-Event-Schema.json",
    type: "application/json",
    text: JSON.stringify(
      {
        purpose:
          "Proposed consent-aware event schema; demo events must remain separate from real leads.",
        events: [
          "landing_view",
          "demo_open",
          "demo_complete",
          "pricing_view",
          "form_start",
          "form_submit",
          "verified_signup",
          "interview_booked",
        ],
        fields: {
          event_id: "unique deduplication key",
          timestamp: "ISO 8601",
          session_id: "minimum pseudonymous identifier",
          mode: "demo or live; this website is demo",
          consent: "optional analytics consent state",
          path: "route only; no form values",
          utm_source: "allowlisted campaign source",
          utm_campaign: "campaign identifier",
          utm_content: "ad identifier",
        },
        constraints: [
          "Never treat a demo form submit as a verified signup or meeting.",
          "No raw form values, logs, secrets or contracts in analytics.",
          "Server-side deduplication is required before any real launch.",
          "Honor consent revocation and separate synthetic fixtures from real leads.",
        ],
        real_launch_requirements: [
          "Verified contact destination and operator",
          "Double opt-in where required",
          "Retention and deletion route",
          "Consent QA and deduplication",
          "Platform and privacy review before capped ad tests",
        ],
      },
      null,
      2,
    ),
  },
};

function download(type) {
  const item = downloads[type];
  const url = URL.createObjectURL(new Blob([item.text], { type: item.type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = item.file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Resources() {
  const [message, setMessage] = useState("");
  function getFile(type) {
    download(type);
    setMessage(
      `${downloads[type].file} download started. Template only; no data was sent.`,
    );
  }
  return (
    <>
      <Hero
        compact
        eyebrow="Resources for a better test"
        title={
          <>
            Take a question.
            <br />
            <em>Leave with a protocol.</em>
          </>
        }
        intro="Original, downloadable planning templates for a decision-specific backtest. All files are generated in your browser without a third-party request."
      />
      <section className="sub-section sub-resource-section">
        <div className="sub-resource-grid">
          {[
            [
              "worksheet",
              "01",
              "The backtest worksheet",
              "A plain-text protocol for the decision, evidence owner, consent, holdout, baseline comparison and paid sponsor.",
              "TXT / editable planning template",
              "garden-postage-illustration.webp",
            ],
            [
              "readout",
              "02",
              "The experiment readout",
              "A blank scorecard to record agreed criteria, actual evidence, exclusions, comparison results and a continue-or-pause decision.",
              "CSV / blank evidence fields",
              "evidence-postage-illustration.webp",
            ],
            [
              "events",
              "03",
              "The journey event schema",
              "An instrumentation handoff covering consent, deduplication, UTMs and separation of synthetic demo events from real leads.",
              "JSON / proposed schema",
              "threshold-postage-illustration.webp",
            ],
          ].map(([key, n, title, text, format, image]) => (
            <article key={key}>
              <div className="sub-resource-art">
                <img
                  src={`/media/heritage/${image}`}
                  alt="Original botanical postage-style brand illustration."
                  loading="lazy"
                />
              </div>
              <div className="sub-resource-copy">
                <span className="sub-eyebrow">Resource {n}</span>
                <h2>{title}</h2>
                <p>{text}</p>
                <span className="sub-resource-format">{format}</span>
                <button className="sub-action" onClick={() => getFile(key)}>
                  Download template
                  <Icon type="download" size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {message && (
          <p className="sub-download-message" role="status">
            {message}
          </p>
        )}
      </section>
      <section className="sub-section sub-two-column">
        <div>
          <p className="sub-eyebrow">Fieldwork that remains</p>
          <h2>
            Interview the buyer.
            <br />
            <em>Inspect the artifact.</em>
          </h2>
        </div>
        <div>
          <p className="sub-body-large">
            Interview the budget owner and technical operator separately. Ask
            about the last actual incident, failed purchase, workaround, vendor
            contract and decision date.
          </p>
          <p>
            Collect consented, redacted artifacts and run a competitor-backed
            pilot with pre-registered pass/fail criteria, a procurement sponsor
            and an explicit conversion path.
          </p>
          <Notice label="Evidence discipline">
            Unknown and zero are different. A meeting, a demo click or a filled
            template does not establish a qualified interview, paid pilot or
            validated milestone.
          </Notice>
        </div>
      </section>
      <Closing />
    </>
  );
}

function NotFound() {
  return (
    <>
      <Hero
        compact
        eyebrow="404 / A path not mapped"
        title={
          <>
            Let's find
            <br />
            <em>a clearer route.</em>
          </>
        }
        intro="This page isn't part of the FlowBackTest preview. The complete synthetic journey is still here."
      >
        <div className="sub-actions">
          <Action href="/">Return to the garden</Action>
          <Action href="/product" secondary>
            Explore the workspace
          </Action>
        </div>
      </Hero>
      <section className="sub-section">
        <ModuleCards compact />
      </section>
    </>
  );
}

export default function Pages({ path = "/product" }) {
  const cleanPath = path.replace(/\/$/, "") || "/";
  const module = modules.find((m) => cleanPath === `/product/${m.slug}`);
  const routes = {
    "/product": Product,
    "/method": Method,
    "/data": Data,
    "/pricing": Pricing,
    "/solutions": Solutions,
    "/about": About,
    "/contact": Contact,
    "/privacy": Privacy,
    "/terms": Terms,
    "/sign-in": SignIn,
    "/resources": Resources,
  };
  const Page = routes[cleanPath] || NotFound;
  return (
    <div
      className={`sub-page ${cleanPath === "/sign-in" ? "sub-page-auth" : ""}`}
      data-theme="cloister"
    >
      {module ? <Module module={module} /> : <Page />}
    </div>
  );
}
