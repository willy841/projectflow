import { AppShell } from "@/components/app-shell";
import { VendorDetailShell } from "@/components/vendor-detail-shell";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell activePath="/vendors">
      <VendorDetailShell vendorId={id} />
    </AppShell>
  );
}
