"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getLegacyVendorOutstandingTotal, formatCurrency } from "@/components/vendor-data";
import { useVendorStore } from "@/components/vendor-store";

export const vendorListPageLegacyBoundary = {
  mode: "legacy-fixture-page",
  routeStatus: "not-used-by-formal-vendors-route",
  outstandingTotalSource: "legacy-vendor-data-fixture",
} as const;

const DELETE_CONFIRM_TITLE = "確認刪除這個廠商？";
const DELETE_CONFIRM_DESCRIPTION = "這是刪除動作，刪除後會從目前的前端 vendor 清單移除。請再次確認是否要刪除這個廠商。";

/**
 * Legacy-only vendor list shell.
 * Formal /vendors route uses VendorListPageDb.
 */
export function LegacyVendorListPage() {
  const { vendors, deleteVendor, tradeOptions, createVendor } = useVendorStore();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTrade, setActiveTrade] = useState<string | null>(null);
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);
  const [showCreateVendorModal, setShowCreateVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorTrade, setNewVendorTrade] = useState("");
  const [createVendorError, setCreateVendorError] = useState<string | null>(null);

  const vendorCards = useMemo(() => vendors.map((vendor) => ({
    ...vendor,
    outstandingTotal: getLegacyVendorOutstandingTotal(vendor.id),
  })), [vendors]);

  const filteredVendorCards = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return vendorCards.filter((vendor) => {
      const matchesSearch = !keyword || [vendor.name, vendor.category, vendor.tradeLabel || ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
      const matchesTrade = !activeTrade || (vendor.tradeLabel || vendor.category) === activeTrade;
      const matchesUnpaid = !showUnpaidOnly || vendor.outstandingTotal > 0;
      return matchesSearch && matchesTrade && matchesUnpaid;
    });
  }, [activeTrade, searchKeyword, showUnpaidOnly, vendorCards]);

  const totalOutstanding = filteredVendorCards.reduce((sum, vendor) => sum + vendor.outstandingTotal, 0);
  const deletingVendor = deletingVendorId ? vendors.find((vendor) => vendor.id === deletingVendorId) : null;

  function handleDeleteVendor() {
    if (!deletingVendorId) return;
    deleteVendor(deletingVendorId);
    setDeletingVendorId(null);
  }

  function handleCreateVendor() {
    if (!newVendorName.trim()) {
      setCreateVendorError("請先輸入廠商名稱。\n");
      return;
    }

    const result = createVendor({
      name: newVendorName,
      tradeLabel: newVendorTrade,
    });

    if (!result.ok) {
      setCreateVendorError(`廠商「${result.vendor.name}」已存在，不能重複建立。`);
      return;
    }

    setSearchKeyword("");
    setActiveTrade(null);
    setShowUnpaidOnly(false);
    setNewVendorName("");
    setNewVendorTrade("");
    setCreateVendorError(null);
    setShowCreateVendorModal(false);
  }

  return (
    <>
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 xl:pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">廠商資料</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateVendorModal(true);
                  setCreateVendorError(null);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                新增廠商
              </button>
            </div>
          </div>

          <div className="sm:min-w-[260px] xl:self-stretch">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 xl:h-full xl:min-h-[104px] xl:flex xl:flex-col xl:justify-center">
              <p className="font-semibold">未付款總額</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
            <label className="block min-w-0 flex-1 xl:min-w-[280px]">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-slate-400">
                <span className="text-sm text-slate-400">⌕</span>
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="搜尋廠商名稱或工種"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 xl:justify-end">
              <span>共 {filteredVendorCards.length} 間</span>
              {(searchKeyword || activeTrade || showUnpaidOnly) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setActiveTrade(null);
                    setShowUnpaidOnly(false);
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                >
                  清除篩選
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTrade(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${!activeTrade ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
            >
              全部工種
            </button>
            {tradeOptions.map((trade) => (
              <button
                key={trade}
                type="button"
                onClick={() => setActiveTrade(trade)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeTrade === trade ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
              >
                {trade}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowUnpaidOnly((current) => !current)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${showUnpaidOnly ? "bg-amber-100 text-amber-900 border border-amber-200" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
            >
              只看未付款
            </button>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredVendorCards.map((vendor) => (
          <article key={vendor.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-slate-900">{vendor.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{vendor.tradeLabel || vendor.category}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{vendor.contactName || "尚未填寫聯絡人"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  查看
                </Link>
                <button
                  type="button"
                  onClick={() => setDeletingVendorId(vendor.id)}
                  className="rounded-2xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                >
                  刪除
                </button>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">未付款金額</dt>
                <dd className="font-semibold text-slate-900">{formatCurrency(vendor.outstandingTotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">電話</dt>
                <dd className="truncate">{vendor.phone || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Email</dt>
                <dd className="truncate">{vendor.email || "—"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      {deletingVendor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">{DELETE_CONFIRM_TITLE}</h3>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{DELETE_CONFIRM_DESCRIPTION}</p>
            <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">將刪除：{deletingVendor.name}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingVendorId(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900">取消</button>
              <button type="button" onClick={handleDeleteVendor} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700">確認刪除</button>
            </div>
          </div>
        </div>
      ) : null}

      {showCreateVendorModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">新增廠商</h3>
                <p className="mt-1 text-sm text-slate-500">建立一筆新的 vendor profile，可先填名稱與工種，其他聯絡資訊之後補。</p>
              </div>
              <button type="button" onClick={() => setShowCreateVendorModal(false)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700">關閉</button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-600">
                廠商名稱
                <input type="text" value={newVendorName} onChange={(event) => setNewVendorName(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400" placeholder="例如：新合作印刷廠" />
              </label>

              <label className="grid gap-2 text-sm text-slate-600">
                工種
                <input type="text" value={newVendorTrade} onChange={(event) => setNewVendorTrade(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400" placeholder="例如：平面輸出 / 木作 / 音響" />
              </label>

              {createVendorError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{createVendorError}</p> : null}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreateVendorModal(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900">取消</button>
              <button type="button" onClick={handleCreateVendor} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">建立廠商</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
