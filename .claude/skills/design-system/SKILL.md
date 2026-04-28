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

## Typography Scale
- Display: text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]
- H1: text-4xl md:text-6xl font-bold tracking-tight leading-tight
- H2: text-3xl md:text-4xl font-semibold tracking-tight
- H3: text-xl md:text-2xl font-semibold
- Body: text-base md:text-lg leading-relaxed text-muted
- Small: text-sm text-muted
- Caption: text-xs uppercase tracking-widest font-medium text-muted

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
- Layered composition: background image/gradient + overlay + content
- Strong headline with display typography
- Concise subtitle in muted text
- 1-2 CTA buttons with clear hierarchy (primary filled + secondary outline)
- Optional: subtle scroll indicator, floating elements, gradient meshes

### Feature / Content Sections
- Vary layout between sections: alternating image+text, grid, stacked
- Use 2-column (lg:grid-cols-2) for image+text pairs
- Use 3 or 4 column grids sparingly and with visual variety
- Each card/item should have visual weight (icon, image, or strong typography)
- Section headers: overline label + heading + description paragraph

### Media Sections
- Images should be large, high-quality, and compositionally intentional
- Use aspect-ratio containers (aspect-video, aspect-[4/3], aspect-square)
- Rounded corners: rounded-xl to rounded-2xl
- Subtle shadows or ring borders
- Gallery: masonry or asymmetric grid preferred over uniform grid

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
- Hero: use a dramatic, high-quality image via Unsplash or equivalent
- Sections: use relevant, high-quality photography
- URL pattern for Unsplash: https://images.unsplash.com/photo-{id}?w={width}&h={height}&fit=crop&q=80
- Always include alt text
- Use object-cover for contained images
- Lazy load below-fold images

## Anti-Patterns (NEVER DO)
- Repetitive identical rounded cards in every section
- Generic Tailwind starter / template appearance
- Identical spacing (py-16) on every section
- Placeholder boxes instead of real imagery
- Flat monochrome blocks with no visual composition
- Giant unstyled text walls
- Weak hero with no media or visual structure
- Box-shadow soup (excessive shadows everywhere)
- Rainbow gradients without purpose
- Stock photo grid with no compositional thought

## Tailwind Utilities Preference
- Use Tailwind CSS via CDN script tag for generated HTML
- Prefer utility classes over custom CSS
- Do NOT use @apply — the Tailwind CDN does not support it
- Use arbitrary values [value] when Tailwind defaults don't fit
- Inter or system font stack as default

## Cenate Runtime Constraints (HARD LIMITS)

Generated projects run inside a sandboxed iframe using Babel Standalone + React 18 UMD + Tailwind CDN. These constraints are non-negotiable — violating them breaks the preview.

### Imports
- `react`, `react-dom/client`, `@radix-ui/react-slot`, `@radix-ui/react-accordion`, `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-visually-hidden`, `class-variance-authority`, and `clsx` are available as built-ins.
- All other imports MUST resolve to a file you also generate in the same output.
- Path alias `@/...` maps to `src/...`.
- CSS imports must target generated files (e.g. `./styles/globals.css`).
- NO external npm packages beyond the built-ins listed above: no lucide-react, framer-motion, next/*, react-router, icon libraries, or any other package.

### Icons
- Inline SVG only. Embed `<svg>...</svg>` directly in JSX.
- Do NOT import from any icon library.

### Images
- Direct Unsplash URL strings only: `https://images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop&q=80`.
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

## Site-Type Planning

Before generating files, restate in one line:
1. Site type (restaurant, SaaS, portfolio, agency, ecommerce, blog, corporate, other)
2. Design direction (editorial, minimal, bold, luxury, playful, technical)
3. Color strategy (palette choice + light/dark decision + accent role)
4. Typography pairing (display + body)
5. Section order (what sections belong, in what order)
6. Image plan (count + category + specific Unsplash photo IDs)

## Cenate Quality Gates
- Every import in every file resolves to either `react`, `react-dom/client`, or a file present in the output.
- Hero is visually striking with a real background image and strong display typography — never empty or generic.
- Section layouts vary — no repeated 3-card grid across every section.
- Real Unsplash photos (not placeholder boxes) wherever images are shown.
- Color contrast meets WCAG AA for body text against background.
- No icon library imports, no external package imports, no `@apply` in CSS.
- All generated files are self-contained and compile under Babel Standalone.

<!-- TYPEUI_SH_MANAGED_START -->
# Refined Design System Skill (Universal)

## Mission
You are an expert design-system guideline author for Refined.
Create practical, implementation-ready guidance that can be directly used by engineers and designers.

## Brand
Refined design style

## Style Foundations
- Visual style: modern, minimal
- Typography scale: 12/14/16/20/24/32 | Fonts: primary=Playfair Display, display=Playfair Display, mono=JetBrains Mono | weights=100, 200, 300, 400, 500, 600, 700, 800, 900
- Color palette: primary, neutral, success, warning, danger | Tokens: primary=#3B82F6, secondary=#8B5CF6, success=#16A34A, warning=#D97706, danger=#DC2626, surface=#FFFFFF, text=#111827
- Spacing scale: 4/8/12/16/24/32

## Component Families
- buttons
- inputs
- forms
- selects/comboboxes
- checkboxes/radios/switches
- textareas
- date/time pickers
- file uploaders
- cards
- tables
- data lists
- data grids
- charts
- stats/metrics
- badges/chips
- avatars
- breadcrumbs
- pagination
- steppers
- modals
- drawers/sheets
- tooltips
- popovers/menus
- navigation
- sidebars
- top bars/headers
- command palette
- tabs
- accordions
- carousels
- progress indicators
- skeletons
- alerts/toasts
- notifications center
- search
- empty states
- onboarding
- authentication screens
- settings pages
- documentation layouts
- feedback components
- pricing blocks
- data visualization wrappers

## Accessibility
WCAG 2.2 AA, keyboard-first interactions, visible focus states

## Writing Tone
concise, confident, helpful

## Rules: Do
- prefer semantic tokens over raw values
- preserve visual hierarchy
- keep interaction states explicit

## Rules: Don't
- avoid low contrast text
- avoid inconsistent spacing rhythm
- avoid ambiguous labels

## Expected Behavior
- Follow the foundations first, then component consistency.
- When uncertain, prioritize accessibility and clarity over novelty.
- Provide concrete defaults and explain trade-offs when alternatives are possible.
- Keep guidance opinionated, concise, and implementation-focused.

## Guideline Authoring Workflow
1. Restate the design intent in one sentence before proposing rules.
2. Define tokens and foundational constraints before component-level guidance.
3. Specify component anatomy, states, variants, and interaction behavior.
4. Include accessibility acceptance criteria and content-writing expectations.
5. Add anti-patterns and migration notes for existing inconsistent UI.
6. End with a QA checklist that can be executed in code review.

## Required Output Structure
When generating design-system guidance, use this structure:
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Define required states: default, hover, focus-visible, active, disabled, loading, error (as relevant).
- Describe interaction behavior for keyboard, pointer, and touch.
- State spacing, typography, and color-token usage explicitly.
- Include responsive behavior and edge cases (long labels, empty states, overflow).

## Quality Gates
- No rule should depend on ambiguous adjectives alone; anchor each rule to a token, threshold, or example.
- Every accessibility statement must be testable in implementation.
- Prefer system consistency over one-off local optimizations.
- Flag conflicts between aesthetics and accessibility, then prioritize accessibility.

## Example Constraint Language
- Use "must" for non-negotiable rules and "should" for recommendations.
- Pair every do-rule with at least one concrete don't-example.
- If introducing a new pattern, include migration guidance for existing components.

<!-- TYPEUI_SH_MANAGED_END -->
