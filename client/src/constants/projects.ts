export interface TechUsage {
  name: string;
  icon: string;
  explanation: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription?: string;
  techStack: TechUsage[];
  links?: {
    demo?: string;
    repo?: string;
    playStore?: string;
  };
}

const ICON_BASE = "/src/assets/icons/tech/";

export const PROJECTS: Project[] = [
  {
    id: "pagina-estatica",
    title: "Página Estática",
    category: "Sitio Web",
    description:
      "Sitio web estático de alto rendimiento con Lighthouse 100/100, SEO optimizado y despliegue automatizado en cada push a main.",
    longDescription:
      "Este proyecto nació de la necesidad de tener presencia online con rendimiento extremo. Cada página se genera en tiempo de compilación como HTML puro — cero JavaScript en el cliente a menos que sea estrictamente necesario. Integré content collections de Astro para que los autores puedan publicar artículos sin tocar código, con validación de frontmatter en build time. El deploy se automatizó con GitHub Actions: cada merge a main dispara el build y publica en cuestión de segundos.",
    techStack: [
      {
        name: "Astro",
        icon: ICON_BASE + "astro.svg",
        explanation:
          "Elegí Astro por su filosofía de zero JS by default. El sitio carga solo HTML y CSS — el JavaScript se envía únicamente a las islas que lo necesitan. La API de content collections me permitió validar el frontmatter de los posts en tiempo de compilación, atrapando errores antes de que lleguen a producción. Aprendí a pensar en islas de interactividad en lugar de hidratar todo el árbol de componentes.",
      },
      {
        name: "TailwindCSS",
        icon: ICON_BASE + "tailwindcss.svg",
        explanation:
          "Tailwind me permitió iterar rápido sin cambiar de contexto entre archivos. Las clases utilitarias se sienten naturales una vez que internalizás el sistema de diseño, y el dead code elimination de Vite deja solo el CSS que realmente usás. Lo complementé con un theme personalizado de colores para mantener consistencia visual sin escribir una sola línea de CSS custom.",
      },
      {
        name: "TypeScript",
        icon: ICON_BASE + "typescript.svg",
        explanation:
          "TypeScript atrapó en tiempo de compilación bugs de tipado que habrían sido horas de debugging en runtime. La integración con Astro fue excelente — los content collections schemas validan automáticamente la estructura de los posts del blog. La parte más valiosa fue tipar las props de los componentes: el autocompletado te salva de pasar props incorrectos.",
      },
      {
        name: "Markdown",
        icon: ICON_BASE + "markdown.svg",
        explanation:
          "MDX me permitió separar la escritura del contenido del código fuente. Los autores del blog no necesitan saber React ni Astro para publicar — escriben Markdown puro y el build lo convierte en HTML estático. Astro renderiza todo en tiempo de compilación, así que el costo para el usuario final es exactamente cero JavaScript adicional.",
      },
    ],
    links: {
      demo: "#",
      repo: "#",
    },
  },
  {
    id: "app-playstore",
    title: "App en Play Store",
    category: "Mobile",
    description:
      "Aplicación móvil publicada con usuarios activos. Notificaciones push, autenticación segura y sincronización de datos en tiempo real.",
    longDescription:
      "Una app mobile completa publicada en Google Play Store con base de usuarios activos. El desafío principal fue mantener una experiencia nativa fluida mientras compartíamos la lógica de negocio entre plataformas. Implementé autenticación con múltiples proveedores (email, Google, teléfono), notificaciones push segmentadas por preferencias de usuario, y sincronización en tiempo real con Firestore. El pipeline de CI/CD con EAS Build nos permitió iterar rápido: los testers recibían builds nuevas automáticamente en cada push a develop.",
    techStack: [
      {
        name: "React Native",
        icon: ICON_BASE + "react-native.svg",
        explanation:
          "React Native nos permitió compartir más del 80% del código entre iOS y Android sin sacrificar la experiencia nativa. El puente entre JavaScript y los módulos nativos fue la parte más desafiante — aprendí a identificar cuándo un feature necesitaba código nativo y cuándo podía resolverse del lado de JS. La comunidad de RN es enorme y los problemas raros casi siempre tienen solución en GitHub.",
      },
      {
        name: "Expo",
        icon: ICON_BASE + "expo.svg",
        explanation:
          "Expo simplificó el pipeline de build y eliminó la necesidad de abrir Xcode o Android Studio para tareas cotidianas. EAS Build nos dio CI/CD mobile sin configurar servidores — conectás el repo y Expo se encarga del resto. El trade-off fue que algunos módulos nativos no son compatibles con el managed workflow, así que eventualmente tuvimos que hacer eject para integrar un SDK de pagos.",
      },
      {
        name: "JavaScript",
        icon: ICON_BASE + "javascript.svg",
        explanation:
          "Arrancamos con JavaScript vanilla para movernos rápido en las primeras iteraciones. En retrospectiva, migrar a TypeScript después fue más doloroso de lo que habría sido empezar con tipos desde el día uno. La lección: JavaScript es excelente para prototipar, pero poné tipos apenas el proyecto tiene más de dos colaboradores.",
      },
      {
        name: "Firebase",
        icon: ICON_BASE + "firebase.svg",
        explanation:
          "Firebase nos dio autenticación por email, Google y teléfono en una tarde de integración. Firestore manejó la sincronización en tiempo real sin que tocáramos WebSockets. Las reglas de seguridad requirieron varias iteraciones — un mal config deja los datos expuestos — así que aprendí a auditar las Firebase Security Rules con el simulador antes de cada deploy.",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.example.app",
      repo: "#",
    },
  },
  {
    id: "gestion-proyectos",
    title: "Gestión de Proyectos",
    category: "Web App",
    description:
      "Aplicación full-stack para gestionar tareas, sprints y equipos. Dashboard con métricas de productividad y reportes exportables en PDF.",
    longDescription:
      "Una plataforma web completa para la gestión de proyectos y equipos. Construí un dashboard con métricas en tiempo real: burndown charts por sprint, productividad por desarrollador, y estimación de fechas de entrega. El backend usa middlewares encadenados (auth → validación → handler) que mantienen el código predecible y testeable. Las migraciones de base de datos versionadas con timestamp aseguran que dev, staging y producción nunca desincronicen sus schemas. El sistema de reportes genera PDFs server-side usando window functions de PostgreSQL para evitar N+1 queries.",
    techStack: [
      {
        name: "Preact",
        icon: ICON_BASE + "preact.svg",
        explanation:
          "Elegí Preact sobre React por el bundle size: 3KB contra 40KB. La API es casi idéntica y la compatibilidad con el ecosistema React fue perfecta para el 95% de los casos. Los pocos lugares donde necesité React explícito los resolví con aliases en Vite. En una app donde cada kilobyte impacta el LCP, los 3KB de Preact fueron la decisión correcta.",
      },
      {
        name: "Node.js",
        icon: ICON_BASE + "nodejs.svg",
        explanation:
          "Node.js en el backend nos dio la ventaja de usar el mismo lenguaje en front y back, compartiendo tipos e incluso validaciones (Zod schemas). Los middlewares de Express estructuraron el pipeline de requests de forma predecible. Tuve que entender el event loop en profundidad para debuggear un problema donde queries lentas bloqueaban requests no relacionadas.",
      },
      {
        name: "PostgreSQL",
        icon: ICON_BASE + "postgresql.svg",
        explanation:
          "PostgreSQL fue la elección correcta para modelar relaciones complejas entre usuarios, proyectos, tareas y dependencias. Las migraciones versionadas con timestamp evitaron conflictos entre los entornos de dev, staging y prod. Las window functions me salvaron para generar los reportes de productividad por sprint sin N+1 queries.",
      },
      {
        name: "Express",
        icon: ICON_BASE + "express.svg",
        explanation:
          "Express nos permitió levantar REST APIs en minutos con una estructura clara de middlewares. La cadena auth → validación → handler → response mantuvo el código organizado y testeable. Aprendí a estructurar los middlewares para que fallen temprano (early return) y no arrastren requests inválidos hasta el controller, ahorrando recursos del servidor.",
      },
    ],
    links: {
      demo: "#",
      repo: "#",
    },
  },
];
