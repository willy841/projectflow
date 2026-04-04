import { AppShell } from "@/components/app-shell";
import { VendorPackageDetailRoute } from "@/components/vendor-package-detail-route";

export default async function VendorPackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell activePath="/projects">
      <VendorPackageDetailRoute id={id} />
    </AppShell>
  );
}
