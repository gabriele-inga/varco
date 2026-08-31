# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are owners/decision-makers at small and medium Italian businesses (PMI) — general SMEs across sectors (site's own case studies span restaurant, real estate, manufacturing, fashion, and professional services), not a single vertical. They typically already have some digital presence (a site, social accounts, maybe ad spend) that isn't producing results, and are evaluating whether to book a free 30-minute audit call with Varco.

## Product Purpose

Varco is an Italian digital-transformation agency. It replaces a business's disconnected digital tools (website, social, ads, email, automations, AI voice/chat) with one coordinated system, built from an audit and a custom roadmap rather than fixed packages. Success for a visitor is booking the free audit call; success for the client relationship is a system that keeps producing measurable results month over month, with a single accountable point of contact.

## Positioning

The claim a competing agency could not truthfully copy: Varco doesn't sell isolated services (a website, an ad campaign) — it diagnoses via a mandatory audit first, then builds one integrated system across web, marketing, and AI automation, with a single named lead per project and shared (not cherry-picked) performance numbers. The stated enemy is "more tools," not "no digital presence."

## Operating Context

- Client engagement starts with a free audit of the client's existing site, social, and tools — never a quote before that audit.
- Delivery model: one named referente/lead per project who both signs the quote and answers questions during the work.
- Reporting is recurring and shows both wins and misses, not only favorable metrics.
- Services offered (see `servizi/`): web design, web app, SEO, site optimization, social media marketing, ad campaigns, email marketing, automazione email, chatbot, AI voice agent (agente vocale), video AI.
- Primary conversion action across the site: "Prenota audit gratuito" (book a free audit), secondary: WhatsApp contact.
- Contact channels: phone (+39 388 864 8509), email ([EMAIL]), Instagram/Facebook/LinkedIn.
- Site is deployed as a static package (see `README.txt`) intended for any static host; the canonical domain is a placeholder (`https://[DOMINIO]`).

## Capabilities and Constraints

- Stack: static HTML5 + CSS3 (custom properties, grid/flexbox) + vanilla JS, no framework, no build step. Fonts loaded via Google Fonts `<link>` (Inter + Arimo, per current `index.html`; `README.txt` references Inter + JetBrains Mono — treat as undecided until the design system is reconciled).
- Contact form (`contatti.html`) currently only shows a client-side confirmation; it is **not wired to a real email/CRM endpoint** yet.
- "Prenota una call" / Calendly link in `contatti.html` is a placeholder, not a live scheduling account.
- No analytics (GA4/Meta Pixel) wired in yet; adding any requires updating the cookie policy first.
- No real cookie-consent banner yet, only static legal text pages.

## Brand Commitments

- Name: Varco. Logo at `assets/logo/` (light and dark variants), favicon at `assets/favicon.*`.
- Voice: direct, Italian, no unsupported claims — every claim ties to a number or a described method ("un numero o un 'come'").
- This is a real agency launching a real production site (not a portfolio/demo exercise) — placeholder content listed under Evidence on Hand is expected to be replaced with real data before public go-live, not treated as permanent fictional content.

## Evidence on Hand

- **Case studies (`casi-studio/`)**: Osteria Bramante, Bianchi & Partners, Rossi Manifattura, Ferraro Immobiliare, Verde Moda — these are demonstrative examples with fictional names/numbers, explicitly flagged in `README.txt` for replacement with real client cases (or relabeling as "typical scenario examples") before public launch.
- **Team (`chi-siamo.html`)**: Robert Marciuc (Founder & Lead Developer), Elena Conti (Strategist & Project Lead), Davide Salvi (AI & Automazioni) — `README.txt` flags these as example names/roles to be confirmed or replaced with the real team.
- **Partner logos** shown in the proof strip: Bacco, Extrosa — treat as real client/partner names unless told otherwise; only two logos exist today.
- **P.IVA** placeholder in the footer — must be replaced with the real VAT number before launch.
- Future work must not invent additional testimonials, client names, benchmarks, pricing, or team members beyond what's listed here without new evidence.

## Product Principles

1. Diagnose before prescribing — every engagement starts with a free audit of what the client already has, never a quote in advance of it.
2. One system, not more tools — the pitch is integration across channels, not another point solution.
3. One accountable owner per project, end to end.
4. Numbers are shared in full, including the ones that don't flatter the work.
5. No claim without a number or a named method behind it.

## Accessibility & Inclusion

No formal standard (e.g. WCAG level) has been confirmed. `README.txt` notes existing attention to semantic markup, visible focus states, `prefers-reduced-motion` support, and verified text/background contrast — treat as a baseline to preserve, not a certified compliance level.
