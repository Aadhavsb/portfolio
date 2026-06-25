import siteRaw from "@/data/site.json";
import type { Experience, Project, SiteData } from "@/data/types";

export const site = siteRaw as SiteData;

export function findProjectByCaseSlug(slug: string): Project | undefined {
  return site.projects.find(
    (p) => p.caseStudyPath && p.caseStudyPath.split("/").pop() === slug
  );
}

export function findExperience(id: string): Experience | undefined {
  return site.experience.find((r) => r.id === id);
}

export function constellationOf(p: Project): string | null {
  return p.constellation ?? (p.tier === "gallery" ? "shelf" : p.tier === "labs" ? "lab" : null);
}
