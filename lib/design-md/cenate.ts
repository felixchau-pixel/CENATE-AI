import path from "node:path";
import {
  SECTION_BLUEPRINTS,
  type DesignFamilyId,
  type SectionRole,
  type WebsiteVariantPlan,
} from "@/lib/ai/website/design-families";
import type { Niche } from "@/lib/ai/website/niche-router";
import { getStarterBase } from "@/lib/ai/website/starter-bases";
import { parseProjectContent } from "@/lib/project-manifest";
import {
  exportTailwindThemeExtend,
  lintDesignSpecFile,
  readDesignSpecFile,
  type LintReport,
} from "./index";

export type CenateDesignSpecId = DesignFamilyId;

export type CenateResolvedDesignSpec = {
  id: CenateDesignSpecId;
  filePath: string;
  markdown: string;
  report: LintReport;
  tailwindThemeExtend: ReturnType<typeof exportTailwindThemeExtend>;
  promptBlock: string;
};

export type ConformanceCategory =
  | "structure"
  | "section-order"
  | "hero"
  | "cta"
  | "tokens"
  | "typography"
  | "color"
  | "spacing"
  | "radius"
  | "component";

export type ConformanceSeverity = "hard" | "soft";

export type ConformanceFinding = {
  id: string;
  category: ConformanceCategory;
  severity: ConformanceSeverity;
  message: string;
  expected?: string;
  detected?: string;
  filePath?: string;
  evidence?: string[];
};

export type DetectedTokenUsage = {
  colors: string[];
  typography: string[];
  spacing: string[];
  rounded: string[];
  components: string[];
  rawColorLiterals: string[];
  arbitraryValues: string[];
};

export type DesignConformanceReport = {
  specId: CenateDesignSpecId;
  designFamily: DesignFamilyId;
  niche: Niche;
  pass: boolean;
  confidence: number;
  summary: { hard: number; soft: number };
  violations: ConformanceFinding[];
  warnings: ConformanceFinding[];
  expectedSectionOrder: string[];
  detectedSectionOrder: string[];
  detectedTokens: DetectedTokenUsage;
  checkedFiles: string[];
  metadata: {
    manifestSectionOrder: string[];
    appSectionOrder: string[];
    detectedRoleOrder: SectionRole[];
  };
};

export type CheckCenateDesignConformanceParams = {
  raw: string;
  specId: CenateDesignSpecId;
  niche: Niche;
  designFamily?: DesignFamilyId;
  variantPlan?: WebsiteVariantPlan;
};

const SPEC_FILE_BY_ID: Record<CenateDesignSpecId, string> = {
  editorial_luxury: path.join(process.cwd(), "design-specs", "editorial_luxury.DESIGN.md"),
  modern_minimal: path.join(process.cwd(), "design-specs", "modern_minimal.DESIGN.md"),
  bold_commercial: path.join(process.cwd(), "design-specs", "bold_commercial.DESIGN.md"),
  warm_artisan: path.join(process.cwd(), "design-specs", "warm_artisan.DESIGN.md"),
};

const CANONICAL_ROLE_ORDER: SectionRole[] = [
  "navbar",
  "hero",
  "story",
  "services",
  "gallery",
  "proof",
  "cta",
  "footer",
];

export function getCenateDesignSpecPath(id: CenateDesignSpecId): string {
  return SPEC_FILE_BY_ID[id];
}

export function resolveCenateDesignSpec(id: CenateDesignSpecId): CenateResolvedDesignSpec {
  return resolveCenateDesignSpecForNiche(id);
}

export function resolveCenateDesignSpecForNiche(
  id: CenateDesignSpecId,
  niche?: Niche
): CenateResolvedDesignSpec {
  const filePath = getCenateDesignSpecPath(id);
  const markdown = readDesignSpecFile(filePath);
  const report = lintDesignSpecFile(filePath);
  return {
    id,
    filePath,
    markdown,
    report,
    tailwindThemeExtend: exportTailwindThemeExtend(report.designSystem),
    promptBlock: buildPromptBlock(id, filePath, report, niche),
  };
}

export function validateCenateDesignSpec(id: CenateDesignSpecId): {
  ok: boolean;
  spec: CenateResolvedDesignSpec;
} {
  const spec = resolveCenateDesignSpec(id);
  return {
    ok: spec.report.summary.errors === 0,
    spec,
  };
}

export function checkCenateDesignConformance(
  params: CheckCenateDesignConformanceParams
): DesignConformanceReport {
  const spec = resolveCenateDesignSpec(params.specId);
  const parsed = parseProjectContent(params.raw);
  const sectionFiles = parsed.files.filter(
    (file) =>
      file.path.startsWith("src/components/") &&
      !file.path.startsWith("src/components/ui/") &&
      file.path.endsWith(".tsx")
  );
  const fileMap = new Map<string, string>(parsed.files.map((file) => [file.path, file.content]));
  const appContent = fileMap.get("src/App.tsx") ?? "";
  const footerContent = sectionFiles.find((file) => classifySectionRole(getComponentNameFromPath(file.path)) === "footer")?.content ?? "";
  const appSectionOrder = detectAppSectionOrder(appContent);
  const manifestSectionOrder = ((parsed.meta?.sectionOrder ?? []) as string[]).map(normalizeSectionName);
  const expectedSectionOrder = deriveExpectedSectionOrder(
    params.niche,
    params.variantPlan
  );
  const detectedRoleOrder = appSectionOrder
    .map(classifySectionRole)
    .filter((role): role is SectionRole => role !== null);
  const detectedTokens = detectTokenUsage(sectionFiles.map((file) => file.content));
  const findings: ConformanceFinding[] = [];

  if (spec.report.summary.errors > 0) {
    findings.push({
      id: "spec-not-valid",
      category: "tokens",
      severity: "hard",
      message: "Selected DESIGN.md spec failed linting and is not safe as a conformance authority.",
      expected: "0 lint errors in the selected DESIGN.md spec",
      detected: `${spec.report.summary.errors} lint errors`,
      filePath: spec.filePath,
    });
  }

  if (!parsed.isComplete) {
    findings.push({
      id: "project-incomplete",
      category: "structure",
      severity: "hard",
      message: "Generated project artifact is incomplete and cannot be checked reliably.",
      expected: "complete manifest and file blocks",
      detected: "missing manifest or missing file blocks",
    });
  }

  if (manifestSectionOrder.length > 0 && !sameSequence(manifestSectionOrder, appSectionOrder)) {
    findings.push({
      id: "manifest-app-order-mismatch",
      category: "section-order",
      severity: "hard",
      message: "Manifest section order does not match the component order rendered by App.tsx.",
      expected: manifestSectionOrder.join(" -> "),
      detected: appSectionOrder.join(" -> "),
      filePath: "src/App.tsx",
    });
  }

  if (appSectionOrder[0] !== "Navbar" || appSectionOrder[1] !== "Hero") {
    findings.push({
      id: "shell-opening-order",
      category: "section-order",
      severity: "hard",
      message: "Page shell must open with Navbar followed immediately by Hero.",
      expected: "Navbar -> Hero -> ...",
      detected: appSectionOrder.slice(0, 3).join(" -> "),
      filePath: "src/App.tsx",
    });
  }

  if (appSectionOrder.at(-1) !== "Footer") {
    findings.push({
      id: "shell-footer-order",
      category: "section-order",
      severity: "hard",
      message: "Footer must be the final rendered page section.",
      expected: "... -> Footer",
      detected: appSectionOrder.join(" -> "),
      filePath: "src/App.tsx",
    });
  }

  const expectedRoleOrder = expectedSectionOrder.filter(
    (role): role is SectionRole =>
      [
        "navbar",
        "hero",
        "story",
        "services",
        "gallery",
        "proof",
        "cta",
        "footer",
      ].includes(role)
  );
  const orderViolation = findRoleOrderViolation(detectedRoleOrder, expectedRoleOrder);
  if (orderViolation) {
    findings.push(orderViolation);
  }

  const requiredSections = ["Navbar", "Hero", "Footer"];
  const missingRequired = requiredSections.filter((name) => !appSectionOrder.includes(name));
  if (missingRequired.length > 0) {
    findings.push({
      id: "required-shell-sections",
      category: "structure",
      severity: "hard",
      message: "Generated output is missing required shell sections.",
      expected: requiredSections.join(", "),
      detected: appSectionOrder.join(", "),
      evidence: missingRequired,
    });
  }

  const heroFile = sectionFiles.find((file) => /\/Hero\.tsx$/.test(file.path));
  if (!heroFile) {
    findings.push({
      id: "missing-hero-file",
      category: "hero",
      severity: "hard",
      message: "Missing Hero.tsx file for hero conformance checks.",
      expected: "src/components/Hero.tsx",
      detected: "not found",
    });
  } else {
    findings.push(...checkHeroStructure(heroFile.path, heroFile.content));
  }

  findings.push(...checkCtaSurface(sectionFiles, footerContent));
  findings.push(...checkRoleBlueprints(sectionFiles));
  findings.push(...checkTokenConformance(spec, detectedTokens, sectionFiles));
  findings.push(...checkSpacingAndRadius(sectionFiles, detectedTokens));

  const hard = findings.filter((finding) => finding.severity === "hard");
  const soft = findings.filter((finding) => finding.severity === "soft");

  return {
    specId: params.specId,
    designFamily: params.designFamily ?? params.specId,
    niche: params.niche,
    pass: hard.length === 0,
    confidence: computeConfidence(hard.length, soft.length, sectionFiles.length),
    summary: { hard: hard.length, soft: soft.length },
    violations: hard,
    warnings: soft,
    expectedSectionOrder,
    detectedSectionOrder: appSectionOrder,
    detectedTokens,
    checkedFiles: parsed.files.map((file) => file.path),
    metadata: {
      manifestSectionOrder,
      appSectionOrder,
      detectedRoleOrder,
    },
  };
}

export function renderDesignConformanceReport(report: DesignConformanceReport): string {
  const status = report.pass ? "PASS" : "FAIL";
  const lines = [
    `Design conformance [${report.specId}/${report.niche}]: ${status} (${report.summary.hard} hard, ${report.summary.soft} soft, confidence=${report.confidence.toFixed(2)})`,
    `  expected roles: ${report.expectedSectionOrder.join(" -> ") || "(none)"}`,
    `  detected sections: ${report.detectedSectionOrder.join(" -> ") || "(none)"}`,
  ];

  for (const finding of [...report.violations, ...report.warnings]) {
    lines.push(
      `  - [${finding.severity}] ${finding.category}/${finding.id}: ${finding.message}`
    );
  }

  return lines.join("\n");
}

export function renderDesignConformanceForRepair(report: DesignConformanceReport): string {
  if (report.pass && report.warnings.length === 0) {
    return "Design conformance: PASS";
  }

  const lines = [
    `DESIGN CONFORMANCE (${report.specId})`,
    `- Expected section order: ${report.expectedSectionOrder.join(" -> ") || "(none)"}`,
    `- Detected section order: ${report.detectedSectionOrder.join(" -> ") || "(none)"}`,
    `- Detected semantic colors: ${report.detectedTokens.colors.join(", ") || "(none)"}`,
    `- Detected typography tokens: ${report.detectedTokens.typography.join(", ") || "(none)"}`,
  ];

  for (const finding of [...report.violations, ...report.warnings].slice(0, 8)) {
    lines.push(
      `- [${finding.severity.toUpperCase()}] ${finding.category}: ${finding.message}${finding.expected ? ` | expected=${finding.expected}` : ""}${finding.detected ? ` | detected=${finding.detected}` : ""}`
    );
  }

  return lines.join("\n");
}

function buildPromptBlock(
  id: CenateDesignSpecId,
  filePath: string,
  report: LintReport,
  niche?: Niche
): string {
  const state = report.designSystem;
  const sections = report.sections.length > 0 ? report.sections.join(" -> ") : "(no H2 sections)";
  const expectedRoleOrder = niche ? deriveExpectedSectionOrder(niche).join(" -> ") : CANONICAL_ROLE_ORDER.join(" -> ");
  const starter = niche ? getStarterBase(niche) : null;
  const expectedComponentOrder = starter
    ? starter.componentFiles.map(getComponentNameFromPath).join(" -> ")
    : "Navbar -> Hero -> body sections in required role order -> Footer";
  const colors = Array.from(state.colors.entries())
    .slice(0, 8)
    .map(([name, value]) => `  - ${name}: ${value.hex}`)
    .join("\n");
  const typography = Array.from(state.typography.entries())
    .slice(0, 6)
    .map(([name, value]) => `  - ${name}: ${value.fontFamily ?? "unset"} ${value.fontSize ? `${value.fontSize.value}${value.fontSize.unit}` : ""}`.trim())
    .join("\n");
  const components = Array.from(state.components.entries())
    .slice(0, 8)
    .map(([name, value]) => {
      const props = Array.from(value.properties.keys()).join(", ");
      return `  - ${name}: ${props}`;
    })
    .join("\n");
  const blueprintRoles: SectionRole[] = ["hero", "services", "gallery", "proof", "cta", "footer"];
  const blueprintContract = blueprintRoles
    .map((role) => {
      const blueprint = SECTION_BLUEPRINTS[role];
      const required = blueprint.required.map((item) => `      - ${item}`).join("\n");
      const banned = blueprint.banned.map((item) => `      - ${item}`).join("\n");
      return `  ${role.toUpperCase()}:
    Structure: ${blueprint.structure}
    Required:
${required}
    Banned:
${banned}`;
    })
    .join("\n\n");
  const tailwindPreview = JSON.stringify(report.tailwindThemeExtend, null, 2);

  return `=== DESIGN.MD CONTROL SPEC (STRUCTURED + VALIDATED) ===

Selected design spec id: ${id}
Source file: ${filePath}
Validation summary: errors=${report.summary.errors}, warnings=${report.summary.warnings}, infos=${report.summary.infos}
Canonical sections present: ${sections}

This spec is NOT passive inspiration. It is the structured design authority for this generation.
Use its tokens and component mappings to constrain typography, color, spacing, radius, and CTA surfaces before writing code.
If any instruction elsewhere is looser than this spec, the spec wins for visual system decisions.

FIRST-PASS DESIGN CONTRACT (NON-NEGOTIABLE):
- DESIGN.MD is the primary first-pass authority for hero structure, CTA structure, proof/footer behavior, token usage, and section choreography.
- REQUIRED ROLE ORDER: ${expectedRoleOrder}
- REQUIRED COMPONENT ORDER SKELETON: ${expectedComponentOrder}
- If section-count limits force merges, preserve the RELATIVE ORDER of the required roles. Hero stays second. Footer stays last.
- manifest.sectionOrder MUST reflect this order exactly, and App.tsx MUST render the same order exactly.
- If any generic pattern conflicts with this spec, delete the generic pattern. Do NOT compromise the spec.

PRIMARY TOKENS:
${colors || "  - none"}

TYPOGRAPHY TOKENS:
${typography || "  - none"}

COMPONENT TOKENS:
${components || "  - none"}

SECTION BLUEPRINT CONTRACTS YOU MUST IMPLEMENT ON THE FIRST PASS:
${blueprintContract}

KNOWN HARD FAILURES TO AVOID ON THE FIRST PASS:
- Do NOT emit Hero without: headline + supporting paragraph + Button CTA + exactly one support block.
- Do NOT emit CTA without: Button CTA + real form or real contact info + framed/distinct surface.
- Do NOT emit Footer as a four-column sitemap or a utility strip with no contact details.
- Do NOT emit Services/Features as a generic uniform 3-card grid fallback.
- Do NOT emit Proof as generic avatar cards or reuse the same card shell as features.
- Do NOT emit Gallery as an equal 3-column image grid.
- Do NOT use raw hex/rgb/hsl color literals inside section components. Use semantic tokens only.
- Do NOT omit font-heading on display text or replace Button/Input primitives with raw elements.
- Do NOT let manifest.sectionOrder drift from App.tsx or from the required role order above.

TAILWIND THEME EXTEND DERIVED FROM DESIGN.md:
${tailwindPreview}

REQUIRED BEHAVIOR:
- Start from the required role order above before inventing any file list.
- Build Hero, CTA, Proof, Gallery, Services, and Footer to satisfy their blueprint contracts on the FIRST generation pass.
- Match the selected design spec's color tokens when choosing semantic theme variables and section surfaces.
- Match the selected design spec's typography tokens when choosing hero, heading, body, and label treatments.
- Match the selected design spec's component tokens when shaping primary buttons, secondary surfaces, cards, and inputs.
- Preserve the spec's prose intent across the page. Do not improvise a conflicting visual language.
- Keep the generated manifest aligned with this design system choice.

=== END DESIGN.MD CONTROL SPEC ===`;
}

function deriveExpectedSectionOrder(
  niche: Niche,
  variantPlan?: WebsiteVariantPlan
): string[] {
  if (variantPlan) {
    return ["navbar", "hero", ...variantPlan.bodyRoleSequence, "footer"];
  }

  const starter = getStarterBase(niche);
  if (!starter) return CANONICAL_ROLE_ORDER;

  const roles = starter.componentFiles
    .map(getComponentNameFromPath)
    .map(classifySectionRole)
    .filter((role): role is SectionRole => role !== null);

  return Array.from(new Set(roles));
}

function getComponentNameFromPath(filePath: string): string {
  const base = filePath.split("/").at(-1) ?? filePath;
  return base.replace(/\.tsx$/, "");
}

function normalizeSectionName(name: string): string {
  return name.replace(/^src\/components\//, "").replace(/\.tsx$/, "");
}

function detectAppSectionOrder(appContent: string): string[] {
  const importedComponentNames = Array.from(
    appContent.matchAll(/import\s+([A-Z][A-Za-z0-9]*)\s+from\s+["']@\/components\/(?!ui\/)/g),
    (match) => match[1]
  );
  const importedSet = new Set(importedComponentNames);
  const rendered = Array.from(appContent.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g), (match) => match[1]);
  return rendered.filter((name, index) => importedSet.has(name) && rendered.indexOf(name) === index);
}

function classifySectionRole(componentName: string): SectionRole | null {
  const lower = componentName.toLowerCase();
  if (lower === "navbar" || lower.endsWith("nav")) return "navbar";
  if (lower === "hero") return "hero";
  if (lower === "footer") return "footer";
  if (/gallery|showcase|selectedwork|project/.test(lower)) return "gallery";
  if (/proof|testimonial|press|credential|metrics/.test(lower)) return "proof";
  if (/reservation|conversion|contact|cta|estimate|signup|inquiry|form|location/.test(lower)) return "cta";
  if (/service|menu|pricing|capabilit/.test(lower)) return "services";
  if (/story|about|chef|process|method|demo/.test(lower)) return "story";
  return null;
}

function findRoleOrderViolation(
  detectedRoleOrder: SectionRole[],
  expectedRoleOrder: SectionRole[]
): ConformanceFinding | null {
  if (detectedRoleOrder.length === 0) return null;
  let lastIndex = -1;
  for (const role of detectedRoleOrder) {
    const idx = expectedRoleOrder.indexOf(role);
    if (idx === -1) continue;
    if (idx < lastIndex) {
      return {
        id: "canonical-role-order",
        category: "section-order",
        severity: "hard",
        message: "Body section roles drift from the selected Cenate execution order.",
        expected: expectedRoleOrder.join(" -> "),
        detected: detectedRoleOrder.join(" -> "),
      };
    }
    lastIndex = idx;
  }
  return null;
}

function checkHeroStructure(filePath: string, content: string): ConformanceFinding[] {
  const findings: ConformanceFinding[] = [];
  const hasHeading = /<Heading\b|<h1\b/.test(content);
  const hasParagraph = /<p\b|text-(?:base|lg|xl)/.test(content);
  const hasButton = /from ["']@\/components\/ui\/button["']/.test(content) && /<Button\b/.test(content);
  const supportSignals = [
    /StatsBand|(?:years|projects|awards|uptime|clients|teams)/i.test(content),
    /badge|credential|press|trusted|logo strip|wordmark/i.test(content),
    /<li\b|space-y-\d[\s\S]{0,200}(?:feature|benefit|included|signature)/i.test(content),
    /projectImages\.|<img\b/.test(content),
  ].filter(Boolean).length;

  if (!hasHeading || !hasParagraph || !hasButton || supportSignals === 0) {
    findings.push({
      id: "hero-structure",
      category: "hero",
      severity: "hard",
      message: "Hero is missing required structure from the selected design/spec layer.",
      expected: SECTION_BLUEPRINTS.hero.required.join("; "),
      detected: `heading=${hasHeading}, paragraph=${hasParagraph}, button=${hasButton}, supportSignals=${supportSignals}`,
      filePath,
    });
  }

  if (/text-7xl|text-8xl|text-9xl/.test(content)) {
    findings.push({
      id: "hero-display-drift",
      category: "typography",
      severity: "soft",
      message: "Hero headline drifts above the allowed typography scale.",
      expected: "hero display uses text-4xl to text-6xl",
      detected: "text-7xl+ class found",
      filePath,
    });
  }

  return findings;
}

function checkCtaSurface(
  sectionFiles: Array<{ path: string; content: string }>,
  footerContent: string
): ConformanceFinding[] {
  const ctaFiles = sectionFiles.filter((file) => classifySectionRole(getComponentNameFromPath(file.path)) === "cta");
  const findings: ConformanceFinding[] = [];

  if (ctaFiles.length === 0) {
    const footerHasRecoverySurface =
      /from ["']@\/components\/ui\/button["']/.test(footerContent) &&
      /<Button\b/.test(footerContent) &&
      /(email|phone|address|hours|@)/i.test(footerContent);

    findings.push({
      id: "missing-cta-surface",
      category: "cta",
      severity: footerHasRecoverySurface ? "soft" : "hard",
      message: "Generated output does not include a dedicated CTA/conversion section.",
      expected: SECTION_BLUEPRINTS.cta.structure,
      detected: footerHasRecoverySurface
        ? "footer contains fallback contact/action surface only"
        : "no CTA/conversion/reservation/contact section detected",
      filePath: footerHasRecoverySurface ? "src/components/Footer.tsx" : undefined,
    });
    return findings;
  }

  for (const file of ctaFiles) {
    const hasButton = /from ["']@\/components\/ui\/button["']/.test(file.content) && /<Button\b/.test(file.content);
    const hasForm = /from ["']@\/components\/ui\/(?:input|textarea)["']/.test(file.content) || /<(Input|Textarea)\b/.test(file.content);
    const hasContact = /(email|phone|address|hours|@)/i.test(file.content);
    const hasSurfaceFraming = /\bbg-(?:card|muted|accent|secondary)|\bborder\b|\brounded(?:-[a-z0-9]+)?\b/.test(file.content);

    if (!hasButton || (!hasForm && !hasContact) || !hasSurfaceFraming) {
      findings.push({
        id: `cta-structure-${getComponentNameFromPath(file.path).toLowerCase()}`,
        category: "cta",
        severity: "hard",
        message: "CTA surface does not meet the required structural contract.",
        expected: SECTION_BLUEPRINTS.cta.required.join("; "),
        detected: `button=${hasButton}, form=${hasForm}, contact=${hasContact}, framedSurface=${hasSurfaceFraming}`,
        filePath: file.path,
      });
    }
  }

  return findings;
}

function checkRoleBlueprints(
  sectionFiles: Array<{ path: string; content: string }>
): ConformanceFinding[] {
  const findings: ConformanceFinding[] = [];

  for (const file of sectionFiles) {
    const role = classifySectionRole(getComponentNameFromPath(file.path));
    if (!role) continue;

    if (role === "gallery") {
      const imageRefs = countMatches(file.content, /projectImages\.(hero|support|gallery1|gallery2|gallery3|detail1)|<img\b/g);
      const uniformGrid = /grid-cols-3/.test(file.content) && countMatches(file.content, /<img\b/g) >= 3;
      if (imageRefs < 3 || uniformGrid) {
        findings.push({
          id: `gallery-blueprint-${getComponentNameFromPath(file.path).toLowerCase()}`,
          category: "component",
          severity: "hard",
          message: "Gallery section drifts from the required asymmetric gallery blueprint.",
          expected: SECTION_BLUEPRINTS.gallery.structure,
          detected: `imageRefs=${imageRefs}, uniformGrid=${uniformGrid}`,
          filePath: file.path,
        });
      }
    }

    if (role === "proof") {
      const hasAttribution = /(company|publication|role|founder|critic|editor|review)/i.test(file.content);
      const avatarGrid = /grid-cols-3/.test(file.content) && /(avatar|testimonial)/i.test(file.content);
      const metricBand = /(uptime|teams|integrations|licensed|insured|projects|years)/i.test(file.content);
      if ((!hasAttribution && !metricBand) || avatarGrid) {
        findings.push({
          id: `proof-blueprint-${getComponentNameFromPath(file.path).toLowerCase()}`,
          category: "component",
          severity: "hard",
          message: "Proof section does not match the selected proof-band / proof-strip expectations.",
          expected: SECTION_BLUEPRINTS.proof.structure,
          detected: `attribution=${hasAttribution}, metricBand=${metricBand}, avatarGrid=${avatarGrid}`,
          filePath: file.path,
        });
      }
    }

    if (role === "services") {
      const uniformGrid = /grid-cols-3/.test(file.content) && countMatches(file.content, /<Card\b/g) >= 3;
      if (uniformGrid) {
        findings.push({
          id: `services-grid-drift-${getComponentNameFromPath(file.path).toLowerCase()}`,
          category: "component",
          severity: "soft",
          message: "Services/features section falls back to the banned uniform three-card grid.",
          expected: SECTION_BLUEPRINTS.services.structure,
          detected: "uniform grid-cols-3 card pattern",
          filePath: file.path,
        });
      }
    }

    if (role === "footer") {
      const hasContact = /(email|phone|address|hours|@)/i.test(file.content);
      const sitemapGrid = /grid-cols-4/.test(file.content) && countMatches(file.content, /<a\b/g) >= 8;
      if (!hasContact || sitemapGrid) {
        findings.push({
          id: "footer-blueprint",
          category: "component",
          severity: "hard",
          message: "Footer drifts from the required designed-closure blueprint.",
          expected: SECTION_BLUEPRINTS.footer.structure,
          detected: `contact=${hasContact}, sitemapGrid=${sitemapGrid}`,
          filePath: file.path,
        });
      }
    }
  }

  return findings;
}

function checkTokenConformance(
  spec: CenateResolvedDesignSpec,
  detectedTokens: DetectedTokenUsage,
  sectionFiles: Array<{ path: string; content: string }>
): ConformanceFinding[] {
  const findings: ConformanceFinding[] = [];
  const requiredColorFamilies = ["bg-background", "text-foreground", "text-primary", "border-border"];
  const missingColorFamilies = requiredColorFamilies.filter((token) => !detectedTokens.colors.includes(token));
  if (missingColorFamilies.length > 0) {
    findings.push({
      id: "semantic-color-tokens",
      category: "color",
      severity: "hard",
      message: "Generated output is not consistently using the semantic color token families required by DESIGN.md.",
      expected: requiredColorFamilies.join(", "),
      detected: detectedTokens.colors.join(", "),
      evidence: missingColorFamilies,
    });
  }

  if (!detectedTokens.typography.includes("font-heading")) {
    findings.push({
      id: "missing-font-heading",
      category: "typography",
      severity: "hard",
      message: "Heading token usage is missing; generated output is not binding to the DESIGN.md typography system.",
      expected: `font-heading mapped to ${Array.from(spec.report.designSystem.typography.values())[0]?.fontFamily ?? "spec display font"}`,
      detected: detectedTokens.typography.join(", ") || "(none)",
    });
  }

  if (!detectedTokens.typography.includes("font-body")) {
    findings.push({
      id: "missing-font-body",
      category: "typography",
      severity: "soft",
      message: "Body token usage is sparse or absent.",
      expected: "font-body present in body copy surfaces",
      detected: detectedTokens.typography.join(", ") || "(none)",
    });
  }

  if (detectedTokens.rawColorLiterals.length > 0) {
    findings.push({
      id: "raw-color-drift",
      category: "color",
      severity: "hard",
      message: "Raw color literals were detected in generated section code instead of semantic theme tokens.",
      expected: "semantic tokens only",
      detected: detectedTokens.rawColorLiterals.join(", "),
      evidence: sectionFiles
        .filter((file) => /#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\(/.test(file.content))
        .map((file) => file.path),
    });
  }

  const hasButtonPrimitive = detectedTokens.components.includes("Button");
  const hasInputPrimitive = detectedTokens.components.includes("Input") || detectedTokens.components.includes("Textarea");
  if (!hasButtonPrimitive) {
    findings.push({
      id: "missing-button-primitive",
      category: "component",
      severity: "hard",
      message: "Primary button primitive usage is missing, which breaks the design-spec component mapping.",
      expected: "Button primitive used for CTA surfaces",
      detected: detectedTokens.components.join(", ") || "(none)",
    });
  }

  if (Array.from(spec.report.designSystem.components.keys()).includes("input-field") && !hasInputPrimitive) {
    findings.push({
      id: "missing-input-primitive",
      category: "component",
      severity: "soft",
      message: "Selected DESIGN.md spec defines an input-field component token, but no input primitives were detected.",
      expected: "Input or Textarea primitive present in conversion/contact surfaces",
      detected: detectedTokens.components.join(", ") || "(none)",
    });
  }

  return findings;
}

function checkSpacingAndRadius(
  sectionFiles: Array<{ path: string; content: string }>,
  detectedTokens: DetectedTokenUsage
): ConformanceFinding[] {
  const findings: ConformanceFinding[] = [];
  const sectionPyValues = new Set<string>();

  for (const file of sectionFiles) {
    for (const match of file.content.matchAll(/\bpy-\d+\b/g)) {
      sectionPyValues.add(match[0]);
    }
  }

  if (sectionPyValues.size < 2) {
    findings.push({
      id: "section-spacing-rhythm",
      category: "spacing",
      severity: "soft",
      message: "Section spacing rhythm is too flat to reflect the selected design system.",
      expected: "at least two distinct section-level py-* values",
      detected: Array.from(sectionPyValues).join(", ") || "(none)",
    });
  }

  if (detectedTokens.arbitraryValues.length > 0) {
    findings.push({
      id: "arbitrary-value-drift",
      category: "radius",
      severity: "soft",
      message: "Arbitrary spacing/radius values were detected where the design system expects tokenized scales.",
      expected: "Tailwind scale utilities or semantic tokens",
      detected: detectedTokens.arbitraryValues.join(", "),
    });
  }

  const roundedVariants = new Set(detectedTokens.rounded);
  if (roundedVariants.size > 4) {
    findings.push({
      id: "radius-fragmentation",
      category: "radius",
      severity: "soft",
      message: "Too many rounded utility variants were used for one page, which suggests radius drift.",
      expected: "one dominant radius language with limited variants",
      detected: Array.from(roundedVariants).join(", "),
    });
  }

  return findings;
}

function detectTokenUsage(contents: string[]): DetectedTokenUsage {
  const joined = contents.join("\n");
  return {
    colors: uniqueMatches(joined, /\b(?:bg|text|border|ring)-(?:background|foreground|card|muted|muted-foreground|primary|secondary|accent|border)\b/g),
    typography: uniqueMatches(joined, /\bfont-(?:heading|body)\b/g),
    spacing: uniqueMatches(joined, /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-\d+\b/g),
    rounded: uniqueMatches(joined, /\brounded(?:-[a-z0-9]+|\[[^\]]+\])?\b/g),
    components: uniqueCaptureMatches(joined, /<(Button|Input|Textarea|Card|Badge|Accordion|Tabs|Gallery|StatsBand|Testimonial|MobileNav)\b/g),
    rawColorLiterals: uniqueMatches(joined, /#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([^)]+\)/g),
    arbitraryValues: uniqueMatches(joined, /\b(?:rounded|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-\[[^\]]+\]\b/g),
  };
}

function sameSequence(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function uniqueMatches(text: string, pattern: RegExp): string[] {
  return Array.from(new Set(Array.from(text.matchAll(pattern), (match) => match[0])));
}

function uniqueCaptureMatches(text: string, pattern: RegExp): string[] {
  return Array.from(new Set(Array.from(text.matchAll(pattern), (match) => match[1]).filter(Boolean)));
}

function countMatches(text: string, pattern: RegExp): number {
  return Array.from(text.matchAll(pattern)).length;
}

function computeConfidence(hardCount: number, softCount: number, sectionFileCount: number): number {
  const base = 0.96 - hardCount * 0.18 - softCount * 0.05;
  const sectionBonus = Math.min(sectionFileCount, 8) * 0.005;
  return Math.max(0.2, Math.min(0.99, base + sectionBonus));
}
