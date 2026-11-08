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

## Stylify pass (user request: richer noticeboard, full) — done
- **Status:** done. Frontend running `http://localhost:4321/`.
- **User ask:** redesign most of what exists, more stylish, not overdone; brand stays (headline, logo, wordmark, yellow action, violet small accent).
- **Direction:** Richer noticeboard (locked system pushed with depth): warmer paper/ink tokens, softer large shadows, filled colour mono-tiles, coloured chips, lever on the headline, one ink surface footer; no new colors beyond accents.
- **Changes:**
  - `@theme`/`:root`: warmer paper/card/background (#f5f1ea/#fffefb/...), deeper warm shadows, new stage tokens; **default Tailwind `slate` scale remapped to warm ink/paper equivalents** (shared tokens — admin not restyled, still renders, contrast holds; admin was NOT restyled).
  - `PublicHeader.astro`: new-system tokens/warm background, active tab remains ink pill, slate classes → warm tokens.
  - `Footer.astro`: ink surface (one deep contrast band), yellow accents, tracked-uppercase labels removed → sentence case, legacy classes gone.
  - Home (`src/pages/index.astro`): richer hero — highlighted “bhai” marker wash, chip row, stage walkthrough on ink card (play stays play-first), ticker of existing brand copy, colleges grid shows coloured mono-tiles; portal shadow with token.
  - `colleges/index`, `localities/index`, `localities/[slug]`: PixelScene banner/scrim and eyebrow/pixel ornaments removed; same warm system, coloured mono-tiles (no repeated icon), content visible default; slug rewired unchanged (live fetch intact).
  - `owner/verification`: tracked-caps checklist group labels → sentence case bold (not reworded).
- **Swept:** sloplint render on `/`, `/localities`; routes checked 200 (`/`, `/colleges`, `/localities`, `/pgs-near-you`, `/for-owners`, `/earn`, `/login`, `/saved`, `/messages`, `/owner`, `/owner/verification`, `/creator`). Remaining FAILs: 58 screen-budget on self-authored hero chips (owner's content kept — waived; 58 is a note). `compare.html` not generated (before record overwritten across captures).
- **Copy changes (before → after):** none reworded; hero slot/labels unchanged (Play-first copy kept). Localities: `Pick your area and discover the best accommodation around it.` → `Pick your area and see PGs around it across {n} areas.`; `We're expanding...` → `We’re expanding...`; empty-state `Browse everything that is live right now` → `Browse what’s live now` (meaning preserved). College pb unchanged except mono-tile markup.
- **Known issues (report only):** “Starting from” occupied room; “Pure veg meals included · ₹3,500/month”; “1 PGs found” pluralisation. ListingForm/Profile islands not fully surface-rewritten (slate tokens remap warms them safely). Admin not restyled (out of scope).

## Part 7 (Creator routes as app screens + final checks) — done
- **Status:** done. Frontend running `http://localhost:4321/`. Branch `redesign/hallmark`, local only.
- **Creator routes (in scope beyond landing):** `/creator` and `/creator/apply` redesigned as **app screens** (no hero stage, shared container, dense sections, one container width matching header/page/footer). Wiring preserved: every `id`, `data-*`, handler, fetch/revalidate route, and script flow (status banner, assignments actions, share-link copy/whatsApp, profile gaps, activity feed, apply validation/resubmit flow via `validateCreatorApplication`) intact. Not-a-creator state now shows the pixel skyline empty state (fills empty state).
- **Login:** added focus-visible/active style block (matches other pages; sloplint 26a closed on /login).
- **`src/pages/pgs/live/[id].astro`:** fixed a literal U+2026 ellipsis in a spread (`Math.min(…rooms.map…)`) — a pre-existing parse/type error, now `Math.min(...rooms.map(...))`; required for `npm run check` to pass. No content/wiring change.
- **Final checks:**
  - `npm run check`: **0 errors** (1 pre-existing hint: unused `GradientBackdrop` import).
  - `npm run build`: passes (33 pages, `_headers` 3 inline script hash(es) injected).
  - `npm run test`: **162/162 pass**.
  - `/admin`, `/admin/settings`: no **contrast FAIL** (sloplint --render). Admin **not restyled** (out of scope); remaining findings: eyebrow/tracking/middle-dots/focus-visible — all preexisting, reported not fixed.
  - `sloplint --kept` on `/login` (the only route whose `--before` record persists): **kept links 19/19 · fields 4/4 · headings 4/4 · figures 2/2**. `compare.html` at `.hallmark/compare.html`.
  - Other 10 routes swept with `--render` (HOME/pgs-near-you/colleges/dtu/localities/rohini/for-owners/earn/saved/messages): findings recorded; no route removed, nothing deleted.
- **Copy changes (creator routes, before → after):**
  - Dashboard subtitle: `Your application, the PGs assigned to you, and what you have earned.` → `Your application, assignments and what you have earned.`
  - WhatsApp share message: `...List your PG on PG Hunter — here's my invite link: ...` → `...List your PG on PG Hunter. Here's my invite link: ...`
  - `An admin reads every application — decisions usually land in your dashboard, and we` → `...application. Decisions usually land...`
  - All trust/consent/terms/verification text preserved verbatim; `id`s/handlers unchanged.
- **Known issues (report only):** “Starting from” counts occupied room; “Pure veg meals included · ₹3,500/month”; “1 PGs found” pluralisation; creator placeholder glyphs (`—`) flagged by sloplint FAIL 19 are dynamic empty-state placeholders, not dead em-dashes in copy — left as-is.

## Part 8 (Backend wiring + production deploy) — done
- **Status:** done. Backend verified end-to-end, two production bugs fixed and deployed live to `pg-hunter` on `pghunter.in`. Latest commits: `48ea184`, `dae44af` (+follow-up), `c508a3`/`c5085a3` docs; deploy version `74f63544-540a…`.
- **Full local API sweep** (`/tmp/opencode/pg-backend-sweep.mts`): **82/82 checks pass** against `astro dev` — auth (register/login/logout/me, 401s), profile + avatar R2, owner listing create/update/submit, R2 media upload + public serve, verification docs, YouTube media, payments (UPI claim → admin confirm → plan window), admin stats/inbox/seen/reports/tours/verifications, public listings + filters, saved toggle, views, reactions, enquiries + 409 duplicate window (`duplicate:true, leadId`), enquiry events, direct-contact unlock, leads inbox + PATCH, chat thread + messages + read receipts, creator apply → admin approve → assignment lifecycle (start/submit/approve), reports + admin dismiss, security headers, rate limits (429 + Retry-After; harness sets `CF-Connecting-IP` + same-origin `Origin` per request), SSR pages, listing detail render.
- **Real backend bug fixed:** `src/lib/server/listingWrite.ts` `INSERT INTO owner_listings` had 22 columns / 21 placeholders — every owner/admin listing creation 500'd (`D1_ERROR: 21 values for 22 columns`, local AND prod). Fixed in `48ea184` (also committed pre-existing try/catch change in `src/pages/api/chat/index.ts`).
- **Prod routing bug found + fixed:** `/for-owners` 404'd on `pghunter.in` (asset-router 404 page, 29419 B/etag, zero worker invocations per tail) while `/admin` etc. worked. Root cause: the Astro adapter **freezes a snapshot of `wrangler.toml`** (bindings, vars, `run_worker_first` rules) into `dist/server/wrangler.json` at `astro build` time; bare `npx wrangler deploy` on a stale dist uploads the old snapshot, so the new `run_worker_first` entries never reached the deployed config. Confirmed via miniflare router-source inspection + a standalone probe worker (same rules routed `/admin` but not `/for-owners`; standalone worker with real dist proves only the built config differed). Fix = `npm run deploy` (build → fresh snapshot); deployed version `74f63544-540a-46e2-9ddd-ccc512290ec8`. Documented in `wrangler.toml` + `CLOUDFLARE_SETUP.md` (`c5085a3`).
- **Live verification matrix (all 200 unless noted):** `/`, `/for-owners` (+`/for-owners/`) SSR content verified, `/colleges/`, `/localities/`, `/login/`, `/earn/`, `/saved/`, `/messages`, `/admin`, `/owner/plans`, `/api/health`, `/api/listings`, `/robots.txt`, `/sitemap-index.xml`; OAuth start 302 → Google with `redirect_uri=https://pghunter.in/api/auth/google/callback`; `/pgs/live/<junk>` → Worker-rendered 404; workers.dev mirror OK. Prod secrets set (ADMIN_EMAILS, GOOGLE_CLIENT_ID/SECRET, RATE_LIMIT_SALT); remote D1 migrations 0010/0014/0015 applied ("No migrations to apply!"); prod D1 still **0 listings** (owner chose not to seed). Known prod quirks (pre-existing): bare prerendered paths 307 → trailing slash (`/colleges` → `/colleges/`).
- **Files touched (backend):** `src/lib/server/listingWrite.ts` (bug fix), `wrangler.toml` (run_worker_first entries + comment), `CLOUDFLARE_SETUP.md` (freeze warning). `npm run check` 0 errors, `npm run test` 162/162, `npm run build` OK.

## Next
- **Stop (Part 7 complete). No parts remaining unless you ask.** Local-only; no push/remotes; `src/pages/api/chat/index.ts` and `design-audit/` left uncommitted (preexisting). No deletions executed.
