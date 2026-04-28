---
name: refined
description: Carefully curated, modern minimal style with elegant serif typography and understated, sophisticated palettes.
license: MIT
metadata:
  author: typeui.sh
---

# Cenate Design System Skill

## Purpose
This skill constrains AI website generation to produce premium, production-quality layouts.
It is consumed at generation time as system-level instructions, not as a runtime library.

## Brand Direction
- Modern, editorial, premium
- Confident visual hierarchy
- Media-led composition
- Strong typography with clear scale
- Dark and light palette support with rich contrast

## Layout Principles
- Asymmetric but controlled compositions
- Section-specific visual identity (each section feels intentional, not templated)
- Editorial spacing rhythm: vary section padding (py-16 to py-32) based on content weight
- Full-bleed hero sections with layered content
- Grid compositions that break the 3-card monotony
- Responsive behavior designed intentionally per breakpoint, not just stacked

## Website Generation Priority Rules
- Treat the website-specific rules in this document as higher priority than any generic TypeUI design-system guidance below.
- Prefer confident composition over safe symmetry. If a layout feels like a generic SaaS/Tailwind starter, it is wrong.
- A premium brief must show visible design intent in the first viewport: dominant media, strong type, and a clear focal point.
- Do not solve every section with the same centered heading + paragraph + grid pattern.
- Restaurant mode is the strictest benchmark. If the restaurant output feels safe or templated, the page is wrong.

## NOTE: Site-type composition modes are defined in the generation prompt's dedicated site-type layer. They are NOT duplicated here to avoid conflicting instructions.

## Typography Scale
- Display: text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]
- H1: text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight
- H2: text-3xl md:text-4xl font-semibold tracking-tight
- H3: text-xl md:text-2xl font-semibold
- Stats/Metrics: text-3xl md:text-5xl font-bold
- Body: text-base md:text-lg leading-relaxed text-muted
- Small: text-sm text-muted
- Caption/Eyebrow: text-xs uppercase tracking-widest font-medium text-muted


## Color Strategy
For dark themes:
- Background: #0a0a0a to #111111
- Surface: #1a1a1a to #222222
- Border: rgba(255,255,255,0.08) to rgba(255,255,255,0.12)
- Text primary: #f5f5f5
- Text muted: #888888 to #999999
- Accent: brand-specific (gold, blue, coral, emerald depending on industry)

For light themes:
- Background: #fafafa to #ffffff
- Surface: #f5f5f5 to #ffffff
- Border: rgba(0,0,0,0.06) to rgba(0,0,0,0.1)
- Text primary: #111111
- Text muted: #666666

## Component Rules

### Navigation
- Sticky, backdrop-blur, transparent or semi-transparent background
- Logo left, links center or right, CTA button right
- Clean, minimal - no heavy borders
- Mobile: hamburger with full-screen or slide-over menu
- Height: h-16 to h-20

### Hero Section
- MUST be visually striking - this is the first impression
- Full viewport height or near (min-h-[80vh] to min-h-screen)
- Headline: text-4xl sm:text-5xl md:text-6xl. Never text-8xl or text-9xl.
- Layered composition: background image/gradient + overlay + content
- Concise subtitle in muted text (text-lg to text-xl)
- 1-2 CTA buttons with clear hierarchy (primary filled + secondary outline)
- Prefer one of these modes: split-screen media + content, edge-to-edge image with anchored copy, or editorial layout with structured text panel
- Do NOT default to small centered text floating on a busy photo

### Feature / Content Sections
- Vary layout between sections: alternating image+text, grid, stacked
- Use 2-column (lg:grid-cols-2) for image+text pairs
- Use 3 or 4 column grids sparingly and with visual variety
- Each card/item should have visual weight (icon, image, or strong typography)
- Section headers: overline label + heading + description paragraph
- At most one section in a page may use the plain "uniform cards in a simple grid" treatment.
- After any grid-heavy section, the next section should switch to a distinctly different composition: split layout, staggered stack, full-bleed band, editorial list, metrics rail, or image-led story block.
- Mix alignment. Not every section header should be centered.
- Include at least one section where typography, not cards, carries the visual weight.
- Avoid repeating the same rounded-card language across features, testimonials, pricing, and footer.
- At least one section per page must intentionally break the dominant rhythm.

### Media Sections
- Images should be large, high-quality, and compositionally intentional
- Use aspect-ratio containers (aspect-video, aspect-[4/3], aspect-square)
- Rounded corners: rounded-xl to rounded-2xl
- Subtle shadows or ring borders
- Gallery: masonry or asymmetric grid preferred over uniform grid
- For image-led or luxury/editorial briefs, media should appear in multiple sections, not only the hero.
- At least one media section should use an asymmetric crop, overlap, or editorial framing rather than a plain equal grid.
- Avoid tiny thumbnail-like media blocks that reduce impact.

## Section Choreography
- Sequence the page intentionally. It should feel composed in movements, not stacked in blocks.
- Do not let every section start with centered eyebrow + heading + paragraph.
- Alternate between media-heavy, typography-led, structured-content, and proof sections.
- Vary spacing by purpose: immersive sections can breathe; dense information sections can compress.
- After two orderly sections, introduce one section that breaks rhythm through asymmetry, overlap, or a different alignment model.
- Only one uniform card-grid section is allowed unless the site type strongly requires a second.

### Testimonials / Social Proof
- Quote marks or icons for visual anchor
- Avatar + name + role
- Card or minimal layout, not generic list
- Star ratings if applicable
- 2-3 testimonials, not walls of text

### CTA Blocks
- Full-width with strong background (gradient, dark, or accent color)
- Large heading + supporting text + prominent button
- Adequate padding (py-20 to py-32)

### Footer
- Multi-column with organized links
- Brand mark / logo
- Social links
- Copyright
- Clean, not cluttered
- Subtle border-top or background shift
- Footer content should feel product-ready: real contact/location/business info, not only generic placeholder columns.
- Match the site tone. A luxury portfolio footer should not read like a generic SaaS resource sitemap.

### Buttons
- Primary: filled background, rounded-lg to rounded-full, px-6 py-3
- Secondary: outline or ghost variant
- Size hierarchy: default, sm, lg
- Hover states: opacity shift or background shift
- Transition: transition-all duration-200

### Forms / Inputs
- Clean borders, rounded-lg
- Focus ring with brand accent
- Label above input
- Adequate spacing between fields

## Image Strategy
- PRIMARY: use images from the curated image library provided in the niche asset plan. These are pre-validated, niche-correct URLs.
- FALLBACK ONLY: if no curated image fits the section's role, use a direct Unsplash URL as a last-resort fallback.
- URL pattern for Unsplash fallback: https://images.unsplash.com/photo-{id}?w={width}&h={height}&fit=crop&q=80
- Always include alt text
- Use object-cover for contained images
- Lazy load below-fold images
- Every image must serve a composition role (hero-focal, editorial-narrative, proof-portrait, ambient-atmosphere, project-showcase, product-surface, team-portrait, process-documentary, venue-context). Decorative filler images must be removed.

## NOTE: Anti-patterns and banned shapes are defined in the generation prompt's priority directives layer. They are NOT duplicated here to avoid conflicting instructions.

## Tailwind Utilities Preference
- Use Tailwind CSS via CDN script tag for generated HTML
- Prefer utility classes over custom CSS
- Do NOT use @apply — the Tailwind CDN does not support it
- Use arbitrary values [value] when Tailwind defaults don't fit
- Do NOT default to Inter/system for premium/editorial/luxury briefs.
- If the manifest names a non-system font pairing, load those fonts in `src/styles/globals.css` using CSS `@import` or another runtime-safe method, then actually use them.

## Cenate Runtime Constraints (HARD LIMITS)

Generated projects run inside a sandboxed iframe using Babel Standalone + React 18 UMD + Tailwind CDN. These constraints are non-negotiable — violating them breaks the preview.

### Imports
- Only `react` and `react-dom/client` are available as built-ins.
- All other imports MUST resolve to a file present in the output (either generated by you or pre-injected by the scaffold system).
- Pre-injected files you can import from: `@/components/ui/*` (Button, Input, Textarea, Badge, Card, Section, Container, Heading), `@/lib/utils` (cn utility).
- Path alias `@/...` maps to `src/...`.
- CSS imports must target generated files (e.g. `./styles/globals.css`).
- NO external npm packages: no lucide-react, clsx, framer-motion, @radix-ui, shadcn, next/*, react-router, icon libraries, or any other package.

### Icons
- Inline SVG only. Embed `<svg>...</svg>` directly in JSX.
- Do NOT import from any icon library.

### Images
- Use images from the curated image library first. Fall back to direct Unsplash URLs only when no curated image fits.
- URL format: `https://images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop&q=80`.
- Do NOT use `import` for image files.
- Do NOT reference local `/public` paths — there is no asset server at runtime.
- Always include descriptive alt text.

### Styles
- Tailwind utility classes in `className` only.
- Tailwind CDN JIT scans class names — `@tailwind` directives and `@apply` in CSS are ignored.
- Plain CSS in `src/styles/globals.css` is injected as a `<style>` tag; custom selectors, resets, and keyframes are fine.

### Navigation
- Plain `<a href="#section">` anchor tags for in-page navigation.
- Do NOT use react-router or Next.js link components.

### Entry
- `src/main.tsx` is the runtime entry. It must `import App from "./App"`, `import "./styles/globals.css"`, and call `ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>)`.

## NOTE: The mandatory design-planning step is defined in the generation prompt's planning layer. Not duplicated here.

## Cenate Quality Gates
- Every import in every file resolves to either `react`, `react-dom/client`, or a file present in the output.
- Hero is visually striking with a real background image and strong display typography — never empty or generic.
- Section layouts vary — no repeated 3-card grid across every section.
- Real curated or Unsplash photos (not placeholder boxes) wherever images are shown.
- Color contrast meets WCAG AA for body text against background.
- No icon library imports, no external package imports, no `@apply` in CSS.
- All generated files are self-contained and compile under Babel Standalone.
- Typography named in the manifest is visibly implemented in code, not just described.
- Navigation and footer read like final product surfaces, not placeholders.
- The page should not resemble a starter template when viewed as a whole.
- Hero, nav, and footer must visibly reflect the site type, not just the color palette.
- Restaurant pages must feel materially more art-directed than a generic marketing page.

<!-- TYPEUI_SH_MANAGED — generic design-system boilerplate removed to reduce prompt dilution.
     Style foundations (Playfair Display, modern minimal) are reflected in the Typography Scale
     and Color Strategy sections above. Component families and guideline authoring workflow
     are not relevant to website generation and were creating noise. -->
