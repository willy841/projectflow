import { AppShell } from "@/components/app-shell";
import { VendorListPage } from "@/components/vendor-list-page";

export default function VendorsPage() {
  return (
    <AppShell activePath="/vendors">
      <VendorListPage />
    </AppShell>
  );
}
