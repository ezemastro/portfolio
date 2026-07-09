import { signal } from "@preact/signals";

/**
 * Shared signal for the image modal.
 * Set to { open: true } when any carousel slide is clicked.
 * Set to null to close the modal.
 * Future: extend with { url, alt } when real images arrive.
 */
export const activeModalImage = signal<{ open: true } | null>(null);
