import Image from "next/image";
import type { CaseStudy, CaseStudySection, Metric } from "@/data/types";

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="cs-metrics cs-metrics--section">
      {metrics.map((m) => (
        <div className="m" key={`${m.label}-${m.value}`}>
          <div className="v">{m.value}</div>
          <div className="k">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

function SectionBlock({ section }: { section: CaseStudySection }) {
  return (
    <section className="work-section cs-block" id={section.id}>
      <h2>{section.title}</h2>
      {section.body && <p className="cs-writeup">{section.body}</p>}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="cs-bullets">
          {section.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {section.pre && <pre className="cs-pre">{section.pre}</pre>}
      {section.image && (
        <figure className="cs-figure">
          <Image
            src={section.image}
            alt={section.imageAlt ?? ""}
            width={920}
            height={520}
            className="cs-figure-img"
          />
          {section.caption && <figcaption className="cs-caption">{section.caption}</figcaption>}
        </figure>
      )}
      {section.metrics && section.metrics.length > 0 && (
        <MetricGrid metrics={section.metrics} />
      )}
      {section.callout && <p className="cs-callout">{section.callout}</p>}
    </section>
  );
}

export function CaseStudyBody({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <>
      {caseStudy.corpusNote && (
        <p className="cs-corpus-note">{caseStudy.corpusNote}</p>
      )}
      {caseStudy.sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </>
  );
}
