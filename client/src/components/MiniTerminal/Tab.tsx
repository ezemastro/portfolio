import { TECH_STACK } from "@/constants/techStack";
import { activeTechSignal } from "./signal";
import { useTypewriter } from "@/hooks/useTypewriter";
export default function Tab() {
  const current = activeTechSignal.value;
  const tech = TECH_STACK.find((tech) => tech.slug === current);

  const animatedTabName = useTypewriter(
    tech?.tabName || TECH_STACK[0].tabName,
    20,
  );

  return (
    <div
      className={`bg-theme-800 border-theme-500 mx-2 mt-0.5 flex h-full items-center rounded-t-sm border-t-2 px-2`}
    >
      <img
        src={tech?.icon || TECH_STACK[0].icon}
        alt={tech?.name || "React logo"}
        key={tech?.slug}
        className="animate-flip-in-x animate-duration-fast size-4 object-cover"
      />
      <p className="text-theme-100 font-martian-mono min-w-24 px-2.5 text-xs font-light">
        {animatedTabName}
      </p>
    </div>
  );
}
