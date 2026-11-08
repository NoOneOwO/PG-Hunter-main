# Design: PG Hunter (Hallmark redesign, locked)

## System
- **Genre:** playful, but plain and dense on search, listing, and dashboard screens.
- **Tone:** playful, confident, a little cheeky; serious only about money, verification, and safety.
- **Vibe:** campus noticeboard, cheeky, trustworthy.
- **Hero posture:** no banner-image hero. Search/find or the real thing leads; headline + one sentence + primary action visible at 1280×800.
- **Scope:** in — landing pages, student, owner, creator screens. Out — admin (not restyled; shared tokens only, render+contrast checked after token changes).

## Brand (kept)
- Logo badge + `PGHunter` wordmark.
- Headline stays: `PG tera bhai dilaega` (no emoji).
- Yellow `#facc15` is the one action colour (each page’s single primary action).

## Tokens / colour
- **Ink + warm off-white** carry most screens: paper `#fbfaf7`, ink `#1c1917`, rules `#e7e5e4`.
- **Deep ink surface** `#171412` / `#1c1917` for contrast bands.
- **Violet `#7a42e6` is a small accent only:** links, focus ring, verification mark, logo. No violet gradients, no lavender washes.
- Tailwind v4 tokens live in `@theme`/`:root` in `src/styles/global.css`; **token names components use are kept, values changed**.

## Type
- **Display:** Bricolage Grotesque (characterful, not brand).
- **Body/UI:** Noto Sans (plain, dense-friendly). ₹ must render in both.

## Surfaces & components
- Warm paper surfaces, ink text, restrained borders/shadows. Plain and dense on search, listing, dashboard screens.
- Primary action = yellow (`accent-400`), ink text. Secondary = bordered/ink. Focus = violet.
- No 1px-box-everywhere/nested boxes on redesigned screens; no flat colour block standing in for a photo.

## Pixel art / signature
- Skyline artwork may appear **once, large, as a signature**, and may fill empty states. Never ornament: no dash rules, corner squares, pixel banners.
- Legacy `.pixel-rule`/`.section-head::before`/corner ornament classes are neutralized in system CSS; markup cleanup happens per part.

## Never
- Eyebrows or tracked-caps labels; one ornament repeated on every block; 1px boxes everywhere or nested boxes; four-icon feature strips; one icon repeated across a tile grid; a flat colour block standing in for a photo; a product described instead of shown.

## Material
- No real photos/clips in repo; seed data is fake. Don’t design around seed strings or hardcode them.
- Every listing slot handles: **real photo | video poster | none (pixel/neutral empty state)**. Missing photos use replaceable stand-in slots (credited), never stock-site URLs. Must hold up with 1 listing and 40.

## Hard rules
- Content and wiring stay (Astro/Cloudflare islands, client directives, API routes, D1/R2, queries, wrangler, migrations untouched). Edit markup inside the owning component.
- Nothing invented. Copy changes listed before→after. Trust/terms/consent restyled, never reworded.
- No file/route deletion, no test edits without explicit file-level OK.
- Visible by default with scripting off.
- Known issues reported, not fixed: “Starting from” counts occupied room; “Pure veg meals included · ₹3,500/month” contradictory; “1 PGs found” pluralisation.
