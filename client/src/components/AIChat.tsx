import { useState, useRef, useEffect } from "preact/hooks";
import { useChatStream } from "@/hooks/useChatStream";
import AIChatMessage from "@/components/AIChatMessage";

const API_URL = "https://ai-router.mastropietro.work.gd/chat";

const SUGGESTIONS = [
  "¿Cuál es el stack tecnológico de Ezequiel?",
  "¿Qué proyectos desarrolló?",
  "¿Qué aprendió en cada proyecto?",
  "¿Cómo trabaja Ezequiel?",
];

const SPARKLES_SVG = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

interface AIChatProps {
  systemPrompt: string;
}

export default function AIChat({ systemPrompt }: AIChatProps) {
  const { messages, streamState, error, sendMessage, retry, clearError } =
    useChatStream(API_URL, systemPrompt);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUserScrolledUp = useRef(false);

  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const hasMessages = messages.length > 0;
  const isLoading = streamState === "loading" || streamState === "streaming";
  const isStreaming = streamState === "streaming";
  const hasError = streamState === "error";
  const isEmpty = !hasMessages && !hasError;

  // Hide suggestion chips after first message is sent
  useEffect(() => {
    if (hasMessages) {
      setShowSuggestions(false);
    }
  }, [hasMessages]);

  // Auto-scroll to bottom during streaming unless user scrolled up
  useEffect(() => {
    if (!isUserScrolledUp.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserScrolledUp.current = distFromBottom > 100;
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
    // Defer focus to after Preact re-render
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  // Refocus textarea when streaming finishes or on error
  useEffect(() => {
    if (streamState === "done" || streamState === "error" || streamState === "idle") {
      textareaRef.current?.focus();
    }
  }, [streamState]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div class="border-theme-200 flex flex-col rounded-xl border bg-white shadow">
      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Historial de conversación"
        aria-live="polite"
        class="flex max-h-[600px] min-h-[320px] flex-col gap-4 overflow-y-auto p-4"
      >
        {/* Empty / welcome state */}
        {isEmpty && (
          <div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div class="text-theme-400">{SPARKLES_SVG}</div>
            <p class="font-martian-mono text-theme-500 text-sm">
              Preguntame algo sobre Ezequiel
            </p>
            {showSuggestions && (
              <div class="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    class="bg-theme-100 font-martian-mono text-theme-700 hover:bg-theme-200 rounded-full px-3 py-1.5 text-xs transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <AIChatMessage
            key={i}
            role={msg.role as "user" | "assistant"}
            content={msg.content}
            isStreaming={
              isStreaming &&
              i === messages.length - 1 &&
              msg.role === "assistant"
            }
          />
        ))}

        {/* Loading spinner (before first token arrives) */}
        {streamState === "loading" && (
          <div class="flex items-center gap-2 self-start">
            <div class="text-theme-400">{SPARKLES_SVG}</div>
            <div class="flex gap-1">
              <span class="bg-theme-400 h-2 w-2 animate-bounce rounded-full [animation-delay:0ms]" />
              <span class="bg-theme-400 h-2 w-2 animate-bounce rounded-full [animation-delay:150ms]" />
              <span class="bg-theme-400 h-2 w-2 animate-bounce rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Error bar */}
      {hasError && (
        <div class="border-theme-200 flex items-center justify-between gap-3 border-t px-4 py-3">
          <p class="font-martian-mono min-w-0 text-xs text-red-500">
            {error ?? "Ocurrió un error."}
          </p>
          <button
            type="button"
            onClick={retry}
            class="bg-theme-400 font-martian-mono hover:bg-theme-500 shrink-0 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Input area — hidden during error, shown with retry at top */}
      {!hasError && (
        <div class="border-theme-200 flex items-end gap-2 border-t p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu pregunta..."
            rows={1}
            disabled={isLoading}
            aria-label="Escribí tu pregunta"
            class="border-theme-200 bg-theme-50 font-martian-mono text-theme-800 placeholder:text-theme-400 focus:border-theme-400 max-h-[120px] min-h-[40px] flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            aria-label="Enviar mensaje"
            class="bg-theme-400 hover:bg-theme-500 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
