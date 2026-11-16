/**
 * PG Hunter — request middleware.
 *
 * Runs for every on-demand route (/api/*, /admin/*, /owner/*, and any page
 * with `export const prerender = false`). Prerendered public pages are served
 * from the Workers static asset store and bypass the Worker entirely, so their
 * headers come from the `dist/_headers` file generated at build time from
 * `lib/server/securityHeaders.ts`.
 *
 * Responsibilities, in order:
 *   1. CSRF / cross-origin rejection for state-changing methods.
 *   2. Rate limiting, before any route work, so a flood never reaches a
 *      handler.
 *   3. Security response headers on everything that gets past the above.
 */

import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';

import { applySecurityHeaders } from './lib/server/securityHeaders';
import {
  consumeRateLimit,
  callerIdentifier,
  rateLimitResponse,
  sweepRateLimits,
} from './lib/server/rateLimit';
import { isCrossOriginRequest, isSafeMethod, rateLimitScopeFor } from './lib/server/requestPolicy';
import { SESSION_COOKIE, getDb, getUserFromSession } from './lib/server/auth';

/**
 * CSP hashes for per-request inline scripts.
 *
 * Every inline <script> on a page has to appear in script-src as a hash: the
 * build-time pass in scripts/generate-static-headers.mts only covers
 * prerendered HTML, so on-demand routes were quietly losing their inline
 * scripts — the layout's motion failsafe, and now listing JSON-LD built from
 * D1 (see pages/pgs/live/[id].astro). Both are hashed here and appended to
 * script-src for this response. Reading a clone leaves the real body untouched.
 */
const inlineScriptHashes = async (response: Response): Promise<string[]> => {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/html')) return [];

  let html: string;
  try {
    html = await response.clone().text();
  } catch {
    return [];
  }

  const blocks = html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g);
  const hashes: string[] = [];
  for (const block of blocks) {
    // External scripts are covered by 'self', and an empty body hashes to the
    // hash of nothing — skip both.
    if (/\bsrc\s*=/.test(block[1])) continue;
    const body = block[2];
    if (!body) continue;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    hashes.push(`'sha256-${base64}'`);
  }
  return hashes;
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const method = request.method.toUpperCase();
  const url = new URL(request.url);

  // --- 1. CSRF -----------------------------------------------------------
  if (!isSafeMethod(method) && isCrossOriginRequest(request, url.origin)) {
    return new Response(JSON.stringify({ error: 'Cross-origin request blocked.' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  // --- 2. Rate limiting --------------------------------------------------
  const scope = rateLimitScopeFor(url.pathname, method);
  if (scope) {
    const db = getDb();
    // One session lookup, reused for both identity and the counter. Failures
    // degrade to IP-based counting rather than skipping the limit.
    const user = await getUserFromSession(
      db,
      context.cookies.get(SESSION_COOKIE)?.value
    ).catch(() => null);

    const decision = await consumeRateLimit(db, scope, callerIdentifier(request, user?.id), {
      salt: env.RATE_LIMIT_SALT,
    });

    void sweepRateLimits(db);

    if (!decision.allowed) {
      return applySecurityHeaders(rateLimitResponse(decision, scope), request);
    }
  }

  // --- 3. Security headers ----------------------------------------------
  const response = await next();
  const scriptHashes = await inlineScriptHashes(response);
  return applySecurityHeaders(response, request, { scriptHashes });
});
