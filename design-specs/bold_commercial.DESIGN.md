---
version: alpha
name: Cenate Bold Commercial
description: Sales-driven high-contrast system for proof-heavy commercial websites.
colors:
  primary: "#f58a1f"
  on-primary: "#111111"
  secondary: "#202631"
  on-secondary: "#f8fafc"
  tertiary: "#ff5b2f"
  background: "#11151d"
  surface: "#1b222d"
  surface-strong: "#263142"
  on-surface: "#f8fafc"
  on-surface-muted: "#b4c0d0"
  border: "#374455"
typography:
  hero-display:
    fontFamily: Bebas Neue
    fontSize: 64px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: 0.02em
  section-heading:
    fontFamily: Bebas Neue
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.02em
  body-md:
    fontFamily: Barlow
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  label-caps:
    fontFamily: Barlow
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.2em
rounded:
  sm: 8px
  md: 14px
  lg: 18px
spacing:
  xs: 8px
  sm: 14px
  md: 24px
  lg: 40px
  xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.sm}"
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.sm}"
    padding: 16px
  stats-band:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 24px
  proof-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 24px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 16px
---

## Overview

Use contrast as momentum. The site should feel commercially aggressive, proof-forward, and built to convert, with structure doing the selling before decoration does.

## Colors

Lean on deep charcoal surfaces, hot action accents, and high-contrast type. Metrics, CTAs, and proof callouts should feel louder than the background.

## Typography

Headlines should be condensed, forceful, and uppercase by feel. Body text stays direct and readable, with labels behaving like commercial markers.

## Layout

Favor proof walls, stat bands, split conversion sections, and hard shifts in density. The page should move quickly and decisively.

## Elevation & Depth

Panels should separate clearly, but depth must still feel industrial rather than glossy. Avoid soft luxury cues.

## Shapes

Use firm edges with modest rounding. The interface should feel solid and sales-ready.

## Components

Primary buttons should read as immediate action. Stats bands and proof cards should carry conviction and clarity, not editorial softness.

## Do's and Don'ts

- Do give metrics and CTAs real visual weight.
- Do use proof before generic explanation when possible.
- Don't soften the system into boutique or artisan language.
- Don't let secondary surfaces overpower the primary action color.
