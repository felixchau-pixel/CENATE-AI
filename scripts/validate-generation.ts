/**
 * Real active-path generation validator.
 * Runs the same website flow as artifacts/code/server.ts:
 *   prompt build → initial generation → finalize → critic/preview validation
 *   → bounded repair loop → finalized artifact write
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateText } from "ai";
import { buildWebsiteProjectPrompt } from "../lib/ai/prompts-website";
import { getLanguageModel } from "../lib/ai/providers";
import { parseProjectContent } from "../lib/project-manifest";
import type { DesignFamilyId } from "../lib/ai/website/design-families";
import {
  buildRepairPrompt,
  runCritic,
  renderCriticReport,
} from "../lib/ai/website/critic";
import {
  PACKAGE_BASELINE_DEPENDENCIES,
  PACKAGE_BASELINE_DEV_DEPENDENCIES,
  REQUIRED_SCAFFOLD_DIRECTORIES,
  REQUIRED_SCAFFOLD_FILES,
} from "../lib/ai/website/scaffold-files";
import { finalizeWebsiteProjectWithConformance } from "../lib/ai/website/finalize-project";
import { buildPreviewHtml } from "../lib/ai/website/preview-html";

const brief = process.argv[2];
const slug = process.argv[3] || "test";

if (!brief) {
  console.error("Usage: npx tsx scripts/validate-generation.ts <brief> [slug]");
  process.exit(1);
}

async function main() {
  const outDir = path.join(process.cwd(), ".tmp", "validation");
  mkdirSync(outDir, { recursive: true });

  console.log(`[${slug}] Building prompt...`);
  const built = buildWebsiteProjectPrompt(brief);
  console.log(`[${slug}] Niche: ${built.niche}`);
  console.log(`[${slug}] Prompt: ${built.prompt.length} chars`);
  console.log(`[${slug}] Generating...`);

  const getModelFallbacks = (primaryModelId: string) =>
    Array.from(
      new Set([
        primaryModelId,
        "anthropic/claude-sonnet-4-20250514",
        "openai/gpt-5-mini",
      ])
    );

  const generateCandidate = async (system: string, prompt: string) => {
    let lastError: unknown;
    for (const modelId of getModelFallbacks("anthropic/claude-sonnet-4-20250514")) {
      try {
        const { text } = await generateText({
          model: getLanguageModel(modelId),
          system,
          prompt,
        });
        if (text && text.length > 0) {
          return text;
        }
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  const validateFinal = (content: string) => {
    const parsed = parseProjectContent(content);
    const issues: string[] = [];
    if (!parsed.isComplete || parsed.files.length === 0) {
      issues.push("project files incomplete");
    }
    const appFile = parsed.files.find((file) => file.path === "src/App.tsx");
    if (!appFile || !/<main\b[\s\S]*role="main"/.test(appFile.content)) {
      issues.push("missing main page composition");
    }
    const html = buildPreviewHtml(parsed.files);
    if (!html.includes("__CENATE_PREVIEW_FILES__")) {
      issues.push("preview assembly failed");
    }
    const criticReport = runCritic(built.niche, content);
    return {
      parsed,
      criticReport,
      issues,
      passed: issues.length === 0 && criticReport.passed,
    };
  };

  const startedAt = Date.now();
  let raw = await generateCandidate(built.prompt, brief);
  const durationMs = Date.now() - startedAt;
  console.log(`[${slug}] Generated in ${(durationMs / 1000).toFixed(1)}s (${raw.length} chars)`);

  const maxRepairAttempts = 2;
  let final = "";
  let criticReport = runCritic(built.niche, raw);
  let conformanceReport = null as null | Awaited<ReturnType<typeof finalizeWebsiteProjectWithConformance>>["conformance"];
  let validation = null as null | ReturnType<typeof validateFinal>;

  for (let attempt = 0; attempt <= maxRepairAttempts; attempt += 1) {
    const finalized = await finalizeWebsiteProjectWithConformance({
      raw,
      brief,
      niche: built.niche,
      designFamily: built.designFamily as DesignFamilyId,
    });
    final = finalized.content;
    conformanceReport = finalized.conformance;

    validation = validateFinal(final);
    criticReport = validation.criticReport;
    console.log(
      `[${slug}] Validation attempt ${attempt}/${maxRepairAttempts}: critic=${criticReport.passed} internal=${validation.issues.length === 0}`
    );

    if (validation.passed) {
      break;
    }

    if (attempt === maxRepairAttempts) {
      break;
    }

    console.log(`[${slug}] Repairing failed generation...`);
    try {
      raw = await generateCandidate(
        [
          "You repair Cenate generated website projects.",
          "Output ONLY the complete delimited project.",
          "Preserve scaffold imports and use existing UI primitives.",
          "Do not explain. Do not ask questions. Do not output markdown fences.",
          "Keep Navbar, Hero, 3-5 body sections, Footer.",
        ].join(" "),
        buildRepairPrompt(built.niche, final, criticReport)
      );
    } catch (error) {
      console.warn(`[${slug}] Repair failed:`, error);
      break;
    }
  }

  console.log(renderCriticReport(criticReport));

  // Parse and analyze
  const parsed = parseProjectContent(final);
  console.log(`[${slug}] Files: ${parsed.files.length}`);
  console.log(`[${slug}] Complete: ${parsed.isComplete}`);

  // Extract evidence
  const pkgFile = parsed.files.find((f) => f.path === "package.json");
  const filePaths = parsed.files.map((f) => f.path);
  const buttonFile = parsed.files.find(
    (f) => f.path === "src/components/ui/button.tsx"
  );
  const utilsFile = parsed.files.find(
    (f) => f.path === "src/lib/utils.ts"
  );
  const accordionFile = parsed.files.find(
    (f) => f.path === "src/components/ui/accordion.tsx"
  );
  const tabsFile = parsed.files.find(
    (f) => f.path === "src/components/ui/tabs.tsx"
  );

  // Section files (not ui, not config)
  const sectionFiles = parsed.files.filter(
    (f) =>
      f.path.startsWith("src/components/") &&
      !f.path.startsWith("src/components/ui/") &&
      f.path.endsWith(".tsx")
  );

  // Check imports in section files
  const importEvidence: Record<string, string[]> = {};
  for (const sf of sectionFiles) {
    const imports = sf.content
      .split("\n")
      .filter((l: string) => l.includes("import ") && l.includes("@/components/ui/"))
      .map((l: string) => l.trim());
    importEvidence[sf.path] = imports;
  }

  const missingRequiredFiles = REQUIRED_SCAFFOLD_FILES.filter(
    (filePath) => !filePaths.includes(filePath)
  );
  const missingRequiredDirectories = REQUIRED_SCAFFOLD_DIRECTORIES.filter(
    (dirPath) => !filePaths.some((filePath) => filePath.startsWith(dirPath))
  );

  const packageJson = pkgFile ? JSON.parse(pkgFile.content) : null;
  const dependencies = packageJson?.dependencies ?? {};
  const devDependencies = packageJson?.devDependencies ?? {};
  const missingBaselineDependencies = PACKAGE_BASELINE_DEPENDENCIES.filter(
    (name) => !(name in dependencies)
  );
  const missingBaselineDevDependencies =
    PACKAGE_BASELINE_DEV_DEPENDENCIES.filter((name) => !(name in devDependencies));
  const appFile = parsed.files.find((f) => f.path === "src/App.tsx");
  const bunLockFile = parsed.files.find((f) => f.path === "bun.lock");
  const generatedImagesFile = parsed.files.find(
    (f) => f.path === "src/assets/generated-images.ts"
  );
  const manifestGeneratedAssetCount = parsed.assets.filter(
    (asset) => asset.source === "generated"
  ).length;
  const manifestFallbackAssetCount = parsed.assets.filter(
    (asset) => asset.source === "fallback"
  ).length;
  const manifestAssetPaths = parsed.assets.map((asset) => asset.path);
  const manifestAssetExistence = manifestAssetPaths.map((assetPath) => ({
    path: assetPath,
    existsInFiles: filePaths.includes(assetPath),
  }));
  const generatedImageKeysPresent = generatedImagesFile
    ? Array.from(
        generatedImagesFile.content.matchAll(
          /\b(hero|support|gallery1|gallery2|gallery3|detail1)\s*:\s*`data:image\//g
        )
      ).map((m) => m[1])
    : [];
  const imageBearingSectionRefs = sectionFiles
    .filter((f) =>
      /(Hero|Story|About|Chef|Gallery|Showcase|SelectedWork|Project|Services|Capabilities|Process|Proof|Testimonial|Pricing|Conversion|Estimate|Contact|Invitation)/.test(
        f.path
      )
    )
    .map((f) => ({
      path: f.path,
      projectImageRefs: Array.from(
        f.content.matchAll(/projectImages\.(hero|support|gallery1|gallery2|gallery3|detail1)/g)
      ).map((m) => m[1]),
      hasImgTag: /<img\b/.test(f.content),
    }));
  const appContent = appFile?.content ?? "";
  const appHasMainLandmark = /<main[\s\S]*role="main"|<main role="main"[\s\S]*/.test(appContent);
  const appRenderedComponents = Array.from(
    appContent.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)
  ).map((m) => m[1]);
  const appRenderedUnique = [...new Set(appRenderedComponents)].filter(
    (name) => name !== "React"
  );
  const appBodySectionCount = appRenderedUnique.filter(
    (name) => !["Navbar", "Hero", "Footer"].includes(name)
  ).length;
  const actionSurfaceFiles = sectionFiles.filter((f) =>
    /src\/components\/(?:Navbar|Hero|[A-Za-z]*(?:CTA|Contact|Conversion|Reservation))[A-Za-z]*\.tsx$/.test(
      f.path
    )
  );
  const actionSurfaceButtonUsage = actionSurfaceFiles.map((f) => ({
    path: f.path,
    requiresButton:
      /<Button\b/.test(f.content) ||
      /<(?:button|a)\b[\s\S]{0,220}className="[^"]*(?:bg-|rounded|border|px-\d|py-\d)[^"]*"/.test(
        f.content
      ) ||
      /cta|trial|quote|book|demo|contact/i.test(f.content),
    usesButton: /from ["']@\/components\/ui\/button["']/.test(f.content) || /<Button\b/.test(f.content),
  }));
  const allText = parsed.files.map((f) => f.content).join("\n");
  const hasUnsplash = /images\.unsplash\.com/.test(allText);
  const hasRemoteStock = /(src|image|img|avatar|photo|poster|url)\s*[:=]\s*["']https?:\/\/(?!data:image)[^"']+["']/.test(
    allText
  );

  // Write evidence
  const evidence = {
    slug,
    brief,
    niche: built.niche,
    durationMs,
    fileCount: parsed.files.length,
    isComplete: parsed.isComplete,
    critic: criticReport,
    designConformance: conformanceReport,
    packageJson,
    requiredScaffold: {
      missingFiles: missingRequiredFiles,
      missingDirectories: missingRequiredDirectories,
    },
    packageBaseline: {
      missingDependencies: missingBaselineDependencies,
      missingDevDependencies: missingBaselineDevDependencies,
    },
    designFamily: built.designFamily,
    imagePipeline: {
      hasGeneratedImagesFile: !!generatedImagesFile,
      assetCount: parsed.assets.length,
      generatedAssetCount: manifestGeneratedAssetCount,
      fallbackAssetCount: manifestFallbackAssetCount,
      assetPaths: manifestAssetPaths,
      assetExistence: manifestAssetExistence,
      generatedImageKeysPresent,
      imageBearingSectionRefs,
      assetSources: parsed.assets.map((asset) => asset.source),
      hasUnsplash,
      hasRemoteStock,
    },
    bunLockPresent: !!bunLockFile,
    appStructure: {
      hasMainLandmark: appHasMainLandmark,
      renderedComponents: appRenderedUnique,
      bodySectionCount: appBodySectionCount,
    },
    actionSurfaceButtonUsage,
    scaffoldPresent: {
      button: !!buttonFile,
      buttonHasRadix: buttonFile?.content.includes("@radix-ui/react-slot") ?? false,
      buttonHasCva: buttonFile?.content.includes("class-variance-authority") ?? false,
      utils: !!utilsFile,
      utilsHasClsx: utilsFile?.content.includes("clsx") ?? false,
      accordion: !!accordionFile,
      accordionHasRadix: accordionFile?.content.includes("@radix-ui/react-accordion") ?? false,
      tabs: !!tabsFile,
      tabsHasRadix: tabsFile?.content.includes("@radix-ui/react-tabs") ?? false,
    },
    sectionFiles: sectionFiles.map((f) => f.path),
    sectionImports: importEvidence,
    allFiles: parsed.files.map((f) => ({
      path: f.path,
      size: f.content.length,
    })),
  };

  writeFileSync(
    path.join(outDir, `${slug}.json`),
    JSON.stringify(evidence, null, 2),
    "utf8"
  );
  writeFileSync(path.join(outDir, `${slug}.txt`), final, "utf8");
  writeFileSync(path.join(outDir, `${slug}.html`), buildPreviewHtml(parsed.files), "utf8");

  // Print summary
  console.log("\n=== EVIDENCE SUMMARY ===");
  console.log(`Niche: ${built.niche}`);
  console.log(`Duration: ${(durationMs / 1000).toFixed(1)}s`);
  console.log(`Files: ${parsed.files.length}`);
  console.log(`Critic passed: ${criticReport.passed}`);
  console.log(`Required scaffold files missing: ${missingRequiredFiles.length}`);
  console.log(`Required scaffold directories missing: ${missingRequiredDirectories.length}`);
  console.log(`Baseline dependencies missing: ${missingBaselineDependencies.length}`);
  console.log(`Baseline devDependencies missing: ${missingBaselineDevDependencies.length}`);
  console.log(`Design family: ${built.designFamily}`);
  console.log(`bun.lock present: ${!!bunLockFile}`);
  console.log(`Generated images file present: ${!!generatedImagesFile}`);
  console.log(`Manifest assets: ${parsed.assets.length}`);
  console.log(`Generated assets: ${manifestGeneratedAssetCount}`);
  console.log(`Fallback assets: ${manifestFallbackAssetCount}`);
  console.log(`Has Unsplash: ${hasUnsplash}`);
  console.log(`Has remote stock: ${hasRemoteStock}`);
  console.log(`App has main landmark: ${appHasMainLandmark}`);
  console.log(`App body section count: ${appBodySectionCount}`);
  console.log(`\nScaffold injection proof:`);
  console.log(`  Button has @radix-ui/react-slot: ${evidence.scaffoldPresent.buttonHasRadix}`);
  console.log(`  Button has cva: ${evidence.scaffoldPresent.buttonHasCva}`);
  console.log(`  Utils has clsx: ${evidence.scaffoldPresent.utilsHasClsx}`);
  console.log(`  Accordion has @radix-ui/react-accordion: ${evidence.scaffoldPresent.accordionHasRadix}`);
  console.log(`  Tabs has @radix-ui/react-tabs: ${evidence.scaffoldPresent.tabsHasRadix}`);
  if (missingRequiredFiles.length > 0) {
    console.log(`\nMissing required scaffold files:`);
    for (const filePath of missingRequiredFiles) {
      console.log(`  ${filePath}`);
    }
  }
  if (missingRequiredDirectories.length > 0) {
    console.log(`\nMissing required scaffold directories:`);
    for (const dirPath of missingRequiredDirectories) {
      console.log(`  ${dirPath}`);
    }
  }
  if (missingBaselineDependencies.length > 0) {
    console.log(`\nMissing baseline dependencies:`);
    for (const name of missingBaselineDependencies) {
      console.log(`  ${name}`);
    }
  }
  if (missingBaselineDevDependencies.length > 0) {
    console.log(`\nMissing baseline devDependencies:`);
    for (const name of missingBaselineDevDependencies) {
      console.log(`  ${name}`);
    }
  }
  console.log(`\nPackage.json dependencies:`);
  if (packageJson?.dependencies) {
    for (const [k, v] of Object.entries(packageJson.dependencies)) {
      console.log(`  ${k}: ${v}`);
    }
  }
  console.log(`\nPackage.json devDependencies:`);
  if (packageJson?.devDependencies) {
    for (const [k, v] of Object.entries(packageJson.devDependencies)) {
      console.log(`  ${k}: ${v}`);
    }
  }
  console.log(`\nSection files (${sectionFiles.length}):`);
  for (const sf of sectionFiles) {
    const imports = importEvidence[sf.path] || [];
    console.log(`  ${sf.path} — ${imports.length} UI imports`);
  }
  console.log(`\nGenerated asset paths:`);
  for (const asset of manifestAssetExistence) {
    console.log(`  ${asset.path}: existsInFiles=${asset.existsInFiles}`);
  }
  console.log(`\nImage-bearing section refs:`);
  for (const section of imageBearingSectionRefs) {
    console.log(`  ${section.path}: refs=[${section.projectImageRefs.join(", ")}] hasImgTag=${section.hasImgTag}`);
  }
  console.log(`\nAction surface Button usage:`);
  for (const item of actionSurfaceButtonUsage) {
    console.log(`  ${item.path}: requiresButton=${item.requiresButton}, usesButton=${item.usesButton}`);
  }
  console.log("=== END EVIDENCE ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
