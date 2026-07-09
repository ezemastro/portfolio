import { useState, useRef, useEffect, useCallback } from "preact/hooks";
import { createPortal } from "preact/compat";

interface Props {
  name: string;
  icon: string;
  explanation: string;
}

const POPOVER_WIDTH = 280;
const GAP = 8;

export default function TechBadge({ name, icon, explanation }: Props) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<ReturnType<typeof setTimeout>>();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    arrowSide: "top" as "top" | "bottom",
    arrowOffset: 0,
  });

  const computePos = useCallback(() => {
    const badgeEl = badgeRef.current;
    const popoverEl = popoverRef.current;
    if (!badgeEl) return;

    const badge = badgeEl.getBoundingClientRect();
    const popoverH = popoverEl?.getBoundingClientRect().height ?? 120;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const badgeCenter = badge.left + badge.width / 2;
    const spaceBelow = vh - badge.bottom - GAP;

    const showAbove =
      spaceBelow < popoverH + 16 && badge.top - GAP - popoverH > 16;
    const top = showAbove ? badge.top - GAP - popoverH : badge.bottom + GAP;

    let left = badgeCenter - POPOVER_WIDTH / 2;
    left = Math.max(8, Math.min(left, vw - POPOVER_WIDTH - 8));

    const arrowOffset = badgeCenter - left;

    setPos({
      top: Math.round(top),
      left: Math.round(left),
      arrowSide: showAbove ? "bottom" : "top",
      arrowOffset: Math.round(arrowOffset),
    });
  }, []);

  const doClose = useCallback(() => {
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setPositioned(false);
    }, 150);
  }, []);

  const show = useCallback(() => {
    clearTimeout(scheduleRef.current);
    clearTimeout(closeTimerRef.current);
    setClosing(false);
    setOpen(true);
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimeout(scheduleRef.current);
    scheduleRef.current = setTimeout(() => doClose(), 120);
  }, [doClose]);

  const cancelHide = useCallback(() => {
    clearTimeout(scheduleRef.current);
    clearTimeout(closeTimerRef.current);
    setClosing(false);
  }, []);

  const toggle = useCallback(() => {
    if (open && !closing) {
      doClose();
    } else if (!open) {
      show();
    }
  }, [open, closing, doClose, show]);

  // Position popover after it mounts — hide until coordinates are ready
  useEffect(() => {
    if (open) {
      setPositioned(false);
      requestAnimationFrame(() => {
        computePos();
        // One extra frame so the browser has applied the layout
        requestAnimationFrame(() => setPositioned(true));
      });
    }
  }, [open, computePos]);

  // Keep popover attached to badge during scroll/resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", computePos, { passive: true });
    window.addEventListener("resize", computePos);
    return () => {
      window.removeEventListener("scroll", computePos);
      window.removeEventListener("resize", computePos);
    };
  }, [open, computePos]);

  // Click outside dismiss
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (badgeRef.current?.contains(t) || popoverRef.current?.contains(t))
        return;
      doClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, doClose]);

  // Escape key dismiss
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") doClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, doClose]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(scheduleRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  const clampedOffset = Math.max(
    12,
    Math.min(pos.arrowOffset, POPOVER_WIDTH - 12),
  );

  const popoverVisible = positioned && !closing;
  const popoverLeaving = positioned && closing;

  return (
    <div class="relative inline-block" ref={badgeRef}>
      <button
        type="button"
        class="flex cursor-pointer items-center gap-1.5 rounded-full bg-theme-200 px-2.5 py-1 text-xs font-medium text-theme-700 transition-all duration-200 hover:bg-theme-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-theme-500 focus-visible:outline-none"
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        onClick={toggle}
        aria-expanded={open}
        aria-label={`${name}: ${explanation}`}
        title={name}
      >
        <img
          src={icon}
          alt=""
          class="size-3.5 object-contain"
          aria-hidden="true"
        />
        <span>{name}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            class={`fixed z-50 rounded-xl border border-theme-200 bg-white p-3.5 shadow-lg transition-[opacity,transform] duration-150 ${
              popoverVisible
                ? "opacity-100 scale-100"
                : "pointer-events-none opacity-0 scale-95"
            }`}
            style={{
              width: `${POPOVER_WIDTH}px`,
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              visibility: positioned || popoverLeaving ? "visible" : "hidden",
            }}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            <div class="mb-1 text-sm font-semibold leading-tight text-theme-800">
              {name}
            </div>
            <p class="max-h-48 overflow-y-auto text-xs leading-relaxed text-theme-600">
              {explanation}
            </p>
            {/* Arrow */}
            <div
              class={`absolute size-3 rotate-45 border border-theme-200 bg-white ${
                pos.arrowSide === "top"
                  ? "-top-1.5 border-b-0 border-r-0"
                  : "-bottom-1.5 border-t-0 border-l-0"
              }`}
              style={{ left: `${clampedOffset - 6}px` }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
