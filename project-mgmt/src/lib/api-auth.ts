import { NextResponse } from 'next/server';
import { requireAdmin, requireUser } from '@/lib/auth';

export async function requireUserApi() {
  try {
    await requireUser();
    return null;
  } catch {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
}

export async function requireAdminApi() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
}
