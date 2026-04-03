"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getVendorOutstandingTotal, formatCurrency } from "@/components/vendor-data";
import { VendorQuickCreateDialog } from "@/components/vendor-quick-create-dialog";
import { useVendorStore } from "@/components/vendor-store";

export function VendorListPage() {
  const router = useRouter();
  const { vendors } = useVendorStore();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createdVendorName, setCreatedVendorName] = useState("");

  const vendorCards = useMemo(() => vendors.map((vendor) => ({
    ...vendor,
    outstandingTotal: getVendorOutstandingTotal(vendor.id),
  })), [vendors]);

  const totalOutstanding = vendorCards.reduce((sum, vendor) => sum + vendor.outstandingTotal, 0);

  return (
    <>
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Vendor Directory</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">廠商資料</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              第一輪先做可驗收 mock / front-end MVP：列表頁只保留廠商名稱與未付款總額，點進去再看廠商資料、未付款專案與往來歷史。
            </p>
            {createdVendorName ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                已建立廠商「{createdVendorName}」，正帶你前往廠商詳情。
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              <p className="font-semibold">全部未付款總額</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalOutstanding)}</p>
            </div>
            <button
              type="button"
              onClick={() => setQuickCreateOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              + 新增廠商
            </button>
            <p className="text-xs text-slate-500">可直接 quick create；建立成功後會即時更新列表並進入該廠商詳情。</p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vendorCards.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.id}`}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{vendor.category}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{vendor.name}</h3>
              </div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                廠商詳情
              </span>
            </div>
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4">
              <p className="text-sm text-amber-800">未付款總額</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(vendor.outstandingTotal)}</p>
            </div>
          </Link>
        ))}
      </section>

      <VendorQuickCreateDialog
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        title="快速建立廠商"
        description="沿用既有 quick create 規格：必填只有廠商名稱；工種可多選、非必填；名稱完全相同時禁止重複建立。"
        confirmLabel="建立並查看廠商"
        onCreated={(vendor) => {
          setCreatedVendorName(vendor.name);
          router.push(`/vendors/${vendor.id}`);
        }}
      />
    </>
  );
}
