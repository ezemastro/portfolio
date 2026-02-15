import { TECH_STACK } from "@/constants/techStack";
import { activeTechSignal } from "./signal";

export default function TechSelector() {
  const handleChangeTech = (slug: string) => () => {
    activeTechSignal.value = slug;
  };
  return (
    <div class="flex max-w-165 flex-wrap items-center justify-center gap-1 md:justify-start">
      {TECH_STACK.map((tech) => (
        <div
          onMouseEnter={handleChangeTech(tech.slug)}
          key={tech.name}
          class={`flex size-8 items-center justify-center rounded-sm p-1 transition-transform duration-200 ${activeTechSignal.value === tech.slug ? "scale-150 grayscale-0" : "grayscale-100"}`}
        >
          <img
            src={tech.icon}
            alt={tech.name}
            title={tech.name}
            class="h-full w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}
