/**
 * Local curated image library — reads pre-validated images from
 * public/image-libary/{niche}/{category}/ and maps them to
 * generated-image slots (hero, support, gallery1-3, detail1).
 *
 * Selection is deterministic: for a given niche + slot + family,
 * the same image is always returned so previews stay stable.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";
import type { DesignFamilyId } from "./design-families";
import type { Niche } from "./niche-router";

type ImageSlotKey =
  | "hero"
  | "support"
  | "gallery1"
  | "gallery2"
  | "gallery3"
  | "detail1";

// ─────────────────────────────────────────────
// Path resolution
// ─────────────────────────────────────────────

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Resolve the absolute path to the local image library root.
 * Works in both dev (process.cwd()) and build contexts.
 */
function libraryRoot(): string {
  return join(process.cwd(), "public", "image-libary");
}

/**
 * Map Niche enum values to their actual folder names on disk.
 * The folders were named by hand and don't always match the enum.
 */
function nicheFolderName(niche: Niche): string | null {
  switch (niche) {
    case "construction":
      return "construction-renovation";
    case "restaurant":
      return "restaurant";
    case "saas":
      return "saas";
    case "beauty":
      return "beauty";
    case "fitness":
      return "gym";
    case "law":
      return "law";
    default:
      return null;
  }
}

// ─────────────────────────────────────────────
// Slot → subfolder mapping
// ─────────────────────────────────────────────

/**
 * Each image slot maps to one or more subfolder names that could
 * satisfy it, in priority order. The mapping is per-niche because
 * the subfolder naming varies across niches.
 */
function slotCandidateFolders(
  niche: Niche,
  slot: ImageSlotKey
): string[] {
  switch (niche) {
    case "construction":
      switch (slot) {
        case "hero":
          return ["hero"];
        case "support":
          return ["workers", "projects"];
        case "gallery1":
        case "gallery2":
        case "gallery3":
          return ["projects", "hero"];
        case "detail1":
          return ["workers", "projects"];
      }
      break;

    case "restaurant":
      switch (slot) {
        case "hero":
          return ["hero-luxury", "hero-regular", "hero-container style"];
        case "support":
          return ["people", "worker"];
        case "gallery1":
        case "gallery2":
        case "gallery3":
          return ["food", "hero-regular", "hero-luxury"];
        case "detail1":
          return ["food", "people"];
      }
      break;

    case "saas":
      switch (slot) {
        case "hero":
          return ["hero", "ui/product"];
        case "support":
          return ["ui/product", "gardient"];
        case "gallery1":
        case "gallery2":
        case "gallery3":
          return ["ui/product", "special section", "gardient"];
        case "detail1":
          return ["ui/product", "gardient"];
      }
      break;

    default:
      // Generic fallback — try common folder names
      switch (slot) {
        case "hero":
          return ["hero"];
        case "support":
          return ["people", "team", "workers"];
        case "gallery1":
        case "gallery2":
        case "gallery3":
          return ["projects", "gallery", "work"];
        case "detail1":
          return ["detail", "projects"];
      }
  }

  return [];
}

// ─────────────────────────────────────────────
// File listing (cached per process)
// ─────────────────────────────────────────────

const folderCache = new Map<string, string[]>();

function listImageFiles(folderPath: string): string[] {
  const cached = folderCache.get(folderPath);
  if (cached !== undefined) return cached;

  if (!existsSync(folderPath)) {
    folderCache.set(folderPath, []);
    return [];
  }

  try {
    const files = readdirSync(folderPath)
      .filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()))
      .sort(); // sorted for deterministic indexing
    folderCache.set(folderPath, files);
    return files;
  } catch {
    folderCache.set(folderPath, []);
    return [];
  }
}

// ─────────────────────────────────────────────
// Deterministic selection
// ─────────────────────────────────────────────

/**
 * Stable hash to pick an index without randomness.
 * Each unique (slot, family, folder) combination should produce a
 * different index to maximise image diversity across slots.
 */
function stableIndex(
  slot: ImageSlotKey,
  family: DesignFamilyId,
  folder: string,
  fileCount: number
): number {
  if (fileCount <= 0) return 0;

  // djb2 hash — stable and well-distributed for short strings
  const seed = `${slot}:${family}:${folder}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % fileCount;
}

// ─────────────────────────────────────────────
// Style bias (optional, lightweight)
// ─────────────────────────────────────────────

/**
 * For restaurant, the editorial_luxury family prefers hero-luxury
 * subfolder over hero-regular. This is the only style bias in Phase 1 —
 * kept minimal and explicit.
 */
function applyStyleBias(
  folders: string[],
  niche: Niche,
  slot: ImageSlotKey,
  family: DesignFamilyId
): string[] {
  if (niche === "restaurant" && slot === "hero") {
    if (family === "editorial_luxury" || family === "warm_artisan") {
      // Prefer luxury hero shots for premium families
      const luxIdx = folders.indexOf("hero-luxury");
      if (luxIdx > 0) {
        const reordered = [...folders];
        reordered.splice(luxIdx, 1);
        reordered.unshift("hero-luxury");
        return reordered;
      }
    }
  }
  return folders;
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export type LocalImageMatch = {
  filePath: string;
  dataUrl: string;
  folder: string;
  fileName: string;
};

/**
 * Try to find a local curated image for the given niche + slot + family.
 * Returns null if no suitable image exists on disk.
 */
export function findLocalImage(
  niche: Niche,
  slot: ImageSlotKey,
  family: DesignFamilyId
): LocalImageMatch | null {
  const nicheFolder = nicheFolderName(niche);
  if (!nicheFolder) return null;

  const root = libraryRoot();
  const nicheDir = join(root, nicheFolder);
  if (!existsSync(nicheDir)) return null;

  let candidateFolders = slotCandidateFolders(niche, slot);
  candidateFolders = applyStyleBias(candidateFolders, niche, slot, family);

  for (const folder of candidateFolders) {
    const folderPath = join(nicheDir, folder);
    const files = listImageFiles(folderPath);
    if (files.length === 0) continue;

    const idx = stableIndex(slot, family, folder, files.length);
    const fileName = files[idx];
    const filePath = join(folderPath, fileName);

    try {
      const buffer = readFileSync(filePath);
      const ext = extname(fileName).toLowerCase();
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : "image/jpeg";
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

      return { filePath, dataUrl, folder, fileName };
    } catch {
      // File read failed — try next folder
      continue;
    }
  }

  return null;
}

/**
 * Check which niches have at least one usable local image.
 * Useful for diagnostics / logging.
 */
export function auditLocalLibrary(): Record<string, number> {
  const root = libraryRoot();
  const result: Record<string, number> = {};

  const niches: Niche[] = [
    "construction",
    "restaurant",
    "saas",
    "agency",
    "portfolio",
    "realEstate",
    "law",
    "fitness",
    "beauty",
    "generic",
  ];

  for (const niche of niches) {
    const folder = nicheFolderName(niche);
    if (!folder) {
      result[niche] = 0;
      continue;
    }
    const nicheDir = join(root, folder);
    if (!existsSync(nicheDir)) {
      result[niche] = 0;
      continue;
    }
    let count = 0;
    const scan = (dir: string) => {
      try {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory()) {
            scan(join(dir, entry.name));
          } else if (IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
            count++;
          }
        }
      } catch {
        // skip unreadable dirs
      }
    };
    scan(nicheDir);
    result[niche] = count;
  }

  return result;
}
