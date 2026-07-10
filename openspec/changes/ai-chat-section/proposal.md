# Proposal: AI Chat Section ("Habla conmigo")

## Intent

Add an interactive AI chat section where visitors ask questions about Ezequiel's projects,
skills, and experience. The AI is powered by the ai-router LLM API (Groq/Cerebras) and
served as a Preact island — zero additional dependencies, matching the site's minimal-JS
philosophy. Context is provided at build time via Astro content collections.

## Scope

### In Scope
- `AIChatSection.astro` — static section shell with title + accent bar + light card container
- `AIChat.tsx` — Preact island: message list, streaming UI, input form, suggestion chips
- `AIChatMessage.tsx` — Preact component: user/AI message bubble styling
- `useChatStream.ts` — custom hook: `fetch()` + `ReadableStream` + retry on provider failure
- `src/content/ai-context/` — Astro content collection with one comprehensive `.md` file
- `index.astro` — insert `<AIChatSection />` between Header and ProjectsSection
- Sparkles SVG from ProjectCard.astro (line 146–149) as AI logo placeholder
- 3–4 suggestion chips ("¿Cuál es el stack de Ezequiel?", etc.) for first impression
- Auto-retry on Cerebras provider failure (detect HTML error response → re-fetch)

### Out of Scope
- Backend or server-side chat endpoint
- Custom AI logo (placeholder only; user creates one later)
- Conversation persistence (no localStorage)
- Markdown rendering in AI responses (plain text only)
- More than one `.md` context file initially

## Capabilities

### New Capabilities

- `ai-chat-section`: AI chat interface with streaming responses, suggestion chips, provider
  retry, and build-time context via content collections.

### Modified Capabilities

None.

## Approach

**Raw `fetch()` + `ReadableStream` with custom hook (zero dependencies).**

- Hook reads `response.body.getReader()` stream, decodes with `TextDecoder`, accumulates
  chunks into reactive Preact signal state
- HTML detection (`<!doctype` prefix) triggers auto-retry — Cerebras returns a Bun error page
  on failure, hitting Groq on next round-robin
- State machine: `idle → streaming → idle|error`, with `AbortController` for cancellation
- Context loaded at build time: `AIChatSection.astro` reads content collection and passes it
  as the system prompt to the Preact island (zero runtime cost)

## Design Direction

**LIGHT theme** (user vetoed dark). Colors match existing page palette:

| Element | Tailwind |
|---------|----------|
| Section bg | `bg-theme-100` (page body) |
| Chat card | `bg-white border border-theme-200 rounded-2xl shadow-sm` |
| AI bubble | `bg-theme-100 text-theme-800` rounded-tr-lg |
| User bubble | `bg-theme-400 text-white` rounded-tl-lg |
| Input field | `bg-theme-50 border border-theme-200 focus:border-theme-400` |
| Send button | `bg-theme-400 hover:bg-theme-500 text-white` |
| Suggestion chips | `bg-theme-100 hover:bg-theme-200 text-theme-700 border border-theme-200` |
| Title + accent bar | Same pattern as ProjectsSection |

Font: Martian Mono throughout. Chat card constrained to `max-w-3xl` within the section's
`max-w-6xl` container. On mobile, full width with slightly smaller text. Suggestion chips
appear as pills above the input area, disappearing once the first message is sent.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/AIChatSection/` | New | 3 files: `.astro` shell + `.tsx` island + `.tsx` message bubble |
| `src/hooks/useChatStream.ts` | New | Custom hook: fetch + stream + retry (state machine) |
| `src/content/ai-context/` | New | Astro content collection directory + 1 initial `.md` |
| `src/pages/index.astro` | Modified | 1 import + 1 render between Header and ProjectsSection |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cerebras provider 500 errors (~40-50%) | High | Auto-retry on HTML error response; "Reintentar" button |
| Streaming useState perf on long responses | Low | `useRef` accumulation + batched `requestAnimationFrame` |
| XSS via LLM output | Low | Always render as text content; never `dangerouslySetInnerHTML` |
| API downtime | Low | Graceful error state; section degrades independently |

## Rollback Plan

Remove `<AIChatSection />` from `index.astro` and delete `src/components/AIChatSection/`,
`src/hooks/useChatStream.ts`, and `src/content/ai-context/`. One import line in index.astro
is the only modified file.

## Dependencies

- Exploration at `openspec/changes/ai-chat-section/exploration.md`
- `ai-router.mastropietro.work.gd` API availability
- Astro content collections enabled in config (already supported by Astro 5.17)

## Success Criteria

- [ ] Section renders between Header and ProjectsSection on all breakpoints
- [ ] Suggestion chips click → sends message → AI streams response in real time
- [ ] Cerebras failure → auto-retry → eventual Groq success (user sees one error retry at most)
- [ ] "Reintentar" button appears on persistent failure
- [ ] Messages scroll naturally; input accessible via Enter key
- [ ] AI answers include project/stack info from the context .md file
- [ ] `npx astro build` succeeds; `npx astro check` passes
- [ ] Zero layout overflow; chat card stays within container at all viewports
