import { headers } from 'next/headers';

export async function getRequestOrigin() {
  const h = await headers();
  const forwardedProto = h.get('x-forwarded-proto');
  const forwardedHost = h.get('x-forwarded-host');
  const host = forwardedHost || h.get('host');
  const proto = forwardedProto || (host?.includes('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https');

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.APP_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
}
