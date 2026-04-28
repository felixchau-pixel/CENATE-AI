"use client";

import { memo, useMemo } from "react";
import {
  PREVIEW_BUILTINS_ENTRIES_JS,
  PREVIEW_RUNTIME_SHIMS_JS,
} from "@/lib/ai/website/preview-runtime-shims";
import {
  buildCanonicalFileMap,
  LOCAL_IMPORT_RESOLUTION_SUFFIXES,
} from "@/lib/ai/website/preview-readiness";
import type { ProjectFile } from "@/lib/project-manifest";

type Props = {
  files: ProjectFile[];
};

/**
 * Renders a project's React app inside a sandboxed iframe by:
 * 1. Loading React UMD, Babel Standalone, and Tailwind CDN
 * 2. Building an in-memory module map from project.files[]
 * 3. Resolving imports relatively / via @/ alias
 * 4. Compiling each TSX file with Babel (typescript → react → commonjs)
 * 5. Evaluating from src/main.tsx (or src/App.tsx) into a #root mount
 *
 * This is the SINGLE source of truth for the preview — no PREVIEW_HTML needed.
 */
function PureProjectRuntimePreview({ files }: Props) {
  const srcDoc = useMemo(() => buildIframeDoc(files), [files]);

  return (
    <iframe
      className="h-full w-full border-0 bg-white"
      key={hashFiles(files)}
      sandbox="allow-scripts allow-same-origin"
      srcDoc={srcDoc}
      title="Live Preview"
    />
  );
}

function hashFiles(files: ProjectFile[]): string {
  // Cheap content hash for iframe key — forces reload when files change
  let h = 0;
  for (const f of files) {
    const s = `${f.path}::${f.content}`;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
  }
  return String(h);
}

export function buildIframeDoc(files: ProjectFile[]): string {
  // Filter to only files the runtime might need.
  // Configs (package.json, vite.config, tsconfig, postcss, tailwind.config, index.html)
  // are kept in the project but never imported, so they won't be loaded.
  const fileMap = Object.fromEntries(buildCanonicalFileMap(files));

  // Safely escape for embedding in <script> body
  const filesJson = JSON.stringify(fileMap)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview</title>
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
    html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
    #root { min-height: 100vh; }
    #cenate-error {
      display: none;
      position: fixed;
      left: 0; right: 0; bottom: 0;
      max-height: 50vh;
      overflow: auto;
      padding: 16px 20px;
      background: #fff5f5;
      color: #b91c1c;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      border-top: 2px solid #ef4444;
      z-index: 999999;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="cenate-error"></div>
  <script>
    (function () {
      try {
      const FILES = ${filesJson};

      function showError(msg) {
        var el = document.getElementById('cenate-error');
        if (el) {
          el.style.display = 'block';
          el.textContent = (el.textContent ? el.textContent + '\\n\\n' : '') + msg;
        }
        try { console.error(msg); } catch (_) {}
        try {
          document.body.innerHTML = '<pre style="margin:0;padding:16px;color:#b91c1c;background:#fff5f5;font:12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;white-space:pre-wrap;">' + String(msg) + '</pre>';
        } catch (_) {}
      }

      // Global error handlers — catch errors React's render cycle throws
      // outside the try/catch in run() (async render errors, event handlers)
      window.onerror = function (msg, source, line, col, error) {
        showError('Runtime error: ' + msg + (source ? ' (' + source + ':' + line + ')' : '') + (error && error.stack ? '\\n' + error.stack : ''));
        return true;
      };
      window.addEventListener('unhandledrejection', function (event) {
        var reason = event.reason;
        showError('Unhandled promise rejection: ' + (reason && reason.message ? reason.message : String(reason)));
      });

      function waitForGlobals(cb, attempts) {
        attempts = attempts || 0;
        if (typeof window.React !== 'undefined' && typeof window.ReactDOM !== 'undefined' && typeof window.Babel !== 'undefined') {
          cb();
          return;
        }
        if (attempts > 200) {
          showError('Preview runtime failed to load (React/Babel did not initialize within 10s).');
          return;
        }
        setTimeout(function () { waitForGlobals(cb, attempts + 1); }, 50);
      }

      var LOCAL_IMPORT_SUFFIXES = ${JSON.stringify(LOCAL_IMPORT_RESOLUTION_SUFFIXES)};

      function normalize(p) {
        const parts = p.split('/');
        const out = [];
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (part === '..') { out.pop(); }
          else if (part !== '.' && part !== '') { out.push(part); }
        }
        return out.join('/');
      }

      function resolvePath(importerPath, target) {
        if (target.startsWith('@/')) {
          return 'src/' + target.slice(2);
        }
        if (target.startsWith('src/')) {
          return target;
        }
        if (target.startsWith('./src/')) {
          return target.slice(2);
        }
        if (target.startsWith('.')) {
          var base = importerPath ? importerPath.split('/').slice(0, -1) : [];
          var parts = target.split('/');
          for (var pi = 0; pi < parts.length; pi++) {
            var part = parts[pi];
            if (part === '.') continue;
            if (part === '..') base.pop();
            else base.push(part);
          }
          return normalize(base.join('/'));
        }
        return target;
      }

      function buildResolution(basePath, fileMap) {
        var normalizedBase = normalize(basePath);
        var candidates = [];
        for (var i = 0; i < LOCAL_IMPORT_SUFFIXES.length; i++) {
          candidates.push(normalize(normalizedBase + LOCAL_IMPORT_SUFFIXES[i]));
        }
        var exactExists = fileMap[normalizedBase] !== undefined;
        var chosen = null;
        for (var j = 0; j < candidates.length; j++) {
          if (fileMap[candidates[j]] !== undefined) {
            chosen = candidates[j];
            break;
          }
        }
        return {
          basePath: normalizedBase,
          candidates: candidates,
          exactExists: exactExists,
          chosen: chosen,
        };
      }

      function toNamedDefaultAlias(filePath) {
        var normalized = normalize(filePath);
        var baseName = normalized.split('/').pop() || '';
        if (baseName.indexOf('.') > -1) {
          baseName = baseName.replace(/\.[^.]+$/, '');
        }
        if (baseName === 'index') {
          var parentParts = normalized.split('/');
          baseName = parentParts[parentParts.length - 2] || baseName;
        }
        return baseName
          .split(/[^A-Za-z0-9]+/)
          .filter(Boolean)
          .map(function(part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join('');
      }

      function finalizeModuleExports(filePath, exportsValue) {
        if (!exportsValue || exportsValue.default === undefined) {
          return exportsValue;
        }

        var alias = toNamedDefaultAlias(filePath);
        if (alias && exportsValue[alias] === undefined) {
          exportsValue[alias] = exportsValue.default;
        }

        return exportsValue;
      }

      function compile(source, filename) {
        return window.Babel.transform(source, {
          presets: [
            ['env', { modules: 'commonjs', loose: true }],
            'react',
            ['typescript', { allExtensions: true, isTSX: true, onlyRemoveTypeImports: false }],
          ],
          filename: filename,
          sourceType: 'module',
          compact: false,
          comments: false,
        }).code;
      }

      function run() {
        const fileMap = FILES;
        const moduleCache = Object.create(null);
        console.log('[preview-runtime] module-loader-start', {
          fileCount: Object.keys(fileMap).length,
          hasMainTsx: !!buildResolution('src/main', fileMap).chosen,
          hasAppTsx: !!(
            fileMap[buildResolution('src/App', fileMap).chosen] ||
            fileMap[buildResolution('App', fileMap).chosen]
          ),
        });

        // Wrap React + ReactDOM as ES-module-shaped builtins so Babel interop works
        const reactModule = Object.assign(
          { default: window.React, __esModule: true },
          window.React
        );
        const reactDomModule = Object.assign(
          { default: window.ReactDOM, __esModule: true },
          window.ReactDOM
        );
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
          'react': reactModule,
          'react-dom': reactDomModule,
          'react-dom/client': reactDomClientModule,
${PREVIEW_BUILTINS_ENTRIES_JS}
        };
        console.log('[preview-runtime] shim-loaded');
        console.log('[preview-runtime] builtins', Object.keys(builtins));

        if (!builtins.react || !builtins['react-dom'] || !builtins['react-dom/client']) {
          throw new Error('Missing React builtins');
        }

        if (
          !buildResolution('src/main', fileMap).chosen &&
          !buildResolution('src/App', fileMap).chosen &&
          !buildResolution('App', fileMap).chosen
        ) {
          throw new Error('Missing entry module');
        }

        function makeSafeProxy(name) {
          var proxy = { __esModule: true, default: function(p) { return window.React.createElement('span', null, p && p.children); } };
          if (typeof Proxy !== 'undefined') {
            proxy = new Proxy(proxy, {
              get: function(t, p) {
                if (p in t) return t[p];
                if (typeof p === 'string' && /^[A-Z]/.test(p)) {
                  var C = window.React.forwardRef(function(props, ref) {
                    return window.React.createElement('div', { ref: ref, className: props.className }, props.children);
                  });
                  C.displayName = p;
                  t[p] = C;
                  return C;
                }
                if (typeof p === 'string') { t[p] = function() {}; return t[p]; }
                return undefined;
              }
            });
          }
          return proxy;
        }

        function loadModule(importerPath, target) {
          if (builtins[target]) return builtins[target];

          var resolved = resolvePath(importerPath, target);
          var resolution = buildResolution(resolved, fileMap);
          var found = resolution.chosen;
          var isLocalImport = target.indexOf('./') === 0 || target.indexOf('../') === 0
            || target.indexOf('@/') === 0 || target.indexOf('src/') === 0 || target.indexOf('./src/') === 0;

          if (isLocalImport) {
            console.log('[preview-runtime] local-import-resolution', {
              importer: importerPath || 'entry',
              target: target,
              basePath: resolution.basePath,
              candidates: resolution.candidates,
              chosen: resolution.chosen,
              exactExists: resolution.exactExists
            });
          }

          if (!found || fileMap[found] === undefined) {
            // Log diagnostic info for debugging
            console.warn('[preview-runtime] module-not-found', {
              target: target,
              importer: importerPath,
              resolved: resolved,
              basePath: resolution.basePath,
              candidates: resolution.candidates,
              chosen: resolution.chosen,
              exactExists: resolution.exactExists,
              availableFiles: Object.keys(fileMap).filter(function(k) { return k.indexOf('.tsx') > -1 || k.indexOf('.ts') > -1; }).slice(0, 30)
            });

            if (isLocalImport) {
              // Local file imports that fail are real errors — don't mask them.
              // Throw so the preview shows a clear error instead of empty divs.
              throw new Error('Module not found: ' + target + ' (imported by ' + (importerPath || 'entry') + '). Resolved base: ' + resolution.basePath + '. Candidates: ' + resolution.candidates.join(', '));
            }

            // For bare npm packages not in builtins, return a safe proxy.
            // These are non-critical optional deps (e.g. animation libs).
            var proxyModule = makeSafeProxy(target);
            moduleCache[target] = proxyModule;
            return proxyModule;
          }

          if (moduleCache[found]) return moduleCache[found];

          // CSS handling — inject as style tag, return empty module
          if (found.endsWith('.css')) {
            let css = fileMap[found] || '';
            // Strip @tailwind / @apply directives — Tailwind CDN handles JIT scanning
            css = css.replace(/@tailwind\\s+[^;]+;/g, '');
            css = css.replace(/@apply\\s+[^;]+;/g, '');
            const style = document.createElement('style');
            style.setAttribute('data-source', found);
            style.textContent = css;
            document.head.appendChild(style);
            const empty = { __esModule: true, default: {} };
            moduleCache[found] = empty;
            return empty;
          }

          // JSON handling
          if (found.endsWith('.json')) {
            try {
              const parsed = JSON.parse(fileMap[found]);
              const mod = { __esModule: true, default: parsed };
              moduleCache[found] = mod;
              return mod;
            } catch (e) {
              throw new Error('Failed to parse JSON file ' + found + ': ' + e.message);
            }
          }

          // TS/TSX/JS/JSX — compile and evaluate
          let compiled;
          try {
            compiled = compile(fileMap[found], found);
          } catch (e) {
            throw new Error('Failed to compile ' + found + ':\\n' + (e && e.message ? e.message : String(e)));
          }

          const moduleObj = { exports: {} };
          // Pre-cache to handle circular deps
          moduleCache[found] = moduleObj.exports;

          const requireFn = function (t) {
            return loadModule(found, t);
          };

          let fn;
          try {
            fn = new Function(
              'require',
              'module',
              'exports',
              'React',
              'ReactDOM',
              compiled
            );
          } catch (e) {
            throw new Error('Failed to instantiate ' + found + ': ' + (e && e.message ? e.message : String(e)));
          }

          try {
            fn(requireFn, moduleObj, moduleObj.exports, window.React, window.ReactDOM);
          } catch (e) {
            throw new Error('Runtime error in ' + found + ': ' + (e && e.message ? e.message : String(e)) + (e && e.stack ? '\\n' + e.stack : ''));
          }

          finalizeModuleExports(found, moduleObj.exports);
          moduleCache[found] = moduleObj.exports;
          console.log('[preview-runtime] module-load-success', found);
          return moduleObj.exports;
        }

        // Find an entry. Prefer src/main.tsx (real Vite entry).
        // If main.tsx is missing, fall back to a synthetic mount of src/App.
        const mainEntry = buildResolution('src/main', fileMap).chosen;
        if (mainEntry && fileMap[mainEntry]) {
          console.log('[preview-runtime] mounting-entry', mainEntry);
          loadModule('', mainEntry);
          return;
        }

        const appEntry = buildResolution('src/App', fileMap).chosen || buildResolution('App', fileMap).chosen;
        if (!appEntry || !fileMap[appEntry]) {
          throw new Error('No entry file found. Looked for src/main.tsx, src/main.ts, src/App.tsx, App.tsx.');
        }

        // Synthetic mount: import App and render it into #root
        var appModule = loadModule('', appEntry);
        var App = (appModule && (appModule.default || appModule)) || null;
        if (!App) {
          throw new Error('Entry file ' + appEntry + ' does not export a default component.');
        }

        // ErrorBoundary for synthetic mount (main.tsx handles its own)
        class _EB extends window.React.Component {
          constructor(props) { super(props); this.state = { error: null }; }
          componentDidCatch(error) { showError('Render error: ' + error.message + (error.stack ? '\\n' + error.stack : '')); }
          render() {
            if (this.state.error) {
              return window.React.createElement('div', { style: { padding: 32, color: '#b91c1c', fontFamily: 'ui-monospace, monospace', fontSize: 13, whiteSpace: 'pre-wrap', background: '#fff5f5', minHeight: '100vh' } }, 'Render error: ' + this.state.error.message);
            }
            return this.props.children;
          }
        }
        _EB.getDerivedStateFromError = function(error) { return { error: error }; };

        var rootNode = document.getElementById('root') || document.body;
        var root = window.ReactDOM.createRoot(rootNode);
        root.render(window.React.createElement(_EB, null, window.React.createElement(App)));
        console.log('[preview-runtime] mount-success', appEntry);
      }

      waitForGlobals(function () {
        try {
          console.log('[preview-runtime] globals-ready');
          run();
        } catch (e) {
          console.error('[preview-runtime-error]', e);
          showError('Preview error: ' + (e && e.message ? e.message : String(e)) + (e && e.stack ? '\\n\\n' + e.stack : ''));
        }
      });
      } catch (e) {
        console.error('[preview-runtime-error]', e);
        document.body.innerHTML =
          "<pre style='margin:0;padding:16px;color:#b91c1c;background:#fff5f5;font:12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;white-space:pre-wrap;'>" +
          String(e && e.stack ? e.stack : e) +
          "</pre>";
      }
    })();
  </script>
  <script>
    /* Cenate preview capture — responds to parent postMessage requests */
    (function() {
      function capture(h2c, chatId) {
        var el = document.getElementById('root') || document.body;
        h2c(el, {
          useCORS: true,
          allowTaint: true,
          scale: 1.5,
          width: window.innerWidth,
          height: Math.min(window.innerHeight, 720),
          y: 0,
          logging: false,
        }).then(function(canvas) {
          var dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          window.parent.postMessage({ type: 'cenate-capture-result', chatId: chatId, dataUrl: dataUrl }, '*');
        }).catch(function(err) {
          window.parent.postMessage({ type: 'cenate-capture-error', chatId: chatId, error: String(err) }, '*');
        });
      }
      window.addEventListener('message', function(e) {
        if (!e.data || e.data.type !== 'cenate-capture-request') return;
        var chatId = e.data.chatId;
        if (window._cenateH2c) { capture(window._cenateH2c, chatId); return; }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        s.onload = function() { window._cenateH2c = window.html2canvas; capture(window._cenateH2c, chatId); };
        s.onerror = function() {
          window.parent.postMessage({ type: 'cenate-capture-error', chatId: chatId, error: 'html2canvas failed to load' }, '*');
        };
        document.head.appendChild(s);
      });
    })();
  </script>
</body>
</html>`;
}

export const ProjectRuntimePreview = memo(PureProjectRuntimePreview);
