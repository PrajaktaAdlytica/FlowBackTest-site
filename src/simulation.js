import {
  HISTORICAL_CASES,
  DATASET_META,
  getDatasetSummary,
} from "./fixtures.js";

export const DEFAULT_PARAMETERS = Object.freeze({
  seed: 1048,
  cases: 40,
  runs: 120,
  exceptionRate: 0.18,
  agentHandlingMinutes: 34,
  supplementalReviewRate: 0.25,
  arrivalGapHours: 1.3,
  horizonHours: 72,
  businessDayHours: 8,
});

export const MODEL_ASSUMPTIONS = [
  "40 fictional arriving orders; a 72-hour continuous model window. One display day equals 8 model hours.",
  "Two manual triage workers, one simulated agent worker, one exception reviewer and one human approval reviewer.",
  "Human service times and downstream delays are sampled from the 24 completed synthetic fixture cases.",
  "Open and rejected histories are excluded from service-time fitting. That simplified selection can bias a real model; production data quality and censoring have not been assessed.",
  "Agent handling time and exception rate are assumptions. They have not been calibrated on an operating agent.",
  "Arrival gaps and agent service times vary uniformly from 65% to 135% of their configured mean. Mean arrival gap is 1.3 hours; an exception review takes 1.6–3.0 hours.",
  "The manual route assumes an 8% exception rate and a 12% supplemental-audit rate. Each extra audit adds 0.8–1.2 hours to the human review.",
  "Illustrative potential bypass probability is 3% plus 0.16 times the agent exception rate. A flag adds 0.6 hours to mandatory review. This is an invented test rule, not an observed failure rate.",
  "Every release requires human approval. The review slider adds a supplemental review; it never removes this gate.",
  "First-in, first-out queues; no shift calendar, abandonment, ERP writes or adaptive agent behavior.",
  "Ranges are the 10th–90th percentiles across seeded scenario runs, not confidence bounds on real outcomes.",
];

export function seededRandom(seed) {
  let value = Number(seed) >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mean = (values) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
const clamp = (value, min, max, fallback = min) =>
  Math.min(
    max,
    Math.max(min, Number.isFinite(Number(value)) ? Number(value) : fallback),
  );
const duration = (record, first, last) => {
  const start = record.events.find((event) => event.activity === first);
  const end = record.events.find((event) => event.activity === last);
  return start && end
    ? (Date.parse(end.timestamp) - Date.parse(start.timestamp)) / 3_600_000
    : null;
};

export function deriveBaseline(cases = HISTORICAL_CASES) {
  const closed = cases.filter((record) => record.status === "completed");
  const getDurations = (first, last) =>
    closed
      .map((record) => duration(record, first, last))
      .filter((value) => value !== null && value >= 0);
  if (!closed.length)
    throw new Error(
      "A baseline needs at least one completed case with source events.",
    );
  const triage = getDurations("Triage started", "Triage completed");
  const review = getDurations("Human review started", "Human review approved");
  const invoice = getDurations("Human review approved", "Invoice issued");
  const cash = getDurations("Invoice issued", "Cash applied");
  if ([triage, review, invoice, cash].some((values) => !values.length))
    throw new Error("The source events are incomplete for a baseline.");
  return {
    completedCases: closed.length,
    triage,
    review,
    invoice,
    cash,
    triageQueue: getDurations("Order received", "Triage started"),
    reviewQueue: getDurations("Triage completed", "Human review started"),
    cycle: getDurations("Order received", "Cash applied"),
    meanTriageHours: mean(triage),
    meanReviewHours: mean(review),
    meanCycleHours: mean(getDurations("Order received", "Cash applied")),
  };
}

export function normalizeParameters(input = {}) {
  const p = { ...DEFAULT_PARAMETERS, ...input };
  return {
    seed: Math.floor(
      Number.isFinite(Number(p.seed))
        ? Number(p.seed)
        : DEFAULT_PARAMETERS.seed,
    ),
    cases: Math.floor(clamp(p.cases, 1, 200, DEFAULT_PARAMETERS.cases)),
    runs: Math.floor(clamp(p.runs, 10, 400, DEFAULT_PARAMETERS.runs)),
    exceptionRate: clamp(
      p.exceptionRate,
      0,
      0.8,
      DEFAULT_PARAMETERS.exceptionRate,
    ),
    agentHandlingMinutes: clamp(
      p.agentHandlingMinutes,
      5,
      180,
      DEFAULT_PARAMETERS.agentHandlingMinutes,
    ),
    supplementalReviewRate: clamp(
      p.supplementalReviewRate,
      0,
      1,
      DEFAULT_PARAMETERS.supplementalReviewRate,
    ),
    arrivalGapHours: clamp(
      p.arrivalGapHours,
      0.25,
      4,
      DEFAULT_PARAMETERS.arrivalGapHours,
    ),
    horizonHours: clamp(
      p.horizonHours,
      12,
      200,
      DEFAULT_PARAMETERS.horizonHours,
    ),
    businessDayHours: 8,
  };
}

function quantile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * q;
  const lower = Math.floor(index);
  return (
    sorted[lower] + (sorted[Math.ceil(index)] - sorted[lower]) * (index - lower)
  );
}

function summarize(values) {
  return {
    mean: mean(values),
    low: quantile(values, 0.1),
    high: quantile(values, 0.9),
  };
}

/** Stage scheduler: FIFO jobs use the first available worker; times are model hours. */
function scheduleStage(
  jobs,
  workers,
  arrivalKey,
  durationKey,
  outputKey,
  queueKey,
) {
  const available = Array(workers).fill(0);
  for (const job of [...jobs].sort(
    (a, b) => a[arrivalKey] - b[arrivalKey] || a.index - b.index,
  )) {
    const earliest = Math.min(...available);
    const worker = available.indexOf(earliest);
    const start = Math.max(job[arrivalKey], available[worker]);
    job[queueKey] = start - job[arrivalKey];
    job[outputKey] = start + job[durationKey];
    available[worker] = job[outputKey];
  }
}

function oneRun(
  parameters,
  baseline,
  seed,
  mode,
  triageMultiplier = 1,
  includeTrace = false,
) {
  const random = seededRandom(seed);
  const sample = (list, draw) => list[Math.floor(draw * list.length)];
  const isAgent = mode === "agent";
  let arrival = 0;
  const jobs = Array.from({ length: parameters.cases }, (_, index) => {
    // Fixed draw positions preserve identical arrivals and downstream samples between routes.
    const draws = Array.from({ length: 10 }, random);
    arrival +=
      index === 0 ? 0 : parameters.arrivalGapHours * (0.65 + draws[0] * 0.7);
    const exception = draws[1] < (isAgent ? parameters.exceptionRate : 0.08);
    const extraReview =
      draws[2] < (isAgent ? parameters.supplementalReviewRate : 0.12);
    const potentialBypass =
      isAgent && draws[3] < 0.03 + parameters.exceptionRate * 0.16;
    return {
      index,
      arrival,
      exception,
      extraReview,
      potentialBypass,
      triageDuration: isAgent
        ? (parameters.agentHandlingMinutes / 60) * (0.65 + draws[4] * 0.7)
        : sample(baseline.triage, draws[4]) * triageMultiplier,
      exceptionDuration: exception ? 1.6 + draws[5] * 1.4 : 0,
      reviewDuration:
        sample(baseline.review, draws[6]) +
        (extraReview ? 0.8 + draws[7] * 0.4 : 0) +
        (potentialBypass ? 0.6 : 0),
      invoiceDelay: sample(baseline.invoice, draws[8]),
      cashDelay: sample(baseline.cash, draws[9]),
    };
  });
  scheduleStage(
    jobs,
    isAgent ? 1 : 2,
    "arrival",
    "triageDuration",
    "triageDone",
    "triageWait",
  );
  for (const job of jobs) job.exceptionWait = 0;
  const exceptions = jobs.filter((job) => job.exception);
  scheduleStage(
    exceptions,
    1,
    "triageDone",
    "exceptionDuration",
    "exceptionDone",
    "exceptionWait",
  );
  for (const job of jobs)
    job.reviewReady = job.exception ? job.exceptionDone : job.triageDone;
  scheduleStage(
    jobs,
    1,
    "reviewReady",
    "reviewDuration",
    "reviewDone",
    "reviewWait",
  );
  for (const job of jobs) {
    job.humanApproved = true; // This gate is mandatory in both scenarios.
    job.invoiceIssued = job.reviewDone + job.invoiceDelay;
    job.completed = job.invoiceIssued + job.cashDelay;
    job.cycleHours = job.completed - job.arrival;
  }
  const finished = jobs.filter(
    (job) => job.completed <= parameters.horizonHours,
  ).length;
  return {
    cycleDays:
      mean(jobs.map((job) => job.cycleHours)) / parameters.businessDayHours,
    queueHours: mean(
      jobs.map((job) => job.triageWait + job.exceptionWait + job.reviewWait),
    ),
    triageQueueHours: mean(jobs.map((job) => job.triageWait)),
    exceptionQueueHours: mean(jobs.map((job) => job.exceptionWait)),
    reviewQueueHours: mean(jobs.map((job) => job.reviewWait)),
    throughput:
      (finished / parameters.horizonHours) * parameters.businessDayHours,
    completedCases: finished,
    exceptionCases: exceptions.length,
    controlFlags: jobs.filter((job) => job.potentialBypass).length,
    humanApprovals: jobs.filter((job) => job.humanApproved).length,
    releasesWithoutApproval: jobs.filter((job) => !job.humanApproved).length,
    ...(includeTrace ? { trace: jobs } : {}),
  };
}

export function simulateOnce(input = {}, mode = "agent") {
  if (!["agent", "human"].includes(mode))
    throw new Error("A scenario must be human or agent.");
  const parameters = normalizeParameters(input);
  return oneRun(parameters, deriveBaseline(), parameters.seed, mode, 1, true);
}

const METRICS = [
  "cycleDays",
  "queueHours",
  "triageQueueHours",
  "exceptionQueueHours",
  "reviewQueueHours",
  "throughput",
  "completedCases",
  "exceptionCases",
  "controlFlags",
  "humanApprovals",
  "releasesWithoutApproval",
];

function ensemble(
  parameters,
  baseline,
  mode,
  offset = 0,
  triageMultiplier = 1,
) {
  const runs = Array.from({ length: parameters.runs }, (_, index) =>
    oneRun(
      parameters,
      baseline,
      parameters.seed + offset + index * 7919,
      mode,
      triageMultiplier,
    ),
  );
  const result = Object.fromEntries(
    METRICS.map((metric) => [
      metric,
      summarize(runs.map((run) => run[metric])),
    ]),
  );
  const queues = [
    ["Triage", result.triageQueueHours.mean],
    ["Exceptions", result.exceptionQueueHours.mean],
    ["Human review", result.reviewQueueHours.mean],
  ].sort((a, b) => b[1] - a[1]);
  return {
    ...result,
    bottleneck: queues[0][1] < 0.1 ? "No material queue" : queues[0][0],
  };
}

export function simulateComparison(input = {}, cases = HISTORICAL_CASES) {
  const parameters = normalizeParameters(input);
  const baseline = deriveBaseline(cases);
  const human = ensemble(parameters, baseline, "human");
  const agent = ensemble(parameters, baseline, "agent");
  return {
    label: "DEMO — SYNTHETIC DATA · CONCEPT PREVIEW",
    parameters,
    source: {
      ...DATASET_META,
      ...getDatasetSummary(),
      baselineCases: baseline.completedCases,
    },
    human,
    agent,
    assumptions: [...MODEL_ASSUMPTIONS],
    interval:
      "80% scenario range: 10th–90th percentiles across seeded synthetic runs. Not a real-world prediction or a confidence interval.",
    validatedOnCustomerData: false,
  };
}

/** An illustrative holdout from the same fictional generator; not counterfactual validation. */
export function syntheticHoldout(input = {}) {
  const parameters = normalizeParameters({
    ...input,
    exceptionRate: DEFAULT_PARAMETERS.exceptionRate,
  });
  const baseline = deriveBaseline();
  const prior = ensemble(parameters, baseline, "human");
  const predictedAfter = ensemble(parameters, baseline, "human", 0, 0.65);
  const beforeObserved = oneRun(
    parameters,
    baseline,
    parameters.seed + 550013,
    "human",
  );
  const afterObserved = oneRun(
    parameters,
    baseline,
    parameters.seed + 550013,
    "human",
    0.65,
  );
  const predictedEffect = predictedAfter.cycleDays.mean - prior.cycleDays.mean;
  const observedEffect = afterObserved.cycleDays - beforeObserved.cycleDays;
  return {
    title: "Synthetic held-out triage change",
    change:
      "Manual triage service time shortened by 35%; staffing and approval policy held constant.",
    before: beforeObserved.cycleDays,
    observedAfter: afterObserved.cycleDays,
    predictedBefore: prior.cycleDays.mean,
    predictedAfter: predictedAfter.cycleDays,
    naiveAfter: prior.cycleDays.mean,
    predictedEffect,
    observedEffect,
    naiveEffect: 0,
    directionMatches: Math.sign(predictedEffect) === Math.sign(observedEffect),
    evidence:
      "Illustration only. Both historical and held-out observations come from the same synthetic generator; this cannot establish real predictive accuracy.",
    customerHoldoutStatus: "Not assessed",
    incumbentComparisonStatus: "Not run",
    paidSponsorStatus: "No real commitment recorded",
  };
}

export function applyMockReview(records, id, decision) {
  if (!["approve", "reject", "evidence"].includes(decision)) return records;
  return records.map((record) => {
    if (
      record.id !== id ||
      record.status === "completed" ||
      record.status === "rejected" ||
      record.mockReview
    )
      return record;
    if (decision === "approve" && record.status === "blocked") return record;
    const event = {
      case_id: record.id,
      event_id: `MOCK-${record.id}-${decision}`,
      activity:
        decision === "approve"
          ? "Human approval recorded (mock)"
          : decision === "reject"
            ? "Proposal rejected (mock)"
            : "Evidence request prepared (mock)",
      timestamp: "2026-10-12T10:30:00.000Z",
      owner: "Ada Bell · fictional reviewer",
      source_ref: record.sourceRef,
    };
    return {
      ...record,
      status: decision === "reject" ? "rejected" : record.status,
      mockReview: decision,
      currentStep:
        decision === "approve"
          ? "Release ready (mock)"
          : decision === "reject"
            ? "Control rejected (mock)"
            : "Evidence requested (mock)",
      nextAction:
        "The demo stops here. No message, invoice, external write or payment is created.",
      updated: event.timestamp,
      events: [...record.events, event],
    };
  });
}

export function buildSyntheticReport(
  comparison,
  records,
  holdout = syntheticHoldout(),
) {
  return {
    documentType: "FlowBackTest concept preview — synthetic report",
    watermark: "DEMO — SYNTHETIC DATA · CONCEPT PREVIEW",
    fixtureDate: DATASET_META.created,
    source: comparison.source,
    model: comparison,
    syntheticHoldout: holdout,
    stagedRecords: records,
    notice:
      "Illustrative fictional results. No customer accuracy, savings, compliance, operating product or paid study commitment is demonstrated. This report performs no external action.",
  };
}
