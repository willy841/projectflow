"use client";

import Link from "next/link";
import { VendorPackageDetail } from "@/components/vendor-package-detail";
import { getVendorPackageById } from "@/components/vendor-data";
import { getStoredVendorPackageById } from "@/components/vendor-package-store";

export function VendorPackageDetailRoute({ id }: { id: string }) {
  const vendorPackage = getStoredVendorPackageById(id) ?? getVendorPackageById(id);

  if (!vendorPackage) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">找不到這張發包單</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">這張發包單目前不在前端發包主線資料中，請回專案頁確認是否已正式送出。</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/projects" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            返回專案列表
          </Link>
          <Link href="/vendor-packages" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            返回發包單列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href={`/projects/${vendorPackage.projectId}`} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
          ← 返回專案詳細頁
        </Link>
      </div>
      <VendorPackageDetail vendorPackage={vendorPackage} />
    </>
  );
}
