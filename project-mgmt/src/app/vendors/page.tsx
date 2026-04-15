import { AppShell } from '@/components/app-shell';
import { VendorListPageDb } from '@/components/vendor-list-page-db';
import { listDbVendorTrades, listDbVendors } from '@/lib/db/vendor-directory-adapter';

export default async function VendorsPage() {
  const [vendors, tradeOptions] = await Promise.all([listDbVendors(), listDbVendorTrades()]);

  return (
    <AppShell activePath="/vendors">
      <VendorListPageDb vendors={vendors} tradeOptions={tradeOptions} />
    </AppShell>
  );
}
