import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function requireAdminApi() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
}
