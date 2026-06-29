import type { Metadata } from "next";
import Link from "next/link";
import { constellationOf, experienceHref, projectHref, site } from "@/lib/site";
import type { Experience, Project } from "@/data/types";

export const metadata: Metadata = {
  title: "Work — Aadhav Bharadwaj",
  description: "Index of projects, internships, and research.",
};

function Card({ p }: { p: Project }) {
  const con = constellationOf(p);
  const kindColor = p.starKind === "experience" ? "#ffcf7a" : "#a78bfa";
  const inner = (
    <>
      <div className="wk-kind" style={{ color: kindColor }}>
        {p.starKind === "experience" ? "Experience" : "Project"}
        {con ? ` · ${con}` : ""}
      </div>
      <div className="wk-title">{p.title}</div>
      <div className="wk-hook">{p.hook}</div>
    </>
  );
  return (
    <Link className="work-card" href={projectHref(p)}>
      {inner}
    </Link>
  );
}

function ExperienceCard({ r }: { r: Experience }) {
  return (
    <Link className="work-card" href={experienceHref(r)}>
      <div className="wk-kind" style={{ color: "#ffcf7a" }}>Experience</div>
      <div className="wk-title">{r.org}</div>
      <div className="wk-hook">
        {r.hook ?? `${r.role} · ${r.period}`}
      </div>
    </Link>
  );
}

export default function WorkIndex() {
  const featured = site.projects.filter((p) => p.tier === "featured");
  const more = site.projects.filter((p) => p.tier !== "featured");

  return (
    <main className="work-wrap">
      <Link className="work-back" href="/">← Back to the sky</Link>
      <h1 className="work-h1">Work</h1>
      <p className="work-lede">
        The same systems as the star map, as plain writeup pages — overview, metrics,
        and stack. Featured entries with deep dives include extra case-study sections.
      </p>

      <section className="work-section">
        <h2>Featured</h2>
        <div className="work-grid">{featured.map((p) => <Card key={p.id} p={p} />)}</div>
      </section>

      <section className="work-section">
        <h2>Projects &amp; research</h2>
        <div className="work-grid">{more.map((p) => <Card key={p.id} p={p} />)}</div>
      </section>

      <section className="work-section">
        <h2>Experience</h2>
        <div className="work-grid">
          {site.experience.map((r) => (
            <ExperienceCard key={r.id} r={r} />
          ))}
        </div>
      </section>
    </main>
  );
}
