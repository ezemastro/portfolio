import { TECH_STACK } from "@/constants/techStack";
import { signal } from "@preact/signals";

let current = 0;
export const activeTechSignal = signal(TECH_STACK[current].slug);
let timeoutId: number | null = null;

const startAutoChange = () => {
  timeoutId = window.setTimeout(() => {
    current = (current + 1) % TECH_STACK.length;
    activeTechSignal.value = TECH_STACK[current].slug;
    startAutoChange();
  }, 3000);
};

const stopAutoChange = () => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

activeTechSignal.subscribe(() => {
  stopAutoChange();
});

startAutoChange();
