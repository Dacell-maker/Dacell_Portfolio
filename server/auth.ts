import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { config } from './config.ts';

/* ---------------------------------------------------------------- passwords */

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derived] = stored.split(':');
  if (!salt || !derived) return false;
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(derived, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* --------------------------------------------------------------------- jwt */

const base64url = (input: Buffer | string) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function sign(data: string): string {
  return base64url(createHmac('sha256', secret()).update(data).digest());
}

function secret(): string {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured. Add it to your environment variables.');
  }
  return config.jwtSecret;
}

export function signToken(payload: Record<string, unknown>, ttlSeconds = 60 * 60 * 12): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: issuedAt, exp: issuedAt + ttlSeconds }));
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    if (signature !== sign(`${header}.${body}`)) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8')) as Record<string, unknown>;
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
