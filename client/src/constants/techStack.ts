import type { JSX } from "preact/jsx-runtime";

interface Tech {
  name: string;
  slug: string;
  lang: string;
  tabName: string;
  icon: string;
  /** One-line description shown on hover in the "Sobre mí" stack grid. */
  description: string;
  content: string;
}
const ICON_BASE_PATH = "/icons/tech/";

export const TECH_STACK: Tech[] = [
  {
    name: "JavaScript",
    slug: "javascript",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "javascript.svg",
    description:
      "El lenguaje que corre en todos lados, a veces a pesar de sus propias reglas.",
    // Medio malo
    content: `// The beauty of loose typing
  const result = '5' - 3; // 2
  const chaos = '5' + 3;  // "53"
  const pain = [] + {};   // "[object Object]"

  // I actually understand why this happens.
  // (Send help)`,
  },
  {
    name: "TypeScript",
    slug: "typescript",
    lang: "ts",
    tabName: "index.ts",
    icon: ICON_BASE_PATH + "typescript.svg",
    description:
      "JavaScript con red de seguridad: atrapa errores de tipos antes de que lleguen a producción.",
    content: `interface Developer {
  coffee: boolean;
  skills: string[];
  sleep?: never; // Type 'Sleep' is optional/undefined
  }

  // Error: Property 'socialLife' is missing
  // in type 'FullStackDeveloper'.`,
  },
  {
    name: "React",
    slug: "react",
    lang: "tsx",
    tabName: "index.tsx",
    icon: ICON_BASE_PATH + "reactjs.svg",
    description:
      "Librería de UI basada en componentes — la uso a través de Preact en la mayoría de mis proyectos.",
    content: `const Life = () => {
  const [bugs, setBugs] = useState(99);

  useEffect(() => {
    if (bugs === 0) {
      // This never actually runs
      celebrate();
    } else {
      fixOne(); // bugs becomes 100?
    }
  }, [bugs]);
};`,
  },
  {
    name: "Astro",
    slug: "astro",
    lang: "jsx",
    tabName: "index.astro",
    icon: ICON_BASE_PATH + "astro.svg",
    description:
      "Framework zero-JS por defecto: hidrata solo lo que realmente necesita interactividad.",
    // Muy del lenguaje
    content: `---
// Server Side Only (The magic zone)
const data = await fetchFromDB();
const jsShippedToClient = 0;
---
<h1>Fast by default.</h1>
<script>
  console.log("Only load me if you need me");
</script>`,
  },
  {
    name: "Preact",
    slug: "preact",
    lang: "tsx",
    tabName: "index.tsx",
    icon: ICON_BASE_PATH + "preact.svg",
    description:
      "React de 3KB: misma API, una fracción del peso. Ideal cuando cada kilobyte importa.",
    content: `import { h, render } from 'preact';

  // Like React, but lighter.
  // 3kb of pure power.
  render(<h1>Fast!</h1>, document.body);`,
  },
  {
    name: "Tailwind CSS",
    slug: "tailwind",
    lang: "html",
    tabName: "index.html",
    icon: ICON_BASE_PATH + "tailwindcss.svg",
    description:
      "CSS utilitario: itero la interfaz sin salir del markup ni inventar nombres de clases.",
    content: `<div class="flex justify-center items-center
          w-full h-screen bg-gray-900
          text-white font-bold border-2
          border-red-500 hover:scale-110
          transition-all duration-300...">
Centering divs is finally easy.
</div>`,
  },
  {
    name: "CSS",
    slug: "css",
    lang: "css",
    tabName: "index.css",
    icon: ICON_BASE_PATH + "css.svg",
    description:
      "La base de todo layout y animación del sitio, sin frameworks de por medio cuando no hacen falta.",
    content: `.my-life {
  display: flex;
  justify-content: center;
  align-items: center;
  /* If this fails, use absolute positioning */
  position: relative;
  z-index: 9999 !important; /* Sorry not sorry */
}`,
  },
  {
    name: "HTML",
    slug: "html",
    lang: "html",
    tabName: "index.html",
    icon: ICON_BASE_PATH + "html.svg",
    description:
      "Semántica antes que divs genéricos — accesibilidad y SEO empiezan acá.",
    // Medio malo
    content: `<!DOCTYPE html>
<div id="wrapper">
  <div class="center">
    <p>Semantic tags are my passion.</p>
  </div>
</div>`,
  },
  {
    name: "Node.js",
    slug: "node",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "nodejs.svg",
    description:
      "Runtime de JavaScript en el backend — mismo lenguaje en cliente y servidor.",
    content: `const fs = require('fs');
const path = require('path');

// Callback Hell simulation
fs.readFile('resume.txt', (err, data) => {
  if (err) throw new Error("File not found");
  // Parsing binary buffers manually...
  process.stdout.write("Running purely on V8");
});`,
  },
  {
    name: "Express.js",
    slug: "express",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "express.svg",
    description:
      "Framework minimalista para armar APIs REST con middlewares encadenados.",
    content: `const app = express();

// The middleware chain
app.use((req, res, next) => {
  console.log('Request received at:', Date.now());
  // If I forget next(), the browser hangs forever
  next();
});

app.get('/', (req, res) => res.send('Hello World'));`,
  },
  {
    name: "Bash",
    slug: "bash",
    lang: "bash",
    tabName: "index.sh",
    icon: ICON_BASE_PATH + "bash.svg",
    description:
      "Scripts de automatización, deploys y tareas repetitivas desde la terminal.",
    content: `#!/bin/bash
# Do not run this on production
if [ "$USER" != "root" ]; then
  echo "Permission denied. You have no power here."
  exit 1
fi
rm -rf /tmp/* # Living dangerously`,
  },
  {
    name: "PowerShell",
    slug: "powershell",
    lang: "powershell",
    tabName: "index.ps1",
    icon: ICON_BASE_PATH + "powershell.svg",
    description:
      "Shell y scripting en entornos Windows — pipeline de objetos en vez de texto plano.",
    content: `# Verbose but powerful
Get-ChildItem -Path C:\Projects -Recurse |
  Where-Object { $_.Name -like "*node_modules*" } |
  Measure-Object -Property Length -Sum

# Calculating the weight of the universe...`,
  },
  {
    name: "Python",
    slug: "python",
    lang: "python",
    tabName: "index.py",
    icon: ICON_BASE_PATH + "python.svg",
    description:
      "Para automatización y scripts rápidos: todo lo que se resuelve mejor con indentación que con llaves.",
    content: `import antigravity

def clean_code():
    # No curly braces, just pure indentation
    try:
        return True
    except IndentationError:
        print("You mixed tabs and spaces!")`,
  },
  //   {
  //     name: "SQL",
  //     slug: "sql",
  //     lang: "sql",
  //     tabName: "index.sql",
  //     icon: ICON_BASE_PATH + "sql.svg",
  //     // Esta raro
  //     content: `-- The classic mistake
  // SELECT * FROM users
  // WHERE id = 1;
  // -- Forgot the WHERE clause on the UPDATE?
  // -- Congratulations, you just renamed everyone 'Bob'.`,
  //   },
  {
    name: "MySQL",
    slug: "mysql",
    lang: "sql",
    tabName: "index.sql",
    icon: ICON_BASE_PATH + "mysql.svg",
    description:
      "Base de datos relacional clásica — sólida para modelos de datos bien definidos.",
    content: `ALTER TABLE orders
ADD INDEX idx_user_date (user_id, created_at);

-- Query went from 5.2s to 0.04s.
-- I am a database god.`,
  },
  {
    name: "PostgreSQL",
    slug: "postgresql",
    lang: "sql",
    tabName: "index.sql",
    icon: ICON_BASE_PATH + "postgresql.svg",
    description:
      "Mi base relacional de referencia: JSONB, window functions y transacciones ACID.",
    content: `/* JSONB: When you want NoSQL
   inside your SQL */
SELECT data->>'preferences'
FROM user_settings
WHERE data @> '{"theme": "dark"}';

-- ACID compliant AND flexible. Perfect.`,
  },
  {
    name: "MongoDB",
    slug: "mongodb",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "mongodb.svg",
    description:
      "Base NoSQL orientada a documentos — esquemas flexibles cuando el dominio cambia rápido.",
    content: `db.collection('ideas').aggregate([
  { $match: { status: 'feasible' } },
  { $lookup: { from: 'time', ... } },
  { $project: { sleep: 0 } }
]);
// Schemas? Where we're going,
// we don't need schemas.`,
  },
  {
    name: "JSON",
    slug: "json",
    lang: "json",
    tabName: "index.json",
    icon: ICON_BASE_PATH + "json.svg",
    description:
      "El formato universal de intercambio de datos — configs, APIs, todo pasa por acá.",
    content: `{
  "name": "package.json",
  "scripts": {
    "start": "node index.js",
    "fix": "rm -rf node_modules && npm i"
  },
  "dependencies": {
    // "comment": "Wait, JSON doesn't support comments!"
  }
}`,
  },
  {
    name: "Docker",
    slug: "docker",
    lang: "dockerfile",
    tabName: "Dockerfile",
    icon: ICON_BASE_PATH + "docker.svg",
    description:
      "Empaqueto apps en contenedores para que corran igual en dev, staging y producción.",
    content: `FROM node:18-alpine

# It works on my machine...
# So we ship my machine.

WORKDIR /app
COPY . .
RUN npm ci --only=production
CMD ["node", "server.js"]`,
  },
  {
    name: "Git",
    slug: "git",
    lang: "bash",
    tabName: "index.sh",
    icon: ICON_BASE_PATH + "git.svg",
    description:
      "Control de versiones — ramas, commits atómicos y un historial que cuenta la historia del proyecto.",
    content: `$ git status
On branch master
Your branch is ahead of 'origin/master' by 1 commit.

$ git merge develop
CONFLICT (content): Merge conflict in file.js
# Time to choose between code and friendship.`,
  },
  {
    name: "GitHub",
    slug: "github",
    lang: "bash",
    tabName: "index.sh",
    icon: ICON_BASE_PATH + "github.svg",
    description:
      "Hosting de repos y pull requests — donde vive la colaboración de cada proyecto.",
    content: `git push origin feature/new-ui

# Opening Pull Request...
# CI/CD: Failed (Linting error on line 432)
# Reviewer: "LGTM, but please fix the typo."
# Me: *Sigh*`,
  },
  {
    name: "NPM",
    slug: "npm",
    lang: "bash",
    tabName: "index.sh",
    icon: ICON_BASE_PATH + "npm.svg",
    description:
      "Gestor de paquetes de Node: dependencias, scripts y el ecosistema de JavaScript.",
    content: `$ npm install universe-library

# added 1452 packages from 843 contributors
# audited 1453 packages in 4.32s
# found 12 vulnerabilities (6 high)
# Me: "I'll pretend I didn't see that."`,
  },
  {
    name: "Linux",
    slug: "linux",
    lang: "bash",
    tabName: "index.sh",
    icon: ICON_BASE_PATH + "linux.svg",
    description:
      "Mi sistema operativo de trabajo — terminal, permisos y control real sobre el entorno.",
    content: `$ ls -la
drwxr-xr-x  user  group  4096  .config
-rwxrwxrwx  root  root   1234  script.sh

$ chmod 777 script.sh
# Security team having a heart attack right now.`,
  },
  {
    name: "Ubuntu",
    slug: "ubuntu",
    lang: "bash",
    tabName: "index.sh",
    icon: ICON_BASE_PATH + "ubuntu.svg",
    description: "La distro Linux que uso a diario para desarrollo y servidores.",
    content: `$ sudo apt-get update
$ sudo apt-get upgrade

# 453MB of archives to get.
# Do you want to continue? [Y/n] Y
# (Watching text scroll matrix style)`,
  },
  {
    name: "VS Code",
    slug: "vscode",
    lang: "json",
    tabName: "settings.json",
    icon: ICON_BASE_PATH + "vscode.svg",
    description:
      "Mi editor: extensiones, formateo automático y un tema oscuro que cuida los ojos.",
    content: `{
  "editor.fontFamily": "'JetBrains Mono', monospace",
  "editor.fontLigatures": true,
  "editor.formatOnSave": true,
  "workbench.colorTheme": "Tokyo Night",
  // 50 extensions installed.
  // RAM usage: High.
}`,
  },
  {
    name: "React Native",
    slug: "react-native",
    lang: "tsx",
    tabName: "App.tsx",
    icon: ICON_BASE_PATH + "react-native.svg",
    description:
      "React aplicado a mobile — comparto lógica entre iOS y Android sin perder experiencia nativa.",
    content: `import { Platform } from 'react-native';

const styles = StyleSheet.create({
  header: {
    height: Platform.OS === 'ios' ? 100 : 80,
    marginTop: Platform.OS === 'ios' ? 0 : 24,
    // Trying to make Android look nice
  }
});`,
  },
  {
    name: "Eslint",
    slug: "eslint",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "eslint.svg",
    description:
      "Linter que atrapa errores y fuerza consistencia antes de que el código llegue a review.",
    content: `/* eslint-disable react-hooks/exhaustive-deps */

// Warning: 'variable' is assigned a value
// but never used.

// Me: "I'm saving it for later!"`,
  },
  {
    name: "Prettier",
    slug: "prettier",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "prettier.svg",
    description: "Formateo automático de código — cero discusiones de estilo en los PRs.",
    content: `// Before Prettier:
const x=1;function test(){return x}

// After Save (Ctrl+S):
const x = 1;
function test() {
  return x;
}
// Ah, inner peace.`,
  },
  {
    name: "Vitest",
    slug: "vitest",
    lang: "ts",
    tabName: "index.test.ts",
    icon: ICON_BASE_PATH + "vitest.svg",
    description: "Framework de testing rápido, integrado nativamente con Vite.",
    content: `import { expect, test } from 'vitest';

test('math works', () => {
  expect(1 + 1).toBe(2);
});

test('my code works', () => {
  // TODO: Fix this later
  // expect(complexLogic()).toBe(true);
});`,
  },
  {
    name: "Jest",
    slug: "jest",
    lang: "ts",
    tabName: "index.test.ts",
    icon: ICON_BASE_PATH + "jest.svg",
    description: "Testing framework para JavaScript/TypeScript — mocks, snapshots y cobertura.",
    // Hecho con copilot, es largo
    content: `import { describe, it, expect } from '@jest/globals';

describe('Array', () => {
  it('should add elements correctly', () => {
    const arr = [];
    arr.push(1);
    expect(arr).toEqual([1]);
  });

  it('should fail this test', () => {
    // expect(true).toBe(false); // Oops, forgot to fix this!
  });
});`,
  },
  {
    name: "Zod",
    slug: "zod",
    lang: "ts",
    tabName: "index.ts",
    icon: ICON_BASE_PATH + "zod.svg",
    description:
      "Validación de esquemas con inferencia de tipos — chequeo en runtime lo que TypeScript solo valida en compilación.",
    content: `const UserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  age: z.number().gte(18)
});

// "Validation failed: Expected number,
// received string" -> No more runtime crashes.`,
  },
  {
    name: "Markdown",
    slug: "markdown",
    lang: "md",
    tabName: "README.md",
    icon: ICON_BASE_PATH + "markdown.svg",
    description: "Escribo documentación y contenido sin salir del texto plano.",
    content: `# Project Documentation

## Getting Started
1. Clone repo
2. npm install
3. **Pray** it works.

[Link to nowhere](404)`,
  },
  {
    name: "React Router",
    slug: "react-router",
    lang: "tsx",
    tabName: "index.tsx",
    icon: ICON_BASE_PATH + "react-router.svg",
    description: "Ruteo del lado del cliente para aplicaciones React de una sola página.",
    content: `<Routes>
  <Route path="/" element={<Home />} />
  <Route path="*" element={<NotFound />} />
</Routes>

// navigate('/somewhere', { replace: true })
// Client-side routing magic.`,
  },
  {
    name: "Zustand",
    slug: "zustand",
    lang: "ts",
    tabName: "index.ts",
    icon: ICON_BASE_PATH + "zustand.svg",
    description:
      "Manejo de estado global simple, sin el boilerplate de soluciones más pesadas.",
    content: `import create from 'zustand';

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));

// Global state management without the boilerplate of Redux.`,
  },
  {
    name: "Vite",
    slug: "vite",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "vite.svg",
    description: "Build tool y dev server ultrarrápido — HMR casi instantáneo.",
    content: `// Vite Config
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    hmr: true // Hot Module Replacement
  }
});
// Bundle start: 200ms. Goodbye Webpack.`,
  },
  {
    name: "Github Actions",
    slug: "github-actions",
    lang: "yaml",
    tabName: "workflow.yml",
    icon: ICON_BASE_PATH + "github-actions.svg",
    description: "CI/CD directo en el repo: tests y deploys automáticos en cada push.",
    content: `name: Deploy to Production
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
      # Please turn green...`,
  },
  {
    name: "JWT",
    slug: "jwt",
    lang: "js",
    tabName: "index.js",
    icon: ICON_BASE_PATH + "jwt.svg",
    description: "Tokens firmados para autenticación stateless entre cliente y servidor.",
    content: `// Header.Payload.Signature
const token = "eyJhbGciOiJIUzI1Ni...";

// Decoding...
// { "id": 123, "role": "admin", "exp": 169... }
// Don't lose the secret key.`,
  },
];
