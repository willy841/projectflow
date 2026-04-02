"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  formatCurrency,
  getAdjustedCostTotal,
  getGrossProfit,
  getOriginalCostTotal,
  getQuotationTotal,
  QuoteCostProject,
  sampleQuoteImports,
  sampleQuoteLineItemsByProject,
  UNSPECIFIED_VENDOR_ID,
  UNSPECIFIED_VENDOR_NAME,
  vendorDirectory,
} from "@/components/quote-cost-data";

type Props = {
  project: QuoteCostProject;
};

type EditableProjectState = QuoteCostProject;

export function QuoteCostDetailClient({ project }: Props) {
  const [state, setState] = useState<EditableProjectState>(project);
  const [quoteImportIndex, setQuoteImportIndex] = useState(0);
  const quoteImportOptions = sampleQuoteImports[project.id] ?? [project.quotationImport].filter(Boolean);
  const quoteLineItemOptions = sampleQuoteLineItemsByProject[project.id] ?? [project.quotationItems];

  const quotationTotal = useMemo(() => getQuotationTotal(state.quotationItems), [state.quotationItems]);
  const adjustedCostTotal = useMemo(() => getAdjustedCostTotal(state.costItems), [state.costItems]);
  const originalCostTotal = useMemo(() => getOriginalCostTotal(state.costItems), [state.costItems]);
  const grossProfit = useMemo(() => getGrossProfit(quotationTotal, adjustedCostTotal), [quotationTotal, adjustedCostTotal]);

  const vendorGroups = useMemo(() => {
    const map = new Map<string, { key: string; name: string; items: EditableProjectState["costItems"] }>();
    state.costItems
      .filter((item) => !item.isManual)
      .forEach((item) => {
        const key = item.vendorId ?? UNSPECIFIED_VENDOR_ID;
        const name = item.vendorName ?? UNSPECIFIED_VENDOR_NAME;
        if (!map.has(key)) map.set(key, { key, name, items: [] });
        map.get(key)?.items.push(item);
      });
    return Array.from(map.values());
  }, [state.costItems]);

  const manualItems = state.costItems.filter((item) => item.isManual);

  function mutateCosts(mutator: (prev: EditableProjectState) => EditableProjectState) {
    setState((prev) => {
      const next = mutator(prev);
      if (prev.reconciliationStatus === "已完成") {
        return {
          ...next,
          reconciliationStatus: "待確認",
          closeStatus: next.closeStatus === "已結案" ? "未結案" : next.closeStatus,
        };
      }
      return next;
    });
  }

  function handleImportQuote(index: number) {
    const quotationImport = quoteImportOptions[index] ?? null;
    const quotationItems = quoteLineItemOptions[index] ?? quoteLineItemOptions[0] ?? state.quotationItems;
    setQuoteImportIndex(index);
    setState((prev) => ({
      ...prev,
      quotationImported: true,
      quotationImport,
      quotationItems,
      closeStatus: prev.closeStatus === "已結案" ? "未結案" : prev.closeStatus,
      reconciliationStatus: prev.reconciliationStatus === "已完成" ? "待確認" : prev.reconciliationStatus,
    }));
  }

  function handleAdjustedAmountChange(itemId: string, value: string) {
    mutateCosts((prev) => ({
      ...prev,
      costItems: prev.costItems.map((item) => (item.id === itemId ? { ...item, adjustedAmount: Number(value) || 0 } : item)),
    }));
  }

  function handleIncludeToggle(itemId: string, included: boolean) {
    mutateCosts((prev) => ({
      ...prev,
      costItems: prev.costItems.map((item) => (item.id === itemId ? { ...item, includedInCost: included } : item)),
    }));
  }

  function handleVendorChange(itemId: string, vendorId: string) {
    const vendor = vendorDirectory.find((entry) => entry.id === vendorId);
    mutateCosts((prev) => ({
      ...prev,
      costItems: prev.costItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              vendorId: vendorId === UNSPECIFIED_VENDOR_ID ? null : vendor?.id ?? null,
              vendorName: vendorId === UNSPECIFIED_VENDOR_ID ? null : vendor?.name ?? null,
            }
          : item,
      ),
    }));
  }

  function handleAddManualCost() {
    mutateCosts((prev) => ({
      ...prev,
      costItems: [
        ...prev.costItems,
        {
          id: `manual-${Date.now()}`,
          itemName: `人工成本 ${manualItems.length + 1}`,
          sourceType: "人工",
          sourceRef: "人工成本 / 手動新增",
          vendorId: null,
          vendorName: null,
          originalAmount: 0,
          adjustedAmount: 0,
          includedInCost: true,
          isManual: true,
        },
      ],
    }));
  }

  function handleManualItemChange(itemId: string, field: "itemName" | "sourceRef" | "adjustedAmount", value: string) {
    mutateCosts((prev) => ({
      ...prev,
      costItems: prev.costItems.map((item) => {
        if (item.id !== itemId) return item;
        if (field === "adjustedAmount") {
          const amount = Number(value) || 0;
          return { ...item, adjustedAmount: amount, originalAmount: item.originalAmount === 0 ? amount : item.originalAmount };
        }
        return { ...item, [field]: value };
      }),
    }));
  }

  function handleConfirmReconciliation() {
    if (!state.quotationImported || state.costItems.length === 0) return;
    setState((prev) => ({ ...prev, reconciliationStatus: "已完成" }));
  }

  function handleCloseProject() {
    if (!state.quotationImported || state.costItems.length === 0 || state.reconciliationStatus !== "已完成") return;
    setState((prev) => ({ ...prev, projectStatus: "已結案", closeStatus: "已結案" }));
  }

  return (
    <AppShell activePath="/quote-costs">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Quote Cost Detail</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{state.projectName}</h2>
            <p className="mt-2 text-sm text-slate-500">{state.projectCode} ・ {state.clientName} ・ {state.eventDate}</p>
          </div>
          <Link href="/quote-costs" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
            返回列表
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="對外報價總額" value={formatCurrency(quotationTotal)} />
        <SummaryCard title="原始成本總額" value={formatCurrency(originalCostTotal)} />
        <SummaryCard title="調整後成本總額" value={formatCurrency(adjustedCostTotal)} />
        <SummaryCard title="毛利" value={formatCurrency(grossProfit)} />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">1. 專案總覽</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewRow label="對帳狀態" value={state.reconciliationStatus} />
          <OverviewRow label="結案狀態" value={state.closeStatus} />
          <OverviewRow label="有效報價單" value={state.quotationImport?.fileName ?? "未匯入"} />
          <OverviewRow label="備註" value={state.note} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">2. 對外報價單</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              一個專案同時間只保留一份有效對外報價單；Excel 匯入後系統內不可直接編修明細。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quoteImportOptions.map((quote, index) => (
              <button
                key={`${quote.fileName}-${quote.importedAt}`}
                type="button"
                onClick={() => handleImportQuote(index)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  quoteImportIndex === index ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                匯入 {quote.fileName}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
          <p className="font-semibold">目前有效報價單</p>
          <p className="mt-1">{state.quotationImport?.fileName ?? "未匯入"} ・ {state.quotationImport?.importedAt ?? "-"}</p>
          <p className="mt-1 text-blue-800">{state.quotationImport?.note ?? ""}</p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[980px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">分類</th>
                <th className="px-4 py-3 font-medium">項目名稱</th>
                <th className="px-4 py-3 font-medium">說明</th>
                <th className="px-4 py-3 font-medium">數量</th>
                <th className="px-4 py-3 font-medium">單位</th>
                <th className="px-4 py-3 font-medium">單價</th>
                <th className="px-4 py-3 font-medium">小計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {state.quotationItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-slate-600">{item.category}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.itemName}</td>
                  <td className="px-4 py-4 text-slate-600">{item.description}</td>
                  <td className="px-4 py-4 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-4 text-slate-600">{item.unit}</td>
                  <td className="px-4 py-4 text-slate-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">3. 成本管理</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              預設看調整後成本，並持續保留原始成本。廠商成本獨立按廠商分組；人工成本另外成區，不走廠商主軸。
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddManualCost}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + 新增人工成本
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">廠商成本區</h4>
                <p className="mt-1 text-sm text-slate-500">設計 / 備品 / 廠商三條線的成本先按廠商聚合。</p>
              </div>
            </div>

            <div className="space-y-4">
              {vendorGroups.map((group) => {
                const originalSubtotal = group.items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.originalAmount, 0);
                const adjustedSubtotal = group.items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.adjustedAmount, 0);
                return (
                  <details key={group.key} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{group.name}</p>
                        <p className="mt-1 text-sm text-slate-500">調整後小計 {formatCurrency(adjustedSubtotal)} ・ 原始小計 {formatCurrency(originalSubtotal)}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">{group.items.length} 筆</span>
                    </summary>

                    <div className="mt-4 space-y-3">
                      {group.items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_1.2fr]">
                            <div>
                              <p className="font-semibold text-slate-900">{item.itemName}</p>
                              <p className="mt-1 text-sm text-slate-500">{item.sourceRef}</p>
                              <p className="mt-1 text-xs text-slate-400">來源類型：{item.sourceType}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500">原始成本</label>
                              <p className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">{formatCurrency(item.originalAmount)}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500">調整後成本</label>
                              <input
                                type="number"
                                value={item.adjustedAmount}
                                onChange={(event) => handleAdjustedAmountChange(item.id, event.target.value)}
                                className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500">關聯廠商</label>
                              <select
                                value={item.vendorId ?? UNSPECIFIED_VENDOR_ID}
                                onChange={(event) => handleVendorChange(item.id, event.target.value)}
                                className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                              >
                                <option value={UNSPECIFIED_VENDOR_ID}>{UNSPECIFIED_VENDOR_NAME}</option>
                                {vendorDirectory.map((vendor) => (
                                  <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={item.includedInCost}
                              onChange={(event) => handleIncludeToggle(item.id, event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            計入成本總額
                          </label>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">人工成本區</h4>
                <p className="mt-1 text-sm text-slate-500">手動新增車資、雜支、臨時費用等，不掛廠商主軸。</p>
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">{manualItems.length} 筆</span>
            </div>

            <div className="space-y-3">
              {manualItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">目前尚未新增人工成本。</div>
              ) : (
                manualItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="grid gap-4 xl:grid-cols-[1.4fr_1.4fr_1fr]">
                      <div>
                        <label className="text-xs font-medium text-slate-500">項目名稱</label>
                        <input value={item.itemName} onChange={(event) => handleManualItemChange(item.id, "itemName", event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">來源紀錄</label>
                        <input value={item.sourceRef} onChange={(event) => handleManualItemChange(item.id, "sourceRef", event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">調整後成本</label>
                        <input type="number" value={item.adjustedAmount} onChange={(event) => handleManualItemChange(item.id, "adjustedAmount", event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span>原始成本：{formatCurrency(item.originalAmount)}</span>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={item.includedInCost} onChange={(event) => handleIncludeToggle(item.id, event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                        計入成本總額
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">4. 對帳 / 結案</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              以對外報價總額與調整後成本總額比對毛利；確認對帳完成後若成本再改，系統會自動取消已確認狀態。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConfirmReconciliation}
              disabled={!state.quotationImported || state.costItems.length === 0}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              確認對帳完成
            </button>
            <button
              type="button"
              onClick={handleCloseProject}
              disabled={!state.quotationImported || state.costItems.length === 0 || state.reconciliationStatus !== "已完成"}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              手動結案
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewRow label="對外報價總額" value={formatCurrency(quotationTotal)} />
          <OverviewRow label="調整後成本總額" value={formatCurrency(adjustedCostTotal)} />
          <OverviewRow label="毛利" value={formatCurrency(grossProfit)} />
          <OverviewRow label="目前狀態" value={`${state.reconciliationStatus} / ${state.closeStatus}`} />
        </div>
      </section>
    </AppShell>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </article>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}
