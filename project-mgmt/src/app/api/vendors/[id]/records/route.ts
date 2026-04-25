import { NextResponse } from 'next/server';
import { getDbVendorById, listDbVendorPaymentRecordsByVendorId, listDbVendorProjectRecordsByVendorId } from '@/lib/db/vendor-directory-adapter';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vendor = await getDbVendorById(id);
    if (!vendor) {
      return NextResponse.json({ ok: false, error: '找不到廠商' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') === 'history' ? 'history' : 'open';
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const recordId = searchParams.get('recordId')?.trim() || undefined;

    const paymentRecords = await listDbVendorPaymentRecordsByVendorId(id);
    const records = await listDbVendorProjectRecordsByVendorId(id, {
      paymentRecords,
      paymentScope: recordId ? 'all' : scope,
      includeDetails,
      recordId,
    });

    return NextResponse.json({ ok: true, records });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown vendor records error' },
      { status: 500 },
    );
  }
}
