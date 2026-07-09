# Proposal: Projects Section ("Mis Proyectos")

## Intent

The portfolio page ends after the header. Adding a projects section gives visitors concrete
evidence of technical skill — not just a tech stack list, but work that shows decision-making
and tradeoffs. Each project explains **why** each technology was chosen.

## Scope

### In Scope
- `src/constants/projects.ts` — `Project[]` with 3 example projects, each with 3–5 `TechUsage` entries
- `ProjectsSection.astro` — section shell, bento grid layout, section heading
- `ProjectCard.astro` — static card: title, description, tech badge list, image placeholder
- `TechBadge.tsx` — Preact island: renders icon, triggers popover on hover (desktop) / tap (mobile)
- `TechPopover.tsx` — Preact component: popover card with `howUsed` text, edge-aware positioning
- `index.astro` — import and render `<ProjectsSection />` below `<Header />`
- Responsive: bento grid collapses to single column on mobile

### Out of Scope
- Real project screenshots (use gradient placeholders)
- Live demo/repo links (fields exist in data shape, no UI yet)
- Project detail pages (single-page only)
- Animation beyond existing `tailwind-animations` utilities

## Capabilities

### New Capabilities

- `projects-section`: Bento-grid section displaying project cards with interactive tech-badge
  popovers. Three text granularity levels: card surface → per-tech popover → (future) expanded narrative.

### Modified Capabilities

None.

## Approach

**Recommended from exploration: Bento Grid + Tech-Badge Popovers (Approach 1).**

- **Static shell**: `ProjectsSection.astro` + `ProjectCard.astro` ship zero JS
- **Preact island**: `TechBadge.tsx` handles popover toggle, edge detection, click-outside dismiss
- **Styling**: Tailwind utility classes only, reusing theme palette (`theme-50`–`theme-950`) and Martian Mono
- **Mobile**: Popovers trigger on tap; grid stacks to 1-col; tap-outside-to-dismiss via `useEffect`

## Data Shape

```typescript
interface TechUsage {
  tech: string;       // References TECH_STACK slug (e.g. "react", "postgresql")
  howUsed: string;    // 2-4 sentences: WHY this tech was chosen, tradeoffs made
}

interface Project {
  slug: string;
  title: string;
  description: string;            // 1-2 lines visible on card surface
  longDescription?: string;       // (future) expanded narrative
  image: string;                  // Gradient placeholder until screenshots exist
  technologies: TechUsage[];
  links: { demo?: string; repo?: string; };
}
```

### Three Example Projects

| # | Slug | Domain | Key Tech Decisions |
|---|------|--------|--------------------|
| 1 | `rutapp` | Logistics route optimizer (React SPA) | Picked Leaflet/OSM over Google Maps for cost; PostGIS spatial indexes for fast geo queries; Docker to isolate from legacy PHP server |
| 2 | `pixelmarket` | Digital product marketplace (Astro SSG) | Astro SSG for 100% Lighthouse on public pages; MongoDB for variable product metadata; Stripe for PCI-free payments; S3 signed URLs for file delivery |
| 3 | `scaffoldkit` | CLI project scaffolder (Node.js) | TypeScript for type-safe template variables; Inquirer.js for polished prompts; Handlebars for readable YAML generation; Vitest fast watch for TDD on template engine |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/constants/projects.ts` | New | `Project[]` with 3 entries + `TechUsage` interface |
| `src/components/ProjectsSection/` | New | 4 files: `.astro` shell/card + `.tsx` badge/popover |
| `src/pages/index.astro` | Modified | Add `<ProjectsSection />` import + render |
| `src/assets/` | None | No new images; gradient placeholders are Tailwind classes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Popover edge overflow (near viewport edges) | Medium | `getBoundingClientRect` + reposition logic; `popover` API as modern fallback |
| Mobile tap UX confusing | Low | Tap-to-toggle, document click listener for dismiss, clear visual feedback |
| Placeholder gradients look unprofessional | Low | Use theme palette gradients; design cards to work without images |
| Bento grid responsive breaks on intermediate widths | Low | Explicit `md:` breakpoints; test 640px–1024px range |

## Rollback Plan

Remove `<ProjectsSection />` from `index.astro` and delete `src/components/ProjectsSection/` and
`src/constants/projects.ts`. No existing files are modified beyond one import line.

## Dependencies

- Exploration analysis at `openspec/changes/projects-section/exploration.md`

## Success Criteria

- [ ] Section renders below header on desktop (≥1024px) and mobile (≤640px)
- [ ] Three project cards visible in bento grid layout
- [ ] Hovering a tech badge reveals popover with `howUsed` text
- [ ] Tapping a badge on mobile reveals popover; tapping outside dismisses
- [ ] Zero console errors, no layout overflow
- [ ] `npx astro build` succeeds; `npx astro check` passes

---

## Proposal Question Round

Antes de pasar a specs/diseño, hay 3 preguntas de producto que ayudan a afinar las
explicaciones y el tono de los proyectos:

1. **Dominios**: Los 3 proyectos cubren logística, e-commerce, y herramientas dev. ¿Alguno
   no encaja con tu experiencia real? ¿Preferís reemplazar alguno por algo más cercano a lo
   que hiciste?

2. **Profundidad de `howUsed`**: Las explicaciones de "por qué usé esta tecnología" — ¿querés
   que sean técnicas (decisiones de arquitectura, tradeoffs) o también personales (qué
   aprendiste, qué salió mal)? El tono del portfolio es juguetón, así que mezclar puede
   funcionar.

3. **Idioma de los proyectos**: Los títulos y descripciones de los proyectos — ¿en español,
   inglés, o mixto? El portfolio ya está en español (título, subtítulo), pero los nombres de
   proyectos a veces funcionan mejor en inglés.
