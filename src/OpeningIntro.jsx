import React, { useEffect, useRef, useState } from "react";
import { Arrow } from "./ui.jsx";
import "./opening.css";

export default function OpeningIntro({ motion, onEnter }) {
  const stage = useRef(null), video = useRef(null), entered = useRef(false);
  const [ready, setReady] = useState(!motion), [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = video.current;
    let alive = true;
    const timer = setTimeout(() => setReady(true), 3500);
    Promise.all([document.fonts.ready, v.readyState >= 2 ? Promise.resolve() : new Promise(resolve => v.addEventListener("loadeddata", resolve, { once: true }))]).then(() => alive && setReady(true));
    if (motion) v.play().catch(() => setPlaying(false));
    else { v.pause(); setReady(true); }
    return () => { alive = false; clearTimeout(timer); v.pause(); };
  }, [motion]);
  useEffect(() => {
    if (!ready || !motion || entered.current) return;
    entered.current = true;
    const animations = [];
    stage.current.querySelectorAll("[data-intro-enter]").forEach(el => {
      const title = el.classList.contains("opening-line");
      animations.push(el.animate([{opacity:0, transform:`translateY(${title ? "115%" : "14px"})`},{opacity:1,transform:"translateY(0)"}], {duration:title ? 1050 : 800,delay:Number(el.dataset.introEnter),easing:"cubic-bezier(.16,1,.3,1)",fill:"backwards"}));
    });
    return () => animations.forEach(a => a.cancel());
  }, [ready, motion]);
  function enterHero(auto = false) {
    if (auto && (!motion || window.scrollY > 60 || document.hidden)) return;
    onEnter();
  }
  function toggle() {
    const v = video.current;
    if (v.ended || v.paused) {
      if(v.ended) v.currentTime = 0;
      v.play().catch(() => setPlaying(false));
    } else v.pause();
  }
  return <section ref={stage} className={`opening-intro ${ready ? "is-ready" : "is-waiting"}`} aria-label="FlowBackTest garden introduction">
    <video ref={video} className="opening-video" src="/media/intro/garden-gates.mp4" poster="/media/intro/garden-gates-poster.png" autoPlay={motion} muted playsInline preload="auto" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);enterHero(true);}} aria-hidden="true" />
    <div className="opening-shade opening-horizontal"/><div className="opening-shade opening-vertical"/><div className="opening-shade opening-corner"/>
    <button className="opening-playback" onClick={toggle} aria-label={playing ? "Pause garden introduction" : "Replay garden introduction"} aria-pressed={playing}>{playing ? "Ⅱ" : "↻"}</button>
    <div className="opening-copy">
      <p className="opening-brand" data-intro-enter="300">FlowBackTest</p>
      <h2 className="opening-title">{["Before the agent.","Before the handoff.","A clearer path."].map((line,i)=><span className="opening-mask" key={line}><span className="opening-line" data-intro-enter={380+i*90}>{line}</span></span>)}</h2>
      <p className="opening-lede"><span data-intro-enter="800">Explore the paths an agent could change.</span><span data-intro-enter="860">Backtest the assumptions before rollout.</span></p>
      <div className="opening-actions"><a className="opening-cta" data-intro-enter="1000" href="/study">Backtest one deployment <span><Arrow/></span></a><a className="opening-text" data-intro-enter="1100" href="/demo">Explore the demo <Arrow/></a></div>
    </div>
    <button className="opening-cue" data-intro-enter="1250" onClick={()=>enterHero()}>Enter the garden <span>⌄</span></button>
    <span className="opening-note">Research-stage concept preview</span>
  </section>;
}
