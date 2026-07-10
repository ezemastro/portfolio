import { useState, useRef, useCallback } from "preact/hooks";

type ChatRole = "user" | "assistant" | "system";
type StreamState = "idle" | "loading" | "streaming" | "done" | "error";

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

const HTML_PREFIX_PATTERN = /^\s*<!doctype|^\s*<html/i;

export function useChatStream(
  apiUrl: string,
  systemPrompt: string,
): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [streamState, setStreamState] = useState<StreamState>("idle");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef<string>("");
  const rafRef = useRef<number>(0);
  const lastUserMessageRef = useRef<string>("");
  const isFirstChunkRef = useRef<boolean>(true);

  // Update messages state and keep ref in sync — used inside the stable
  // sendMessage closure so it always reads the latest messages via the ref.
  const updateMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages((prev) => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Abort any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatMessage = { role: "user", content: trimmed };
      lastUserMessageRef.current = trimmed;

      updateMessages((prev) => [...prev, userMessage]);
      setStreamState("loading");
      setError(null);

      bufferRef.current = "";
      isFirstChunkRef.current = true;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      const flushBuffer = () => {
        const chunk = bufferRef.current;
        if (!chunk) return;
        bufferRef.current = "";

        // HTML error detection on the very first chunk
        if (isFirstChunkRef.current) {
          isFirstChunkRef.current = false;
          if (HTML_PREFIX_PATTERN.test(chunk)) {
            setStreamState("error");
            setError("El servidor devolvió HTML en lugar de texto.");
            return;
          }
          setStreamState("streaming");
          // Append assistant placeholder — only now that streaming confirmed valid
          updateMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        }

        updateMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + chunk,
            };
          }
          return updated;
        });
      };

      try {
        const combinedMessages: ChatMessage[] = [
          { role: "system", content: systemPrompt },
        ];

        // Include previous conversation history (skip the user message we just appended)
        const history = messagesRef.current;
        for (let i = 0; i < history.length - 1; i++) {
          combinedMessages.push(history[i]);
        }
        combinedMessages.push(userMessage);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: combinedMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No se recibió cuerpo de respuesta.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textValue = decoder.decode(value, { stream: true });
          bufferRef.current += textValue;

          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = 0;
              flushBuffer();
            });
          }
        }

        // Final flush for any remaining buffer
        if (bufferRef.current) {
          flushBuffer();
        }

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }

        setStreamState("done");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStreamState("error");
        setError(err instanceof Error ? err.message : "Error de conexión.");
      }
    },
    [apiUrl, systemPrompt],
  );

  const retry = useCallback(() => {
    const lastText = lastUserMessageRef.current;
    if (lastText) {
      // Remove all assistant messages (the failed/incomplete one) before retry
      updateMessages((prev) => prev.filter((m) => m.role !== "assistant"));
      setStreamState("idle");
      setError(null);
      sendMessage(lastText);
    }
  }, [sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
    setStreamState("idle");
  }, []);

  return {
    messages,
    streamState,
    error,
    sendMessage,
    retry,
    clearError,
  };
}
