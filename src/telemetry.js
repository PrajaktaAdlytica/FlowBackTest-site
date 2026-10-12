const events = [];
const seen = new Set();
let consent = false;
let draft = null;
const makeSession = () =>
  globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}`;
let session = makeSession();
const utms = Object.fromEntries(
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].map(
    (k) => [
      k,
      (() => {
        const value = new URLSearchParams(location.search).get(k);
        return value && /^[a-zA-Z0-9_.-]{1,100}$/.test(value) ? value : null;
      })(),
    ],
  ),
);
export function track(name, detail = {}) {
  if (
    !consent ||
    ![
      "landing_view",
      "demo_open",
      "demo_complete",
      "pricing_view",
      "form_start",
      "form_submit",
    ].includes(name)
  )
    return;
  const route = detail.route || detail.path || location.pathname;
  const key = `${session}:${name}:${route}:${detail.eventId || "view"}`;
  if (seen.has(key)) return;
  seen.add(key);
  events.push({
    schema_version: "1.0",
    event_id: globalThis.crypto?.randomUUID?.() || key,
    event_name: name,
    namespace: "demo.synthetic",
    synthetic: true,
    session_id: session,
    timestamp: new Date().toISOString(),
    route,
    dedupe_key: key,
    utm: utms,
    consent: { analytics: "granted", source: "demo_consent_control" },
    properties: {
      ...(route.startsWith("/demo")
        ? {
            page_type: "demo",
            demo_view: ["map", "scenarios", "backtest", "records"].includes(
              route.split("/")[2],
            )
              ? route.split("/")[2]
              : "map",
          }
        : {}),
      ...(name.startsWith("form_")
        ? {
            form_id: "study",
            ...(name === "form_submit"
              ? { submission_state: "local_draft" }
              : {}),
          }
        : {}),
      ...(name === "demo_complete"
        ? { completion_definition: "four_process_stages_viewed" }
        : {}),
    },
  });
  window.dispatchEvent(new CustomEvent("flowbacktest:telemetry-updated"));
}
export function setConsent(value) {
  consent = !!value;
  if (!consent) {
    events.length = 0;
    seen.clear();
    session = makeSession();
  }
  window.dispatchEvent(new CustomEvent("flowbacktest:telemetry-updated"));
  if (consent)
    track(
      location.pathname.startsWith("/demo")
        ? "demo_open"
        : location.pathname === "/pricing"
          ? "pricing_view"
          : "landing_view",
    );
}
export function getTelemetry() {
  return {
    mode: "DEMO — SYNTHETIC DATA",
    consent,
    events: [...events],
    destination: "Browser memory only; no server or analytics provider.",
  };
}
export function saveDraft(value) {
  draft = {
    ...value,
    mode: "DEMO — SYNTHETIC DATA",
    savedAt: new Date().toISOString(),
  };
}
export function getDraft() {
  return draft;
}
export function clearDemoData() {
  draft = null;
  events.length = 0;
  seen.clear();
  consent = false;
  session = makeSession();
  window.dispatchEvent(new CustomEvent("flowbacktest:clear-data"));
  window.dispatchEvent(new CustomEvent("flowbacktest:telemetry-updated"));
}
export function downloadJSON(name, data) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
