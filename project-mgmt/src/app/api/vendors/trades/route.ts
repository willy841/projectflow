import { NextResponse } from 'next/server';
import { createDbVendorTrade, listDbVendorTrades } from '@/lib/db/vendor-directory-adapter';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { requireAdminApi } from '@/lib/api-auth';

export async function GET() {
  try {
    const trades = await listDbVendorTrades();
    return NextResponse.json({ ok: true, trades });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown vendor trade list error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const body = (await request.json()) as { name?: string };
    const trade = await createDbVendorTrade(body.name ?? '');
    return NextResponse.json({ ok: true, trade, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown vendor trade create error' }, { status: 500 });
  }
}
