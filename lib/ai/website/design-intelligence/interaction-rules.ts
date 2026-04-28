/**
 * Interaction rules distilled from:
 * - emilkowalski/skill (button press feedback, hover states, focus, origin-aware popovers)
 * - nextlevelbuilder/ui-ux-pro-max (touch targets, accessibility, keyboard nav, focus rings)
 *
 * Compact interaction patterns applied to all generated components.
 */

import type { DesignFamilyId } from "../design-families";

export type InteractionRules = {
  buttonPress: string;
  focusRing: string;
  hoverGate: string;
  reducedMotion: string;
  touchTarget: string;
  inputHeight: string;
  cursorPointer: string;
  disabledOpacity: string;
};

const INTERACTION_DEFAULTS: InteractionRules = {
  buttonPress: "active:scale-[0.97] transition-transform duration-150 ease-out",
  focusRing: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  hoverGate: "@media (hover: hover) and (pointer: fine) — gate hover effects behind this query",
  reducedMotion: "@media (prefers-reduced-motion: reduce) — remove transform animations, keep opacity",
  touchTarget: "min-h-[44px] min-w-[44px] — minimum 44×44px for all interactive elements",
  inputHeight: "h-11 — minimum 44px for all form inputs on mobile",
  cursorPointer: "cursor-pointer — on all clickable non-button elements",
  disabledOpacity: "opacity-50 cursor-not-allowed pointer-events-none",
};

export function getInteractionRules(): InteractionRules {
  return INTERACTION_DEFAULTS;
}

export function renderInteractionRulesPrompt(_family: DesignFamilyId): string {
  const r = INTERACTION_DEFAULTS;
  return `=== INTERACTION RULES ===
BUTTON PRESS: All Button components must have ${r.buttonPress}
FOCUS: All interactive elements must have ${r.focusRing}
HOVER: ${r.hoverGate}
REDUCED MOTION: ${r.reducedMotion}
TOUCH TARGETS: ${r.touchTarget}
FORM INPUTS: ${r.inputHeight}
CLICKABLE: ${r.cursorPointer}
DISABLED: ${r.disabledOpacity}

INTERACTION PATTERNS (from design engineering craft):
  • Buttons: scale(0.97) on :active, never scale(0) entry
  • Cards: subtle shadow-increase + 1-2% scale on hover, transition 200ms ease-out
  • Links in nav: opacity or underline transition, not color flash
  • Accordion: smooth height transition with overflow-hidden
  • Inputs: visible focus ring (2px ring-ring), not just outline
  • Images: subtle scale(1.03) on hover within overflow-hidden container
  • One primary CTA per screen — secondary actions use outline or ghost variant

ACCESSIBILITY FLOOR:
  • Color contrast: minimum 4.5:1 for text, 3:1 for large text
  • Alt text on all meaningful images
  • aria-label on icon-only buttons
  • Keyboard navigation: tab order matches visual order
  • No reliance on hover-only interactions — everything must work with tap
  • Skip links for keyboard users (included in scaffold)
  • Heading hierarchy: sequential h1→h6, no level skip
=== END INTERACTION RULES ===`;
}
