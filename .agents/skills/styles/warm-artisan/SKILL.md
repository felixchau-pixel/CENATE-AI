---
name: warm-artisan
id: warm_artisan
type: style
description: Craft-led identity with softer earthy tones, tactile surfaces, organic spacing, and intimate storytelling.
keywords: [artisan, warm, organic, craft, boutique, cozy, handmade, seasonal, bakery, cafe, pottery, florist, local, farm, garden, wellness, yoga, spa, holistic, vintage, workshop, maker, natural, fancy]
niche_affinity: [restaurant, beauty, fitness]
---

# Warm Artisan — Style Skill

## Identity

Craft-led identity with softer earthy tones, tactile surfaces, organic spacing, and intimate storytelling.

## Typography System

- Display: Playfair Display
- Body: Barlow or Inter with warm spacing and softer line lengths
- Font heading: `"Playfair Display", serif`
- Font body: `"Barlow", system-ui, sans-serif`

### Type Scale
- Hero headline: text-3xl sm:text-4xl md:text-5xl font-bold font-heading leading-snug
- Section headings: text-2xl sm:text-3xl font-semibold font-heading leading-snug
- Subheadings: text-lg font-medium font-body
- Body text: text-base sm:text-lg font-normal font-body leading-relaxed max-w-2xl
- Captions/labels: text-sm font-body leading-normal
- Eyebrows: text-xs uppercase tracking-[0.22em] text-primary font-medium

### Weight Hierarchy
Display bold → heading semibold → label medium → body normal. Never use font-bold on body text. Line height must differ — headings snug, body relaxed.

## Color System

- Mode: light
- Cream, clay, cocoa, olive, and muted terracotta. Surfaces feel tactile instead of glossy.

### Color Philosophy
This style uses warmth as its defining quality. No pure whites, no cool grays. Every surface should feel like natural material: linen, clay, oat, cream. The accent is earthy and muted — never neon or high-saturation. The page should feel like touching handmade paper, not a glass screen.

### Palette Directions — PICK ONE per project
- **Direction A (Terracotta & Cream)**: `--primary: 21 58% 42%` — classic artisan warmth, works for renovation/craft
- **Direction B (Sage & Linen)**: `--primary: 140 22% 42%; --background: 38 36% 96%` — calmer, works for wellness/spa
- **Direction C (Clay & Oat)**: `--primary: 28 45% 38%; --background: 34 38% 95%` — earthier, works for pottery/bakery
- **Direction D (Rust & Ivory)**: `--primary: 14 62% 44%; --background: 40 42% 97%` — stronger contrast, works for studio/workshop

### Anti-Patterns — DO NOT produce these
- No pure white (#fff) backgrounds — always warm-tinted (cream, linen, oat)
- No cool-toned accents (blue, violet, teal) — accent must be warm earth
- No sharp edges or hard shadows — use soft radius and warm shadows
- No dense data grids or metric bands — this is not a commercial style
- No hero without a real image — warm artisan is always image-led
- No generic stock photography — images should feel handcrafted and natural-light

### CSS Theme Variables
```css
:root {
  --background: 36 44% 97%;
  --foreground: 18 18% 19%;
  --card: 33 33% 94%;
  --card-foreground: 18 18% 19%;
  --primary: 21 58% 42%;
  --primary-foreground: 36 44% 97%;
  --secondary: 34 26% 89%;
  --secondary-foreground: 18 18% 19%;
  --muted: 34 26% 89%;
  --muted-foreground: 24 12% 41%;
  --accent: 85 18% 58%;
  --accent-foreground: 18 18% 19%;
  --border: 28 21% 80%;
  --input: 28 21% 80%;
  --ring: 21 58% 42%;
  --radius: 1.4rem;
  --font-heading: "Playfair Display", serif;
  --font-body: "Barlow", system-ui, sans-serif;
  --gradient-hero: linear-gradient(135deg, hsl(36 44% 97%), hsl(34 32% 93%) 54%, hsl(21 58% 42% / 0.12));
  --gradient-surface: linear-gradient(180deg, hsl(36 44% 97%) 0%, hsl(34 26% 92%) 100%);
  --shadow-soft: 0 18px 44px -30px rgb(90 63 42 / 0.22);
  --shadow-card: 0 18px 46px -30px rgb(90 63 42 / 0.2);
  --shadow-card-hover: 0 24px 58px -30px rgb(90 63 42 / 0.26);
}
body {
  background-image:
    radial-gradient(circle at top, hsl(var(--accent) / 0.18), transparent 28%),
    linear-gradient(180deg, hsl(36 44% 97%) 0%, hsl(34 36% 95%) 100%);
}
```

### CSS Utilities
```css
.surface-card {
  background-image: linear-gradient(180deg, hsl(var(--card)), hsl(34 26% 92% / 0.92));
  border-color: hsl(var(--border));
}
.surface-panel {
  background: hsl(var(--card) / 0.88);
  border: 1px solid hsl(var(--border));
}
.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.22em;
}
.family-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.55), transparent);
}
.family-kicker {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}
```

### Surface Shift Patterns
Pick one and apply consistently across sections:
- Option 1: bg-background → bg-card → bg-secondary → bg-background → bg-card (cream → warm card → secondary → cream → card)
- Option 2: bg-background → bg-muted → bg-background → bg-card → bg-secondary (cream → muted → cream → card → secondary for warmth)

### Accent Usage
Primary terracotta for CTAs and section accents. Accent olive for supporting elements.

### Contrast Rule
Dark text on warm light backgrounds. Primary for warm accent. Subtle, never harsh.

## Spacing Rhythm

- Density: generous
- Relaxed but deliberate. Sections open with breathing room and intimate narrative blocks.

### Section Padding
- navbar: py-4
- hero: py-20 md:py-28
- story: py-20 md:py-24
- services: py-16 md:py-20
- gallery: py-16 md:py-20
- proof: py-12 md:py-16
- cta: py-16 md:py-24
- footer: py-12 md:py-16

### Internal Gaps
tight gap-3 | standard gap-6 | generous gap-8

### Container Widths
full max-w-6xl | content max-w-5xl | prose max-w-2xl

## Border and Radius

Soft lines, slightly larger radius, tactile panels, subtle inset frames.

## Shadows

Warm low-contrast depth.

## CTA Style

Buttons feel inviting and crafted, with warm contrast and soft but confident structure.
CTA surface: bg-primary text-primary-foreground for warm CTA. Soft bordered panel for contact forms.

## Imagery

Natural light, organic crop ratios, craft process details, ingredient or maker context, softer framing.

## Motifs

Texture hints, soft dividers, caption notes, craft badges, warm footer closure.

## Section Archetypes

For each section role, use one of these archetypes:

- **Navbar**: craft-led nav with left wordmark, intimate section links, and one booking or inquiry Button | soft framed nav with centered brand and right crafted CTA
- **Hero**: warm split hero with natural-light image and right narrative panel | artisan hero with framed process image, support badges, and intimate CTA rail
- **Story**: maker story with portrait/process image and warm manifesto block | two-column craft narrative with caption strip and pull quote
- **Services**: crafted service or menu ledger with notes, prices, and one featured panel | soft lane layout with one dominant offer and stacked support details
- **Gallery**: organic mosaic with ingredient/process/detail imagery | natural-light gallery rail with caption notes and varied crops
- **Proof**: quiet testimonial band with one anchor quote and craft markers | community proof strip with one large quote and two supporting notes
- **CTA**: warm reservation or inquiry panel with left details and right form | soft split CTA with framed image and crafted action surface
- **Footer**: warm footer with address, hours, inquiry line, and closing note | craft ledger footer with understated rules and contact details

## Motion

- Personality: gentle and organic — soft fades and subtle movements that feel handcrafted
- Easing: enter cubic-bezier(0.25, 0.1, 0.25, 1) | exit cubic-bezier(0.25, 0.1, 0.25, 1) | hover ease
- Duration: button 160ms | reveal 600ms
- Button press: scale(0.97) on :active
- Stagger delay: 70ms between items
- Hover scale: scale(1.02)
- Soft, organic reveals using opacity + subtle translateY(12px)
- Gallery images fade in with 70ms stagger — feels like a gentle cascade
- Hover effects: warm opacity shifts, never sharp scale changes
- No aggressive motion — everything should feel unhurried and intentional
- Section transitions use longer durations (500-700ms) for a relaxed pace

## Layout Density

- hero: density=sparse, align=asymmetric, weight=image-heavy
- story: density=sparse, align=left, weight=balanced
- services: density=standard, align=left, weight=text-heavy
- gallery: density=standard, align=asymmetric, weight=image-heavy
- proof: density=sparse, align=center, weight=text-heavy
- cta: density=standard, align=asymmetric, weight=balanced

## Generation Steps

Follow these steps in exact order. Complete each step fully before starting the next.

CRITICAL: Fewer sections done well beats many sections that collapse.
Target: Navbar + Hero + 3 body sections + CTA + Footer = 7 components total. Do NOT attempt more than 3 body sections.

### Step 1: Lock Foundations
- Load Playfair Display (heading) + Barlow (body) in globals.css
- Set CSS theme variables with chosen palette direction (cream background, warm accent)
- Display: text-3xl sm:text-4xl md:text-5xl font-bold font-heading
- Body: text-base sm:text-lg leading-relaxed font-body

### Step 2: Build Hero — image-led, always
The hero MUST have a real image. Choose one layout:
- **Option A (Warm Split)**: Left — large framed image with rounded-2xl and warm shadow. Right — Playfair headline (6-10 words), warm subtitle, crafted CTA button, and 2-3 support badges (est. year, location, craft descriptor)
- **Option B (Artisan Immersive)**: Full-width framed image with overlaid text panel (semi-transparent warm bg). Playfair headline, short manifesto line, CTA.
The hero must feel intimate and inviting, not corporate.

### Step 3: Build Story/Narrative Section
Split layout different from hero:
- If hero was split (image left), story should be manifesto-center or reversed
- Include a pull quote in italic (font-body italic)
- Include one process/portrait image
- Generous spacing: py-20 md:py-24

### Step 4: Build Services + Gallery (2 sections)
- **Services**: Crafted ledger or soft lane layout. One featured item with image. Soft dividers (family-divider). No hard grid.
- **Gallery**: Organic mosaic — one large image + 2-3 smaller varied crops. Rounded framing with warm shadows. Caption notes optional.

### Step 5: Build CTA + Footer
- CTA: Split — left side has warm details (address, hours, philosophy note) + right side has real form (name, email, message fields)
- Footer: Warm closure. Address, hours, inquiry line, and a closing note or craft tagline. At least one non-link element.

### Step 6: Final Verification
Before emitting, verify:
1. Playfair Display in all headings (font-heading)
2. Warm accent (terracotta/clay/rust) for CTAs and highlights
3. Background is cream-tinted, NOT pure white
4. No two consecutive sections share the same layout
5. At least 2 different bg-* classes (cream, clay card, warm secondary)
6. Every section with imagery uses natural-light framing
7. The page feels handcrafted and intimate, not template-safe
