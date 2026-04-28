---
version: alpha
name: Cenate Editorial Luxury
description: Restrained editorial luxury system for cinematic, high-contrast premium websites.
colors:
  primary: "#c9a96b"
  on-primary: "#120f0c"
  secondary: "#2f2a25"
  on-secondary: "#f4ede2"
  tertiary: "#5d4630"
  background: "#120f0c"
  surface: "#1d1814"
  surface-strong: "#2a241f"
  on-surface: "#f4ede2"
  on-surface-muted: "#b8a993"
  border: "#4b3b2b"
typography:
  hero-display:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.03em
  section-heading:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.24em
rounded:
  sm: 8px
  md: 18px
  lg: 24px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 72px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.md}"
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.md}"
    padding: 16px
  hero-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  proof-band:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 16px
---

## Overview

Use darkness as luxury. The page should feel like a quiet, high-end venue with controlled contrast, metallic restraint, and deliberate negative space.

## Colors

Primary is reserved for the highest-value action and for thin editorial accents. Surfaces stay in graphite and espresso ranges. Copy should lean warm ivory rather than pure white.

## Typography

Headlines are dramatic serif statements. Body copy remains compact and editorial. Labels are uppercase and widely tracked.

## Layout

Favor split compositions, framed media, ruled dividers, and measured section rhythm. Heroes and CTAs should breathe; internal card spacing should stay disciplined.

## Elevation & Depth

Depth comes from layered dark surfaces, framed panels, and restrained shadows. Avoid glossy effects and glows.

## Shapes

Corners are soft but not playful. Use larger rounding for image frames and hero panels; keep inputs and secondary controls tighter.

## Components

Primary buttons should feel tailored and formal. Proof surfaces should read as venue-grade panels, not generic SaaS cards. Inputs should feel integrated into dark hospitality surfaces.

## Do's and Don'ts

- Do use the metallic accent sparingly and intentionally.
- Do preserve editorial asymmetry and framed media.
- Don't flood the page with bright fills.
- Don't mix this system with playful rounded-card SaaS language.
