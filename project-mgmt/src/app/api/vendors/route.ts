import { NextResponse } from 'next/server';
import { createDbVendor, listDbVendorTrades, listDbVendors } from '@/lib/db/vendor-directory-adapter';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';

export async function GET() {
  try {
    const [vendors, trades] = await Promise.all([listDbVendors(), listDbVendorTrades()]);
    return NextResponse.json({ ok: true, vendors, trades });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown vendor list error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const body = (await request.json()) as { name?: string; tradeLabel?: string | null };
    const vendor = await createDbVendor({
      name: body.name ?? '',
      tradeLabel: body.tradeLabel ?? null,
    });
    return NextResponse.json({ ok: true, vendor, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown create vendor error' }, { status: 500 });
  }
}
