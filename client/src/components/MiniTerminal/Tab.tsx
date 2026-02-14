import { TECH_STACK } from "@/constants/techStack";
export default function Tab() {
  return (
    <div
      className={`bg-theme-800 border-theme-500 mx-2 mt-0.5 flex h-full items-center rounded-t-sm border-t-2 px-2`}
    >
      <img
        src={TECH_STACK[0].icon}
        alt="React logo"
        className="size-4 object-cover"
      />
      <p className="text-theme-100 font-martian-mono px-2.5 text-xs">
        index.tsx
      </p>
    </div>
  );
}
