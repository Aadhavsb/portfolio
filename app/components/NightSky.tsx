"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { trapFocus } from "@/lib/focus-trap";
import {
  appendMetrics,
  appendTags,
  linkActions,
  projectActions,
  renderSpotlight,
  setRoleFooter,
} from "@/lib/sky-ui";
import { bootNightSky } from "@/lib/night-sky-boot";

function EmailLink({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    },
    [email]
  );

  return (
    <a
      href={`mailto:${email}`}
      title={email}
      className={copied ? "email-copied" : undefined}
      aria-label={copied ? "Email copied to clipboard" : `Email ${email}`}
      onClick={onClick}
    >
      {copied ? "Copied!" : "Email"}
    </a>
  );
}

export default function NightSky() {
  useEffect(
    () =>
      bootNightSky(site, {
        trapFocus,
        renderSpotlight,
        appendMetrics,
        appendTags,
        linkActions,
        setRoleFooter,
        projectActions,
      }),
    []
  );

  return (
    <>
      <canvas id="sky" />
      <div id="scrim" />

      <div id="thesisveil" />
      <div id="thesis">
        <div className="t">Software you can measure, trace, and ship.</div>
        <div className="sub">A constellation of measurable work</div>
      </div>

      <div id="hint"><span className="pulse" /> hover to trace links · click to open</div>
      <p id="sky-ps" className="sky-ps" aria-hidden="true">ps — bored? grab a star and pull the map around.</p>
      <div id="tip"><span className="nm" /><span className="tier" /></div>

      <div className="hud" id="idblock">
        <div className="eyebrow"><span className="dot" /><span className="label">Software Engineer · LLM Systems · Full-Stack</span></div>
        <h1 id="name">Aadhav Bharadwaj</h1>
        <p id="role">CS &amp; Math @ CWRU. Production LLM infrastructure, hybrid RAG, eval pipelines, and shipped full-stack systems.</p>
      </div>

      <div className="hud" id="links">
        <a id="resume" href="/resume.pdf" target="_blank" rel="noreferrer">Résumé
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </a>
        <div id="social">
          <EmailLink email={site.meta.email} />
          <a href="https://www.linkedin.com/in/aadhav-bharadwaj/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/Aadhavsb" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <div className="hud" id="legend">
        <div className="head">
          <span className="chev">▼</span><span className="label">How to read</span>
        </div>
        <ul>
          <li><span className="s" style={{width:"12px",height:"12px",background:"var(--exp)",boxShadow:"0 0 9px var(--exp)"}} /> Featured experience (big)</li>
          <li><span className="s" style={{width:"12px",height:"12px",background:"var(--proj)",boxShadow:"0 0 9px var(--proj)"}} /> Featured project (big)</li>
          <li><span className="s" style={{width:"8px",height:"8px",background:"var(--exp)"}} /> Experience — not featured</li>
          <li><span className="s" style={{width:"8px",height:"8px",background:"var(--proj)"}} /> Project — gallery / lab</li>
          <li><span className="s" style={{width:"6px",height:"6px",background:"var(--skill)"}} /> Skill / tech (size = reach)</li>
        </ul>
      </div>

      <div className="hud" id="controls">
        <button id="readme-btn"><span className="q">?</span><span>Readme</span></button>
        <button id="motion"><span className="ind" /><span>Motion</span></button>
        <Link href="/work" style={{color:"var(--muted)",textDecoration:"none",fontSize:"11px",letterSpacing:".12em",textTransform:"uppercase"}}>Work index</Link>
      </div>

      <aside id="panel" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Project details">
        <div className="ptop">
          <div>
            <div className="ey"><span className="cdot" id="p-cdot" /><span className="cname" id="p-cname" /></div>
            <div className="pspan" id="p-span" />
            <h2 id="p-title" />
          </div>
          <button className="close" id="p-close" aria-label="Close">✕</button>
        </div>
        <p className="hook" id="p-hook" />
        <div id="p-metricwrap"><div className="sec-label">Signals</div><div className="metrics" id="p-metrics" /></div>
        <div id="p-tagwrap"><div className="sec-label" id="p-taglabel">Stack</div><div className="tags" id="p-tags" /></div>
        <div id="p-rolewrap" style={{display:"none"}}><div className="sec-label">Experience</div><div className="role-foot" id="p-rolefoot" /></div>
        <div className="pacts" id="p-acts" />
      </aside>

      <div id="spot" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Featured project">
        <div className="card" id="spot-card" />
      </div>

      <div id="readme" aria-hidden="true">
        <div className="card" role="dialog" aria-label="How to read this portfolio">
          <div className="kicker"><span className="dot" /><span>60-second guide</span></div>
          <h1>Interactive portfolio — not a scroll page</h1>
          <p className="lede">I&apos;m <strong>Aadhav Bharadwaj</strong> (CS &amp; Math, CWRU). Each star is work I&apos;ve shipped — internships, projects, and the tech behind them. <strong>Size</strong> = how central; <strong>color</strong> = what kind.</p>

          <div className="rd-legend" aria-label="Star legend">
            <div className="rd-item">
              <div className="rd-stars"><span className="rd-star rd-big rd-exp" aria-hidden="true" /></div>
              <div className="rd-label"><b>Large · yellow</b>Featured internship or role</div>
            </div>
            <div className="rd-item">
              <div className="rd-stars"><span className="rd-star rd-big rd-proj" aria-hidden="true" /></div>
              <div className="rd-label"><b>Large · purple</b>Featured project (flagship builds)</div>
            </div>
            <div className="rd-item">
              <div className="rd-stars"><span className="rd-star rd-sm rd-exp" aria-hidden="true" /></div>
              <div className="rd-label"><b>Small · yellow</b>Experience — not featured</div>
            </div>
            <div className="rd-item">
              <div className="rd-stars"><span className="rd-star rd-sm rd-proj" aria-hidden="true" /></div>
              <div className="rd-label"><b>Small · purple</b>More projects &amp; research</div>
            </div>
            <div className="rd-item">
              <div className="rd-stars"><span className="rd-star rd-xs rd-skill" aria-hidden="true" /></div>
              <div className="rd-label"><b>Red specks</b>Skills &amp; tools (hover the graph)</div>
            </div>
          </div>

          <p className="rd-tip"><b>Try this:</b> click a large star for the full story (metrics + stack). Hover any star to see what connects. Résumé &amp; LinkedIn — top right.</p>

          <div className="actions">
            <button className="enter" id="rd-enter">Explore the map
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <label className="dna"><input type="checkbox" id="rd-dna" /> Don&apos;t show again</label>
          </div>
          <p className="rd-ps">ps — bored? grab a star and pull the whole map around.</p>
        </div>
      </div>
    </>
  );
}
