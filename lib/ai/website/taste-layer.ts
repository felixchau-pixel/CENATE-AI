/**
 * Composition quality bar — the single visual quality floor.
 *
 * This is a prompt-level constant injected into the generation system.
 * Rules here are the floor. They focus on COHERENCE over ambition.
 * When this layer conflicts with the niche profile, the niche profile wins.
 */

export const IMPECCABLE_TASTE_LAYER = `=== COMPOSITION QUALITY BAR ===

These rules define the minimum visual quality standard. They are the floor, not the ceiling. Every section must meet these constraints.

─── LAYOUT DIVERSITY (HARD) ───

Every page must use AT LEAST 4 distinct layout signatures from this vocabulary:
  • split — two-column with text and media (lg:grid-cols-2)
  • split-reversed — same as split but image/content sides flipped
  • grid — multi-column card or feature grid (grid-cols-3 or grid-cols-4)
  • centered-stack — single column, centered text with supporting element
  • timeline — vertical or horizontal step sequence with border markers
  • stats-band — horizontal metrics row with large numbers
  • gallery — asymmetric or masonry image layout
  • quote-band — large editorial pull-quote with attribution
  • table — comparison or pricing table with rows and columns
  • editorial-list — ruled list with name + description + detail (like a menu)
  • manifesto — single-column typographic statement block

HARD RULE: No layout signature may repeat more than ONCE across all body sections.
HARD RULE: No two consecutive sections may share the same layout signature.
HARD RULE: At least ONE section must deliberately break the page rhythm with asymmetry, surface shift, or alignment change.

─── HERO STRUCTURE (HARD) ───

Every hero MUST include ALL of these:
  1. Headline — text-4xl sm:text-5xl md:text-6xl max. NEVER text-7xl+ for multi-word headlines.
  2. Supporting paragraph — 1-3 sentences, text-lg or text-xl, max-w-xl or max-w-2xl.
  3. Primary CTA — using Button component, not a raw styled element.
  4. Support block — exactly ONE of: stats row (3-4 items), trust badges, credential rail, feature bullets, or secondary media panel.

A hero with only headline + paragraph + button is INCOMPLETE. The support block is what separates "template" from "designed."

Allowed hero compositions:
  • Split: text left, media right (or reversed), with support block below headline
  • Immersive: full-bleed background with structured overlay panel + support rail
  • Editorial: large typography statement with offset media frame and credential strip

BANNED hero patterns:
  • Small centered text floating on a busy photo with no framing
  • Generic gradient background with centered headline and two buttons
  • Blurred photo inside a gradient card with a pulse dot

─── SECTION SPACING (HARD) ───

Sections must use VARIED vertical padding based on purpose:
  • Hero: py-20 to py-32 (generous breathing room)
  • Content sections: py-16 to py-24 (standard)
  • Accent/stats bands: py-12 to py-16 (tighter)
  • CTA sections: py-20 to py-28 (elevated importance)
  • Footer: py-12 to py-20

HARD RULE: All sections using the same py-N value is a rhythm failure. At least 3 different spacing values must appear.

─── TYPOGRAPHY HIERARCHY (HARD) ───

Every page must show clear size separation:
  • Hero headline: text-4xl to text-6xl (largest on page)
  • Section headings: text-2xl to text-4xl (clear step down from hero)
  • Body text: text-base to text-lg with max-w-2xl or max-w-3xl for line-length control
  • Captions/labels: text-xs to text-sm, often uppercase tracking-wide
  • Eyebrows: text-xs uppercase tracking-[0.2em] in primary color

BANNED: text-8xl and text-9xl on all elements — they overflow viewports.
BANNED: All headings the same size across sections.

─── SURFACE VARIATION (HARD) ───

At least 2 visible surface shifts must appear on the page:
  • Dark/light alternation (e.g., bg-background → bg-card → bg-muted → bg-zinc-950)
  • Warm/cool alternation for artisan niches
  • Gradient surface shift for editorial niches

BANNED: All sections on the same flat background with no visual separation.

─── CTA / CONVERSION (HARD) ───

The CTA or contact section must:
  • Include a real form or real contact info (email, phone, address). Buttons alone are not enough.
  • Look structurally different from content sections (background shift, bordered panel, or split layout).
  • Use Button component for primary actions.

─── FOOTER (HARD) ───

The footer must include:
  • Brand identity (logo, wordmark, or closing statement)
  • Real contact info (address, email, phone, or equivalent)
  • At least one non-link element (newsletter signup, status badge, hours, etc.)

BANNED: Four-column link-only sitemap footer with just nav links and copyright.

─── STABILITY OVER AMBITION ───

A clean, stable, well-structured layout is always better than an ambitious but broken one.

Rules:
  • Do not add decorative floating elements or absolute-positioned ornaments unless they serve a clear structural purpose.
  • Every absolutely positioned element must be inside a relative parent with overflow-hidden.
  • Keep layouts grid-based and predictable. Asymmetry comes from column ratios and content weight, not from absolute positioning tricks.
  • Do not over-style. If a section works with simple, clean structure, leave it. Coherence beats novelty.

─── ANTI-GENERIC PATTERNS ───

These patterns indicate "template" quality, not "designed" quality. AVOID:
  • Three identical cards in a row with icon + title + description (the "features trifecta")
  • Hero followed immediately by a 3-card grid (the "landing page default")
  • Every section opening with centered eyebrow + centered heading + centered paragraph
  • All sections using the same card shell (same bg + border + radius + padding)
  • Buttons that all look the same — vary between primary, outline, ghost, and link variants
  • All images the same aspect ratio and size
  • No color accent variation — at least one section should use a contrasting surface

QUALITY SIGNALS (aim for these):
  • At least one section uses an editorial or asymmetric composition
  • Spacing density varies between sections (some tight, some generous)
  • Typography creates clear visual rhythm (display → heading → body → caption)
  • Images have different crops, sizes, and framing treatments
  • CTA surfaces feel different from content surfaces
  • The page has a clear beginning (hero), middle (content), and end (CTA + footer) rhythm

─── DESIGN SYSTEM BINDING (HARD) ───

All colors MUST use semantic design tokens from the injected CSS theme. No raw hex values. No arbitrary rgb().

REQUIRED token usage:
  • Backgrounds: bg-background, bg-card, bg-muted, bg-secondary, bg-accent (or hsl(var(--*)) equivalents)
  • Text: text-foreground, text-muted-foreground, text-card-foreground, text-primary (or hsl(var(--*)) equivalents)
  • Borders: border-border, border-input (or hsl(var(--border)) / hsl(var(--input)))
  • Accent: text-primary, bg-primary, border-primary for accent elements
  • Ring: ring-ring for focus states

REQUIRED font usage:
  • Headlines/headings: font-heading class (maps to var(--font-heading))
  • Body text: font-body class (maps to var(--font-body))
  • Do NOT use font-serif, font-sans, or font-mono directly — use the design family tokens

REQUIRED spacing scale:
  • Section padding: py-12 through py-32 (Tailwind scale only)
  • Internal spacing: gap-4, gap-6, gap-8 (consistent within a section)
  • Container max-width: max-w-7xl for full-width, max-w-5xl for content, max-w-2xl/max-w-3xl for prose

BANNED: Raw hex colors (#fff, #000, #334155), arbitrary rgb() values, font-serif/font-sans/font-mono overrides, spacing outside Tailwind scale.

─── SECTION IDENTITY (HARD) ───

Every section on the page must have a UNIQUE visual identity. Two sections that look the same are a generation failure.

Each section must differ from its neighbors in AT LEAST 3 of these 5 dimensions:
  1. ALIGNMENT — text-left vs text-center vs asymmetric
  2. DENSITY — tight (gap-3, py-12) vs spacious (gap-8, py-28)
  3. VISUAL WEIGHT — image-heavy vs text-heavy vs data-heavy
  4. SURFACE — different background treatment (bg-background vs bg-card vs bg-muted vs gradient)
  5. COMPOSITION — grid vs split vs centered-stack vs editorial-list vs timeline vs quote-band

HARD RULE: If two adjacent sections share the same alignment AND the same density AND the same surface, rebuild one of them.
HARD RULE: No card shell (same bg + border + radius + padding combo) may appear in more than 2 sections.
HARD RULE: Not every section may open with centered eyebrow + centered heading. At least 2 sections must use left-aligned or asymmetric openings.

─── IMAGE SYSTEM (HARD) ───

All site imagery MUST come from projectImages.* (imported from "@/assets/generated-images").

Image placement rules:
  • Hero: projectImages.hero as primary media surface
  • Story/about: projectImages.support or projectImages.detail1
  • Gallery: projectImages.gallery1, projectImages.gallery2, projectImages.gallery3
  • Other sections: projectImages.detail1 or projectImages.support as needed

Image treatment rules:
  • Every <img> must be wrapped in a container with explicit dimensions (aspect ratio, height, or grid framing)
  • Use className="h-full w-full object-cover" on all <img> tags
  • Wrap images in overflow-hidden rounded-[radius] containers for consistent framing
  • Never leave an image without aspect ratio control — this causes layout collapse

BANNED:
  • Unsplash URLs or any external image URL
  • <img> without a containing element with size control
  • Images without object-cover (causes distortion)
  • Sections with projectImages.* that don't import from "@/assets/generated-images"

=== END QUALITY BAR ===`;
