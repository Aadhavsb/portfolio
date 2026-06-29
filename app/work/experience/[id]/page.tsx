import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findExperience, projectHref, site } from "@/lib/site";

export function generateStaticParams() {
  return site.experience.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = findExperience(id);
  if (!r) return { title: "Not found" };
  return {
    title: `${r.role} — ${r.org} — Aadhav Bharadwaj`,
    description: r.hook ?? r.highlights[0],
  };
}

export default async function ExperienceWriteup({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = findExperience(id);
  if (!r) notFound();

  return (
    <main className="work-wrap">
      <Link className="work-back" href="/work">← All work</Link>

      <div className="work-eyebrow" style={{ marginTop: 22 }}>
        <span className="cdot" style={{ background: "#ffcf7a", boxShadow: "0 0 8px #ffcf7a" }} />
        <span>Experience</span>
      </div>
      <h1 className="work-h1">{r.org}</h1>
      <p className="work-lede" style={{ color: "#aeb6c8" }}>
        {r.role} · {r.period}
        {r.location ? ` · ${r.location}` : ""}
      </p>
      {r.hook && <p className="work-lede">{r.hook}</p>}

      {r.highlights.length > 0 && (
        <section className="work-section">
          <h2>Highlights</h2>
          <ul className="cs-bullets">
            {r.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      )}

      {r.stack && r.stack.length > 0 && (
        <section className="work-section">
          <h2>Stack</h2>
          <div className="tags">{r.stack.map((s) => <span key={s}>{s}</span>)}</div>
        </section>
      )}

      {r.linkedProjects && r.linkedProjects.length > 0 && (
        <section className="work-section">
          <h2>Related projects</h2>
          <div className="cs-acts">
            {r.linkedProjects.map((pid) => {
              const p = site.projects.find((x) => x.id === pid);
              if (!p) return null;
              return (
                <Link key={pid} href={projectHref(p)}>
                  {p.title} →
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="work-section">
        <div className="cs-acts">
          <Link href="/">View on the star map →</Link>
        </div>
      </section>
    </main>
  );
}
