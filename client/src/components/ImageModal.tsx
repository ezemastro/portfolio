import { useEffect, useCallback, useRef } from "preact/hooks";
import { useSignalEffect } from "@preact/signals";
import { activeModalImage } from "./imageModalSignal";

/**
 * Fullscreen lightbox that shows when activeModalImage is set.
 * Renders once at the root level; controlled entirely by the signal.
 */
export default function ImageModal() {
  const isOpen = activeModalImage.value !== null;
  const backdropRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    activeModalImage.value = null;
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Trigger fade-in on mount when signal changes
  useSignalEffect(() => {
    const val = activeModalImage.value;
    if (val) {
      // Use rAF to ensure the DOM is ready before animating
      requestAnimationFrame(() => {
        const overlay = backdropRef.current;
        if (overlay) {
          overlay.classList.remove("opacity-0");
          overlay.classList.add("opacity-100");
        }
      });
    }
  });

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      class="bg-theme-950/80 fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300"
      onClick={(e) => {
        // Close only if clicking the backdrop itself, not children
        if (e.target === backdropRef.current) close();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={close}
        class="bg-theme-950/50 hover:bg-theme-950/80 focus-visible:ring-theme-400 absolute top-4 right-4 z-10 rounded-sm p-2 text-white transition-all duration-250 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Placeholder image large in center */}
      <div class="from-theme-200 to-theme-400 flex aspect-video w-full max-w-4xl items-center justify-center rounded-sm bg-gradient-to-br shadow-2xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          class="text-theme-500/40 size-24"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="8"
            width="40"
            height="32"
            rx="3"
            stroke="currentColor"
            stroke-width="2.5"
          />
          <path d="M4 16h40" stroke="currentColor" stroke-width="2.5" />
          <circle cx="10" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <circle cx="20" cy="12" r="1.5" fill="currentColor" />
          <rect
            x="10"
            y="22"
            width="12"
            height="4"
            rx="1"
            fill="currentColor"
          />
          <rect
            x="24"
            y="22"
            width="14"
            height="4"
            rx="1"
            fill="currentColor"
            opacity="0.6"
          />
          <rect
            x="10"
            y="29"
            width="28"
            height="4"
            rx="1"
            fill="currentColor"
            opacity="0.4"
          />
          <rect
            x="10"
            y="36"
            width="20"
            height="4"
            rx="1"
            fill="currentColor"
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
}
