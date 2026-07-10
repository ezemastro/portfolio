# Design: AI Chat Section

## Technical Approach

Astro content collections load context at build time → prop → Preact island with `useChatStream`
hook managing the streaming state machine. `fetch()` + `ReadableStream` + `requestAnimationFrame`
batching for jank-free token-by-token rendering. HTML detection on first chunk triggers auto-retry.
Suggestion chips self-dismiss after first message. Zero new npm dependencies.

## Architecture Decisions

### Decision 1: `useChatStream` as a hook, not a signal

**Choice**: Custom hook with internal `useState`/`useRef`.
**Alternatives**: `@preact/signals` for message state.
**Rationale**: Streaming state is scoped to one island — no cross-component sharing needed. `useRef`
for the in-flight buffer (non-reactive) avoids re-render per chunk; `useState` for the message list
triggers natural Preact renders. Signals add a dep for no benefit here.

### Decision 2: `requestAnimationFrame` batching

**Choice**: Accumulate chunks in `useRef`, flush to `useState` via `requestAnimationFrame`.
**Alternatives**: Per-chunk `setState`, debounced `setTimeout`.
**Rationale**: The AI router sends small token-sized chunks (1-4 chars each). `rAF` batches all
chunks received before the next paint into one state update — essential for smooth rendering.
`setTimeout` can drift; `rAF` is synchronized with the render loop.

### Decision 3: Content collection for system prompt

**Choice**: `src/content/ai-context/` collection with `zod` schema, consumed in `.astro` frontmatter.
**Alternatives**: Hardcoded string, `.env` variable.
**Rationale**: Astro content collections provide type-safe validation at build time. Zero runtime
cost — Astro inlines it. The context file is version-controlled markdown, editable by non-devs.

### Decision 4: Inline suggestion chips

**Choice**: Chips as `<button>` elements inside `AIChat.tsx`, not a separate component.
**Rationale**: 3-4 static buttons with one `onClick` handler — <20 lines of JSX. Premature
abstraction. Extract later if they need analytics or dynamic loading.

### Decision 5: HTML detection for Cerebras errors

**Choice**: Check if first accumulated chunk starts with `<!doctype` or `<html`.
**Rationale**: Cerebras returns a Bun error page on 500 — `<!doctype html>` prefix is a
reliable, zero-false-positive signal. No content-type header dependency.

## Data Flow

```
Content Collection (.md) → Astro frontmatter → systemPrompt prop
                                                      ↓
User types → ChatInput → sendMessage(text) → useChatStream
                                                   ↓
messages[] ← batched rAF ← TextDecoder ← ReadableStream ← fetch(POST /chat)
                                                   ↓
AIChatMessage (per message) ← AIChat.tsx (messages state)
```

## Component Tree

```
AIChatSection.astro (reads content, renders section shell with title + accent bar)
  └── AIChat.tsx (client:load — useChatStream, state machine, child composition)
        ├── [Welcome]: SparklesSVG + SuggestionChips (inline <button> pills)
        ├── AIChatMessage.tsx × N (pure presentational — role-based bubble)
        └── ChatInput (inline — <textarea> + send <button>)
```

## Sequence Diagram: Message Streaming

```
User        AIChat.tsx         useChatStream        API
 |               |                    |               |
 |-- types ----->|                    |               |
 |               |-- sendMessage() -->|               |
 |               |                    |-- POST ------>|
 |               |                    |<-- 1st chunk -|
 |               |                    | [HTML? check]  |
 |               |                    |-- rAF flush ->|
 |               |<-- messages[] -----|               |
 |<-- token -----|                    |               |
 |               |                    |<-- chunk N ---|
 |               |                    |-- rAF flush ->|
 |<-- token -----|                    |               |
 |               |                    |<-- stream end -|
 |               |                    |-- final ---->|
 |               |<-- isStreaming:false|              |
 |<-- done ------|                    |               |
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/content/config.ts` | Create | `aiContext` collection with zod schema |
| `src/content/ai-context/ezequiel.md` | Create | Context file → system prompt |
| `src/components/AIChatSection/AIChatSection.astro` | Create | Section shell: title + accent bar + island |
| `src/components/AIChatSection/AIChat.tsx` | Create | State machine, useChatStream, child composition |
| `src/components/AIChatSection/AIChatMessage.tsx` | Create | Pure component: role-based bubble styling |
| `src/hooks/useChatStream.ts` | Create | Custom hook: fetch + stream + rAF + retry |
| `src/pages/index.astro` | Modify | Insert `<AIChatSection />` after Header |

## Interfaces / Contracts

```typescript
// useChatStream.ts
type ChatRole = "user" | "assistant" | "system";
type StreamState = "idle" | "loading" | "streaming" | "error";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface UseChatStreamReturn {
  messages: ChatMessage[];
  streamState: StreamState;
  error: string | null;
  sendMessage: (text: string) => void;
  retry: () => void;
  clearError: () => void;
}

function useChatStream(apiUrl: string): UseChatStreamReturn
```

```typescript
// src/content/config.ts
import { z, defineCollection } from "astro:content";
const aiContext = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});
export const collections = { aiContext };
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Type check | All new files | `npx astro check` |
| Build | SSG output | `npx astro build` — content loads, island hydrates |
| Visual | Responsive, streaming | Manual: dev server, mobile/full breakpoints |
| Manual | Cerebras retry | ~5 requests on staging, observe auto-retry |

## Migration / Rollout

No migration. Single-commit deploy. Rollback: remove `<AIChatSection />` from `index.astro`,
delete `src/components/AIChatSection/`, `src/hooks/useChatStream.ts`, `src/content/ai-context/`.

## Open Questions

- [ ] Error retry: immediate re-fetch or exponential backoff? (Proposal implies immediate — confirm)
- [ ] Exact Spanish text for the 3-4 suggestion chips — which prompts?
