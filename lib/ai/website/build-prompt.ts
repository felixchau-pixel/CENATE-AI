/**
 * Niche-aware website prompt builder — composes the layered control stack.
 *
 * Layer order (most specific wins):
 *   1. Priority directives (binding overrides)
 *   2. Starter base (structural scaffold — component list + composition instructions)
 *   3. Niche profile (choreography, pattern vocab, motion, layout recipes)
 *   4. Curated image library + asset plan + image-role rules
 *   5. Impeccable frontend taste layer (visual composition quality bar)
 *   6. Site-type composition modes (hard contracts for restaurant/saas/portfolio)
 *   7. Cenate Design System Skill (TypeUI-backed baseline)
 *   8. Planning + output format + per-section rules + quality bar + choreography bar
 */

import { detectNiche, NICHE_LABELS, type Niche } from "./niche-router";
import { getNicheProfile, type NicheProfile } from "./niche-profiles";
import { IMPECCABLE_TASTE_LAYER } from "./taste-layer";
import {
  renderDesignFamilyPrompt,
  renderGeneratedImagePrompt,
  renderVariantPlanPrompt,
  renderSectionArchetypesPrompt,
  renderSectionBlueprintsPrompt,
  selectDesignFamily,
  type DesignFamilyId,
  type WebsiteVariantPlan,
} from "./design-families";
import { getVariantStarterBase, renderStarterBase } from "./starter-bases";
import { renderDesignIntelligencePrompt } from "./design-intelligence";

/**
 * Render a niche profile as a prompt-ready block including layout recipes
 * and image-role rules.
 */
function renderNicheProfile(niche: Niche): string {
  const p = getNicheProfile(niche);
  const choreography = p.choreography.map((s, i) => `  ${i + 1}. ${s}`).join("\n");
  const heroPatterns = p.patternVocabulary.hero.map((x) => `  - ${x}`).join("\n");
  const showcasePatterns = p.patternVocabulary.showcase.map((x) => `  - ${x}`).join("\n");
  const proofPatterns = p.patternVocabulary.proof.map((x) => `  - ${x}`).join("\n");
  const ctaPatterns = p.patternVocabulary.cta.map((x) => `  - ${x}`).join("\n");
  const footerPatterns = p.patternVocabulary.footer.map((x) => `  - ${x}`).join("\n");
  const banned = p.bannedLayouts.map((x) => `  - ${x}`).join("\n");
  const palettes = p.palettes.map((x) => `  - ${x}`).join("\n");

  return `=== NICHE PROFILE: ${p.label.toUpperCase()} (HARD CONTRACT) ===

This profile is the most specific layer of the control stack. It overrides the Impeccable taste layer, the design-system skill, and the site-type composition modes when they conflict. It is not advisory.

Tone: ${p.tone}

Typography pairing:
  Display: ${p.typography.display}
  Body:    ${p.typography.body}

Palette options (pick one and apply consistently):
${palettes}

REQUIRED CHOREOGRAPHY (use this exact section sequence unless the brief explicitly demands a different one):
${choreography}

CTA STYLE: ${p.ctaStyle}
FOOTER STYLE: ${p.footerStyle}
PROOF STYLE: ${p.proofStyle}

PATTERN VOCABULARY (pick from these shapes per slot — do not invent generic alternatives):
Hero patterns:
${heroPatterns}
Showcase patterns:
${showcasePatterns}
Proof patterns:
${proofPatterns}
CTA patterns:
${ctaPatterns}
Footer patterns:
${footerPatterns}

BANNED LAYOUTS (do NOT emit these — the critic will reject them):
${banned}

MOTION PROFILE (intensity: ${p.motion.intensity}):
- Hero entrance: ${p.motion.heroEntrance}
- Section reveal: ${p.motion.sectionReveal}
- Interaction hover: ${p.motion.interactionHover}
- Guidance: ${p.motion.guidance}

${renderLayoutRecipes(p)}

${renderImageRoles(p)}
`;
}

function renderLayoutRecipes(p: NicheProfile): string {
  if (!p.layoutRecipes.length) return "";
  const recipes = p.layoutRecipes.map((r, i) => {
    const sections = r.sections.map((s) => `    ${s}`).join("\n");
    return `  Recipe ${i + 1}: "${r.name}"
  ${r.description}
  Sections:
${sections}`;
  }).join("\n\n");

  return `LAYOUT RECIPES (pick ONE as your structural starting point — these are not suggestions, they are the default page compositions for this niche):

${recipes}

Pick the recipe that best fits the brief. Follow its section-by-section structure as your composition scaffold. You may adapt details, but the structural skeleton (composition modes, alignment patterns, surface shifts, image placements) must match the recipe. Do NOT fall back to a generic template.`;
}

function renderImageRoles(p: NicheProfile): string {
  if (!p.imageRoles.length) return "";
  const roles = p.imageRoles.map((r) =>
    `  - ${r.sectionHint} [${r.role}]: ${r.compositionRule}\n    Fallback: ${r.fallbackBehavior}`
  ).join("\n");

  return `IMAGE-ROLE RULES (every image must have a structural role — no decorative filler):

${roles}

HARD IMAGE RULES:
- Every <img> must serve one of these roles. An image with no composition role is decorative filler and must be removed or replaced.
- If an image is broken, missing, or mismatched to the niche, use the fallback behavior — do NOT leave a visible broken image block.
- No image should be interchangeable — if you could swap it for any other photo without affecting the section's meaning, it has no role.
- For image-led niches (restaurant, portfolio, real estate, beauty), images must persist across at least FOUR sections. Dropping to text-only after the hero is a composition failure.`;
}

// ─── Layout Slot Assignment ─────────────────────────────────────
// Pre-assigns a distinct layout type to each section slot, ensuring
// no two adjacent sections share a layout and diversity is guaranteed.

type LayoutType =
  | "split"
  | "split-reversed"
  | "grid"
  | "centered-stack"
  | "timeline"
  | "stats-band"
  | "gallery"
  | "quote-band"
  | "editorial-list"
  | "manifesto";

const NICHE_LAYOUT_POOLS: Record<Niche, LayoutType[][]> = {
  restaurant: [
    ["split", "editorial-list", "gallery", "quote-band", "split-reversed"],
    ["split-reversed", "gallery", "editorial-list", "split", "quote-band"],
    ["centered-stack", "editorial-list", "split", "gallery", "stats-band"],
  ],
  saas: [
    ["split", "grid", "stats-band", "quote-band", "split-reversed"],
    ["split-reversed", "manifesto", "grid", "split", "quote-band"],
    ["centered-stack", "split", "stats-band", "grid", "manifesto"],
  ],
  construction: [
    ["split", "grid", "timeline", "stats-band", "gallery"],
    ["split-reversed", "stats-band", "grid", "split", "timeline"],
    ["centered-stack", "split", "gallery", "grid", "stats-band"],
  ],
  agency: [
    ["split", "grid", "quote-band", "gallery", "manifesto"],
    ["split-reversed", "manifesto", "grid", "split", "quote-band"],
    ["centered-stack", "gallery", "split", "grid", "quote-band"],
  ],
  portfolio: [
    ["split", "gallery", "manifesto", "quote-band", "split-reversed"],
    ["centered-stack", "gallery", "split", "manifesto", "quote-band"],
    ["split-reversed", "manifesto", "gallery", "split", "quote-band"],
  ],
  realEstate: [
    ["split", "grid", "gallery", "stats-band", "split-reversed"],
    ["split-reversed", "gallery", "grid", "split", "stats-band"],
    ["centered-stack", "split", "gallery", "grid", "quote-band"],
  ],
  law: [
    ["split", "timeline", "quote-band", "grid", "stats-band"],
    ["centered-stack", "split", "quote-band", "grid", "timeline"],
    ["split-reversed", "stats-band", "split", "quote-band", "timeline"],
  ],
  fitness: [
    ["split", "grid", "stats-band", "gallery", "timeline"],
    ["split-reversed", "stats-band", "grid", "split", "gallery"],
    ["centered-stack", "split", "gallery", "grid", "stats-band"],
  ],
  beauty: [
    ["split", "gallery", "editorial-list", "quote-band", "split-reversed"],
    ["split-reversed", "gallery", "split", "editorial-list", "quote-band"],
    ["centered-stack", "split", "gallery", "editorial-list", "quote-band"],
  ],
  generic: [
    ["split", "grid", "quote-band", "stats-band", "split-reversed"],
    ["split-reversed", "manifesto", "grid", "split", "quote-band"],
    ["centered-stack", "split", "grid", "quote-band", "stats-band"],
  ],
};

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

function selectLayoutSequence(niche: Niche, brief: string, pageArchetypeName?: string | null): LayoutType[] {
  const pool = NICHE_LAYOUT_POOLS[niche] ?? NICHE_LAYOUT_POOLS.generic;
  const defaultIdx = hashString(`${niche}:${brief}`) % pool.length;

  if (pageArchetypeName) {
    const wantsStatsBandFirst = ["proof-wall", "social-proof-led"].includes(pageArchetypeName);
    const wantsGalleryFirst = ["authority-showcase", "sensory-moment", "editorial-showcase"].includes(pageArchetypeName);

    const findPoolWithEarliestType = (type: LayoutType): number => {
      let bestIdx = -1;
      let bestPos = Infinity;
      for (let i = 0; i < pool.length; i++) {
        const pos = pool[i].indexOf(type);
        if (pos >= 0 && pos < bestPos) { bestPos = pos; bestIdx = i; }
      }
      return bestIdx;
    };

    if (wantsStatsBandFirst) {
      const exact = pool.findIndex(p => p[0] === "stats-band");
      if (exact >= 0) return pool[exact];
      const earliest = findPoolWithEarliestType("stats-band");
      if (earliest >= 0) return pool[earliest];
    }
    if (wantsGalleryFirst) {
      const exact = pool.findIndex(p => p[0] === "gallery");
      if (exact >= 0) return pool[exact];
      const earliest = findPoolWithEarliestType("gallery");
      if (earliest >= 0) return pool[earliest];
    }
  }

  return pool[defaultIdx];
}

function renderLayoutSlotAssignment(niche: Niche, brief: string, targetSections = 5, pageArchetypeName?: string | null): string {
  const sequence = selectLayoutSequence(niche, brief, pageArchetypeName);
  const usedSlots = sequence.slice(0, targetSections);
  const lines = usedSlots.map((layout, i) => `  Body section ${i + 1}: ${layout}`).join("\n");
  const sectionCountNote = targetSections === 3
    ? `\nThere are exactly ${targetSections} body section slots. Do NOT create more than ${targetSections} body sections.`
    : `\nThere are ${targetSections} body section slots available. Use between 3 and ${targetSections}.`;

  return `=== LAYOUT SLOT ASSIGNMENT (BINDING) ===

Each body section has a PRE-ASSIGNED layout type. You MUST use the assigned layout.
This prevents layout repetition and ensures visual diversity.
${sectionCountNote}
  Hero: split or immersive (use the archetype above)
${lines}
  Footer: designed closure (use the archetype above)

LAYOUT TYPE DEFINITIONS:
  split — two-column grid (lg:grid-cols-2) with text on one side, media/content on other
  split-reversed — same as split but sides flipped (media left, text right)
  grid — multi-column card or feature grid (md:grid-cols-3 or similar)
  centered-stack — single centered column with supporting element below
  timeline — step sequence with vertical/horizontal markers (border-l or numbered steps)
  stats-band — horizontal metrics row with large numbers and labels
  gallery — asymmetric multi-image layout with varied sizes
  quote-band — large editorial pull-quote with attribution
  editorial-list — ruled list with name + description + price/detail per row
  manifesto — single-column typographic statement with generous spacing

These are structural starting points — adapt colors, content, and proportions to the niche.
Do NOT deviate from the assigned layout type for each section slot.

=== END LAYOUT SLOT ASSIGNMENT ===`;
}

function renderShortPromptDefaults(niche: Niche, brief: string): string {
  const p = getNicheProfile(niche);
  const wordCount = brief.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 12) return "";

  return `=== SHORT-PROMPT INFERENCE (apply when brief is sparse) ===

The user's brief is short. Anchor your generation to the niche default below — do not freelance with generic premium instincts.

Inferred niche: ${NICHE_LABELS[niche]}
Default design direction: ${p.shortPromptDefaults.designDirection}
Default title hint: ${p.shortPromptDefaults.titleHint}

Use the starter base scaffold as your exact structural starting point. Use the niche profile's required choreography as the section order. Use the generated local asset plan for all images. The brief's brevity is not permission to default to a SaaS hero + 3 feature cards + centered CTA template.
`;
}

// ─── Color Intent Extraction ────────────────────────────────────
// Detects explicit color/theme requests in the brief and produces an
// override block that takes precedence over the design family's palette.

const COLOR_KEYWORDS: Record<string, { hue: string; tailwind: string; accent: string }> = {
  orange:    { hue: "25",  tailwind: "orange", accent: "hsl(25 95% 53%)" },
  red:       { hue: "0",   tailwind: "red",    accent: "hsl(0 84% 60%)" },
  blue:      { hue: "220", tailwind: "blue",   accent: "hsl(220 83% 53%)" },
  green:     { hue: "142", tailwind: "green",  accent: "hsl(142 71% 45%)" },
  purple:    { hue: "270", tailwind: "purple", accent: "hsl(270 76% 55%)" },
  pink:      { hue: "330", tailwind: "pink",   accent: "hsl(330 81% 60%)" },
  yellow:    { hue: "45",  tailwind: "yellow", accent: "hsl(45 93% 47%)" },
  teal:      { hue: "174", tailwind: "teal",   accent: "hsl(174 72% 40%)" },
  indigo:    { hue: "239", tailwind: "indigo", accent: "hsl(239 84% 67%)" },
  amber:     { hue: "38",  tailwind: "amber",  accent: "hsl(38 92% 50%)" },
  emerald:   { hue: "160", tailwind: "emerald",accent: "hsl(160 84% 39%)" },
  cyan:      { hue: "190", tailwind: "cyan",   accent: "hsl(190 95% 39%)" },
  lime:      { hue: "85",  tailwind: "lime",   accent: "hsl(85 85% 35%)" },
  rose:      { hue: "350", tailwind: "rose",   accent: "hsl(350 89% 60%)" },
  violet:    { hue: "263", tailwind: "violet",accent: "hsl(263 70% 50%)" },
  gold:      { hue: "43",  tailwind: "yellow", accent: "hsl(43 96% 56%)" },
  coral:     { hue: "16",  tailwind: "orange", accent: "hsl(16 85% 57%)" },
};

function extractColorIntent(brief: string): string | null {
  const lower = brief.toLowerCase();

  // Match patterns like "orange theme", "use blue", "in red", "green color scheme"
  const colorPattern = /\b(orange|red|blue|green|purple|pink|yellow|teal|indigo|amber|emerald|cyan|lime|rose|violet|gold|coral)\b/;
  const themeContextPattern = /\b(theme|color|colour|scheme|palette|accent|brand|tone|style|vibe)\b/;

  const colorMatch = lower.match(colorPattern);
  if (!colorMatch) return null;

  const color = colorMatch[1];
  const hasThemeContext = themeContextPattern.test(lower);
  // Also match if color appears near "website", "landing", "page", etc.
  const hasWebContext = /\b(website|landing|page|site|build|create|make)\b/.test(lower);

  if (!hasThemeContext && !hasWebContext) return null;

  const info = COLOR_KEYWORDS[color];
  if (!info) return null;

  return `=== USER COLOR OVERRIDE (HIGHEST PRIORITY) ===

The user explicitly requested a "${color}" theme/color. This overrides the design family's default palette.

BINDING COLOR RULES:
1. The PRIMARY accent color MUST be ${info.accent} (${color}).
2. Use Tailwind's ${info.tailwind}-* scale for accent classes: bg-${info.tailwind}-500, text-${info.tailwind}-600, border-${info.tailwind}-400, etc.
3. Hero section MUST prominently feature the ${color} accent: in CTA buttons, headline accents, or decorative elements.
4. CTA buttons MUST use the ${color} accent as their primary color (bg-${info.tailwind}-500 hover:bg-${info.tailwind}-600 or similar).
5. At least 3 sections must show visible ${color} accent usage: headlines, borders, badges, dividers, or background tints.
6. Surface backgrounds can remain from the design family, but accent/primary tokens MUST shift to ${color}.
7. In the CSS theme variables, override --primary to use hue ${info.hue} (e.g., --primary: ${info.hue} 85% 55%).
8. The manifest colorStrategy MUST mention "${color}" as the accent color.

DO NOT ignore this override. The user will see the result and expect ${color} to be the dominant accent color.

=== END USER COLOR OVERRIDE ===`;
}

/**
 * Build the complete system prompt for a website generation.
 */
function renderBindingDesignChoices(
  paletteDirection?: string | null,
  paletteLabel?: string | null,
  palettePrimaryCss?: string | null,
  heroVariant?: number | null,
  pageArchetypeName?: string | null,
  pageArchetypeDesc?: string | null,
  pageArchetypeOpeningSection?: string | null,
  choreographyEmphasis?: string | null,
  choreographyEmphasisDesc?: string | null,
): string {
  if (!paletteDirection && !heroVariant && !pageArchetypeName && !choreographyEmphasis) return "";

  const lines: string[] = [
    `=== BINDING DESIGN CHOICES (PRE-SELECTED — NON-NEGOTIABLE) ===`,
    ``,
    `The system pre-selected these values before generation. Do not override them.`,
    `Do not default to Direction A or Hero Option 1 — the system chose something else.`,
    ``,
  ];

  if (paletteDirection && paletteLabel) {
    lines.push(`PALETTE DIRECTION: ${paletteDirection} — "${paletteLabel}"`);
    if (palettePrimaryCss) lines.push(`  CSS override: ${palettePrimaryCss}`);
    lines.push(`  → Apply this direction's --primary (and any --background override) in src/index.css.`);
    lines.push(`  → All accent classes (bg-primary, text-primary, border-primary, ring-primary) inherit from this.`);
    lines.push(`  → DO NOT use Direction A's values unless Direction A was explicitly selected above.`);
    lines.push(``);
  }

  if (heroVariant) {
    lines.push(`HERO ARCHETYPE: Option ${heroVariant}`);
    lines.push(`  → Find "Option ${heroVariant}" in the style skill's ## Section Archetypes → Navbar/Hero row.`);
    lines.push(`  → Build that composition — NOT the other option.`);
    lines.push(`  → If only one option exists, use its second layout variant (reversed or staggered).`);
    lines.push(``);
  }

  if (pageArchetypeName && pageArchetypeDesc) {
    lines.push(`PAGE ARCHETYPE: ${pageArchetypeName}`);
    lines.push(`  ${pageArchetypeDesc}`);
    if (pageArchetypeOpeningSection) {
      lines.push(`  → First body section after Hero MUST be: ${pageArchetypeOpeningSection}.`);
      lines.push(`  → Do NOT open with a 3-card feature grid regardless of niche defaults.`);
      lines.push(`  → SECTION ORDER OVERRIDE: The starter base lists a fixed section order (e.g. Services, Programs).`);
      lines.push(`    That order is OVERRIDDEN by this archetype. Reorder sections so the archetype opening comes first.`);
      lines.push(`    Keep the same component types — only the ORDER changes.`);
    }
    lines.push(``);
  }

  if (choreographyEmphasis && choreographyEmphasisDesc) {
    lines.push(`SECTION CHOREOGRAPHY: ${choreographyEmphasis}`);
    lines.push(`  ${choreographyEmphasisDesc}`);
    lines.push(`  → Apply this emphasis consistently across all body sections, not just the first.`);
    lines.push(``);
  }

  lines.push(`GENERIC PATTERN BAN (enforced for this generation):`);
  lines.push(`  The following is the most common AI-generated website skeleton — it is BANNED:`);
  lines.push(`  ✗ Split hero → 3-feature-card grid → centered testimonials → centered CTA strip → 4-column footer`);
  lines.push(`  Any site matching this exact skeleton fails the critic.`);
  lines.push(`  The PAGE ARCHETYPE above defines the required alternative opening — use it.`);
  lines.push(``);
  lines.push(`=== END BINDING DESIGN CHOICES ===`);

  return lines.join("\n");
}

export function buildWebsiteProjectPrompt(
  brief: string,
  basePrompt: {
    hardPriorityDirectives: string;
    siteTypeModes: string;
    designSkill: string;
    designSpecBlock?: string;
    designSpecId?: string | null;
    variantPlan?: WebsiteVariantPlan;
    variantPlanBlock?: string;
    imagePlanBlock?: string;
    planningStep: string;
    outputFormat: string;
    rulesForEachSection: string;
    qualityBar: string;
    choreographyBar: string;
    uiPrimitivesReference: string;
    sectionPatterns: string;
    routedStyleActive?: boolean;
    selectedStyleId?: string | null;
    paletteDirection?: string | null;
    paletteLabel?: string | null;
    palettePrimaryCss?: string | null;
    heroVariant?: number | null;
    pageArchetypeName?: string | null;
    pageArchetypeDesc?: string | null;
    pageArchetypeOpeningSection?: string | null;
    choreographyEmphasis?: string | null;
    choreographyEmphasisDesc?: string | null;
  }
): { prompt: string; niche: Niche; designFamily: DesignFamilyId; selectedStyleId: string | null } {
  const niche = detectNiche(brief);
  const designFamily =
    (basePrompt.designSpecId as DesignFamilyId | undefined) ??
    basePrompt.variantPlan?.designFamily ??
    selectDesignFamily(niche, brief);
  // Must be declared before renderLayoutSlotAssignment uses it below.
  const useRoutedStyle = basePrompt.routedStyleActive === true;
  const nicheProfile = renderNicheProfile(niche);
  const generatedImageBlock = renderGeneratedImagePrompt(
    brief,
    niche,
    designFamily
  );
  const blueprintsBlock = renderSectionBlueprintsPrompt();
  const starterBase = getVariantStarterBase(niche, basePrompt.variantPlan);
  const starterBlock = starterBase ? renderStarterBase(starterBase) : "";
  const shortDefaults = renderShortPromptDefaults(niche, brief);
  const layoutAssignment = renderLayoutSlotAssignment(niche, brief, useRoutedStyle ? 3 : 5, basePrompt.pageArchetypeName);
  const colorOverride = extractColorIntent(brief);
  const bindingChoices = renderBindingDesignChoices(
    basePrompt.paletteDirection,
    basePrompt.paletteLabel,
    basePrompt.palettePrimaryCss,
    basePrompt.heroVariant,
    basePrompt.pageArchetypeName,
    basePrompt.pageArchetypeDesc,
    basePrompt.pageArchetypeOpeningSection,
    basePrompt.choreographyEmphasis,
    basePrompt.choreographyEmphasisDesc,
  );

  // When a routed Markdown style skill is active, it is the primary visual
  // authority. The TS-rendered design family, section archetypes, and design
  // intelligence layers duplicate what the style skill already defines
  // (typography, color, spacing, motifs, archetypes, motion, palette, etc.).
  // Gate them to avoid competing instructions.
  //
  // When no routed style is active (legacy fallback), these TS layers remain
  // the only source of per-family visual rules, so we keep them.

  const designFamilyBlock = useRoutedStyle
    ? ""
    : renderDesignFamilyPrompt(designFamily);
  const designSpecBlock = basePrompt.designSpecBlock ?? "";
  const variantPlanBlock =
    basePrompt.variantPlanBlock ??
    (basePrompt.variantPlan ? renderVariantPlanPrompt(basePrompt.variantPlan) : "");
  const imagePlanBlock = basePrompt.imagePlanBlock ?? "";
  const archetypeBlock = useRoutedStyle
    ? ""
    : renderSectionArchetypesPrompt(niche, designFamily, brief);
  const designIntelligence = useRoutedStyle
    ? ""
    : renderDesignIntelligencePrompt(designFamily);

  if (useRoutedStyle) {
    console.log(
      `[build-prompt] Routed style active — gated: designFamily, archetypes, designIntelligence`
    );
  } else {
    console.log(
      `[build-prompt] Legacy mode — all TS style layers active`
    );
  }

  // ── Layer list and workflow adapt based on whether a routed style skill
  //    is active. When routed, the style skill is the primary visual
  //    authority and the TS design-family/archetype/intelligence layers are
  //    omitted to avoid competing instructions.

  const layerList = useRoutedStyle
    ? `You MUST follow this layered control stack. Each layer owns specific concerns - do NOT mix or duplicate their responsibilities:

  1. PRIORITY DIRECTIVES - banned patterns, pre-emit self-check, composition diversity enforcement
  2. DESIGN.MD CONTROL SPEC - first-pass structural + token contract resolved before generation
  3. BINDING VARIANT PLAN - pre-selected hero/proof/features/CTA/footer/image strategy/density/contrast plan for this exact run
  4. STARTER BASE - exact component file list + per-section composition instructions (structural scaffold)
  5. SECTION STRUCTURAL BLUEPRINTS - hard requirements per section role (what must/must not be in each section)
  6. LAYOUT SLOT ASSIGNMENT - pre-assigned layout types per body section for diversity
  7. NICHE PROFILE - choreography sequence, pattern vocabulary, motion, layout recipes
  8. GENERATED IMAGE CONTRACT - local generated assets only, no stock URLs
  9. IMPECCABLE FRONTEND TASTE LAYER - visual composition floor: hero structure, section rhythm, image-text interplay, layering, CTA surfaces, footer closure
  10. SITE-TYPE COMPOSITION MODES - hard structural contracts for restaurant / saas / portfolio
  11. SELECTED STYLE SKILL (PRIMARY VISUAL AUTHORITY) - typography, color, spacing, motifs, archetypes, CSS theme, generation steps. This is a Markdown skill selected per-request. Follow its Generation Steps in exact order.
  12. CORE CONTRACT - universal build/runtime rules (imports, icons, images, styles, entry)
  13. PLANNING + OUTPUT FORMAT + RULES - mechanical correctness (manifest format, file structure, per-section rules)

Conflict resolution: more specific layer wins. Priority directives override all. DESIGN.md control spec > binding variant plan > starter base > style skill > blueprints > niche profile > Impeccable. The style skill's Generation Steps define the mandatory build sequence - they replace the default generation workflow, but they may NOT weaken the DESIGN.md contract or the binding variant plan for hero/CTA/section order/token use.`
    : `You MUST follow this layered control stack. Each layer owns specific concerns - do NOT mix or duplicate their responsibilities:

  1. PRIORITY DIRECTIVES - banned patterns, pre-emit self-check, composition diversity enforcement
  2. DESIGN.MD CONTROL SPEC - first-pass structural + token contract resolved before generation
  3. BINDING VARIANT PLAN - pre-selected hero/proof/features/CTA/footer/image strategy/density/contrast plan for this exact run
  4. STARTER BASE - exact component file list + per-section composition instructions (structural scaffold)
  5. DESIGN FAMILY - programmatically selected visual grammar for the whole build
  6. SECTION ARCHETYPE CONTRACT - selected structural archetypes per section role
  6b. SECTION STRUCTURAL BLUEPRINTS - hard requirements per section role (what must/must not be in each section)
  7. NICHE PROFILE - choreography sequence, pattern vocabulary, motion, layout recipes
  8. GENERATED IMAGE CONTRACT - local generated assets only, no stock URLs
  9. IMPECCABLE FRONTEND TASTE LAYER - visual composition floor: hero structure, section rhythm, image-text interplay, layering, CTA surfaces, footer closure
  9b. DESIGN INTELLIGENCE - per-family typography, spacing, palette, motion, interaction, layout density, anti-generic, and design review rules
  10. SITE-TYPE COMPOSITION MODES - hard structural contracts for restaurant / saas / portfolio
  11. CENATE DESIGN SYSTEM SKILL - typography scale, color strategy, component defaults, Tailwind usage, runtime constraints
  12. PLANNING + OUTPUT FORMAT + RULES - mechanical correctness (manifest format, file structure, per-section rules)

Conflict resolution: more specific layer wins. DESIGN.md control spec > binding variant plan > starter base > design family > section archetypes + blueprints > niche profile > Impeccable > design system skill. Priority directives override all. Blueprints are hard floors - archetypes may exceed them but never violate them. DESIGN.md owns first-pass hero/CTA/section-order/token decisions when any broader layer is looser, and the variant plan owns which concrete section philosophy this run must use.`;

  const designSkillBlock = useRoutedStyle
    ? `=== SELECTED STYLE SKILL (PRIMARY VISUAL AUTHORITY) ===

This is the selected Markdown style skill for this generation. It is the PRIMARY visual authority — it defines typography, color, spacing, motifs, section archetypes, CSS theme variables, and a mandatory Generation Steps sequence.

You MUST follow the style skill's Generation Steps in exact order. They replace the default STEP A–E workflow below.

It does NOT own: section choreography (niche profile owns that), composition quality floor (Impeccable owns that), banned patterns (priority directives own that), or site-type contracts (site-type modes own that).

${basePrompt.designSkill}

=== END SELECTED STYLE SKILL ===`
    : `=== CENATE DESIGN SYSTEM SKILL (typography, color, component defaults, runtime constraints) ===

This skill owns: typography scale, color strategy, component-level defaults (nav, hero sizing, buttons, forms, inputs), Tailwind usage, and sandbox runtime constraints (imports, icons, images, styles, entry). It does NOT own: section choreography (niche profile owns that), composition quality floor (Impeccable owns that), banned patterns (priority directives own that), or site-type contracts (site-type modes own that).

${basePrompt.designSkill}

=== END DESIGN SYSTEM SKILL ===`;

  const generationWorkflow = useRoutedStyle
    ? `GENERATION WORKFLOW:

The selected style skill above contains a ## Generation Steps section with numbered steps. Follow those steps in exact order - they are your primary build sequence.

After completing the style skill's steps, also verify these hard rules before emitting.

HARD RULES:
  - DESIGN.MD CONTROL SPEC is mandatory. Preserve its required role order, Hero second, and Footer last.
  - BINDING VARIANT PLAN is mandatory. Preserve its hero/proof/features/CTA/footer/imageStrategy choices and middle-section role order.
  - Hero MUST satisfy the DESIGN.md hero blueprint on the first pass.
  - Hero MUST match the selected heroVariant composition on the first pass. Do not substitute a safer generic hero.
  - Proof/services/CTA/footer MUST match the selected variant plan instead of converging on the default safe scaffold.
  - CTA/conversion surface MUST satisfy the DESIGN.md CTA blueprint on the first pass.
  - No layout type may repeat more than once across body sections.
  - No two consecutive sections may share the same dominant layout pattern.
  - Every section component MUST import Section, Container, Heading from @/components/ui/.
  - Do NOT rebuild any UI primitive inline. The critic will reject it.
  - Use semantic token classes and font-heading/font-body. Raw hex/rgb/hsl colors are banned in section code.
  - text-8xl and text-9xl are BANNED on all elements.
  - Maximum 3 body sections. This is a hard limit set by the active style skill. Merge content into 3 files - do NOT exceed 3 body section components.
  - At most ONE uniform card grid per page.
  - Blank visual frames, empty image shells, pulse-dot placeholder cards, and generic browser-panel fillers are banned.
  - Generic service-grid, avatar-proof-grid, centered CTA stripe, and four-column footer fallbacks are banned.

Generate a complete, beautiful, production-quality project.`
    : `GENERATION WORKFLOW - STEP-BASED (follow this exact sequence):

STEP A - DESIGN SYSTEM DEFINITION (silent, do not output):
  1. Identify the niche from the brief.
  2. Read the DESIGN.MD CONTROL SPEC first. Lock in its required role order, hero/CTA/footer/service/proof/gallery contracts, semantic token use, and banned fallback patterns.
  3. Read the BINDING VARIANT PLAN next. Lock its heroVariant, proofVariant, featureVariant, ctaVariant, footerVariant, imageStrategy, densityMode, contrastMode, and middle-section role order before any code is planned.
  4. Read the selected design family above only as supporting visual grammar where it does not conflict with DESIGN.md or the variant plan.
  5. Decide: light or dark mode? Use the selected system's semantic theme variables as the authority.
  6. Choose 2-3 accent variations for section-level color shifts (e.g., bg-background - bg-card - bg-muted - bg-zinc-950).

STEP B - LAYOUT STRUCTURE DEFINITION (silent, do not output):
  1. Start from the DESIGN.md required role order. Hero is second. Footer is last. Preserve that order even when sections are merged.
  2. Within the middle of the page, preserve the BINDING VARIANT PLAN body role order exactly.
  3. Read the LAYOUT SLOT ASSIGNMENT above. Each body section has a pre-assigned layout type. Do NOT deviate.
  4. Read the SECTION ARCHETYPE CONTRACT above. Each section role has a pre-selected archetype. Do NOT invent freehand.
  5. Map each archetype to its assigned layout type. Confirm they are compatible. If they differ, the slot assignment wins for structure, the archetype wins for content/motif, but neither may violate DESIGN.md or the variant plan.
  6. Plan vertical spacing: assign different py-N values to each section based on purpose. At least 3 distinct values.
  7. Plan surface shifts: assign different background treatments to create visual rhythm. At least 2 visible shifts.

STEP C - COMPONENT PLANNING (silent, do not output):
  1. List the exact .tsx files you will emit: Navbar.tsx, Hero.tsx, 3-5 body section files, Footer.tsx.
  2. For EACH file, note which UI primitives it will import: Section, Container, Heading (mandatory for all), plus Button, Card, Input, Textarea, Badge, Separator, Accordion, Tabs, StatsBand, Gallery, Testimonial, MobileNav, AspectRatio as needed.
  3. For EACH file, note which projectImages.* keys it will use (if any).
  4. Verify Hero satisfies the DESIGN.md hero blueprint before writing it.
  5. Verify Hero matches the selected heroVariant and imageStrategy before writing it.
  6. Verify CTA/conversion satisfies the DESIGN.md CTA blueprint and the selected ctaVariant before writing it.
  7. Verify Proof/services/footer match their selected variants instead of generic fallbacks.
  8. Verify: no two consecutive sections share the same layout type. No layout repeats more than once total.

STEP D - MANIFEST GENERATION:
  1. Output ===PROJECT_MANIFEST=== with all required fields.
  2. sectionOrder MUST match the exact component render order in App.tsx.
  3. sectionOrder MUST preserve the DESIGN.md required role order.
  4. designFamily MUST match the selected family.
  5. typography, colorStrategy, designDirection MUST reflect the actual design decisions from Step A.
  6. designDirection should restate the chosen variant plan, not only the family mood.

STEP E - CODE GENERATION:
  1. Output src/App.tsx - imports all section components, renders them in order inside <main role="main" className="min-h-screen bg-background text-foreground">.
  2. Output each section component file. For EVERY section:
     - Wrap in Section > Container > content structure
     - Use Heading for all titles
     - Use Button for all primary actions
     - Use semantic token classes and font-heading/font-body
      - Follow the assigned layout type from the slot assignment
      - Follow the archetype structure from the archetype contract
      - Follow the binding variant plan for that section role
      - Satisfy the DESIGN.md blueprint contract for that section role
      - Apply the design family's visual grammar
     - Use varied py-N spacing as planned in Step B
     - Use the planned surface background treatment
  3. Navbar MUST use MobileNav from @/components/ui/mobile-nav for mobile. No custom hamburger state.
  4. Hero MUST include: headline, paragraph, Button CTA, and a support block (stats/trust/credential rail).
  5. CTA/conversion/contact/reservation sections MUST include a Button plus a real form or real contact info on a framed surface.
  6. Footer MUST include contact details and at least one non-link element. No four-column sitemap fallback.
  7. Use ONLY projectImages.* from "@/assets/generated-images" for media. No Unsplash. No remote URLs.
  8. Non-SaaS heroes may NOT use browser-window or dashboard mock panels as fake image success. SaaS may use one product-surface hero, but supporting sections still need materially different visual treatment.
  9. Do NOT generate scaffold files, configs, UI primitives, entry files, or test files - they are pre-injected.

HARD RULES:
  - Preserve the DESIGN.md required role order in both manifest and App.tsx.
  - Preserve the binding variant plan through first-pass generation. Do not flatten hero/proof/features/CTA/footer back to the generic safe Cenate scaffold.
  - No layout type may repeat more than once across body sections.
  - No two consecutive sections may share the same dominant layout pattern.
  - Every section component MUST import Section, Container, Heading from @/components/ui/.
  - Do NOT rebuild any UI primitive inline. The critic will reject it.
  - Use semantic token classes and font-heading/font-body. Raw hex/rgb/hsl colors are banned in section code.
  - text-8xl and text-9xl are BANNED on all elements.
  - Maximum 5 body sections. Merge if needed.
  - At most ONE uniform card grid per page.
  - Blank visual frames, empty image shells, pulse-dot placeholder cards, and generic browser-panel fillers are banned.
  - Generic service-grid, avatar-proof-grid, centered CTA stripe, and four-column footer fallbacks are banned.

Generate a complete, beautiful, production-quality project.`;

  const prompt = `You are an expert website builder that generates premium, production-quality multi-file React + TypeScript + Vite + Tailwind projects.

The project's files[] is the single source of truth. The preview is built at runtime by compiling and evaluating those exact files inside a sandboxed iframe (Babel + React UMD + Tailwind CDN). Any import that does not resolve, any reference to an external library, or any phantom dependency WILL break the preview. Be strict.

${layerList}

${basePrompt.hardPriorityDirectives}

${colorOverride ?? ""}

${bindingChoices}

${designSpecBlock}

${variantPlanBlock}

${imagePlanBlock}

${starterBlock}

${designFamilyBlock}

${archetypeBlock}

${blueprintsBlock}

${layoutAssignment}

${nicheProfile}

${generatedImageBlock}

${shortDefaults}

${IMPECCABLE_TASTE_LAYER}

${designIntelligence}

${basePrompt.siteTypeModes}

${designSkillBlock}

${basePrompt.uiPrimitivesReference}

${basePrompt.sectionPatterns}

${basePrompt.planningStep}

${basePrompt.outputFormat}

${basePrompt.rulesForEachSection}

${basePrompt.qualityBar}

${basePrompt.choreographyBar}

${generationWorkflow}`;

  return { prompt, niche, designFamily, selectedStyleId: basePrompt.selectedStyleId ?? null };
}
