import { parseProjectContent, type ProjectFile } from "@/lib/project-manifest";

export const LOCAL_IMPORT_RESOLUTION_SUFFIXES = [
  "",
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  "/index.tsx",
  "/index.ts",
  "/index.jsx",
  "/index.js",
] as const;

export type ImportResolutionResult = {
  importer: string;
  target: string;
  basePath: string;
  candidates: string[];
  exactExists: boolean;
  resolvedFile: string | null;
};

export type PreviewReadinessResult = {
  previewReady: boolean;
  isFallbackApp: boolean;
  errors: string[];
  entryFiles: {
    main: string | null;
    app: string | null;
  };
  mainImportResolutions: ImportResolutionResult[];
  appImportResolutions: ImportResolutionResult[];
};

export function normalizeModulePath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const output: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      output.pop();
      continue;
    }
    output.push(part);
  }

  return output.join("/");
}

export function buildCanonicalFileMap(
  files: Array<Pick<ProjectFile, "path" | "content">>
): Map<string, string> {
  const fileMap = new Map<string, string>();

  for (const file of files) {
    fileMap.set(normalizeModulePath(file.path), file.content);
  }

  return fileMap;
}

export function isLocalModuleSpecifier(target: string): boolean {
  return (
    target.startsWith(".") ||
    target.startsWith("@/") ||
    target.startsWith("src/") ||
    target.startsWith("./src/")
  );
}

export function collectStaticImports(source: string): string[] {
  return Array.from(source.matchAll(/from\s+["']([^"']+)["']/g)).map(
    (match) => match[1] ?? ""
  );
}

/**
 * Collect all import targets from a source file — both `from "..."` named
 * imports and bare `import "..."` side-effect imports (CSS, polyfills).
 * The runtime's `require()` will attempt to resolve both kinds, so the
 * readiness check must cover them.
 */
export function collectAllImportTargets(source: string): string[] {
  const targets: string[] = [];

  // Named / default / re-export: ... from "target"
  for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    if (match[1]) targets.push(match[1]);
  }

  // Side-effect imports: import "target" (no `from`, no bindings)
  // e.g. import "./index.css"
  for (const match of source.matchAll(/^\s*import\s+["']([^"']+)["']/gm)) {
    if (match[1]) targets.push(match[1]);
  }

  return [...new Set(targets)];
}

function resolveImportBase(importerPath: string, target: string): string {
  if (target.startsWith("@/")) {
    return normalizeModulePath(`src/${target.slice(2)}`);
  }

  if (target.startsWith("src/")) {
    return normalizeModulePath(target);
  }

  if (target.startsWith("./src/")) {
    return normalizeModulePath(target.slice(2));
  }

  if (!target.startsWith(".")) {
    return normalizeModulePath(target);
  }

  const importerDirectory = normalizeModulePath(importerPath)
    .split("/")
    .slice(0, -1)
    .join("/");
  const basePrefix = importerDirectory ? `${importerDirectory}/` : "";

  return normalizeModulePath(`${basePrefix}${target}`);
}

export function resolveLocalImport(
  fileMap: Map<string, string>,
  importerPath: string,
  target: string
): ImportResolutionResult {
  const basePath = resolveImportBase(importerPath, target);
  const candidates = LOCAL_IMPORT_RESOLUTION_SUFFIXES.map((suffix) =>
    normalizeModulePath(`${basePath}${suffix}`)
  );
  const exactExists = fileMap.has(basePath);
  const resolvedFile = candidates.find((candidate) => fileMap.has(candidate)) ?? null;

  return {
    importer: importerPath,
    target,
    basePath,
    candidates,
    exactExists,
    resolvedFile,
  };
}

function getRequiredFile(
  fileMap: Map<string, string>,
  path: string,
  errors: string[]
): string | null {
  const normalizedPath = normalizeModulePath(path);
  if (!fileMap.has(normalizedPath)) {
    errors.push(`missing ${normalizedPath}`);
    return null;
  }

  return normalizedPath;
}

export function evaluateProjectPreviewReadiness(
  rawContent: string
): PreviewReadinessResult {
  const parsed = parseProjectContent(rawContent);
  const fileMap = buildCanonicalFileMap(parsed.files);
  const errors: string[] = [];

  const mainEntry = getRequiredFile(fileMap, "src/main.tsx", errors);
  const appEntry = getRequiredFile(fileMap, "src/App.tsx", errors);

  let isFallbackApp = false;
  const appContent = appEntry ? fileMap.get(appEntry) ?? "" : "";

  if (appContent && !/<main\b[\s\S]*role="main"/.test(appContent)) {
    errors.push("App.tsx missing <main role=\"main\">");
  }

  if (appContent.includes("__CENATE_SCAFFOLD_FALLBACK__")) {
    isFallbackApp = true;
    errors.push("App.tsx is scaffold fallback");
  }

  const mainImportResolutions: ImportResolutionResult[] = [];
  const appImportResolutions: ImportResolutionResult[] = [];

  // Check ALL project code files for unresolved local imports — not just
  // main.tsx and App.tsx.  Section components (Navbar, Hero, Footer, etc.)
  // can import scaffold primitives or other generated files.  If any of
  // those imports fail to resolve, the preview runtime will throw a
  // "Module not found" error.  The shallow check that only looked at
  // entry files let these failures through as false "preview_ready".
  for (const [filePath, fileContent] of fileMap) {
    if (!/\.(tsx?|jsx?|mts|mjs)$/.test(filePath)) continue;

    const targets = collectAllImportTargets(fileContent);

    for (const target of targets) {
      if (!isLocalModuleSpecifier(target)) continue;

      const resolution = resolveLocalImport(fileMap, filePath, target);

      // Bucket into the legacy return fields for debug logging
      if (filePath === mainEntry) {
        mainImportResolutions.push(resolution);
      } else if (filePath === appEntry) {
        appImportResolutions.push(resolution);
      }

      if (!resolution.resolvedFile) {
        errors.push(
          `unresolved import from ${filePath}: ${target} -> ${resolution.basePath}`
        );
      }
    }
  }

  return {
    previewReady: errors.length === 0,
    isFallbackApp,
    errors,
    entryFiles: {
      main: mainEntry,
      app: appEntry,
    },
    mainImportResolutions,
    appImportResolutions,
  };
}
