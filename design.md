# PBB Website — Design Reference

Palette extracted from `public/logo.png` (pixel color counts) and cross-checked against the
brochure reference material in `reference/`. Wired into `app/globals.css` as Tailwind v4
theme tokens — use the utility classes shown below rather than hardcoding hex values.

## Brand colors

### Orange — `brand`
Company color code: **#ED7423**. This is the primary accent —
CTAs, links, active states, highlight text, the brand strip.

| Token | Hex | Utility classes | Use |
|---|---|---|---|
| `brand-50` | `#FDF0E7` | `bg-brand-50` | subtle tinted backgrounds |
| `brand-100` | `#FBDECB` | `bg-brand-100` | hover backgrounds on light surfaces |
| `brand-200` | `#F7BD97` | `border-brand-200` | light borders/dividers |
| `brand-300` | `#F3A068` | | |
| `brand-400` | `#F08842` | | |
| `brand-500` | `#ED7423` | `bg-brand-500` `text-brand-500` | **primary accent** — CTAs, active nav, icons |
| `brand-600` | `#D45F11` | `bg-brand-600` `hover:bg-brand-600` | hover/pressed state for primary buttons |
| `brand-700` | `#AF4E0E` | | text on light backgrounds needing AA contrast |
| `brand-800` | `#893D0B` | | |
| `brand-900` | `#632C08` | | |

### Ink (navy-charcoal) — `ink`
The logo's wordmark is pure black (`#000000`), but the brochure's dark panels
(`reference/Work-07-07.png`, `reference/1.png`) sample as a near-black with a cool,
slightly blue-green tint (e.g. `rgb(15,10,18)`, `rgb(17,24,22)`) rather than true black.
`ink-950`/`ink-900` follow that — softer than pure black for large dark sections and body
text, per CLAUDE.md's "dark navy/charcoal, not flashy" direction. Reserve literal
`#000000` for reproducing the logo mark itself, not for UI chrome.

| Token | Hex | Utility classes | Use |
|---|---|---|---|
| `ink-50` | `#F5F5F6` | `bg-ink-50` | page section backgrounds (off-white) |
| `ink-100` | `#E7E8E9` | `border-ink-100` | hairline borders |
| `ink-200` | `#CDD0D2` | | disabled/subtle borders |
| `ink-300` | `#A6ABAE` | | placeholder text |
| `ink-400` | `#7D8489` | `text-ink-400` | secondary/muted text |
| `ink-500` | `#5B6368` | | |
| `ink-600` | `#3F464C` | | |
| `ink-700` | `#2B3136` | | |
| `ink-800` | `#1E2327` | `bg-ink-800` | dark section background (footer, hero overlay) |
| `ink-900` | `#14181B` | `bg-ink-900` `text-ink-900` | **primary text color**, darkest dark-section bg |
| `ink-950` | `#0E1113` | | deepest dark background, near-black |

### White
`#FFFFFF` — primary page background. Keep generous white space; this is a clean, modern
translation of the brand, not the brochure's busy gradient/photo-collage look.

## Usage rules

- **Primary accent is orange (`brand-500`), used deliberately** — buttons, active states,
  key numbers/stats, the brand strip underline. Don't tint large background areas orange;
  it's a highlight color, not a fill color.
- **Dark sections use `ink-900`/`ink-950`** (footer, hero background if used) with white or
  `ink-50` text — never pure `#000000` for backgrounds.
- **Body copy uses `ink-900` on white**, secondary/meta text uses `ink-400`.
- Avoid gradients, photo collages, and multiple accent colors competing for attention — the
  print brochure leans on red/yellow "ENERGY" graphics and heavy gradients (see
  `reference/`); the website intentionally does not reuse those, per CLAUDE.md.
- Maintain WCAG AA contrast: `brand-500` on white passes for large text/icons but is
  borderline for small body text — prefer `brand-600`/`brand-700` or `ink-900` for small
  text that must also be legible, and reserve `brand-500` for large/bold text, icons, and
  filled buttons (white text on `brand-500`/`brand-600` passes comfortably).

## Typography

Geist Sans / Geist Mono (already wired via `next/font/google` in `app/layout.tsx`, exposed
as `--font-geist-sans` / `--font-geist-mono`, applied as the default `font-sans`). Clean,
neutral, and modern — no additional font needed for a site this size.

## Iconography

`lucide-react` only (installed), per CLAUDE.md — no inline SVGs, emoji, or a second icon
library. Use stroke-based icons at consistent sizes (`size-5` / `size-6` typical), colored
`ink-900` for neutral UI icons and `brand-500` for accent/highlight icons.

## Tone

Professional, industrial-equipment-dealer feel — trustworthy and straightforward. Generous
white space, clear hierarchy, real spec data presented plainly (tables/cards, not marketing
collage). Mobile-first; test at ~375px minimum width.

## How the palette was derived

Pixel color histogram of `public/logo.png` (Python/Pillow) surfaced three dominant opaque
colors: white background, `rgb(0,0,0)` (wordmark + one half of the infinity mark), and
`rgb(240,117,34)` / `#F07522` (the other half of the infinity mark). The orange scale was
later re-based on the company's official color code, **#ED7423**, superseding the
logo-sampled value. Tonal scales (50–900) around `#ED7423` and around a navy-tinted
charcoal (informed by sampling `reference/Work-07-07.png` and `reference/1.png` background
panels) were built by hand to give the UI room for hover/active/muted states without
introducing off-brand hues.
