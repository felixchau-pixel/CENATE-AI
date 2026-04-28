---
version: alpha
name: Cenate Modern Minimal
description: Product-grade minimal system for crisp, low-noise interfaces.
colors:
  primary: "#3e63dd"
  on-primary: "#ffffff"
  secondary: "#eef2ff"
  on-secondary: "#111827"
  tertiary: "#dbe7ff"
  background: "#fafbff"
  surface: "#ffffff"
  surface-strong: "#f3f6fb"
  on-surface: "#111827"
  on-surface-muted: "#5b6475"
  border: "#dbe1ea"
typography:
  hero-display:
    fontFamily: Inter
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: -0.03em
  section-heading:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.18em
rounded:
  sm: 10px
  md: 16px
  lg: 20px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 36px
  xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.md}"
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.md}"
    padding: 16px
  card-standard:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  proof-strip:
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

Use restraint as the main design move. The interface should feel product-grade, focused, and highly legible, with energy coming from hierarchy instead of decoration.

## Colors

Keep the canvas nearly white, use near-black copy, and concentrate accent energy into a single blue primary. Secondary surfaces should be subtle, not atmospheric.

## Typography

Typography is direct and efficient. Large headings should feel sharp, tight, and modern. Body text should remain compact and controlled.

## Layout

Use crisp containers, deliberate white space, and simple grid logic. Prefer product-like framing, proof rails, and non-repetitive density shifts.

## Elevation & Depth

Depth should come from subtle panel separation, faint borders, and precise shadows. Avoid blur-heavy or cinematic effects.

## Shapes

Radii are moderate and intentional. The system should feel polished, not playful.

## Components

Buttons should look decisive and product-like. Cards and proof strips should remain clean and low-noise. Inputs should feel native to a modern software surface.

## Do's and Don'ts

- Do keep the interface crisp and calm.
- Do use blue for hierarchy and interaction, not decoration.
- Don't stack multiple ornamental gradients or glow effects.
- Don't reuse the same rounded card shell everywhere.
