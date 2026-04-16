import { notFound } from 'next/navigation';
import { AppShellAuth } from '@/components/app-shell-auth';
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
    <AppShellAuth activePath="/vendors">
      <VendorDetailShellDb vendor={vendor} records={records} paymentRecords={paymentRecords} tradeOptions={tradeOptions} />
    </AppShellAuth>
  );
}
