---
name: InformesCreator
description: Asistente de informes escolares para docentes argentinos
colors:
  primary: "#1D4ED8"
  primary-hover: "#1E3A8A"
  secondary: "#0891B2"
  tertiary: "#D97706"
  canvas-bg: "#FDFCF9"
  surface: "#FFFFFF"
  surface-subtle: "#F7F7F5"
  text-primary: "#2D2D2D"
  text-secondary: "#5C5C5C"
  text-tertiary: "#757575"
  border-default: "#E8E6E1"
  border-subtle: "#F0EEEA"
  success-bg: "#ECFDF5"
  success-text: "#047857"
  warning-bg: "#FFFBEB"
  warning-text: "#B45309"
  danger-bg: "#FEF2F2"
  danger-text: "#B91C1C"
  info-bg: "#EFF6FF"
  info-text: "#1E40AF"
typography:
  display:
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontWeight: 800
  headline:
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontWeight: 700
  title:
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontWeight: 600
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 500
  mono:
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace"
    fontWeight: 400
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
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-default}"
    padding: "10px 12px"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  sidebar-item:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: InformesCreator

## 1. Overview

**Creative North Star: "La Mesa del Docente"**

InformesCreator is the teacher's desk: a tidy, well-organized workspace where everything has its place. Calm surfaces, clear tools, nothing demands attention that hasnt earned it. The interface feels like a well-organized colleague who has done this before: calm under pressure, clear about next steps, never making you guess.

Warmth lives in the materials (creamy paper backgrounds, soft grays, blue ink accents) not in decorative flourishes. Efficiency lives in the task layout (progressive disclosure, focused wizard steps, one thing at a time) not in density or speed.

This system explicitly rejects the gray-on-gray enterprise dashboard, the cold SaaS panel, the 12-level nested menu. It is not Salesforce, not SAP, not any tool that makes a teacher feel like they are filing tax returns instead of writing about their students.

**Key Characteristics:**

- Paper-like warmth: surfaces in warm off-whites, never cold grays or sterile white
- Clear hierarchy without visual noise: one primary action per view, revealed progressively
- Quiet confidence: animations confirm actions, they do not entertain
- Argentine classroom native: Spanish-language UI, local terminology, culturally aware
- Accessible by default: WCAG 2.1 AA, keyboard navigable, reduced-motion respected

## 2. Colors: La Mesa Palette

The palette draws from classroom materials: cream paper, soft gray chalkboard surfaces, blue ink, and status colors that feel like practical annotations.

### Primary

- **Tinta Azul** (#1D4ED8, oklch(45% 0.22 260)): The single accent color. Used for primary actions, current selection, active navigation, and interactive states. Never decorative. Its rarity (under 10% of any given surface) is the point.

### Secondary

- **Cian Claro** (#0891B2, oklch(55% 0.14 230)): Used for low-ego interactive elements: secondary buttons, info chips, and the socioemotional questionnaire section tint. Less saturated than primary, never competes.

### Tertiary

- **Ambar** (#D97706, oklch(60% 0.15 75)): Alert accent only. Starred in the content questionnaire section header. Not an interactive color.

### Neutral

- **Papel Crema** (#FDFCF9, oklch(99% 0.006 80)): Page background. The canvas everything sits on. Warm but barely perceptible.
- **Fondo Pálido** (#FFFFFF, oklch(100% 0 0)): Surface color for cards, panels, and elevated containers. True white for maximum cleanliness.
- **Gris Suave** (#F7F7F5, oklch(97.5% 0.005 80)): Subtle background for sidebars, stats panels, and secondary container areas.
- **Tinta Oscura** (#2D2D2D, oklch(25% 0.005 260)): Primary text. Near-black with a faint blue-cast for legibility on cream.
- **Tinta Media** (#5C5C5C, oklch(45% 0.005 260)): Secondary text, descriptions, hints.
- **Tinta Tenue** (#757575, oklch(54% 0 0)): Tertiary text, placeholders, muted labels.
- **Borde Tierra** (#E8E6E1, oklch(91% 0.008 80)): Default border. Warm enough to avoid cold-gray separation lines.
- **Borde Sutil** (#F0EEEA, oklch(94% 0.006 80)): Subtle borders, dividers, section separators.

### Status

- **Verde Éxito** (bg #ECFDF5, text #047857): Confirmation, completion, progress milestones.
- **Amarillo Advertencia** (bg #FFFBEB, text #B45309): Warnings, attendance concerns, medium-severity states.
- **Rojo Peligro** (bg #FEF2F2, text #B91C1C): Errors, destructive actions, high-severity alerts.
- **Azul Información** (bg #EFF6FF, text #1E40AF): Informational banners, neutral status updates.

### The Tinta Azul Rule

The primary accent is used on 10% or less of any given screen. It appears on buttons, active nav items, and focus indicators. If a screen looks blue, the rule is broken. Rarity is what gives the accent its signal value.

### The Warm Ground Rule

Every neutral carries a trace of warmth. No `#F5F5F5`, no `#E0E0E0`, no pure cool grays. The canvas, surfaces, and borders all lean slightly warm (chroma 0.005-0.01 toward 80deg on the hue wheel). This is what keeps the interface from feeling like a corporate spreadsheet.

### Dark Mode

When the user's system requests dark mode via `prefers-color-scheme: dark`, neutrals invert to warm dark grays (canvas at #1A1A1C, surface at #242426). The accent shifts to a lighter blue (oklch(65% 0.18 260)) for contrast on dark surfaces.

## 3. Typography

**Display Font:** Nunito (with system sans fallback)
**Body Font:** Inter (with system sans fallback)
**Label/Mono Font:** JetBrains Mono (with monospace fallback)

**Character:** Nunito brings warmth through its rounded, humanist terminals. Inter provides clarity and density for body text. The pairing is a calm, pragmatic office: the headings feel approachable, the body text stays out of the way.

### Hierarchy

- **Display** (Nunito 800, 1.5rem, 1.3): Hero tagline only. The welcome screen's main message. Never used inside the app shell.
- **Headline** (Nunito 700, 1.125-1.25rem, 1.4): Section titles, drawer names, prominent labels. One per view.
- **Title** (Nunito 600-700, 0.9375rem, 1.4): Sidebar headings, card titles, modal headers.
- **Body** (Inter 400-500, 0.875rem, 1.6): Main reading text, button labels, input values, list items. Capped at 65-75ch for prose passages.
- **Body Small** (Inter 400, 0.8125rem, 1.5): Secondary descriptions, help text, metadata.
- **Label** (Inter 500-600, 0.75rem, 1.4): Hints, helper text, timestamps, small annotations.
- **Label Tiny** (Inter 600, 0.6875rem, 1.3, uppercase 0.04em tracking): Badge counts, code tags, compact metadata.
- **Mono** (JetBrains Mono 400, 0.875rem, 1.5): Data values, code references, attendance percentages.

### The One-Family-Plus Rule

App UI uses Nunito for hierarchy and Inter for everything else. There is no display/body pairing for the app shell: Nunito carries titles and headings, Inter carries all body, labels, and data. Pure Inter surfaces (no Nunito) are permitted in utility panels.

### The Line Length Rule

Prose body text never exceeds 75 characters per line. Compact data views (tables, lists, dense cards) may run longer at the designers discretion.

## 4. Elevation

The system is flat by default. Surfaces sit on the same plane; depth is communicated through tonal layering (darker surfaces behind, lighter surfaces in front) rather than shadows. Shadows appear only as a response to state: hover, focus, active interaction.

This is by design. Teachers work on varied hardware and in varied lighting. Drop shadows on every card create visual noise and perform poorly on older machines. Tonal layering costs nothing and scales everywhere.

### The Flat-By-Default Rule

Surfaces are flat at rest. Shadows signal an interaction, not a hierarchy. The one exception is the student drawer, which overlays the content at a clearly elevated z-index (100) with a right-to-left slide transition and a semi-transparent backdrop.

### Shadow Vocabulary

- **Card shadow** (`0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.05)`): Subtle lift for standalone cards like the course view surface. Nearly invisible; its purpose is optical separation, not drama.
- **Card hover** (`0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.05)`): Activated on hover for interactive cards (model selection, variant cards). Signals affordance.
- **Button shadow** (`0 2px 8px rgba(29,78,216,0.25)`): Present at rest on primary buttons. Intensifies on hover.
- **Header shadow** (`0 2px 12px rgba(0,0,0,0.06)`): The sticky header barely floats above content.
- **Focus ring** (`0 0 0 3px rgba(29,78,216,0.3)`): Not a shadow but the same visual tier: interaction feedback on form controls and interactive cards.

### Motion

Transitions follow the quiet competence principle: 200-300ms, eased with `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out quad). The questionnaire flow uses a faster exponential ease (`cubic-bezier(0.16, 1, 0.3, 1)`) for question transitions so the wizard feels responsive, not languid.

- Layout properties are never animated. Transitions apply only to opacity, transform, color, background, border-color, and box-shadow.
- Orchestrated entrances do not exist. Content fades and slides in as data arrives; there is no page-load choreography.
- Reduced motion is respected via `prefers-reduced-motion: reduce`, which kills all animation durations to 0.01ms.
- The one deliberate animation exception: the progress bar fill animates at 500-600ms on the exponential ease, because watching a bar fill is the single moment the user is waiting and the animation signals forward progress.

## 5. Components

### Buttons

- **Shape:** Moderately rounded (8px radius). Full borders, never underlines or text-only.
- **Primary:** Tinta Azul background, white text, 12px 24px padding. Hover darkens to primary-hover, lifts 1px with an intensified shadow. Active presses flat (scale 0.99).
- **Secondary:** Transparent background, Tinta Azul text, 8px 16px padding, same 8px radius. Subtle tinted background on hover. Used for non-primary actions and context switches.
- **Ghost:** No border, no background. Subtle hover tint. For dismissable actions and tertiary commands. Must be accompanied by an icon or clear label.
- **Danger:** Red text, transparent background. Hover fills with danger background. Used for logout, deletion, destructive operations.
- **Icon button:** 44x44px minimum touch target. Ghost style. For toolbar actions and drawer controls.

### Inputs / Fields

- **Style:** White background, 1px solid Borde Tierra border, 8px radius. Internal padding 10px 12px.
- **Focus:** Border shifts to Tinta Azul, 3px focus ring appears (accent-ring). No glow, no inset shadow.
- **Error:** Red border, red helper text below the field. The border shift is the primary error signal, not the text.
- **Disabled:** 50% opacity, no pointer events. No special border treatment.
- **Select elements:** Same visual vocabulary as inputs. Native select appearance is preserved; no custom dropdowns.

### Selection Cards (Model / Variant Selection)

- **Style:** White background, 2px Borde Tierra border, 8px radius. Internal padding 16px.
- **Default:** Shows title, description, optional badge.
- **Hover:** Border shifts to Tinta Azul, subtle accent background tint.
- **Selected:** Border becomes Tinta Azul, 3px focus ring appears. Optionally, background tint intensifies.
- **Layout:** Stacked vertically on narrow screens, auto-fill grid (min 260px columns) on wider screens.

### Sidebar Navigation

- **Structure:** Fixed-width 260px panel on Gris Suave background. 2px Borde Tierra right border separates it from content.
- **Items:** Soft gray background hover, accent background tint for active course. Rounded 8px.
- **Course badge:** Tiny mono font (0.6875rem), white background, muted text. Indicates student count.
- **Mobile:** Slides in from left at 280px width, with backdrop overlay. Transition uses the standard 300ms ease.

### Student Drawer

- **Behavior:** Slides in from the right edge, 520px wide (90vw max on mobile). Overlay backdrop at 20% opacity black.
- **Header:** Sticky at top, shows student name in Headline weight with left/right navigation chevrons.
- **Content:** Scrollable area below the header containing the report editor (textarea or markdown preview), action buttons, and save status indicator.
- **Transition:** 300ms ease on translateX for the panel, opacity for the overlay. Respects reduced motion.

### Wizard / Progress Bar

- **Structure:** Horizontal step indicator with three labelled steps (Cuestionario / Configuracion / Informe). Each step shows an icon and label.
- **Step state:** Active step is Tinta Azul, completed steps show a success state, future steps are muted gray. The bar is non-interactive — users navigate via forward/back buttons, not the step indicator.
- **Content transition:** Step panels fade and translate vertically (8px) with 350ms exponential ease. Only one step is visible at a time.

### Observation Rows

- **Structure:** Grid with date, code badge, comment text, and remove button. Each row is tinted according to its attendance code (green for present, blue for absent, amber for no-materials, gray for tardy).
- **Code badge:** Small pill (0.75rem, uppercase, color-matched to the row tint). The code badge carries the semantic weight; the row tint is a secondary reinforcement.
- **Quick-add:** A textarea for batch-pasting observations in `dd/mm - Comment` format.

### Paper Sheet

- **Behavior:** Report preview styled like ruled notebook paper. Cream background, repeating thin horizontal lines, generous internal padding (24px+). Centered at max 880px.
- **The paper sheet is the one decorative element in the entire system.** Its purpose is psychological: the teacher sees a report that looks like something they would write, not a cold AI output.

### Modals / Dialogs

- **Overlay:** Help modal and profile panel slide in from the right (same pattern as student drawer). Confirmation dialogs are centered cards with backdrop overlay.
- **No nested modals.** A modal never opens another modal.
- **Confirmation:** Simple card (max 400px), centered, with message and two buttons (Cancel / Confirm). The confirm action is primary-styled if constructive, danger-styled if destructive.

### Toast Notifications

- **Position:** Fixed bottom-right corner. Single toast visible at a time; new toasts replace the current one.
- **Style:** White surface, 8px radius, subtle shadow. Icon (success check, error X, info dot) precedes the message. Auto-dismisses after 3 seconds for info, stays for errors.
- **Transition:** Slides up and fades in at 250ms ease. Reverse on dismiss.

## 6. Dos and Donts

### Do

- **Do** use Tinta Azul sparingly. One primary action per view, one active item per list. If more than one element competes for accent color, neither wins.
- **Do** use warm neutrals (Papel Crema, Gris Suave, Borde Tierra) for all backgrounds and borders. When in doubt, reach for the warmest neutral in the scale.
- **Do** keep interactive surfaces flat at rest. Shadows are for hover feedback only.
- **Do** animate with purpose: state transitions, feedback, and progress indication. A 200-300ms ease on a hover state tells the user the button heard them.
- **Do** prefer inline and progressive disclosure over modals. The wizard, the drawer, the expandable sections — all avoid modal interruption during the core task.
- **Do** respect the teachers task rhythm. The questionnaire wizard presents one question at a time. Never show a wall of 30 options.
- **Do** write every label, placeholder, error, and tooltip in Argentine Spanish. "Iniciar sesion" not "Inicio de sesion", "Cerrar sesion" not "Cerrar la sesion".

### Dont

- **Dont** use the accent color decoratively. No blue borders on non-interactive cards, no blue icons that arent clickable, no blue headings. The accent means something or it means nothing.
- **Dont** over-elevate. Cards sit flat. If a component needs separation from its background, use Gris Suave or a 1px Borde Tierra border before reaching for a shadow.
- **Dont** animate layout properties. Dont animate width, height, top, left, margin, padding. Use transform and opacity.
- **Dont** use display fonts (Nunito) in UI labels, button text, data values, or any surface smaller than title size. Nunito is for hierarchy, not for decoration.
- **Dont** use side-stripe borders (border-left greater than 1px as a colored accent). Use full borders, background tints, or leading icons instead.
- **Dont** use gradient text, glassmorphism, or decorative blur effects. The system has no use for them.
- **Dont** show a modal when a progressive alternative exists. The help panel, profile settings, and student detail all use slide-in drawers. The confirmation dialog is the only justified modal use case.
- **Dont** make the teacher hunt. Every screen has one primary action and clear navigation. If a user stops to figure out what to do next, the layout failed.
- **Dont** use color as the sole indicator of state. A success badge has a check icon. An error state shows text. A disabled button has reduced opacity.
- **Dont** use corporate cold-gray vocabulary. No `#F5F5F5`, no `#E0E0E0`, no `#9E9E9E`. Every neutral carries warmth.
- **Dont** interrupt the questionnaire flow with delight animations. Celebrations happen at the completion screen, not between questions.
