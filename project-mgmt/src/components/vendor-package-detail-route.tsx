import Link from "next/link";
import { getProjectRouteId } from "@/components/project-data";
import { VendorPackageDetail } from "@/components/vendor-package-detail";
import { WorkspaceEmptyState } from "@/components/workspace-ui";
import { getDbVendorPackageById } from "@/lib/db/vendor-package-adapter";

export async function VendorPackageDetailRoute({ id }: { id: string }) {
  const vendorPackage = await getDbVendorPackageById(id);

  if (!vendorPackage) {
    return (
      <WorkspaceEmptyState
        title="找不到這筆文件"
        description="這筆 package 可能尚未建立，或已不在目前可查詢範圍。"
        actions={
          <>
            <Link href="/projects" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">返回專案列表</Link>
            <Link href="/vendor-packages" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">返回文件列表</Link>
          </>
        }
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href={`/projects/${getProjectRouteId({ id: vendorPackage.projectId, name: vendorPackage.projectName })}`} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">← 返回專案詳細頁</Link>
      </div>
      <VendorPackageDetail vendorPackage={vendorPackage} />
    </>
  );
}
