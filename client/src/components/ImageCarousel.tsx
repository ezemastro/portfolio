import { useRef, useState, useCallback, useEffect } from "preact/hooks";
import { activeModalImage } from "./imageModalSignal";

interface Props {
  /** Number of placeholder slides to display */
  count: number;
}

const TRANSITION_DURATION = 300; // ms

export default function ImageCarousel({ count }: Props) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number>(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const goTo = useCallback(
    (newIndex: number) => {
      const clamped = Math.max(0, Math.min(newIndex, count - 1));
      setIndex(clamped);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(index - 1), [index, goTo]);
  const goNext = useCallback(() => goTo(index + 1), [index, goTo]);

  const openModal = useCallback(() => {
    activeModalImage.value = { open: true };
  }, []);

  // --- Touch handlers ---
  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setDragging(true);
    setDragOffset(0);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
    const delta = touchCurrentX.current - touchStartX.current;
    setDragOffset(delta);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;
    const delta = touchCurrentX.current - touchStartX.current;
    const threshold = 50;

    if (delta < -threshold) {
      goNext();
    } else if (delta > threshold) {
      goPrev();
    }

    touchStartX.current = null;
    setDragging(false);
    setDragOffset(0);
  }, [goNext, goPrev]);

  // --- Keyboard ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Prevent default drag behavior on the track
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const prevent = (e: Event) => e.preventDefault();
    el.addEventListener("dragstart", prevent);
    return () => el.removeEventListener("dragstart", prevent);
  }, []);

  const translateX = dragging
    ? -(index * 100) + (dragOffset / (trackRef.current?.clientWidth ?? 1)) * 100
    : -(index * 100);

  return (
    <div class="group/carousel relative overflow-hidden rounded-lg">
      {/* Slides track */}
      <div
        ref={trackRef}
        class="flex touch-pan-y select-none"
        style={{
          transform: `translateX(${translateX}%)`,
          transition: dragging
            ? "none"
            : `transform ${TRANSITION_DURATION}ms ease-in-out`,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            class="from-theme-200 to-theme-400 flex aspect-video w-full shrink-0 cursor-pointer items-center justify-center bg-gradient-to-br"
            onClick={openModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              fill="none"
              class="text-theme-500/40 size-14"
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
        ))}
      </div>

      {/* Arrows — only if more than 1 slide */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            class="bg-theme-950/30 hover:bg-theme-950/50 absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-1.5 text-white opacity-0 transition-all duration-200 group-hover/carousel:opacity-100 hover:scale-110 focus-visible:opacity-100"
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            class="bg-theme-950/30 hover:bg-theme-950/50 absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-white opacity-0 transition-all duration-200 group-hover/carousel:opacity-100 hover:scale-110 focus-visible:opacity-100"
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators — only if more than 1 slide */}
      {count > 1 && (
        <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              class={`size-2 rounded-full transition-all duration-200 ${
                i === index
                  ? "scale-110 bg-white shadow-sm"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
