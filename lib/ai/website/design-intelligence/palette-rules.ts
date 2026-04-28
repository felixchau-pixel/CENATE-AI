/**
 * Palette rules distilled from:
 * - nextlevelbuilder/ui-ux-pro-max (semantic tokens, contrast 4.5:1, dark mode pairing)
 * - nextlevelbuilder/ui-styling (CSS variable system, theme customization)
 *
 * Surface shift patterns and token enforcement per family.
 */

import type { DesignFamilyId } from "../design-families";

export type SurfaceShiftPattern = {
  /** Sequence of bg classes to alternate across sections */
  sequence: string[];
  /** Description of the pattern */
  description: string;
};

export type PaletteProfile = {
  mode: "light" | "dark";
  surfaceShifts: SurfaceShiftPattern[];
  accentUsage: string;
  contrastRule: string;
  ctaSurface: string;
};

const PALETTE_PROFILES: Record<DesignFamilyId, PaletteProfile> = {
  editorial_luxury: {
    mode: "dark",
    surfaceShifts: [
      {
        sequence: ["bg-background", "bg-card", "bg-muted", "bg-background", "bg-card"],
        description: "deep → warm card → muted stone → deep → warm card",
      },
      {
        sequence: ["bg-background", "bg-secondary", "bg-background", "bg-card", "bg-muted"],
        description: "deep → secondary → deep → card → muted for rhythm",
      },
    ],
    accentUsage: "Primary (brass/gold) for eyebrows, CTA borders, divider accents. Never as full section background.",
    contrastRule: "Ivory text on deep graphite. Muted foreground for secondary text. Primary for accent only.",
    ctaSurface: "bg-primary text-primary-foreground or bordered panel with bg-card and primary border accent",
  },
  modern_minimal: {
    mode: "light",
    surfaceShifts: [
      {
        sequence: ["bg-background", "bg-secondary", "bg-background", "bg-card", "bg-accent"],
        description: "white → light gray → white → card → accent blue tint",
      },
      {
        sequence: ["bg-background", "bg-card", "bg-secondary", "bg-background", "bg-accent"],
        description: "white → card → secondary → white → accent for structure",
      },
    ],
    accentUsage: "Primary blue for CTAs, active states, and links. Accent for highlight surfaces. Never heavy.",
    contrastRule: "Dark text on light backgrounds. Muted foreground for secondary. Crisp contrast always.",
    ctaSurface: "bg-primary text-primary-foreground for main CTA. bg-card with border for form surfaces.",
  },
  bold_commercial: {
    mode: "dark",
    surfaceShifts: [
      {
        sequence: ["bg-background", "bg-card", "bg-secondary", "bg-background", "bg-card"],
        description: "dark charcoal → card → secondary → charcoal → card",
      },
      {
        sequence: ["bg-background", "bg-secondary", "bg-card", "bg-background", "bg-muted"],
        description: "dark → secondary band → card → dark → muted for proof",
      },
    ],
    accentUsage: "Primary amber/orange for CTAs, stats, and metric highlights. Accent for secondary actions.",
    contrastRule: "Light text on dark backgrounds. Primary for high-energy accent. Strong contrast for sales impact.",
    ctaSurface: "bg-primary text-primary-foreground for aggressive CTA. Large buttons with strong contrast.",
  },
  warm_artisan: {
    mode: "light",
    surfaceShifts: [
      {
        sequence: ["bg-background", "bg-card", "bg-secondary", "bg-background", "bg-card"],
        description: "cream → warm card → secondary → cream → card",
      },
      {
        sequence: ["bg-background", "bg-muted", "bg-background", "bg-card", "bg-secondary"],
        description: "cream → muted → cream → card → secondary for warmth",
      },
    ],
    accentUsage: "Primary terracotta for CTAs and section accents. Accent olive for supporting elements.",
    contrastRule: "Dark text on warm light backgrounds. Primary for warm accent. Subtle, never harsh.",
    ctaSurface: "bg-primary text-primary-foreground for warm CTA. Soft bordered panel for contact forms.",
  },
};

export function getPaletteProfile(family: DesignFamilyId): PaletteProfile {
  return PALETTE_PROFILES[family];
}

export function renderPaletteRulesPrompt(family: DesignFamilyId): string {
  const p = PALETTE_PROFILES[family];
  const shifts = p.surfaceShifts
    .map((s, i) => `  Option ${i + 1}: ${s.sequence.join(" → ")}\n    (${s.description})`)
    .join("\n");

  return `=== PALETTE & SURFACE RULES (${family}, ${p.mode} mode) ===
Surface shift patterns (pick one and apply consistently):
${shifts}
Accent usage: ${p.accentUsage}
Contrast: ${p.contrastRule}
CTA surface: ${p.ctaSurface}
RULES:
  • ALL colors must use semantic tokens: bg-background, bg-card, bg-muted, bg-secondary, bg-accent, bg-primary
  • ALL text must use: text-foreground, text-muted-foreground, text-card-foreground, text-primary
  • NO raw hex colors (#fff, #000, #334155) in className props
  • NO arbitrary rgb() or hsl() in className props — use the CSS variable system
  • Surface shifts must be VISIBLE — at least 2 sections must differ from bg-background
  • CTA section must have a distinct surface (different from content sections)
  • Contrast minimum: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
=== END PALETTE RULES ===`;
}
