import siteRaw from "@/data/site.json";
import type { Experience, Project, SiteData } from "@/data/types";

export const site = siteRaw as SiteData;

/** URL slug for a project work page (`/work/[slug]`). */
export function projectWorkSlug(p: Project): string {
  const fromPath = p.caseStudyPath?.split("/").filter(Boolean).pop();
  return fromPath ?? p.id;
}

export function projectHref(p: Project): string {
  return `/work/${projectWorkSlug(p)}`;
}

export function findProjectByWorkSlug(slug: string): Project | undefined {
  return site.projects.find(
    (p) => p.id === slug || projectWorkSlug(p) === slug
  );
}

/** @deprecated use findProjectByWorkSlug */
export function findProjectByCaseSlug(slug: string): Project | undefined {
  return findProjectByWorkSlug(slug);
}

export function findExperience(id: string): Experience | undefined {
  return site.experience.find((r) => r.id === id);
}

/** Work index link for an experience row — sky star project when mapped, else role page. */
export function experienceHref(e: Experience): string {
  if (e.skyStarId) {
    const linked = findProjectByWorkSlug(e.skyStarId);
    if (linked) return projectHref(linked);
  }
  return `/work/experience/${e.id}`;
}

export function constellationOf(p: Project): string | null {
  return p.constellation ?? (p.tier === "gallery" ? "shelf" : p.tier === "labs" ? "lab" : null);
}
