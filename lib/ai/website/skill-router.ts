/**
 * Style skill router — selects exactly one Markdown style skill per request.
 *
 * Reads .agents/skills/styles/<name>/SKILL.md frontmatter at startup, then
 * scores each style against the brief + detected niche to pick one.
 * Returns the selected skill's id, path, and full Markdown content.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import type { Niche } from "./niche-router";

export type StyleSkillMeta = {
  id: string;
  name: string;
  keywords: string[];
  nicheAffinity: string[];
  description: string;
  path: string;
};

export type DirectionKey = "A" | "B" | "C" | "D";

export type SelectedStyleSkill = {
  meta: StyleSkillMeta;
  content: string;
  paletteDirection: DirectionKey;
  paletteLabel: string;
  palettePrimaryCss: string;
  heroVariant: 1 | 2;
  pageArchetypeName: string;
  pageArchetypeDesc: string;
  pageArchetypeOpeningSection: string;
  choreographyEmphasis: "proof-first" | "story-first";
  choreographyEmphasisDesc: string;
};

// ---------------------------------------------------------------------------
// Frontmatter parsing (minimal YAML subset — no dependency needed)
// ---------------------------------------------------------------------------

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const block = match[1];
  const result: Record<string, unknown> = {};

  for (const line of block.split("\n")) {
    const kv = line.match(/^(\w[\w_]*)\s*:\s*(.+)$/);
    if (!kv) continue;
    const [, key, rawVal] = kv;
    const val = rawVal.trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      result[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else {
      result[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Index building (runs once at module load)
// ---------------------------------------------------------------------------

function buildStyleIndex(): StyleSkillMeta[] {
  const stylesDir = path.join(process.cwd(), ".agents", "skills", "styles");
  if (!existsSync(stylesDir)) return [];

  const entries: StyleSkillMeta[] = [];

  for (const dir of readdirSync(stylesDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const skillPath = path.join(stylesDir, dir.name, "SKILL.md");
    if (!existsSync(skillPath)) continue;

    try {
      const raw = readFileSync(skillPath, "utf8");
      const fm = parseFrontmatter(raw);
      if (!fm.id || !fm.name) continue;

      entries.push({
        id: fm.id as string,
        name: fm.name as string,
        keywords: (fm.keywords as string[]) ?? [],
        nicheAffinity: ((fm.niche_affinity ?? fm.nicheAffinity) as string[]) ?? [],
        description: (fm.description as string) ?? "",
        path: skillPath,
      });
    } catch {
      // Skip unreadable skill files
    }
  }

  return entries;
}

const styleIndex = buildStyleIndex();

// ---------------------------------------------------------------------------
// Palette direction + hero variant pre-selection
// ---------------------------------------------------------------------------

type PaletteDirectionSpec = {
  label: string;
  primaryCss: string;
  keywords: string[];
};

// Per-style, per-direction specs: label shown in binding block, primary HSL
// override, and keywords that strongly suggest this direction.
const PALETTE_SPECS: Record<string, Record<DirectionKey, PaletteDirectionSpec>> = {
  bold_commercial: {
    A: { label: "Amber & Charcoal",           primaryCss: "--primary: 28 94% 57%", keywords: ["construction", "contractor", "roofing", "plumbing", "hvac", "trades", "industrial", "building", "concrete", "paving"] },
    B: { label: "Electric Red & Dark Steel",   primaryCss: "--primary: 4 90% 58%",  keywords: ["fitness", "gym", "strength", "athletic", "training", "sport", "crossfit", "boxing", "workout"] },
    C: { label: "Neon Lime & Black",           primaryCss: "--primary: 82 85% 48%", keywords: ["tech", "fleet", "logistics", "electric", "solar", "trucking", "dispatch", "clean energy"] },
    D: { label: "Hot Orange & Navy",           primaryCss: "--primary: 16 92% 56%", keywords: ["excavation", "demolition", "manufacturing", "commercial", "heavy equipment", "crane"] },
  },
  editorial_luxury: {
    A: { label: "Brass & Graphite",            primaryCss: "--primary: 37 54% 63%", keywords: ["restaurant", "dining", "culinary", "bistro", "chef", "cuisine", "tasting", "supper", "menu"] },
    B: { label: "Copper & Midnight",           primaryCss: "--primary: 20 65% 52%", keywords: ["luxury", "exclusive", "bespoke", "premium", "estate", "private", "michelin", "members", "club"] },
    C: { label: "Champagne & Charcoal",        primaryCss: "--primary: 42 38% 72%", keywords: ["fashion", "gallery", "art", "portfolio", "jewelry", "couture", "editorial", "atelier", "studio"] },
    D: { label: "Warm Gold & Deep Wine",       primaryCss: "--primary: 35 68% 55%", keywords: ["wine", "bar", "cocktail", "lounge", "intimate", "whiskey", "tasting room", "speakeasy"] },
  },
  modern_minimal: {
    A: { label: "Cool Blue",                   primaryCss: "--primary: 224 76% 54%", keywords: ["saas", "software", "platform", "app", "product", "dashboard", "api", "cloud", "b2b"] },
    B: { label: "Deep Indigo",                 primaryCss: "--primary: 243 75% 59%", keywords: ["ai", "automation", "creative", "smart", "intelligence", "agency", "studio", "brand", "machine"] },
    C: { label: "Teal Focus",                  primaryCss: "--primary: 172 66% 40%", keywords: ["health", "wellness", "productivity", "focus", "growth", "sustainable", "green", "clean"] },
    D: { label: "Violet Edge",                 primaryCss: "--primary: 262 83% 58%", keywords: ["design", "developer", "tool", "maker", "visual", "workflow", "builder", "no-code"] },
  },
  warm_artisan: {
    A: { label: "Terracotta & Cream",          primaryCss: "--primary: 21 58% 42%", keywords: ["restaurant", "cafe", "bakery", "bistro", "artisan", "kitchen", "food", "brunch", "coffee"] },
    B: { label: "Sage & Linen",                primaryCss: "--primary: 140 22% 42%", keywords: ["wellness", "spa", "yoga", "holistic", "retreat", "healing", "meditation", "calm", "reiki"] },
    C: { label: "Clay & Oat",                  primaryCss: "--primary: 28 45% 38%",  keywords: ["pottery", "craft", "workshop", "maker", "ceramic", "handmade", "studio", "earthy", "clay"] },
    D: { label: "Rust & Ivory",                primaryCss: "--primary: 14 62% 44%",  keywords: ["vintage", "boutique", "bloom", "floral", "garden", "organic", "farm", "harvest", "florist"] },
  },
};

function selectPaletteDirection(
  styleId: string,
  brief: string,
  briefHash: number,
): { direction: DirectionKey; label: string; primaryCss: string } {
  const specs = PALETTE_SPECS[styleId];
  const directions: DirectionKey[] = ["A", "B", "C", "D"];
  if (!specs) return { direction: "A", label: "Default", primaryCss: "" };

  const lower = brief.toLowerCase();

  // Score each direction by brief keyword matches
  let topScore = 0;
  let secondScore = -1;
  let topDir: DirectionKey = "A";

  for (const dir of directions) {
    const score = specs[dir].keywords.filter((kw) => lower.includes(kw)).length;
    if (score > topScore) {
      secondScore = topScore;
      topScore = score;
      topDir = dir;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  // Exclusive keyword match — use the winning direction
  if (topScore > 0 && topScore > secondScore) {
    return { direction: topDir, label: specs[topDir].label, primaryCss: specs[topDir].primaryCss };
  }

  // No clear winner — use brief hash to ensure variety across similar briefs.
  // Hash domain differs from style selection hash to avoid correlation.
  const dir = directions[briefHash % 4];
  return { direction: dir, label: specs[dir].label, primaryCss: specs[dir].primaryCss };
}

// Uses a separate hash domain from style + palette so hero choices rotate
// independently across generations with similar briefs.
function selectHeroVariant(niche: string, brief: string): 1 | 2 {
  return hashBrief(`hv:${niche}:${brief}`) % 2 === 0 ? 1 : 2;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreStyle(brief: string, meta: StyleSkillMeta, niche: string): number {
  const lower = brief.toLowerCase();
  let score = 0;

  for (const kw of meta.keywords) {
    if (lower.includes(kw.toLowerCase())) score += 2;
  }

  if (meta.nicheAffinity.includes(niche)) score += 3;

  return score;
}

function hashBrief(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

// ---------------------------------------------------------------------------
// Page archetype + choreography pre-selection
// ---------------------------------------------------------------------------

type PageArchetypeSpec = {
  name: string;
  desc: string;
  openingSection: string;
};

// Whole-page skeleton options per style (3 options → hash % 3 spreads better than % 2).
// openingSection = the first body section type (what comes right after Hero).
const PAGE_ARCHETYPES: Record<string, PageArchetypeSpec[]> = {
  bold_commercial: [
    {
      name: "proof-wall",
      desc: "Lead with overwhelming social proof — project count, safety record, or client logos — before any feature or service list. Conviction before explanation.",
      openingSection: "stats-band or credential gallery",
    },
    {
      name: "sales-funnel",
      desc: "Lead with the core service offer and differentiator, then build trust through a step-by-step process section. Explanation before proof.",
      openingSection: "split service pitch",
    },
    {
      name: "authority-showcase",
      desc: "Open with a single signature completed project as a full-bleed proof showcase — before any service list or stats rail. Let the work speak. Demonstrated craft before explanation.",
      openingSection: "featured project or before/after gallery",
    },
  ],
  editorial_luxury: [
    {
      name: "venue-narrative",
      desc: "Open with an immersive sense-of-place section — atmosphere, provenance, or the founding story — before presenting the menu or offer. Story before product.",
      openingSection: "editorial split narrative",
    },
    {
      name: "editorial-showcase",
      desc: "Open directly with the signature offer (signature dish, flagship product, or hero service) in high visual detail. Product before story.",
      openingSection: "editorial-list or gallery showcase",
    },
    {
      name: "press-first",
      desc: "Open with a single dominant press credential or critic quote that frames the entire brand proposition. External authority before self-description.",
      openingSection: "editorial press quote band",
    },
  ],
  modern_minimal: [
    {
      name: "product-led",
      desc: "Open with a product surface or dashboard view — concrete, functional, zero ambiguity about what the product does. Feature before positioning.",
      openingSection: "split with product UI",
    },
    {
      name: "manifesto-first",
      desc: "Open with a problem-framing or philosophy statement — why this exists — before showing product features. Positioning before feature.",
      openingSection: "manifesto or centered-stack",
    },
    {
      name: "social-proof-led",
      desc: "Open with a metrics band or logo-wall proof strip — concrete numbers (uptime, customers, integrations) before any feature description. Evidence before explanation.",
      openingSection: "metrics band or logo-proof strip",
    },
  ],
  warm_artisan: [
    {
      name: "maker-story",
      desc: "Open with the founder or origin story — who makes this, where it comes from, the hands behind it. Humanity before product.",
      openingSection: "split story with photo",
    },
    {
      name: "process-showcase",
      desc: "Open with the craft process — steps, materials, techniques — establishing quality through method. Process before product.",
      openingSection: "timeline or editorial-list process",
    },
    {
      name: "sensory-moment",
      desc: "Open with a full-bleed atmospheric image moment and a single evocative caption — no service list, no feature bullets. Establish mood and sensory identity before explaining anything.",
      openingSection: "full-bleed atmospheric image with caption pull-quote",
    },
  ],
};

type ChoreographySpec = {
  emphasis: "proof-first" | "story-first";
  desc: string;
};

const CHOREOGRAPHY_SPECS: ChoreographySpec[] = [
  {
    emphasis: "proof-first",
    desc: "Lead every section with evidence: stat, credential, client name, or outcome. Reserve narrative for second position within sections. Trust before explanation.",
  },
  {
    emphasis: "story-first",
    desc: "Lead every section with context and narrative arc. Proof (stats, credentials) appears after the story lands. Understanding before evidence.",
  },
];

function selectPageArchetype(
  styleId: string,
  niche: string,
  brief: string,
): PageArchetypeSpec {
  const options = PAGE_ARCHETYPES[styleId];
  if (!options) return { name: "default", desc: "Standard page flow.", openingSection: "split" };
  // Own hash domain — decouples archetype from palette direction fallback so
  // briefs that share a niche don't all cluster on the same archetype index.
  const archetypeHash = hashBrief(`arch:${niche}:${brief}`);
  return options[archetypeHash % options.length];
}

function selectChoreographyEmphasis(briefHash: number): ChoreographySpec {
  // Use yet another hash domain: offset by large prime to avoid correlation
  return CHOREOGRAPHY_SPECS[(briefHash >> 3) % 2];
}

// ---------------------------------------------------------------------------
// Core contract loader
// ---------------------------------------------------------------------------

function loadCoreContract(): string {
  const corePath = path.join(process.cwd(), ".agents", "skills", "core", "SKILL.md");
  try {
    return readFileSync(corePath, "utf8");
  } catch {
    return "";
  }
}

const coreContract = loadCoreContract();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Select exactly one style skill based on the brief and detected niche.
 * Returns the skill metadata (id, path) for logging, plus the full content.
 */
export function selectStyleSkill(
  brief: string,
  niche: Niche
): SelectedStyleSkill | null {
  if (styleIndex.length === 0) return null;

  const scored = styleIndex
    .map((meta) => ({ meta, score: scoreStyle(brief, meta, niche) }))
    .sort((a, b) => b.score - a.score);

  // If the top score is strictly higher than the second, pick it.
  // Otherwise fall back to deterministic hash.
  let selected: StyleSkillMeta;
  if (scored.length === 1 || scored[0].score > scored[1].score) {
    selected = scored[0].meta;
  } else {
    const idx = hashBrief(`${niche}:${brief}`) % styleIndex.length;
    selected = styleIndex[idx];
  }

  try {
    const content = readFileSync(selected.path, "utf8");
    const briefHash = hashBrief(`${niche}:${brief}`);
    const palette = selectPaletteDirection(selected.id, brief, briefHash);
    const heroVariant = selectHeroVariant(niche, brief);
    const archetype = selectPageArchetype(selected.id, niche, brief);
    const choreography = selectChoreographyEmphasis(briefHash);
    console.log(
      `[skill-router] Selected style skill: ${selected.id} (${selected.name}) | Palette: ${palette.direction} (${palette.label}) | Hero: Option ${heroVariant} | Archetype: ${archetype.name} | Choreography: ${choreography.emphasis}`
    );
    return {
      meta: selected,
      content,
      paletteDirection: palette.direction,
      paletteLabel: palette.label,
      palettePrimaryCss: palette.primaryCss,
      heroVariant,
      pageArchetypeName: archetype.name,
      pageArchetypeDesc: archetype.desc,
      pageArchetypeOpeningSection: archetype.openingSection,
      choreographyEmphasis: choreography.emphasis,
      choreographyEmphasisDesc: choreography.desc,
    };
  } catch {
    console.warn(
      `[skill-router] Failed to read selected style skill: ${selected.path}`
    );
    return null;
  }
}

/**
 * Returns the core contract skill content. Always loaded, regardless of
 * which style skill is selected.
 */
export function getCoreContract(): string {
  return coreContract;
}

/**
 * Returns all registered style skill IDs (for debugging / logging).
 */
export function getRegisteredStyles(): string[] {
  return styleIndex.map((s) => s.id);
}
