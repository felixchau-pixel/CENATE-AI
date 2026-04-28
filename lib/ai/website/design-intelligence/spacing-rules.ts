/**
 * Spacing rules distilled from:
 * - nextlevelbuilder/ui-ux-pro-max (8pt grid, spacing scale, density)
 * - emilkowalski/skill (whitespace as design tool, density control)
 *
 * Section spacing profiles by purpose. Density control per family.
 */

import type { DesignFamilyId } from "../design-families";
import type { SectionRole } from "../design-families";

export type SpacingProfile = {
  sectionPadding: Record<SectionRole, string>;
  internalGap: { tight: string; standard: string; generous: string };
  containerMax: { full: string; content: string; prose: string };
  cardGap: string;
  density: "tight" | "standard" | "generous";
};

const SPACING_PROFILES: Record<DesignFamilyId, SpacingProfile> = {
  editorial_luxury: {
    sectionPadding: {
      navbar: "py-4",
      hero: "py-24 md:py-32",
      story: "py-20 md:py-28",
      services: "py-16 md:py-24",
      gallery: "py-16 md:py-20",
      proof: "py-12 md:py-16",
      cta: "py-20 md:py-28",
      footer: "py-12 md:py-16",
    },
    internalGap: { tight: "gap-3", standard: "gap-6", generous: "gap-10" },
    containerMax: { full: "max-w-7xl", content: "max-w-5xl", prose: "max-w-2xl" },
    cardGap: "gap-6",
    density: "generous",
  },
  modern_minimal: {
    sectionPadding: {
      navbar: "py-3",
      hero: "py-20 md:py-28",
      story: "py-16 md:py-24",
      services: "py-16 md:py-20",
      gallery: "py-12 md:py-16",
      proof: "py-12 md:py-16",
      cta: "py-16 md:py-24",
      footer: "py-8 md:py-12",
    },
    internalGap: { tight: "gap-2", standard: "gap-4", generous: "gap-8" },
    containerMax: { full: "max-w-7xl", content: "max-w-5xl", prose: "max-w-xl" },
    cardGap: "gap-4",
    density: "standard",
  },
  bold_commercial: {
    sectionPadding: {
      navbar: "py-3",
      hero: "py-20 md:py-28",
      story: "py-16 md:py-20",
      services: "py-12 md:py-16",
      gallery: "py-12 md:py-16",
      proof: "py-10 md:py-14",
      cta: "py-16 md:py-24",
      footer: "py-10 md:py-14",
    },
    internalGap: { tight: "gap-2", standard: "gap-4", generous: "gap-6" },
    containerMax: { full: "max-w-7xl", content: "max-w-6xl", prose: "max-w-2xl" },
    cardGap: "gap-4",
    density: "tight",
  },
  warm_artisan: {
    sectionPadding: {
      navbar: "py-4",
      hero: "py-20 md:py-28",
      story: "py-20 md:py-24",
      services: "py-16 md:py-20",
      gallery: "py-16 md:py-20",
      proof: "py-12 md:py-16",
      cta: "py-16 md:py-24",
      footer: "py-12 md:py-16",
    },
    internalGap: { tight: "gap-3", standard: "gap-6", generous: "gap-8" },
    containerMax: { full: "max-w-6xl", content: "max-w-5xl", prose: "max-w-2xl" },
    cardGap: "gap-6",
    density: "generous",
  },
};

export function getSpacingProfile(family: DesignFamilyId): SpacingProfile {
  return SPACING_PROFILES[family];
}

export function renderSpacingRulesPrompt(family: DesignFamilyId): string {
  const s = SPACING_PROFILES[family];
  const sectionLines = (Object.entries(s.sectionPadding) as [SectionRole, string][])
    .map(([role, padding]) => `  ${role}: ${padding}`)
    .join("\n");

  return `=== SPACING RULES (${family}, density: ${s.density}) ===
Section padding by role:
${sectionLines}
Internal gaps: tight ${s.internalGap.tight} | standard ${s.internalGap.standard} | generous ${s.internalGap.generous}
Container widths: full ${s.containerMax.full} | content ${s.containerMax.content} | prose ${s.containerMax.prose}
Card grid gap: ${s.cardGap}
RULE: Every section MUST use its assigned padding. Do not use the same py-N on all sections.
RULE: Use 8px increments for all spacing (gap-2, gap-3, gap-4, gap-6, gap-8, gap-10, gap-12).
RULE: Body text must always be inside a prose-width container (${s.containerMax.prose}).
RULE: Card grids must use ${s.cardGap} or larger, never cramped.
=== END SPACING RULES ===`;
}
