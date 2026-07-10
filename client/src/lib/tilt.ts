/**
 * Shared pointer-tilt effect: rotates an element toward the cursor with a
 * continuous rAF loop that lerps the applied rotation toward a target every
 * frame. Driving it this way (rather than setting a fresh CSS-transitioned
 * transform per mousemove) keeps it smooth regardless of how fast the mouse
 * moves — the previous per-component implementation restarted a CSS
 * transition on every event, which is what caused the stutter/overshoot at
 * high pointer speed.
 */

export interface TiltOptions {
  /** Max rotation in degrees. */
  maxTilt?: number;
  /** CSS perspective in px. */
  perspective?: number;
  /** Distance (px) from the element center at which tilt peaks, then decays. */
  peak?: number;
  /** Lerp factor per frame (0-1) — higher settles faster, lower is smoother. */
  lerp?: number;
  /**
   * "ambient" reacts to pointer position anywhere on the page, decaying with
   * distance (used by the hero terminal). "hover" only reacts while the
   * pointer is over the element itself, resetting to neutral on leave (used
   * by project cards).
   */
  mode?: "ambient" | "hover";
}

export function attachTilt(el: HTMLElement, opts: TiltOptions = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const {
    maxTilt = 6,
    perspective = 800,
    peak = 220,
    lerp = 0.15,
    mode = "hover",
  } = opts;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = 0;
  let active = mode === "ambient"; // ambient mode is always "live"

  const updateTarget = (clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const magnitude =
      dist < peak ? maxTilt * (dist / peak) : maxTilt * (peak / dist);

    targetY = (dx / dist) * magnitude;
    targetX = (-dy / dist) * magnitude;
  };

  const reset = () => {
    targetX = 0;
    targetY = 0;
  };

  const tick = () => {
    currentX += (targetX - currentX) * lerp;
    currentY += (targetY - currentY) * lerp;
    el.style.transform = `perspective(${perspective}px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg)`;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  let onMove: (e: MouseEvent) => void;
  let onLeaveViewport: ((e: MouseEvent) => void) | undefined;
  let onEnter: (() => void) | undefined;
  let onLeave: (() => void) | undefined;

  if (mode === "ambient") {
    onMove = (e) => updateTarget(e.clientX, e.clientY);
    document.addEventListener("mousemove", onMove);
    // document "mouseleave" never fires for normal cursor movement; detect
    // the pointer actually leaving the viewport via mouseout + relatedTarget.
    onLeaveViewport = (e) => {
      if (!e.relatedTarget) reset();
    };
    document.addEventListener("mouseout", onLeaveViewport);
  } else {
    onMove = (e) => {
      if (active) updateTarget(e.clientX, e.clientY);
    };
    onEnter = () => {
      active = true;
    };
    onLeave = () => {
      active = false;
      reset();
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
  }

  return function detachTilt() {
    cancelAnimationFrame(rafId);
    if (mode === "ambient") {
      document.removeEventListener("mousemove", onMove);
      if (onLeaveViewport) document.removeEventListener("mouseout", onLeaveViewport);
    } else {
      el.removeEventListener("mousemove", onMove);
      if (onEnter) el.removeEventListener("mouseenter", onEnter);
      if (onLeave) el.removeEventListener("mouseleave", onLeave);
    }
  };
}
