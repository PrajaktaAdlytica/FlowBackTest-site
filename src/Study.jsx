import React, { useState, useEffect } from "react";
import { Arrow } from "./ui.jsx";
import {
  track,
  saveDraft,
  getDraft,
  clearDemoData,
  downloadJSON,
} from "./telemetry.js";
const sample = {
  name: "Alex Morgan",
  email: "alex@example.com",
  company: "Kestrel Wholesale (fictional)",
  role: "Process excellence director",
  process: "Order-to-cash",
  owner: "Jordan Hale — ERP process owner (fictional)",
  date: "2026-11-16",
  stack: "Existing process-mining workflow",
  decision: "Where to insert agent triage before human credit review.",
  optin: false,
  consent: false,
};
const emptyForm = {
  name: "",
  email: "",
  company: "",
  role: "",
  process: "Order-to-cash",
  owner: "",
  date: "",
  stack: "",
  decision: "",
  optin: false,
  consent: false,
};
export default function Study() {
  const [values, setValues] = useState(emptyForm),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const f = () => {
      setDone(false);
      setValues(emptyForm);
      setError("");
    };
    window.addEventListener("flowbacktest:clear-data", f);
    return () => window.removeEventListener("flowbacktest:clear-data", f);
  }, []);
  function field(key) {
    return {
      value: values[key],
      onChange: (e) => {
        setValues({ ...values, [key]: e.target.value });
        track("form_start");
        setError("");
      },
    };
  }
  function submit(e) {
    e.preventDefault();
    if (!values.consent) {
      setError("Please agree to the local demo-data notice.");
      return;
    }
    saveDraft(values);
    track("form_submit", { eventId: "demo-study-submit" });
    setDone(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <div className="study-page">
      <div className="study-intro">
        <span className="eyebrow">A decision-specific planning study</span>
        <h1>
          Start with
          <br />
          one real question.
        </h1>
        <p className="lead">
          Which agent handoff are you considering—and what would you need to see
          before rollout?
        </p>
        <div className="study-boundary">
          <span className="badge">Demo form · no submission</span>
          <p>
            Use fictional details to explore this flow. Your draft stays in this
            tab’s memory and clears on refresh. Nothing is sent.
          </p>
          <button
            className="text-link"
            onClick={() => {
              setValues(sample);
              setDone(false);
            }}
          >
            Use sample details <Arrow />
          </button>
        </div>
        <ol className="study-steps">
          <li>
            <b>01</b>
            <span>Name a pending decision.</span>
          </li>
          <li>
            <b>02</b>
            <span>Bring the process owner and budget owner.</span>
          </li>
          <li>
            <b>03</b>
            <span>Agree the evidence and holdout test.</span>
          </li>
        </ol>
        <p className="fine">
          The first proposed engagement is a one-process backtest study. Prices,
          willingness to pay and predictive accuracy remain unvalidated.
        </p>
      </div>
      <div className="study-form-panel">
        {done ? (
          <section className="form-success" aria-live="polite">
            <span className="success-seal" aria-hidden="true">
              ✓
            </span>
            <span className="eyebrow">Demo draft prepared</span>
            <h2>
              Your question
              <br />
              has a starting point.
            </h2>
            <p>
              <strong>Nothing was submitted.</strong> This preview has saved a
              draft locally in this tab. A future study would require a paid
              sponsor, consented logs and agreed criteria.
            </p>
            <dl>
              <div>
                <dt>Process</dt>
                <dd>{values.process}</dd>
              </div>
              <div>
                <dt>Decision date</dt>
                <dd>{values.date || "Not provided"}</dd>
              </div>
              <div>
                <dt>Log owner</dt>
                <dd>{values.owner}</dd>
              </div>
            </dl>
            <button
              className="btn"
              onClick={() =>
                downloadJSON("FlowBackTest-DEMO-study-draft.json", getDraft())
              }
            >
              Download demo draft <Arrow />
            </button>
            <button className="text-link" onClick={() => setDone(false)}>
              Edit draft
            </button>
            <button
              className="text-link"
              onClick={() => {
                clearDemoData();
                setDone(false);
              }}
            >
              Delete draft
            </button>
            <a href="/demo" className="text-link">
              Explore the synthetic workspace <Arrow />
            </a>
          </section>
        ) : (
          <form onSubmit={submit}>
            <div className="form-heading">
              <span className="eyebrow">Study request preview</span>
              <span className="fine">* Required fields</span>
            </div>
            <div className="form-row">
              <label>
                Full name *
                <input autoComplete="off" required {...field("name")} />
              </label>
              <label>
                Work email *
                <input
                  type="email"
                  autoComplete="off"
                  required
                  placeholder="alex@example.com"
                  {...field("email")}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Company *
                <input required autoComplete="off" {...field("company")} />
              </label>
              <label>
                Role *
                <select required {...field("role")}>
                  <option value="">Choose your role</option>
                  <option>Process excellence director</option>
                  <option>Operations VP / COO</option>
                  <option>ERP process owner</option>
                  <option>Automation lead</option>
                  <option>Process-mining consultant</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label>
              Which process would you explore? *
              <input required {...field("process")} />
            </label>
            <label>
              Who owns the event logs? *
              <input
                required
                placeholder="Role or team; no sensitive details"
                {...field("owner")}
              />
            </label>
            <div className="form-row">
              <label>
                Planned decision date *
                <input type="date" required {...field("date")} />
              </label>
              <label>
                Existing mining stack *
                <select required {...field("stack")}>
                  <option value="">Select your current approach</option>
                  <option>Celonis</option>
                  <option>UiPath Process Mining</option>
                  <option>Existing process-mining workflow</option>
                  <option>BPM simulation / consultants</option>
                  <option>Manual mapping</option>
                  <option>Unknown / no current stack</option>
                </select>
              </label>
            </div>
            <label>
              What deployment decision is pending? *
              <textarea
                required
                rows="3"
                maxLength="800"
                placeholder="For example: agent triage before human credit review."
                {...field("decision")}
              />
            </label>
            <p className="form-notice">
              No raw logs, contracts, secrets or sensitive records. This form is
              an isolated concept preview.
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={values.optin}
                onChange={(e) =>
                  setValues({ ...values, optin: e.target.checked })
                }
              />{" "}
              Optional: preview an interview opt-in (no meeting will be booked).
            </label>
            <label className="check">
              <input
                type="checkbox"
                required
                checked={values.consent}
                onChange={(e) =>
                  setValues({ ...values, consent: e.target.checked })
                }
              />{" "}
              I understand this draft is stored only in this tab’s memory and is
              not sent. <a href="/privacy">Privacy notice</a>
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button type="submit" className="btn">
              Prepare demo study request <Arrow />
            </button>
            <span className="form-footnote">
              No payment. No account. No outbound submission.
            </span>
          </form>
        )}
      </div>
    </div>
  );
}
