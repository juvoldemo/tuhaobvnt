import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export function matchesPassword(value) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof value !== 'string') return false;
  const a = Buffer.from(value), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function createSession() {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expires}.${createHmac('sha256', process.env.ADMIN_PASSWORD).update(expires).digest('hex')}`;
}
export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const token = (await cookies()).get('advisor-admin')?.value || '';
  const [expires, signature] = token.split('.');
  if (!signature || Number(expires) <= Date.now() || !/^\d+$/.test(expires)) return false;
  const expected = createHmac('sha256', process.env.ADMIN_PASSWORD).update(expires).digest('hex');
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
export function sameOrigin(request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
