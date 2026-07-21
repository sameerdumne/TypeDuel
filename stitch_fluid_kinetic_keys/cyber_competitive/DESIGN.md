---
name: Cyber-Competitive
colors:
  surface: '#11131d'
  surface-dim: '#11131d'
  surface-bright: '#383844'
  surface-container-lowest: '#0c0d18'
  surface-container-low: '#1a1b26'
  surface-container: '#1e1f2a'
  surface-container-high: '#282934'
  surface-container-highest: '#333440'
  on-surface: '#e2e1f0'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#e2e1f0'
  inverse-on-surface: '#2f303b'
  outline: '#859396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c8f6ff'
  on-primary: '#00363d'
  primary-container: '#21e6ff'
  on-primary-container: '#00636f'
  inverse-primary: '#006875'
  secondary: '#ffade3'
  on-secondary: '#5f004f'
  secondary-container: '#c000a2'
  on-secondary-container: '#ffe0f0'
  tertiary: '#afffd5'
  on-tertiary: '#003824'
  tertiary-container: '#5ceaae'
  on-tertiary-container: '#006746'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9bf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#ffd8ee'
  secondary-fixed-dim: '#ffade3'
  on-secondary-fixed: '#3a0030'
  on-secondary-fixed-variant: '#860070'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#11131d'
  on-background: '#e2e1f0'
  surface-variant: '#333440'
  surface-low: '#10172a'
  surface-lowest: '#080b14'
  text-primary: '#f8fbff'
  error-red: '#ef4444'
  glass-border: rgba(255, 255, 255, 0.1)
  glass-fill: rgba(8, 13, 28, 0.72)
  selection-blue: rgba(33, 230, 255, 0.35)
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: 0.025em
  body-lg:
    fontFamily: jetbrainsMono
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  stats-value:
    fontFamily: jetbrainsMono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-unit: 44px
  gutter: 1.5rem
  margin-page: 2rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is engineered for a high-stakes, "TypeDuel" environment where speed, precision, and tactical focus are paramount. It targets competitive typists and gaming enthusiasts who value a "pro-tool" aesthetic that feels both futuristic and responsive.

The visual style is a fusion of **Glassmorphism** and **High-Contrast Tactical** design. It utilizes deep, multi-layered dark surfaces to minimize eye strain during intense sessions, punctuated by vibrant neon "energy" colors that highlight critical information and interactive states. The interface should feel "live"—using subtle glows, rhythmic pulses, and sharp grid structures to evoke the atmosphere of a digital arena or a high-end terminal.

## Colors

This design system is strictly **dark mode only**. The palette is anchored by a "Deep Space" background that provides the necessary contrast for neon elements.

- **Primary (Neon Cyan):** Used for the typing caret, progress indicators, and active UI highlights. It represents the "player's energy."
- **Secondary (Magenta):** An aggressive accent used for opponent data, critical alerts, or secondary CTAs.
- **Tertiary (Success Green):** Specifically for "Correct" keystrokes and match victories.
- **Error Red:** Used for "Incorrect" keystrokes and system warnings.

Layering is achieved through varying shades of navy and black (`surface-low`), while glassmorphic panels use a semi-transparent fill to maintain context with the background grid.

## Typography

The typography system prioritizes two distinct needs: **Impact** and **Data Integrity**.

1.  **Headlines (Inter):** Set with extra-bold weights and slight tracking (letter-spacing) to create a "wide," cinematic feel suitable for a competitive arena.
2.  **Typing Area (JetBrains Mono):** A high-readability monospace font is mandatory for the match arena. This ensures every character, including spaces and punctuation, occupies equal horizontal width, which is critical for typing rhythm.
3.  **Labels & Metadata:** Use Inter in all-caps for a technical, "HUD" (Heads-Up Display) aesthetic.

All text should default to the `text-primary` color (#f8fbff) to ensure maximum legibility against the dark backgrounds.

## Layout & Spacing

The layout is built on a **Fluid Grid** model with a specific background texture called the **Arena Grid**.

- **Arena Grid:** A background pattern of 44px x 44px squares. UI components should ideally align their outer boundaries to these grid lines.
- **Structural Layout:** Use a 12-column system for dashboards. For the Match Arena, a centered, single-column focus layout is preferred to eliminate distractions.
- **Adaptive Behavior:** 
    - **Desktop:** Wide margins (2rem+) and glass panels with substantial internal padding (2rem).
    - **Mobile:** Transition to a full-width "edge-to-edge" glass look to maximize the typing area. The `grid-unit` remains the same but may be masked more aggressively.

## Elevation & Depth

Depth in this system is not created by physical shadows, but by **optical transparency and luminosity**.

1.  **Base Layer:** The "Deep Space" background (#070812) with a fixed radial gradient of Cyan and Magenta in the corners to provide "atmospheric glow."
2.  **The Grid Layer:** A 1px subtle line grid (44px tiles) that sits behind the content, fading out toward the bottom of the screen.
3.  **Glass Panels:** The primary container for content. Features a `18px` backdrop-blur, a `10% white` solid border, and a heavy, diffuse shadow (0 24px 80px) to simulate floating above the grid.
4.  **Active Elements:** Elements like the typing caret or the active player's stats should have a `box-shadow` glow using the Primary Cyan color at 80% opacity to suggest they are "powered on."

## Shapes

The shape language is **Soft (0.25rem)**. While the overall vibe is technical and sharp, slightly rounded corners on panels and buttons prevent the UI from feeling dated or overly aggressive.

- **Panels & Buttons:** Use `0.25rem` (4px) for standard elements.
- **Input Fields:** Match the button roundedness for a cohesive form language.
- **The Caret:** The only exception is the typing caret, which is **Pill-shaped (999px)** to act as a distinctive, smooth vertical bar that glides across the text.

## Components

- **Glass Buttons:** Primary buttons use a solid Cyan background with black text. Secondary buttons use a glass background (blur + border) with Cyan text. Both should have a `0.2s` transition that increases the "glow" on hover.
- **Typing Caret:** A 2-3px wide pill, colored in Primary Cyan. It must include a `pulseGlow` animation (1s duration, infinite) when idle.
- **Match Cards:** Glass containers with a `label-caps` header. Content inside should be high-contrast. Use a 1px Cyan left-border to indicate the "active" player in a duel.
- **Keystroke Feedback:** 
    - **Correct:** Text turns Primary Cyan or Success Green.
    - **Incorrect:** Text turns Error Red with a subtle red background highlight.
- **Stats Chips:** Small, dark-filled capsules with Monospace text (JetBrains Mono) to display WPM (Words Per Minute) and Accuracy.
- **Progress Bars:** Thin, 4px height bars. The "fill" should be a gradient from Cyan to Magenta to show progress through a "high-energy" match.