import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { VendorDetailShellDb } from '@/components/vendor-detail-shell-db';
import { getDbVendorById, listDbVendorPaymentRecordsByVendorId, listDbVendorProjectRecordsByVendorId, listDbVendorTrades } from '@/lib/db/vendor-directory-adapter';

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getDbVendorById(id);

  if (!vendor) {
    notFound();
  }

  const [records, paymentRecords, tradeOptions] = await Promise.all([
    listDbVendorProjectRecordsByVendorId(id),
    listDbVendorPaymentRecordsByVendorId(id),
    listDbVendorTrades(),
  ]);

  return (
    <AppShell activePath="/vendors">
      <VendorDetailShellDb vendor={vendor} records={records} paymentRecords={paymentRecords} tradeOptions={tradeOptions} />
    </AppShell>
  );
}
