import { performance } from 'node:perf_hooks';
import { NextResponse } from 'next/server';
import { getDbVendorById, listDbVendorPaymentRecordsByVendorId, listDbVendorProjectRecordsByVendorId } from '@/lib/db/vendor-directory-adapter';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const startedAt = performance.now();
  try {
    const { id } = await params;
    const vendorStartedAt = performance.now();
    const vendor = await getDbVendorById(id);
    const vendorMs = performance.now() - vendorStartedAt;
    if (!vendor) {
      return NextResponse.json({ ok: false, error: '找不到廠商' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') === 'history' ? 'history' : 'open';
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const recordId = searchParams.get('recordId')?.trim() || undefined;

    const paymentStartedAt = performance.now();
    const paymentRecords = await listDbVendorPaymentRecordsByVendorId(id);
    const paymentMs = performance.now() - paymentStartedAt;
    const recordsStartedAt = performance.now();
    const records = await listDbVendorProjectRecordsByVendorId(id, {
      paymentRecords,
      paymentScope: recordId ? 'all' : scope,
      includeDetails,
      recordId,
    });
    const recordsMs = performance.now() - recordsStartedAt;
    const payloadBytes = Buffer.byteLength(JSON.stringify(records), 'utf8');

    console.log('[api-vendor-records]', JSON.stringify({ vendorId: id, scope, includeDetails, recordId: recordId ?? null, vendorMs: Number(vendorMs.toFixed(1)), paymentMs: Number(paymentMs.toFixed(1)), recordsMs: Number(recordsMs.toFixed(1)), recordCount: records.length, paymentCount: paymentRecords.length, payloadBytes, totalMs: Number((performance.now() - startedAt).toFixed(1)) }));
    return NextResponse.json({ ok: true, records });
  } catch (error) {
    console.log('[api-vendor-records]', JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown vendor records error', totalMs: Number((performance.now() - startedAt).toFixed(1)) }));
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown vendor records error' },
      { status: 500 },
    );
  }
}
