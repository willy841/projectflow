"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getVendorOutstandingTotal, formatCurrency } from "@/components/vendor-data";
import { VendorQuickCreateDialog } from "@/components/vendor-quick-create-dialog";
import { useVendorStore } from "@/components/vendor-store";

const DELETE_CONFIRM_TITLE = "確認刪除這個廠商？";
const DELETE_CONFIRM_DESCRIPTION = "這是刪除動作，刪除後會從目前的前端 vendor 清單移除。請再次確認是否要刪除這個廠商。";

export function VendorListPage() {
  const router = useRouter();
  const { vendors, trades, deleteVendor, createTrade, deleteTrade } = useVendorStore();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createdVendorName, setCreatedVendorName] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTrade, setActiveTrade] = useState<string | null>(null);
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);
  const [newTradeName, setNewTradeName] = useState("");
  const [tradeFeedback, setTradeFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const tradeUsageMap = useMemo(
    () =>
      new Map(
        trades.map((trade) => [
          trade,
          vendors.filter((vendor) => (vendor.tradeLabels ?? []).includes(trade)).length,
        ]),
      ),
    [trades, vendors],
  );

  const vendorCards = useMemo(
    () =>
      vendors.map((vendor) => ({
        ...vendor,
        outstandingTotal: getVendorOutstandingTotal(vendor.id),
      })),
    [vendors],
  );

  const filteredVendorCards = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return vendorCards.filter((vendor) => {
      const matchesSearch =
        !keyword ||
        [vendor.name, vendor.category, ...(vendor.tradeLabels ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesTrade = !activeTrade || (vendor.tradeLabels ?? []).includes(activeTrade);
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

  function handleCreateTrade() {
    const result = createTrade(newTradeName);
    if (!result.ok) {
      setTradeFeedback({
        type: "error",
        message: result.reason === "empty" ? "工種名稱不可空白。" : `工種「${result.trade}」已存在，禁止重複新增。`,
      });
      return;
    }

    setNewTradeName("");
    setTradeFeedback({ type: "success", message: `已新增工種「${result.trade}」。` });
  }

  function handleDeleteTrade(trade: string) {
    const result = deleteTrade(trade);
    if (!result.ok) {
      setTradeFeedback({
        type: "error",
        message: `工種「${trade}」已被 ${result.vendorNames.join("、")} 使用中，禁止刪除。`,
      });
      return;
    }

    if (activeTrade === trade) {
      setActiveTrade(null);
    }
    setTradeFeedback({ type: "success", message: `已刪除工種「${trade}」。` });
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
                onClick={() => setQuickCreateOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                + 新增廠商
              </button>
            </div>
            {createdVendorName ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                已建立廠商「{createdVendorName}」，正帶你前往廠商詳情。
              </div>
            ) : null}
          </div>

          <div className="sm:min-w-[260px] xl:self-stretch">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 xl:flex xl:h-full xl:min-h-[104px] xl:flex-col xl:justify-center">
              <p className="font-semibold">目前篩選結果未付款總額</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.9fr)] xl:items-start">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-3.5">
            <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
              <label className="block min-w-0 flex-1 xl:min-w-[280px]">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">搜尋廠商</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-slate-400">
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
                {searchKeyword || activeTrade || showUnpaidOnly ? (
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
                  <span className="text-[11px] font-semibold tracking-wide text-slate-500">狀態篩選</span>
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
                  <span className="text-[11px] font-semibold tracking-wide text-slate-500">工種篩選</span>
                  <span className="text-xs text-slate-400">單選，共用工種來源</span>
                </div>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTrade(null)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${activeTrade === null ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                  >
                    全部工種
                  </button>
                  {trades.map((trade) => {
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

          <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500">工種管理</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">共用工種來源</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">只在廠商資料模組管理。新增會自動 trim；空白與重複名稱會被擋下；已被廠商使用中的工種不可刪除。</p>
              </div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {trades.length} 個工種
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">新增工種</span>
                <input
                  value={newTradeName}
                  onChange={(event) => {
                    setNewTradeName(event.target.value);
                    if (tradeFeedback) setTradeFeedback(null);
                  }}
                  placeholder="例如：鐵件製作"
                  className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
              <button
                type="button"
                onClick={handleCreateTrade}
                className="mt-[22px] inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                新增
              </button>
            </div>

            {tradeFeedback ? (
              <div
                className={`mt-3 rounded-2xl px-4 py-3 text-sm ${tradeFeedback.type === "error" ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}
              >
                {tradeFeedback.message}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {trades.map((trade) => {
                const usageCount = tradeUsageMap.get(trade) ?? 0;
                const isInUse = usageCount > 0;
                return (
                  <div
                    key={trade}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                  >
                    <span className="font-medium text-slate-900">{trade}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 ring-1 ${isInUse ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-white text-slate-500 ring-slate-200"}`}>
                      {usageCount} 間使用中
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTrade(trade)}
                      className={`inline-flex items-center justify-center rounded-full px-2 py-1 font-semibold transition ${isInUse ? "text-slate-400 hover:text-slate-500" : "text-rose-700 hover:bg-rose-50"}`}
                      title={isInUse ? "已有廠商使用中的工種不可刪除" : `刪除工種 ${trade}`}
                    >
                      刪除
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
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
        description="廠商建立流程會直接使用目前這份共用工種來源；若需要新增或刪除工種，請回到上方工種管理處處理。"
        confirmLabel="建立並查看廠商"
        allowTradeSelection
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
