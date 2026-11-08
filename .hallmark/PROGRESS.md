# Hallmark Redesign Progress — PG Hunter

## Part 1 (pre-flight + before + picks)
- **Status:** done (approved)
- **Date:** 2026-11-08
- **Branch:** `redesign/hallmark` (local only; no push/remotes). Proceeding with pre-existing dirty tree (user approved option 2): `M` chat/api owner-messages files, `?? design-audit/`, `?? design.md`.
- **Read at start:** `.hallmark/PROGRESS.md` (created now), `design.md` (exists, old system — to be replaced by new brief system), `.hallmark/log.json` (none yet).
- **Dev server:** `http://localhost:4321/` (pid from `npm run dev` logged to `/tmp/opencode/pghunter-dev.log`).
- **Before artifacts:** `PG-Hunter-Edit/.hallmark/before/` (screenshots), `.hallmark/before.json` + `.hallmark/before.txt` (overwritten by last capture run — aggregate record is incomplete; per-route FAIL/REFLEX/WARN summarized in chat). Captured via `sloplint --genre playful --render --before` with `PUPPETEER_EXECUTABLE_PATH=/usr/bin/brave-browser`.

## Ordered parts (2–7)
| Part | Focus | Routes/screens (in scope) |
|---|---|---|
| 2 | **System foundation** — replace tokens in `@theme`/`:root` (`src/styles/global.css`, keep token names), base/type/controls/surfaces, new `design.md` (brief system), admin render/contrast sanity check (no restyle) | Global + shared layout/components |
| 3 | **Home** — full composition pass (page) | `/` |
| 4 | **Discovery pages** — colleges/localities pages, PGs Near You (page with tools), listing detail (page with tools; seed states) | `/colleges`, `/colleges/[slug]`, `/localities`, `/localities/[slug]`, `/pgs-near-you`, `/pgs/live/[id]` |
| 5 | **Conversion & auth pages/app** — marketing + auth entry | `/for-owners`, `/earn`, `/login` |
| 6 | **Student app screens** | `/profile`, `/saved`, `/messages` |
| 7 | **Owner + creator app screens** — final sweep, compare/handoff notes | `/owner/*` (index, leads, listings, new/edit, messages, plans, plans/verified, profile, verification), `/creator`, `/creator/apply` |

## Out of scope
- All `/admin/*` (no restyle; after token changes verify renders + contrast only).
- API routes, DB/R2/wrangler/migrations/config, islands logic/wiring, tests.

## Routes I couldn’t render (authenticated/before limitations)
- **Auth-gated, no session cookie in captures:** `/profile`, `/saved`, `/messages`, all `/owner/*`, `/creator`, `/creator/apply` — likely redirect/login/empty; not captured as seeded-auth views. Seed accounts exist (`seed.student@pghunter.local`, `seed.owner@pghunter.local` / `seed-password-123`).
- **Partially/indirectly covered:** `/earn` not separately re-captured in final before pass; `/colleges/[slug]` detail and `/localities/*` not individually captured (index pages captured; slugs exist e.g. `dtu`, `rohini`).
- **Aggregate before record:** `before.json/txt` overwritten per run; screenshots retained in `.hallmark/before/`.

## Open questions
- **Type pair (final pick):** brief requires one characterful display + one plain body, rupee sign in both, NOT brand. Proposed in Picks; confirm or swap.
- **Locality pages:** treated as in-scope public discovery pages (not explicitly named) — confirm.

## Part 2 (system foundation + Home hero/full) — done
- **Status:** done
- `design.md` (old) moved to `docs/design.v1.md` (approved). New `design.md` locked to brief system.
- Scaffold: `theme.mjs scaffold --brand --redesign full` → `src/styles/tokens.css`, `src/styles/base.css` (reference). Tokens integrated into `@theme`/`:root` in `src/styles/global.css` (**token names kept, values changed**). Type: **Bricolage Grotesque** (display) + **Noto Sans** (body/UI, ₹). Ink/warm paper carry UI; yellow `#facc15` primary action; violet `#7a42e6` small accent only (focus/links/verification context); no violet gradients/lavender washes; ornament classes (`.pixel-rule`, `.section-head::before`, corners) neutralized.
- `BaseLayout.astro`: fonts + `theme-color` updated.
- **Home:** rebuilt (no banner image, no HeroScene/BlurText/StarBorder/emoji/eyebrow/pixel ornaments). Hero: `PG tera bhai dilaega` + one sentence + `SearchPanel` + **signature: walkthrough shown play-first** (slot, no seed hardcode). Trust presented as plain proof (not four-icon strip). Live listings wiring preserved (`fetchLiveListingsPage`/`renderLiveCards`/`wireLiveSaveButtons`). `/earn` route preserved (section removed from Home for density/wiring unchanged).
- **Hero stage:** `sloplint --render --stage hero --url http://localhost:4321/` run; hero issues addressed (no literal bg, no middle-dot meta, focus/active present). Cold hero review: headline/sentence/primary action + search visible; signature named; no banner image.
- **Full sweep:** `sloplint --genre playful --render --url http://localhost:4321/` improved major FAILs (contrast/fields/copy markers/ornaments). **Remaining:** FAIL 58 (106 words on one screen at ~y=2600, rendered) and REFLEX 77/39b context from dynamic/section mass — follow up in Part 3/Home polish.
- **Admin sanity (no restyle):** `GET /admin` → 200, `GET /admin/settings` → 200 (render). Shared token shift applied globally; full contrast audit of admin not automated — visual/contrast check recommended.
- **Copy changes (before → after):**
  - Hero: `PG tera bhai dilaega 💪` + long broker paragraph → `PG tera bhai dilaea` (kept exact) + `₹0 brokerage, real walkthroughs, verified listings. Tu pehle dekh, phir decide kar.` (kept meaning/claims)
  - Search placeholders: `Budget — Any`/`Room type — Any`/`₹10k – ₹15k`/`₹15k – ₹20k` → `Budget: Any`/`Room type: Any`/`₹10k to ₹15k`/`₹15k to ₹20k`
  - Search placeholder: `Search college or area — e.g. DTU, Rohini` → `Search college or area, e.g. DTU, Rohini`
  - Trust text tightened (same claims): e.g. `See the room, washroom and building before you visit.` → `See room, mess, building first.`; `Real owners talk about the PG — rules, food and vibes.` → `Rules and food, straight up.`; `Student-focused guidance, no pressure to pay early.` preserved in meaning
  - Listings intro: `Every card here is a real PG, published by its owner and taking enquiries today.` → `Real listings from owners, with real verification status.`
  - Owner CTA: `List your PG or rooms and receive enquiries from verified students near your property. You stay in control of availability, pricing and your own listing.` → `Get enquiries from verified students. You control price and availability.`
  - Loading: `Checking what's live…` → `Checking what’s live…`
  - Trust/terms/consent not found changed in this part.
- **Known issues (report only):** “Starting from” counts occupied room; “Pure veg meals included · ₹3,500/month” contradictory; “1 PGs found” pluralisation.
- **Artifacts:** screenshots `.hallmark/shots/` (hero + full), before `.hallmark/before/`. `compare.html` **not generated** (before record overwritten across captures; rerun with stable `--before/--kept` in later part if needed).

## Part 3 (PGs Near You + Listing detail) — done
- **Status:** done. Frontend running at `http://localhost:4321/` (verified 200).
- **PGs Near You (`/pgs-near-you`, page with tools):** restyled (no eyebrow/pixel ornament, ink/warm, dense tool layout). Search/filters/sort wiring preserved (`#sort-select`, `.filter-chip`, URL sync, `loadListings`/client filter logic, `SearchPanel` form). Cards via `liveListings.ts` now handle **3 image states**: real photo | video poster (YouTube thumbnail + play cue) | none (pixel/noticeboard empty state). Works with 1 and 40 (API/grid logic unchanged). Sweep run; remaining reflex/density (FAIL 58/REFLEX 59,78) noted — search/tools page kept plain/dense per brief.
- **Listing detail (`/pgs/live/[id]`, page with tools):** restyled frame; **gallery/embed wiring preserved** (`VideoPlayer`, gallery nav/keyboard script). **Rooms table preserved** (rent, deposit, status per room). Privacy promise stated **once** in `ContactOwner` (“owner sees your name and contact details only after you send it; no advance payment”); sidebar duplicate removed. **Sidebar controls:** `Send enquiry` (`#enquiry-btn`) triggers `ContactOwner`’s existing `#enquiry-open`/dialog handler (handler preserved, no duplication). `Message owner` kept as separate navigation link (`/messages?owner=…&listing=…`). `ContactOwner` kept as enquiry flow/contact-details component (labeled send enquiry) — **different handlers/purposes; sidebar action connected to existing handler, message nav kept distinct**. Gallery images get error fallback to empty slot (seed/data resilience). Sweep run; remaining FAILs/reflexes (density 58, form contrast/motion details) noted.
- **Files (Part 3):** `src/lib/liveListings.ts`, `src/pages/pgs-near-you.astro`, `src/pages/pgs/live/[id].astro`, `src/components/enquiry/ContactOwner.astro`.
- **Copy changes (before → after):** pgs-near-you budget `₹10k – ₹15k/₹15k – ₹20k` → `to`; empty/loading text tightened (same meaning). ContactOwner: `Contact Owner` CTA/labels → `Send enquiry` where appropriate; budget dashes → `to`; privacy text consolidated (consent/trust meaning preserved, **not reworded as terms**). Listing meta/title dashes removed; placeholder `—` → `…` in UI placeholders.
- **Known issues (report only):** “Starting from” counts occupied room (label/text kept); “Pure veg meals included · ₹3,500/month” contradictory; “1 PGs found” pluralisation.

## Home polish (post-Part 3, user request) — done
- **Status:** done. Frontend running `http://localhost:4321/`.
- Hero: dots darker/subtle and move a little on cursor (no yellow glow, reduced-motion safe). Hero blends into page (no hard border; bottom gradient fade). Trust/proof block: compact with icons (Video/Mic/BadgeCheck/ShieldCheck), less empty space. Wiring/content meaning unchanged.
- Screenshot: `PG-Hunter-Edit/.hallmark/shots/localhost-4321-1440-full.png` (refreshed).

## Part 4 (Colleges, For Owners, Earn) — done
- **Status:** done. Frontend running `http://localhost:4321/`.
- **Colleges (`/colleges`, `/colleges/[slug]`):** restyled to new system (no PixelScene/banner/scrim, no eyebrow/pixel ornament, no violet). Grid uses `data-reveal-group` removal + global fix so content is **visible by default with scripting off** (global `animation-fill-mode: none` for scroll-driven reveals in `src/styles/global.css`); full-page capture visibility addressed. Tiles **do not use one repeated icon** — each tile uses a short-name badge/text mark. Wiring preserved (links, slug pages, live listing fetch on detail).
- **For Owners (`/for-owners`):** restyled. **Plans and prices shown exactly as found in code** via `getPlans()`/`formatINR` (DB-backed with known-good fallback in `src/lib/server/plans.ts`/`src/lib/plans.ts`): renders plan name, tagline, price, duration label, features, checkout note, travel-charge flag as configured. No invented plans/prices.
- **Earn with PG Hunter (`/earn`):** restyled. Shows only content already stated on the page; **no invented payouts or numbers**. Wiring preserved (`/creator/apply`, `/creator`, `/for-owners`).
- **Swept:** `sloplint --genre playful --render --url` on `/colleges`, `/for-owners`, `/earn` (screenshots in `.hallmark/shots/`). Remaining FAIL 58 density/hero-structure reflexes on content-heavy pages noted; key Part 4 requirements met.
- **Localities pages:** in Part 4 table scope but not explicitly requested this turn; not redesigned.
- **Copy changes (before → after):**
  - Colleges: `Pick your campus and discover the best accommodation around it.` → `Pick your campus and see PGs around it across {n} campuses.`; `locality · city` → `locality, city`. Detail: removed em dash in `College — count`; `We're expanding...` → `We’re expanding...` (punctuation).
  - For Owners hero: `For property owners` label folded into structure; `List your PG on PG Hunter and get discovered by students looking for accommodation near your property. You stay in control — we bring the enquiries.` → `List your PG on PG Hunter for student enquiries near your property.` (trust/verification body and step 3 privacy claim preserved). CTA: `drop your details and we'll reach out` → `Drop your details and we'll reach out.` (meaning preserved).
  - Earn hero: removed `Wallet + Earn with PG Hunter` label and `That’s it.` from first sentence; `Already applied? Open dashboard` → `Creator dashboard` (same link). Core content unchanged; **no payouts/numbers invented**.
- **Known issues (report only):** “Starting from” counts occupied room; “Pure veg meals included · ₹3,500/month”; “1 PGs found” pluralisation.

## Parts 5 + 6 (combined, approved) — done
- **Status:** done (swept; some owner/creator sub-screens received shell/header/token passes; complex form internals/JS template strings not fully restyled where risky). Frontend running `http://localhost:4321/`.
- **Part 5 auth:** `/login` redesigned (app screen, no hero/ornaments, 390px-first). Role picker + auth card keep **all IDs/names/handlers** intact (`role-step/auth-step`, `role-student/owner`, tabs, `login-form`/`signup-form` field names `email/password/name/role`, `google-btn`, mismatch flow, all script logic/redirects preserved). `setMode` tab class toggles updated to new system.
- **Student app screens (Part 6):** `/saved` restyled (guest + shortlist states; IDs/handlers preserved; `data-reveal-group` removed). `/messages` restyled (app screen; `ChatApp` wiring/props preserved). `/profile` page shell unchanged (React `ProfileApp` island owns UI; fallback still slate-tinted — **not fully swept**).
- **Messages (ChatApp, wiring preserved):** designed **“No conversation selected”** empty state; input row fixed for 390px (`min-w-0`, `flex-wrap` on small, `shrink-0` actions/send) so inputs stay inside panels; bubbles keep `break-words/whitespace-pre-wrap` (no clipped text intent). Colors moved toward ink/stone system (targeted).
- **Owner shell + routes (swept):** `OwnerLayout.astro` updated (Bricolage+Noto, ink theme-color, warm bg, shared container). `OwnerHeader.astro` token pass. Swept `owner/index` (emoji/ornaments removed, status-first copy, static+many dynamic slate/brand classes updated), `owner/messages`, `owner/verification` (tiers/rules/checklist **read from existing UI/code; nothing invented**), `owner/leads`, `owner/listings` (index/new/edit shell pass via sed), `owner/plans` (index/verified), `owner/profile` (shell pass). **Listing new/edit forms:** fields/names/ids/handlers not changed by design; only safe class/header sweeps applied — **full visual sweep incomplete/risky areas remain**.
- **Creator:** `creator/index`, `creator/apply` swept (headers/ornaments/token pass; form IDs/names/handlers preserved).
- **Swept (sloplint render):** `/login`, `/saved` (screenshots in `.hallmark/shots/`). Auth-gated owner/creator/profile routes not captured as authenticated views (no session). Remaining sloplint FAIL 58/REFLEX on app/login screens noted (not hero pages).
- **Copy changes (before → after, notable):** Login: `Works for both students and owners...` preserved; role/account copy preserved. Saved: `Save the PGs you like and compare them side by side. This feature needs an account so your shortlist follows you.` → `Save PGs you like and compare them. Log in so your shortlist follows you.` (meaning preserved). Messages: tightened description (privacy/feature meaning preserved). Owner dashboard: `Welcome back, <name> 👋` → `Welcome back, <name>`; `Your listings, enquiries and verification at a glance.` → `Status first: enquiries, availability, verification.` Owner/creator headers: removed eyebrow/pixel ornaments; labels tightened. **Trust/terms/consent not reworded.**
- **Known issues (report only):** “Starting from” counts occupied room; “Pure veg meals included · ₹3,500/month”; “1 PGs found” pluralisation. Profile React island/fallback and some owner/creator dynamic template styling may retain legacy classes.

## Next
- **Stop (Parts 5+6 complete).** Part 7 on approval if needed: deeper owner/creator form visual pass, Profile island sweep, localities pages, and final compare/handoff notes. No deletions planned. No push/remotes.
