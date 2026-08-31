---
name: Varco
description: Monochrome-blue "audit instrument" system for an Italian digital-transformation agency — mono numerals as readouts, pill controls, squared evidence cards.
colors:
  instrument-blue: "#01497C"
  instrument-blue-hover: "#023254"
  instrument-blue-tint: "#E6F3F5"
  stage-black: "#000000"
  surface: "#FFFFFF"
  surface-alt: "#F7F8FA"
  graphite-ink: "#1A1A1A"
  ink-dim: "#5A5A5A"
  muted: "#6B7280"
  muted-decorative: "#9CA3AF"
  line: "#E8EAED"
  line-strong: "#D8DCE1"
  success: "#10B981"
  error: "#EF4444"
  warning: "#F59E0B"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4.2rem)"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "4.25rem"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.4rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.1rem"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  lede:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.6
  control:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.3
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.05em"
  data:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  control: "32px"
  card: "16px"
  shell: "40px"
  flat: "0px"
spacing:
  section: "100px"
  section-tight: "64px"
  container-pad: "28px"
  card-gap: "24px"
  block-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.instrument-blue}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "14px 28px"
    typography: "{typography.control}"
  button-primary-hover:
    backgroundColor: "{colors.instrument-blue-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.control}"
    padding: "14px 28px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  card-evidence:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.flat}"
    padding: "30px 26px 26px"
  card-soft:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "38px 30px 30px"
---

# Design System: Varco

## Overview

**Creative North Star: "The Audit Instrument"**

Varco's interface reads like the output of the audit it sells: a single calibrated instrument, not a decorated brochure. One accent — Instrument Blue — runs through every CTA, link, focus ring, and result number; there is no second accent color competing for attention (an earlier orange "segnale" accent was tried and explicitly removed — see Do's and Don'ts). Every measured fact (a case-study result, a service index, a roadmap step) is set in a monospaced data face so it reads as a readout, distinct from the Inter prose around it — the same distinction a dashboard draws between its labels and its live numbers.

The system runs two corner languages on purpose, not by accident: interactive chrome — buttons, the floating nav pill, inputs, tags — is fully pill-shaped (stadium radius), because it is meant to be pressed, like a switch. Evidence containers — case-study cards, their result blocks, their CTA bars — are perfectly squared, because they are meant to be read, like a printed report line-item. The two languages never mix on the same element.

Structurally, the whole page is a white shell (rounded 40px at its lower corners) floating on a pure-black stage (`body{background:#000}`); the black shows only at the seams — under the hero's rounded base, and as the footer itself, which is treated as literally part of that black stage rather than a second white panel. Depth is otherwise absent at rest: surfaces are flat, and a shadow appears only as a direct response to a hover or focus, never as ambient decoration.

**Key Characteristics:**
- One accent color only (Instrument Blue), used for every CTA, link, focus state, and result figure — no secondary accent.
- Every measured number renders in a monospaced data face; prose never does.
- Pill radius for anything pressable, zero radius for anything that is evidence to be read.
- Flat by default; shadow only on hover/focus, never ambient.
- A black stage shows through the white shell's rounded corners and reappears whole as the footer.

## Colors

Effectively monochrome: one chromatic hue (blue) carries every accent role, layered over a near-black/near-white neutral scale plus a literal pure-black structural layer. No orange, teal, or second brand hue survives in the current system — treat any file that still reaches for one as regressed, not as an alternate palette (see Do's and Don'ts).

### Primary
- **Instrument Blue** (`#01497C`): every CTA background, link color, active nav state, focus-ring hue, icon accent, and — deliberately — every case-study result number. Nothing else on the page competes with it for attention.
- **Instrument Blue Hover** (`#023254`): the only state change primary blue ever makes; used on `:hover`/`:active` for primary buttons and the scrolled nav pill.
- **Instrument Blue Tint** (`#E6F3F5`): a barely-there wash used only as a background — badges, selected tags, the lead-magnet card, the "view all case studies" bar. Never used for text or borders.

### Neutral
- **Stage Black** (`#000000`): the body's own background and the footer's background — a structural color, not a text or surface color. It exists to be glimpsed at the rounded seams of the white shell above it.
- **Surface** (`#FFFFFF`) / **Surface Alt** (`#F7F8FA`): the white shell itself and its slightly-tinted alternate sections (cards, avatars, chips sit on Surface Alt to separate from a white section background).
- **Graphite Ink** (`#1A1A1A`): primary text. Deliberately never pure black — reserve true `#000` for the stage, not for reading text on it.
- **Ink Dim** (`#5A5A5A`): secondary text, paragraph copy (≈6.9:1 on white).
- **Muted** (`#6B7280`): tertiary text and labels — this value was deliberately shifted up from a lighter gray to clear 4.5:1 AA on white; never revert it for a "lighter" look.
- **Muted Decorative** (`#9CA3AF`): the original lighter gray, kept alive but restricted to non-text use only — borders, placeholders, disabled decoration. It fails AA for text and must never carry a text color again.
- **Line** (`#E8EAED`) / **Line Strong** (`#D8DCE1`): hairline dividers and default borders / slightly heavier borders (ghost button, filter chips, tags).

### Feedback
- **Success** (`#10B981`), **Error** (`#EF4444`), **Warning** (`#F59E0B`): reserved for form status and validation only. They do not appear in marketing content — a case study's win is still reported in Instrument Blue, not green, because results are data, not a system alert.

### Named Rules
**The One Accent Rule.** Instrument Blue is the only chromatic color anywhere in the interface, including for "good news" numbers that another system would reach for green. A second accent hue anywhere outside `success`/`error`/`warning` form feedback is a regression, not a variant — the changelog records this exact mistake being made and reverted twice.

**The Black Stage Rule.** `body` is always `#000`. Every foreground surface is a white (or Surface Alt) shape with rounded bottom corners floating on that black; the footer is not a white panel but a continuation of the black stage itself, with its own dimmer neutral scale (`#202020` hairlines, `#8a8a8a`/`#d0d0d0`/`#e4e4e4` text) rather than the light-mode palette above.

## Typography

**Display/Body Font:** Inter (weights 400/500/600, italic 400/500), with `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` fallback. One family for every headline and every paragraph — there is no separate serif or display face.
**Data Font:** JetBrains Mono (weight 500 for labels, 500 for large result figures) — reserved exclusively for numbers and short technical labels, never for prose. *(See Do's and Don'ts: the current build's Google Fonts `<link>` and `--font-mono` value have drifted to Arimo, a proportional sans, which breaks this rule — treat JetBrains Mono as the normative target and fix the drift, not the other way around.)*

**Character:** Confident and unadorned — a single grotesque doing every job, kept legible and slightly tight (negative tracking on headlines) rather than expressive. The mono face is the only place the system allows itself a second texture, and it appears only where a number is a measured fact.

### Hierarchy
- **Display** (500, `clamp(2.4rem, 5vw, 4.2rem)` generically; hero H1 and section H2 pin to a fixed `4.25rem` at desktop instead of clamping, `line-height: 0.9`, `letter-spacing: -0.02em` to `-0.025em`): page and section headlines only.
- **Title** (500, `1.4rem` / `1.1rem`, never bold/700): card and sub-section headings (H3/H4).
- **Body** (400, `17px` base, `line-height: 1.6`, max `62ch`): paragraph copy. The `.lede` variant steps up to `1.2rem` and narrows to `46ch` for the one intro paragraph per section.
- **Label** (500, `12px`, uppercase, `letter-spacing: 0.05em`, `color: Muted`): eyebrows, field labels, proof-strip caption.
- **Data** (500, JetBrains Mono, `11–13px` for labels/badges/index numbers, `1.75–2.1rem` for large result figures, `color: Instrument Blue` when it's a result): the readout face — case-study stats, roadmap/service index numbers, badges, breadcrumbs.
- Italic Inter (400) is reserved for exactly one use: pull-quotes and testimonials (`.pull`, `.testimonial p`). It never appears anywhere else.

### Named Rules
**The Mono Readout Rule.** Any number that represents a measured result — a case-study percentage, a roadmap step, a service index — is set in the Data face, never in Inter. If a number is decorative or part of a sentence, it stays in Inter; if it is a claim someone could audit, it moves to mono.

## Layout

Centered container at `max-width: 1180px` with `28px` side padding. Sections use generous vertical rhythm — `100px` top/bottom (`.section`), or a `64px` "tight" variant for denser sequences — with a `56px` section-head margin before content starts. Two-column splits (`.two-col`, `.transform-block`, hero grids) use `56–64px` gaps and collapse to a single column at `900–980px`; grids of cards (case studies, testimonials, values, team) step down from 3–4 columns to 2 to 1 across `980px → 620/560/480px` breakpoints. Evidence lists (case-study grids, footer columns) increasingly prefer a single shared border with internal vertical dividers over per-item gaps as they mature — a "joined ledger" look rather than a scattered card grid (see `#casi-studio .cases-grid` and `.footer-grid`).

## Elevation & Depth

Flat by default; the system does not use ambient shadows to indicate resting hierarchy. A shadow appears only as a direct response to interaction — hover on a card or button, an input's focus ring — and disappears the moment the interaction ends. The one standing exception is the desktop nav pill, which always carries a soft ambient shadow (`0 8px 24px rgba(16,24,32,.1)`) because it is meant to read as a physically floating object rather than a flat header bar.

### Shadow Vocabulary
- **Card hover** (`box-shadow: 0 8px 24px rgba(16,24,32,.08)`): case-study and general card `:hover`, paired with a `-2px`/`-3px` lift.
- **Button hover** (`box-shadow: 0 4px 12px rgba(2,94,113,.15)`): primary button `:hover`, tinted with the brand blue rather than neutral black.
- **Focus ring** (`box-shadow: 0 0 0 3px rgba(2,94,113,.18)` globally, `rgba(2,94,113,.1)` on form fields): the only shadow allowed to persist for as long as its trigger state does (`:focus-visible`).

### Named Rules
**The Response-Only Shadow Rule.** No element carries a shadow at rest except the floating nav pill. Every other shadow in the system exists only for the duration of `:hover` or `:focus-visible`.

## Shapes

Two deliberate, non-mixing corner languages:

- **Pill / stadium** (`--radius: 32px`, i.e. `rounded.control`): every pressable control — primary and ghost buttons, the desktop nav pill and its scrolled/merged hamburger, form inputs, the newsletter/lead-magnet input, tech pills, the nav-toggle circle. Smaller chrome (badges, filter chips, tags) hits the same visual stadium shape with its own literal radius (20–30px) tuned to its own height rather than reusing the token directly — the effect, not the exact value, is the invariant.
- **Squared / flat** (`rounded.flat`, `0px`): the entire case-study "evidence" family — `.case-card`, `.cs-result`, `.cs-btn`, `.cases-viewall` — breaks from the pill language on purpose, so proof reads as a printed report line rather than a soft marketing card. This break is scoped to case-study components only; it must never spread to the rest of the site's cards.
- **Soft card** (`rounded.card`, `16px`): the remaining "container" surfaces that are neither pure evidence nor pure control — the team photo frame, the lead-magnet card. Client quotes are explicitly *not* in this family (see Components → Quotes): a quote is never a bordered/radiused card.
- **Shell** (`rounded.shell`, `40px`): the outer bottom corners of `main` and the hero section, the shape that lets the Black Stage show through (see Colors → Named Rules).
- **Dot** (`50%`, `8px` diameter): a fifth, narrowly-scoped exception for carousel position indicators only (the mobile roadmap's `.route-dot`s). A true circle isn't otherwise part of this system's vocabulary — it's used here because pagination dots are a near-universal convention users already recognize, and no pill/flat/card alternative reads as clearly. Don't reach for a circle outside this one pattern.

## Components

Buttons and inputs feel **precise and instrumented**: exact 1px lifts and tight, brand-tinted shadows on hover, a firm `scale(.97)` press-down on `:active`, and no motion beyond what confirms the interaction happened. Nothing bounces, glows ambiently, or moves without a direct cause.

### Buttons
- **Shape:** full pill (`border-radius: 32px`).
- **Primary:** Instrument Blue background, white text, `14px 28px` padding, weight 500, no border.
- **Hover / Focus:** background steps to Instrument Blue Hover, `translateY(-1px)`, button-hover shadow; `:active` snaps to `scale(.97)` with the shadow removed — a firm press, not a lingering lift. Icon-bearing buttons nudge their trailing arrow `4px` on hover.
- **Ghost/Secondary:** transparent background, `1.5px` Line-Strong border, Graphite Ink text; hover shifts both border and text to Instrument Blue, same `-1px` lift, no shadow.
- All hover-only behavior is gated behind `(hover: hover) and (pointer: fine)` — nothing "sticks" on a touch tap.

### Cards / Containers
- **Evidence cards** (case studies): squared corners, `1px` Line border, `30px 26px 26px` padding, a hidden top accent bar (`Instrument Blue`, `3px`) that reveals via `scaleX` on hover alongside the card-hover shadow and a `-3px` lift. The CTA bar (`.cs-btn`) bleeds to the card's full width and inverts to solid blue on hover.
- **Soft cards** (testimonials, lead-magnet, team photo): `16px` radius, `1px` Line border, same hover lift/shadow vocabulary as evidence cards but without the accent-bar reveal.
- Home-page case studies additionally merge into one shared-border grid with internal dividers instead of individual card borders — the "joined ledger" layout described in Layout.

### Quotes
- **One treatment everywhere a client's own words appear** — a case-study page's pull-quote and the homepage testimonials grid render identically: a `3px` Instrument Blue rule on the left, italic Inter body text, and a mono `<cite>` line (name, role, company, no separating punctuation beyond a comma after the name) set in Muted. No card, no border, no background, no border-radius, no decorative quote glyph, no avatar.
- On the homepage the three quotes sit in a plain grid (`40px`/`36px` gap, no divider) rather than individual cards — the left rule is the only boundary each quote needs.
- This was a real drift, corrected: testimonials previously used a bordered, `16px`-radius card with an oversized decorative quotation-mark glyph and a circular initials avatar — a second, unrelated visual language for the exact same content type. See Do's and Don'ts.

### Hero Video (service pages)
- Every `servizi/*.html` hero's image column is a reserved video slot, not a live embed: a `16:9` `Black Stage` frame (`#000` background, `#202020` border, `rounded.card`) with a centered Instrument-Blue circular play button and a small mono caption ("Video dimostrativo — in arrivo"). The circular play button is the same narrow, universally-recognized-convention exception as the roadmap's pagination dots (see Shapes) — not a general invitation to use circles elsewhere.
- No real video file exists yet anywhere in this project; the frame is intentionally styled to read as "not yet real" rather than as a broken player, matching how this project already treats og-image, the Calendly link, and the placeholder P.IVA.

### Related Services (service pages)
- The "Altri servizi" cross-link block is a numbered reference ledger, not a pill row: a single shared border, no per-row gaps, mono index number (the same canonical 01–11 assigned to each service on the homepage accordion) + service name + arrow, one column. Same "joined ledger" principle as the case-study grid.
- Each service page keeps its own curated subset of related services (unchanged from before this redesign) — only the presentation changed.

### Inputs / Fields
- **Style:** `1px` Line border, pill radius, `14px 16px` padding, Surface background.
- **Focus:** border shifts to Instrument Blue plus a `3px` blue-tinted glow (`rgba(2,94,113,.1)`) — the same hue as the global focus ring, at lower opacity because it sits directly on the border rather than around the whole control.
- **Label:** 12px uppercase Muted text above the field, never inline as a floating label.

### Navigation
- Desktop nav is a pill floating over the page (blurred white background, permanent ambient shadow), independent of the header bar itself; it disappears once the page scrolls and is replaced by a merged CTA+hamburger pill sharing one continuous shape (adjoining border-radii, a single hairline dividing the two clickable halves).
- Links are Ink Dim by default, Instrument Blue on hover/active, with an active-state underline bar rather than a background change.
- Mobile nav is a full-screen overlay (not a slide-out drawer): large Display-weight links, the CTA promoted to the first, filled-blue item.

## Do's and Don'ts

### Do:
- **Do** keep Instrument Blue as the only chromatic accent anywhere outside form-validation feedback (success/error/warning).
- **Do** render every measured number (case-study stats, roadmap/service indices) in the Data (mono) face — never in Inter.
- **Do** keep the pill/flat corner split scoped exactly as documented: pill for anything pressable, flat for the case-study evidence family only.
- **Do** let shadows appear only in response to `:hover`/`:focus-visible`; the floating nav pill is the one standing exception.
- **Do** gate all `:hover` styling behind `(hover: hover) and (pointer: fine)` so touch never gets a stuck hover state.
- **Do** keep `Muted` (`#6B7280`, not `#9CA3AF`) on any text that needs to clear AA contrast; `Muted Decorative` is non-text only.
- **Do** render every client quote — case-study pull-quote or homepage testimonial alike — with the single Quotes treatment (left rule + italic + mono cite), never as a card.

### Don't:
- **Don't** introduce a second accent hue (orange, teal, or otherwise) anywhere in the interface — this exact regression has already happened and been reverted twice in this project's history.
- **Don't** let the case-study family's squared corners bleed into other cards, or let another component's pill radius creep onto a case-study evidence element.
- **Don't** add an ambient/resting shadow to a new component; earn it only through interaction.
- **Don't** treat the footer as a white panel — it is a continuation of the Black Stage and uses its own darker neutral scale, not the light-mode palette.
- **Don't** give a quote its own card, border, radius, decorative glyph, or avatar — this exact drift happened once already (the homepage testimonials had all four before being corrected) and reads as a second, unrelated quote language next to the case-study pull-quote.
- **Don't** ship a "mono" element in a proportional sans face. `--font-mono` and `index.html`'s font `<link>` were fixed to JetBrains Mono; the other HTML pages still load only Inter and so fall back to the system mono stack — bring their `<link>` in line rather than leaving them on the fallback.
