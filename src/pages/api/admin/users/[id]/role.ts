/**
 * PUT /api/admin/users/:id/role — change an account role (for now: make an
 * existing student account an owner).
 *
 * Why this exists: the launch workflow is "an owner registers and the team
 * lists PGs on their account". Some owners register through the student door
 * first (e.g. Google sign-in with no ?role=owner), and nothing could promote
 * them afterwards — the owner picker in /admin/pgs/new only reads role='owner'.
 *
 *   role: 'owner'   — promote the account
 *   role: 'student' — demote it back (the reverse, rarely needed; never used
 *                     to punish a student, owners keep talking to owners)
 *
 * Guardrails: admins cannot change their own role, cannot change the role of
 * any other admin account, and roles outside the user vocabulary are refused.
 */
export const prerender = false;

import type { APIContext } from 'astro';

import { getDb, json, nowIso, readBody, requireAdmin, type UserRow } from '@/lib/server/auth';
import { isUserRole, type UserRole } from '@/lib/roles';

export async function PUT(context: APIContext) {
  const auth = await requireAdmin(context);
  if ('error' in auth) return auth.error;

  const id = context.params.id;
  if (!id) return json({ error: 'Missing user id.' }, 400);

  const body = await readBody(context);
  if (!body) return json({ error: 'Invalid request body.' }, 400);

  const requested: UserRole | null = isUserRole(body.role) ? body.role : null;
  if (!requested) return json({ error: 'Role must be student or owner.' }, 400);

  const db = getDb();
  const target = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();
  if (!target) return json({ error: 'Account not found.' }, 404);

  if (target.is_admin) {
    return json({ error: 'Admin accounts cannot have their role changed.' }, 400);
  }
  if (target.role === requested) {
    return json({ error: `This account is already a ${requested}.` }, 409);
  }

  await db
    .prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
    .bind(requested, nowIso(), id)
    .run();

  return json({ user: { id, role: requested } });
}
