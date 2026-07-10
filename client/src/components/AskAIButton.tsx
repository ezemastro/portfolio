import { askAI } from "@/components/aiChatSignal";

interface Props {
  projectTitle: string;
}

export default function AskAIButton({ projectTitle }: Props) {
  const handleClick = () => {
    askAI(
      `Contame más sobre el proyecto "${projectTitle}". ¿Cómo fue desarrollado, qué tecnologías usa y qué desafíos tuvo?`,
    );
    document
      .getElementById("ia")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      class="group from-theme-400 to-theme-500 hover:from-theme-500 hover:to-theme-600 ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-gradient-to-r px-3 py-1 text-xs font-medium text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 hover:shadow-[0_0_16px_1px] hover:shadow-theme-400/50"
      title="Preguntale a mi asistente con IA sobre este proyecto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-3.5 transition-transform duration-500 ease-out group-hover:rotate-90"
        aria-hidden="true"
      >
        <path
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        ></path>
        <path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"
        ></path><path d="M5 18H3"></path>
      </svg>
      Saber más
    </button>
  );
}
