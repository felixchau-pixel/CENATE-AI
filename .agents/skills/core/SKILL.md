---
name: core-contract
description: Universal build, runtime, and output rules for all Cenate website generations. Always loaded.
type: core
---

# Cenate Core Contract

This skill defines the non-negotiable build and runtime rules that apply to every website generation, regardless of niche or style. It is always loaded.

## Runtime Environment

Generated projects run inside a sandboxed iframe using Babel Standalone + React 18 UMD + Tailwind CDN.

## Import Rules

- Only `react` and `react-dom/client` are available as built-ins.
- All other imports MUST resolve to a file present in the output (either generated or pre-injected by the scaffold system).
- Pre-injected files you can import from: `@/components/ui/*` (Button, Input, Textarea, Badge, Card, Section, Container, Heading, Separator, Accordion, Tabs, Dialog, Sheet, MobileNav, AspectRatio, Testimonial, StatsBand, Gallery), `@/lib/utils` (cn utility).
- Path alias `@/...` maps to `src/...`.
- CSS imports must target generated files (e.g. `./styles/globals.css`).
- NO external npm packages: no lucide-react, clsx, framer-motion, @radix-ui, shadcn, next/*, react-router, icon libraries, or any other package.

## Icons

- Inline SVG only. Embed `<svg>...</svg>` directly in JSX.
- Do NOT import from any icon library.

## Images

- Use images from the curated image library or generated images first.
- Fallback: direct Unsplash URLs only when no curated/generated image fits.
- URL format: `https://images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop&q=80`.
- Do NOT use `import` for image files.
- Do NOT reference local `/public` paths — there is no asset server at runtime.
- Always include descriptive alt text.

## Styles

- Tailwind utility classes in `className` only.
- Tailwind CDN JIT scans class names — `@tailwind` directives and `@apply` in CSS are ignored.
- Plain CSS in `src/styles/globals.css` is injected as a `<style>` tag; custom selectors, resets, and keyframes are fine.

## Navigation

- Plain `<a href="#section">` anchor tags for in-page navigation.
- Do NOT use react-router or Next.js link components.

## Entry Point

- `src/main.tsx` is the runtime entry. It must `import App from "./App"`, `import "./styles/globals.css"`, and call `ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>)`.

## Primitive Usage

- Every body section MUST import and use Section, Container, Heading from `@/components/ui/`.
- All primary CTAs MUST use Button component, not raw styled anchors/buttons.
- Navbar MUST import MobileNav for responsive mobile menu — no custom hamburger state.

## Output Format

- Emit the complete project in the delimited format: `===PROJECT_MANIFEST===`, `===FILE:...===`, `===END_FILE===`.
- Every component file must be a default export function using Tailwind utilities.
- Every import must resolve to `react`, `react-dom/client`, or a file also emitted.
- Do NOT generate scaffold files, configs, UI primitives, entry files, or test files — they are pre-injected.

## Quality Gates

- Every import in every file resolves.
- Hero is visually striking with a real background image and strong display typography.
- Section layouts vary — no repeated 3-card grid across every section.
- Real curated or generated photos wherever images are shown.
- Color contrast meets WCAG AA for body text against background.
- No icon library imports, no external package imports, no `@apply` in CSS.
- All generated files are self-contained and compile under Babel Standalone.
- Typography named in the manifest is visibly implemented in code.
- The page should not resemble a starter template when viewed as a whole.

## Style Isolation Rule

Exactly one style skill is loaded per generation. Do not blend visual grammar from other styles. Do not invent typography, color, or motif rules that contradict the loaded style skill. If the user asks for a hybrid, the router will handle it — do not self-blend.
