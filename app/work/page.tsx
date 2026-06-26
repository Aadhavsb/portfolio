import type { Metadata } from "next";
import Link from "next/link";
import { constellationOf, site } from "@/lib/site";
import type { Project } from "@/data/types";

export const metadata: Metadata = {
  title: "Work — Aadhav Bharadwaj",
  description: "Index of projects, internships, and research.",
};

function Card({ p }: { p: Project }) {
  const href = p.caseStudyPath || p.links?.demo || p.links?.github || null;
  const internal = p.caseStudyPath;
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
  if (!href) return <div className="work-card">{inner}</div>;
  if (internal) return <Link className="work-card" href={href}>{inner}</Link>;
  return (
    <a className="work-card" href={href} target="_blank" rel="noreferrer">
      {inner}
    </a>
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
        The same systems as the star map, in a plain list. Featured stars open full case studies;
        the rest link to source.
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
            <div className="work-card" key={r.id}>
              <div className="wk-kind" style={{ color: "#ffcf7a" }}>Experience</div>
              <div className="wk-title">{r.org}</div>
              <div className="wk-hook">{r.role} · {r.period}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
