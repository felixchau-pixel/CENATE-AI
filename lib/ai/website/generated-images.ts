import { generateImage } from "ai";
import { getImageModel } from "../providers";
import { OPENAI_DISABLED } from "../../constants";
import type { DesignFamilyId } from "./design-families";
import { buildGeneratedImageSpecs } from "./design-families";
import { getCuratedImages, type CuratedImage } from "./curated-images";
import type { Niche } from "./niche-router";
import { findLocalImage } from "./local-image-library";

export type GeneratedProjectImage = {
  key: "hero" | "support" | "gallery1" | "gallery2" | "gallery3" | "detail1";
  path: string;
  prompt: string;
  dataUrl: string;
  source: "generated" | "placeholder" | "curated" | "uploaded";
};

export type PlannedProjectImageSource =
  | "uploaded"
  | "curated-local"
  | "approved-external"
  | "generated";

export type PlannedProjectImage = {
  key: GeneratedProjectImage["key"];
  path: string;
  prompt: string;
  source: PlannedProjectImageSource;
  assignedRole: "hero" | "support" | "gallery" | "detail";
  rationale: string;
  uploadedUrl?: string;
  approvedExternalUrl?: string;
  approvedExternalId?: string;
  approvedExternalBrief?: string;
  localFileName?: string;
  localFolder?: string;
};

export type ProjectImagePlan = {
  items: PlannedProjectImage[];
  primarySource: PlannedProjectImageSource;
};

const REQUIRED_IMAGE_KEYS: Array<GeneratedProjectImage["key"]> = [
  "hero",
  "support",
  "gallery1",
  "gallery2",
];

function sizeForAspectRatio(
  aspectRatio: "16:10" | "4:5" | "3:2" | "1:1"
): `${number}x${number}` {
  switch (aspectRatio) {
    case "16:10":
      return "1536x1024";
    case "4:5":
      return "1024x1280";
    case "3:2":
      return "1536x1024";
    case "1:1":
      return "1024x1024";
  }
}

function escapeTemplateLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function scenePlaceholder(
  niche: Niche,
  key: string,
  family: DesignFamilyId,
  accent: string,
  background: string
): string {
  const overlay = `linear-gradient(135deg, ${background}, ${accent}22)`;
  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="1000" gradientUnits="userSpaceOnUse">
      <stop stop-color="${background}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.16"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)"/>
  <rect x="56" y="56" width="1488" height="888" rx="34" fill="${background}" fill-opacity="0.72" stroke="${accent}" stroke-opacity="0.22"/>
  <rect x="100" y="100" width="1400" height="800" rx="28" fill="${background}" fill-opacity="0.36"/>
`;
  const end = `</svg>`;

  let content = "";

  switch (niche) {
    case "construction":
      content = `
  <rect x="120" y="650" width="1360" height="180" fill="${accent}" fill-opacity="0.18"/>
  <rect x="220" y="470" width="250" height="270" rx="18" fill="${accent}" fill-opacity="0.18"/>
  <rect x="510" y="360" width="220" height="380" rx="18" fill="${accent}" fill-opacity="0.12"/>
  <rect x="760" y="420" width="280" height="320" rx="18" fill="${accent}" fill-opacity="0.18"/>
  <rect x="1080" y="300" width="210" height="440" rx="18" fill="${accent}" fill-opacity="0.12"/>
  <path d="M1030 180H1310L1180 320H1050L1030 180Z" fill="${accent}" fill-opacity="0.28"/>
  <path d="M1180 180V520" stroke="${accent}" stroke-width="22" stroke-linecap="round"/>
  <path d="M1180 240L840 440" stroke="${accent}" stroke-width="18" stroke-linecap="round"/>
  <circle cx="870" cy="455" r="34" fill="${accent}" fill-opacity="0.44"/>
  <rect x="230" y="770" width="160" height="22" rx="11" fill="${accent}" fill-opacity="0.32"/>
  <rect x="510" y="770" width="180" height="22" rx="11" fill="${accent}" fill-opacity="0.28"/>
  <rect x="780" y="770" width="220" height="22" rx="11" fill="${accent}" fill-opacity="0.28"/>
`;
      break;
    case "restaurant":
      content = `
  <ellipse cx="840" cy="610" rx="400" ry="170" fill="${accent}" fill-opacity="0.10"/>
  <circle cx="840" cy="540" r="220" fill="${accent}" fill-opacity="0.20"/>
  <circle cx="840" cy="540" r="170" fill="${background}" fill-opacity="0.9" stroke="${accent}" stroke-opacity="0.38" stroke-width="10"/>
  <path d="M720 520C770 430 920 430 970 520C1008 588 962 664 842 694C706 666 674 584 720 520Z" fill="${accent}" fill-opacity="0.34"/>
  <rect x="240" y="230" width="120" height="430" rx="60" fill="${accent}" fill-opacity="0.14"/>
  <rect x="1240" y="250" width="120" height="390" rx="60" fill="${accent}" fill-opacity="0.14"/>
  <circle cx="300" cy="190" r="58" fill="${accent}" fill-opacity="0.22"/>
  <circle cx="1300" cy="210" r="58" fill="${accent}" fill-opacity="0.18"/>
  <rect x="500" y="780" width="680" height="18" rx="9" fill="${accent}" fill-opacity="0.2"/>
`;
      break;
    case "saas":
      content = `
  <rect x="180" y="140" width="1240" height="720" rx="34" fill="${background}" stroke="${accent}" stroke-opacity="0.36" stroke-width="10"/>
  <rect x="180" y="140" width="1240" height="72" rx="34" fill="${accent}" fill-opacity="0.14"/>
  <circle cx="240" cy="176" r="10" fill="${accent}" fill-opacity="0.6"/>
  <circle cx="272" cy="176" r="10" fill="${accent}" fill-opacity="0.4"/>
  <circle cx="304" cy="176" r="10" fill="${accent}" fill-opacity="0.3"/>
  <rect x="220" y="250" width="210" height="560" rx="24" fill="${accent}" fill-opacity="0.08"/>
  <rect x="470" y="250" width="420" height="260" rx="24" fill="${accent}" fill-opacity="0.14"/>
  <rect x="930" y="250" width="380" height="120" rx="24" fill="${accent}" fill-opacity="0.1"/>
  <rect x="930" y="400" width="380" height="120" rx="24" fill="${accent}" fill-opacity="0.08"/>
  <rect x="470" y="550" width="840" height="220" rx="24" fill="${accent}" fill-opacity="0.08"/>
  <path d="M520 470C600 380 740 350 850 410" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
  <path d="M540 440L560 470L520 470Z" fill="${accent}" fill-opacity="0.8"/>
`;
      break;
    case "agency":
    case "portfolio":
      content = `
  <rect x="180" y="170" width="400" height="560" rx="28" fill="${accent}" fill-opacity="0.16" transform="rotate(-6 180 170)"/>
  <rect x="570" y="250" width="460" height="470" rx="28" fill="${background}" stroke="${accent}" stroke-opacity="0.3" stroke-width="8"/>
  <rect x="1040" y="190" width="320" height="420" rx="28" fill="${accent}" fill-opacity="0.12" transform="rotate(7 1040 190)"/>
  <rect x="240" y="260" width="280" height="210" rx="20" fill="${background}" fill-opacity="0.6"/>
  <rect x="240" y="500" width="280" height="170" rx="20" fill="${background}" fill-opacity="0.36"/>
  <rect x="630" y="310" width="320" height="240" rx="20" fill="${accent}" fill-opacity="0.2"/>
  <rect x="630" y="580" width="220" height="20" rx="10" fill="${accent}" fill-opacity="0.28"/>
  <rect x="630" y="620" width="300" height="14" rx="7" fill="${accent}" fill-opacity="0.18"/>
`;
      break;
    default:
      content = `
  <rect x="180" y="180" width="520" height="580" rx="30" fill="${accent}" fill-opacity="0.12"/>
  <rect x="760" y="220" width="650" height="500" rx="30" fill="${background}" stroke="${accent}" stroke-opacity="0.24" stroke-width="8"/>
  <rect x="820" y="300" width="260" height="26" rx="13" fill="${accent}" fill-opacity="0.28"/>
  <rect x="820" y="350" width="420" height="18" rx="9" fill="${accent}" fill-opacity="0.18"/>
  <rect x="820" y="390" width="360" height="18" rx="9" fill="${accent}" fill-opacity="0.14"/>
  <rect x="820" y="470" width="520" height="180" rx="24" fill="${accent}" fill-opacity="0.08"/>
`;
      break;
  }

  const motif = key === "detail1"
    ? `<rect x="1180" y="680" width="180" height="120" rx="24" fill="${accent}" fill-opacity="0.22"/>`
    : key.startsWith("gallery")
      ? `<rect x="1150" y="140" width="220" height="220" rx="26" fill="${accent}" fill-opacity="0.14"/><rect x="120" y="180" width="180" height="140" rx="24" fill="${accent}" fill-opacity="0.1"/>`
      : "";

  return svgDataUrl(`${base}${content}${motif}${end}`);
}

function familyPlaceholderColors(family: DesignFamilyId): {
  accent: string;
  background: string;
} {
  switch (family) {
    case "editorial_luxury":
      return { accent: "#D7B56D", background: "#171210" };
    case "modern_minimal":
      return { accent: "#4066F5", background: "#F8FAFF" };
    case "bold_commercial":
      return { accent: "#F7982A", background: "#0F141D" };
    case "warm_artisan":
      return { accent: "#AA5A34", background: "#F6EFE6" };
  }
}

// ── Uploaded image support ────────────────────────────────────────
// Slot priority order when user uploads images without explicit slot hints.
// Hero always first; remaining order is niche-aware.
function uploadedSlotOrder(niche: Niche): GeneratedProjectImage["key"][] {
  switch (niche) {
    case "restaurant":
      return ["hero", "gallery1", "gallery2", "gallery3", "support", "detail1"];
    case "construction":
      return ["hero", "gallery1", "support", "gallery2", "gallery3", "detail1"];
    case "fitness":
      return ["hero", "support", "gallery1", "gallery2", "gallery3", "detail1"];
    case "saas":
    case "agency":
      return ["hero", "support", "detail1", "gallery1", "gallery2", "gallery3"];
    default:
      return ["hero", "gallery1", "gallery2", "gallery3", "support", "detail1"];
  }
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

async function resolveUploadedImages(
  uploadedUrls: string[],
  specs: { key: GeneratedProjectImage["key"]; path: string; prompt: string }[],
  niche: Niche
): Promise<Map<GeneratedProjectImage["key"], GeneratedProjectImage>> {
  const slotOrder = uploadedSlotOrder(niche);
  const result = new Map<GeneratedProjectImage["key"], GeneratedProjectImage>();

  const limit = Math.min(uploadedUrls.length, slotOrder.length);
  for (let i = 0; i < limit; i++) {
    const url = uploadedUrls[i];
    const slotKey = slotOrder[i];
    const spec = specs.find((s) => s.key === slotKey);
    if (!spec) continue;

    const dataUrl = await fetchAsDataUrl(url);
    if (!dataUrl) {
      console.warn(`[image-generation] uploaded-fetch-failed slot=${slotKey} url=${url.slice(0, 80)}`);
      continue;
    }

    console.log(`[image-generation] uploaded        slot=${slotKey} url=${url.slice(0, 60)}…`);
    result.set(slotKey, {
      key: slotKey,
      path: spec.path,
      prompt: spec.prompt,
      dataUrl,
      source: "uploaded",
    });
  }

  return result;
}

function stableIndex(seed: string, count: number): number {
  if (count <= 0) return 0;
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

function roleForSlot(
  key: GeneratedProjectImage["key"]
): PlannedProjectImage["assignedRole"] {
  if (key === "hero") return "hero";
  if (key === "support") return "support";
  if (key === "detail1") return "detail";
  return "gallery";
}

function curatedCandidatesForSlot(
  niche: Niche,
  key: GeneratedProjectImage["key"],
  brief?: string
): CuratedImage[] {
  const lowerBrief = brief?.toLowerCase() ?? "";
  const fallbackNiche =
    niche === "generic" &&
    /\b(hotel|resort|inn|lodge|suite|boutique stay|hospitality)\b/.test(lowerBrief)
      ? "realEstate"
      : niche === "generic" &&
          /\b(luxury|premium|editorial|beautiful|fancy)\b/.test(lowerBrief)
        ? "portfolio"
        : niche;
  const images = [
    ...getCuratedImages(fallbackNiche),
    ...(fallbackNiche === "realEstate" ? getCuratedImages("restaurant") : []),
  ];
  const byRole = (role: string) => images.filter((image) => image.role === role);

  switch (niche) {
    case "saas":
      if (key === "hero") return byRole("product-surface");
      if (key === "detail1") {
        return [...byRole("proof-portrait"), ...byRole("product-surface")];
      }
      return [...byRole("product-surface"), ...byRole("proof-portrait")];
    case "construction":
      if (key === "hero") return byRole("hero-focal");
      if (key === "support") return byRole("process-documentary");
      if (key === "detail1") {
        return [...byRole("team-portrait"), ...byRole("process-documentary")];
      }
      return [...byRole("project-showcase"), ...byRole("process-documentary")];
    case "restaurant":
      if (key === "hero") return byRole("hero-focal");
      if (key === "support") {
        return [...byRole("editorial-narrative"), ...byRole("team-portrait")];
      }
      if (key === "detail1") {
        return [...byRole("ambient-atmosphere"), ...byRole("editorial-narrative")];
      }
      return [...byRole("editorial-narrative"), ...byRole("ambient-atmosphere")];
    case "agency":
    case "portfolio":
      if (key === "hero") return byRole("hero-focal");
      if (key === "support") {
        return [...byRole("editorial-narrative"), ...byRole("team-portrait")];
      }
      if (key === "detail1") {
        return [...byRole("ambient-atmosphere"), ...byRole("editorial-narrative")];
      }
      return byRole("project-showcase");
    default:
      if (key === "hero") return byRole("hero-focal");
      if (key === "support") {
        return [...byRole("editorial-narrative"), ...byRole("team-portrait")];
      }
      if (key === "detail1") {
        return [...byRole("ambient-atmosphere"), ...byRole("team-portrait")];
      }
      return [...byRole("project-showcase"), ...byRole("ambient-atmosphere")];
  }
}

export function resolveProjectImagePlan(params: {
  brief: string;
  niche: Niche;
  family: DesignFamilyId;
  uploadedImageUrls?: string[];
}): ProjectImagePlan {
  const specs = buildGeneratedImageSpecs(
    params.brief,
    params.niche,
    params.family
  );
  const slotOrder = uploadedSlotOrder(params.niche);
  const usedLocalFiles = new Set<string>();

  const items = specs.map((spec) => {
    const uploadedIndex = params.uploadedImageUrls
      ? slotOrder.indexOf(spec.key)
      : -1;
    const uploadedUrl =
      uploadedIndex >= 0
        ? params.uploadedImageUrls?.[uploadedIndex]
        : undefined;

    if (uploadedUrl) {
      return {
        key: spec.key,
        path: spec.path,
        prompt: spec.prompt,
        source: "uploaded" as const,
        assignedRole: roleForSlot(spec.key),
        rationale:
          "Use the user-provided upload before any curated or generated fallback.",
        uploadedUrl,
      };
    }

    const local = findLocalImage(params.niche, spec.key, params.family);
    if (local && !(params.niche === "saas" && usedLocalFiles.has(local.fileName))) {
      usedLocalFiles.add(local.fileName);
      return {
        key: spec.key,
        path: spec.path,
        prompt: spec.prompt,
        source: "curated-local" as const,
        assignedRole: roleForSlot(spec.key),
        rationale: `Use curated local ${params.niche} imagery for this slot.`,
        localFileName: local.fileName,
        localFolder: local.folder,
      };
    }

    const externalCandidates = curatedCandidatesForSlot(
      params.niche,
      spec.key,
      params.brief
    );
    if (externalCandidates.length > 0) {
      const image =
        externalCandidates[
          stableIndex(
            `${params.niche}:${params.family}:${spec.key}:${params.brief}`,
            externalCandidates.length
          )
        ];
      return {
        key: spec.key,
        path: spec.path,
        prompt: spec.prompt,
        source: "approved-external" as const,
        assignedRole: roleForSlot(spec.key),
        rationale:
          "Use an approved external curated image before falling back to generation.",
        approvedExternalUrl: image.url,
        approvedExternalId: image.id,
        approvedExternalBrief: image.brief,
      };
    }

    return {
      key: spec.key,
      path: spec.path,
      prompt: spec.prompt,
      source: "generated" as const,
      assignedRole: roleForSlot(spec.key),
      rationale:
        "No uploaded, curated local, or approved external image matched this slot.",
    };
  });

  const primarySource =
    items.find((item) => item.source === "uploaded")?.source ??
    items.find((item) => item.source === "curated-local")?.source ??
    items.find((item) => item.source === "approved-external")?.source ??
    "generated";

  const missingRequired = REQUIRED_IMAGE_KEYS.filter(
    (key) => !items.some((item) => item.key === key)
  );
  if (missingRequired.length > 0) {
    throw new Error(
      `image plan missing required slots: ${missingRequired.join(", ")}`
    );
  }

  return { items, primarySource };
}

export function renderProjectImagePlan(plan: ProjectImagePlan): string {
  const lines = plan.items
    .map((item) => {
      const sourceDetail =
        item.source === "uploaded"
          ? `uploadedUrl=${item.uploadedUrl}`
          : item.source === "curated-local"
            ? `local=${item.localFolder}/${item.localFileName}`
            : item.source === "approved-external"
              ? `external=${item.approvedExternalId} (${item.approvedExternalBrief})`
              : "generate from prompt";

      return `- projectImages.${item.key} -> ${item.assignedRole} | source=${item.source} | ${sourceDetail}\n  ${item.rationale}`;
    })
    .join("\n");

  return `=== PRE-GENERATION IMAGE ORCHESTRATION PLAN (BINDING) ===

Resolve and respect this image plan before writing code. Do not treat imagery as a late slot fill.
The final site must bind its hero/support/gallery/detail surfaces to these exact image slots and source decisions.

PRIMARY IMAGE SOURCE FOR THIS RUN:
- ${plan.primarySource}

SLOT PLAN:
${lines}

IMAGE EXECUTION RULES:
- Hero must bind to projectImages.hero.
- Hero, support, gallery1, and gallery2 are mandatory ready-to-use surfaces before code generation begins.
- Supporting editorial/story/process media should bind to projectImages.support or projectImages.detail1.
- Showcase/gallery/proof bands should bind to the listed gallery slots, not generic empty placeholders.
- If a slot is marked approved-external or uploaded, preserve that exact source decision through finalize and repair.
- Do not replace a planned real image with a browser-window placeholder shell.

=== END PRE-GENERATION IMAGE ORCHESTRATION PLAN ===`;
}

const PER_IMAGE_TIMEOUT_MS = 45_000;
const TOTAL_IMAGE_TIMEOUT_MS = 240_000;
const MAX_IMAGE_RETRIES = 2;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function generateProjectImages(params: {
  brief: string;
  niche: Niche;
  family: DesignFamilyId;
  uploadedImageUrls?: string[];
  imagePlan?: ProjectImagePlan;
}): Promise<GeneratedProjectImage[]> {
  const specs = buildGeneratedImageSpecs(
    params.brief,
    params.niche,
    params.family
  );
  const imagePlan =
    params.imagePlan ??
    resolveProjectImagePlan({
      brief: params.brief,
      niche: params.niche,
      family: params.family,
      uploadedImageUrls: params.uploadedImageUrls,
    });
  const planByKey = new Map(imagePlan.items.map((item) => [item.key, item]));

  const colors = familyPlaceholderColors(params.family);

  const makePlaceholder = (spec: typeof specs[number]): GeneratedProjectImage => ({
    key: spec.key,
    path: spec.path,
    prompt: spec.prompt,
    dataUrl: scenePlaceholder(
      params.niche,
      spec.key,
      params.family,
      colors.accent,
      colors.background
    ),
    source: "placeholder" as const,
  });

  // ── Tier 0: User-uploaded images (highest priority) ──────────
  const uploadedMap = params.uploadedImageUrls?.length
    ? await resolveUploadedImages(params.uploadedImageUrls, specs, params.niche)
    : new Map<GeneratedProjectImage["key"], GeneratedProjectImage>();

  if (uploadedMap.size > 0) {
    console.log(`[image-generation] uploaded ${uploadedMap.size}/${specs.length} slots from user uploads`);
  }

  // ── Tier 1: Local curated image library ──────────────────────
  const resolveFromLocal = (
    spec: (typeof specs)[number]
  ): GeneratedProjectImage | null => {
    const match = findLocalImage(params.niche, spec.key, params.family);
    if (!match) return null;

    console.log(
      `[image-generation] local-curated  niche=${params.niche} slot=${spec.key} file=${match.fileName}`
    );
    return {
      key: spec.key,
      path: spec.path,
      prompt: spec.prompt,
      dataUrl: match.dataUrl,
      source: "curated" as const,
    };
  };

  const resolveFromApprovedExternal = async (
    spec: (typeof specs)[number]
  ): Promise<GeneratedProjectImage | null> => {
    const planItem = planByKey.get(spec.key);
    if (
      !planItem ||
      planItem.source !== "approved-external" ||
      !planItem.approvedExternalUrl
    ) {
      return null;
    }

    const dataUrl = await fetchAsDataUrl(planItem.approvedExternalUrl);
    if (!dataUrl) {
      return null;
    }

    console.log(
      `[image-generation] approved-external slot=${spec.key} id=${planItem.approvedExternalId ?? "unknown"}`
    );

    return {
      key: spec.key,
      path: spec.path,
      prompt: spec.prompt,
      dataUrl,
      source: "curated" as const,
    };
  };

  // When OpenAI is disabled: uploaded → local curated → placeholder
  if (OPENAI_DISABLED) {
    const results: GeneratedProjectImage[] = [];
    for (const spec of specs) {
      const uploaded = uploadedMap.get(spec.key);
      if (uploaded) {
        results.push(uploaded);
        continue;
      }

      const local = resolveFromLocal(spec);
      if (local) {
        results.push(local);
        continue;
      }

      const external = await resolveFromApprovedExternal(spec);
      if (external) {
        results.push(external);
        continue;
      }

      console.log(
        `[image-generation] placeholder    niche=${params.niche} slot=${spec.key} (plan=${planByKey.get(spec.key)?.source ?? "generated"})`
      );
      results.push(makePlaceholder(spec));
    }

    const uploadedCount = results.filter((r) => r.source === "uploaded").length;
    const curatedCount = results.filter((r) => r.source === "curated").length;
    const placeholderCount = results.filter(
      (r) => r.source === "placeholder"
    ).length;
    console.log(
      `[image-generation] OpenAI disabled — ${uploadedCount} uploaded, ${curatedCount} curated, ${placeholderCount} placeholder`
    );
    return results;
  }

  // ── Tier 2: OpenAI generation (when enabled) ──────────────────
  const model = getImageModel("gpt-image-1");

  const generateOne = async (spec: (typeof specs)[number]): Promise<GeneratedProjectImage> => {
    // Tier 0: user upload
    const uploaded = uploadedMap.get(spec.key);
    if (uploaded) return uploaded;

    // Tier 1: local curated
    const local = resolveFromLocal(spec);
    if (local) return local;

    // Tier 2: approved external curated fetch
    const external = await resolveFromApprovedExternal(spec);
    if (external) return external;

    // Tier 3: OpenAI generation
    for (let attempt = 0; attempt <= MAX_IMAGE_RETRIES; attempt += 1) {
      try {
        const result = await withTimeout(
          generateImage({
            model,
            prompt: spec.prompt,
            size: sizeForAspectRatio(spec.aspectRatio),
            providerOptions: {
              openai: {
                quality: "high",
              },
            },
          }),
          PER_IMAGE_TIMEOUT_MS,
          `image:${spec.key}:attempt:${attempt + 1}`
        );

        const file = result.image;
        return {
          key: spec.key,
          path: spec.path,
          prompt: spec.prompt,
          dataUrl: `data:${file.mediaType};base64,${file.base64}`,
          source: "generated" as const,
        };
      } catch (error) {
        if (attempt === MAX_IMAGE_RETRIES) {
          console.warn("[image-generation] fallback-placeholder", {
            key: spec.key,
            path: spec.path,
            error: error instanceof Error ? error.message : String(error),
          });
          return makePlaceholder(spec);
        }
      }
    }
    return makePlaceholder(spec);
  };

  try {
    return await withTimeout(
      Promise.all(specs.map(generateOne)),
      TOTAL_IMAGE_TIMEOUT_MS,
      "image-generation-batch"
    );
  } catch {
    return specs.map(makePlaceholder);
  }
}

export function buildGeneratedImagesModule(
  images: GeneratedProjectImage[]
): string {
  const lines = images.map(
    (image) =>
      `  ${image.key}: \`${escapeTemplateLiteral(image.dataUrl)}\`,`
  );

  return `export const projectImages = {
${lines.join("\n")}
} as const;

export type ProjectImageKey = keyof typeof projectImages;

export default projectImages;`;
}
