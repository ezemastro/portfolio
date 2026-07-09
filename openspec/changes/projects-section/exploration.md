## Exploration: Projects Section ("Mis Proyectos")

### Current State

The portfolio is a single-page Astro SSG site with a full-viewport header section (Header.astro) that occupies `h-5/6` of the viewport. Below the header there is currently nothing — the page ends. The projects section will be the second major section of the page, sitting below the header.

**Existing patterns observed:**
- **Constants pattern**: `src/constants/techStack.ts` exports a typed array of objects consumed by Preact islands. This is the canonical data pattern for the project.
- **Islands pattern**: Astro components provide the static shell; Preact components handle interactivity via `client:load` (or `client:only` for pure-island components). Shared state between islands uses `@preact/signals`.
- **Vanilla JS pattern**: MiniTerminal.astro uses an inline `<script>` tag for the 3D tilt effect — this is a viable approach for simple interactions (no Preact needed).
- **Styling pattern**: Tailwind utility classes almost everywhere. Only one `<style>` block exists site-wide (MiniTerminal.astro for 3D transforms). No CSS modules, no CSS-in-JS.
- **Animation pattern**: `tailwind-animations` provides `animate-fade-in-*`, `animate-delay-*`, `animate-duration-fast`, `animate-flip-in-x`.
- **Font**: Martian Mono only (monospace), weights 100-700.
- **Color theme**: Blue-ish palette `theme-50` (#ecf2f9) through `theme-950` (#09111b). Background is `theme-100`. Text is `theme-800`/`theme-700`/`theme-50`. Borders are `theme-500`.

**TailwindCSS v4 specifics:**
- Uses `@import "tailwindcss"` (not `@tailwind` directives)
- `@theme` block for design tokens (colors, fonts)
- `@utility` for custom utilities (e.g., `background-pattern`)
- All v3 utility classes work in v4

### Affected Areas

- `client/src/pages/index.astro` — will import and render the new ProjectsSection component
- `client/src/components/` — new `ProjectsSection/` directory with Astro + Preact components
- `client/src/constants/` — new `projects.ts` with project data array
- `client/src/styles/` — possibly a new utility or theme addition (likely not needed, Tailwind handles most)
- `client/src/assets/` — any project screenshots or placeholder images
- No existing files are modified (pure addition)

### Approaches

#### 1. **Bento Grid + Tech-Badge Popovers (RECOMMENDED)**

Cards in a bento-style grid (varied sizes for visual rhythm). Each card shows: project title, short description (1-2 lines), tech badges as small icons. Hovering/clicking a tech badge reveals a popover/tooltip with the "How I used X" explanation. Cards have a subtle hover lift effect.

- **Pros**:
  - Aligns perfectly with "NO saturar de texto" — text only appears on-demand, per-technology
  - Matches existing TechSelector pattern (icon grid, hover interaction)
  - Bento grid is the current modern portfolio standard (Apple, Linear, Vercel)
  - Two granularity levels: card overview (always visible) + per-tech deep-dive (on hover/click)
  - Works well on mobile (cards stack, popovers become bottom sheets or inline expands)
- **Cons**:
  - Popover positioning is tricky — must handle edge cases (near viewport edges)
  - Requires Preact island for popover logic (bundle cost, though small)
  - Bento grid requires careful responsive breakpoint planning
- **Effort**: Medium
- **Bundle impact**: One Preact island (~2-3 KB gzipped) for badge popovers + optional vanilla JS for card hover effects

**Component split:**
```
ProjectsSection/
├── ProjectsSection.astro     ← Static shell, section layout, bento grid
├── ProjectCard.astro         ← Static card: title, description, tech badge list, image placeholder
├── TechBadge.tsx             ← Preact island: icon + popover on hover/click
├── TechPopover.tsx           ← Preact component: the popover card with explanation text
├── ExpandToggle.tsx          ← (optional) Preact island for "Ver más" expand
└── projectData.ts            ← (moved to constants/) Data array
```

#### 2. **Card Flip (Front/Back)**

Uniform card grid. Each card has two faces: front shows project image + title + tech badges; back shows all tech explanations stacked. Flip on hover (desktop) or tap (mobile).

- **Pros**:
  - Classic, well-understood UX pattern
  - All interactivity is CSS-only (no Preact needed for the flip itself)
  - Single interaction reveals all details
  - Can use `backface-visibility` and `rotateY` — pure CSS, zero JS for the flip
- **Cons**:
  - ALL tech explanations shown at once on the back — contradicts "NO saturar de texto" if a project has 5+ technologies
  - Flip animation can feel gimmicky on rapid mouse movement
  - Mobile: tap-to-flip can be confusing (no hover)
  - Fixed card height constrains text space
- **Effort**: Low
- **Bundle impact**: Zero JS for flip (CSS-only). Could add vanilla JS for mobile tap handling.

#### 3. **Expand/Collapse Accordion Cards**

Cards in a uniform grid. Each card has a collapsed state (project overview) and an expanded state (detailed tech list with explanations). Click "Ver más" to expand in-place, pushing subsequent cards down.

- **Pros**:
  - Structured, predictable UX — users understand accordions
  - Works naturally on mobile (tap to expand)
  - No z-index/layering issues (unlike popovers or flips)
  - Simple implementation (CSS `max-height` transition or `<details>` element)
- **Cons**:
  - Expanding one card pushes others down — layout jump can be jarring
  - Still shows ALL tech details at once when expanded (less granular than popover approach)
  - Less visually distinctive than bento grid or card flip
- **Effort**: Low-Medium
- **Bundle impact**: Can be 100% CSS (using `<details>` + `transition`) or need minimal JS for smooth animation. Zero Preact required.

#### 4. **Timeline/Masonry with Inline Tech Explanations**

Projects displayed in a vertical timeline or masonry layout. Each project entry shows the tech list with short inline explanations directly visible (not hidden behind interaction).

- **Pros**:
  - No interaction required — all content visible immediately
  - Works for narrative-heavy portfolios (junior dev telling their story)
- **Cons**:
  - DIRECTLY contradicts "NO saturar de texto" — text is always visible
  - Masonry requires JS for layout calculation
  - Timeline feels dated compared to modern grids
- **Effort**: Medium
- **Bundle impact**: Moderate (masonry JS + layout calculations)

### Recommendation

**Approach 1 (Bento Grid + Tech-Badge Popovers)** with a hybrid of Approach 3 for the detail expand.

Rationale:
1. **Text gating**: Popovers gate text per-technology, not per-card. This is the most granular and user-controlled text reveal — exactly what "NO saturar de texto" demands. The card surface stays clean.
2. **Pattern alignment**: The existing TechSelector component already uses icons that respond to hover — tech badges with popovers is a natural evolution of that pattern.
3. **Modern aesthetic**: Bento grid is the dominant portfolio pattern in 2024-2026. The varied card sizes add visual interest without complexity.
4. **Islands pattern fit**: Only the popover behavior needs Preact. The grid, cards, and layout are pure Astro (zero JS shipped for static parts). This is textbook Astro islands.
5. **Responsive**: Bento grid collapses gracefully to 1-column on mobile. Popovers become centered modals or bottom-sheet-style on small screens.

**Hybrid detail**: Each card also has an optional expand toggle that reveals a longer project narrative (the "story" behind the project, not just tech details). This gives a third level of granularity:
- Level 1: Card surface (title + description + tech icons) — always visible
- Level 2: Tech badge popover (per-tech deep dive) — on hover/click
- Level 3: Expanded detail (project story, challenges, learnings) — on click

### Data Shape (Draft)

```typescript
// src/constants/projects.ts

interface TechUsage {
  tech: string;        // References a tech name from TECH_STACK
  icon: string;        // Same icon path as TECH_STACK entry
  howUsed: string;     // "How I used X" explanation (2-4 sentences)
}

interface Project {
  slug: string;
  title: string;
  description: string;           // 1-2 lines, visible on card surface
  longDescription?: string;      // Longer narrative for expanded view
  image: string;                 // Screenshot or placeholder
  technologies: TechUsage[];
  links: {
    demo?: string;
    repo?: string;
  };
}

export const PROJECTS: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    description: "Short tagline here.",
    technologies: [
      { tech: "react", icon: ICON_BASE_PATH + "reactjs.svg", howUsed: "..." },
      { tech: "node", icon: ICON_BASE_PATH + "nodejs.svg", howUsed: "..." },
    ],
    // ...
  },
  // 3 projects total
];
```

### Visual Concept

**Section structure**:
```
┌─────────────────────────────────────────────┐
│  ## Mis Proyectos                            │
│  (section heading with monospace styling)    │
│                                              │
│  ┌──────────────┐  ┌──────────┐  ┌────────┐│
│  │              │  │          │  │        ││
│  │  Project A   │  │ Project  │  │ Proj C ││
│  │  (large)     │  │    B     │  │(medium)││
│  │  [icon][ic]  │  │ [ic][ic] │  │ [icon] ││
│  │              │  │          │  │        ││
│  └──────────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────────┘
```

**Color treatment**:
- Cards: `bg-theme-50` or `bg-theme-200` with subtle border `border-theme-300`
- Card hover: scale 1.02 + shadow + border color shift to `theme-400`
- Tech badges: `bg-theme-800` (like MiniTerminal tab) with white/light text
- Popover: `bg-theme-800` card with `text-theme-50`, matching MiniTerminal dark theme
- Section heading: `text-theme-800` with `font-martian-mono` uppercase

**Font**: Martian Mono throughout, matching the developer/monospace vibe. Possibly lighter weight (300/400) for descriptions, medium (500/600) for headings.

**Background**: The section could reuse the `background-pattern` utility or use a solid `bg-theme-100` background (matching body). The existing header uses the pattern background — the projects section could use solid for contrast, or invert (dark section with light cards).

### Risks

- **Popover edge overflow**: When a badge near the right/bottom edge of the viewport is hovered, the popover must reposition. Needs `useEffect` + `getBoundingClientRect` logic (similar complexity to MiniTerminal's tilt script). Mitigation: use `popover` API (modern browsers) or anchor positioning as fallback.
- **Mobile popover UX**: Hover doesn't exist on mobile. Popovers must trigger on tap instead. Need to handle tap-outside-to-dismiss. Mitigation: use click/tap trigger with a `useEffect` document click listener.
- **Bento grid on mobile**: Varied card sizes on desktop must collapse to uniform width on mobile. Need explicit responsive breakpoints — `md:col-span-2`, etc.
- **TailwindCSS v4 `@theme`/`@utility` compatibility**: If any custom animations or utilities are needed, verify the v4 API. The project already uses v4 successfully (colors, fonts, background-pattern all work), so risk is low.
- **Image handling**: No real screenshots yet. Need a placeholder strategy. SVG patterns, gradient placeholders, or emoji/icon placeholders. Risk: placeholder quality affects perceived project quality. Mitigation: design cards to look good even without real images (gradient + icon fallback).
- **Accessibility**: Popovers must be keyboard-navigable (`tabindex`, `aria-expanded`, `aria-describedby`). Card hover effects should not rely solely on hover for essential information.

### Ready for Proposal

**Yes** — the exploration covers data shape, component architecture, visual approach, and risk assessment. The proposal phase can refine scope, define all 3 project entries, and lock in the exact component tree before spec/design/tasks.
