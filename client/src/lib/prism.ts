// src/utils/prism-setup.ts
import Prism from "prismjs";

// 1. Importar lenguajes base primero
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-markup"; // HTML y XML
import "prismjs/components/prism-css";

// 2. Importar los frameworks y lenguajes de tu lista
import "prismjs/components/prism-jsx"; // React / Preact
import "prismjs/components/prism-tsx"; // React + TS
import "prismjs/components/prism-bash"; // Terminal / Git / Linux
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql"; // SQL General
import "prismjs/components/prism-plsql"; // Postgres (parecido)
import "prismjs/components/prism-docker";
import "prismjs/components/prism-yaml"; // Configs
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-powershell";

// Astro no viene por defecto en Prism, solemos usar 'markup' (HTML)
// o 'jsx' para simularlo, pero puedes agregar 'astro' si existe en tu versión
// o tratarlo como HTML.

export default Prism;
