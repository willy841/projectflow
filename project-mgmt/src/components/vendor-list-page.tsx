"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getVendorOutstandingTotal, formatCurrency } from "@/components/vendor-data";
import { VendorQuickCreateDialog } from "@/components/vendor-quick-create-dialog";
import { TRADE_OPTIONS, useVendorStore } from "@/components/vendor-store";

const DELETE_CONFIRM_TITLE = "確認刪除這個廠商？";
const DELETE_CONFIRM_DESCRIPTION = "這是刪除動作，刪除後會從目前的前端 vendor 清單移除。請再次確認是否要刪除這個廠商。";

export function VendorListPage() {
  const router = useRouter();
  const { vendors, deleteVendor } = useVendorStore();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createdVendorName, setCreatedVendorName] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTrade, setActiveTrade] = useState<string | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);

  const vendorCards = useMemo(() => vendors.map((vendor) => ({
    ...vendor,
    outstandingTotal: getVendorOutstandingTotal(vendor.id),
  })), [vendors]);

  const filteredVendorCards = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return vendorCards.filter((vendor) => {
      const matchesSearch = !keyword || [vendor.name, vendor.category, ...(vendor.tradeLabels ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
      const matchesTrade = !activeTrade || (vendor.tradeLabels ?? []).includes(activeTrade) || vendor.category === activeTrade;
      return matchesSearch && matchesTrade;
    });
  }, [activeTrade, searchKeyword, vendorCards]);

  const totalOutstanding = filteredVendorCards.reduce((sum, vendor) => sum + vendor.outstandingTotal, 0);
  const deletingVendor = deletingVendorId ? vendors.find((vendor) => vendor.id === deletingVendorId) : null;

  function handleDeleteVendor() {
    if (!deletingVendorId) return;
    deleteVendor(deletingVendorId);
    setDeletingVendorId(null);
  }

  return (
    <>
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
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
              <p className="font-semibold">目前篩選結果未付款總額</p>
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

        <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="block min-w-0 flex-1">
              <span className="mb-2 block text-xs font-semibold tracking-wide text-slate-500">搜尋廠商</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-slate-400">
                <span className="text-sm text-slate-400">⌕</span>
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="搜尋廠商名稱、工種或分類"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 xl:justify-end">
              <span>共 {filteredVendorCards.length} 間</span>
              {(searchKeyword || activeTrade) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setActiveTrade(null);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  清除篩選
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-slate-500">工種篩選</span>
              <span className="text-xs text-slate-400">單選</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTrade(null)}
                className={`rounded-full px-3 py-2 text-xs font-medium ring-1 transition ${activeTrade === null ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
              >
                全部工種
              </button>
              {TRADE_OPTIONS.map((trade) => {
                const active = activeTrade === trade;
                return (
                  <button
                    key={trade}
                    type="button"
                    onClick={() => setActiveTrade(active ? null : trade)}
                    className={`rounded-full px-3 py-2 text-xs font-medium ring-1 transition ${active ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                  >
                    {trade}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {filteredVendorCards.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredVendorCards.map((vendor) => (
            <div
              key={vendor.id}
              className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">{vendor.category}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{vendor.name}</h3>
                  {(vendor.tradeLabels?.length ?? 0) > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vendor.tradeLabels?.map((trade) => (
                        <span
                          key={trade}
                          className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                        >
                          {trade}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  廠商詳情
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4">
                <p className="text-sm text-amber-800">未付款總額</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(vendor.outstandingTotal)}</p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  查看廠商詳情
                </Link>
                <button
                  type="button"
                  onClick={() => setDeletingVendorId(vendor.id)}
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                >
                  刪除廠商
                </button>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">目前沒有符合條件的廠商</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">可調整搜尋關鍵字或清除工種篩選後再查看。</p>
        </section>
      )}

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

      {deletingVendor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
              刪除確認
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{DELETE_CONFIRM_TITLE}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{DELETE_CONFIRM_DESCRIPTION}</p>
            <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-slate-700">
              目前準備刪除：<span className="font-semibold text-slate-900">{deletingVendor.name}</span>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingVendorId(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteVendor}
                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
              >
                確認刪除廠商
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
