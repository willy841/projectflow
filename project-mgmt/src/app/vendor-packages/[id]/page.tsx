import { AppShellAuth } from "@/components/app-shell-auth";
import { VendorPackageDetailRoute } from "@/components/vendor-package-detail-route";

export default async function VendorPackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShellAuth activePath="/vendor-packages">
      <VendorPackageDetailRoute id={id} />
    </AppShellAuth>
  );
}
