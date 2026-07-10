import { TECH_STACK } from "@/constants/techStack";
import { signal } from "@preact/signals";

const AUTO_INTERVAL_MS = 3500;
const RESUME_AFTER_MS = 9000;

export const activeTechSignal = signal(TECH_STACK[0].slug);

let autoId: number | null = null;
let resumeId: number | null = null;

const nextTech = () => {
  const i = TECH_STACK.findIndex((t) => t.slug === activeTechSignal.value);
  activeTechSignal.value = TECH_STACK[(i + 1) % TECH_STACK.length].slug;
};

const startAuto = () => {
  if (autoId === null) {
    autoId = window.setInterval(nextTech, AUTO_INTERVAL_MS);
  }
};

const stopAuto = () => {
  if (autoId !== null) {
    clearInterval(autoId);
    autoId = null;
  }
};

/**
 * User picked a tech by hand: show it, pause the auto-rotation, and resume
 * it after a while without further interaction.
 */
export const selectTech = (slug: string) => {
  activeTechSignal.value = slug;
  stopAuto();
  if (resumeId !== null) clearTimeout(resumeId);
  resumeId = window.setTimeout(startAuto, RESUME_AFTER_MS);
};

startAuto();
