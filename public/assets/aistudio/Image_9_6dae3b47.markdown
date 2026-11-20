---
name: Concrete Heat
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#e6bdb8'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#ac8884'
  outline-variant: '#5c403c'
  surface-tint: '#ffb4ab'
  primary: '#ffb4ab'
  on-primary: '#690005'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#bf0715'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#90cdff'
  on-tertiary: '#003450'
  tertiary-container: '#0078b2'
  on-tertiary-container: '#f3f8ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#cbe6ff'
  tertiary-fixed-dim: '#90cdff'
  on-tertiary-fixed: '#001e30'
  on-tertiary-fixed-variant: '#004b71'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  crimson-blaze: '#ef4444'
  carbon-black: '#050506'
  tactical-charcoal: '#121316'
  graphite-border: '#27272a'
  industrial-amber: '#d97706'
  signal-white: '#f4f4f5'
typography:
  display-hero:
    fontFamily: Anton
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: 0.02em
  display-hero-mobile:
    fontFamily: Anton
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 38px
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 30px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0.03em
  headline-sm:
    fontFamily: Anton
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.1em
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an uncompromising, high-impact aesthetic built for the raw rhythm of modern urban Latin street music. Drawing directly from brutalist industrial architecture, high-contrast poster typography, and tactical hardware, the experience strips away soft decorative ornamentation in favor of sharp lines, pure structural weight, and relentless energy.

The aesthetic fuses **Tactical Brutalism** with **Underground Streetwear**:
- **Attitude:** Aggressive, kinetic, and commanding. Every viewport delivers immediate presence through bold blackouts, searing crimson strikes, and raw monospaced tracking.
- **Audience:** Producers, crate-diggers, and heavy bass listeners immersed in Latin trap, reggaeton underground, dembow, and raw urban street cuts.
- **Physicality:** Industrial precision. Surfaces act as matte composite plates, reinforced with razor-sharp seams, high-contrast border grids, and heavy-gauge monospaced callouts.

## Colors

The color palette is built for extreme legibility in dim low-light environments, prioritizing visceral visual punches against ultra-dark matte planes.

### Key Roles
- **Primary (`#dc2626` / `crimson-blaze` `#ef4444`):** The signature alert and ignition tone. Governs master playheads, peak audio limiters, live performance tags, active filter triggers, and destructive operations.
- **Secondary (`#f59e0b` / `industrial-amber` `#d97706`):** Secondary tactical accent. Used for track BPM flags, mastering meters, high-fidelity lossless badges, exclusive drop alerts, and frequency modulation stats.
- **Neutral (`#0a0a0c`):** The deep matte canvas base. Devoid of blue tinting, this near-pitch graphite grounds the entire view to maximize contrast with neon crimson and white typography.

### Structural Surfaces & Grid Lines
- **Substrate Level 0 (`carbon-black` `#050506`):** Pure background canvas.
- **Substrate Level 1 (`tactical-charcoal` `#121316`):** Heavy card planes, module bays, and track rows.
- **Framing & Grids (`graphite-border` `#27272a`):** Rigid 1px lines defining boundaries, modules, and container cuts without soft drop shadows.
- **High-Readability Typography (`signal-white` `#f4f4f5`):** Maximum contrast foreground text for headlines and numerical trackers.

## Typography

Typography delivers brutal, poster-grade contrast. Headlines are set in condensed, solid **Anton**—all caps by default—acting as punchy street billboards. Body copy, telemetry, and metadata rely strictly on **JetBrains Mono**, conveying industrial accuracy, raw stems, and clear character distinction.

### Rules of Application
- **Postering:** All Anton headlines (`display-hero` through `headline-sm`) must be rendered in full uppercase with precise letter tracking to replicate bold street flyposters.
- **Telemetry & Data:** All track metrics (BPM, kHz sample rate, elapsed time, sub-bass levels) use `JetBrains Mono` numbers to eliminate layout shift during rapid audio scrub or live real-time analysis.
- **Labels & Micro-Badges:** Micro labels utilize uppercase weights with wide letter tracking (`0.06em` to `0.1em`) to maintain sharp readability on dark hardware-inspired buttons and tags.

## Layout & Spacing

The layout model enforces rigid, non-fluid structure akin to rack-mount audio equipment and print layout grids. It avoids arbitrary floating cards, opting for edge-to-edge modular cells locked by razor-thin borders.

### Grid & Responsiveness
- **Desktop Grid:** 12-column rigid framework with `1.5rem` (`24px`) margins and `1rem` (`16px`) gutters. Track lists, mastering consoles, and media modules snap into distinct structural blocks.
- **Mobile Grid:** 4-column framework with `1rem` (`16px`) margins and `0.75rem` (`12px`) gutters.
- **Edge Snapping:** Carousels and cue lists break through outer margins to touch the viewport border directly, anchored with crisp 1px dividing lines rather than soft fade-outs.
- **Rhythm:** Spacing follows strict multiples of `4px` (`space-xs`, `space-sm`, `space-md`, `space-lg`, `space-xl`). Inner component padding is compact and dense, maximizing screen density for extensive track lists and audio data.

## Elevation & Depth

This design system rejects soft ambient blur, glassmorphism, and diffuse drop shadows. Depth is achieved entirely through high-contrast borders, stepped planar luminance, and sharp offset cast shadows.

- **Level 0 (Floor):** Matte `#050506`. Used as the structural bed for all viewports.
- **Level 1 (Card & Module Slabs):** `#121316` plate bordered with a solid `1px solid #27272a` boundary.
- **Level 2 (Active Focus & Floating Bars):** `#1a1b1f` with a `1px solid #dc2626` active hairline seam.
- **Tactical Hard Drop (Brutalist Elevation):** Key floating interactions (such as the persistent bottom transport controller or alert toasts) utilize a solid, zero-blur hard offset shadow: `box-shadow: 4px 4px 0px 0px #000000`. No soft penumbra is permitted.
- **Laser Trim:** Active sliders and player heads emit a razor-thin directional underline rather than an omnidirectional blur.

## Shapes

The shape system strictly mandates **zero-radius geometry (`roundedness: 0`)**. Curves, pills, and soft edges are entirely prohibited.

- **Perimeter Geometry:** Every button, album viewport, modal panel, checkbox, input surface, and banner terminates in exact 90-degree right angles.
- **Tactical Notches:** Where directional emphasis is required on active chips or high-priority buttons, an industrial 45-degree corner notch (`chamfer: 6px`) may be cut from the top-right corner using CSS clip-path to reinforce the equipment-panel metaphor.
- **Dividers:** Clean, unrounded `1px` structural line cuts separating tracks, channels, and parameter knobs.

## Components

### Buttons
- **Primary Action (Ignite / Play / Drop):** Solid `#dc2626` background, sharp rectangular edges (`0px` border radius), uppercase Anton or JetBrains Mono Bold typography in `#f4f4f5`. Press state uses instant invert: `#ffffff` fill with `#050506` text and zero lag.
- **Tactical Secondary:** Transparent background, `1px solid #27272a` outline, `#f4f4f5` text. On hover/focus: `1px solid #dc2626` with background wash of `#1a1212`.
- **Destructive / Live Cue:** Bordered in `#ef4444`, textured with 45-degree industrial diagonal hazard striping on inactive backplate.

### Chips & Tags
- **BPM & Metric Chips:** Sharp rectangular boxes. Background `#121316`, border `1px solid #27272a`, text in `#f59e0b` (`label-md`).
- **Genre & Stems Badges:** Solid `#27272a` with white monospaced lettering. Active state fills with `#dc2626` and white text. No rounded capsules.

### Lists & Track Rows
- **Audio Row Unit:** Height `56px`. Bound by a single `1px solid #1a1b1f` bottom border. Features raw track sequence index (`01`, `02`, `03`) in muted mono, track title in bold uppercase, artist, key signature, and BPM counter aligned to right-hand data columns.
- **Hover / Active State:** Full row background instantly flashes to `#18191e` with a `2px solid #dc2626` indicator line locked to the left border.

### Checkboxes & Radios
- **Checkbox:** `16x16px` pure square, `1px solid #27272a`, background `#050506`. When checked: solid `#dc2626` fill with an inset sharp white square block (no curved checkmarks).
- **Radio Selection:** `16x16px` outer square enclosing an inner `8x8px` solid crimson block on active state.

### Input Fields
- **Terminal Input:** Height `44px`, zero radius, `#0a0a0c` fill, `1px solid #27272a` edge. Monospaced placeholder text in `#71717a`. On focus: `1px solid #dc2626` with no halo blur; active cursor flashes as a solid red block (`▮`).

### Cards & Media Slabs
- **Album & Crate Tile:** Raw square image frame bounded by `1px solid #27272a`. Metadata sits in an integrated bottom shelf (`#121316`) housing track titles in Anton headline styling and tech parameters (bitrate, release code) in muted mono.
- **Hardware Transport Deck (Persistent Player):** Docked directly to the viewport floor. Full-width blackout bar (`#0c0d10`), single `1px solid #dc2626` top border line, raw scrub meter displaying linear audio waveform bars in `#dc2626` without curved caps.