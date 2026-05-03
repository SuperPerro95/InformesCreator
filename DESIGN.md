---
name: InformesCreator
description: Asistente de IA para docentes — redacción de informes escolares
colors:
  canvas: "#FDFCF9"
  surface: "#FFFFFF"
  surface-subtle: "#F7F7F5"
  text-primary: "#2D2D2D"
  text-secondary: "#5C5C5C"
  text-tertiary: "#757575"
  text-muted: "#6B6B6B"
  border-default: "#E8E6E1"
  border-subtle: "#F0EEEA"
  accent: "#1D4ED8"
  accent-hover: "#1E3A8A"
  secondary: "#0891B2"
  tertiary: "#D97706"
  success-text: "#047857"
  warning-text: "#B45309"
  danger-text: "#B91C1C"
typography:
  display:
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  mono:
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'tnum' 1"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  badge:
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: InformesCreator

## 1. Overview

**Creative North Star: "The Quiet Desk"**

InformesCreator is a calm, capable workspace for teachers. Like a well-organized desk at the end of a school day — everything in its place, nothing shouting for attention. The interface is warm and trustworthy, not flashy or cold. It treats teachers as professionals: no gamification, no cartoonish illustration, no cluttered dashboards.

The system lives in the territory between a clean productivity tool (think Linear or Notion) and a warm editorial space (think well-designed paper forms). Generous whitespace gives each screen room to breathe. Subtle shadows suggest gentle depth without calling attention to themselves. Rounded corners feel approachable without being juvenile.

**Key Characteristics:**
- Warm off-white canvas (#FDFCF9) as the base — a subtle departure from pure white that feels tangible, not sterile
- Blue accent used sparingly and purposefully — never more than 10-15% of any screen
- Flat-by-default surfaces with micro-shadows only where interaction happens
- Soft, rounded controls (8px radii) — professional but not rigid
- Spanish-first interface for Argentine teachers — natural language, not translated English

This system explicitly rejects: cold enterprise dashboards, cartoonish edtech, generic Bootstrap SaaS, and any interface that adds cognitive load instead of reducing it.

## 2. Colors: The Warm & Trustworthy Palette

The palette is restrained by design: warm-tinted neutrals carry the surface, a single deep blue accent signals interaction, and secondary/tertiary colors exist only for status feedback.

### Primary
- **Confident Blue** (#1D4ED8): The sole accent. Used for primary actions, active states, and the navigation accent. Its rarity on screen is the point — when blue appears, it means something is actionable or active. Never used decoratively.

### Secondary
- **Calm Teal** (#0891B2): Limited to the customization panel and secondary interactive elements. A subtle complement to the primary blue, never competing.

### Tertiary
- **Warm Amber** (#D97706): Reserved for warnings, the tertiary badge variant, and the "redo" action. Not an accent — a semantic signal.

### Neutral
- **Warm Canvas** (#FDFCF9): The page background. Slightly warm to avoid the clinical feel of pure white. The entire interface sits on this.
- **Clean White** (#FFFFFF): Surfaces, cards, elevated panels, inputs.
- **Subtle Warm** (#F7F7F5): Secondary surfaces, table headers, hover backgrounds. One step off the canvas.
- **Ink** (#2D2D2D): Primary text. High contrast, warm-leaning black.
- **Muted Ink** (#5C5C5C): Secondary text, labels, metadata.
- **Faint Ink** (#757575): Placeholder text, disabled copy.
- **Warm Line** (#E8E6E1): Default borders. Warm-grey, not cool grey.
- **Lighter Line** (#F0EEEA): Subtle borders, dividers, table row separators.

### Semantic
- **Calm Green** (#047857): Success states, completed progress bars.
- **Alert Amber** (#B45309): Warning states.
- **Gentle Red** (#B91C1C): Destructive actions, error text.

### Named Rules
**The Rarity Rule.** The blue accent covers ≤15% of any given screen. Buttons, active nav items, progress fills. No blue headers, no blue decorative borders, no blue for the sake of filling space.

**The Warm Neutral Rule.** Every neutral carries a trace of warmth. Canvas, surface, borders, text — none are pure grey. The chroma is barely perceptible (the canvas is oklch(98.5% 0.008 80)), but its absence would register as cold.

## 3. Typography

**Display Font:** Nunito (with system sans fallback)
**Body Font:** Inter (with system sans fallback)
**Label/Mono Font:** JetBrains Mono (with monospace fallback)

**Character:** Rounded meets rational. Nunito's friendly curves lead headings; Inter's crisp neutrality handles body text. The pairing is approachable without being soft, precise without being cold.

### Hierarchy
- **Display** (800, 2rem / 32px, 1.3): Page titles and hero headings. Nunito's extra-bold weight gives authority without shouting.
- **Headline** (700, 1.5rem / 24px, 1.3): Section titles. The primary organizing element on any screen.
- **Title** (700, 1.125rem / 18px, 1.3): Card titles, wizard step headers, sidebar course names.
- **Body** (400, 0.9375rem / 15px, 1.6): Continuous reading — report text, descriptions, help content. Capped at 65-75ch max-width where applicable.
- **Label** (500, 0.875rem / 14px, 1.5): Form labels, button text, navigation links. One weight up from body for differentiation.
- **Mono** (400, 0.8125rem / 13px, 1.6): Code, numbers, tabular data. Tabular-nums enabled by default via `font-variant-numeric: tabular-nums`.

### Named Rules
**The One-Size-Down Rule.** Labels and metadata are never below 0.75rem (12px). Teachers may work on smaller screens or with reduced vision; 12px is the floor for legible text.

## 4. Elevation

The system is flat by default. Depth is conveyed through tonal layering (background shifts) and micro-shadows on interactive surfaces.

**Tonal layers (no shadows):**
- Canvas (#FDFCF9) → Surface-subtle (#F7F7F5) → Surface (#FFFFFF)

**Shadow vocabulary (interactive surfaces only):**
- **Card rest** (`0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)`): The default card elevation. A barely-there lift that separates content from the background.
- **Card hover** (`0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)`): Lifted on interaction. The shadow spreads wider and deeper, suggesting the card is closer to the user.
- **Button rest** (`0 2px 8px rgba(29,78,216,0.2)`): The primary button casts a subtle blue-tinted shadow, hinting it's actionable.
- **Button hover** (`0 4px 16px rgba(29,78,216,0.3)`): Deeper and wider on hover, reinforcing the affordance.
- **Sticky header** (`0 2px 12px rgba(0,0,0,0.04)`): A hairline shadow that separates a fixed header from scrolling content.
- **Focus ring** (`0 0 0 3px var(--accent-ring)`): Not a shadow but a colored ring for keyboard focus. Consistent 3px width at 15% opacity.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, focus, elevation). A card without interaction is indistinguishable from a flat surface.

## 5. Components

### Buttons
- **Shape:** Gently rounded corners (8px). Not pill-shaped — the radius is deliberate but not exaggerated.
- **Primary:** Confident Blue (#1D4ED8) background, white text, 12px 24px padding, blue-tinted shadow at rest. Hover: darker blue (#1E3A8A), deeper shadow, slight scale-up (1.02).
- **Secondary:** White background, 2px warm line border, primary text color. Hover: subtle warm background, darker border.
- **Ghost:** Transparent background, muted text. Hover: subtle warm background, primary text. Used for low- prominence actions.
- **Danger:** Gentle Red background with red border. Used only for destructive confirmations.
- **All buttons:** Disabled state at 50% opacity, no hover effects. Font-weight 600 across the board.

### Cards / Containers
- **Corner Style:** Rounded (12px, radius-lg). Soft enough to feel intentional.
- **Background:** Clean White (#FFFFFF) with a 2px warm line border.
- **Shadow Strategy:** Card rest shadow at default; card hover shadow on interactive cards. Non-interactive containers (form sections, status boxes) use tonal layering instead — no shadow.
- **Internal Padding:** 20px (space-5) for most cards; 24px (space-6) for wizard step panels.
- **"Paper Sheet" variant:** Used for generated reports. Canvas background, subtle repeating line pattern, multi-layered shadow that simulates stacked paper. Internal padding 24px (space-6).

### Inputs / Fields
- **Style:** Clean White background, 2px warm line border, 8px radius. No background fill at rest.
- **Focus:** Blue accent border, 3px blue-tinted focus ring (box-shadow: 0 0 0 3px var(--accent-ring)).
- **Error:** Gentle Red border, pale red background tint.
- **Disabled:** Subtle warm background, tertiary text color.
- **Placeholder:** Faint Ink (#757575).

### Navigation (Sidebar)
- **Style:** Vertical nav with pill-shaped (8px radius) course items. No left-border accents.
- **Default:** Secondary text, no background. Hover: subtle blue tint (4% opacity). Active: slightly stronger blue tint (8% opacity), text shifts to primary color.
- **Mobile:** Hidden behind a FAB toggle; slides in as an overlay drawer.
- **Typography:** Body font, 0.875rem / 500 weight for course names; mono for counts and progress.

### Badges / Pills
- **Shape:** Fully rounded (pill, 9999px). The only component that goes full pill.
- **Usage:** Status indicators, counts, section labels. Semantic colors (success/warning/danger/info/subtle).
- **Typography:** 0.6875rem, 700 weight, uppercase with letter-spacing.
- **Subtle variant:** Subtle warm background, muted text — used for neutral counts and non-semantic badges.

### Selection Cards
- **Style:** Card-like (2px border, 12px radius, 20px padding, card shadow).
- **Selected state:** Blue-tinted background (8% opacity), blue border, elevated shadow.
- **Disabled state:** 50% opacity, dashed borders.

### Toast Notifications
- **Style:** Rounded (12px), 2px colored border matching semantic role, multi-shadow for lift.
- **Position:** Fixed bottom-right, stacked in reverse order.
- **Entry:** Slide up + scale in (300ms ease-out). Exit: slide right + fade.
- **Semantic variants:** success (green), error (red), warning (amber), info (blue).

### Dialog / Confirmation
- **Style:** Centered modal card (12px radius, elevated shadow, 2px border).
- **Overlay:** Semi-transparent black (25%) with 2px blur.
- **Entry:** Fade in overlay, scale in card.

### Tabs
- **Style:** Underline-style. Inactive: muted text, transparent background. Active: blue text with 2px blue underline.
- **Interactive:** Hover adds subtle warm background to inactive tabs.

### Progress Bar
- **Style:** 4-6px track, pill-shaped (9999px), blue fill. Completed: green fill.
- **Animation:** Width transitions at 500-600ms with cubic-bezier(0.4, 0, 0.2, 1).

## 6. Do's and Don'ts

### Do:
- **Do** use the warm canvas (#FDFCF9) as the primary page background — it's the foundation of the system's calm, trustworthy feel.
- **Do** keep blue accent coverage under 15% per screen. Blue means action; its rarity preserves its meaning.
- **Do** use tonal layering (canvas → surface-subtle → surface) for depth before reaching for shadows.
- **Do** maintain 8px rounded corners as the component default — it's the system's signature softness without being juvenile.
- **Do** keep body text at minimum 0.875rem (14px) for primary content, 0.75rem (12px) for secondary.
- **Do** use the paper-sheet component for generated reports — the subtle line pattern and layered shadow make the output feel tangible.
- **Do** match button prominence to action importance: one primary button per view, secondary for alternatives, ghost for low-stakes.

### Don't:
- **Don't** use cold enterprise aesthetics — no dark grey headers, no dense table grids, no "admin dashboard" feel. This is a tool for teachers, not a control panel.
- **Don't** use cartoonish illustrations, gamification badges, or childish colors. Teachers are professionals; the interface treats them as such.
- **Don't** use gradient text (`background-clip: text`) — it's decorative noise. Emphasis comes from weight and size.
- **Don't** use side-stripe borders (left or right borders >1px as colored accents). If something needs emphasis, use full borders, background tints, or nothing.
- **Don't** use glassmorphism (blurred backgrounds) as a default pattern. Purposeful exceptions only.
- **Don't** wrap everything in a container card. Most surfaces don't need a border and shadow — they should sit on the warm canvas naturally.
- **Don't** animate CSS layout properties (width, height, position). Use transforms and opacity only.
- **Don't** use modal dialogs as the first interaction pattern — exhaust inline and progressive alternatives first.
- **Don't** use em dashes in copy. Use commas, colons, periods, or parentheses.
