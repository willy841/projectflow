import Link from "next/link";
import { getProjectRouteId } from "@/components/project-data";
import { VendorPackageDetail } from "@/components/vendor-package-detail";
import { getDbVendorPackageById } from "@/lib/db/vendor-package-adapter";

export async function VendorPackageDetailRoute({ id }: { id: string }) {
  const vendorPackage = await getDbVendorPackageById(id);

  if (!vendorPackage) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">找不到這筆 Package</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">這筆 package 目前沒有出現在正式 vendor package source 中，請返回 vendor 任務重新確認。</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/projects" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">返回專案列表</Link>
          <Link href="/vendor-packages" className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">查看所有 Package</Link>
        </div>
      </div>
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
