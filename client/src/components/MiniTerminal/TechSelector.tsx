import { TECH_STACK } from "@/constants/techStack";
import { activeTechSignal, selectTech } from "./signal";

export default function TechSelector() {
  const handleChangeTech = (slug: string) => () => {
    selectTech(slug);
  };
  return (
    <div class="flex max-w-165 flex-wrap items-center justify-center gap-1.5">
      {TECH_STACK.map((tech) => {
        const isActive = activeTechSignal.value === tech.slug;
        return (
          <button
            type="button"
            onMouseEnter={handleChangeTech(tech.slug)}
            onClick={handleChangeTech(tech.slug)}
            key={tech.name}
            aria-label={tech.name}
            aria-pressed={isActive}
            class={`tech-chip tech-chip-glow flex size-9 cursor-pointer items-center justify-center p-1.5 active:scale-90 ${
              isActive
                ? "border-theme-400 scale-125 opacity-100 shadow-[0_0_16px_1px] shadow-theme-400/50"
                : "opacity-55 hover:scale-110 hover:opacity-100"
            }`}
          >
            <img
              src={tech.icon}
              alt=""
              title={tech.name}
              class="h-full w-full object-contain"
            />
          </button>
        );
      })}
    </div>
  );
}
