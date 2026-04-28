---
name: editorial-luxury
id: editorial_luxury
type: style
description: Restrained high-contrast editorial identity with serif display typography, deep surfaces, metallic accent control, and spacious composition.
keywords: [luxury, editorial, fine dining, serif, elegant, high-end, premium, michelin, upscale, bespoke, exclusive, refined, sophisticated, venue, estate, curated, gallery, art, studio, architect, jewel, wine, fancy, beautiful, cinematic, fashion, campaign, luxurious, statement]
niche_affinity: [restaurant, realEstate, law, portfolio]
---

# Editorial Luxury — Style Skill

## Identity

Restrained high-contrast editorial identity with serif display typography, deep surfaces, metallic accent control, and spacious composition.

## Typography System

- Display: Playfair Display with high contrast and tight tracking
- Body: Inter with compact copy blocks and discreet uppercase labels
- Font heading: `"Playfair Display", serif`
- Font body: `"Inter", system-ui, sans-serif`

### Type Scale
- Hero headline: text-4xl sm:text-5xl md:text-6xl font-bold font-heading leading-tight tracking-tight
- Section headings: text-2xl sm:text-3xl md:text-4xl font-semibold font-heading leading-tight
- Subheadings: text-lg sm:text-xl font-medium font-body
- Body text: text-base sm:text-lg font-normal font-body leading-relaxed max-w-2xl
- Captions/labels: text-xs sm:text-sm font-body leading-normal
- Eyebrows: text-xs uppercase tracking-[0.28em] text-primary font-medium

### Weight Hierarchy
Display bold → heading semibold → label medium → body normal. Never use font-bold on body text. Line height must differ — headings tight, body relaxed.

## Color System

- Mode: dark
- Deep graphite backgrounds, ivory text, muted stone surfaces, restrained metallic accent, subtle warm highlights

### Color Philosophy
This style uses darkness as luxury. The page should feel like walking into a dimly lit high-end venue — deep, warm, and intentional. The accent is metallic and restrained: it appears in thin lines, eyebrow labels, and CTA borders, never as a background fill. Every surface shift moves between shades of graphite, charcoal, and warm stone.

### Palette Directions — PICK ONE per project
- **Direction A (Brass & Graphite)**: `--primary: 37 54% 63%` — warm gold on deep charcoal, classic editorial
- **Direction B (Copper & Midnight)**: `--primary: 20 65% 52%` — richer warmth, works for wine/spirits/venue
- **Direction C (Champagne & Charcoal)**: `--primary: 42 38% 72%` — lighter metallic, softer luxury
- **Direction D (Warm Gold & Deep Wine)**: `--primary: 35 68% 55%; --background: 350 18% 8%` — richer base tone

### Anti-Patterns — DO NOT produce these
- No centered text over a full-bleed dimmed photo with no composition structure
- No generic 3-card grid for services or menu items
- No bright white text on pure black — use ivory on graphite
- No blue or cool-toned accents — accent must be warm metallic
- No generic footer with 4-column link grid

### CSS Theme Variables
```css
:root {
  --background: 18 14% 7%;
  --foreground: 38 24% 93%;
  --card: 24 12% 11%;
  --card-foreground: 38 24% 93%;
  --primary: 37 54% 63%;
  --primary-foreground: 18 14% 7%;
  --secondary: 24 9% 18%;
  --secondary-foreground: 38 24% 93%;
  --muted: 24 8% 17%;
  --muted-foreground: 36 12% 69%;
  --accent: 30 20% 16%;
  --accent-foreground: 38 24% 93%;
  --border: 32 17% 23%;
  --input: 32 17% 23%;
  --ring: 37 54% 63%;
  --radius: 1.35rem;
  --font-heading: "Playfair Display", serif;
  --font-body: "Inter", system-ui, sans-serif;
  --gradient-hero: linear-gradient(135deg, hsl(18 14% 8%), hsl(18 14% 7%) 58%, hsl(37 54% 63% / 0.18));
  --gradient-surface: linear-gradient(180deg, hsl(24 12% 12%) 0%, hsl(18 14% 7%) 100%);
  --shadow-soft: 0 24px 60px -34px rgb(0 0 0 / 0.52);
  --shadow-card: 0 22px 55px -34px rgb(0 0 0 / 0.6);
  --shadow-card-hover: 0 30px 72px -36px rgb(0 0 0 / 0.72);
}
body {
  letter-spacing: 0.01em;
  background-image:
    radial-gradient(circle at top, hsl(var(--primary) / 0.08), transparent 28%),
    linear-gradient(180deg, hsl(18 14% 7%) 0%, hsl(18 12% 5%) 100%);
}
```

### CSS Utilities
```css
.text-gradient {
  background-image: linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--primary)));
}
.surface-card {
  background-image: linear-gradient(180deg, hsl(var(--card) / 0.98), hsl(24 12% 9% / 0.96));
  border-color: hsl(var(--border) / 0.9);
}
.surface-panel {
  background: hsl(24 12% 10% / 0.86);
  backdrop-filter: blur(18px);
  border: 1px solid hsl(var(--border) / 0.8);
}
.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.28em;
}
.family-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.55), transparent);
}
.family-frame {
  border: 1px solid hsl(var(--border) / 0.9);
  box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.08);
}
```

### Surface Shift Patterns
Pick one and apply consistently across sections:
- Option 1: bg-background → bg-card → bg-muted → bg-background → bg-card (deep → warm card → muted stone → deep → warm card)
- Option 2: bg-background → bg-secondary → bg-background → bg-card → bg-muted (deep → secondary → deep → card → muted for rhythm)

### Accent Usage
Primary (brass/gold) for eyebrows, CTA borders, divider accents. Never as full section background.

### Contrast Rule
Ivory text on deep graphite. Muted foreground for secondary text. Primary for accent only.

## Spacing Rhythm

- Density: generous
- Generous vertical spacing, large hero breathing room, disciplined internal card spacing, measured section transitions

### Section Padding
- navbar: py-4
- hero: py-24 md:py-32
- story: py-20 md:py-28
- services: py-16 md:py-24
- gallery: py-16 md:py-20
- proof: py-12 md:py-16
- cta: py-20 md:py-28
- footer: py-12 md:py-16

### Internal Gaps
tight gap-3 | standard gap-6 | generous gap-10

### Container Widths
full max-w-7xl | content max-w-5xl | prose max-w-2xl

## Border and Radius

Thin ruled dividers, low-noise borders, large radius reserved for image frames and editorial panels only.

## Shadows

Soft long shadows and restrained inset lines. No glows.

## CTA Style

Buttons feel tailored and formal. Primary CTAs are solid with brass-toned accents or ivory-on-dark contrast.
CTA surface: bg-primary text-primary-foreground or bordered panel with bg-card and primary border accent.

## Imagery

Cinematic framed photography, tall editorial crops, layered panels, controlled overlays, image captions and support rails.

## Motifs

Ruled lines, overline labels, framed caption blocks, split editorial panels, venue-grade footer treatment.

## Section Archetypes

For each section role, use one of these archetypes:

- **Navbar**: thin venue bar with centered wordmark, restrained nav links, and one reservation Button | split editorial nav with left label cluster, centered mark, right reservation rail
- **Hero**: split editorial panel with framed cinematic image and right-side copy rail | immersive hero with offset image plane and support rail of awards or service notes
- **Story**: portrait-left philosophy-right narrative with pull quote and caption | editorial manifesto block with inset supporting image and ruled divider
- **Services**: ruled editorial list with one highlighted signature item and support note | tall split menu or services ledger with narrative side panel
- **Gallery**: asymmetric mosaic with one dominant image and stacked supporting frames | cinematic gallery rail with captioned stills and narrow support strip
- **Proof**: press quote band with one anchor quote and smaller publication marks | testimonial proof rail with one large quote and understated credibility line
- **CTA**: reservation or contact salon with left ritual notes and right form panel | split booking panel with framed media support and formal action surface
- **Footer**: venue ledger footer with centered mark, address, hours, and closing line | editorial footer with framed contact details and restrained divider

## Motion

- Personality: restrained and deliberate — slow, confident reveals with editorial precision
- Easing: enter cubic-bezier(0.23, 1, 0.32, 1) | exit cubic-bezier(0.55, 0, 1, 0.45) | hover ease
- Duration: button 160ms | reveal 600ms
- Button press: scale(0.97) on :active
- Stagger delay: 60ms between items
- Hover scale: scale(1.02)
- Use slow, confident entrance animations (500-700ms) for editorial sections
- Stagger gallery images with 60ms delay
- Hover effects should be subtle: opacity shift or soft scale, never bouncy
- No bounce, no elastic — motion is precise and measured
- Parallax is allowed but must be subtle (max 20px offset)

## Layout Density

- hero: density=sparse, align=asymmetric, weight=image-heavy
- story: density=standard, align=left, weight=balanced
- services: density=standard, align=left, weight=text-heavy
- gallery: density=dense, align=asymmetric, weight=image-heavy
- proof: density=sparse, align=center, weight=text-heavy
- cta: density=standard, align=asymmetric, weight=balanced

## Generation Steps

Follow these steps in exact order. Do not skip or reorder. Complete each step fully before starting the next.

CRITICAL: Fewer sections done well beats many sections that collapse.
Target: Navbar + Hero + 3 body sections + CTA + Footer = 7 components total. Do NOT attempt more than 3 body sections.

### Step 1: Lock Foundations
- Load Playfair Display (display/heading) + Inter (body) in globals.css
- Pick ONE Palette Direction (A/B/C/D) — match the brief's tone
- Apply dark mode with chosen direction's --primary and any --background override
- Load the CSS theme variables
- Choose one surface shift pattern and apply consistently

### Step 2: Build Hero Section
- Use split editorial panel or immersive hero archetype
- Playfair Display headline, max 8 words, text-4xl sm:text-5xl md:text-6xl
- Muted ivory subtitle, single formal CTA button
- Include support block: credential rail, awards strip, or service notes
- Full-bleed cinematic image with controlled overlay

### Step 3: Build Narrative/Story Section
- Use editorial manifesto or portrait-narrative archetype
- Different layout from hero (if hero is split, story should be manifesto or vice versa)
- Include pull quote or caption element
- Apply ruled divider motif

### Step 4: Build Services/Content Section
- Use ruled editorial list or split ledger archetype
- One highlighted/featured item with visual weight
- No uniform 3-card grid
- Apply section-appropriate spacing from the spacing table

### Step 5: Build Evidence Section (Gallery OR Proof — pick ONE)
- **If gallery fits the niche**: Asymmetric mosaic — one dominant image + 2 smaller frames. Framed with family-frame. Caption support.
- **If proof fits the niche**: Press quote band — one anchor quote with strong typography and understated credibility attribution.
- Pick whichever better serves the brief. Do NOT build both.

### Step 6: Build CTA + Footer
- CTA: reservation/contact salon with form panel and ritual notes
- Footer: venue ledger with centered mark, address, hours, closing line
- Both must feel like designed closure, not utility strips
- Footer includes at least one non-link element

### Step 7: Final Composition Verification
Before emitting, verify:
1. Playfair Display appears in all headings (font-heading)
2. Brass accent (primary) used 3-5 times across the page
3. No two consecutive sections share the same layout
4. Surface shifts are visible (at least 2 different bg-* classes)
5. Section spacing varies (at least 3 different py-N values)
6. All images have editorial framing (not raw unframed rectangles)
7. Weight hierarchy is consistent: display → heading → label → body
8. Total body sections: exactly 3 (not more)
