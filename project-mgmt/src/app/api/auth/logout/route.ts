import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';
import { getRequestOrigin } from '@/lib/runtime-url';

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL('/login', await getRequestOrigin()));
}
