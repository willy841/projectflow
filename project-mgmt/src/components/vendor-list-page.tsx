"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getVendorOutstandingTotal, formatCurrency } from "@/components/vendor-data";
import { useVendorStore } from "@/components/vendor-store";

const DELETE_CONFIRM_TITLE = "確認刪除這個廠商？";
const DELETE_CONFIRM_DESCRIPTION = "這是刪除動作，刪除後會從目前的前端 vendor 清單移除。請再次確認是否要刪除這個廠商。";

export function VendorListPage() {
  const router = useRouter();
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
    outstandingTotal: getVendorOutstandingTotal(vendor.id),
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
    const result = createVendor({
      name: newVendorName,
      tradeLabel: newVendorTrade,
    });

    if (!newVendorName.trim()) {
      setCreateVendorError("請先輸入廠商名稱。\n");
      return;
    }

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
    router.push(`/vendors/${encodeURIComponent(result.vendor.id)}`);
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
                className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                新增廠商
              </button>
            </div>
          </div>

          <div className="sm:min-w-[260px] xl:self-stretch">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 xl:h-full xl:min-h-[104px] xl:flex xl:flex-col xl:justify-center">
              <p className="font-semibold">目前篩選結果未付款總額</p>
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
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  清除篩選
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.85fr)] xl:items-start">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-2">
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnpaidOnly((current) => !current)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${showUnpaidOnly ? "bg-amber-500 text-white ring-amber-500" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                >
                  未付款
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">單選</span>
              </div>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTrade(null)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${activeTrade === null ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                >
                  全部工種
                </button>
                {tradeOptions.map((trade) => {
                  const active = activeTrade === trade;
                  return (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => setActiveTrade(active ? null : trade)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${active ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                    >
                      {trade}
                    </button>
                  );
                })}
              </div>
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
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{vendor.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {vendor.tradeLabel || vendor.category || "待補充"}
                    </span>
                  </div>
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
                  查看
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
        </section>
      )}

      {showCreateVendorModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mt-4 text-xl font-semibold text-slate-900">建立新廠商</h3>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">廠商名稱</span>
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(event) => setNewVendorName(event.target.value)}
                  placeholder="輸入廠商名稱"
                  className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">工種（可選）</span>
                <input
                  type="text"
                  list="vendor-trade-options"
                  value={newVendorTrade}
                  onChange={(event) => setNewVendorTrade(event.target.value)}
                  placeholder="例如：輸出 / 木作 / 施工"
                  className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                />
                <datalist id="vendor-trade-options">
                  {tradeOptions.map((trade) => (
                    <option key={trade} value={trade} />
                  ))}
                </datalist>
              </label>

              {createVendorError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {createVendorError}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateVendorModal(false);
                  setCreateVendorError(null);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateVendor}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                建立廠商
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingVendor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{DELETE_CONFIRM_TITLE}</h3>
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
