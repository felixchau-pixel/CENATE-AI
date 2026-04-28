import { generateText } from "ai";
import { codePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import {
  buildWebsiteProjectPrompt,
  isWebsiteRequest,
  websiteUpdatePrompt,
} from "@/lib/ai/prompts-website";
import {
  runCritic,
  buildRepairPrompt,
  renderCriticReport,
  type CriticIssue,
} from "@/lib/ai/website/critic";
import { evaluateProjectPreviewReadiness } from "@/lib/ai/website/preview-readiness";
import {
  lightFinalizeWebsiteProject,
  lightFinalizeWebsiteProjectWithConformance,
  finalizeWebsiteProjectWithConformance,
} from "@/lib/ai/website/finalize-project";
import {
  renderDesignConformanceReport,
  type DesignConformanceReport,
} from "@/lib/design-md/cenate";
import type { DesignFamilyId } from "@/lib/ai/website/design-families";
import type { WebsiteVariantPlan } from "@/lib/ai/website/design-families";
import type { ProjectImagePlan } from "@/lib/ai/website/generated-images";
import { isProjectContent, parseProjectContent } from "@/lib/project-manifest";
import { getLanguageModel } from "@/lib/ai/providers";
import { OPENAI_DISABLED } from "@/lib/constants";
import { createDocumentHandler } from "@/lib/artifacts/server";
import type { UIMessageStreamWriter } from "ai";
import type { ChatMessage } from "@/lib/types";

// ─── Pipeline version (logged at module load for restart verification) ───
const PIPELINE_VERSION = "v9-section-count-fix";
console.log(`[pipeline] loaded ${PIPELINE_VERSION} | generate=${300}s per-model=${150}s repair=${60}s repair-outer=${120}s max-repairs=1 finalize=${120}s`);

// ─── Timeouts (ms) ──────────────────────────────────────────────
const TIMEOUT_GENERATE = 300_000;
const TIMEOUT_FINALIZE_LIGHT = 5_000;
const TIMEOUT_VALIDATE = 5_000;
const TIMEOUT_REPAIR = 60_000;
const TIMEOUT_FINALIZE_FULL = 120_000;

// ─── Helpers ─────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[pipeline] ${label} timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

function stripFences(code: string): string {
  return code
    .replace(/^```[\w]*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

function repairEnabled(): boolean {
  return process.env.CENATE_WEBSITE_REPAIR !== "0";
}

type GenerationStagePhase =
  | "generating"
  | "repairing"
  | "finalizing"
  | "preview_ready"
  | "hard_failed";

function writeStage(
  dataStream: UIMessageStreamWriter<ChatMessage>,
  phase: GenerationStagePhase,
  attempt: number,
  maxAttempts: number,
  message: string
) {
  dataStream.write({
    type: "data-generationStage",
    data: { phase, attempt, maxAttempts, message },
    transient: true,
  });
}

function deliverContent(
  dataStream: UIMessageStreamWriter<ChatMessage>,
  content: string
) {
  dataStream.write({
    type: "data-codeDelta",
    data: content,
    transient: true,
  });
}

// ─── Fast validation (no images, no async) ───────────────────────

function quickValidate(
  niche: NonNullable<ReturnType<typeof buildWebsiteProjectPrompt>["niche"]>,
  content: string,
  conformanceReport: DesignConformanceReport,
  selectedStyleId?: string | null,
  criticOpts?: {
    paletteDirection?: string | null;
    heroVariant?: number | null;
    pageArchetypeName?: string | null;
    variantPlan?: WebsiteVariantPlan;
  }
): {
  passed: boolean;
  issues: string[];
  criticReport: ReturnType<typeof runCritic>;
  conformanceReport: DesignConformanceReport;
} {
  const issues: string[] = [];
  const parsed = parseProjectContent(content);

  if (!parsed.isComplete || parsed.files.length === 0) {
    issues.push("project files incomplete");
  }

  const appFile = parsed.files.find((f) => f.path === "src/App.tsx");
  if (!appFile || !/<main\b[\s\S]*role="main"/.test(appFile.content)) {
    issues.push("missing main page composition");
  } else if (appFile.content.includes("__CENATE_SCAFFOLD_FALLBACK__")) {
    issues.push("App.tsx is scaffold fallback, not generated content");
  } else {
    // Real App.tsx should import section components (Navbar, Hero, Footer, etc.)
    // These live at @/components/SectionName — NOT @/components/ui/ (which are scaffold primitives)
    const sectionImports = Array.from(
      appFile.content.matchAll(/from\s+["']@\/components\/(?!ui\/)([^"']+)["']/g)
    );
    if (sectionImports.length < 2) {
      issues.push(`App.tsx has only ${sectionImports.length} section imports, expected ≥2`);
    }
  }

  let criticReport = runCritic(niche, content, selectedStyleId ?? undefined, criticOpts ?? undefined);

  // Detect unresolved local imports early so the repair LLM can fix them.
  // Without this check, broken imports only surface at the final readiness
  // evaluation — after repair has already run and can no longer help.
  const readiness = evaluateProjectPreviewReadiness(content);
  const unresolvedImportErrors = readiness.errors.filter((e) =>
    e.startsWith("unresolved import")
  );
  if (unresolvedImportErrors.length > 0) {
    const importIssues: CriticIssue[] = unresolvedImportErrors.map((e) => ({
      rule: "unresolved local import",
      detail: e,
      severity: "hard" as const,
      hint: "Remove this import or replace it with a scaffold UI primitive. Available: button, input, textarea, badge, card, section, container, heading, separator, accordion, tabs, dialog, sheet, aspect-ratio, testimonial, stats-band, gallery, mobile-nav.",
    }));
    criticReport = {
      ...criticReport,
      passed: false,
      issues: [...criticReport.issues, ...importIssues],
    };
  }

  return {
    passed: issues.length === 0 && criticReport.passed && conformanceReport.pass,
    issues,
    criticReport,
    conformanceReport,
  };
}

// tryBuildPreview removed — it only checked JSON serialization (always
// passed).  Preview readiness is now fully determined by the deep import
// resolution check in evaluateProjectPreviewReadiness().

// ─── Model fallbacks ─────────────────────────────────────────────

function getWebsiteModelFallbacks(primaryModelId: string): string[] {
  return Array.from(
    new Set([
      primaryModelId,
      "anthropic/claude-sonnet-4-20250514",
    ])
  );
}

const TIMEOUT_PER_MODEL = 150_000; // 150s per model attempt — allows complex 7-component generations to complete

async function generateWithFallbacks(
  primaryModelId: string,
  system: string,
  prompt: string
): Promise<string> {
  const modelIds = getWebsiteModelFallbacks(primaryModelId);
  console.log(`[pipeline] fallback chain: ${modelIds.join(" → ")} (${TIMEOUT_PER_MODEL / 1000}s each)`);
  let lastError: unknown;

  for (let i = 0; i < modelIds.length; i++) {
    const modelId = modelIds[i];
    const startMs = Date.now();
    try {
      console.log(`[pipeline] model ${i + 1}/${modelIds.length}: ${modelId} — starting`);
      const { text } = await withTimeout(
        generateText({
          model: getLanguageModel(modelId),
          system,
          prompt,
        }),
        TIMEOUT_PER_MODEL,
        `generate-${modelId}`
      );
      const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
      if (text && text.length > 0) {
        const hasAppTsx = text.includes("===FILE:src/App.tsx===");
        const hasFallback = text.includes("__CENATE_SCAFFOLD_FALLBACK__");
        console.log(`[pipeline] model ${modelId} succeeded in ${elapsed}s (${text.length} chars, hasAppTsx=${hasAppTsx}, hasFallback=${hasFallback})`);
        return text;
      }
      console.warn(`[pipeline] model ${modelId} returned empty text after ${elapsed}s`);
    } catch (error) {
      const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
      console.warn(`[pipeline] model ${modelId} failed after ${elapsed}s:`, error instanceof Error ? error.message : error);
      lastError = error;
    }
  }

  console.error(`[pipeline] ALL ${modelIds.length} models failed — falling back to scaffold`);
  throw lastError;
}

function buildCompactRepairSystemPrompt() {
  return [
    "You repair Cenate generated website projects.",
    "Output ONLY the complete delimited project.",
    "Preserve scaffold imports and use existing UI primitives.",
    "Do not explain. Do not ask questions. Do not output markdown fences.",
    "Keep Navbar, Hero, 3-5 body sections, Footer.",
  ].join(" ");
}

async function repairWithFallbacks(
  primaryModelId: string,
  prompt: string
): Promise<string> {
  const modelIds = getWebsiteModelFallbacks(primaryModelId);
  let lastError: unknown;

  for (const modelId of modelIds) {
    try {
      console.log(`[pipeline] repair attempt with model: ${modelId}`);
      const { text } = await withTimeout(
        generateText({
          model: getLanguageModel(modelId),
          system: buildCompactRepairSystemPrompt(),
          prompt,
        }),
        TIMEOUT_REPAIR,
        `repair-${modelId}`
      );
      if (text && text.length > 0) return text;
    } catch (error) {
      console.warn(`[pipeline] repair model ${modelId} failed:`, error instanceof Error ? error.message : error);
      lastError = error;
    }
  }

  throw lastError;
}

// ─── STRICT PIPELINE: Website generation ─────────────────────────
//
// Steps (sequential, each bounded by timeout):
//   1. Build prompt (sync)
//   2. Generate initial project (ONE LLM call)
//   3. Light finalize (scaffold + rewrite, no images)
//   4. Quick validate (fast deterministic checks)
//   5. Repair loop (max 2): repair → light finalize → validate
//   6. Full finalize (scaffold + images, ONCE)
//   7. Preview check (non-blocking)
//   8. Return result (always)
//

async function runWebsitePipeline(params: {
  brief: string;
  modelId: string;
  systemPrompt: string;
  niche: NonNullable<ReturnType<typeof buildWebsiteProjectPrompt>["niche"]>;
  designFamily: DesignFamilyId | null;
  selectedStyleId: string | null;
  variantPlan: WebsiteVariantPlan;
  imagePlan: ProjectImagePlan;
  paletteDirection?: string | null;
  heroVariant?: number | null;
  pageArchetypeName?: string | null;
  uploadedImageUrls?: string[];
  dataStream: UIMessageStreamWriter<ChatMessage>;
}): Promise<string> {
  const { brief, modelId, systemPrompt, niche, designFamily, selectedStyleId, variantPlan, imagePlan, paletteDirection, heroVariant, pageArchetypeName, uploadedImageUrls, dataStream } = params;
  const criticOpts = {
    paletteDirection,
    heroVariant,
    pageArchetypeName,
    variantPlan,
  };
  // maxRepairs=1: budget math — 150s generation + 120s repair + 120s finalize = 390s theoretical max
  // which already exceeds the 300s Vercel limit if all phases max out. Capping at 1 repair keeps
  // typical runs (80-120s generation + 1 repair + graceful finalize) within the 300s window.
  const maxRepairs = repairEnabled() ? 1 : 0;

  const generationModels = getWebsiteModelFallbacks(modelId);
  console.log("[pipeline:request]", {
    chatModel: modelId,
    generationChain: generationModels,
    repairChain: generationModels,
    imageMode: OPENAI_DISABLED ? "placeholder (OpenAI disabled)" : "gpt-image-1",
    niche,
    designFamily,
    selectedStyleId,
    variantPlan,
    uploadedImages: uploadedImageUrls?.length ?? 0,
    maxRepairs,
    promptChars: systemPrompt.length,
    briefChars: brief.length,
    estimatedPromptTokens: Math.round((systemPrompt.length + brief.length) / 4),
  });

  // ── STEP 1: Generate initial project ──
  writeStage(dataStream, "generating", 0, maxRepairs, "Generating website…");

  let candidateRaw: string;
  try {
    candidateRaw = await withTimeout(
      generateWithFallbacks(modelId, systemPrompt, brief),
      TIMEOUT_GENERATE,
      "generate"
    );
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes("timed out");
    console.warn("[pipeline] generation failed:", {
      reason: isTimeout ? "timeout" : "error",
      style: selectedStyleId ?? "none",
      niche,
      message: error instanceof Error ? error.message : String(error),
    });
    console.warn("[pipeline:scaffold-fallback] triggered — style=%s niche=%s timeout=%s", selectedStyleId, niche, isTimeout);
    // NEVER return empty — build a scaffold-only project so the artifact
    // panel always has content and the LLM never sees a failure signal.
    let fallbackContent: string;
    try {
      fallbackContent = lightFinalizeWebsiteProject({
        raw: "",
        brief,
        niche,
        designFamily: designFamily ?? undefined,
        variantPlan,
      });
    } catch {
      fallbackContent = "";
    }
    if (fallbackContent) {
      deliverContent(dataStream, fallbackContent);
    }
    writeStage(dataStream, "hard_failed", 0, maxRepairs, "Generation completed with limited content.");
    // Return the scaffold content — never empty
    return fallbackContent || "// Generation pending";
  }

  // ── TRACE: raw LLM output ──
  const rawHasAppTsx = candidateRaw.includes("===FILE:src/App.tsx===");
  const rawHasFallback = candidateRaw.includes("__CENATE_SCAFFOLD_FALLBACK__");
  const rawParsed = parseProjectContent(candidateRaw);
  const rawAppFile = rawParsed.files.find((f) => f.path === "src/App.tsx");
  const rawSectionFiles = rawParsed.files.filter((f) =>
    f.path.startsWith("src/components/") && !f.path.startsWith("src/components/ui/")
  );
  console.log("[pipeline:trace:raw]", {
    hasAppTsx: rawHasAppTsx,
    isFallback: rawHasFallback,
    totalFiles: rawParsed.files.length,
    sectionComponents: rawSectionFiles.map((f) => f.path),
    appImports: rawAppFile
      ? Array.from(rawAppFile.content.matchAll(/from\s+["']([^"']+)["']/g)).map((m) => m[1])
      : "NO_APP_FILE",
  });

  // Deliver raw generation content immediately so code panel is not empty
  deliverContent(dataStream, candidateRaw);

  // ── STEP 2: Light finalize (scaffold + rewrite, no images) ──
  writeStage(dataStream, "finalizing", 0, maxRepairs, "Finalizing project…");

  let lightContent: string;
  let lightConformance: DesignConformanceReport;
  try {
    const finalized = await withTimeout(
      Promise.resolve(
        lightFinalizeWebsiteProjectWithConformance({
          raw: candidateRaw,
          brief,
          niche,
          designFamily: designFamily ?? undefined,
          variantPlan,
        })
      ),
      TIMEOUT_FINALIZE_LIGHT,
      "light-finalize"
    );
    lightContent = finalized.content;
    lightConformance = finalized.conformance;
  } catch {
    // Light finalize is sync; timeout is a safety net
    lightContent = candidateRaw;
    lightConformance = {
      specId: (designFamily ?? "modern_minimal") as DesignConformanceReport["specId"],
      designFamily: (designFamily ?? "modern_minimal") as DesignConformanceReport["designFamily"],
      niche,
      pass: false,
      confidence: 0,
      summary: { hard: 1, soft: 0 },
      violations: [
        {
          id: "light-finalize-missing-conformance",
          category: "structure",
          severity: "hard",
          message: "Light finalize failed before a design conformance report could be produced.",
        },
      ],
      warnings: [],
      expectedSectionOrder: [],
      detectedSectionOrder: [],
      detectedTokens: {
        colors: [],
        typography: [],
        spacing: [],
        rounded: [],
        components: [],
        rawColorLiterals: [],
        arbitraryValues: [],
      },
      checkedFiles: [],
      metadata: {
        manifestSectionOrder: [],
        appSectionOrder: [],
        detectedRoleOrder: [],
      },
    };
  }

  // ── TRACE: after light finalize ──
  {
    const lp = parseProjectContent(lightContent);
    const lApp = lp.files.find((f) => f.path === "src/App.tsx");
    const lSections = lp.files.filter((f) =>
      f.path.startsWith("src/components/") && !f.path.startsWith("src/components/ui/")
    );
    console.log("[pipeline:trace:light-finalize]", {
      isFallback: lightContent.includes("__CENATE_SCAFFOLD_FALLBACK__"),
      totalFiles: lp.files.length,
      sectionComponents: lSections.map((f) => f.path),
      appImports: lApp
        ? Array.from(lApp.content.matchAll(/from\s+["']([^"']+)["']/g)).map((m) => m[1])
        : "NO_APP_FILE",
    });
  }

  // Deliver light-finalized content so code panel shows scaffold files
  deliverContent(dataStream, lightContent);

  // ── STEP 3: Quick validate ──
  let validation: ReturnType<typeof quickValidate>;
  try {
    validation = await withTimeout(
      Promise.resolve(quickValidate(niche, lightContent, lightConformance, selectedStyleId, criticOpts)),
      TIMEOUT_VALIDATE,
      "validate"
    );
  } catch {
    validation = {
      passed: false,
      issues: ["validation timed out"],
      criticReport: { niche, passed: false, issues: [] },
      conformanceReport: lightConformance,
    };
  }

  if (validation.criticReport.issues.length > 0) {
    console.log("[pipeline:critic]", renderCriticReport(validation.criticReport));
  }
  if (!validation.conformanceReport.pass || validation.conformanceReport.warnings.length > 0) {
    console.log("[pipeline:design-conformance]", renderDesignConformanceReport(validation.conformanceReport));
  }

  // ── STEP 4: Repair loop (bounded, max 2 attempts) ──
  let bestContent = lightContent;
  let bestCandidateRaw = candidateRaw;

  if (!validation.passed && maxRepairs > 0) {
    for (let attempt = 1; attempt <= maxRepairs; attempt++) {
      writeStage(
        dataStream,
        "repairing",
        attempt,
        maxRepairs,
        `Repairing project (${attempt}/${maxRepairs})…`
      );

      // Generate repair candidate
      let repairedRaw: string;
      try {
        const repairPrompt = buildRepairPrompt(
          niche,
          bestContent,
          validation.criticReport,
          validation.conformanceReport,
          variantPlan
        );
        repairedRaw = await withTimeout(
          repairWithFallbacks(modelId, repairPrompt),
          TIMEOUT_REPAIR * 2,
          `repair-${attempt}`
        );
      } catch (err) {
        console.warn(`[pipeline] repair attempt ${attempt} failed:`, err);
        break; // Stop repairing, use best version
      }

      // Light finalize the repaired version
      let repairedLight: string;
      let repairedConformance: DesignConformanceReport;
      try {
        const finalized = await withTimeout(
          Promise.resolve(
            lightFinalizeWebsiteProjectWithConformance({
              raw: repairedRaw,
              brief,
              niche,
              designFamily: designFamily ?? undefined,
              variantPlan,
            })
          ),
          TIMEOUT_FINALIZE_LIGHT,
          `light-finalize-repair-${attempt}`
        );
        repairedLight = finalized.content;
        repairedConformance = finalized.conformance;
      } catch {
        repairedLight = repairedRaw;
        repairedConformance = validation.conformanceReport;
      }

      // Re-validate
      let revalidation: ReturnType<typeof quickValidate>;
      try {
        revalidation = await withTimeout(
          Promise.resolve(quickValidate(niche, repairedLight, repairedConformance, selectedStyleId, criticOpts)),
          TIMEOUT_VALIDATE,
          `validate-repair-${attempt}`
        );
      } catch {
        revalidation = {
          passed: false,
          issues: ["validation timed out"],
          criticReport: { niche, passed: false, issues: [] },
          conformanceReport: repairedConformance,
        };
      }

      if (revalidation.criticReport.issues.length > 0) {
        console.log(`[pipeline:critic:repair-${attempt}]`, renderCriticReport(revalidation.criticReport));
      }
      if (!revalidation.conformanceReport.pass || revalidation.conformanceReport.warnings.length > 0) {
        console.log(
          `[pipeline:design-conformance:repair-${attempt}]`,
          renderDesignConformanceReport(revalidation.conformanceReport)
        );
      }

      // Always update best to latest repaired version
      bestContent = repairedLight;
      bestCandidateRaw = repairedRaw;
      validation = revalidation;

      // Deliver repaired content so code panel stays current
      deliverContent(dataStream, bestContent);

      if (revalidation.passed) {
        break; // Repair succeeded
      }
    }
  }

  // ── STEP 5: Full finalize (images, ONCE) ──
  writeStage(dataStream, "finalizing", 0, maxRepairs, "Generating images & finalizing…");

  let finalContent: string;
  try {
      const finalized = await withTimeout(
      finalizeWebsiteProjectWithConformance({
        raw: bestCandidateRaw,
        brief,
        niche,
        designFamily: designFamily ?? undefined,
        uploadedImageUrls,
        variantPlan,
        imagePlan,
      }),
      TIMEOUT_FINALIZE_FULL,
      "full-finalize"
    );
    finalContent = finalized.content;
    console.log("[pipeline:design-conformance:final]", renderDesignConformanceReport(finalized.conformance));
  } catch (err) {
    console.warn("[pipeline] full finalize failed:", err);
    // Fall back to light-finalized version (no images but complete)
    finalContent = bestContent;
  }

  // ── TRACE: after full finalize ──
  {
    const fp = parseProjectContent(finalContent);
    const fApp = fp.files.find((f) => f.path === "src/App.tsx");
    const fSections = fp.files.filter((f) =>
      f.path.startsWith("src/components/") && !f.path.startsWith("src/components/ui/")
    );
    console.log("[pipeline:trace:full-finalize]", {
      isFallback: finalContent.includes("__CENATE_SCAFFOLD_FALLBACK__"),
      totalFiles: fp.files.length,
      sectionComponents: fSections.map((f) => f.path),
      appImports: fApp
        ? Array.from(fApp.content.matchAll(/from\s+["']([^"']+)["']/g)).map((m) => m[1])
        : "NO_APP_FILE",
    });
  }

  // ── STEP 6: Return result (ALWAYS) ──
  // Deliver final content BEFORE stage transition so the UI has content
  // when status flips to "idle". This prevents blank preview/code panel.
  deliverContent(dataStream, finalContent);

  // Deep readiness check — validates ALL local imports across every
  // project file, not just entry points.  If any import would fail at
  // runtime, the preview cannot mount and we must not claim "ready".
  const readiness = evaluateProjectPreviewReadiness(finalContent);
  if (!readiness.previewReady) {
    console.warn("[pipeline:preflight] failed:", {
      errors: readiness.errors,
      mainImports: readiness.mainImportResolutions,
      appImports: readiness.appImportResolutions,
    });
  }

  const phase: GenerationStagePhase =
    readiness.previewReady && !readiness.isFallbackApp ? "preview_ready" : "hard_failed";
  const statusMessage =
    phase === "preview_ready"
      ? "Preview ready."
      : readiness.isFallbackApp
        ? "Generation produced scaffold only — code available in code panel."
        : `Preview blocked — ${readiness.errors.length} import(s) failed to resolve. Code available in code panel.`;

  writeStage(dataStream, phase, 0, maxRepairs, statusMessage);

  return finalContent;
}

// ─── STRICT PIPELINE: Website update ─────────────────────────────

async function runWebsiteUpdatePipeline(params: {
  brief: string;
  modelId: string;
  systemPrompt: string;
  niche: NonNullable<ReturnType<typeof buildWebsiteProjectPrompt>["niche"]>;
  designFamily: DesignFamilyId | null;
  selectedStyleId: string | null;
  variantPlan: WebsiteVariantPlan;
  imagePlan: ProjectImagePlan;
  paletteDirection?: string | null;
  heroVariant?: number | null;
  pageArchetypeName?: string | null;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}): Promise<string> {
  return runWebsitePipeline(params);
}

// ─── Document handler ────────────────────────────────────────────

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  onCreateDocument: async ({ title, description, dataStream, modelId, uploadedImageUrls }) => {
    const brief = description || title;
    const isWebsite = isWebsiteRequest(brief) || isWebsiteRequest(title);

    if (isWebsite) {
      const built = buildWebsiteProjectPrompt(brief, { uploadedImageUrls });
      return runWebsitePipeline({
        brief,
        modelId,
        systemPrompt: built.prompt,
        niche: built.niche,
        designFamily: built.designFamily as DesignFamilyId,
        selectedStyleId: built.selectedStyleId,
        variantPlan: built.variantPlan,
        imagePlan: built.imagePlan,
        paletteDirection: built.paletteDirection,
        heroVariant: built.heroVariant,
        pageArchetypeName: built.pageArchetypeName,
        uploadedImageUrls,
        dataStream,
      });
    }

    // Non-website code generation
    const systemMessage = `${codePrompt}\n\nOutput ONLY the code. No explanations, no markdown fences, no wrapping.`;
    const { text } = await generateText({
      model: getLanguageModel(modelId),
      system: systemMessage,
      prompt: brief,
    });
    const cleaned = stripFences(text);
    deliverContent(dataStream, cleaned);
    return cleaned;
  },
  onUpdateDocument: async ({ document, description, dataStream, modelId }) => {
    const isWebsite =
      (document.content && isProjectContent(document.content)) ||
      document.content?.includes("<!DOCTYPE") ||
      document.content?.includes("<html") ||
      isWebsiteRequest(document.title);

    if (isWebsite) {
      const built = buildWebsiteProjectPrompt(description || document.title);
      const systemMessage = websiteUpdatePrompt(document.content ?? "");

      return runWebsiteUpdatePipeline({
        brief: description || document.title,
        modelId,
        systemPrompt: systemMessage,
        niche: built.niche,
        designFamily: built.designFamily as DesignFamilyId,
        selectedStyleId: built.selectedStyleId,
        variantPlan: built.variantPlan,
        imagePlan: built.imagePlan,
        paletteDirection: built.paletteDirection,
        heroVariant: built.heroVariant,
        pageArchetypeName: built.pageArchetypeName,
        dataStream,
      });
    }

    // Non-website code update
    const systemMessage = `${updateDocumentPrompt(document.content, "code")}\n\nOutput ONLY the complete updated code. No explanations, no markdown fences, no wrapping.`;
    const { text } = await generateText({
      model: getLanguageModel(modelId),
      system: systemMessage,
      prompt: description,
    });
    const cleaned = stripFences(text);
    deliverContent(dataStream, cleaned);
    return cleaned;
  },
});
