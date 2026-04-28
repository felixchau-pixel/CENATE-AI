/**
 * Motion rules distilled from:
 * - emilkowalski/skill (animation decision framework, easing, duration tables, spring principles)
 * - nextlevelbuilder/ui-ux-pro-max (animation 150-300ms, ease-out, prefers-reduced-motion)
 *
 * Per-family motion profiles with specific easing curves and duration tables.
 */

import type { DesignFamilyId } from "../design-families";

export type MotionProfile = {
  personality: string;
  easing: { enter: string; exit: string; hover: string; inView: string };
  duration: { button: string; tooltip: string; dropdown: string; modal: string; reveal: string };
  buttonPress: string;
  staggerDelay: string;
  hoverScale: string;
  rules: string[];
};

const MOTION_PROFILES: Record<DesignFamilyId, MotionProfile> = {
  editorial_luxury: {
    personality: "restrained and deliberate — slow, confident reveals with editorial precision",
    easing: {
      enter: "cubic-bezier(0.23, 1, 0.32, 1)",
      exit: "cubic-bezier(0.55, 0, 1, 0.45)",
      hover: "ease",
      inView: "cubic-bezier(0.77, 0, 0.175, 1)",
    },
    duration: { button: "160ms", tooltip: "150ms", dropdown: "200ms", modal: "350ms", reveal: "600ms" },
    buttonPress: "scale(0.97)",
    staggerDelay: "60ms",
    hoverScale: "scale(1.02)",
    rules: [
      "Use slow, confident entrance animations (500-700ms) for editorial sections",
      "Stagger gallery images with 60ms delay between items",
      "Hover effects should be subtle: opacity shift or soft scale, never bouncy",
      "No bounce, no elastic — motion is precise and measured",
      "Parallax is allowed but must be subtle (max 20px offset)",
    ],
  },
  modern_minimal: {
    personality: "crisp and functional — fast, purposeful transitions with no decoration",
    easing: {
      enter: "cubic-bezier(0.23, 1, 0.32, 1)",
      exit: "cubic-bezier(0.55, 0, 1, 0.45)",
      hover: "ease-out",
      inView: "cubic-bezier(0.23, 1, 0.32, 1)",
    },
    duration: { button: "120ms", tooltip: "125ms", dropdown: "150ms", modal: "250ms", reveal: "400ms" },
    buttonPress: "scale(0.97)",
    staggerDelay: "40ms",
    hoverScale: "scale(1.01)",
    rules: [
      "Fast, purposeful animations — never exceed 300ms for UI elements",
      "Button press feedback must be immediate (120ms ease-out)",
      "Card hover: subtle shadow increase + 1px lift, no scale",
      "No decorative animation — every motion must serve a purpose",
      "Stagger list items at 40ms intervals for grid reveals",
    ],
  },
  bold_commercial: {
    personality: "assertive and energetic — punchy reveals with strong directional movement",
    easing: {
      enter: "cubic-bezier(0.16, 1, 0.3, 1)",
      exit: "cubic-bezier(0.55, 0, 1, 0.45)",
      hover: "ease-out",
      inView: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
    duration: { button: "140ms", tooltip: "125ms", dropdown: "180ms", modal: "300ms", reveal: "500ms" },
    buttonPress: "scale(0.95)",
    staggerDelay: "50ms",
    hoverScale: "scale(1.03)",
    rules: [
      "Aggressive enter animations with strong ease-out (fast start, smooth settle)",
      "Button press scale is deeper (0.95) for assertive feedback",
      "Stats and numbers can use count-up animation on scroll-into-view",
      "Card hover: lift + shadow increase with 3% scale",
      "Section reveals can use translateY(20px) → 0 with 500ms ease-out",
    ],
  },
  warm_artisan: {
    personality: "gentle and organic — soft fades and subtle movements that feel handcrafted",
    easing: {
      enter: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      exit: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      hover: "ease",
      inView: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    },
    duration: { button: "160ms", tooltip: "150ms", dropdown: "200ms", modal: "350ms", reveal: "600ms" },
    buttonPress: "scale(0.97)",
    staggerDelay: "70ms",
    hoverScale: "scale(1.02)",
    rules: [
      "Soft, organic reveals using opacity + subtle translateY(12px)",
      "Gallery images fade in with 70ms stagger — feels like a gentle cascade",
      "Hover effects: warm opacity shifts, never sharp scale changes",
      "No aggressive motion — everything should feel unhurried and intentional",
      "Section transitions use longer durations (500-700ms) for a relaxed pace",
    ],
  },
};

export function getMotionProfile(family: DesignFamilyId): MotionProfile {
  return MOTION_PROFILES[family];
}

export function renderMotionRulesPrompt(family: DesignFamilyId): string {
  const m = MOTION_PROFILES[family];
  const rules = m.rules.map((r) => `  • ${r}`).join("\n");

  return `=== MOTION RULES (${family}) ===
Personality: ${m.personality}
Easing: enter ${m.easing.enter} | exit ${m.easing.exit} | hover ${m.easing.hover}
Duration: button ${m.duration.button} | tooltip ${m.duration.tooltip} | dropdown ${m.duration.dropdown} | modal ${m.duration.modal} | reveal ${m.duration.reveal}
Button press: transform: ${m.buttonPress} on :active (transition: transform ${m.duration.button} ease-out)
Hover scale: ${m.hoverScale} for interactive cards
Stagger delay: ${m.staggerDelay} between items in lists/grids
Family-specific:
${rules}
HARD MOTION RULES (all families):
  • NEVER use ease-in for UI animations — it feels sluggish
  • NEVER animate from scale(0) — start from scale(0.95) with opacity: 0
  • NEVER exceed 300ms for micro-interactions (buttons, tooltips, dropdowns)
  • ALWAYS add transform: ${m.buttonPress} on :active to Button components
  • ALWAYS respect prefers-reduced-motion — remove transform animations, keep opacity
  • ALWAYS specify exact properties in transitions — never use 'transition: all'
  • Only animate transform and opacity — never animate width, height, padding, margin
=== END MOTION RULES ===`;
}
