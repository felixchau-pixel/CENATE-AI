/**
 * Design Intelligence — internal design knowledge layer for Cenate.
 *
 * Distilled from:
 * - nextlevelbuilder/ui-ux-pro-max (67 styles, 161 palettes, 57 font pairings, 99 UX guidelines)
 * - emilkowalski/skill (animation framework, component craft, interaction polish)
 * - nextlevelbuilder/ui-styling (shadcn/ui patterns, Tailwind theming, accessibility)
 *
 * These modules are compact rule tables and structured configs — not prose dumps.
 * They integrate into: prompt builder, critic, and design pass.
 */

export { renderTypographyRulesPrompt, getTypographyProfile } from "./typography-rules";
export { renderSpacingRulesPrompt, getSpacingProfile } from "./spacing-rules";
export { renderPaletteRulesPrompt, getPaletteProfile } from "./palette-rules";
export { renderMotionRulesPrompt, getMotionProfile } from "./motion-rules";
export { renderInteractionRulesPrompt } from "./interaction-rules";
export { renderLayoutRulesPrompt, getSectionDensityTemplate } from "./layout-rules";
export { renderAntiGenericRulesPrompt, GENERIC_PATTERNS } from "./anti-generic-rules";
export { renderDesignReviewPrompt, DESIGN_REVIEW_RULES } from "./design-review-rules";

import type { DesignFamilyId } from "../design-families";
import { renderTypographyRulesPrompt } from "./typography-rules";
import { renderSpacingRulesPrompt } from "./spacing-rules";
import { renderPaletteRulesPrompt } from "./palette-rules";
import { renderMotionRulesPrompt } from "./motion-rules";
import { renderInteractionRulesPrompt } from "./interaction-rules";
import { renderLayoutRulesPrompt } from "./layout-rules";
import { renderAntiGenericRulesPrompt } from "./anti-generic-rules";
import { renderDesignReviewPrompt } from "./design-review-rules";

/**
 * Compose the full design intelligence prompt block for a given family.
 * This is injected as a single layer into the generation prompt.
 */
export function renderDesignIntelligencePrompt(family: DesignFamilyId): string {
  return [
    renderTypographyRulesPrompt(family),
    renderSpacingRulesPrompt(family),
    renderPaletteRulesPrompt(family),
    renderMotionRulesPrompt(family),
    renderInteractionRulesPrompt(family),
    renderLayoutRulesPrompt(family),
    renderAntiGenericRulesPrompt(),
    renderDesignReviewPrompt(),
  ].join("\n\n");
}
