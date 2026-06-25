export type StarKind = "experience" | "project";
export type ProjectTier = "featured" | "gallery" | "labs";

export interface Metric {
  label: string;
  value: string;
  tag?: string;
}

export interface ProjectLinks {
  github?: string;
  demo?: string;
}

export interface Project {
  id: string;
  tier: ProjectTier;
  title: string;
  subtitle?: string;
  hook?: string;
  writeup?: string;
  stack?: string[];
  metrics?: Metric[];
  metricsPinned?: Metric[];
  metricsScroll?: Metric[];
  links?: ProjectLinks;
  caseStudyPath?: string;
  spanName?: string;
  constellation?: string;
  starKind: StarKind;
  linkedExperience?: string;
}

export interface Experience {
  id: string;
  role: string;
  org: string;
  period: string;
  location?: string;
  skyStarId?: string | null;
  onSky?: boolean;
  skyTier?: ProjectTier;
  skyTitle?: string;
  constellation?: string;
  hook?: string;
  stack?: string[];
  highlights: string[];
  linkedProjects?: string[];
}

export interface Skill {
  id: string;
  label: string;
  links?: string[];
  writeup?: string;
}

export interface SiteMeta {
  name: string;
  title: string;
  description: string;
  email: string;
  linkedin: string;
  github: string;
  resumePath: string;
  thesis: string;
}

export interface SiteData {
  meta: SiteMeta;
  visual?: {
    tierScale?: Partial<Record<ProjectTier, number>>;
  };
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
}
