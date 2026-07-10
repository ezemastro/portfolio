import { TECH_STACK } from "@/constants/techStack";
import { activeTechSignal } from "./signal";
import Prism from "@/lib/prism";
// import "prismjs/themes/prism-funky.css";
import "prismjs/themes/prism-okaidia.css";
import { useTypewriter } from "@/hooks/useTypewriter";
// TODO - Select other theme for dark mode

export default function Content() {
  const current = activeTechSignal.value;
  const tech = TECH_STACK.find((tech) => tech.slug === current);
  const content = tech?.content || "";

  const animatedRawCode = useTypewriter(content, 5);

  const highlightedCode = Prism.highlight(
    animatedRawCode,
    Prism.languages[tech?.lang || "html"],
    tech?.lang || "html",
  );

  return (
    <pre className={"w-full leading-5 break-words whitespace-pre-wrap"}>
      <code
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="text-theme-50 font-martian-mono text-xs font-light"
      />
    </pre>
  );
}
