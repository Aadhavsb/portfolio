# Portfolio — star map

Interactive constellation portfolio (Next.js + GPU canvas). Featured work as stars — **yellow** = experience, **purple** = projects.

| Item | Path |
|------|------|
| **Live app** | `npm run dev` → http://localhost:3000 |
| **Design MVP** | [`design-mvp/night-sky.html`](design-mvp/night-sky.html) — static prototype |
| **Site copy** | [`data/site.json`](data/site.json) (sync from `~/vault/portfolio/site.json`) |
| **Master plan** | `~/vault/portfolio/design/night-sky-constellations.md` |

```bash
npm install
npm run dev

# Prototype only (needs http server for site.json fetch)
cd design-mvp && python3 -m http.server 8754
```

## Stack

Next.js App Router · client canvas (`NightSky.tsx`) · static `/work` case study routes · content from `site.json`

## Before deploy

- [ ] Add `public/resume.pdf`
- [ ] Sync `data/site.json` from vault after copy edits
- [ ] Run `npm run build`
