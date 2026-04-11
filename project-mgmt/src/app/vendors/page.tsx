import { AppShell } from '@/components/app-shell';
import { VendorListPageDb } from '@/components/vendor-list-page-db';
import { listDbVendors } from '@/lib/db/vendor-directory-adapter';

export default async function VendorsPage() {
  const vendors = await listDbVendors();

  return (
    <AppShell activePath="/vendors">
      <VendorListPageDb vendors={vendors} />
    </AppShell>
  );
}
