import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { createRoot } from "react-dom/client";
import Home from "./Home.jsx";
import Study from "./Study.jsx";
import { Arrow } from "./ui.jsx";
const Pages = lazy(() => import("./Pages.jsx"));
const Demo = lazy(() => import("./Demo.jsx"));
import {
  track,
  setConsent,
  getTelemetry,
  clearDemoData,
  downloadJSON,
} from "./telemetry.js";
import "./styles.css";
function Header({ path, motion, setMotion }) {
  const [open, setOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    const f = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  return (
    <header
      className={`site-header ${scrolled ? "is-scrolled" : ""} ${open || menu ? "is-open" : ""}`}
    >
      <a className="wordmark" href="/" aria-label="FlowBackTest home">
        <img
          src="/media/logo/flowbacktest-wordmark-primary.svg"
          alt="FlowBackTest"
          width="217"
          height="34"
        />
      </a>
      <nav
        className={`desktop-nav ${menu ? "mobile-open" : ""}`}
        aria-label="Main navigation"
      >
        <button
          aria-expanded={open}
          aria-controls="product-menu"
          className={path.startsWith("/product") ? "active" : ""}
          onClick={() => setOpen(!open)}
        >
          The product <span className={open ? "turn" : ""}>+</span>
        </button>
        <a
          href="/method"
          aria-current={path === "/method" ? "page" : undefined}
        >
          Our method
        </a>
        <a href="/data" aria-current={path === "/data" ? "page" : undefined}>
          Data & trust
        </a>
        <a
          href="/pricing"
          aria-current={path === "/pricing" ? "page" : undefined}
        >
          Pricing
        </a>
        <a className="mobile-study" href="/sign-in">
          Demo sign-in
        </a>
        <a className="mobile-study" href="/study">
          Request a study <Arrow />
        </a>
      </nav>
      <div className="header-actions">
        <a href="/sign-in" className="header-signin">
          Sign in
        </a>
        <button
          className="motion-toggle"
          onClick={() => setMotion(!motion)}
          aria-pressed={!motion}
          title={motion ? "Reduce motion" : "Enable motion"}
        >
          {motion ? (
            <>
              <span>◌</span> Motion on
            </>
          ) : (
            <>
              <span>○</span> Motion off
            </>
          )}
        </button>
        <a className="btn small" href="/study">
          Request a study <Arrow />
        </a>
        <button
          className="menu-toggle"
          aria-expanded={menu}
          aria-label={menu ? "Close navigation" : "Open navigation"}
          onClick={() => {
            setMenu(!menu);
            setOpen(false);
          }}
        >
          {menu ? "Close" : "Menu"} <span>{menu ? "−" : "+"}</span>
        </button>
      </div>
      {open && (
        <div id="product-menu" className="mega-menu">
          <div className="mega-intro">
            <span className="eyebrow">Five proposed modules</span>
            <h3>
              One considered
              <br />
              workspace.
            </h3>
            <a href="/product">
              Explore the platform <Arrow />
            </a>
            <a href="/demo">
              Enter the synthetic demo <Arrow />
            </a>
          </div>
          <div className="mega-links">
            {[
              ["desk", "Workflow Desk", "Find the process in your evidence."],
              ["review", "Workflow Review", "Shape an agent handoff."],
              ["proof", "Workflow Proof", "Test the possible outcomes."],
              [
                "signal",
                "Workflow Signal",
                "Inspect exception and control paths.",
              ],
              ["report", "Workflow Report", "Compare prediction with reality."],
            ].map(([slug, title, desc], i) => (
              <a href={"/product/" + slug} key={slug}>
                <span className="mini-number">0{i + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </div>
                <Arrow diagonal />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
function Footer({ motion }) {
  const [social, setSocial] = useState(null);
  const footer = useRef();
  useEffect(() => {
    if (!motion) return;
    const ctx = gsap.context(() => {
      gsap.utils
        .toArray(
          ".footer-invitation > *, .footer-identity, .footer-group, .footer-brand-display",
        )
        .forEach((el, i) => {
          gsap.from(el, {
            x: (i % 2 ? 1 : -1) * (innerWidth < 600 ? 24 : 60),
            opacity: 0.15,
            duration: 0.8,
            delay: (i % 3) * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 94%",
              end: "bottom 5%",
              toggleActions: "play reverse play reverse",
            },
          });
        });
    }, footer);
    return () => ctx.revert();
  }, [motion]);
  return (
    <footer className="site-footer" ref={footer}>
      <div className="footer-invitation">
        <div>
          <span className="eyebrow">
            One process. A more considered next step.
          </span>
          <h2>
            Better questions.
            <br />
            <em>Clearer possibilities.</em>
          </h2>
        </div>
        <a className="footer-study-link" href="/study">
          Start with one decision <Arrow diagonal />
        </a>
      </div>
      <div className="footer-top">
        <div className="footer-identity">
          <a href="/">
            <img
              src="/media/logo/flowbacktest-monogram-reverse.svg"
              alt="FlowBackTest"
              width="54"
              height="54"
            />
          </a>
          <p>
            Model the handoff.
            <br />
            Return to the evidence.
          </p>
          <span className="eyebrow">Research-stage concept preview</span>
          <div className="socials">
            <button
              aria-label="LinkedIn profile status"
              onClick={() => setSocial("LinkedIn")}
            >
              <img src="/media/icons/linkedin-official.png" alt="" />
            </button>
            <button
              aria-label="Crunchbase profile status"
              onClick={() => setSocial("Crunchbase")}
            >
              <img src="/media/icons/crunchbase-icon-official.png" alt="" />
            </button>
          </div>
          {social && (
            <div className="social-note" role="status">
              {social} company profile is not connected in this demo.{" "}
              <button
                onClick={() => setSocial(null)}
                aria-label="Dismiss profile status"
              >
                ×
              </button>
            </div>
          )}
        </div>
        {[
          [
            "Product",
            [
              ["Platform", "/product"],
              ["Workflow Desk", "/product/desk"],
              ["Workflow Review", "/product/review"],
              ["Workflow Proof", "/product/proof"],
              ["Workflow Signal", "/product/signal"],
              ["Workflow Report", "/product/report"],
            ],
          ],
          [
            "Explore",
            [
              ["Our method", "/method"],
              ["Synthetic demo", "/demo"],
              ["Data & trust", "/data"],
              ["Who it is for", "/solutions"],
              ["Hypothesis pricing", "/pricing"],
              ["Worksheets", "/resources"],
            ],
          ],
          [
            "Company",
            [
              ["Our purpose", "/about"],
              ["Contact", "/contact"],
              ["Request a study", "/study"],
              ["Demo sign-in", "/sign-in"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
            ],
          ],
        ].map(([name, links]) => (
          <div className="footer-group" key={name}>
            <h3>{name}</h3>
            {links.map(([text, url]) => (
              <a key={url} href={url}>
                {text}
              </a>
            ))}
          </div>
        ))}
      </div>
      <a
        className="footer-brand-display"
        href="/"
        aria-label="FlowBackTest home"
      >
        <img
          src="/media/logo/flowbacktest-wordmark-reverse.svg"
          alt=""
          width="1100"
          height="172"
        />
        <span>People · Processes · A clearer path</span>
      </a>
      <div className="footer-bottom">
        <span>© 2026 FlowBackTest</span>
        <span>All product views use synthetic example data.</span>
        <a href="/privacy">Privacy & demo data</a>
      </div>
    </footer>
  );
}
function Preferences() {
  const [open, setOpen] = useState(false),
    [state, setState] = useState(getTelemetry()),
    [deleted, setDeleted] = useState(false);
  useEffect(() => {
    const f = () => setState(getTelemetry());
    window.addEventListener("flowbacktest:telemetry-updated", f);
    return () =>
      window.removeEventListener("flowbacktest:telemetry-updated", f);
  }, []);
  return (
    <>
      <button
        className="preferences"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Demo preferences
      </button>
      {open && (
        <aside className="preferences-panel" aria-label="Demo preferences">
          <button
            className="panel-close"
            onClick={() => setOpen(false)}
            aria-label="Close preferences"
          >
            ×
          </button>
          <span className="eyebrow">Local demo controls</span>
          <h3>Your preview. Your choice.</h3>
          <p>
            Optional interaction events stay in this tab’s memory. No cookies,
            tracking service or lead submission.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={state.consent}
              onChange={(e) => setConsent(e.target.checked)}
            />{" "}
            Allow local demo event recording
          </label>
          <div className="prefs-actions">
            <button
              className="btn secondary"
              onClick={() =>
                downloadJSON("FlowBackTest-DEMO-events.json", getTelemetry())
              }
            >
              Export demo events <Arrow />
            </button>
            <button
              className="text-link"
              onClick={() => {
                clearDemoData();
                setDeleted(true);
              }}
            >
              Clear data & revoke consent
            </button>
          </div>
          <p role="status">
            {deleted
              ? "Demo draft and local events cleared."
              : `${state.events.length} local demo events. Refreshing clears tab memory.`}
          </p>
        </aside>
      )}
    </>
  );
}
function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const [motion, setMotion] = useState(
    () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)"),
      f = (e) => setMotion(!e.matches);
    q.addEventListener("change", f);
    const onEvent = (e) => track(e.detail?.event || e.detail?.name, e.detail);
    window.addEventListener("flowbacktest:event", onEvent);
    return () => {
      q.removeEventListener("change", f);
      window.removeEventListener("flowbacktest:event", onEvent);
    };
  }, []);
  const demo = path.startsWith("/demo");
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!demo && <Header path={path} motion={motion} setMotion={setMotion} />}
      <main id="main">
        <Suspense
          fallback={
            <div className="page-loading" role="status">
              Preparing the preview…
            </div>
          }
        >
          {path === "/" ? (
            <Home motion={motion} />
          ) : path === "/study" ? (
            <Study />
          ) : demo ? (
            <Demo />
          ) : (
            <Pages path={path} />
          )}
        </Suspense>
      </main>
      {!demo && <Footer motion={motion} />}
      <Preferences />
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
