# Night Sky — Design MVP

Interactive **design prototype** for the portfolio home. Not production code — use this to judge whether the night-sky direction looks good enough before building in Next.js + WebGL.

## Open it

```bash
cd ~/repos/portfolio/design-mvp
python3 -m http.server 8754
# → http://localhost:8754/night-sky.html
```

**Must be served over http** (it `fetch`es `site.json`) — opening the file directly
will show a load error. `site.json` is a **symlink to the canonical vault copy**
(`~/vault/portfolio/site.json`), so edits there flow straight into the prototype on refresh.

## Data model (from `site.json`)

Two axes, per the locked vault decisions:

- **Color = `starKind`** — yellow `#ffcf7a` = experience (internships), purple `#a78bfa` = project (all tiers). Skills = red `#ff7e60`. Constellation hue lives on **lines only**.
- **Size = `tier`** — featured (1.45) ≫ gallery (1.0) ≈ labs (0.92), plus a mild degree bump.
- **Roles fold into stars** via `skyStarId` (e.g. the Abeyon internship *is* the big yellow Abeyon star). `role-datta` / `role-ta` are off-sky and surface in linked project panels.
- **Skills** (42, each with a 2-sentence `writeup`) link to the projects/experiences that use them; role links resolve through `skyStarId`.

## What's in the prototype

| Feature | Status |
|---------|--------|
| Realistic starfield (sprite-blit, twinkle, nebula, grain, shooting stars) | ✅ |
| One connected graph: 11 projects + 41 skills, color by `starKind`, size by `tier` | ✅ |
| **Obsidian-style drag physics** — link/charge/collide + spring-back, gentle ambient buzz | ✅ |
| **Hover-to-trace** — light a star's web + constellation, softly dim the rest (eased) | ✅ |
| Bright same-constellation links · dim cross-constellation bridges | ✅ |
| **Featured click → center spotlight modal** (writeup · pinned-pair metrics · scroll strip) | ✅ |
| Gallery / lab / skill click → side panel (skill shows writeup + "used in") | ✅ |
| First-visit **README overlay** — recruiter 60s guide (visual legend, no scroll) | ✅ |
| Hub skill labels (RAG, Next.js, …) persistent; others on hover | ✅ |
| Camera pan on empty-sky drag | ❌ v1 |

Physics is hand-rolled (mirrors the documented force stack) — swap to
`react-force-graph-2d` at the Next.js v1 stage.

## Interact

- **Drag a star** — Obsidian-style: links tug neighbors, release → drifts back (small drift)
- **Click a featured star** — center spotlight; **click gallery/lab/skill** — side panel
- **Hover** — trace its connections + glow its constellation, dim the rest
- **README (?)** / **Motion** — bottom right · **ESC / ✕ / backdrop** closes
- Respects `prefers-reduced-motion` (pre-settled static layout, no drag)

## Planning docs (canonical)

All IA, clusters, skills, README spec, and **mermaid graphs** live in the vault:

| Doc | Path |
|-----|------|
| **Master plan (graphs)** | `~/vault/portfolio/design/night-sky-constellations.md` |
| Site copy & metrics | `~/vault/portfolio/site.json` |
| Active status | `~/vault/portfolio/CURRENT.md` |

## Next step

The full sky is now in the prototype (all constellations + drag physics + README).
If it looks right → implement v1 in Next.js: night-sky `<canvas>` component,
`react-force-graph-2d` for the named-star layer, real `/work/[slug]` case studies,
`/work` index, data wired from `site.json`. See phase plan in the master doc.
