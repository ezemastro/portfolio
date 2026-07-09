# projects-section Specification

## Purpose

Bento-grid section with 3 project cards and interactive tech-badge popovers. Granularity: card surface → per-tech explanation → (future) expanded narrative.

## Requirements

### FR1–FR6: Functional

| ID | Requirement | Scenario |
|----|------------|----------|
| FR1 | Section MUST render below header | Given page loads → heading "Mis Proyectos" appears under header |
| FR2 | Cards display title, category, description (1-2 lines), gradient placeholder, tech icon badges | Missing optional links omitted silently |
| FR3 | Hover (desktop) / tap (mobile) on badge shows popover with `explanation` | Dismisses on cursor-leave or tap-outside, within 200ms |
| FR4 | 3 projects by default; add more via array push only (zero component changes) | 4th entry → renders same layout, no errors |
| FR5 | Bento grid: varied spans at desktop (>=1024px) | 2-col at tablet (640-1023px), 1-col at mobile (<640px) |
| FR6 | No horizontal overflow at any breakpoint | Cards fill available width cleanly |

### VR2–VR4: Visual

| ID | Requirement | Scenario / Specification |
|----|------------|--------------------------|
| VR1 | Popover trigger: hover (desktop), tap (mobile) | Same as FR3 |
| VR2 | Popover repositions near viewport edges | Right edge → opens leftward. Bottom edge → opens upward. Fully visible. |
| VR3 | Card hover: scale 1.02, deepen shadow, border→theme-400 | Smooth enter/leave transition |
| VR4 | Theme: `theme-50`–`theme-950` palette, Martian Mono font | Cards: bg-50/200, border-300, text-800. Badges: bg-800, text-50. Popovers: bg-800, text-50. Font weights: 300 (desc), 500–600 (headings) |

### DR1–DR4: Data

| ID | Requirement |
|----|------------|
| DR1 | Data in `src/constants/projects.ts` |
| DR2 | `Project`: slug, title, category, description, techUsages[], links? (demo/repo), longDescription? |
| DR3 | `TechUsage`: techName (references TECH_STACK slug), icon (SVG path), explanation (2-4 sentences: why/how/learned) |
| DR4 | Icons reuse `src/assets/icons/tech/` where possible; missing icons use placeholder |

### NFR1–NFR4: Non-Functional

| ID | Requirement | Strength |
|----|------------|----------|
| NFR1 | Adding project = array push, zero component changes | MUST |
| NFR2 | Static parts ship zero JS; TechBadge island uses `client:load` | MUST |
| NFR3 | Interactivity: Preact islands only, no SPA hydration | MUST |
| NFR4 | TechBadge bundle < 3 KB gzipped | SHOULD |

### EC1–EC3: Edge Cases

| ID | Condition | Behavior | Strength |
|----|-----------|----------|----------|
| EC1 | 1, 2, or 5+ projects | Grid fills space; no broken layout | SHALL |
| EC2 | Touch device (no hover) | Tap → open, tap-outside → dismiss | SHALL |
| EC3 | Explanation > 200 chars | Popover: max-height + overflow-y scroll | SHALL |

## Initial Projects (placeholder content)

| Slug | Category | Key Tech Icons | Grid |
|------|----------|----------------|------|
| `landing-estatica` | Sitio Estático | Astro, TailwindCSS, HTML, CSS, Markdown | 2-col |
| `taskflow-app` | App Móvil | React Native, TypeScript, Expo, Zustand | 1-col |
| `gestionpro-web` | App Web | Preact, TypeScript, Node.js, Express, PostgreSQL | 1-col |
