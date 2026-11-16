/**
 * GET /sitemap.xml — every indexable URL, generated per request.
 *
 * The static half (home, browse pages, localities, colleges) would fit in a
 * build-time sitemap, but the listings live in D1 and change without a deploy:
 * an owner can publish, pause or let a plan lapse at any moment. A single
 * on-demand sitemap keeps one file authoritative and always current — and it
 * applies the same visibility rule as /pgs/live/[id] (status `active` and inside
 * its plan window), so Google never indexes a page that answers 404.
 *
 * Route is listed in wrangler.toml `run_worker_first`: without that entry the
 * asset router answers /sitemap.xml with its 404 page before the Worker runs.
 */
export const prerender = false;

import type { APIContext } from 'astro';
import { getDb } from '@/lib/server/auth';
import { colleges, localities } from '@/data/colleges';
import { isExpired } from '@/lib/verificationRules';

/** Prerendered pages that should be in the index. Written with their trailing
 *  slash: that is the canonical URL the asset router actually serves. */
const STATIC_PATHS = [
  '/',
  '/pgs-near-you/',
  '/colleges/',
  '/localities/',
  '/for-owners/',
  '/earn/',
  '/about/',
];

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Sitemap `lastmod` is a date; anything unparseable is simply omitted. */
const toLastmod = (iso: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL(context.request.url)).origin;
  const absolute = (path: string): string => new URL(path, origin).href;

  const listings = await getDb()
    .prepare(
      `SELECT id, updated_at, expires_at
         FROM owner_listings
        WHERE status = 'active'
        ORDER BY updated_at DESC`
    )
    .all<{ id: string; updated_at: string; expires_at: string | null }>()
    .then((res) => res.results)
    // A dead database must not take the whole sitemap down; the static URLs are
    // still worth serving.
    .catch(() => [] as { id: string; updated_at: string; expires_at: string | null }[]);

  const urls: { loc: string; lastmod: string | null }[] = [
    ...STATIC_PATHS.map((path) => ({ loc: absolute(path), lastmod: null })),
    ...localities.map((locality) => ({
      loc: absolute(`/localities/${locality.slug}/`),
      lastmod: null,
    })),
    ...colleges.map((college) => ({
      loc: absolute(`/colleges/${college.slug}/`),
      lastmod: null,
    })),
    ...listings
      .filter((row) => !isExpired({ expires_at: row.expires_at ?? null }))
      .map((row) => ({
        loc: absolute(`/pgs/live/${row.id}`),
        lastmod: toLastmod(row.updated_at),
      })),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (entry) =>
        `  <url><loc>${escapeXml(entry.loc)}</loc>${
          entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''
        }</url>`
    ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // A listing that goes live should be discoverable within the half hour,
      // not after a stale cache expires.
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
