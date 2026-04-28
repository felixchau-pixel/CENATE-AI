import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

export type Severity = "error" | "warning" | "info";

export type Finding = {
  severity: Severity;
  path?: string;
  message: string;
};

export type ResolvedColor = {
  type: "color";
  hex: string;
  r: number;
  g: number;
  b: number;
  a?: number;
  luminance: number;
};

export type ResolvedDimension = {
  type: "dimension";
  value: number;
  unit: string;
};

export type ResolvedTypography = {
  type: "typography";
  fontFamily?: string;
  fontSize?: ResolvedDimension;
  fontWeight?: number;
  lineHeight?: ResolvedDimension;
  letterSpacing?: ResolvedDimension;
  fontFeature?: string;
  fontVariation?: string;
};

export type ResolvedValue =
  | ResolvedColor
  | ResolvedDimension
  | ResolvedTypography
  | string
  | number;

export type ComponentDef = {
  properties: Map<string, ResolvedValue>;
  unresolvedRefs: string[];
};

export type DesignSystemState = {
  name?: string;
  description?: string;
  colors: Map<string, ResolvedColor>;
  typography: Map<string, ResolvedTypography>;
  rounded: Map<string, ResolvedDimension>;
  spacing: Map<string, ResolvedDimension>;
  components: Map<string, ComponentDef>;
  symbolTable: Map<string, ResolvedValue>;
  sections: string[];
  documentSections: Array<{ heading: string; content: string }>;
};

export type TailwindThemeExtend = {
  colors: Record<string, string>;
  fontFamily: Record<string, string[]>;
  fontSize: Record<string, [string, Record<string, string>]>;
  borderRadius: Record<string, string>;
  spacing: Record<string, string>;
};

export type LintReport = {
  designSystem: DesignSystemState;
  findings: Finding[];
  summary: { errors: number; warnings: number; infos: number };
  sections: string[];
  documentSections: Array<{ heading: string; content: string }>;
  tailwindThemeExtend: TailwindThemeExtend;
};

export type ParsedDesignSpec = {
  name?: string;
  description?: string;
  colors?: Record<string, string>;
  typography?: Record<string, Record<string, string | number>>;
  rounded?: Record<string, string>;
  spacing?: Record<string, string | number>;
  components?: Record<string, Record<string, string | number>>;
  sections: string[];
  documentSections: Array<{ heading: string; content: string }>;
};

export type DesignSpecDiff = {
  tokens: {
    colors: DiffBucket;
    typography: DiffBucket;
    rounded: DiffBucket;
    spacing: DiffBucket;
    components: DiffBucket;
  };
  findings: {
    before: LintReport["summary"];
    after: LintReport["summary"];
    delta: { errors: number; warnings: number };
  };
  regression: boolean;
};

type DiffBucket = {
  added: string[];
  removed: string[];
  modified: string[];
};

const SECTION_ORDER = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
] as const;

const SECTION_ALIASES: Record<string, (typeof SECTION_ORDER)[number]> = {
  "Brand & Style": "Overview",
  "Layout & Spacing": "Layout",
  Elevation: "Elevation & Depth",
};

const VALID_COMPONENT_PROPERTIES = new Set([
  "backgroundColor",
  "textColor",
  "typography",
  "rounded",
  "padding",
  "size",
  "height",
  "width",
]);

const VALID_UNITS = new Set(["px", "rem", "em", "%", "", "fr", "vh", "vw"]);
const MAX_REFERENCE_DEPTH = 10;

export function parseDesignSpec(content: string): ParsedDesignSpec {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!frontmatterMatch) {
    return {
      sections: extractSections(content).map((section) => section.heading).filter(Boolean),
      documentSections: extractSections(content),
    };
  }

  const raw = YAML.parse(frontmatterMatch[1]) as Record<string, unknown> | null;
  const documentSections = extractSections(content);
  const sections = documentSections.map((section) => section.heading).filter(Boolean);

  return {
    name: typeof raw?.name === "string" ? raw.name : undefined,
    description: typeof raw?.description === "string" ? raw.description : undefined,
    colors: isRecord(raw?.colors) ? (raw?.colors as Record<string, string>) : undefined,
    typography: isRecord(raw?.typography)
      ? (raw?.typography as Record<string, Record<string, string | number>>)
      : undefined,
    rounded: isRecord(raw?.rounded) ? (raw?.rounded as Record<string, string>) : undefined,
    spacing: isRecord(raw?.spacing)
      ? (raw?.spacing as Record<string, string | number>)
      : undefined,
    components: isRecord(raw?.components)
      ? (raw?.components as Record<string, Record<string, string | number>>)
      : undefined,
    sections,
    documentSections,
  };
}

export function lintDesignSpec(content: string): LintReport {
  const parsed = parseDesignSpec(content);
  const findings: Finding[] = [];
  const symbolTable = new Map<string, ResolvedValue>();
  const colors = new Map<string, ResolvedColor>();
  const typography = new Map<string, ResolvedTypography>();
  const rounded = new Map<string, ResolvedDimension>();
  const spacing = new Map<string, ResolvedDimension>();
  const components = new Map<string, ComponentDef>();

  if (!parsed.name) {
    findings.push({ severity: "error", path: "name", message: "DESIGN.md must define a top-level name." });
  }

  for (const [name, value] of Object.entries(parsed.colors ?? {})) {
    if (isTokenReference(value)) {
      symbolTable.set(`colors.${name}`, value);
      continue;
    }
    if (!isValidHexColor(value)) {
      findings.push({ severity: "error", path: `colors.${name}`, message: `Invalid color '${value}'. Use #RRGGBB, #RGB, #RRGGBBAA, or #RGBA.` });
      continue;
    }
    const color = parseColor(value);
    colors.set(name, color);
    symbolTable.set(`colors.${name}`, color);
  }

  for (const [name, value] of Object.entries(parsed.typography ?? {})) {
    const resolved = parseTypography(value, `typography.${name}`, findings);
    typography.set(name, resolved);
    symbolTable.set(`typography.${name}`, resolved);
  }

  for (const [name, value] of Object.entries(parsed.rounded ?? {})) {
    if (isTokenReference(value)) {
      symbolTable.set(`rounded.${name}`, value);
      continue;
    }
    const dim = parseDimensionLike(value);
    if (!dim) {
      findings.push({ severity: "error", path: `rounded.${name}`, message: `Invalid rounded value '${String(value)}'.` });
      continue;
    }
    rounded.set(name, dim);
    symbolTable.set(`rounded.${name}`, dim);
  }

  for (const [name, value] of Object.entries(parsed.spacing ?? {})) {
    if (typeof value === "string" && isTokenReference(value)) {
      symbolTable.set(`spacing.${name}`, value);
      continue;
    }
    const dim = parseDimensionLike(value);
    if (!dim) {
      findings.push({ severity: "error", path: `spacing.${name}`, message: `Invalid spacing value '${String(value)}'.` });
      continue;
    }
    spacing.set(name, dim);
    symbolTable.set(`spacing.${name}`, dim);
  }

  resolveReferencesIntoMap(parsed.colors ?? {}, colors, symbolTable, "colors");
  resolveReferencesIntoMap(parsed.rounded ?? {}, rounded, symbolTable, "rounded");
  resolveReferencesIntoMap(parsed.spacing ?? {}, spacing, symbolTable, "spacing");

  for (const [componentName, props] of Object.entries(parsed.components ?? {})) {
    const propertyMap = new Map<string, ResolvedValue>();
    const unresolvedRefs: string[] = [];

    for (const [propName, rawValue] of Object.entries(props)) {
      if (!VALID_COMPONENT_PROPERTIES.has(propName)) {
        findings.push({ severity: "warning", path: `components.${componentName}.${propName}`, message: `Unknown component property '${propName}' preserved.` });
      }

      if (typeof rawValue === "string" && isTokenReference(rawValue)) {
        const resolved = resolveReference(symbolTable, rawValue.slice(1, -1), new Set());
        if (resolved == null) {
          unresolvedRefs.push(rawValue);
          findings.push({ severity: "error", path: `components.${componentName}.${propName}`, message: `Broken token reference '${rawValue}'.` });
          propertyMap.set(propName, rawValue);
        } else {
          propertyMap.set(propName, resolved);
        }
        continue;
      }

      if (typeof rawValue === "string" && isValidHexColor(rawValue)) {
        propertyMap.set(propName, parseColor(rawValue));
        continue;
      }

      const dim = parseDimensionLike(rawValue);
      if (dim) {
        propertyMap.set(propName, dim);
        continue;
      }

      propertyMap.set(propName, typeof rawValue === "number" ? rawValue : String(rawValue));
    }

    components.set(componentName, { properties: propertyMap, unresolvedRefs });
  }

  findings.push(...runLintRules({
    name: parsed.name,
    description: parsed.description,
    colors,
    typography,
    rounded,
    spacing,
    components,
    symbolTable,
    sections: parsed.sections,
    documentSections: parsed.documentSections,
  }));

  return {
    designSystem: {
      name: parsed.name,
      description: parsed.description,
      colors,
      typography,
      rounded,
      spacing,
      components,
      symbolTable,
      sections: parsed.sections,
      documentSections: parsed.documentSections,
    },
    findings,
    summary: {
      errors: findings.filter((finding) => finding.severity === "error").length,
      warnings: findings.filter((finding) => finding.severity === "warning").length,
      infos: findings.filter((finding) => finding.severity === "info").length,
    },
    sections: parsed.sections,
    documentSections: parsed.documentSections,
    tailwindThemeExtend: exportTailwindThemeExtend({
      name: parsed.name,
      description: parsed.description,
      colors,
      typography,
      rounded,
      spacing,
      components,
      symbolTable,
      sections: parsed.sections,
      documentSections: parsed.documentSections,
    }),
  };
}

export function diffDesignSpecs(beforeContent: string, afterContent: string): DesignSpecDiff {
  const before = lintDesignSpec(beforeContent);
  const after = lintDesignSpec(afterContent);

  return {
    tokens: {
      colors: diffMaps(before.designSystem.colors, after.designSystem.colors),
      typography: diffMaps(before.designSystem.typography, after.designSystem.typography),
      rounded: diffMaps(before.designSystem.rounded, after.designSystem.rounded),
      spacing: diffMaps(before.designSystem.spacing, after.designSystem.spacing),
      components: diffMaps(before.designSystem.components, after.designSystem.components),
    },
    findings: {
      before: before.summary,
      after: after.summary,
      delta: {
        errors: after.summary.errors - before.summary.errors,
        warnings: after.summary.warnings - before.summary.warnings,
      },
    },
    regression:
      after.summary.errors > before.summary.errors ||
      after.summary.warnings > before.summary.warnings,
  };
}

export function exportTailwindThemeExtend(state: DesignSystemState): TailwindThemeExtend {
  const colors = Object.fromEntries(Array.from(state.colors.entries()).map(([name, value]) => [name, value.hex]));
  const fontFamily = Object.fromEntries(
    Array.from(state.typography.entries())
      .filter(([, value]) => Boolean(value.fontFamily))
      .map(([name, value]) => [name, value.fontFamily ? [value.fontFamily] : []])
  );
  const fontSize = Object.fromEntries(
    Array.from(state.typography.entries())
      .filter(([, value]) => Boolean(value.fontSize))
      .map(([name, value]) => [
        name,
        [
          dimensionToString(value.fontSize!),
          {
            ...(value.lineHeight ? { lineHeight: dimensionToString(value.lineHeight) } : {}),
            ...(value.letterSpacing ? { letterSpacing: dimensionToString(value.letterSpacing) } : {}),
            ...(value.fontWeight != null ? { fontWeight: String(value.fontWeight) } : {}),
          },
        ] as [string, Record<string, string>],
      ])
  );
  const borderRadius = Object.fromEntries(Array.from(state.rounded.entries()).map(([name, value]) => [name, dimensionToString(value)]));
  const spacing = Object.fromEntries(Array.from(state.spacing.entries()).map(([name, value]) => [name, dimensionToString(value)]));

  return { colors, fontFamily, fontSize, borderRadius, spacing };
}

export function readDesignSpecFile(filePath: string): string {
  return readFileSync(filePath, "utf8");
}

export function lintDesignSpecFile(filePath: string): LintReport {
  return lintDesignSpec(readDesignSpecFile(filePath));
}

export function listDesignSpecFiles(directory: string): string[] {
  return readdirSync(directory)
    .filter((entry) => entry.toLowerCase().endsWith(".md"))
    .map((entry) => path.join(directory, entry));
}

function extractSections(content: string): Array<{ heading: string; content: string }> {
  const lines = content.split(/\r?\n/);
  const headings: Array<{ heading: string; line: number }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^##\s+(.+)$/);
    if (match) {
      headings.push({ heading: match[1].trim(), line: index });
    }
  }

  if (headings.length === 0) {
    return [{ heading: "", content }];
  }

  const sections: Array<{ heading: string; content: string }> = [];
  if (headings[0].line > 0) {
    sections.push({ heading: "", content: lines.slice(0, headings[0].line).join("\n") });
  }

  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    sections.push({
      heading: current.heading,
      content: lines.slice(current.line, next ? next.line : lines.length).join("\n"),
    });
  }

  return sections;
}

function runLintRules(state: DesignSystemState): Finding[] {
  const findings: Finding[] = [];

  if (state.colors.size > 0 && !state.colors.has("primary")) {
    findings.push({ severity: "warning", path: "colors", message: "Colors are defined but no primary token exists." });
  }

  if (state.colors.size > 0 && state.typography.size === 0) {
    findings.push({ severity: "warning", path: "typography", message: "Colors exist but no typography tokens are defined." });
  }

  if (state.colors.size > 0 && state.spacing.size === 0) {
    findings.push({ severity: "info", path: "spacing", message: "Colors exist but spacing tokens are missing." });
  }

  if (state.colors.size > 0 && state.rounded.size === 0) {
    findings.push({ severity: "info", path: "rounded", message: "Colors exist but rounded tokens are missing." });
  }

  const referencedColorPaths = new Set<string>();
  for (const [componentName, component] of state.components.entries()) {
    const backgroundColor = component.properties.get("backgroundColor");
    const textColor = component.properties.get("textColor");

    if (isResolvedColor(backgroundColor) && isResolvedColor(textColor)) {
      const ratio = contrastRatio(backgroundColor, textColor);
      if (ratio < 4.5) {
        findings.push({
          severity: "warning",
          path: `components.${componentName}`,
          message: `Contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA for text pairs.`,
        });
      }
    }

    for (const [propName, value] of component.properties.entries()) {
      if (typeof value === "string" && isTokenReference(value)) {
        const ref = value.slice(1, -1);
        if (ref.startsWith("colors.")) {
          referencedColorPaths.add(ref);
        }
      }
      if (isResolvedColor(value)) {
        const key = Array.from(state.colors.entries()).find(([, color]) => color.hex === value.hex)?.[0];
        if (key) referencedColorPaths.add(`colors.${key}`);
      }
      if (propName === "textColor" || propName === "backgroundColor") {
        const key = extractMatchedColorKey(state.colors, value);
        if (key) referencedColorPaths.add(`colors.${key}`);
      }
    }
  }

  for (const colorName of state.colors.keys()) {
    if (!referencedColorPaths.has(`colors.${colorName}`)) {
      findings.push({ severity: "warning", path: `colors.${colorName}`, message: `Color token '${colorName}' is not referenced by any component token.` });
    }
  }

  findings.push({
    severity: "info",
    path: "summary",
    message: `Token summary: ${state.colors.size} colors, ${state.typography.size} typography, ${state.rounded.size} rounded, ${state.spacing.size} spacing, ${state.components.size} components.`,
  });

  const normalizedSections = state.sections.map(normalizeSectionHeading).filter(Boolean) as string[];
  const seenSections = new Set<string>();
  for (const section of normalizedSections) {
    if (seenSections.has(section)) {
      findings.push({ severity: "error", path: "sections", message: `Duplicate section heading '${section}' is not allowed.` });
    }
    seenSections.add(section);
  }

  const actualOrder = normalizedSections
    .map((section) => SECTION_ORDER.indexOf(section as (typeof SECTION_ORDER)[number]))
    .filter((index) => index >= 0);
  if (actualOrder.some((value, index) => index > 0 && value < actualOrder[index - 1])) {
    findings.push({ severity: "warning", path: "sections", message: "Sections are out of canonical DESIGN.md order." });
  }

  return findings;
}

function resolveReferencesIntoMap<T extends ResolvedColor | ResolvedDimension>(
  source: Record<string, string | number>,
  target: Map<string, T>,
  symbolTable: Map<string, ResolvedValue>,
  prefix: "colors" | "rounded" | "spacing"
) {
  for (const [name, value] of Object.entries(source)) {
    if (typeof value !== "string" || !isTokenReference(value)) continue;
    const resolved = resolveReference(symbolTable, value.slice(1, -1), new Set());
    if (resolved && typeof resolved === "object" && "type" in resolved) {
      if ((prefix === "colors" && resolved.type === "color") || (prefix !== "colors" && resolved.type === "dimension")) {
        target.set(name, resolved as T);
        symbolTable.set(`${prefix}.${name}`, resolved as T);
      }
    }
  }
}

function parseTypography(
  props: Record<string, string | number>,
  pathPrefix: string,
  findings: Finding[]
): ResolvedTypography {
  const result: ResolvedTypography = { type: "typography" };

  if (typeof props.fontFamily === "string") result.fontFamily = props.fontFamily;
  if (props.fontWeight != null) {
    const numeric = typeof props.fontWeight === "number" ? props.fontWeight : Number(props.fontWeight);
    if (Number.isFinite(numeric)) {
      result.fontWeight = numeric;
    } else {
      findings.push({ severity: "error", path: `${pathPrefix}.fontWeight`, message: `Invalid fontWeight '${String(props.fontWeight)}'.` });
    }
  }

  for (const key of ["fontSize", "lineHeight", "letterSpacing"] as const) {
    const dim = parseDimensionLike(props[key]);
    if (dim) {
      result[key] = dim;
    } else if (props[key] != null) {
      findings.push({ severity: "error", path: `${pathPrefix}.${key}`, message: `Invalid typography dimension '${String(props[key])}'.` });
    }
  }

  if (typeof props.fontFeature === "string") result.fontFeature = props.fontFeature;
  if (typeof props.fontVariation === "string") result.fontVariation = props.fontVariation;

  return result;
}

function parseDimensionLike(value: unknown): ResolvedDimension | null {
  if (typeof value === "number") {
    return { type: "dimension", value, unit: "" };
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^(-?\d*\.?\d+)(px|rem|em|%|fr|vh|vw)?$/i);
  if (!match) return null;
  const unit = (match[2] ?? "").toLowerCase();
  if (!VALID_UNITS.has(unit)) return null;
  return { type: "dimension", value: Number(match[1]), unit };
}

function parseColor(raw: string): ResolvedColor {
  let hex = raw.toLowerCase();
  if (hex.length === 4) hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  if (hex.length === 5) hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}${hex[4]}${hex[4]}`;
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const a = hex.length === 9 ? Number.parseInt(hex.slice(7, 9), 16) / 255 : undefined;
  return { type: "color", hex, r, g, b, a, luminance: computeLuminance(r, g, b) };
}

function computeLuminance(r: number, g: number, b: number): number {
  const linearize = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(a: ResolvedColor, b: ResolvedColor): number {
  const lighter = Math.max(a.luminance, b.luminance);
  const darker = Math.min(a.luminance, b.luminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function resolveReference(symbolTable: Map<string, ResolvedValue>, refPath: string, visited: Set<string>, depth = 0): ResolvedValue | null {
  if (depth > MAX_REFERENCE_DEPTH) return null;
  if (visited.has(refPath)) return null;
  visited.add(refPath);
  const value = symbolTable.get(refPath);
  if (value == null) return null;
  if (typeof value === "string" && isTokenReference(value)) {
    return resolveReference(symbolTable, value.slice(1, -1), visited, depth + 1);
  }
  return value;
}

function diffMaps<T>(before: Map<string, T>, after: Map<string, T>): DiffBucket {
  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  for (const [key, value] of after.entries()) {
    if (!before.has(key)) {
      added.push(key);
      continue;
    }
    if (JSON.stringify(before.get(key)) !== JSON.stringify(value)) {
      modified.push(key);
    }
  }

  for (const key of before.keys()) {
    if (!after.has(key)) removed.push(key);
  }

  return { added, removed, modified };
}

function dimensionToString(value: ResolvedDimension): string {
  return `${value.value}${value.unit}`;
}

function normalizeSectionHeading(heading: string): string | null {
  if (!heading) return null;
  return SECTION_ALIASES[heading] ?? (SECTION_ORDER.includes(heading as (typeof SECTION_ORDER)[number]) ? heading : null);
}

function extractMatchedColorKey(colors: Map<string, ResolvedColor>, value: ResolvedValue | undefined): string | null {
  if (!isResolvedColor(value)) return null;
  for (const [key, color] of colors.entries()) {
    if (color.hex === value.hex) return key;
  }
  return null;
}

function isResolvedColor(value: ResolvedValue | undefined): value is ResolvedColor {
  return Boolean(value && typeof value === "object" && "type" in value && value.type === "color");
}

function isValidHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());
}

function isTokenReference(value: string): boolean {
  return /^\{[a-zA-Z0-9_.-]+\}$/.test(value.trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
