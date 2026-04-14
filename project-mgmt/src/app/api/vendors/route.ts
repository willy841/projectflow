import { NextResponse } from 'next/server';
import { listDbVendors } from '@/lib/db/vendor-directory-adapter';

export async function GET() {
  try {
    const vendors = await listDbVendors();
    return NextResponse.json({ ok: true, vendors });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown vendor list error' }, { status: 500 });
  }
}
