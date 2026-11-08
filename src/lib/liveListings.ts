/**
 * PG Hunter — live D1 listings on the public site.
 *
 * Listings only exist in D1 and can change at any moment, so every public
 * surface fetches them from the `GET /api/listings` endpoint and renders them
 * client-side through one card renderer. There is no bundled catalogue: an
 * empty result is a legitimate answer, and the caller decides how to say so.
 *
 * Nothing here queries D1 directly — the API owns visibility rules (approved
 * listings inside their plan window only), so a page can never render a draft.
 *
 * Everything that reaches the markup goes through the escaping helpers in
 * lib/html — a listing name, locality and description are owner input.
 */

import type { Listing } from '@/lib/auth';
import { amenityBySlug } from '@/data/amenities';
import { escapeAttr, escapeHtml, safeImageSrc } from '@/lib/html';
import { formatINR } from '@/lib/format';

/** A public listing as the API returns it, plus the cheapest room's rent. */
export interface LiveListing extends Listing {
  minRent: number | null;
}

export interface LiveQuery {
  limit?: number;
  q?: string;
  sort?: string;
  gender?: string;
  budget?: string;
  roomType?: string;
  ids?: string[];
}

/** Public listings plus the size of the matching board. */
export interface LiveListingsPage {
  listings: LiveListing[];
  /** Total matches for the query — not the size of `listings`, which is one page. */
  total: number;
}

/** Fetch one page of public listings; never throws — an empty page is fine. */
export const fetchLiveListingsPage = async (
  query: LiveQuery = {}
): Promise<LiveListingsPage> => {
  const search = new URLSearchParams();
  if (query.limit) search.set('limit', String(query.limit));
  if (query.q) search.set('q', query.q);
  if (query.sort) search.set('sort', query.sort);
  if (query.gender) search.set('gender', query.gender);
  if (query.budget) search.set('budget', query.budget);
  if (query.roomType) search.set('roomType', query.roomType);
  if (query.ids?.length) search.set('ids', query.ids.join(','));

  try {
    const res = await fetch(`/api/listings?${search.toString()}`, { credentials: 'same-origin' });
    if (!res.ok) return { listings: [], total: 0 };
    const data = (await res.json()) as { listings?: LiveListing[]; total?: number };
    const listings = Array.isArray(data.listings) ? data.listings : [];
    return {
      listings,
      total: typeof data.total === 'number' ? data.total : listings.length,
    };
  } catch {
    return { listings: [], total: 0 };
  }
};

/** Just the listings, for callers that do not need the board size. */
export const fetchLiveListings = async (query: LiveQuery = {}): Promise<LiveListing[]> =>
  (await fetchLiveListingsPage(query)).listings;

/**
 * Union of several keyword searches, de-duplicated by listing id.
 *
 * A college landing page has to match its short name ("DTU") *and* its area
 * ("Rohini") — an owner rarely names the campus in their listing — and the API
 * takes a single `q`. Terms run in parallel and a listing matching both only
 * appears once.
 */
export const fetchLiveListingsFor = async (
  terms: string[],
  limit = 24
): Promise<LiveListing[]> => {
  const unique = [...new Set(terms.map((term) => term.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const pages = await Promise.all(
    unique.map((term) => fetchLiveListingsPage({ q: term, limit }))
  );

  const byId = new Map<string, LiveListing>();
  for (const page of pages) {
    for (const listing of page.listings) {
      if (!byId.has(listing.id)) byId.set(listing.id, listing);
    }
  }
  return [...byId.values()];
};

const verificationMeta = (status: Listing['verificationStatus']): { label: string; className: string } => {
  switch (status) {
    case 'rishabh_irl_verified':
      return { label: 'Rishabh IRL Verified', className: 'bg-emerald-100 text-emerald-800' };
    case 'pg_hunter_verified':
      return { label: 'PG Hunter Verified', className: 'bg-brand-100 text-brand-800' };
    default:
      return { label: 'Listed', className: 'bg-white/90 text-slate-700' };
  }
};

type MediaSlot = { kind: 'photo'; src: string } | { kind: 'video-poster'; src: string } | { kind: 'empty' };

const ytPoster = (id: string): string | null => {
  const clean = id.trim();
  return clean ? `https://i.ytimg.com/vi/${encodeURIComponent(clean)}/hqdefault.jpg` : null;
};

const mediaSlotOf = (listing: LiveListing): MediaSlot => {
  const photo = listing.media.find((m) => m.type === 'photo' && (m.url || m.externalId));
  const photoSrc = photo ? safeImageSrc(photo.url ?? photo.externalId) : null;
  if (photoSrc) return { kind: 'photo', src: photoSrc };
  const video = listing.media.find((m) => m.type === 'video' && m.provider === 'youtube' && m.externalId);
  const poster = video ? ytPoster(video.externalId) : null;
  if (poster) return { kind: 'video-poster', src: poster };
  return { kind: 'empty' };
};

const BOOKMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`;

const roomSummary = (listing: LiveListing): string =>
  [...new Set(listing.rooms.map((room) => room.occupancy || room.roomType))].join(', ');

const renderMediaSlot = (slot: MediaSlot, name: string): string => {
  if (slot.kind === 'photo') {
    return `<img src="${escapeAttr(slot.src)}" alt="${escapeAttr(name)}" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" width="800" height="600" />`;
  }
  if (slot.kind === 'video-poster') {
    return `<img src="${escapeAttr(slot.src)}" alt="${escapeAttr(`${name} walkthrough`)}" loading="lazy" decoding="async" class="h-full w-full object-cover" width="800" height="600" />
      <span class="absolute inset-0 flex items-center justify-center" aria-hidden="true"><span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-400 text-stone-900 shadow"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></span>`;
  }
  // Empty state (pixel/noticeboard feel, not a flat photo stand-in).
  return `<div class="flex h-full w-full items-center justify-center bg-stone-900 p-4 text-white" aria-label="No photo yet">
    <div class="text-center">
      <svg class="mx-auto h-10 w-10 text-accent-300" viewBox="0 0 64 40" fill="currentColor" aria-hidden="true"><rect x="4" y="18" width="12" height="18" opacity="0.35"/><rect x="18" y="10" width="14" height="26"/><rect x="34" y="14" width="10" height="22" opacity="0.6"/><rect x="46" y="6" width="14" height="30" opacity="0.45"/><rect x="22" y="16" width="3" height="3" fill="#1c1917"/><rect x="27" y="16" width="3" height="3" fill="#1c1917"/><rect x="22" y="22" width="3" height="3" fill="#1c1917"/><rect x="27" y="22" width="3" height="3" fill="#1c1917"/></svg>
      <p class="mt-3 text-xs font-semibold text-stone-200">No photo yet</p>
      <p class="mt-1 text-[11px] text-stone-400">Walkthrough or photos show up here</p>
    </div>
  </div>`;
};

/** One live listing as a card. Slot states: real photo | video poster | none (pixel empty). */
export const liveCardHtml = (listing: LiveListing, opts?: { removable?: boolean }): string => {
  const href = `/pgs/live/${encodeURIComponent(listing.id)}`;
  const slot = mediaSlotOf(listing);
  const verification = verificationMeta(listing.verificationStatus);
  const rent = listing.minRent ?? (listing.rooms.length ? Math.min(...listing.rooms.map((r) => r.rent)) : null);
  const rooms = roomSummary(listing);
  const amenities = listing.amenitySlugs
    .slice(0, 3)
    .map((slug) => amenityBySlug(slug)?.label ?? slug)
    .map((label) => `<span class="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">${escapeHtml(label)}</span>`)
    .join(' ');
  const roomTypes = [...new Set(listing.rooms.map((room) => room.roomType))].join(' ');

  return `
<article class="card card-hover group relative flex flex-col overflow-hidden" data-property data-live-listing data-property-id="${escapeAttr(listing.id)}" data-reveal
  data-rent="${rent !== null ? escapeAttr(rent) : ''}"
  data-name="${escapeAttr(listing.name.toLowerCase())}"
  data-locality="${escapeAttr(`${listing.locality} ${listing.city}`.toLowerCase())}"
  data-colleges="${escapeAttr(listing.city.toLowerCase())}"
  data-college-names="${escapeAttr(listing.city.toLowerCase())}"
  data-roomtypes="${escapeAttr(roomTypes)}"
  data-gender="${escapeAttr(listing.gender)}"
  data-food="${listing.food?.available ? 'yes' : 'no'}"
  data-verified="${escapeAttr(listing.verificationStatus)}">
  <a href="${escapeAttr(href)}" class="relative block aspect-[4/3] overflow-hidden bg-stone-100" tabindex="-1" aria-hidden="true">
    ${renderMediaSlot(slot, listing.name)}
    <span class="absolute left-3 top-3 inline-flex items-center rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-800 shadow-sm">
      ${escapeHtml(verification.label)}
    </span>
    ${slot.kind === 'video-poster' ? `<span class="absolute right-3 top-3 inline-flex items-center rounded-md bg-stone-900/85 px-2 py-1 text-[10px] font-bold text-white">Video</span>` : ''}
  </a>
  <div class="flex flex-1 flex-col gap-2.5 p-4">
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-display text-base font-bold leading-snug text-stone-900">
        <a href="${escapeAttr(href)}" class="after:absolute after:inset-0">${escapeHtml(listing.name)}</a>
      </h3>
      ${
        opts?.removable
          ? `<button type="button" data-remove-saved="${escapeAttr(listing.id)}" class="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-stone-500 hover:bg-red-50 hover:text-red-700" aria-label="${escapeAttr(`Remove ${listing.name} from saved`)}" title="Remove from saved">✕</button>`
          : `<button type="button" data-save-btn data-property-id="${escapeAttr(listing.id)}" class="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900" aria-label="${escapeAttr(`Save ${listing.name} to your shortlist`)}" aria-pressed="false" title="Save to shortlist">${BOOKMARK_SVG}</button>`
      }
    </div>
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-stone-600">
      <span>${escapeHtml(listing.locality)}${listing.locality && listing.city ? ', ' : ''}${escapeHtml(listing.city)}</span>
      <span>${escapeHtml(listing.gender === 'co-ed' ? 'Co-ed' : listing.gender === 'boys' ? 'Boys' : 'Girls')}</span>
    </p>
    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span class="font-display text-xl font-extrabold text-stone-900">${rent !== null ? escapeHtml(formatINR(rent)) : 'Ask owner'}</span>
      ${rent !== null ? '<span class="text-xs font-medium text-stone-600">/month starting from</span>' : ''}
    </div>
    ${rooms ? `<p class="text-sm font-semibold text-stone-700">${escapeHtml(rooms)}</p>` : ''}
    ${amenities ? `<div class="flex flex-wrap gap-1.5">${amenities}</div>` : ''}
    <div class="mt-auto flex items-center gap-3 border-t border-stone-200 pt-3">
      <a href="${escapeAttr(href)}" class="btn-secondary min-h-11 flex-1 text-sm">View Details</a>
    </div>
  </div>
</article>`;
};

/** Replace a container's contents with live cards; returns how many rendered. */
export const renderLiveCards = async (
  container: HTMLElement,
  listings: LiveListing[],
  opts?: { removable?: boolean }
): Promise<number> => {
  container.innerHTML = listings.map((listing) => liveCardHtml(listing, opts)).join('');
  // Cards injected after page load need their entrances wired now.
  if (listings.length > 0) {
    const { initMotionUI } = await import('@/lib/motion/ui');
    initMotionUI();
  }
  return listings.length;
};

/**
 * Wire save buttons on cards that were injected after page load.
 *
 * Marking each button keeps a second call from double-binding the same element,
 * which matters on pages that render cards, re-render them, and then wire again.
 */
export const wireLiveSaveButtons = async (root: ParentNode = document): Promise<void> => {
  const { getCurrentSession, isSaved, toggleSaved } = await import('@/lib/auth');
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-save-btn]:not([data-save-wired])')
  );

  for (const btn of buttons) {
    btn.dataset.saveWired = '1';
    const propertyId = btn.dataset.propertyId ?? '';
    if (!propertyId) continue;

    const setState = (saved: boolean) => {
      const svg = btn.querySelector('svg');
      btn.classList.toggle('text-brand-600', saved);
      btn.setAttribute('aria-pressed', String(saved));
      btn.setAttribute('aria-label', saved ? 'Remove from shortlist' : 'Save to shortlist');
      btn.title = saved ? 'Remove from shortlist' : 'Save to shortlist';
      if (svg) svg.style.fill = saved ? 'currentColor' : 'none';
    };

    setState(await isSaved(propertyId));

    btn.addEventListener('click', async () => {
      const session = await getCurrentSession();
      if (!session) {
        const here = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(here)}`;
        return;
      }
      const { saved, error } = await toggleSaved(propertyId);
      if (!error) {
        setState(saved);
        window.dispatchEvent(new CustomEvent('pghunter:saved', { detail: { propertyId, saved } }));
      }
    });
  }
};
