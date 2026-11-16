import type { APIContext } from 'astro';
import { currentUser, json, publicUser } from '@/lib/server/auth';

export const prerender = false;

/**
 * GET /api/auth/me — who is making this request, or nobody.
 *
 * "Signed out" is an answer, not an error: every public page asks this on load
 * (header, footer, page script), and answering 401 turned a normal anonymous
 * visit into a console full of failed requests.
 */
export async function GET(context: APIContext) {
  const user = await currentUser(context);
  return json({ user: user ? publicUser(user) : null });
}
