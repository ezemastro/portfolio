## Exploration: AI Chat Section ("Habla conmigo")

### Current State

The portfolio is a single-page Astro SSG site with three sections laid out vertically: `Header` (hero with name, title, MiniTerminal, TechSelector), nothing in between, then `ProjectsSection` (3 project cards in bento grid), and `ImageModal` (fullscreen lightbox). The AI chat section must be inserted between Header and ProjectsSection.

**Patterns to reuse**:
- **Section pattern** (from ProjectsSection): `<section>` with `py-16 px-4 md:px-8`, inner `<div class="mx-auto max-w-6xl">`, title with `font-martian-mono text-3xl font-semibold text-theme-800 md:text-4xl`, accent bar `mt-2 mb-10 h-1 w-16 rounded-full bg-theme-400`.
- **Islands pattern**: Astro components for static shell, Preact for interactivity via `client:load`. Shared state via `@preact/signals` (already used in `imageModalSignal.ts` and MiniTerminal `signal.ts`).
- **Vanilla JS inline scripts**: MiniTerminal uses `<script>` for 3D tilt. Could apply to simple interactions, but chat needs full Preact island for state management.
- **Hooks pattern**: `useTypewriter.ts` demonstrates the custom hook pattern — new hooks would go in `src/hooks/`.
- **Constants pattern**: `src/constants/` exports typed arrays/objects consumed by components.
- **Path alias**: `@/` → `src/`.

**Existing relevant code**:
- `ProjectCard.astro` line 131–151: "Saber más" AI button with sparkles SVG icon — this was designed as a future entry point to the AI chat. The sparkles SVG at lines 146–149 is the EXACT icon to use as the AI logo placeholder.
- `@preact/signals` is already a production dependency (used by `imageModalSignal.ts` and MiniTerminal `signal.ts`).
- No existing chat or SSE logic anywhere in the codebase.

**TailwindCSS v4 specifics** (unchanged since projects-section exploration):
- Uses `@import "tailwindcss"` (not `@tailwind` directives)
- `@theme` block for design tokens (colors, fonts)
- `@utility` for custom utilities (`background-pattern`)
- All v3 utility classes work in v4
- `tailwind-animations` plugin provides `animate-fade-in-*`, `animate-delay-*`, `animate-duration-fast`

### API Analysis

**Endpoint**: `POST https://ai-router.mastropietro.work.gd/chat`

**Request format**:
```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "What is the capital of France?"}
  ]
}
```

**Response format (SSE)**:
- Content-Type: `text/event-stream` (on success), `text/html` (on provider failure)
- The stream is **raw text** — no `data:` prefix, no `\n\n` event delimiters. The LLM output arrives as a plain text stream, character by character or in small chunks. This is simpler than standard SSE.
- On success: raw text stream from the LLM, terminated when the connection closes.
- On failure: returns HTTP 500 with a Bun error page (HTML dump of the Cerebras provider's 404 error response).

**Provider behavior** (tested with 5 requests):
- The API round-robins between Groq (`llama-3.3-70b-versatile`) and Cerebras (`llama3.1-8b`).
- Groq: 3/5 requests succeeded, returning plain text streams like `Hello!` and `Hello world`.
- Cerebras: 2/5 requests failed with HTTP 500, returning a Bun error overlay HTML page (~67KB).
- Health endpoint `GET /health` returns `{"status":"ok"}` consistently (tested successfully).

**Key reliability findings**:
1. ~40-50% failure rate due to Cerebras provider returning 404 from their upstream.
2. When it fails, the response is NOT valid SSE — it's an HTML error page. The client MUST detect this (check for `<!doctype` or `<html` prefix).
3. No `data:` prefix means parsing is trivial — just read the stream body as text. No regex needed.
4. There's no way to select a specific provider from the client side (round-robin is server-controlled).
5. The stream terminates naturally when the LLM finishes; no explicit `[DONE]` marker.

**Implication**: The client MUST implement retry logic. At minimum: catch non-text responses, show a graceful error, and allow the user to retry (which gives a ~50% chance of hitting the working Groq provider).

### Approach Options

#### 1. Raw `fetch()` + `ReadableStream` (RECOMMENDED)

**Description**: Use the browser's built-in `fetch()` API with `response.body.getReader()` to consume the stream. Parse the raw text chunks as they arrive. No library. A custom hook `useChatStream(url, messages)` manages the fetch lifecycle, streaming state, and message accumulation.

**Component tree**:
```
AIChatSection/
├── AIChatSection.astro       ← Static shell: section wrapper, title, accent bar
├── AIChat.tsx                ← Preact island: chat UI with message list + input
├── AIChatMessage.tsx         ← Preact component: single message bubble (user or AI)
├── useChatStream.ts          ← Custom hook: fetch + SSE parsing + state machine
├── chatContext.ts             ← Shared signals: messages[], isStreaming, error
└── contextData.ts             ← (constants/) Static context strings for the AI
```

**How the hook works**:
```
useChatStream(url)
  ├── useState: messages[], isStreaming, error
  ├── sendMessage(text):
  │   ├── Append user message to messages[]
  │   ├── Append empty AI message (placeholder for streaming)
  │   ├── fetch(url, { method: 'POST', body: JSON.stringify({ messages }) })
  │   ├── Get reader from response.body
  │   ├── Read chunks in while loop:
  │   │   ├── TextDecoderStream or manual TextDecoder
  │   │   ├── If text starts with '<!doctype' or '<html' → provider error
  │   │   ├── Otherwise → append chunk to last AI message
  │   │   └── setState to trigger re-render on each chunk
  │   ├── On stream end: mark isStreaming = false
  │   └── On error: set error state, mark isStreaming = false
  └── retry(): Re-send the last user message
```

- **Pros**:
  - Zero additional dependencies (0 KB bundle impact)
  - Full control over streaming behavior, error handling, and retry logic
  - Simple: the API sends raw text, not framed SSE — `fetch()` + `ReadableStream` is the perfect fit
  - Matches project philosophy (Preact over React for 3KB savings, no heavy AI SDK)
  - ~100-150 lines of TypeScript, fits the existing hook pattern (`useTypewriter.ts` is 23 lines)
  - Easy to swap API providers later (just change URL and request body shape)
- **Cons**:
  - Must manually handle edge cases: connection drops, non-JSON error responses, retry timing
  - No built-in abort/stream cancellation — must implement `AbortController` manually (trivial, ~10 lines)
  - Preact's `useState` on every chunk may cause performance issues on very long responses; mitigate with `useRef` for accumulation + batched `setState`
- **Effort**: Medium (mostly the state machine logic)
- **Bundle impact**: ~3-4 KB gzipped for the island (message components + hook + state)

#### 2. Vercel AI SDK (`ai` package)

**Description**: Use `@ai-sdk/openai` or the framework-agnostic `ai` package with its `useChat` hook. The SDK handles SSE parsing, streaming, error handling, and message management.

- **Pros**:
  - Battle-tested streaming, retries, abort handling out of the box
  - `useChat` hook provides messages[], input, isLoading, error — all the state we need
  - Familiar API if switching to OpenAI later
- **Cons**:
  - **Heavy**: `ai` package is ~80KB gzipped minimum, plus `@ai-sdk/openai` for OpenAI compatibility. For a 3-project-card SSG site, this is disproportionate.
  - **Opinionated**: Expects OpenAI-compatible `/chat/completions` endpoint with standard SSE framing (`data:` prefix, `[DONE]` marker). The ai-router API sends raw text — would need a custom middleware/adapter to bridge the gap. This negates the "out of the box" advantage.
  - **Preact compatibility**: The `ai` package targets React. Preact compatibility layer (`preact/compat`) may not cover all hooks patterns used by the SDK (suspense, concurrent features).
  - **Vendor lock-in**: Swapping providers later with our own hook is a URL change; with the SDK, it's an SDK migration.
- **Effort**: High (adapter work, Preact compatibility testing)
- **Bundle impact**: ~80-120 KB gzipped — would double the entire site's JS budget

#### 3. Eventsource API (native `EventSource`)

**Description**: Use the browser's built-in `EventSource` interface for SSE. However, `EventSource` only supports GET requests — it cannot send a POST body with the messages array.

- **Pros**:
  - Built into the browser, zero dependencies
  - Auto-reconnect on connection drops
- **Cons**:
  - **Dealbreaker**: Cannot send POST with JSON body. The chat API requires POST.
  - Would need a proxy endpoint or URL query params to pass messages — adds server complexity (this is a static site with no backend).
  - Even if modified to use GET with query params, messages can easily exceed URL length limits.
- **Effort**: Infeasible for this API
- **Bundle impact**: N/A

### Recommendation

**Approach 1 (Raw `fetch()` + `ReadableStream`)** with a custom `useChatStream` hook.

**Rationale**:
1. **Perfect API match**: The ai-router sends raw text, not framed SSE. `fetch()` + `ReadableStream` is the simplest, most direct consumer of this format. No adapter layer needed.
2. **Zero dependencies**: The site already ships minimal JS — Preact at 3KB instead of React at 40KB. Adding an 80KB AI SDK contradicts this philosophy. A custom hook adds ~3KB gzipped.
3. **Control**: The Cerebras provider failure mode (HTML error page instead of SSE) requires custom detection logic (`if (text.startsWith('<!doctype'))`). The AI SDK would choke on this; our custom parser handles it gracefully.
4. **Pattern alignment**: The codebase already has custom hooks (`useTypewriter.ts`), Preact signals (`imageModalSignal.ts`), and careful state management (`TechBadge.tsx` with timers, refs, and edge detection). A chat hook follows the same patterns the developer already uses.
5. **API swap future-proof**: Switching to OpenAI later means changing the URL and request body from `{ messages: [...] }` to `{ model: '...', messages: [...] }` and adding a `data:` prefix parser. With a custom hook, that's a 5-line change. With the SDK, you'd need to swap libraries entirely or keep the adapter.

**State machine design**:
```
idle → streaming → idle (success)
idle → streaming → error → idle (failure + retry available)
idle → streaming → idle (user abort via stop button)
```

### Design Direction

**Color treatment** (draft):
| Element | Tailwind class | Rationale |
|---------|---------------|-----------|
| Section bg | `bg-theme-100` (matches body) | Consistency with rest of page |
| Chat container | `bg-theme-800` rounded-xl | Dark theme like MiniTerminal, signals "terminal/chat" context |
| AI message bubble | `bg-theme-700/50` text-theme-100 | Slightly lighter than container for contrast |
| User message bubble | `bg-theme-400` text-white | Accent color, mirrors "Saber más" button gradient origin |
| Input area | `bg-theme-900` border-theme-600 | Darkest tone, focused input field |
| Input border focus | `border-theme-400` | Accent color on focus |
| Send button | `bg-theme-400 hover:bg-theme-500` | Same as project card CTA buttons |
| Streaming cursor | `animate-pulse` text-theme-300 | Blinking cursor during stream |
| Error toast | `bg-red-600/90 text-white` | Brief overlay, auto-dismiss |
| Title | `font-martian-mono text-3xl font-semibold text-theme-800 md:text-4xl` | Same as ProjectsSection |
| Accent bar | `mt-2 mb-10 h-1 w-16 rounded-full bg-theme-400` | Same as ProjectsSection |

**Font**: Martian Mono throughout — it's the site's only font and reinforces the developer/terminal aesthetic.

**Layout concept**:
```
┌─────────────────────────────────────────────────┐
│  ## Habla conmigo                                │
│  ━━━━  (accent bar)                             │
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │  [🤖 AI logo placeholder]                    ││
│  │  ¡Hola! Soy el asistente virtual de Eze.     ││
│  │  Preguntame sobre sus proyectos, skills      ││
│  │  o experiencia.                              ││
│  │                                              ││
│  │  ┌─────────────────────────────────┐         ││
│  │  │ User: ¿Qué proyectos hizo?      │  ───►  ││
│  │  └─────────────────────────────────┘         ││
│  │                                              ││
│  │  ┌──────────────────────────────────────┐    ││
│  │  │ AI: Ezequiel trabajó en 3 proyectos  │    ││
│  │  │ principales... [streaming█]          │    ││
│  │  └──────────────────────────────────────┘    ││
│  │                                              ││
│  │  ┌──────────────────────────────────────┐    ││
│  │  │ [Escribe tu mensaje...]      [Enviar]│    ││
│  │  └──────────────────────────────────────┘    ││
│  └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Responsive**: On mobile, the chat container takes full width (`max-w-6xl` → `w-full`). Messages use slightly smaller font (`text-sm`). The input stays sticky at the bottom of the chat container for easy thumb access.

**Placeholder AI logo**: Reuse the existing sparkles SVG from `ProjectCard.astro` lines 146–149. It's already in the codebase, it's a generic "AI/magic" icon, and the user explicitly asked for a placeholder until they create a real logo. Wrap it in a circular `bg-theme-700` container for a branded profile-picture look.

**Animation**: 
- New messages: `animate-fade-in-up` (from tailwind-animations)
- Streaming text: no animation needed — the characters appearing naturally IS the animation
- Typing indicator (optional): 3 bouncing dots using `animate-pulse` with staggered delays

**Accessibility**:
- Messages container: `role="log" aria-live="polite"` so screen readers announce new messages
- Input: `aria-label="Escribe tu mensaje"`
- Send button: `aria-label="Enviar mensaje"`
- Error state: `role="alert"`
- Form: `<form onSubmit={...}>` so Enter key sends naturally

### Context Strategy

**Recommendation: Static build-time context loaded as an Astro prop.**

The AI needs context about Ezequiel's projects, skills, and experience. The user indicated they'll prepare markdown files later. For the initial implementation:

1. **Create `src/constants/chatContext.ts`**: A TypeScript file exporting a `SYSTEM_PROMPT` string constant. This contains the AI system prompt with hardcoded context about the portfolio owner. The file is imported at build time — zero runtime cost.

2. **Prop drilling pattern**: `AIChatSection.astro` imports the system prompt at build time and passes it as a prop to the Preact island:
   ```astro
   <AIChat client:load systemPrompt={SYSTEM_PROMPT} />
   ```

3. **Future markdown integration** (post-MVP):
   - Option A: Astro content collections. Create `src/content/ai-context/` with `.md` files. Astro loads them at build time via `getCollection()`. The `.astro` component concatenates them into the system prompt. **Best for SSG** — zero runtime cost, type-safe.
   - Option B: Dynamic fetch. Load markdown from `/public/ai-context/` at runtime via `fetch()`. **Adds latency** on first chat message. Only useful if context changes without rebuilds.
   - Recommendation: Start with Option A (inline constant), evolve to content collections when markdown files exist. This keeps the initial implementation simple while the data format is still being defined.

4. **System prompt structure** (draft):
   ```
   You are Ezequiel Mastropietro's portfolio assistant. 
   You answer questions about his projects, skills, and experience.
   
   About Ezequiel:
   - Full stack developer
   - [more context from markdown]
   
   Projects:
   - [project 1 details]
   - [project 2 details]
   
   Rules:
   - Answer in Spanish unless asked otherwise
   - Be concise and friendly
   - If you don't know, say so honestly
   ```

### Risks & Unknowns

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cerebras provider 500 errors (40-50% failure rate) | **High** | Medium — users see errors half the time | Auto-retry on failure (re-fetch gives ~50% chance of hitting Groq). Show "Intentar de nuevo" button. Consider asking API owner to remove Cerebras from rotation or add provider selection query param. |
| Raw text stream without SSE framing | **High** (confirmed) | Low — actually simplifies parsing | Our `ReadableStream` approach handles this natively. Standard SSE libraries would break. |
| Streaming performance with `useState` on every chunk | Medium | Medium — could lag on long responses with fast streaming | Use `useRef` for text accumulation + `requestAnimationFrame` batched `setState` (every ~50ms instead of every chunk). Preact's batching already helps. |
| No abort mechanism for in-flight requests | Low | Low — user might want to stop a long response | `AbortController` + `signal` passed to `fetch()`. Stop button in UI while streaming. |
| Scroll management during streaming | Medium | Medium — chat should auto-scroll as new text arrives | `useEffect` + `scrollIntoView({ behavior: 'smooth' })` on the last message. Pause auto-scroll if user manually scrolled up. |
| bundle size from frequent re-renders | Low | Low — Preact is already 3KB | The hook + components will add ~3-4KB gzipped. Well within acceptable range for a chat island. |
| Mobile keyboard covers input field | Medium | Low — UX papercut | `position: sticky; bottom: 0` on input area inside chat container. `visualViewport` API to adjust layout when keyboard opens. |
| Content security: XSS via LLM output | Low | High — could inject HTML/scripts | ALWAYS render AI text as text content, never as HTML. Preact's JSX auto-escapes by default. The `dangerouslySetInnerHTML` pattern used in `Content.tsx` must NOT be used for LLM output. |
| API downtime (no fallback provider) | Low | Medium — chat is unusable during outage | Graceful error state. The rest of the page works fine — the chat section degrades independently. |
| Rate limiting (unknown API limits) | Unknown | Low | Implement minimal client-side rate limiting: disable send for 1 second after each message. |

### Files to Touch (Estimate)

**New files (7)**:
```
client/src/
├── components/
│   └── AIChatSection/
│       ├── AIChatSection.astro    ← Section shell (static)
│       ├── AIChat.tsx             ← Preact island: chat UI manager
│       └── AIChatMessage.tsx      ← Preact component: message bubble
├── hooks/
│   └── useChatStream.ts           ← Custom hook: fetch + SSE + state machine
└── constants/
    └── chatContext.ts             ← System prompt + context data (build-time)
```

**Modified files (1)**:
```
client/src/
└── pages/
    └── index.astro                ← Add <AIChatSection /> between Header and ProjectsSection
```

**Potentially new (post-MVP)**:
```
client/src/
├── assets/
│   └── icons/
│       └── ai-logo.svg            ← Custom AI logo (when user creates it)
└── content/
    └── ai-context/                ← Markdown files for AI context (Astro content collections)
```

### Ready for Proposal

**Yes** — the exploration covers API behavior (including the 40-50% failure rate and raw-text format), component architecture, state machine design, visual direction matching the existing design system, context strategy, and risk assessment. The recommended approach (raw `fetch()` + `ReadableStream` + custom hook) is the least risky and best-aligned with the project's minimal-JS philosophy.

**Key decision for proposal phase**: Whether to implement retry logic for the Cerebras failures (recommended) and whether to request the API owner to fix/remove the Cerebras provider from rotation (strongly recommended — it makes the AI look broken 50% of the time).
