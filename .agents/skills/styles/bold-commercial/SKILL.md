---
name: bold-commercial
id: bold_commercial
type: style
description: High-contrast sales-driven identity with assertive typography, energetic density, strong CTA surfaces, and proof-heavy section transitions.
keywords: [construction, contractor, industrial, commercial, sales, fast, roi, performance, roofing, plumbing, hvac, trucking, fleet, logistics, manufacturing, concrete, demolition, excavation, paving, electric, solar, trade]
niche_affinity: [construction, fitness, saas]
---

# Bold Commercial — Style Skill

## Identity

High-contrast sales-driven identity with assertive typography, energetic density, strong CTA surfaces, and proof-heavy section transitions.

## Typography System

- Display: Bebas Neue or condensed sans treatment
- Body: Barlow for direct, high-legibility marketing copy
- Font heading: `"Bebas Neue", "Barlow", system-ui, sans-serif`
- Font body: `"Barlow", system-ui, sans-serif`

### Type Scale
- Hero headline: text-4xl sm:text-5xl md:text-6xl font-bold font-heading leading-none tracking-wide
- Section headings: text-2xl sm:text-3xl md:text-4xl font-bold font-heading leading-none
- Subheadings: text-lg sm:text-xl font-semibold font-body
- Body text: text-base sm:text-lg font-normal font-body leading-relaxed max-w-2xl
- Captions/labels: text-sm font-body leading-normal
- Eyebrows: text-xs uppercase tracking-[0.24em] text-primary font-medium

### Weight Hierarchy
Display bold → heading bold → label semibold → body normal. Headlines use uppercase treatment via CSS. Line height must differ — headings none/tight, body relaxed.

## Color System

- Mode: dark
- Charcoal base with strong action accent in amber, red, or electric. Secondary surfaces stay dense and contrast-heavy.

### Color Philosophy
This style uses contrast as energy. The page should feel like a sales pitch that means business — dark backgrounds give weight, the accent color demands attention. Every stat, metric, and CTA should pop. The accent is used generously compared to other styles: metric numbers, stat highlights, CTA buttons, and badge backgrounds.

### Palette Directions — PICK ONE per project
- **Direction A (Amber & Charcoal)**: `--primary: 28 94% 57%` — warm energy, works for construction/trades
- **Direction B (Electric Red & Dark Steel)**: `--primary: 4 90% 58%` — aggressive urgency, works for fitness/gym
- **Direction C (Neon Lime & Black)**: `--primary: 82 85% 48%` — high-tech energy, works for tech/fleet
- **Direction D (Hot Orange & Navy)**: `--primary: 16 92% 56%; --background: 220 30% 10%` — balanced power

### Anti-Patterns — DO NOT produce these
- No soft pastel accents — accent must be high-saturation and bold
- No delicate serif fonts — use condensed sans-serif (Bebas Neue) for impact
- No sparse layouts with too much whitespace — density creates urgency
- No hero without at least one metric/stat (years, projects, clients, etc.)
- No more than 5 body sections — keep it punchy, not exhaustive

### CSS Theme Variables
```css
:root {
  --background: 222 29% 8%;
  --foreground: 210 40% 98%;
  --card: 222 26% 12%;
  --card-foreground: 210 40% 98%;
  --primary: 28 94% 57%;
  --primary-foreground: 222 29% 8%;
  --secondary: 220 19% 18%;
  --secondary-foreground: 210 40% 98%;
  --muted: 220 19% 18%;
  --muted-foreground: 215 16% 70%;
  --accent: 18 86% 52%;
  --accent-foreground: 210 40% 98%;
  --border: 217 15% 24%;
  --input: 217 15% 24%;
  --ring: 28 94% 57%;
  --radius: 0.9rem;
  --font-heading: "Bebas Neue", "Barlow", system-ui, sans-serif;
  --font-body: "Barlow", system-ui, sans-serif;
  --gradient-hero: linear-gradient(125deg, hsl(222 29% 8%), hsl(222 24% 10%) 54%, hsl(28 94% 57% / 0.18));
  --gradient-surface: linear-gradient(180deg, hsl(222 26% 12%) 0%, hsl(222 29% 8%) 100%);
  --shadow-soft: 0 20px 52px -32px rgb(0 0 0 / 0.42);
  --shadow-card: 0 18px 48px -28px rgb(0 0 0 / 0.5);
  --shadow-card-hover: 0 26px 64px -28px rgb(0 0 0 / 0.66);
}
body {
  background-image:
    radial-gradient(circle at top right, hsl(var(--primary) / 0.12), transparent 22%),
    linear-gradient(180deg, hsl(222 29% 8%) 0%, hsl(222 31% 7%) 100%);
}
h1, h2, h3, h4 {
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
```

### CSS Utilities
```css
.surface-card {
  background-image: linear-gradient(180deg, hsl(var(--card)), hsl(222 24% 10%));
  border-color: hsl(var(--border));
}
.surface-panel {
  background: hsl(222 26% 11% / 0.9);
  border: 1px solid hsl(var(--border));
}
.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.24em;
}
.family-divider {
  height: 2px;
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
}
.family-band {
  background-image: linear-gradient(90deg, hsl(var(--primary) / 0.16), transparent 42%);
}
```

### Surface Shift Patterns
Pick one and apply consistently across sections:
- Option 1: bg-background → bg-card → bg-secondary → bg-background → bg-card (dark charcoal → card → secondary → charcoal → card)
- Option 2: bg-background → bg-secondary → bg-card → bg-background → bg-muted (dark → secondary band → card → dark → muted for proof)

### Accent Usage
Primary amber/orange for CTAs, stats, and metric highlights. Accent for secondary actions.

### Contrast Rule
Light text on dark backgrounds. Primary for high-energy accent. Strong contrast for sales impact.

## Spacing Rhythm

- Density: tight
- Compact hero density, punchy section spacing, tighter copy blocks, large proof numbers, strong rhythm shifts.

### Section Padding
- navbar: py-3
- hero: py-20 md:py-28
- story: py-16 md:py-20
- services: py-12 md:py-16
- gallery: py-12 md:py-16
- proof: py-10 md:py-14
- cta: py-16 md:py-24
- footer: py-10 md:py-14

### Internal Gaps
tight gap-2 | standard gap-4 | generous gap-6

### Container Widths
full max-w-7xl | content max-w-6xl | prose max-w-2xl

## Border and Radius

Hard edges, medium radius, assertive strokes, framed proof blocks.

## Shadows

Punchier elevation and strong panel separation.

## CTA Style

Buttons are aggressive and direct. Labels are short. Action surfaces feel sales-ready, not ornamental.
CTA surface: bg-primary text-primary-foreground for aggressive CTA. Large buttons with strong contrast.

## Imagery

Large proof-led visuals, diagonal or staggered framing, industrial or commercial realism, stat overlays.

## Motifs

Metric bands, contrast stripes, heavy dividers, badge clusters, blocky footers.

## Section Archetypes

For each section role, use one of these archetypes:

- **Navbar**: hard-edged top bar with left brand, bold nav, and assertive quote/demo Button | commercial nav with utility proof badges and right CTA block
- **Hero**: proof-led split hero with large stat band and right commercial image plane | diagonal or offset hero with dense copy stack, Button cluster, and metric strip
- **Story**: operator narrative with metric rail and industrial support panel | split authority block with image left and credential stack right
- **Services**: asymmetric trade or feature lanes with one dominant card and stacked support lanes | commercial service matrix with hard separators and price/scope support
- **Gallery**: proof wall with one hero project and smaller evidence cards | staggered commercial gallery with value badges and overlay facts
- **Proof**: heavy metric band with one customer or client pull quote | credential strip with badges, guarantees, and one anchor testimonial
- **CTA**: quote or signup split with real form shell and support assurances | commercial conversion band with left offer copy and right form frame
- **Footer**: blocky footer with service area, trust signals, and direct contact rail | commercial footer with closing statement and hard-divider columns

## Motion

- Personality: assertive and energetic — punchy reveals with strong directional movement
- Easing: enter cubic-bezier(0.16, 1, 0.3, 1) | exit cubic-bezier(0.55, 0, 1, 0.45) | hover ease-out
- Duration: button 140ms | reveal 500ms
- Button press: scale(0.95) on :active (deeper for assertive feedback)
- Stagger delay: 50ms between items
- Hover scale: scale(1.03)
- Aggressive enter animations with strong ease-out (fast start, smooth settle)
- Stats and numbers can use count-up animation on scroll-into-view
- Card hover: lift + shadow increase with 3% scale
- Section reveals can use translateY(20px) → 0 with 500ms ease-out

## Layout Density

- hero: density=dense, align=asymmetric, weight=data-heavy
- story: density=standard, align=left, weight=balanced
- services: density=dense, align=left, weight=data-heavy
- gallery: density=standard, align=asymmetric, weight=image-heavy
- proof: density=dense, align=center, weight=data-heavy
- cta: density=standard, align=asymmetric, weight=balanced

## Generation Steps

CRITICAL: Fewer sections done well beats many sections that collapse.
Target: Navbar + Hero + 3 body sections + Footer = 6 components total. Do NOT attempt more than 3 body sections.
OUTPUT BUDGET: Keep each component file under 90 lines. Prefer compact, impactful code over exhaustive code.

Follow these steps in exact order.

### Step 1: Lock Foundations
- CSS theme variables, Bebas Neue + Barlow fonts, and `text-transform: uppercase` on h1-h4 are pre-injected by the scaffold into `src/index.css` — do NOT generate or modify globals.css or index.css
- Apply uppercase to headings via Tailwind className (`uppercase`) where needed
- Set display: text-4xl sm:text-5xl md:text-6xl font-bold uppercase
- Set body: text-base sm:text-lg leading-relaxed

### Step 2: Build Hero — the most important section
- Split layout: left copy stack + right image/proof visual
- Bebas Neue headline, 4-6 words max, uppercase
- Stat rail: 3 metrics max (years, clients, or one key metric)
- One primary CTA button (bg-primary, direct label)

### Step 3: Build 3 Body Sections (pick from these options)
Pick exactly 3. Each must use a DIFFERENT layout. Keep each under 90 lines.
- **Programs/Services**: 3 program lanes in a grid — name, format, one-line description each. Accent borders.
- **Proof/Coaches**: Split — 2 coach entries left (name + credential only), one member quote right.
- **Pricing/CTA**: Tier ladder (2-3 tiers, stacked) with a single trial CTA button per tier. No inline form.
Choose 3 that fit the brief. Do NOT build all 4.

### Step 4: Build Footer
- Blocky, dark. Address, phone, hours. Hard dividers. No 4-column link grid.

### Step 5: Final Verification
Before emitting, verify:
1. Bebas Neue / condensed sans in all headings (font-heading, uppercase)
2. Accent color used for CTAs and stat highlights
3. No two consecutive sections share the same layout
4. At least 2 different bg-* classes across sections
5. Total body sections: exactly 3 (not more)
6. Each component file is under 90 lines
