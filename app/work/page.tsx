import type { Metadata } from "next";
import Link from "next/link";
import siteRaw from "@/data/site.json";

const site = siteRaw as any;

export const metadata: Metadata = {
  title: "Work — Aadhav Bharadwaj",
  description: "Index of projects, internships, and research.",
};

const CONST_COLOR: Record<string, string> = {
  instrument: "#9bb8ff", presence: "#7ee0d0", arena: "#c2a6ff",
  platform: "#f3b14e", shelf: "#fde4b8", lab: "#bcd0ff",
};
const conOf = (p: any) =>
  p.constellation || (p.tier === "gallery" ? "shelf" : p.tier === "labs" ? "lab" : null);

function Card({ p }: { p: any }) {
  const href = p.caseStudyPath || p.links?.github || p.links?.demo || null;
  const internal = p.caseStudyPath;
  const con = conOf(p);
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
  return <a className="work-card" href={href} target="_blank" rel="noreferrer">{inner}</a>;
}

export default function WorkIndex() {
  const projects = site.projects as any[];
  const featured = projects.filter((p) => p.tier === "featured");
  const more = projects.filter((p) => p.tier !== "featured");

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
          {(site.experience as any[]).map((r) => (
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
