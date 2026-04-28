/**
 * Design review rules — checklist used by critic and final design pass.
 *
 * Distilled from:
 * - emilkowalski/skill (review checklist, before/after patterns)
 * - nextlevelbuilder/ui-ux-pro-max (priority rules, quality checks)
 * - nextlevelbuilder/ui-styling (component composition, theming)
 *
 * Each rule maps to a critic detector or a design pass correction.
 */

export type ReviewRule = {
  id: string;
  category: "spacing" | "typography" | "composition" | "interaction" | "identity" | "primitive";
  severity: "hard" | "soft";
  check: string;
  fix: string;
};

export const DESIGN_REVIEW_RULES: ReviewRule[] = [
  // Spacing
  {
    id: "varied-section-padding",
    category: "spacing",
    severity: "hard",
    check: "Sections use at least 3 different py-N values",
    fix: "Assign per-role spacing: hero py-24+, content py-16-24, accent py-12-16, CTA py-20-28",
  },
  {
    id: "prose-width-control",
    category: "spacing",
    severity: "soft",
    check: "Body text paragraphs use max-w-2xl or max-w-3xl",
    fix: "Add max-w-2xl to paragraph containers for readable line length (60-75 chars)",
  },
  {
    id: "card-gap-minimum",
    category: "spacing",
    severity: "soft",
    check: "Card grids use gap-6 or larger",
    fix: "Replace gap-2, gap-3, gap-4 on card grids with gap-6 minimum",
  },

  // Typography
  {
    id: "heading-size-hierarchy",
    category: "typography",
    severity: "hard",
    check: "Hero headline is largest, section headings step down, no two levels share same size",
    fix: "Hero text-5xl/6xl → sections text-3xl/4xl → sub text-xl/2xl",
  },
  {
    id: "font-family-tokens",
    category: "typography",
    severity: "hard",
    check: "Headings use font-heading, body uses font-body, no raw font-serif/font-sans",
    fix: "Replace font-serif with font-heading, font-sans with font-body",
  },
  {
    id: "weight-hierarchy",
    category: "typography",
    severity: "soft",
    check: "Font weights step down: display bold/semibold → headings semibold → labels medium → body normal",
    fix: "Use font-bold on hero, font-semibold on sections, font-medium on labels, font-normal on body",
  },
  {
    id: "no-oversized-text",
    category: "typography",
    severity: "hard",
    check: "No text-8xl or text-9xl anywhere on page",
    fix: "Clamp to text-6xl maximum for multi-word headlines, text-7xl only for single-word display",
  },

  // Composition
  {
    id: "no-adjacent-same-layout",
    category: "composition",
    severity: "hard",
    check: "No two consecutive body sections share the same layout signature",
    fix: "Restructure one section to use a different layout type",
  },
  {
    id: "surface-shifts",
    category: "composition",
    severity: "hard",
    check: "At least 2 visible surface shifts (different bg-* classes) across sections",
    fix: "Alternate bg-background, bg-card, bg-muted, bg-secondary across sections",
  },
  {
    id: "rhythm-break",
    category: "composition",
    severity: "soft",
    check: "At least one section deliberately breaks page rhythm (asymmetry, alignment change)",
    fix: "Add one section with different alignment model or density from the dominant pattern",
  },
  {
    id: "max-one-card-grid",
    category: "composition",
    severity: "hard",
    check: "At most one uniform card grid (3+ cards in grid-cols-3) per page",
    fix: "Replace additional card grids with editorial list, split layout, or asymmetric blocks",
  },

  // Identity
  {
    id: "section-identity",
    category: "identity",
    severity: "hard",
    check: "Adjacent sections differ in at least 3 of: alignment, density, weight, surface, composition",
    fix: "Change one section's alignment, background, or structure to create visual distinction",
  },
  {
    id: "cta-visual-distinction",
    category: "identity",
    severity: "hard",
    check: "CTA section has a distinct surface from surrounding content sections",
    fix: "Add bg-card, bg-primary/10, or a bordered panel to make CTA stand out",
  },

  // Interaction
  {
    id: "button-variant-diversity",
    category: "interaction",
    severity: "soft",
    check: "Page uses at least 2 different Button variants (primary, outline, ghost)",
    fix: "Use variant='outline' for secondary CTAs, variant='ghost' for tertiary actions",
  },
  {
    id: "button-press-feedback",
    category: "interaction",
    severity: "soft",
    check: "Interactive elements have active/hover state transitions",
    fix: "Add active:scale-[0.97] transition-transform to clickable elements",
  },

  // Primitive
  {
    id: "section-container-heading",
    category: "primitive",
    severity: "hard",
    check: "All body sections import and use Section, Container, Heading from @/components/ui/",
    fix: "Wrap section content in <Section><Container>...</Container></Section>, use <Heading> for titles",
  },
  {
    id: "button-for-ctas",
    category: "primitive",
    severity: "hard",
    check: "All primary CTAs use Button component, not raw styled anchors/buttons",
    fix: "Import Button from @/components/ui/button and use <Button> for all CTA actions",
  },
  {
    id: "mobile-nav",
    category: "primitive",
    severity: "hard",
    check: "Navbar imports MobileNav for responsive mobile menu",
    fix: "Import MobileNav from @/components/ui/mobile-nav, no custom hamburger state",
  },
];

export function renderDesignReviewPrompt(): string {
  const grouped: Record<string, ReviewRule[]> = {};
  for (const rule of DESIGN_REVIEW_RULES) {
    (grouped[rule.category] ??= []).push(rule);
  }

  const sections = Object.entries(grouped)
    .map(([cat, rules]) => {
      const lines = rules
        .map((r) => `  [${r.severity}] ${r.check}`)
        .join("\n");
      return `${cat.toUpperCase()}:\n${lines}`;
    })
    .join("\n\n");

  return `=== DESIGN REVIEW CHECKLIST ===
Before finalizing, verify every rule. Hard rules cause critic rejection.

${sections}

This checklist is enforced by the critic and the design pass. Violations trigger repair.
=== END DESIGN REVIEW ===`;
}
