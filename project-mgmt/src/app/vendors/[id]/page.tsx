import { notFound } from 'next/navigation';
import { performance } from 'node:perf_hooks';
import { AppShellAuth } from '@/components/app-shell-auth';
import { VendorDetailShellDb } from '@/components/vendor-detail-shell-db';
import { getDbVendorById, listDbVendorPaymentRecordsByVendorId, listDbVendorProjectRecordsByVendorId, listDbVendorTrades } from '@/lib/db/vendor-directory-adapter';

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const pageStart = performance.now();
  const { id } = await params;

  const vendorStart = performance.now();
  const vendor = await getDbVendorById(id);
  const vendorMs = performance.now() - vendorStart;

  if (!vendor) {
    notFound();
  }

  const paymentStartedAt = performance.now();
  const [paymentRecords, tradeOptions] = await Promise.all([
    listDbVendorPaymentRecordsByVendorId(id),
    listDbVendorTrades(),
  ]);
  const paymentAndTradeMs = performance.now() - paymentStartedAt;

  const recordsStartedAt = performance.now();
  const initialOpenRecords = await listDbVendorProjectRecordsByVendorId(id, {
    paymentRecords,
    paymentScope: 'open',
    includeDetails: false,
  });
  const recordsMs = performance.now() - recordsStartedAt;
  const dataMs = paymentAndTradeMs + recordsMs;

  const payloadBytes = Buffer.byteLength(JSON.stringify({
    vendor,
    initialOpenRecords,
    paymentRecords,
    tradeOptions,
  }), 'utf8');

  console.log('[vendor-detail-page]', JSON.stringify({
    vendorId: id,
    vendorMs: Number(vendorMs.toFixed(1)),
    paymentAndTradeMs: Number(paymentAndTradeMs.toFixed(1)),
    recordsMs: Number(recordsMs.toFixed(1)),
    dataMs: Number(dataMs.toFixed(1)),
    recordCount: initialOpenRecords.length,
    paymentCount: paymentRecords.length,
    tradeOptionCount: tradeOptions.length,
    payloadBytes,
    totalMs: Number((performance.now() - pageStart).toFixed(1)),
  }));

  return (
    <AppShellAuth activePath="/vendors">
      <VendorDetailShellDb vendor={vendor} initialOpenRecords={initialOpenRecords} tradeOptions={tradeOptions} />
    </AppShellAuth>
  );
}
