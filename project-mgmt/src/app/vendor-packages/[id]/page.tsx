import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VendorPackageDetail } from "@/components/vendor-package-detail";
import { getVendorPackageById } from "@/components/vendor-data";

export default async function VendorPackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendorPackage = getVendorPackageById(id);

  if (!vendorPackage) {
    notFound();
  }

  return (
    <AppShell activePath="/projects">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/projects/${vendorPackage.projectId}`} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
          ← 返回專案詳細頁
        </Link>
      </div>
      <VendorPackageDetail vendorPackage={vendorPackage} />
    </AppShell>
  );
}
