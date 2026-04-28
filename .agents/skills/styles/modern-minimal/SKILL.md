---
name: modern-minimal
id: modern_minimal
type: style
description: Clean product-grade interface language with restrained neutrals, crisp hierarchy, sharp spacing, and low-noise components.
keywords: [minimal, clean, modern, saas, software, product, app, launch, startup, tech, platform, dashboard, analytics, api, developer, cloud, automation, workspace, productivity, tool, interface]
niche_affinity: [saas, agency, portfolio, realEstate, law]
---

# Modern Minimal — Style Skill

## Identity

Clean product-grade interface language with restrained neutrals, crisp hierarchy, sharp spacing, and low-noise components.

## Typography System

- Display: Inter with tight leading and medium-heavy weight
- Body: Inter with compact paragraphs and data-like labels
- Font heading: `"Inter", system-ui, sans-serif`
- Font body: `"Inter", system-ui, sans-serif`

### Type Scale
- Hero headline: text-4xl sm:text-5xl md:text-6xl font-bold font-heading leading-tight tracking-tight
- Section headings: text-2xl sm:text-3xl font-semibold font-heading leading-tight
- Subheadings: text-lg font-medium font-body
- Body text: text-base font-normal font-body leading-normal max-w-xl
- Captions/labels: text-sm font-body leading-normal
- Eyebrows: text-xs uppercase tracking-[0.22em] text-primary font-medium

### Weight Hierarchy
Display bold → heading semibold → label medium → body normal. Never use font-bold on body text. Line height must differ — headings tight, body normal.

## Color System

- Mode: light
- Neutral white or charcoal backgrounds, crisp text contrast, cool accent, subtle surface shifts

### Color Philosophy
This style uses restraint as its primary tool. The background is almost-white, text is almost-black, and a single accent color provides all the energy. The accent should feel sharp and intentional, not decorative. Every use of color must serve hierarchy or interaction.

### Palette Directions — PICK ONE per project, do not default to A every time
- **Direction A (Cool Blue)**: `--primary: 224 76% 54%` — classic SaaS blue, crisp and trustworthy
- **Direction B (Deep Indigo)**: `--primary: 243 75% 59%` — more personality, works for AI/creative tools
- **Direction C (Teal Focus)**: `--primary: 172 66% 40%` — fresh and modern, works for health/productivity
- **Direction D (Violet Edge)**: `--primary: 262 83% 58%` — bold but refined, works for design/creative tools

Choose the direction that best matches the brief's tone. Adjust `--ring`, `--accent`, and `--accent-foreground` to match.

### CSS Theme Variables (Direction A — adapt --primary for B/C/D)
```css
:root {
  --background: 0 0% 99%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --primary: 224 76% 54%;
  --primary-foreground: 210 40% 98%;
  --secondary: 220 20% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 220 20% 96%;
  --muted-foreground: 220 9% 42%;
  --accent: 214 78% 96%;
  --accent-foreground: 224 76% 36%;
  --border: 220 14% 90%;
  --input: 220 14% 90%;
  --ring: 224 76% 54%;
  --radius: 1rem;
  --font-heading: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --gradient-hero: linear-gradient(135deg, hsl(0 0% 100%), hsl(220 30% 98%) 58%, hsl(224 76% 54% / 0.12));
  --gradient-surface: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 20% 97%) 100%);
  --shadow-soft: 0 16px 38px -30px rgb(15 23 42 / 0.14);
  --shadow-card: 0 16px 42px -28px rgb(15 23 42 / 0.12);
  --shadow-card-hover: 0 22px 50px -26px rgb(15 23 42 / 0.18);
}
body {
  background-image:
    linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 23% 98%) 100%);
}
```

### Anti-Patterns — DO NOT produce these
- No gradient blob heroes (blur-2xl/3xl + gradient-mesh background with floating orbs)
- No "SaaS starter kit" layout: centered hero → 3-card features → centered testimonials → centered CTA
- No all-white page with zero surface shifts
- No hero that is just headline + subtitle + button with no product visual or support structure
- No identical card shells repeated across features, testimonials, and pricing

### CSS Utilities
```css
.surface-card {
  border-color: hsl(var(--border));
  background-image: linear-gradient(180deg, hsl(var(--card)), hsl(var(--secondary) / 0.78));
}
.surface-panel {
  background: hsl(var(--card) / 0.86);
  border: 1px solid hsl(var(--border));
}
.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.22em;
}
.family-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(var(--border)), transparent);
}
.family-grid {
  background-image:
    linear-gradient(hsl(var(--border) / 0.35) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--border) / 0.35) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

### Surface Shift Patterns
Pick one and apply consistently across sections:
- Option 1: bg-background → bg-secondary → bg-background → bg-card → bg-accent (white → light gray → white → card → accent blue tint)
- Option 2: bg-background → bg-card → bg-secondary → bg-background → bg-accent (white → card → secondary → white → accent for structure)

### Accent Usage
Primary blue for CTAs, active states, and links. Accent for highlight surfaces. Never heavy.

### Contrast Rule
Dark text on light backgrounds. Muted foreground for secondary. Crisp contrast always.

## Spacing Rhythm

- Density: standard
- Tight and systematic. Sections use clean rhythm, consistent containers, and deliberate whitespace instead of ornament.

### Section Padding
- navbar: py-3
- hero: py-20 md:py-28
- story: py-16 md:py-24
- services: py-16 md:py-20
- gallery: py-12 md:py-16
- proof: py-12 md:py-16
- cta: py-16 md:py-24
- footer: py-8 md:py-12

### Internal Gaps
tight gap-2 | standard gap-4 | generous gap-8

### Container Widths
full max-w-7xl | content max-w-5xl | prose max-w-xl

## Border and Radius

Crisp lines, controlled medium radius, sharp panels, product-shell framing.

## Shadows

Low, precise elevation. No glow stacks.

## CTA Style

Buttons are dense, crisp, and product-like with strong contrast and direct labels.
CTA surface: bg-primary text-primary-foreground for main CTA. bg-card with border for form surfaces.

## Imagery

Framed UI or documentary imagery with simple chrome, clean aspect ratios, restrained overlays, and utility-first support blocks.

## Motifs

Grid texture, status dots, clean stat rails, subtle panel strokes, sharp footer closure.

## Section Archetypes

For each section role, use one of these archetypes:

- **Navbar**: clean product nav with left brand, centered utility links, right primary Button | minimal nav with slim border, dense links, status chip, and right CTA
- **Hero**: left-copy right-visual split with product frame and stat strip | centered launch statement with supporting product rail and customer proof row
- **Story**: single-column manifesto with offset support card | two-column proof narrative with stat rail and compact media panel
- **Services**: non-uniform capability bands with alternating density | split feature stack with one dominant capability panel and two support rows
- **Gallery**: product or proof rail with one large frame and smaller detail stack | clean screenshot wall with caption rail and varied spans
- **Proof**: editorial quote band with logo strip | horizontal proof rail with one anchor quote and supporting metrics
- **CTA**: split conversion panel with left value copy and right compact form | product-anchored signup shell with bordered inset panel
- **Footer**: tight product footer with status badge, update field, and lean links | minimal footer with closing line, compact utilities, and one signal panel

## Motion

- Personality: crisp and functional — fast, purposeful transitions with no decoration
- Easing: enter cubic-bezier(0.23, 1, 0.32, 1) | exit cubic-bezier(0.55, 0, 1, 0.45) | hover ease-out
- Duration: button 120ms | reveal 400ms
- Button press: scale(0.97) on :active (120ms ease-out)
- Stagger delay: 40ms between items
- Hover scale: scale(1.01)
- Fast, purposeful animations — never exceed 300ms for UI elements
- Card hover: subtle shadow increase + 1px lift, no scale
- No decorative animation — every motion must serve a purpose
- Stagger list items at 40ms intervals for grid reveals

## Layout Density

- hero: density=standard, align=asymmetric, weight=balanced
- story: density=sparse, align=center, weight=text-heavy
- services: density=dense, align=left, weight=data-heavy
- gallery: density=standard, align=asymmetric, weight=image-heavy
- proof: density=sparse, align=left, weight=text-heavy
- cta: density=standard, align=asymmetric, weight=balanced

## Generation Steps

Follow these steps in exact order. Do not skip or reorder. Complete each step fully before starting the next.

### Step 1: Lock Typography Foundation
- Load Inter for both display and body
- Set display scale: text-4xl sm:text-5xl md:text-6xl font-bold
- Set section heading scale: text-2xl sm:text-3xl font-semibold
- Set body: text-base leading-normal
- Verify weight hierarchy steps down: bold → semibold → medium → normal

### Step 2: Set Color Foundation
- Pick ONE Palette Direction (A/B/C/D) from the Palette Directions section — match the brief's tone, do NOT default to A every time
- Apply light mode with the chosen direction's --primary value
- Update --ring, --accent, and --accent-foreground to complement the chosen primary
- Choose a surface shift pattern from the options above
- Assign accent usage: primary for CTAs, active states, links only
- Load the CSS theme variables into globals.css

### Step 3: Plan Section Choreography
- Map niche profile choreography to modern minimal archetypes
- Assign one archetype per section role
- Verify no two consecutive sections share the same layout signature
- Plan surface shifts across sections

### Step 4: Build Hero Section
- Use left-copy right-visual split or centered launch statement archetype
- Inter headline, direct and concise, text-4xl sm:text-5xl md:text-6xl
- Compact supporting paragraph, max-w-xl
- Crisp primary CTA button + stat strip or proof row as support block
- Clean product frame or documentary visual

### Step 5: Build Narrative/Story Section
- Use single-column manifesto or two-column proof narrative
- Different layout from hero
- Include stat rail or compact media support
- Clean, purposeful spacing

### Step 6: Build Services/Content Sections
- Use non-uniform capability bands or split feature stack
- One dominant capability with visual weight
- No uniform 3-card grid
- Dense, data-oriented structure where appropriate

### Step 7: Build Gallery/Proof Sections
- Gallery: product rail with one large frame + detail stack, or screenshot wall
- Proof: editorial quote band with logo strip, or horizontal proof rail
- Clean framing, simple chrome
- Different surfaces from adjacent sections

### Step 8: Build CTA Section
- Split conversion panel with value copy + compact form
- Product-anchored signup shell with bordered panel
- Crisp form inputs with visible focus rings
- Direct, action-oriented CTA label

### Step 9: Build Footer
- Tight product footer with status badge and lean links
- Include closing line and one signal/non-link element
- Sharp, minimal closure — not a utility strip
- Consistent with product-grade identity

### Step 10: Final Composition Verification
Before emitting, verify:
1. Inter is used throughout (font-heading and font-body)
2. Blue accent used for CTAs and interactive elements only
3. No two consecutive sections share the same layout
4. Surface shifts are visible (at least 2 different bg-* classes)
5. Section spacing varies (at least 3 different py-N values)
6. Imagery has clean product-grade framing
7. Weight hierarchy is consistent: display → heading → label → body
8. The page feels like a designed product surface, not a template
