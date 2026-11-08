# Design: PG Hunter

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: marquee hero → ecosystem index (live listings, colleges, owner CTA)
- Theme: custom (vibe: "campus marketplace, purple pixel, warm yellow CTA")
- Axes: light/geometric-sans/chromatic-violet · posture: Banner

## Tokens
`src/styles/global.css` is the source of truth (Tailwind v4 `@theme` + `:root`), not `tokens.css`.

```css
:root {
  --color-paper: #ffffff; --color-paper-2: #f8fafc; --color-paper-3: #f7f4ff;
  --color-ink: #0f172a; --color-ink-2: #475569; --color-muted: #64748b; --color-rule: #e2e8f0;
  --color-accent: #7a42e6; --color-accent-ink: #ffffff;
  --color-cta: #facc15; --color-cta-hover: #fde047; --color-cta-ink: #0f172a;
  --color-focus: #7a42e6;
  --color-success: #059669; --color-warning: #b45309; --color-error: #e11d48;
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-control: 2px; --radius-card: 0; --rule-hair: 1px;
  --shadow-card: 0 1px 2px rgb(15 10 30 / .04), 0 1px 3px rgb(15 10 30 / .06);
  --shadow-card-hover: 0 4px 12px -2px rgb(15 10 30 / .1), 0 2px 6px -1px rgb(15 10 30 / .06);
}
```

Type: 12 / 14 / 16 / 18 / 24 / 30 / 36 / 48px; weights 400–800; headings extrabold and `tracking-tight`. Space: Tailwind's 4px scale, `max-w-7xl` (80rem) containers, `px-4 sm:px-6 lg:px-8`. Brand ramp: 50 `#f7f4ff`, 100 `#efe9fe`, 300 `#cab8fb`, 400 `#ac8ff7`, 600 `#7a42e6`, 700 `#6930cb`, 950 `#2c125d`; accent 200 `#fef08a`, 300 `#fde047`, 400 `#facc15`, 500 `#eab308`.

## Surfaces
- Public: white paper, 64px sticky header at 85% white with blur, hairline rules, white footer.
- Owner: same paper and header; content in square hairline cards, 80rem wide, no sidebar.
- Admin: `slate-50` page, 256px white sidebar and 64px top bar, dense tables.
- Light only; no dark theme. No shadows except the card tokens above.

## Controls
- Primary: vertical `brand-600 → brand-700` gradient · square (0) · 44px min height · white text; hover lifts 1px with a purple shadow, active presses to 0.985.
- Accent: flat `accent-400` yellow · square · 44px · `slate-900` text; hover to `accent-300`.
- Secondary: white fill, 1px `slate-200` edge, `slate-800` text; hover edge turns `brand-300`.
- Chips and filters: square, 44px, solid `brand-600` when active.
- Fields: square, 1px `slate-200`, 44px, `focus-within` edge `brand-400`; focus ring 2px `brand-600` at 2px offset.
- Cards: white, 1px `slate-200`, zero radius; hover adds a `brand-300` edge and 2px lift. Badges: square, 12px semibold.
- Real data only: empty states say "nothing yet" in words, never a placeholder count.

## Motion
- Character: calm. One entrance per section: `pg-rise` 14px up, scroll-driven at `entry 0% → cover 18%`, 520ms JS fallback; hero words `pg-blur-in` 650ms with a 70ms stagger.
- Hover: 1–2px lift over 150–200ms; the primary CTA gets one 750ms shine sweep. Inline panels `pop-in` 320ms.
- All decorative motion stops under `prefers-reduced-motion: reduce`; content stays visible with JS off. Never `transition: all`.

## Signatures
- Pixel rule: five 8×4 blocks in `brand-950`, `brand-600`, `accent-300`, `brand-600`, `brand-950`; the 40px `.section-head::before` version sits above section heads.
- Stepped pixel corners and the dusk-skyline hero artwork. Keep the squares; do not swap them for rounded blobs.
- Eyebrow: 12px, 600, uppercase, `0.18em` tracking, `brand-700`, often with a Lucide icon.
- Wordmark: `PG` in slate-900 plus `Hunter` in `brand-600`, beside a 32px pixel badge.

## Exports
`src/styles/global.css` in this project: Tailwind v4 `@theme` and `:root`, with shadcn semantic tokens already mapped onto this palette. The block above is the portable copy.
