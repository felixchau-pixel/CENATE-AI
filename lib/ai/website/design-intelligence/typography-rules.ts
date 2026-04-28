/**
 * Typography rules distilled from:
 * - nextlevelbuilder/ui-ux-pro-max (type scale, weight hierarchy, line height)
 * - emilkowalski/skill (hierarchy compounding, display craft)
 *
 * Compact rule tables — no prose in prompts.
 */

import type { DesignFamilyId } from "../design-families";

export type TypeScale = {
  hero: string;
  sectionHeading: string;
  subheading: string;
  body: string;
  caption: string;
  eyebrow: string;
};

export type WeightScale = {
  display: string;
  heading: string;
  label: string;
  body: string;
};

export type TypographyProfile = {
  scale: TypeScale;
  weights: WeightScale;
  lineHeight: { heading: string; body: string; caption: string };
  maxLineLength: { prose: string; heading: string };
  letterSpacing: { eyebrow: string; heading: string; body: string };
};

const TYPOGRAPHY_PROFILES: Record<DesignFamilyId, TypographyProfile> = {
  editorial_luxury: {
    scale: {
      hero: "text-4xl sm:text-5xl md:text-6xl",
      sectionHeading: "text-2xl sm:text-3xl md:text-4xl",
      subheading: "text-lg sm:text-xl",
      body: "text-base sm:text-lg",
      caption: "text-xs sm:text-sm",
      eyebrow: "text-xs",
    },
    weights: { display: "font-bold", heading: "font-semibold", label: "font-medium", body: "font-normal" },
    lineHeight: { heading: "leading-tight", body: "leading-relaxed", caption: "leading-normal" },
    maxLineLength: { prose: "max-w-2xl", heading: "max-w-3xl" },
    letterSpacing: { eyebrow: "tracking-[0.28em]", heading: "tracking-tight", body: "tracking-normal" },
  },
  modern_minimal: {
    scale: {
      hero: "text-4xl sm:text-5xl md:text-6xl",
      sectionHeading: "text-2xl sm:text-3xl",
      subheading: "text-lg",
      body: "text-base",
      caption: "text-sm",
      eyebrow: "text-xs",
    },
    weights: { display: "font-bold", heading: "font-semibold", label: "font-medium", body: "font-normal" },
    lineHeight: { heading: "leading-tight", body: "leading-normal", caption: "leading-normal" },
    maxLineLength: { prose: "max-w-xl", heading: "max-w-2xl" },
    letterSpacing: { eyebrow: "tracking-[0.22em]", heading: "tracking-tight", body: "tracking-normal" },
  },
  bold_commercial: {
    scale: {
      hero: "text-4xl sm:text-5xl md:text-6xl",
      sectionHeading: "text-2xl sm:text-3xl md:text-4xl",
      subheading: "text-lg sm:text-xl",
      body: "text-base sm:text-lg",
      caption: "text-sm",
      eyebrow: "text-xs",
    },
    weights: { display: "font-bold", heading: "font-bold", label: "font-semibold", body: "font-normal" },
    lineHeight: { heading: "leading-none", body: "leading-relaxed", caption: "leading-normal" },
    maxLineLength: { prose: "max-w-2xl", heading: "max-w-3xl" },
    letterSpacing: { eyebrow: "tracking-[0.24em]", heading: "tracking-wide", body: "tracking-normal" },
  },
  warm_artisan: {
    scale: {
      hero: "text-3xl sm:text-4xl md:text-5xl",
      sectionHeading: "text-2xl sm:text-3xl",
      subheading: "text-lg",
      body: "text-base sm:text-lg",
      caption: "text-sm",
      eyebrow: "text-xs",
    },
    weights: { display: "font-bold", heading: "font-semibold", label: "font-medium", body: "font-normal" },
    lineHeight: { heading: "leading-snug", body: "leading-relaxed", caption: "leading-normal" },
    maxLineLength: { prose: "max-w-2xl", heading: "max-w-2xl" },
    letterSpacing: { eyebrow: "tracking-[0.22em]", heading: "tracking-normal", body: "tracking-normal" },
  },
};

export function getTypographyProfile(family: DesignFamilyId): TypographyProfile {
  return TYPOGRAPHY_PROFILES[family];
}

export function renderTypographyRulesPrompt(family: DesignFamilyId): string {
  const t = TYPOGRAPHY_PROFILES[family];
  return `=== TYPOGRAPHY RULES (${family}) ===
Hero headline: ${t.scale.hero} ${t.weights.display} font-heading ${t.lineHeight.heading} ${t.letterSpacing.heading}
Section headings: ${t.scale.sectionHeading} ${t.weights.heading} font-heading ${t.lineHeight.heading}
Subheadings: ${t.scale.subheading} ${t.weights.label} font-body
Body text: ${t.scale.body} ${t.weights.body} font-body ${t.lineHeight.body} ${t.maxLineLength.prose}
Captions/labels: ${t.scale.caption} font-body ${t.lineHeight.caption}
Eyebrows: ${t.scale.eyebrow} uppercase ${t.letterSpacing.eyebrow} text-primary font-medium
Heading max-width: ${t.maxLineLength.heading}
RULE: Weight hierarchy must step down — display > heading > label > body. Never use font-bold on body text.
RULE: Line height must differ — headings tight/snug, body relaxed/normal. Never use the same leading everywhere.
=== END TYPOGRAPHY RULES ===`;
}
