/**
 * Layout rules distilled from:
 * - nextlevelbuilder/ui-ux-pro-max (visual hierarchy, content priority, responsive)
 * - nextlevelbuilder landing page patterns (section ordering, CTA placement)
 * - emilkowalski/skill (composition craft, density control)
 *
 * Section density profiles and layout quality enforcement.
 */

import type { DesignFamilyId } from "../design-families";

export type DensityProfile = "sparse" | "standard" | "dense";

export type SectionDensityRule = {
  role: string;
  density: DensityProfile;
  alignment: "left" | "center" | "asymmetric";
  visualWeight: "image-heavy" | "text-heavy" | "data-heavy" | "balanced";
};

const SECTION_DENSITY_TEMPLATES: Record<DesignFamilyId, SectionDensityRule[]> = {
  editorial_luxury: [
    { role: "hero", density: "sparse", alignment: "asymmetric", visualWeight: "image-heavy" },
    { role: "story", density: "standard", alignment: "left", visualWeight: "balanced" },
    { role: "services", density: "standard", alignment: "left", visualWeight: "text-heavy" },
    { role: "gallery", density: "dense", alignment: "asymmetric", visualWeight: "image-heavy" },
    { role: "proof", density: "sparse", alignment: "center", visualWeight: "text-heavy" },
    { role: "cta", density: "standard", alignment: "asymmetric", visualWeight: "balanced" },
  ],
  modern_minimal: [
    { role: "hero", density: "standard", alignment: "asymmetric", visualWeight: "balanced" },
    { role: "story", density: "sparse", alignment: "center", visualWeight: "text-heavy" },
    { role: "services", density: "dense", alignment: "left", visualWeight: "data-heavy" },
    { role: "gallery", density: "standard", alignment: "asymmetric", visualWeight: "image-heavy" },
    { role: "proof", density: "sparse", alignment: "left", visualWeight: "text-heavy" },
    { role: "cta", density: "standard", alignment: "asymmetric", visualWeight: "balanced" },
  ],
  bold_commercial: [
    { role: "hero", density: "dense", alignment: "asymmetric", visualWeight: "data-heavy" },
    { role: "story", density: "standard", alignment: "left", visualWeight: "balanced" },
    { role: "services", density: "dense", alignment: "left", visualWeight: "data-heavy" },
    { role: "gallery", density: "standard", alignment: "asymmetric", visualWeight: "image-heavy" },
    { role: "proof", density: "dense", alignment: "center", visualWeight: "data-heavy" },
    { role: "cta", density: "standard", alignment: "asymmetric", visualWeight: "balanced" },
  ],
  warm_artisan: [
    { role: "hero", density: "sparse", alignment: "asymmetric", visualWeight: "image-heavy" },
    { role: "story", density: "sparse", alignment: "left", visualWeight: "balanced" },
    { role: "services", density: "standard", alignment: "left", visualWeight: "text-heavy" },
    { role: "gallery", density: "standard", alignment: "asymmetric", visualWeight: "image-heavy" },
    { role: "proof", density: "sparse", alignment: "center", visualWeight: "text-heavy" },
    { role: "cta", density: "standard", alignment: "asymmetric", visualWeight: "balanced" },
  ],
};

export function getSectionDensityTemplate(family: DesignFamilyId): SectionDensityRule[] {
  return SECTION_DENSITY_TEMPLATES[family];
}

export function renderLayoutRulesPrompt(family: DesignFamilyId): string {
  const rules = SECTION_DENSITY_TEMPLATES[family];
  const lines = rules
    .map((r) => `  ${r.role}: density=${r.density}, align=${r.alignment}, weight=${r.visualWeight}`)
    .join("\n");

  return `=== LAYOUT & DENSITY RULES (${family}) ===
Section density profile (use as structural guide):
${lines}
LAYOUT QUALITY RULES:
  • Visual hierarchy through size, spacing, and contrast — not color alone
  • Mobile-first: core content first, fold secondary
  • No horizontal scroll on any viewport
  • Container max-width: max-w-7xl for full sections, max-w-5xl for content, max-w-2xl for prose
  • Z-index discipline: base 0, sticky nav 10, overlays 20, modals 40, toasts 50
  • At least ONE section must break page rhythm with asymmetry or alignment shift
  • No two adjacent sections may share same alignment AND same density AND same visual weight
  • Image-heavy sections must alternate with text-heavy or data-heavy sections
  • Primary CTA must be visually dominant — one primary action per screen
  • Footer must feel like designed closure, not a utility strip
=== END LAYOUT RULES ===`;
}
