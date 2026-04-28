---
name: cenate-website-generator
description: Operating workflow for Cenate website generation. Forces the correct pre-code sequence before any frontend website code is written.
---

# Cenate Website Generation — Operating Workflow

This skill defines the mandatory workflow for generating website projects in Cenate. It is not advisory. Every step must be followed in order before code is emitted.

## When This Applies

This workflow applies when:
- The user asks to build a website, landing page, portfolio, or any web project
- The `createDocument` tool is called with `kind: "code"` for a website request
- The generation system detects the request as a website via `isWebsiteRequest`

## Mandatory Pre-Code Sequence

Before generating any component file, the following steps MUST be completed in order:

### Step 1: Read the Real User Brief

- The full user request (the `description` field from `createDocument`, not just the `title`) is the primary input.
- If `description` is available, use it for all routing, planning, and generation decisions.
- If only `title` is available, treat it as a short prompt and apply short-prompt inference defaults.
- NEVER ignore the user's stated preferences for style, sections, content, or tone.

### Step 2: Detect Niche and Intent

- Run niche detection on the brief to identify: construction, restaurant, saas, agency, portfolio, realEstate, law, fitness, beauty, or generic.
- The detected niche drives: profile selection, starter base selection, asset planning, curated image selection, and critic rules.
- If the brief contains explicit niche signals, they override ambiguous routing.

### Step 3: Load and Apply Design Rules

The generation prompt contains a layered control stack. The layers are applied in this priority order (most specific wins):

1. **Priority Directives** — hard overrides, banned patterns, pre-emit self-check
2. **Starter Base** — structural scaffold with exact component list and per-section composition instructions (available for: construction, restaurant, saas, portfolio, agency)
3. **Niche Profile** — choreography, pattern vocabulary, motion defaults, layout recipes, image-role rules
4. **Curated Image Library + Asset Plan** — pre-validated niche-specific image URLs + per-section image briefs
5. **Impeccable Taste Layer** — visual composition quality floor (hero composition, section rhythm, image-text interplay, layering, CTA surfaces, footer closure)
6. **Site-Type Composition Modes** — hard contracts for restaurant/saas/portfolio structure
7. **Cenate Design System Skill** — TypeUI-backed baseline (typography scale, color strategy, component rules, runtime constraints)
8. **Planning + Output Format + Per-Section Rules** — mechanical correctness

When two layers conflict, the more specific layer wins. Starter base beats niche profile; niche profile beats Impeccable; Impeccable beats design system skill. Priority directives override everything.

### Step 4: Select Starter Base

- If a starter base exists for the detected niche, use it as the structural starting point.
- The starter base defines exact component files and per-section composition instructions.
- Follow the scaffold — do not invent a generic template when a specific scaffold exists.
- If no starter base exists for the niche, use the niche profile's layout recipes as the structural guide.

### Step 5: Build Asset Plan

- Use the curated image library for all images. Each image has been validated for niche correctness and composition quality.
- Match images to sections by role: hero-focal, project-showcase, editorial-narrative, team-portrait, ambient-atmosphere, process-documentary, venue-context, proof-portrait, product-surface.
- Only fall back to direct Unsplash URLs when no curated image fits the section's role.
- NEVER use generic scenic filler (mountains, lakes, bridges) for a niche that needs specific imagery.

### Step 6: Build Section Choreography

- Follow the niche profile's required choreography as the section sequence.
- Each section must use a distinct composition mode — no two consecutive sections may share the same layout skeleton.
- Vary spacing by section purpose (immersive sections breathe, dense sections compress).
- Include at least one deliberate rhythm break: asymmetry, overlap, inset panel, or surface shift.

### Step 7: Pre-Emit Anti-Generic Check

Before emitting each component, verify:
1. It does not match any banned shape from the priority directives.
2. It does not reuse the previous section's composition language.
3. It could not be swapped into any other industry's website unchanged.
4. Its images serve a composition role (not decorative filler).
5. It would NOT look acceptable in a default Tailwind starter template.

If any check fails, rebuild the section before emitting.

### Step 8: Generate Project Files

- Emit the complete project in the delimited format (===PROJECT_MANIFEST===, ===FILE:...===, ===END_FILE===).
- Every component file must be a default export function using Tailwind utilities.
- Every import must resolve to `react`, `react-dom/client`, or a file also emitted.
- No external packages, no icon libraries, no @apply.
- Images are remote URLs (curated library or Unsplash), not local paths.

### Step 9: Critic Detection

- The critic runs automatically after generation.
- It checks for: weak hero composition, card grid overuse, flat rhythm, generic filler images, CTA without action surface, sitemap footer, and niche-specific failures (SaaS pricing 3-card, portfolio alternating rail, restaurant menu/gallery uniformity, etc.).
- Hard failures trigger a bounded repair pass (one attempt).
- Soft findings are logged for debugging.

### Step 10: Repair (If Needed)

- If the critic finds hard failures, a single repair pass regenerates the project.
- The repair preserves: manifest structure, file set, design direction, typography, color strategy, section order.
- Sections not flagged are preserved as-is.
- Only flagged sections are rebuilt with different composition.

## Hard Rules

These are non-negotiable:

1. **Never generate website code before completing steps 1-7.** The pre-code sequence exists because generation without it produces generic output.
2. **Never rely only on the artifact title when a description/brief exists.** The title is a label. The description is the real input.
3. **Never free-pick generic Unsplash imagery when the curated image library has options.** Curated images are niche-validated. Free-picked images are usually wrong.
4. **Never output a generic card-grid template by default.** Every section must have a composition role, not just content in a box.
5. **Never skip the critic.** It runs automatically. If it finds hard failures, they must be repaired.
6. **Never duplicate the design system.** The Cenate Design System Skill (`.agents/skills/design-system/SKILL.md`) is the single source of truth for typography, color, component rules, and runtime constraints. Reference it — do not redefine its rules.
7. **files[] is the single source of truth.** The preview renders from files[]. There is no separate preview system.

## Layer Responsibilities

| Layer | Owns | Does NOT Own |
|-------|------|-------------|
| Priority Directives | Banned patterns, pre-emit checks, composition diversity | Section structure |
| Starter Base | Component list, per-section composition | Typography, color, runtime |
| Niche Profile | Choreography, pattern vocabulary, motion, image roles | Component-level code |
| Curated Images + Asset Plan | Image selection, per-section image briefs | Layout structure |
| Impeccable Taste Layer | Visual composition floor (hero, rhythm, layering, CTA, footer) | Niche-specific rules |
| Site-Type Modes | Restaurant/SaaS/Portfolio structural contracts | Generic site types |
| Design System Skill | Typography, color, component rules, runtime constraints | Niche routing, composition |
| Critic | Post-generation quality gate, repair | Pre-generation planning |
