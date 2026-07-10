# AI Chat Section Specification

## Purpose

Interactive "Habla conmigo" chat section between Header and ProjectsSection.
Visitors ask questions about Ezequiel's projects, skills, and experience via
ai-router API. Preact island, `fetch()` + `ReadableStream`, zero new deps.
Context from `src/content/ai-context/ezequiel.md` at build time.

## Functional Requirements

| ID  | Requirement          | Summary                                                  |
| --- | -------------------- | -------------------------------------------------------- |
| FR1 | Section placement    | MUST render between Header and ProjectsSection, matching existing section pattern |
| FR2 | Message input        | MUST send via Enter key or button; empty/whitespace MUST be rejected |
| FR3 | Streaming display    | MUST render AI response token-by-token via `ReadableStream` as plain text; `dangerouslySetInnerHTML` MUST NOT be used |
| FR4 | Suggestion chips     | SHALL show 3–4 pills initially; MUST disappear after first message, never reappear |
| FR5 | System prompt        | MUST load `ezequiel.md` at build time and inject as `system` role in every request; build MUST fail if file missing |
| FR6 | Error/retry          | MUST detect HTML responses (`<!doctype`/`<html` prefix) and network failures; SHALL show "Reintentar" button |
| FR7 | Loading/empty states | SHALL show typing indicator during in-flight requests and welcome message + sparkles SVG + chips in initial state |
| FR8 | Scroll behavior      | SHOULD auto-scroll to latest message during streaming unless user has scrolled up >100px |

## Scenarios

### Message Input

#### Scenario: Send message

- GIVEN chat is idle, input has text
- WHEN user presses Enter or clicks send
- THEN user bubble appears, input clears, streaming begins

#### Scenario: Reject empty message

- GIVEN input is empty or whitespace
- WHEN user submits
- THEN nothing is sent, no API call

### Streaming

#### Scenario: Token-by-token display

- GIVEN API responds after a message
- WHEN text chunks arrive via `ReadableStream`
- THEN tokens appear incrementally with a pulse cursor while streaming

#### Scenario: Plain text only — no HTML injection

- GIVEN AI response contains HTML-like text
- WHEN rendered
- THEN content MUST be plain text via JSX text content only

### Suggestion Chips

#### Scenario: Chips clickable and auto-disappear

- GIVEN no messages yet
- WHEN chat loads → 3–4 pills shown; user clicks one → its text sent as message
- THEN pills disappear permanently after first message

### System Prompt

#### Scenario: Context in API request

- GIVEN `ezequiel.md` exists
- WHEN any message sends
- THEN POST body includes `system` role with file content as first messages entry

### Error Handling

#### Scenario: HTML error → retry

- GIVEN message sent, response starts with `<!doctype` or `<html`
- WHEN error detected
- THEN "Reintentar" button appears, clicking re-sends last user message

#### Scenario: Network failure → retry

- GIVEN `fetch()` rejects or times out
- WHEN error caught
- THEN "Reintentar" button appears

### Scroll

#### Scenario: Auto-scroll during stream

- GIVEN streaming active, user at bottom
- WHEN new tokens arrive
- THEN view scrolls to keep latest content visible

#### Scenario: Pause auto-scroll

- GIVEN user scrolled up >100px from bottom
- WHEN tokens arrive
- THEN scroll position stays; resumes when user scrolls back down

## Non-Functional Requirements

| ID   | Requirement     | Criterion                                               |
| ---- | --------------- | ------------------------------------------------------- |
| NFR1 | Zero extra deps | No new npm packages beyond existing stack               |
| NFR2 | Bundle size     | Chat island < 5 KB gzipped                              |
| NFR3 | Accessibility   | Keyboard nav, `aria-label` on input/button, `role="log"` on messages |
| NFR4 | Responsive      | Full-width mobile, `max-w-3xl` md+                      |

## Rollback Plan

Remove `<AIChatSection />` from `index.astro`. Delete `src/components/AIChatSection/`,
`src/hooks/useChatStream.ts`, and `src/content/ai-context/`.
