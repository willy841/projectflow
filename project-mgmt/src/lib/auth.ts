import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export type AppRole = 'admin' | 'member';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  isOwner: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
}

const SESSION_COOKIE = 'projectflow_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  const [scheme, salt, digest] = storedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function createInitialPasswordToken() {
  return randomBytes(12).toString('base64url');
}

export function hashInitialPasswordToken(token: string) {
  return hashPassword(token);
}

function mapUserRow(row: any): AuthUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: row.role === 'admin' ? 'admin' : 'member',
    isOwner: Boolean(row.is_owner),
    mustChangePassword: Boolean(row.must_change_password),
    isActive: Boolean(row.is_active),
  };
}

export async function findUserByEmail(email: string) {
  const db = createPhase1DbClient();
  const result = await db.query(
    `select id, email, name, role, is_owner, password_hash, must_change_password, is_active
     from system_users
     where normalized_email = $1
     limit 1`,
    [normalizeEmail(email)],
  );

  const row = result.rows[0] as any;
  if (!row) return null;
  return {
    user: mapUserRow(row),
    passwordHash: row.password_hash ? String(row.password_hash) : null,
  };
}

export async function createUser(input: { email: string; name: string; role: AppRole; isOwner?: boolean; initialPasswordToken?: string; }) {
  const db = createPhase1DbClient();
  const email = input.email.trim();
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = input.initialPasswordToken ? hashInitialPasswordToken(input.initialPasswordToken) : null;

  const result = await db.query(
    `insert into system_users (email, normalized_email, name, role, is_owner, password_hash, must_change_password, is_active)
     values ($1, $2, $3, $4, $5, $6, true, true)
     returning id, email, name, role, is_owner, must_change_password, is_active`,
    [email, normalizedEmail, input.name.trim(), input.role, input.isOwner === true, passwordHash],
  );

  return mapUserRow(result.rows[0] as any);
}

export async function listUsers() {
  const db = createPhase1DbClient();
  const result = await db.query(
    `select id, email, name, role, is_owner, must_change_password, is_active, created_at
     from system_users
     order by is_owner desc, created_at asc`,
  );
  return result.rows.map((row: any) => ({
    ...mapUserRow(row),
    createdAt: String(row.created_at),
  }));
}

export async function updateUserRole(userId: string, role: AppRole) {
  const db = createPhase1DbClient();
  await db.query(`update system_users set role = $2 where id = $1`, [userId, role]);
}

export async function updateUserActiveStatus(userId: string, isActive: boolean) {
  const db = createPhase1DbClient();
  await db.query(`update system_users set is_active = $2 where id = $1`, [userId, isActive]);
}

export async function resetUserToMustChangePassword(userId: string, initialPasswordToken: string) {
  const db = createPhase1DbClient();
  await db.query(
    `update system_users set password_hash = $2, must_change_password = true where id = $1`,
    [userId, hashInitialPasswordToken(initialPasswordToken)],
  );
}

export async function changePassword(userId: string, newPassword: string) {
  const db = createPhase1DbClient();
  await db.query(
    `update system_users set password_hash = $2, must_change_password = false where id = $1`,
    [userId, hashPassword(newPassword)],
  );
}

export async function createSession(userId: string) {
  const db = createPhase1DbClient();
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await db.query(
    `insert into auth_sessions (user_id, session_token_hash, expires_at)
     values ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (rawToken) {
    const db = createPhase1DbClient();
    await db.query(`delete from auth_sessions where session_token_hash = $1`, [hashToken(rawToken)]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const db = createPhase1DbClient();
  const result = await db.query(
    `select u.id, u.email, u.name, u.role, u.is_owner, u.must_change_password, u.is_active
     from auth_sessions s
     join system_users u on u.id = s.user_id
     where s.session_token_hash = $1
       and s.expires_at > now()
     limit 1`,
    [hashToken(rawToken)],
  );

  const row = result.rows[0] as any;
  if (!row) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  await db.query(`update auth_sessions set last_seen_at = now() where session_token_hash = $1`, [hashToken(rawToken)]);
  return mapUserRow(row);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.isActive) redirect('/login?error=inactive');
  if (user.mustChangePassword) redirect('/reset-password');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/forbidden');
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const record = await findUserByEmail(email);
  if (!record) return { ok: false as const, reason: 'invalid' as const };
  if (!record.user.isActive) return { ok: false as const, reason: 'inactive' as const };
  if (!verifyPassword(password, record.passwordHash)) return { ok: false as const, reason: 'invalid' as const };
  return { ok: true as const, user: record.user };
}
