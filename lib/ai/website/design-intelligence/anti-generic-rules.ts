/**
 * Anti-generic rules distilled from:
 * - nextlevelbuilder/ui-ux-pro-max (style matching, pattern detection, landing page patterns)
 * - emilkowalski/skill (craft philosophy, "unseen details compound")
 * - All three skills' emphasis on avoiding template-quality output
 *
 * Pattern detection rules used by critic and prompt builder.
 */

/** Patterns that indicate "template" quality, not "designed" quality */
export const GENERIC_PATTERNS = [
  {
    id: "features-trifecta",
    description: "Three identical cards in a row with icon + title + description",
    detection: "3 cards in grid-cols-3 with identical structure: icon/svg → heading → paragraph",
    fix: "Use asymmetric layout: one featured card larger, others as compact list or split layout",
  },
  {
    id: "hero-card-grid",
    description: "Hero followed immediately by a 3-card feature grid",
    detection: "First body section after hero is grid-cols-3 with rounded card shells",
    fix: "Insert a narrative, manifesto, or split section between hero and any card grid",
  },
  {
    id: "centered-everything",
    description: "Every section opens with centered eyebrow + centered heading + centered paragraph",
    detection: "3+ sections all use text-center with no text-left variant",
    fix: "At least 2 sections must use left-aligned or asymmetric opening",
  },
  {
    id: "uniform-cards",
    description: "Same card shell repeated across 3+ sections (same bg, border, radius, padding)",
    detection: "3+ sections each contain 3+ elements with same rounded-xl border bg-card pattern",
    fix: "Vary card treatments: different bg, different padding, different structure per section",
  },
  {
    id: "flat-spacing",
    description: "All sections use the same py-N padding value",
    detection: "Only 1 unique py-N value across all section components",
    fix: "Use different py-N per section purpose: hero generous, content standard, accent tight",
  },
  {
    id: "identical-buttons",
    description: "All buttons on the page use the same variant and size",
    detection: "4+ Button components, none use variant= prop",
    fix: "Vary: primary for main CTA, outline for secondary, ghost for tertiary, link for nav",
  },
  {
    id: "no-surface-variation",
    description: "All sections on the same flat background with no visual separation",
    detection: "Only 1 unique bg-* class across all section components",
    fix: "Alternate backgrounds: bg-background → bg-card → bg-muted → bg-secondary",
  },
  {
    id: "gradient-soup",
    description: "Premium feel from gradient meshes, blurred blobs, glow rings, pulse dots",
    detection: "3+ blur-xl, gradient-mesh, pulse, glow patterns as primary visual treatment",
    fix: "Premium from structure: typography hierarchy, density shifts, asymmetric composition, real media",
  },
  {
    id: "saas-pricing-three-cards",
    description: "Pricing as three uniform equal cards in md:grid-cols-3",
    detection: "Pricing section with grid-cols-3 and 3+ equal rounded card shells",
    fix: "Use comparison table, 2+1 asymmetric highlight, single-plan hero, or tier ladder",
  },
  {
    id: "link-sitemap-footer",
    description: "Four-column link-only sitemap footer with just nav links and copyright",
    detection: "Footer with grid-cols-4 and 8+ anchor links, no brand element or non-link content",
    fix: "Add brand closure, contact info, and at least one non-link element",
  },
  {
    id: "weak-hero",
    description: "Hero with only headline + paragraph + button (no support block)",
    detection: "Hero lacks stats row, trust badges, credential rail, or structured media",
    fix: "Add support block: stats row (3-4 items), trust badges, credential strip, or media panel",
  },
  {
    id: "flat-hierarchy",
    description: "All headings the same size across sections",
    detection: "Only 1 unique text-*xl size class used for headings across sections",
    fix: "Hero text-5xl/6xl → sections text-3xl/4xl → subsections text-xl/2xl → body text-base",
  },
] as const;

export type GenericPatternId = typeof GENERIC_PATTERNS[number]["id"];

export function renderAntiGenericRulesPrompt(): string {
  const patterns = GENERIC_PATTERNS.map(
    (p) => `  ✗ ${p.id}: ${p.description}\n    → Fix: ${p.fix}`
  ).join("\n");

  return `=== ANTI-GENERIC RULES ===
These patterns indicate template quality. The critic detects and rejects them.

${patterns}

QUALITY SIGNALS (aim for these instead):
  ✓ At least one editorial or asymmetric section
  ✓ Spacing density varies by section purpose
  ✓ Typography creates clear visual rhythm (display → heading → body → caption)
  ✓ Images have different crops, sizes, and framing treatments
  ✓ CTA surfaces feel structurally different from content surfaces
  ✓ Button variants vary across the page (primary, outline, ghost)
  ✓ The page has clear beginning (hero), middle (content), and end (CTA + footer) rhythm
  ✓ At least one section deliberately breaks the dominant page pattern
=== END ANTI-GENERIC RULES ===`;
}
