import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseProjectContent } from "../lib/project-manifest";
import {
  PREVIEW_BUILTINS_ENTRIES_JS,
  PREVIEW_RUNTIME_SHIMS_JS,
} from "../lib/ai/website/preview-runtime-shims";
import { buildPreviewHtml, hashPreviewFiles } from "../lib/ai/website/preview-html";

function buildStandalonePreviewHtml(
  files: Array<{
    path: string;
    content: string;
  }>
): string {
  const base = buildPreviewHtml(files);
  const fileMap: Record<string, string> = {};
  for (const file of files) {
    fileMap[file.path] = file.content;
  }
  const filesJson = JSON.stringify(fileMap)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Generated Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: ['class'],
      theme: {
        container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
        extend: {
          fontFamily: {
            heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
            body: ['var(--font-body)', 'system-ui', 'sans-serif'],
          },
          colors: {
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
            secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
            destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
            muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
            accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
            popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
            card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
          },
          borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
          keyframes: {
            'fade-in-up': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
            'count-up': { from: { opacity: '0', transform: 'scale(0.8)' }, to: { opacity: '1', transform: 'scale(1)' } },
            'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
            'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
          },
          animation: {
            'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
            'count-up': 'count-up 0.5s ease-out forwards',
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up': 'accordion-up 0.2s ease-out',
          },
        },
      },
    }
  </script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; background: #0a0a0a; }
    #root { min-height: 100vh; }
    #cenate-error {
      display: none;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999999;
      max-height: 45vh;
      overflow: auto;
      white-space: pre-wrap;
      background: #fff1f2;
      color: #9f1239;
      padding: 16px;
      font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
      border-top: 2px solid #fb7185;
    }
  </style>
</head>
<body data-hash="${hashPreviewFiles(files)}">
  <div id="root"></div>
  <pre id="cenate-error"></pre>
  <script>
    (function () {
      const FILES = ${filesJson};

      function showError(message) {
        const error = document.getElementById("cenate-error");
        if (error) {
          error.style.display = "block";
          error.textContent = message;
        }
        console.error(message);
      }

      function normalizePath(value) {
        const parts = value.split("/");
        const next = [];
        for (const part of parts) {
          if (part === "..") {
            next.pop();
          } else if (part && part !== ".") {
            next.push(part);
          }
        }
        return next.join("/");
      }

      function resolvePath(importerPath, target) {
        if (target.startsWith("@/")) {
          return "src/" + target.slice(2);
        }
        if (target.startsWith("src/")) {
          return target;
        }
        if (target.startsWith(".")) {
          const base = importerPath.split("/").slice(0, -1);
          const parts = target.split("/");
          for (const part of parts) {
            if (part === ".") continue;
            if (part === "..") base.pop();
            else base.push(part);
          }
          return normalizePath(base.join("/"));
        }
        return target;
      }

      function resolveWithExtensions(value, fileMap) {
        const candidates = [
          value,
          value + ".tsx",
          value + ".ts",
          value + ".jsx",
          value + ".js",
          value + "/index.tsx",
          value + "/index.ts",
          value + "/index.jsx",
          value + "/index.js",
        ];
        for (const candidate of candidates) {
          if (fileMap[candidate] !== undefined) {
            return candidate;
          }
        }
        return value;
      }

      function compile(source, filename) {
        return window.Babel.transform(source, {
          presets: [
            ["env", { modules: "commonjs", loose: true }],
            "react",
            ["typescript", { allExtensions: true, isTSX: true, onlyRemoveTypeImports: false }],
          ],
          filename,
          sourceType: "module",
          compact: false,
          comments: false,
        }).code;
      }

      function run() {
        const fileMap = FILES;
        const moduleCache = Object.create(null);
        console.log("[preview-runtime] module-loader-start", {
          fileCount: Object.keys(fileMap).length,
          hasMainTsx: !!fileMap[resolveWithExtensions("src/main", fileMap)],
          hasAppTsx:
            !!fileMap[resolveWithExtensions("src/App", fileMap)] ||
            !!fileMap[resolveWithExtensions("App", fileMap)],
        });
        const reactModule = Object.assign({ default: window.React, __esModule: true }, window.React);
        const reactDomModule = Object.assign({ default: window.ReactDOM, __esModule: true }, window.ReactDOM);
        const reactDomClientModule = Object.assign(
          {
            default: window.ReactDOM,
            __esModule: true,
            createRoot: window.ReactDOM.createRoot,
            hydrateRoot: window.ReactDOM.hydrateRoot,
          },
          window.ReactDOM
        );
${PREVIEW_RUNTIME_SHIMS_JS}
        const builtins = {
          react: reactModule,
          "react-dom": reactDomModule,
          "react-dom/client": reactDomClientModule,
${PREVIEW_BUILTINS_ENTRIES_JS}
        };
        console.log("[preview-runtime] shim-loaded");
        console.log("[preview-runtime] builtins", Object.keys(builtins));

        function loadModule(importerPath, target) {
          if (builtins[target]) {
            return builtins[target];
          }
          const resolved = resolvePath(importerPath, target);
          const found = resolveWithExtensions(resolved, fileMap);
          if (!fileMap[found]) {
            throw new Error("Module not found: " + target + " → " + found);
          }
          if (moduleCache[found]) {
            return moduleCache[found];
          }
          if (found.endsWith(".css")) {
            let css = fileMap[found] || "";
            css = css.replace(/@tailwind\\s+[^;]+;/g, "");
            css = css.replace(/@apply\\s+[^;]+;/g, "");
            const style = document.createElement("style");
            style.setAttribute("data-source", found);
            style.textContent = css;
            document.head.appendChild(style);
            const empty = { __esModule: true, default: {} };
            moduleCache[found] = empty;
            return empty;
          }
          const compiled = compile(fileMap[found], found);
          const moduleObject = { exports: {} };
          moduleCache[found] = moduleObject.exports;
          const requireFunction = function (nextTarget) {
            return loadModule(found, nextTarget);
          };
          const fn = new Function("require", "module", "exports", "React", "ReactDOM", compiled);
          fn(requireFunction, moduleObject, moduleObject.exports, window.React, window.ReactDOM);
          moduleCache[found] = moduleObject.exports;
          console.log("[preview-runtime] module-load-success", found);
          return moduleObject.exports;
        }

        const entryModule = resolveWithExtensions("src/main", fileMap);
        if (!builtins.react || !builtins["react-dom"]) {
          throw new Error("Missing React builtins");
        }
        if (!fileMap[entryModule]) {
          throw new Error("Missing entry module");
        }
        loadModule("", entryModule);
        console.log("[preview-runtime] mount-success", entryModule);
      }

      function waitForGlobals(attempt) {
        if (window.React && window.ReactDOM && window.Babel) {
          try {
            console.log("[preview-runtime] globals-ready");
            run();
          } catch (error) {
            console.error("[preview-runtime-error]", error);
            showError(String(error && error.stack ? error.stack : error));
          }
          return;
        }
        if (attempt > 200) {
          showError("Preview runtime failed to initialize within 10 seconds.");
          return;
        }
        setTimeout(function () {
          waitForGlobals(attempt + 1);
        }, 50);
      }

      waitForGlobals(0);
    })();
  </script>
</body>
</html>`;
}

function main() {
  const sourcePath = process.argv[2];
  const outputPath = process.argv[3];

  if (!sourcePath || !outputPath) {
    throw new Error(
      "Usage: node --import tsx ./scripts/render-generated-preview.ts <artifact.txt> <preview.html>"
    );
  }

  const raw = readFileSync(sourcePath, "utf8");
  const parsed = parseProjectContent(raw);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buildStandalonePreviewHtml(parsed.files), "utf8");
}

main();
