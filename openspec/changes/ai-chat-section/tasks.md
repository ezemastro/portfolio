# Tasks: AI Chat Section

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~327 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | ask-always |
| Suggested split | Single PR |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Per-file estimate

| File | Action | Est. lines |
|------|--------|-----------|
| `src/content/config.ts` | Create | 12 |
| `src/content/ai-context/ezequiel.md` | Create | 25 |
| `src/hooks/useChatStream.ts` | Create | 85 |
| `src/components/AIChatMessage.tsx` | Create | 30 |
| `src/components/AIChat.tsx` | Create | 135 |
| `src/components/AIChatSection.astro` | Create | 38 |
| `src/pages/index.astro` | Modify | +2 |

## Phase 1: Foundation — Content Collection

- [x] 1.1 Create `src/content/config.ts` with `aiContext` collection using `z.object({ title: z.string(), description: z.string() })` and export `collections`
- [x] 1.2 Create `src/content/ai-context/ezequiel.md` with frontmatter (`title`, `description`) and Spanish markdown bio covering experience, skills, projects, and tech stack

## Phase 2: Core Hook

- [x] 2.1 Create `src/hooks/useChatStream.ts` — custom hook with `useState`/`useRef` implementing: `StreamState` machine (`idle → loading → streaming → done|error`), `fetch()` + `ReadableStream` + `TextDecoder`, `requestAnimationFrame` batched flushing from `useRef` buffer, HTML error detection (first chunk starts with `<!doctype` or `<html`), `AbortController` cleanup, `sendMessage` and `retry()` re-sending last user message. Return `{ messages, streamState, error, sendMessage, retry, clearError }`

## Phase 3: UI Components

- [x] 3.1 Create `src/components/AIChatMessage.tsx` — pure presentational: `{ role, content, isStreaming }` props; user bubble (right-aligned, `bg-theme-400 text-white`), assistant bubble (left-aligned, `bg-theme-100 text-theme-800`, sparkles SVG logo), pulse cursor when `isStreaming`
- [x] 3.2 Create `src/components/AIChat.tsx` (`client:load`) — main island consuming `useChatStream`: message list with `useRef`-based auto-scroll (pause if scrolled up >100px, resume on scroll-down); 3–4 suggestion chips as inline `<button>` elements, hidden after first message; inline `<textarea>` + send `<button>` (Enter sends, Shift+Enter newline, empty/whitespace rejected); loading spinner while `streamState === "loading"`; error state with "Reintentar" button; empty state (sparkles SVG + chips, no messages); `aria-label`, `role="log"` on message list
- [x] 3.3 Create `src/components/AIChatSection.astro` — Astro wrapper: reads `aiContext` collection via `getCollection`, extracts body as `systemPrompt`, renders section with title "Preguntame algo", accent bar (`h-1 w-16 rounded-full bg-theme-400`), and `<AIChat client:load systemPrompt={systemPrompt} />` inside `max-w-3xl mx-auto` container

## Phase 4: Integration

- [x] 4.1 Modify `src/pages/index.astro` — import `AIChatSection` and insert `<AIChatSection />` between `<Header />` and `<ProjectsSection />`

## Phase 5: Polish & Verify

- [x] 5.1 Run `npx astro check` — fix any type errors
- [x] 5.2 Run `npx astro build` — verify SSG output includes chat section
- [x] 5.3 Run `npx prettier --write .` — format all new and modified files
- [x] 5.4 Manual: verify responsive layout (mobile full-width, `max-w-3xl` md+), streaming tokens, suggestion chips dismiss, error retry, Enter/Shift+Enter behavior, auto-scroll pause/resume
