import { signal } from "@preact/signals";

/**
 * Shared signal that lets any component (e.g. a project card's "Saber más"
 * button) ask the AI chat to send a message on its behalf. `nonce` allows
 * the same question text to be re-triggered even if it's identical to the
 * previous one.
 */
export interface PendingQuestion {
  text: string;
  nonce: number;
}

export const pendingAIQuestion = signal<PendingQuestion | null>(null);

export function askAI(text: string) {
  pendingAIQuestion.value = { text, nonce: Date.now() };
}
