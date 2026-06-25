import type { Metric, Project } from "@/data/types";

const SAFE_URL = /^(https?:\/\/|\/|mailto:)/;

export function isSafeUrl(url: string): boolean {
  return SAFE_URL.test(url);
}

export function clearEl(el: HTMLElement): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function textEl(tag: string, text: string, className?: string): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

export function appendTags(container: HTMLElement, items: string[]): void {
  clearEl(container);
  for (const item of items) container.appendChild(textEl("span", item));
}

export function appendMetrics(container: HTMLElement, metrics: Metric[]): void {
  clearEl(container);
  for (const m of metrics) {
    const card = document.createElement("div");
    card.className = "m";
    card.appendChild(textEl("div", m.value, "v"));
    card.appendChild(textEl("div", m.label, "k"));
    container.appendChild(card);
  }
}

export function appendPinnedMetrics(container: HTMLElement, metrics: Metric[]): void {
  clearEl(container);
  for (const m of metrics) {
    const card = document.createElement("div");
    card.className = "pm";
    card.appendChild(textEl("div", m.value, "pv"));
    card.appendChild(textEl("div", m.label, "pk"));
    container.appendChild(card);
  }
}

export function appendMetricStrip(container: HTMLElement, metrics: Metric[]): void {
  clearEl(container);
  for (const m of metrics) {
    const card = document.createElement("div");
    card.className = "sc";
    card.appendChild(textEl("div", m.value, "sv"));
    card.appendChild(textEl("div", m.label, "sk"));
    if (m.tag) card.appendChild(textEl("span", m.tag, "st"));
    container.appendChild(card);
  }
}

export function linkActions(
  container: HTMLElement,
  actions: { label: string; href: string; primary?: boolean }[]
): void {
  clearEl(container);
  for (const { label, href, primary } of actions) {
    const a = document.createElement("a");
    a.className = primary ? "primary" : "";
    if (isSafeUrl(href)) {
      a.href = href;
      if (href.startsWith("http")) {
        a.target = "_blank";
        a.rel = "noreferrer";
      }
    } else {
      a.href = "#";
      a.addEventListener("click", (e) => e.preventDefault());
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "13");
    svg.setAttribute("height", "13");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 12h14M13 6l6 6-6 6");
    svg.appendChild(path);
    a.appendChild(document.createTextNode(`${label} `));
    a.appendChild(svg);
    container.appendChild(a);
  }
}

export function projectActions(p: Pick<Project, "caseStudyPath" | "links">): { label: string; href: string; primary?: boolean }[] {
  const out: { label: string; href: string; primary?: boolean }[] = [];
  if (p.caseStudyPath) out.push({ label: "Open case study", href: p.caseStudyPath, primary: true });
  if (p.links?.github) out.push({ label: "GitHub", href: p.links.github });
  if (p.links?.demo) out.push({ label: "Live demo", href: p.links.demo });
  return out;
}

export function setRoleFooter(el: HTMLElement, role: { role: string; org: string; period: string }): void {
  clearEl(el);
  const b = document.createElement("b");
  b.textContent = role.role;
  el.appendChild(b);
  el.appendChild(document.createTextNode(` · ${role.org}`));
  el.appendChild(document.createElement("br"));
  el.appendChild(document.createTextNode(role.period));
}

export interface SpotlightInput {
  title: string;
  subtitle?: string;
  hook?: string;
  writeup?: string;
  spanName?: string;
  id: string;
  starKind?: string;
  color: string;
  stack?: string[];
  metricsPinned?: Metric[];
  metricsScroll?: Metric[];
  metrics?: Metric[];
  constellationName?: string;
  constellationColor?: string;
  actions: { label: string; href: string; primary?: boolean }[];
}

export function renderSpotlight(card: HTMLElement, data: SpotlightInput, onClose: () => void): void {
  clearEl(card);

  const top = document.createElement("div");
  top.className = "sp-top";

  const head = document.createElement("div");
  const kicker = document.createElement("div");
  kicker.className = "sp-kicker";

  if (data.constellationName && data.constellationColor) {
    const cname = document.createElement("span");
    cname.className = "sp-cname";
    const dot = document.createElement("span");
    dot.style.display = "inline-block";
    dot.style.width = "7px";
    dot.style.height = "7px";
    dot.style.borderRadius = "50%";
    dot.style.background = data.constellationColor;
    dot.style.boxShadow = `0 0 8px ${data.constellationColor}`;
    dot.style.marginRight = "7px";
    dot.style.verticalAlign = "middle";
    cname.appendChild(dot);
    cname.appendChild(document.createTextNode(data.constellationName));
    kicker.appendChild(cname);
  }

  const chip = document.createElement("span");
  chip.className = "sp-chip";
  chip.style.color = data.color;
  chip.textContent = data.starKind === "experience" ? "Experience" : "Project";
  kicker.appendChild(chip);
  head.appendChild(kicker);

  if (data.subtitle) head.appendChild(textEl("div", data.subtitle, "sp-sub"));
  head.appendChild(textEl("h2", data.title));
  head.appendChild(textEl("div", `// ${data.spanName || data.id}`, "sp-span mono"));

  const closeBtn = document.createElement("button");
  closeBtn.className = "close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", onClose);

  top.appendChild(head);
  top.appendChild(closeBtn);
  card.appendChild(top);

  if (data.hook) card.appendChild(textEl("p", data.hook, "sp-hook"));
  if (data.writeup) card.appendChild(textEl("p", data.writeup, "sp-writeup"));

  const pinned = data.metricsPinned?.length
    ? data.metricsPinned
    : (data.metrics || []).slice(0, 2);
  if (pinned.length) {
    const wrap = document.createElement("div");
    wrap.className = "sp-pinned";
    appendPinnedMetrics(wrap, pinned);
    card.appendChild(wrap);
  }

  const scroll = data.metricsScroll?.length
    ? data.metricsScroll
    : (data.metrics || []).slice(2);
  if (scroll.length) {
    card.appendChild(textEl("div", "More signals →", "sp-striplabel"));
    const strip = document.createElement("div");
    strip.className = "sp-strip";
    appendMetricStrip(strip, scroll);
    card.appendChild(strip);
  }

  if (data.stack?.length) {
    const sec = document.createElement("div");
    sec.className = "sp-sec";
    sec.appendChild(textEl("div", "Stack", "sec-label"));
    const tags = document.createElement("div");
    tags.className = "tags";
    appendTags(tags, data.stack);
    sec.appendChild(tags);
    card.appendChild(sec);
  }

  if (data.actions.length) {
    const acts = document.createElement("div");
    acts.className = "sp-acts";
    linkActions(acts, data.actions);
    card.appendChild(acts);
  }
}
