# Cenate DESIGN.md Specs

This directory is Cenate's local design-control layer built from the `design.md` format.

Structure:
- One `*.DESIGN.md` file per routed Cenate style family.
- YAML front matter defines machine-readable tokens.
- Markdown sections define the visual rationale and guardrails.

Current spec files:
- `editorial_luxury.DESIGN.md`
- `modern_minimal.DESIGN.md`
- `bold_commercial.DESIGN.md`
- `warm_artisan.DESIGN.md`

Canonical DESIGN.md sections used here:
1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

Validation:
- `pnpm design:check` lints all local specs.
- `pnpm design:diff -- <before> <after>` compares two specs and reports regressions.

Runtime use:
- generation planning resolves a validated DESIGN.md spec before prompt composition
- the resolved spec contributes token summaries, component mappings, and a Tailwind token export block to the prompt stack
- if a spec has lint errors, Cenate falls back to the existing planning flow instead of breaking generation
