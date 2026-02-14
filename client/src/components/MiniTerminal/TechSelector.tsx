import { TECH_STACK } from "@/constants/techStack";

export default function TechSelector() {
  return (
    <div class="flex flex-wrap items-center justify-center gap-4 md:justify-start">
      {TECH_STACK.map((tech) => (
        <div
          key={tech.name}
          class="flex h-12 w-12 items-center justify-center rounded-sm p-2 transition-transform duration-200 hover:scale-110"
        >
          <img
            src={tech.icon}
            alt={tech.name}
            class="h-full w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}
