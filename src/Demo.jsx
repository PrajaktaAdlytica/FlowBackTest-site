import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  createDemoRecords,
  DATASET_META,
  EVENT_DICTIONARY,
  getDatasetSummary,
} from "./fixtures.js";
import {
  applyMockReview,
  buildSyntheticReport,
  DEFAULT_PARAMETERS,
  deriveBaseline,
  MODEL_ASSUMPTIONS,
  simulateComparison,
  syntheticHoldout,
} from "./simulation.js";
import "./demo.css";

const TABS = [
  { id: "map", label: "Process map", number: "01" },
  { id: "scenarios", label: "Scenarios", number: "02" },
  { id: "backtest", label: "Backtest", number: "03" },
  { id: "records", label: "Source records", number: "04" },
];
const STAGES = [
  {
    name: "Source",
    label: "Order received",
    body: "The fictional event log supplies timestamps, case IDs and source references. A map is evidence of a recorded path; it is not a forecast.",
  },
  {
    name: "Triage",
    label: "Compare two routes",
    body: "Human-only and agent-assisted routes share the same arriving orders. Agent handling and exceptions are explicit assumptions you can change.",
  },
  {
    name: "Human review",
    label: "Keep the approval gate",
    body: "Every release still requires a human approval. Exceptions have their own queue; faster triage can move the bottleneck downstream.",
  },
  {
    name: "Release",
    label: "Inspect the uncertainty",
    body: "Seeded runs produce a range of illustrative outcomes. A real decision needs consented data, a historical holdout and a paid process-owner sponsor.",
  },
];
const fmt = (value, digits = 1) => Number(value).toFixed(digits);
const formatDate = (timestamp) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(timestamp));
const getView = () =>
  TABS.find(
    (tab) =>
      window.location.pathname.split("/").filter(Boolean).at(-1) === tab.id,
  )?.id || "map";

function Icon({ name, size = 18, ...props }) {
  const icons = {
    arrow: "arrow-right",
    back: "arrow-right",
    reset: "rotate-ccw",
    export: "download",
    check: "check",
    source: "file-clock",
    control: "shield-check",
    clock: "file-clock",
    chevron: "chevron-down",
    close: "x",
  };
  return (
    <img
      className={`demo-icon${name === "back" ? " icon-back" : name === "chevron" ? " icon-chevron" : ""}`}
      src={`/media/icons/${icons[name] || "file-clock"}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      {...props}
    />
  );
}

function Stamp({ children, muted = false }) {
  return (
    <span className={`demo-stamp${muted ? " demo-stamp-muted" : ""}`}>
      {children}
    </span>
  );
}

function IntervalChart({ comparison, compact = false }) {
  const max =
    Math.max(
      comparison.human.cycleDays.high,
      comparison.agent.cycleDays.high,
      4,
    ) * 1.15;
  const x = (value) => 150 + (value / max) * 530;
  const ticks = Array.from({ length: 5 }, (_, index) => (index * max) / 4);
  return (
    <figure className={`demo-interval${compact ? " compact" : ""}`}>
      <figcaption>
        <span>
          Mean cycle time <small>model days</small>
        </span>
        <Stamp muted>80% scenario range</Stamp>
      </figcaption>
      <svg
        viewBox="0 0 740 228"
        role="img"
        aria-label={`Synthetic mean cycle time. Human-only ${fmt(comparison.human.cycleDays.mean)} model days with range ${fmt(comparison.human.cycleDays.low)} to ${fmt(comparison.human.cycleDays.high)}. Agent-assisted ${fmt(comparison.agent.cycleDays.mean)} with range ${fmt(comparison.agent.cycleDays.low)} to ${fmt(comparison.agent.cycleDays.high)}. Unvalidated assumptions.`}
      >
        <title>
          Illustrative mean cycle time and synthetic scenario uncertainty
        </title>
        {ticks.map((tick) => (
          <g key={tick}>
            <path d={`M${x(tick)} 35V172`} className="demo-chart-grid" />
            <text
              x={x(tick)}
              y="202"
              textAnchor="middle"
              className="demo-axis-label"
            >
              {fmt(tick)}
            </text>
          </g>
        ))}
        {[
          [comparison.human, "Human-only", 79, "human"],
          [comparison.agent, "Agent-assisted", 137, "agent"],
        ].map(([result, label, y, cls]) => (
          <g key={label} className={`demo-chart-${cls}`}>
            <text x="9" y={y + 5} className="demo-chart-label">
              {label}
            </text>
            <path
              d={`M${x(result.cycleDays.low)} ${y}H${x(result.cycleDays.high)}`}
            />
            <path
              d={`M${x(result.cycleDays.low)} ${y - 6}V${y + 6}M${x(result.cycleDays.high)} ${y - 6}V${y + 6}`}
            />
            <circle cx={x(result.cycleDays.mean)} cy={y} r="6" />
            <text
              x={x(result.cycleDays.high) + 13}
              y={y + 5}
              className="demo-result-label"
            >
              {fmt(result.cycleDays.mean)}d
            </text>
          </g>
        ))}
      </svg>
      <div className="demo-mobile-interval-values">
        {[
          [comparison.human, "Human-only", "human"],
          [comparison.agent, "Agent-assisted", "agent"],
        ].map(([result, label, kind]) => (
          <div key={label}>
            <span>
              <i className={`${kind}-dot`} />
              {label}
            </span>
            <strong>
              {fmt(result.cycleDays.mean)}
              <small> days</small>
            </strong>
            <p>
              {fmt(result.cycleDays.low)}–{fmt(result.cycleDays.high)} range
            </p>
          </div>
        ))}
      </div>
      <p className="demo-chart-note">
        The range reflects variation across seeded synthetic runs. It is not a
        prediction on customer data.
      </p>
      <span className="demo-watermark">
        DEMO — SYNTHETIC DATA · UNVALIDATED SCENARIO
      </span>
    </figure>
  );
}

function QueueChart({ comparison }) {
  const values = [
    [
      "Triage",
      comparison.human.triageQueueHours.mean,
      comparison.agent.triageQueueHours.mean,
    ],
    [
      "Exceptions",
      comparison.human.exceptionQueueHours.mean,
      comparison.agent.exceptionQueueHours.mean,
    ],
    [
      "Human review",
      comparison.human.reviewQueueHours.mean,
      comparison.agent.reviewQueueHours.mean,
    ],
  ];
  const max = Math.max(
    ...values.flatMap(([, human, agent]) => [human, agent]),
    1,
  );
  return (
    <div
      className="demo-queue-chart"
      role="group"
      aria-label="Mean queue wait in model hours"
    >
      <div className="demo-queue-title">
        <h3>Where the queue moves</h3>
        <span>Mean wait · model hours</span>
      </div>
      <div className="demo-legend">
        <span>
          <i className="human-dot" />
          Human-only
        </span>
        <span>
          <i className="agent-dot" />
          Agent-assisted
        </span>
      </div>
      {values.map(([label, human, agent]) => (
        <div className="demo-queue-row" key={label}>
          <span>{label}</span>
          <div className="demo-queue-bars">
            <div>
              <b
                className="human-bar"
                style={{ width: `${Math.max(1, (human / max) * 82)}%` }}
              />
              <small>{fmt(human)}h</small>
            </div>
            <div>
              <b
                className="agent-bar"
                style={{ width: `${Math.max(1, (agent / max) * 82)}%` }}
              />
              <small>{fmt(agent)}h</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProcessMap({ stage }) {
  const cards = [
    {
      x: 28,
      y: 133,
      title: "Order received",
      sub: "Source + case ID",
      stage: 0,
    },
    {
      x: 244,
      y: 43,
      title: "Manual triage",
      sub: "2 fictional workers",
      stage: 1,
    },
    {
      x: 244,
      y: 222,
      title: "Agent triage",
      sub: "Assumption · not live",
      stage: 1,
    },
    {
      x: 493,
      y: 43,
      title: "Human approval",
      sub: "Required in both routes",
      stage: 2,
    },
    {
      x: 493,
      y: 222,
      title: "Exception review",
      sub: "Then human approval",
      stage: 2,
    },
    { x: 757, y: 133, title: "Release", sub: "No external action", stage: 3 },
  ];
  return (
    <figure className="demo-process-figure">
      <div className="demo-map-heading">
        <span>One source. Two scenarios.</span>
        <div className="demo-legend">
          <span>
            <i className="human-dot" />
            Human-only
          </span>
          <span>
            <i className="agent-dot" />
            Agent-assisted
          </span>
        </div>
      </div>
      <div className="demo-map-scroll">
        <svg
          viewBox="0 0 984 350"
          role="img"
          aria-label="Synthetic process map. Order intake branches into manual triage or simulated agent triage and exception review. Both routes require human approval before release. No external actions occur."
        >
          <title>
            Two synthetic order-to-cash routes with mandatory human approval
          </title>
          <defs>
            <marker
              id="demo-arrow"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0 0L6 3L0 6" fill="none" stroke="currentColor" />
            </marker>
          </defs>
          <g className="demo-map-lines human-line">
            <path d="M200 169H218V79H244" />
            <path d="M424 79H493" />
            <path d="M673 79H724V169H757" />
          </g>
          <g className="demo-map-lines agent-line">
            <path d="M200 169H218V258H244" />
            <path d="M424 258H493" />
            <path d="M673 258H724V169H757" />
          </g>
          <text x="245" y="24" className="demo-map-route-label">
            HUMAN-ONLY
          </text>
          <text x="245" y="328" className="demo-map-route-label agent-text">
            AGENT-ASSISTED · CONDITIONAL ON ASSUMPTIONS
          </text>
          {cards.map((card) => (
            <g
              key={card.title}
              className={`demo-map-card${stage === card.stage ? " stage-active" : ""}`}
            >
              <rect
                x={card.x}
                y={card.y}
                width={card.x === 28 ? 172 : 180}
                height="72"
                rx="5"
              />
              <text
                x={card.x + 18}
                y={card.y + 29}
                className="demo-map-card-title"
              >
                {card.title}
              </text>
              <text
                x={card.x + 18}
                y={card.y + 50}
                className="demo-map-card-sub"
              >
                {card.sub}
              </text>
            </g>
          ))}
          <circle cx="218" cy="169" r="4" className="demo-junction" />
        </svg>
      </div>
      <figcaption className="demo-watermark">
        DEMO — SYNTHETIC DATA · CONCEPT PREVIEW · EVERY RELEASE REQUIRES HUMAN
        APPROVAL
      </figcaption>
    </figure>
  );
}

function Assumptions({ parameters, expanded = false }) {
  return (
    <details className="demo-assumptions" open={expanded || undefined}>
      <summary>
        <Icon name="source" />
        Assumptions &amp; source provenance<span>Inspect the model</span>
      </summary>
      <div className="demo-assumptions-body">
        <dl className="demo-input-list">
          <div>
            <dt>Source fixture</dt>
            <dd>{DATASET_META.source}</dd>
          </div>
          <div>
            <dt>Seed / runs</dt>
            <dd>
              {parameters.seed} / {parameters.runs}
            </dd>
          </div>
          <div>
            <dt>Arrivals / model window</dt>
            <dd>
              {parameters.cases} cases / {parameters.horizonHours} hours
            </dd>
          </div>
          <div>
            <dt>Mean arrival gap</dt>
            <dd>{parameters.arrivalGapHours} model hours</dd>
          </div>
          <div>
            <dt>Agent handling</dt>
            <dd>{parameters.agentHandlingMinutes} minutes</dd>
          </div>
          <div>
            <dt>Agent exceptions</dt>
            <dd>{Math.round(parameters.exceptionRate * 100)}%</dd>
          </div>
          <div>
            <dt>Supplemental review</dt>
            <dd>{Math.round(parameters.supplementalReviewRate * 100)}%</dd>
          </div>
          <div>
            <dt>Mandatory approval</dt>
            <dd>Every release · both scenarios</dd>
          </div>
        </dl>
        <ol>
          {MODEL_ASSUMPTIONS.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ol>
      </div>
    </details>
  );
}

function RecordDetail({
  record,
  verified,
  setVerified,
  onAction,
  feedback,
  compact = false,
}) {
  if (!record) return null;
  const reviewable = record.status === "pending" || record.status === "blocked";
  return (
    <section
      className={`demo-record-detail${compact ? " compact" : ""}`}
      aria-labelledby={`detail-${record.id}`}
    >
      <div className="demo-record-top">
        <div>
          <p className="demo-eyebrow">Fictional order / {record.company}</p>
          <h2 id={`detail-${record.id}`}>{record.id}</h2>
        </div>
        <span className={`demo-status status-${record.status}`}>
          <i />
          {record.mockReview === "approve" ? "Mock approved" : record.status}
        </span>
      </div>
      <dl className="demo-record-facts">
        <div>
          <dt>Customer</dt>
          <dd>{record.customer}</dd>
        </div>
        <div>
          <dt>Current step</dt>
          <dd>{record.currentStep}</dd>
        </div>
        <div>
          <dt>Assigned owner</dt>
          <dd>
            {record.owner} <small>fictional</small>
          </dd>
        </div>
        <div>
          <dt>Order lines</dt>
          <dd>{record.lines}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDate(record.updated)} UTC</dd>
        </div>
        <div>
          <dt>Next review</dt>
          <dd>
            {record.status === "completed"
              ? "Complete in fixture"
              : `${formatDate(record.due)} UTC · sample due date`}
          </dd>
        </div>
      </dl>
      <div
        className={`demo-evidence-callout${record.status === "blocked" || record.status === "rejected" ? " exception" : ""}`}
      >
        <Icon name="control" />
        <div>
          <h3>
            {record.status === "blocked"
              ? "A source gap stops the proposal."
              : record.status === "rejected"
                ? "The control gate rejected this route."
                : "Human approval stays in the loop."}
          </h3>
          <p>{record.issue}</p>
        </div>
      </div>
      <div className="demo-source-pane">
        <div className="demo-pane-label">
          <span>Linked source evidence</span>
          <Stamp muted>Fixture reference</Stamp>
        </div>
        <p>
          <Icon name="source" />
          <strong>{record.sourceRef}</strong>
          <span>Order event history · {record.events.length} events</span>
        </p>
        <p>
          <Icon name="control" />
          <strong>POL-SYN-04</strong>
          <span>Human release approval required</span>
        </p>
      </div>
      <div className="demo-next-action">
        <span className="demo-eyebrow">Dated next action</span>
        <p>{record.nextAction}</p>
      </div>
      {!compact && (
        <details className="demo-event-timeline" open>
          <summary>
            Timestamped source events{" "}
            <span>{record.events.length} fictional events</span>
          </summary>
          <ol>
            {record.events.map((event) => (
              <li key={event.event_id}>
                <i />
                <div>
                  <strong>{event.activity}</strong>
                  <span>
                    {formatDate(event.timestamp)} UTC · {event.owner}
                  </span>
                  <code>{event.event_id}</code>
                </div>
              </li>
            ))}
          </ol>
        </details>
      )}
      {reviewable && (
        <div className="demo-review-actions">
          <div className="demo-pane-label">
            <span>Reviewer action</span>
            <Stamp>Local mock only</Stamp>
          </div>
          {!record.mockReview ? (
            <>
              <label className="demo-checkbox">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(event) => setVerified(event.target.checked)}
                />
                <span>I have reviewed this synthetic source evidence.</span>
              </label>
              <div className="demo-action-buttons">
                <button
                  type="button"
                  className="demo-button primary"
                  onClick={() => onAction("approve")}
                  disabled={!verified || record.status === "blocked"}
                >
                  <Icon name="check" />
                  Mock approve
                </button>
                <button
                  type="button"
                  className="demo-button"
                  onClick={() =>
                    onAction(
                      record.status === "blocked" ? "evidence" : "reject",
                    )
                  }
                  disabled={!verified}
                >
                  {record.status === "blocked"
                    ? "Prepare mock evidence request"
                    : "Mock reject"}
                </button>
              </div>
              {record.status === "blocked" && (
                <p className="demo-small-note">
                  Approval is disabled while source evidence is missing.
                </p>
              )}
            </>
          ) : (
            <p className="demo-mock-result">
              <Icon name="check" />
              {record.mockReview === "approve"
                ? "Human approval recorded in this browser session."
                : record.mockReview === "evidence"
                  ? "A mock evidence request was prepared. Nothing was sent."
                  : "Proposal rejected in this browser session."}
            </p>
          )}
          <p className="demo-small-note">
            No message, invoice, ERP write or payment is created. Reset restores
            the fixture.
          </p>
        </div>
      )}
      {feedback && (
        <p className="demo-feedback" role="status">
          {feedback}
        </p>
      )}
      <p className="demo-watermark">
        DEMO — SYNTHETIC DATA · READ-ONLY SOURCE FIXTURE · CONCEPT PREVIEW
      </p>
    </section>
  );
}

export default function Demo() {
  const [view, setView] = useState(getView);
  const [parameters, setParameters] = useState({ ...DEFAULT_PARAMETERS });
  const [records, setRecords] = useState(createDemoRecords);
  const [selectedId, setSelectedId] = useState("O-248");
  const [filter, setFilter] = useState("all");
  const [verified, setVerified] = useState(false);
  const [stage, setStage] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [notice, setNotice] = useState("");
  const session = useRef(
    `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const visitedStages = useRef(new Set([0]));
  const comparison = useMemo(
    () => simulateComparison(parameters),
    [parameters],
  );
  const holdout = useMemo(() => syntheticHoldout(), []);
  const baseline = useMemo(() => deriveBaseline(), []);
  const summary = getDatasetSummary();
  const selected = records.find((record) => record.id === selectedId);
  const filtered = records.filter(
    (record) => filter === "all" || record.status === filter,
  );

  const emit = (name, detail = {}) =>
    window.dispatchEvent(
      new CustomEvent("flowbacktest:event", {
        detail: {
          name,
          scope: "synthetic_demo",
          eventId: `${session.current}-${name}`,
          ...detail,
        },
      }),
    );
  useEffect(() => {
    const pop = () => setView(getView());
    const clearData = () => reset();
    window.addEventListener("popstate", pop);
    window.addEventListener("flowbacktest:clear-data", clearData);
    emit("demo_open", { route: window.location.pathname });
    return () => {
      window.removeEventListener("popstate", pop);
      window.removeEventListener("flowbacktest:clear-data", clearData);
    };
  }, []);

  function navigate(event, id) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    window.history.pushState({}, "", `/demo/${id}`);
    setView(id);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() =>
      document.getElementById("demo-view-title")?.focus(),
    );
  }

  function reset() {
    setParameters({ ...DEFAULT_PARAMETERS });
    setRecords(createDemoRecords());
    setSelectedId("O-248");
    setVerified(false);
    setStage(0);
    setFilter("all");
    setFeedback("");
    visitedStages.current = new Set([0]);
    setNotice(
      "Demo reset. The original synthetic records and assumptions are restored.",
    );
  }

  function chooseRecord(id) {
    setSelectedId(id);
    setVerified(false);
    setFeedback("");
  }

  function chooseFilter(status) {
    setFilter(status);
    const matches = records.filter(
      (record) => status === "all" || record.status === status,
    );
    if (matches.length && !matches.some((record) => record.id === selectedId))
      chooseRecord(matches[0].id);
  }

  function action(decision) {
    if (!verified) return;
    setRecords((current) => applyMockReview(current, selectedId, decision));
    setVerified(false);
    setFeedback(
      decision === "approve"
        ? "Mock approval saved locally. The demo stops before release."
        : decision === "reject"
          ? "Mock rejection recorded locally."
          : "Mock evidence request prepared locally; no message was sent.",
    );
  }

  function chooseStage(index) {
    setStage(index);
    visitedStages.current.add(index);
    if (visitedStages.current.size === STAGES.length)
      emit("demo_complete", {
        flow: "process_walkthrough",
        route: "/demo/map",
      });
  }

  function exportReport() {
    const report = buildSyntheticReport(comparison, records, holdout);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "FlowBackTest-DEMO-SYNTHETIC-report.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice(
      "Synthetic JSON report downloaded. It contains a persistent DEMO label and the exact model assumptions.",
    );
  }

  return (
    <div className="fbt-demo">
      <a className="demo-skip-link" href="#demo-main">
        Skip to demo content
      </a>
      <div className="demo-boundary">
        <span>
          <i />
          DEMO — SYNTHETIC DATA
        </span>
        <span>CONCEPT PREVIEW</span>
        <p>No live integrations. No external actions.</p>
      </div>
      <header className="demo-workspace-header">
        <a href="/" className="demo-brand" aria-label="FlowBackTest home">
          <img
            src="/media/logo/flowbacktest-wordmark-primary.svg"
            width="210"
            height="33"
            alt="FlowBackTest"
          />
          <span> / The workbench</span>
        </a>
        <a href="/" className="demo-return">
          <Icon name="back" />
          Return to website
        </a>
      </header>
      <div className="demo-workspace-bar">
        <div>
          <span className="demo-org-mark">K</span>
          <div>
            <strong>Kestrel Wholesale</strong>
            <span>Order to cash · fictional organization</span>
          </div>
        </div>
        <div className="demo-toolbar">
          <button className="demo-button" type="button" onClick={reset}>
            <Icon name="reset" />
            Reset demo
          </button>
          <button
            className="demo-button primary"
            type="button"
            onClick={exportReport}
          >
            <Icon name="export" />
            Export synthetic report
          </button>
        </div>
      </div>
      <nav className="demo-tabs" aria-label="Demo workspace">
        {TABS.map((tab) => (
          <a
            key={tab.id}
            href={`/demo/${tab.id}`}
            aria-current={view === tab.id ? "page" : undefined}
            onClick={(event) => navigate(event, tab.id)}
          >
            <small>{tab.number}</small>
            {tab.label}
            <Icon name="chevron" size={14} />
          </a>
        ))}
      </nav>
      <div id="demo-main" className="demo-main" tabIndex={-1}>
        {notice && (
          <div className="demo-notice" role="status">
            <Icon name="check" />
            <p>{notice}</p>
            <button
              type="button"
              aria-label="Dismiss notice"
              onClick={() => setNotice("")}
            >
              <Icon name="close" />
            </button>
          </div>
        )}
        <div className="demo-page-intro">
          <div>
            <p className="demo-eyebrow">
              A decision before a deployment /{" "}
              {TABS.find((tab) => tab.id === view)?.number}
            </p>
            <h1 id="demo-view-title" tabIndex={-1}>
              {view === "map"
                ? "Follow the handoff."
                : view === "scenarios"
                  ? "Change the assumption. See the consequence."
                  : view === "backtest"
                    ? "A useful model has to face history."
                    : "The evidence behind the path."}
            </h1>
          </div>
          <p>
            {view === "map"
              ? "One fictional order-to-cash process. Two routes. A visible human approval gate."
              : view === "scenarios"
                ? "Explore where queues and exceptions move. These seeded outcomes are illustrative until calibrated."
                : view === "backtest"
                  ? "Inspect a synthetic historical change, then see the evidence a real planning study would need."
                  : "Ten staged orders from a 40-case synthetic fixture, with source references and accountable reviewers."}
          </p>
        </div>

        {view === "map" && (
          <>
            <div className="demo-map-layout">
              <aside className="demo-source-summary">
                <p className="demo-eyebrow">Source evidence</p>
                <h2>A small, inspectable beginning.</h2>
                <dl>
                  <div>
                    <dt>Synthetic cases</dt>
                    <dd>{summary.cases}</dd>
                  </div>
                  <div>
                    <dt>Source events</dt>
                    <dd>{summary.events}</dd>
                  </div>
                  <div>
                    <dt>Complete histories</dt>
                    <dd>{summary.completed}</dd>
                  </div>
                  <div>
                    <dt>Mean recorded cycle</dt>
                    <dd>
                      {fmt(baseline.meanCycleHours / 8)}
                      <small> model days</small>
                    </dd>
                  </div>
                </dl>
                <p>
                  The baseline uses completed fixture histories. Open and
                  rejected cases are kept visible in the source explorer.
                </p>
                <a
                  href="/demo/records"
                  onClick={(event) => navigate(event, "records")}
                  className="demo-text-link"
                >
                  Inspect the source records <Icon name="arrow" />
                </a>
              </aside>
              <ProcessMap stage={stage} />
            </div>
            <div className="demo-walkthrough">
              <div
                className="demo-stage-tabs"
                role="group"
                aria-label="Process walkthrough stages"
              >
                {STAGES.map((item, index) => (
                  <button
                    type="button"
                    key={item.name}
                    aria-pressed={stage === index}
                    onClick={() => chooseStage(index)}
                  >
                    <span>0{index + 1}</span>
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="demo-stage-story" aria-live="polite">
                <div>
                  <span className="demo-eyebrow">Stage 0{stage + 1}</span>
                  <h3>{STAGES[stage].label}</h3>
                </div>
                <p>{STAGES[stage].body}</p>
                <button
                  type="button"
                  className="demo-circle-button"
                  aria-label={
                    stage === 3
                      ? "Restart process walkthrough"
                      : "View the next process stage"
                  }
                  onClick={() => chooseStage((stage + 1) % 4)}
                >
                  <Icon name="arrow" />
                </button>
              </div>
            </div>
            <div className="demo-results-grid">
              <IntervalChart comparison={comparison} />
              <QueueChart comparison={comparison} />
            </div>
            <div className="demo-map-bottom">
              <RecordDetail
                record={selected}
                verified={verified}
                setVerified={setVerified}
                onAction={action}
                feedback={feedback}
                compact
              />
              <div className="demo-decision-card">
                <p className="demo-eyebrow">Before a real rollout</p>
                <h2>
                  A map opens the question.
                  <br />A backtest tests it.
                </h2>
                <p>
                  Configure agent handling, exceptions and review load. Then
                  inspect the synthetic holdout and what remains unvalidated.
                </p>
                <a
                  href="/demo/scenarios"
                  onClick={(event) => navigate(event, "scenarios")}
                  className="demo-button primary"
                >
                  Build a scenario <Icon name="arrow" />
                </a>
                <a
                  href="/demo/backtest"
                  onClick={(event) => navigate(event, "backtest")}
                  className="demo-text-link"
                >
                  Inspect the holdout <Icon name="arrow" />
                </a>
                <div className="demo-mini-status">
                  <Icon name="control" />
                  <span>
                    Customer-data accuracy
                    <br />
                    <strong>Not assessed</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="demo-fixture-controls">
              <div>
                <p className="demo-eyebrow">Fixture-only event log</p>
                <p>
                  40 fictional cases. Reload the built-in log; no ERP connection
                  or customer upload.
                </p>
              </div>
              <button className="demo-button" type="button" onClick={reset}>
                Reload sample event log
              </button>
              <a
                className="demo-button"
                href="/downloads/O2C-SYNTHETIC-40.csv"
                download
              >
                Download synthetic CSV
              </a>
            </div>
            <Assumptions parameters={parameters} />
          </>
        )}

        {view === "scenarios" && (
          <>
            <div className="demo-scenario-layout">
              <section
                className="demo-controls"
                aria-labelledby="scenario-control-title"
              >
                <p className="demo-eyebrow">Agent-assisted route</p>
                <h2 id="scenario-control-title">
                  Make the assumptions visible.
                </h2>
                <p>
                  Move one input at a time. The model reuses the seed so
                  comparisons are reproducible.
                </p>
                <label className="demo-slider-label" htmlFor="agent-handling">
                  <span>Agent handling time</span>
                  <strong>
                    {parameters.agentHandlingMinutes}
                    <small> min</small>
                  </strong>
                  <input
                    id="agent-handling"
                    type="range"
                    min="5"
                    max="180"
                    step="1"
                    value={parameters.agentHandlingMinutes}
                    onChange={(event) =>
                      setParameters((current) => ({
                        ...current,
                        agentHandlingMinutes: +event.target.value,
                      }))
                    }
                  />
                  <span className="demo-range-endpoints">
                    <small>5 minutes</small>
                    <small>180 minutes</small>
                  </span>
                </label>
                <label className="demo-slider-label" htmlFor="exception-rate">
                  <span>Agent exception rate</span>
                  <strong>
                    {Math.round(parameters.exceptionRate * 100)}
                    <small>%</small>
                  </strong>
                  <input
                    id="exception-rate"
                    type="range"
                    min="0"
                    max="80"
                    step="1"
                    value={Math.round(parameters.exceptionRate * 100)}
                    onChange={(event) =>
                      setParameters((current) => ({
                        ...current,
                        exceptionRate: +event.target.value / 100,
                      }))
                    }
                  />
                  <span className="demo-range-endpoints">
                    <small>No routed exceptions</small>
                    <small>80% of cases</small>
                  </span>
                </label>
                <label className="demo-slider-label" htmlFor="control-rate">
                  <span>Supplemental control review</span>
                  <strong>
                    {Math.round(parameters.supplementalReviewRate * 100)}
                    <small>%</small>
                  </strong>
                  <input
                    id="control-rate"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(parameters.supplementalReviewRate * 100)}
                    onChange={(event) =>
                      setParameters((current) => ({
                        ...current,
                        supplementalReviewRate: +event.target.value / 100,
                      }))
                    }
                  />
                  <span className="demo-range-endpoints">
                    <small>No extra audit</small>
                    <small>Every case</small>
                  </span>
                </label>
                <div className="demo-controls-note">
                  <Icon name="control" />
                  <p>
                    <strong>Human approval is always required.</strong> The
                    review slider adds a supplemental audit. It cannot bypass
                    the release gate.
                  </p>
                </div>
                <div className="demo-seed-note">
                  <span>Seed {parameters.seed}</span>
                  <span>
                    {parameters.runs} runs / {parameters.cases} cases
                  </span>
                </div>
              </section>
              <section
                className="demo-scenario-results"
                aria-labelledby="scenario-results-title"
              >
                <div className="demo-results-heading">
                  <h2 id="scenario-results-title">A conditional outcome.</h2>
                  <Stamp>Unvalidated</Stamp>
                </div>
                <IntervalChart comparison={comparison} />
                <div className="demo-metrics" aria-live="polite">
                  <div>
                    <span>Agent-assisted mean cycle</span>
                    <strong>
                      {fmt(comparison.agent.cycleDays.mean)}
                      <small> days</small>
                    </strong>
                    <p>
                      {fmt(comparison.agent.cycleDays.low)}–
                      {fmt(comparison.agent.cycleDays.high)} · 80% scenario
                      range
                    </p>
                  </div>
                  <div>
                    <span>Completions in 72 model hours</span>
                    <strong>
                      {fmt(comparison.agent.completedCases.mean, 0)}
                      <small> / 40</small>
                    </strong>
                    <p>
                      {fmt(comparison.agent.completedCases.low, 0)}–
                      {fmt(comparison.agent.completedCases.high, 0)} across runs
                    </p>
                  </div>
                  <div>
                    <span>Largest queue</span>
                    <strong className="demo-metric-word">
                      {comparison.agent.bottleneck}
                    </strong>
                    <p>
                      {fmt(comparison.agent.queueHours.mean)} hours total mean
                      queue wait
                    </p>
                  </div>
                </div>
                <QueueChart comparison={comparison} />
              </section>
            </div>
            <section className="demo-control-model">
              <div>
                <p className="demo-eyebrow">Control / proposed model</p>
                <h2>What gets stopped before release?</h2>
                <p>
                  The illustrative model flags proposals that would skip a
                  required review. They remain behind the compulsory human gate.
                  This is a model assumption, not demonstrated protection or
                  compliance.
                </p>
              </div>
              <dl>
                <div>
                  <dt>Potential bypass proposals</dt>
                  <dd>
                    {fmt(comparison.agent.controlFlags.mean)}
                    <small> average / run</small>
                  </dd>
                </div>
                <div>
                  <dt>Required human approvals</dt>
                  <dd>
                    {fmt(comparison.agent.humanApprovals.mean, 0)}
                    <small> / 40 modeled orders</small>
                  </dd>
                </div>
                <div>
                  <dt>Release without approval</dt>
                  <dd>
                    Disabled<small>structural model rule</small>
                  </dd>
                </div>
              </dl>
            </section>
            <Assumptions parameters={parameters} expanded />
            <div className="demo-next-page">
              <p>
                The sliders explore a hypothesis. The next question is whether a
                model can reproduce a known historical change.
              </p>
              <a
                href="/demo/backtest"
                onClick={(event) => navigate(event, "backtest")}
                className="demo-button primary"
              >
                Inspect the backtest <Icon name="arrow" />
              </a>
            </div>
          </>
        )}

        {view === "backtest" && (
          <>
            <div className="demo-holdout-header">
              <div>
                <Stamp>Illustrative holdout</Stamp>
                <h2>{holdout.title}</h2>
                <p>{holdout.change}</p>
              </div>
              <div className="demo-holdout-status">
                <span className="demo-status status-pending">
                  <i />
                  Synthetic illustration
                </span>
                <p>
                  Customer-data accuracy
                  <br />
                  <strong>Not assessed</strong>
                </p>
              </div>
            </div>
            <div className="demo-backtest-grid">
              <section
                className="demo-backtest-table"
                aria-labelledby="backtest-table-title"
              >
                <h3 id="backtest-table-title">Direction, before precision.</h3>
                <div className="demo-table-scroll">
                  <table>
                    <caption>
                      All numbers are synthetic mean cycle time in 8-hour model
                      days.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Comparison</th>
                        <th scope="col">Before</th>
                        <th scope="col">After</th>
                        <th scope="col">Direction</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">
                          Naive baseline<small>Assumes no effect</small>
                        </th>
                        <td>{fmt(holdout.predictedBefore)}d</td>
                        <td>{fmt(holdout.naiveAfter)}d</td>
                        <td>Unchanged</td>
                      </tr>
                      <tr>
                        <th scope="row">
                          Seeded scenario
                          <small>35% shorter manual triage</small>
                        </th>
                        <td>{fmt(holdout.predictedBefore)}d</td>
                        <td>{fmt(holdout.predictedAfter.mean)}d</td>
                        <td>
                          {holdout.predictedEffect < 0
                            ? "Shorter cycle"
                            : "Longer cycle"}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">
                          Synthetic held-out reference
                          <small>Same fictional generator</small>
                        </th>
                        <td>{fmt(holdout.before)}d</td>
                        <td>{fmt(holdout.observedAfter)}d</td>
                        <td>
                          {holdout.observedEffect < 0
                            ? "Shorter cycle"
                            : "Longer cycle"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="demo-holdout-result">
                  <Icon name="source" />
                  {holdout.directionMatches
                    ? "Directions agree in this synthetic illustration."
                    : "Directions disagree in this synthetic illustration."}{" "}
                  This does not validate real predictive accuracy.
                </p>
                <p className="demo-watermark">
                  DEMO — SYNTHETIC DATA · CONCEPT PREVIEW
                </p>
              </section>
              <aside className="demo-holdout-caveat">
                <p className="demo-eyebrow">Evidence boundary</p>
                <h2>
                  This is the test format.
                  <br />
                  The evidence is still missing.
                </h2>
                <p>{holdout.evidence}</p>
                <dl>
                  <div>
                    <dt>Consented customer event logs</dt>
                    <dd>Not provided</dd>
                  </div>
                  <div>
                    <dt>Measured counterfactual accuracy</dt>
                    <dd>Unknown</dd>
                  </div>
                  <div>
                    <dt>Celonis / UiPath comparison</dt>
                    <dd>{holdout.incumbentComparisonStatus}</dd>
                  </div>
                  <div>
                    <dt>Paid planning-study sponsor</dt>
                    <dd>Not committed</dd>
                  </div>
                </dl>
              </aside>
            </div>
            <section className="demo-study-protocol">
              <div>
                <p className="demo-eyebrow">A real planning study</p>
                <h2>
                  Agree the test before
                  <br />
                  looking at the result.
                </h2>
                <p>
                  Use a known historical process change as a holdout. Set the
                  directional and control criteria with the process owner before
                  running the comparison.
                </p>
              </div>
              <ol>
                <li>
                  <span>01</span>
                  <div>
                    <h3>Name the decision.</h3>
                    <p>
                      A funded owner, an event-log owner and a specific pending
                      deployment date.
                    </p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <h3>Compare the alternatives.</h3>
                    <p>
                      A naive baseline and the existing process-mining workflow,
                      including incumbent simulation.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <h3>Test the holdout.</h3>
                    <p>
                      Consented historical logs; the known change excluded from
                      model fitting. No invented target accuracy.
                    </p>
                  </div>
                </li>
                <li>
                  <span>04</span>
                  <div>
                    <h3>Make the stop / go decision.</h3>
                    <p>
                      Advance only with a paid sponsor and a model that meets
                      the agreed criteria beyond both comparators. Pause for
                      incomplete logs or unstable calibration.
                    </p>
                  </div>
                </li>
              </ol>
            </section>
            <div className="demo-next-page">
              <p>
                FlowBackTest is a research-stage concept. Demand, accuracy,
                willingness to pay and integration rights remain unvalidated.
              </p>
              <a className="demo-button primary" href="/study">
                Explore a study request <Icon name="arrow" />
              </a>
            </div>
          </>
        )}

        {view === "records" && (
          <>
            <div className="demo-records-toolbar">
              <div
                className="demo-record-filters"
                role="group"
                aria-label="Filter synthetic orders"
              >
                {["all", "pending", "blocked", "completed", "rejected"].map(
                  (status) => (
                    <button
                      type="button"
                      key={status}
                      aria-pressed={filter === status}
                      onClick={() => chooseFilter(status)}
                    >
                      {status}
                      <small>
                        {status === "all"
                          ? records.length
                          : records.filter((record) => record.status === status)
                              .length}
                      </small>
                    </button>
                  ),
                )}
              </div>
              <span>
                {filtered.length} visible / {summary.cases} fixture cases
              </span>
            </div>
            <div className="demo-records-layout">
              <section
                className="demo-record-queue"
                aria-label="Synthetic order queue"
              >
                <div className="demo-pane-label">
                  <span>Order / accountable owner</span>
                  <span>State</span>
                </div>
                {filtered.map((record) => (
                  <button
                    type="button"
                    className={`demo-queue-item${selectedId === record.id ? " selected" : ""}`}
                    key={record.id}
                    onClick={() => chooseRecord(record.id)}
                    aria-pressed={selectedId === record.id}
                  >
                    <span>
                      <strong>{record.id}</strong>
                      <small>
                        {record.owner} · {record.lines} lines
                      </small>
                      <em>{record.currentStep}</em>
                    </span>
                    <span className={`demo-status status-${record.status}`}>
                      <i />
                      {record.mockReview === "approve"
                        ? "approved*"
                        : record.status}
                    </span>
                    <Icon name="chevron" size={15} />
                  </button>
                ))}
                <p className="demo-small-note">
                  * Mock approval is local. The source fixture remains
                  unchanged.
                </p>
              </section>
              <RecordDetail
                record={selected}
                verified={verified}
                setVerified={setVerified}
                onAction={action}
                feedback={feedback}
              />
            </div>
            <details className="demo-dictionary">
              <summary>
                Data dictionary{" "}
                <span>
                  {EVENT_DICTIONARY.length} fields · synthetic fixture
                </span>
              </summary>
              <div className="demo-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Field</th>
                      <th scope="col">Type</th>
                      <th scope="col">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EVENT_DICTIONARY.map((field) => (
                      <tr key={field.name}>
                        <th scope="row">
                          <code>{field.name}</code>
                        </th>
                        <td>{field.type}</td>
                        <td>{field.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </div>
      <footer className="demo-footer">
        <p>
          <strong>DEMO — SYNTHETIC DATA</strong>
          <span>
            A research-stage concept preview. No real customer records or
            operational predictions.
          </span>
        </p>
        <div>
          <a href="/method">Simulation vs calibration</a>
          <a href="/data">Data &amp; incumbent comparison</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </div>
        <span>Fixture 1.0 · 12 October 2026</span>
      </footer>
    </div>
  );
}
