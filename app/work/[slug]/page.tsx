import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyBody } from "@/app/components/CaseStudyBody";
import { findExperience, findProjectByWorkSlug, site } from "@/lib/site";
import type { Metric } from "@/data/types";

const CONST_COLOR: Record<string, string> = {
  instrument: "#9bb8ff",
  presence: "#7ee0d0",
  arena: "#c2a6ff",
  platform: "#f3b14e",
  shelf: "#fde4b8",
  lab: "#bcd0ff",
};

export function generateStaticParams() {
  return site.projects.map((p) => ({
    slug: p.caseStudyPath?.split("/").filter(Boolean).pop() ?? p.id,
  }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = findProjectByWorkSlug(slug);
  if (!p) return { title: "Not found" };
  return { title: `${p.title} — Aadhav Bharadwaj`, description: p.hook };
}

export default async function CaseStudy({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = findProjectByWorkSlug(slug);
  if (!p) notFound();

  const con = p.constellation;
  const metrics: Metric[] =
    p.metricsScroll && p.metricsScroll.length > 0 ? p.metricsScroll : p.metrics ?? [];
  const role = p.linkedExperience ? findExperience(p.linkedExperience) : undefined;

  return (
    <main className="work-wrap">
      <Link className="work-back" href="/work">← All work</Link>

      <div className="work-eyebrow" style={{ marginTop: 22 }}>
        {con && (
          <span
            className="cdot"
            style={{
              background: CONST_COLOR[con] || "#a78bfa",
              boxShadow: `0 0 8px ${CONST_COLOR[con] || "#a78bfa"}`,
            }}
          />
        )}
        <span>
          {p.starKind === "experience" ? "Experience" : "Project"}
          {con ? ` · ${con}` : ""}
        </span>
      </div>
      <h1 className="work-h1">{p.title}</h1>
      {p.subtitle && <p className="work-lede" style={{ color: "#aeb6c8" }}>{p.subtitle}</p>}
      {p.hook && <p className="work-lede">{p.hook}</p>}

      {p.writeup && (
        <section className="work-section">
          <h2>Overview</h2>
          <p className="cs-writeup">{p.writeup}</p>
        </section>
      )}

      {p.caseStudy && <CaseStudyBody caseStudy={p.caseStudy} />}

      {metrics.length > 0 && (
        <section className="work-section">
          <h2>Signals</h2>
          <div className="cs-metrics">
            {metrics.map((m) => (
              <div className="m" key={`${m.label}-${m.value}`}>
                <div className="v">{m.value}</div>
                <div className="k">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {p.stack && p.stack.length > 0 && (
        <section className="work-section">
          <h2>Stack</h2>
          <div className="tags">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
        </section>
      )}

      {role && (
        <section className="work-section">
          <h2>Experience</h2>
          <div className="role-foot">
            <b>{role.role}</b> · {role.org}
            <br />
            {role.period}
          </div>
        </section>
      )}

      <section className="work-section">
        <div className="cs-acts">
          {p.links?.github && (
            <a href={p.links.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          )}
          {p.links?.demo && (
            <a href={p.links.demo} target="_blank" rel="noreferrer">Live demo ↗</a>
          )}
          <Link href="/">View on the star map →</Link>
        </div>
      </section>
    </main>
  );
}
