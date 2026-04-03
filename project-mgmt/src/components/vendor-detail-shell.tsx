"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatCurrency,
  getVendorPaymentStatusClass,
  getVendorRecordsByVendorId,
  type VendorProjectRecord,
} from "@/components/vendor-data";
import { TRADE_OPTIONS, useVendorStore } from "@/components/vendor-store";

type Props = {
  vendorId: string;
};

export function VendorDetailShell({ vendorId }: Props) {
  const { getVendorById, updateVendor, isReady } = useVendorStore();
  const vendor = getVendorById(vendorId);
  const [records, setRecords] = useState<VendorProjectRecord[]>(() => getVendorRecordsByVendorId(vendorId));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const unpaidRecords = useMemo(() => records.filter((record) => record.paymentStatus === "未付款"), [records]);
  const selectedRecords = unpaidRecords.filter((record) => selectedIds.includes(record.id));
  const selectedCount = selectedRecords.length;
  const selectedTotal = selectedRecords.reduce((sum, record) => sum + record.adjustedCost, 0);

  if (!vendor) {
    if (!isReady) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
          廠商資料載入中，正在同步前端 local state…
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
        找不到此廠商。若是剛建立，請先回廠商列表確認前端 local state 是否已建立成功。
      </div>
    );
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function markSelectedAsPaid() {
    if (!selectedIds.length) return;
    setRecords((current) =>
      current.map((record) => (selectedIds.includes(record.id) ? { ...record, paymentStatus: "已付款" } : record)),
    );
    setSelectedIds([]);
  }

  function toggleTrade(trade: string) {
    if (!vendor) return;
    const currentTrades = vendor.tradeLabels ?? [];
    const nextTrades = currentTrades.includes(trade)
      ? currentTrades.filter((item) => item !== trade)
      : [...currentTrades, trade];
    updateVendor(vendor.id, {
      tradeLabels: nextTrades,
      category: nextTrades[0] || vendor.category || "待補充",
    });
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Vendor Detail</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{vendor.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{vendor.note || "此廠商尚未補齊正式說明。"}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/vendors" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
              返回廠商列表
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">A. 廠商資料</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">基本資料與匯款資訊</h3>
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              Mock 資料
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["合作類型", vendor.category || "待補充"],
              ["聯絡人", vendor.contactName || "-"],
              ["電話", vendor.phone || "-"],
              ["Email", vendor.email || "-"],
              ["LINE", vendor.lineId || "-"],
              ["地址", vendor.address || "-"],
              ["銀行", vendor.bankName ? `${vendor.bankName} (${vendor.bankCode})` : "-"],
              ["戶名", vendor.accountName || "-"],
              ["帳號", vendor.accountNumber || "-"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm ring-1 ring-sky-100">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-sky-700">B. 工種維護區</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">正式補 / 編輯工種</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">符合本輪 MVP 規格：quick create 可先略過；進到 vendor detail 後，再正式補齊或編輯工種。</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-sky-200">
              目前已選 {vendor.tradeLabels?.length ?? 0} 個工種
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {TRADE_OPTIONS.map((trade) => {
              const active = vendor.tradeLabels?.includes(trade) ?? false;
              return (
                <button
                  key={trade}
                  type="button"
                  onClick={() => toggleTrade(trade)}
                  className={`rounded-full px-3 py-2 text-xs font-medium ring-1 transition ${active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                >
                  {trade}
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <article className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm ring-1 ring-amber-100">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-700">C. 未付款專案區</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">專案 × 廠商 付款管理</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">每列代表一個「專案 × 廠商」付款單位，第一版未付款金額直接等於該專案對該廠商的調整後成本總額。</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-amber-200">
            <p>已勾選 {selectedCount} 筆</p>
            <p className="mt-1 font-semibold text-slate-900">勾選總額 {formatCurrency(selectedTotal)}</p>
          </div>
        </div>

        {unpaidRecords.length ? (
          <div className="space-y-3">
            {unpaidRecords.map((record) => (
              <label key={record.id} className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white p-4 ring-1 ring-amber-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(record.id)}
                    onChange={() => toggleSelect(record.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{record.projectName}</p>
                    <p className="mt-1 text-sm text-slate-500">{record.procurementSummary}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">未付款金額</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{record.adjustedCostLabel}</p>
                </div>
              </label>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-white">
              <div>
                <p className="text-sm text-slate-300">即時計算</p>
                <p className="mt-1 font-semibold">已勾選 {selectedCount} 個專案 × 廠商，合計 {formatCurrency(selectedTotal)}</p>
              </div>
              <button
                type="button"
                onClick={markSelectedAsPaid}
                disabled={!selectedCount}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                標記為已付款
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-white px-5 py-6 text-sm text-slate-500">目前沒有未付款專案。</div>
        )}
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500">D. 往來 / 歷史紀錄區</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">所有有往來的專案紀錄</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">包含執行中與已結案專案。此區不可修正，只提供付款狀態、調整後成本總額、發包摘要與可展開的成本 / 發包明細。</p>
        </div>

        <div className="space-y-4">
          {records.map((record) => {
            const isExpanded = expandedIds.includes(record.id);
            return (
              <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-semibold text-slate-900">{record.projectName}</h4>
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{record.projectStatus}</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(record.paymentStatus)}`}>
                        {record.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{record.procurementSummary}</p>
                  </div>
                  <div className="flex flex-col gap-3 xl:items-end">
                    <div className="text-left xl:text-right">
                      <p className="text-sm text-slate-500">調整後成本總額</p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{record.adjustedCostLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(record.id)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                    >
                      {isExpanded ? "收合明細" : "展開看成本 / 發包明細"}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-sm font-semibold text-slate-900">成本明細</p>
                      <div className="mt-3 space-y-3">
                        {record.costBreakdown.map((item) => (
                          <div key={`${record.id}-${item.label}`} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-medium text-slate-900">{item.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-sm font-semibold text-slate-900">發包內容明細</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {record.procurementDetails.map((item) => (
                          <li key={`${record.id}-${item}`} className="rounded-2xl bg-slate-50 px-3 py-2">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
