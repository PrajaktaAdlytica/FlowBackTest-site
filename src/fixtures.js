/** Fictional fixtures only. There is no customer data in this module. */
export const DATASET_META = Object.freeze({
  name: "Kestrel Wholesale",
  source: "O2C-SYNTHETIC-40.csv",
  version: "Fixture 1.0",
  kind: "DEMO — SYNTHETIC DATA",
  cases: 40,
  created: "2026-10-12",
  provenance:
    "Deterministic fictional event records created for this concept preview.",
  operatingProduct: false,
});

export const EVENT_DICTIONARY = [
  {
    name: "case_id",
    type: "string",
    meaning: "Fictional order identifier. Never a customer identifier.",
  },
  {
    name: "event_id",
    type: "string",
    meaning: "Unique synthetic event reference within this fixture.",
  },
  {
    name: "activity",
    type: "enum",
    meaning:
      "The recorded stage: intake, triage, review, invoice or cash applied.",
  },
  {
    name: "timestamp",
    type: "ISO 8601",
    meaning:
      "Fictional UTC event time. Model durations use a simplified continuous clock.",
  },
  {
    name: "owner",
    type: "string",
    meaning: "Fictional accountable operator for this event.",
  },
  {
    name: "source_ref",
    type: "string",
    meaning: "A fixture reference, not an accessible ERP document.",
  },
  {
    name: "status",
    type: "enum",
    meaning: "A staged record can be pending, blocked, completed or rejected.",
  },
];

const START = Date.UTC(2026, 8, 23, 8, 0, 0);
const HOUR = 3_600_000;
const OWNERS = ["Ada Bell", "Clara Wren", "Henry Moss", "Edward Reed"];
const NEXT_STATES = [
  "pending",
  "blocked",
  "pending",
  "pending",
  "rejected",
  "blocked",
  "pending",
  "rejected",
];
const issueFor = (status, index) =>
  status === "blocked"
    ? index % 2
      ? "Credit-limit evidence is missing."
      : "Customer reference cannot be matched to the source order."
    : status === "rejected"
      ? "The proposed route bypasses a required credit approval."
      : status === "pending"
        ? "Agent-assisted triage is eligible; release still requires a human approval."
        : "The fictional order completed the required human review.";

function makeCase(index) {
  const orderNumber = 221 + index;
  const id = `O-${orderNumber}`;
  const status =
    index < 24 ? "completed" : NEXT_STATES[(index - 24) % NEXT_STATES.length];
  const orderTime = START + index * 3.1 * HOUR;
  const queue = 1.4 + ((index * 7) % 11) * 0.36;
  const triage = 1.8 + ((index * 3) % 8) * 0.25;
  const reviewQueue = 0.4 + ((index * 5) % 7) * 0.22;
  const review = 0.45 + ((index * 2) % 6) * 0.11;
  const invoice = 4.8 + ((index * 4) % 9) * 0.7;
  const cash = 10.5 + ((index * 9) % 13) * 0.8;
  const owner = id === "O-248" ? "Ada Bell" : OWNERS[index % OWNERS.length];
  const raw = [
    ["Order received", 0, "Edward Reed"],
    ["Triage started", queue, "Henry Moss"],
    ["Triage completed", queue + triage, "Henry Moss"],
  ];
  if (status === "pending")
    raw.push(["Human review started", queue + triage + reviewQueue, owner]);
  if (status === "blocked")
    raw.push(["Exception raised", queue + triage + reviewQueue, owner]);
  if (status === "rejected") {
    raw.push(["Human review started", queue + triage + reviewQueue, owner]);
    raw.push([
      "Control rejected",
      queue + triage + reviewQueue + review,
      owner,
    ]);
  }
  if (status === "completed") {
    raw.push(["Human review started", queue + triage + reviewQueue, owner]);
    raw.push([
      "Human review approved",
      queue + triage + reviewQueue + review,
      owner,
    ]);
    raw.push([
      "Invoice issued",
      queue + triage + reviewQueue + review + invoice,
      "Clara Wren",
    ]);
    raw.push([
      "Cash applied",
      queue + triage + reviewQueue + review + invoice + cash,
      "Clara Wren",
    ]);
  }
  const events = raw.map(([activity, hours, eventOwner], eventIndex) => ({
    case_id: id,
    event_id: `SYN-${orderNumber}-${String(eventIndex + 1).padStart(2, "0")}`,
    activity,
    timestamp: new Date(orderTime + hours * HOUR).toISOString(),
    owner: eventOwner,
    source_ref: `SRC-SYN-${orderNumber}`,
  }));
  return {
    id,
    company: "Kestrel Wholesale",
    customer: [
      "Bramley Trade Supplies",
      "Wren Industrial",
      "Ashcombe Merchants",
      "Northfield Components",
    ][index % 4],
    status,
    owner,
    orderType: index % 3 === 0 ? "Credit review" : "Standard B2B",
    lines: 4 + (index % 9),
    sourceRef: `SRC-SYN-${orderNumber}`,
    policyRef: "POL-SYN-04 · Human release approval",
    issue: issueFor(status, index),
    currentStep:
      status === "completed"
        ? "Cash applied"
        : status === "blocked"
          ? "Exception queue"
          : status === "rejected"
            ? "Control rejected"
            : "Human review",
    nextAction:
      status === "completed"
        ? "No further action in this fixture."
        : status === "blocked"
          ? "Review the missing source evidence."
          : status === "rejected"
            ? "Reconfigure the proposal with a human approval."
            : "Review the source evidence and proposed route.",
    due: new Date(
      orderTime + (queue + triage + reviewQueue + 8) * HOUR,
    ).toISOString(),
    updated: events[events.length - 1].timestamp,
    events,
  };
}

export const HISTORICAL_CASES = Object.freeze(
  Array.from({ length: 40 }, (_, index) => makeCase(index)),
);
export const SYNTHETIC_EVENTS = Object.freeze(
  HISTORICAL_CASES.flatMap((record) => record.events),
);
const VISIBLE_IDS = [
  "O-248",
  "O-246",
  "O-249",
  "O-247",
  "O-250",
  "O-244",
  "O-240",
  "O-251",
  "O-252",
  "O-241",
];

/** A fresh copy makes every reset restore the exact same fictional records. */
export function createDemoRecords() {
  return VISIBLE_IDS.map((id) =>
    JSON.parse(
      JSON.stringify(HISTORICAL_CASES.find((record) => record.id === id)),
    ),
  );
}

export function getDatasetSummary() {
  const completed = HISTORICAL_CASES.filter(
    (record) => record.status === "completed",
  ).length;
  return {
    cases: HISTORICAL_CASES.length,
    events: SYNTHETIC_EVENTS.length,
    completed,
    staged: HISTORICAL_CASES.length - completed,
    visibleRecords: VISIBLE_IDS.length,
  };
}
