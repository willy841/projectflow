"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { VendorQuickCreateDialog } from "@/components/vendor-quick-create-dialog";
import { useVendorStore } from "@/components/vendor-store";
import {
  formatCurrency,
  getAdjustedCostTotal,
  getGrossProfit,
  getOriginalCostTotal,
  getQuotationTotal,
  upsertStoredQuoteCostProject,
  QuoteCostProject,
  sampleQuoteImports,
  sampleQuoteLineItemsByProject,
  UNSPECIFIED_VENDOR_ID,
  UNSPECIFIED_VENDOR_NAME,
  vendorDirectory,
  type CostLineItem,
  type CostSourceType,
} from "@/components/quote-cost-data";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";

type DetailMode = "active" | "closed";

type Props = {
  projectId: string;
  mode?: DetailMode;
};

type EditableProjectState = QuoteCostProject;

export function QuoteCostDetailClient({ projectId, mode = "active" }: Props) {
  const { vendors } = useVendorStore();
  const workflowProject = getQuoteCostProjectsWithWorkflow().find((item) => item.id === projectId) ?? null;
  const [state, setState] = useState<EditableProjectState | null>(() => workflowProject);
  const [quoteImportIndex, setQuoteImportIndex] = useState(0);
  const [quickCreateItemId, setQuickCreateItemId] = useState<string | null>(null);
  const isClosedView = mode === "closed";

  useEffect(() => {
    if (!state) return;
    upsertStoredQuoteCostProject(state);
  }, [state]);

  const quoteImportOptions = state ? sampleQuoteImports[state.id] ?? [state.quotationImport].filter(Boolean) : [];
  const quoteLineItemOptions = state ? sampleQuoteLineItemsByProject[state.id] ?? [state.quotationItems] : [];

  const quotationTotal = useMemo(() => getQuotationTotal(state?.quotationItems ?? []), [state]);
  const adjustedCostTotal = useMemo(() => getAdjustedCostTotal(state?.costItems ?? []), [state]);
  const originalCostTotal = useMemo(() => getOriginalCostTotal(state?.costItems ?? []), [state]);
  const grossProfit = useMemo(() => getGrossProfit(quotationTotal, adjustedCostTotal), [quotationTotal, adjustedCostTotal]);
  const excludedCostItems = useMemo(() => (state?.costItems ?? []).filter((item) => !item.includedInCost), [state]);
  const costSourceSummary = useMemo(() => getCostSourceSummary(state?.costItems ?? []), [state]);

  const vendorGroups = useMemo(() => {
    const map = new Map<string, { key: string; name: string; items: EditableProjectState["costItems"] }>();
    (state?.costItems ?? [])
      .filter((item) => !item.isManual)
      .forEach((item) => {
        const key = item.vendorId ?? UNSPECIFIED_VENDOR_ID;
        const name = item.vendorName ?? UNSPECIFIED_VENDOR_NAME;
        if (!map.has(key)) map.set(key, { key, name, items: [] });
        map.get(key)?.items.push(item);
      });
    return Array.from(map.values()).sort((a, b) => {
      if (a.key === UNSPECIFIED_VENDOR_ID) return -1;
      if (b.key === UNSPECIFIED_VENDOR_ID) return 1;
      return b.items.length - a.items.length;
    });
  }, [state]);

  const manualItems = (state?.costItems ?? []).filter((item) => item.isManual);
  const includedManualTotal = manualItems.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.adjustedAmount, 0);
  const vendorIncludedTotal = (state?.costItems ?? []).filter((item) => !item.isManual && item.includedInCost).reduce((sum, item) => sum + item.adjustedAmount, 0);
  const availableVendors = useMemo(() => {
    const merged = new Map<string, { id: string; name: string }>();
    vendorDirectory.forEach((vendor) => merged.set(vendor.id, vendor));
    vendors.forEach((vendor) => merged.set(vendor.id, { id: vendor.id, name: vendor.name }));
    return Array.from(merged.values());
  }, [vendors]);

  function mutateCosts(mutator: (prev: EditableProjectState) => EditableProjectState) {
    setState((prev) => {
      if (!prev) return prev;
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
    if (!state) return;
    const quotationImport = quoteImportOptions[index] ?? null;
    const quotationItems = quoteLineItemOptions[index] ?? quoteLineItemOptions[0] ?? state.quotationItems;
    setQuoteImportIndex(index);
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        quotationImported: true,
        quotationImport,
        quotationItems,
        closeStatus: prev.closeStatus === "已結案" ? "未結案" : prev.closeStatus,
        reconciliationStatus: prev.reconciliationStatus === "已完成" ? "待確認" : prev.reconciliationStatus,
      };
    });
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
    const vendor = availableVendors.find((entry) => entry.id === vendorId);
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
    if (!state?.quotationImported || state.costItems.length === 0) return;
    setState((prev) => (prev ? { ...prev, reconciliationStatus: "已完成" } : prev));
  }

  function handleCloseProject() {
    if (!state?.quotationImported || state.costItems.length === 0 || state.reconciliationStatus !== "已完成") return;
    setState((prev) => (prev ? { ...prev, projectStatus: "已結案", closeStatus: "已結案" } : prev));
  }

  if (!state || (isClosedView ? state.projectStatus !== "已結案" : state.projectStatus !== "執行中")) {
    return (
      <AppShell activePath={isClosedView ? "/closeouts" : "/quote-costs"}>
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">這個專案目前不在這個列表</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">可能是路由有誤，或它已經被移到另一個狀態列表。</p>
          <Link href={isClosedView ? "/closeouts" : "/quote-costs"} className="mt-5 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            返回列表
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell activePath={isClosedView ? "/closeouts" : "/quote-costs"}>
      <header className={`overflow-hidden rounded-[28px] border p-6 shadow-sm xl:p-7 ${isClosedView ? "border-slate-200 bg-linear-to-br from-slate-50 to-white" : "border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white"}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase ${isClosedView ? "border border-slate-200 bg-white text-slate-500" : "border border-white/15 bg-white/10 text-slate-100"}`}>
              {isClosedView ? "結案留存詳情" : "報價成本進行中"}
            </div>
            <h2 className={`mt-4 text-3xl font-semibold tracking-tight ${isClosedView ? "text-slate-900" : "text-white"}`}>{state.projectName}</h2>
            <p className={`mt-2 text-sm ${isClosedView ? "text-slate-500" : "text-slate-300"}`}>{state.projectCode} ・ {state.clientName} ・ {state.eventDate}</p>
            <p className={`mt-3 max-w-3xl text-sm leading-6 ${isClosedView ? "text-slate-600" : "text-slate-200"}`}>
              {isClosedView
                ? "沿用同一份四區骨架，但改成結案留存頁語氣：重點是回查當時結果與保留紀錄，不再像進行中頁面持續推進工作。"
                : "沿用四區結構處理報價、成本、對帳與結案，讓使用者在同一頁完成進行中專案的控盤與成本確認。"}
            </p>
          </div>
          <div className={`grid gap-3 rounded-3xl border p-4 text-sm sm:min-w-[300px] ${isClosedView ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/6 text-slate-200"}`}>
            <div>
              <p className={`text-xs font-medium tracking-[0.16em] uppercase ${isClosedView ? "text-slate-400" : "text-slate-300"}`}>{isClosedView ? "結案留存重點" : "進行中管理重點"}</p>
              <p className={`mt-1 text-base font-semibold ${isClosedView ? "text-slate-900" : "text-white"}`}>{isClosedView ? "結案留存 / 最終結果確認" : "進行中控盤 / 成本管理 / 對帳推進"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <QuickPanel value={state.reconciliationStatus} label="對帳狀態" archived={isClosedView} />
              <QuickPanel value={state.closeStatus} label="結案狀態" archived={isClosedView} />
            </div>
            <Link href={isClosedView ? "/closeouts" : "/quote-costs"} className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isClosedView ? "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50" : "bg-white text-slate-900 hover:bg-slate-100"}`}>
              返回{isClosedView ? "結案列表" : "報價成本列表"}
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="對外報價總額" value={formatCurrency(quotationTotal)} mode={mode} />
        <SummaryCard title="原始成本總額" value={formatCurrency(originalCostTotal)} mode={mode} />
        <SummaryCard title="調整後成本總額" value={formatCurrency(adjustedCostTotal)} mode={mode} highlight={!isClosedView} />
        <SummaryCard title="毛利" value={formatCurrency(grossProfit)} mode={mode} />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader index="1" title="專案總覽" description={isClosedView ? "保留本案結案當下的主要結果，供後續查閱與對帳回看。" : "先確認目前有效版本、對帳位置與備註，再進入報價與成本調整。"} archived={isClosedView} />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewRow label="對帳狀態" value={state.reconciliationStatus} archived={isClosedView} />
          <OverviewRow label="結案狀態" value={state.closeStatus} archived={isClosedView} />
          <OverviewRow label="有效報價單" value={state.quotationImport?.fileName ?? "未匯入"} archived={isClosedView} />
          <OverviewRow label="備註" value={state.note} archived={isClosedView} />
        </div>
      </section>

      <section className={`rounded-[28px] border p-6 shadow-sm ${isClosedView ? "border-slate-200 bg-white" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeader index="2" title="對外報價單" description={isClosedView ? "保留結案當下的有效報價版本，作為後續查閱基準。" : "一個專案同時間只保留一份有效對外報價單；Excel 匯入後系統內不可直接編修明細。"} archived={isClosedView} />
          <div className="flex flex-wrap gap-2">
            {isClosedView ? (
              <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                結案版本已鎖定
              </span>
            ) : (
              quoteImportOptions.map((quote, index) => (
                <button
                  key={`${quote.fileName}-${quote.importedAt}`}
                  type="button"
                  onClick={() => handleImportQuote(index)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${quoteImportIndex === index ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"}`}
                >
                  匯入 {quote.fileName}
                </button>
              ))
            )}
          </div>
        </div>

        <div className={`mt-4 rounded-2xl border p-4 text-sm ${isClosedView ? "border-slate-200 bg-slate-50 text-slate-800" : "border-sky-100 bg-sky-50/70 text-sky-950"}`}>
          <p className="font-semibold">目前有效報價單</p>
          <p className="mt-1">{state.quotationImport?.fileName ?? "未匯入"} ・ {state.quotationImport?.importedAt ?? "-"}</p>
          <p className={`mt-1 ${isClosedView ? "text-slate-600" : "text-sky-900"}`}>{state.quotationImport?.note ?? ""}</p>
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
                <tr key={item.id} className={isClosedView ? "bg-white" : "hover:bg-slate-50/80"}>
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

      <section className={`rounded-[28px] border p-6 shadow-sm ${isClosedView ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader index="3" title="成本管理" description={isClosedView ? "沿用同一骨架，但改以留存結果為主：先看廠商成本結果，再補人工成本與例外項。" : "先看廠商成本主體，再補人工成本與例外項；讓使用者快速聚焦主要成本來源。"} archived={isClosedView} />
          {!isClosedView && (
            <button
              type="button"
              onClick={handleAddManualCost}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              + 新增人工成本
            </button>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">成本主線判讀</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">先看目前有效總額，再往下區分主線成本與例外。</h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">這裡把使用者第一個要判斷的資訊拉前面：目前計入成本的有效總額，以及有哪些項目還停留在未指定廠商或不計入成本。</p>
            </div>
            <div className="grid gap-3 sm:min-w-[320px] sm:grid-cols-2">
              <InfoChip label="目前有效成本" value={formatCurrency(adjustedCostTotal)} archived={isClosedView} />
              <InfoChip label="原始成本基準" value={formatCurrency(originalCostTotal)} archived={isClosedView} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {costSourceSummary.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${item.badgeClass}`}>{item.label}</span>
                  <span className="text-xs text-slate-500">{item.count} 筆</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">{formatCurrency(item.adjustedTotal)}</p>
                <p className="mt-1 text-xs text-slate-500">作為主線分項小計；原始 {formatCurrency(item.originalTotal)}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <article className={`rounded-3xl border p-5 ${isClosedView ? "border-slate-200 bg-white" : "border-slate-900 bg-slate-900 text-white"}`}>
            <p className={`text-xs font-medium tracking-[0.16em] uppercase ${isClosedView ? "text-slate-400" : "text-slate-300"}`}>主成本區</p>
            <h4 className={`mt-2 text-xl font-semibold ${isClosedView ? "text-slate-900" : "text-white"}`}>廠商成本區</h4>
            <p className={`mt-2 text-sm leading-6 ${isClosedView ? "text-slate-600" : "text-slate-200"}`}>這裡是成本主線本體：設計 / 備品 / 廠商三條線一旦成立成本，先全部收進這裡，再按廠商分組往下看明細與調整。</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <InfoChip label="廠商群組" value={`${vendorGroups.length} 組`} archived={isClosedView} inverted={!isClosedView} />
              <InfoChip label="主線計入成本" value={formatCurrency(vendorIncludedTotal)} archived={isClosedView} inverted={!isClosedView} />
              <InfoChip label="待指定 / 例外" value={`${vendorGroups.find((group) => group.key === UNSPECIFIED_VENDOR_ID)?.items.length ?? 0} 筆`} archived={isClosedView} inverted={!isClosedView} />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">次成本區</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">人工成本區</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">人工成本保留在次層，避免與 workflow 成立的廠商成本主線混讀；需要補車資、雜支或臨時費用時再往這裡處理。</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoChip label="人工成本筆數" value={`${manualItems.length} 筆`} archived />
              <InfoChip label="次區計入成本" value={formatCurrency(includedManualTotal)} archived />
            </div>
          </article>
        </div>

        <div className="mt-6 space-y-5">
          {excludedCostItems.length > 0 && (
            <div className={`rounded-3xl border p-4 ${isClosedView ? "border-amber-200 bg-amber-50/70" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-900">例外項：目前不計入成本</p>
                  <p className="mt-1 text-sm text-amber-800">這些項目保留紀錄，但暫不進有效總額；主線先看已成立成本，例外資訊集中放在這裡。</p>
                </div>
                <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-800">
                  {excludedCostItems.length} 筆未納入
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {excludedCostItems.map((item) => (
                  <span key={item.id} className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-800">
                    {item.itemName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {vendorGroups.map((group) => {
              const originalSubtotal = group.items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.originalAmount, 0);
              const adjustedSubtotal = group.items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.adjustedAmount, 0);
              const excludedCount = group.items.filter((item) => !item.includedInCost).length;
              const isUnspecifiedGroup = group.key === UNSPECIFIED_VENDOR_ID;

              return (
                <details key={group.key} className={`rounded-3xl border p-4 ${isClosedView ? "border-slate-200 bg-white" : isUnspecifiedGroup ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-slate-50/60"}`} open>
                  <summary className="flex cursor-pointer list-none flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">{group.name}</p>
                        {isUnspecifiedGroup && (
                          <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-800">
                            待指定廠商
                          </span>
                        )}
                        {excludedCount > 0 && (
                          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            {excludedCount} 筆未納入
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">調整後小計 {formatCurrency(adjustedSubtotal)} ・ 原始小計 {formatCurrency(originalSubtotal)}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">{group.items.length} 筆</span>
                  </summary>

                  <div className="mt-4 space-y-3">
                    {group.items.map((item) => (
                      <div key={item.id} className={`rounded-2xl border p-4 ${!item.includedInCost ? "border-amber-200 bg-amber-50/70" : isClosedView ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white"}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">{item.itemName}</p>
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${getSourceBadgeClass(item.sourceType)}`}>{item.sourceType}</span>
                              {!item.includedInCost && (
                                <span className="inline-flex rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-800">不計入成本</span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{item.sourceRef}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">原始成本</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(item.originalAmount)}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_1.1fr]">
                          <div>
                            <label className="text-xs font-medium text-slate-500">調整後成本</label>
                            <input
                              type="number"
                              value={item.adjustedAmount}
                              onChange={(event) => handleAdjustedAmountChange(item.id, event.target.value)}
                              readOnly={isClosedView}
                              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500">關聯廠商</label>
                            <select
                              value={item.vendorId ?? UNSPECIFIED_VENDOR_ID}
                              onChange={(event) => handleVendorChange(item.id, event.target.value)}
                              disabled={isClosedView}
                              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-600"
                            >
                              <option value={UNSPECIFIED_VENDOR_ID}>{UNSPECIFIED_VENDOR_NAME}</option>
                              {availableVendors.map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                              ))}
                            </select>
                            {!isClosedView ? (
                              <button
                                type="button"
                                onClick={() => setQuickCreateItemId(item.id)}
                                className="mt-2 inline-flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                找不到廠商？快速建立
                              </button>
                            ) : null}
                          </div>
                          <div className="flex items-end">
                            <label className="flex h-11 w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                checked={item.includedInCost}
                                onChange={(event) => handleIncludeToggle(item.id, event.target.checked)}
                                disabled={isClosedView}
                                className="h-4 w-4 rounded border-slate-300 disabled:cursor-not-allowed"
                              />
                              計入成本總額
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">人工成本區</h4>
                <p className="mt-1 text-sm text-slate-500">作為次區保留手動補充成本，避免與廠商成本主體混在同一層閱讀。</p>
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">{manualItems.length} 筆</span>
            </div>

            <div className="space-y-3">
              {manualItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">目前尚未新增人工成本。</div>
              ) : (
                manualItems.map((item) => (
                  <div key={item.id} className={`rounded-2xl border p-4 ${!item.includedInCost ? "border-amber-200 bg-amber-50/70" : isClosedView ? "border-slate-200 bg-slate-50/80" : "border-slate-200 bg-slate-50/50"}`}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">人工成本</span>
                      {!item.includedInCost && <span className="inline-flex rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-800">不計入成本</span>}
                    </div>
                    <div className="grid gap-4 xl:grid-cols-[1.4fr_1.4fr_1fr]">
                      <div>
                        <label className="text-xs font-medium text-slate-500">項目名稱</label>
                        <input value={item.itemName} onChange={(event) => handleManualItemChange(item.id, "itemName", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">來源紀錄</label>
                        <input value={item.sourceRef} onChange={(event) => handleManualItemChange(item.id, "sourceRef", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">調整後成本</label>
                        <input type="number" value={item.adjustedAmount} onChange={(event) => handleManualItemChange(item.id, "adjustedAmount", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span>原始成本：{formatCurrency(item.originalAmount)}</span>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={item.includedInCost} onChange={(event) => handleIncludeToggle(item.id, event.target.checked)} disabled={isClosedView} className="h-4 w-4 rounded border-slate-300 disabled:cursor-not-allowed" />
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

      <section className={`rounded-[28px] border p-6 shadow-sm ${isClosedView ? "border-slate-200 bg-white" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <SectionHeader index="4" title="對帳 / 結案" description={isClosedView ? "此區保留結案當下的對帳與毛利結果，作為後續追溯與確認依據。" : "以對外報價總額與調整後成本總額比對毛利；確認對帳完成後若成本再改，系統會自動取消已確認狀態。"} archived={isClosedView} />
          <div className="flex flex-wrap gap-2">
            {isClosedView ? (
              <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                已結案留存版本
              </span>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewRow label="對外報價總額" value={formatCurrency(quotationTotal)} archived={isClosedView} />
          <OverviewRow label="調整後成本總額" value={formatCurrency(adjustedCostTotal)} archived={isClosedView} />
          <OverviewRow label="毛利" value={formatCurrency(grossProfit)} archived={isClosedView} />
          <OverviewRow label="目前狀態" value={`${state.reconciliationStatus} / ${state.closeStatus}`} archived={isClosedView} />
        </div>
      </section>
      </AppShell>
      <VendorQuickCreateDialog
        open={Boolean(quickCreateItemId)}
        onClose={() => setQuickCreateItemId(null)}
        title="流程內快速建立廠商"
        description="這裡只快速建立廠商並回填選單；工種新增 / 刪除統一回廠商資料模組管理。"
        onCreated={(vendor) => {
          if (!quickCreateItemId) return;
          handleVendorChange(quickCreateItemId, vendor.id);
        }}
      />
    </>
  );
}

function getCostSourceSummary(costItems: CostLineItem[]) {
  const sourceOrder: CostSourceType[] = ["設計", "備品", "廠商"];
  const sourceTone: Record<CostSourceType, string> = {
    設計: "bg-blue-50 text-blue-700 ring-blue-200",
    備品: "bg-amber-50 text-amber-700 ring-amber-200",
    廠商: "bg-violet-50 text-violet-700 ring-violet-200",
    人工: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return sourceOrder.map((sourceType) => {
    const items = costItems.filter((item) => item.sourceType === sourceType && item.includedInCost);
    return {
      label: sourceType,
      count: items.length,
      originalTotal: items.reduce((sum, item) => sum + item.originalAmount, 0),
      adjustedTotal: items.reduce((sum, item) => sum + item.adjustedAmount, 0),
      badgeClass: sourceTone[sourceType],
    };
  });
}

function getSourceBadgeClass(sourceType: CostSourceType) {
  return {
    設計: "bg-blue-50 text-blue-700 ring-blue-200",
    備品: "bg-amber-50 text-amber-700 ring-amber-200",
    廠商: "bg-violet-50 text-violet-700 ring-violet-200",
    人工: "bg-slate-100 text-slate-700 ring-slate-200",
  }[sourceType];
}

function QuickPanel({ value, label, archived }: { value: string; label: string; archived: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 ${archived ? "border-slate-200 bg-white text-slate-500" : "border-white/8 bg-black/10 text-slate-300"}`}>
      <p>{label}</p>
      <p className={`mt-1 font-semibold ${archived ? "text-slate-900" : "text-white"}`}>{value}</p>
    </div>
  );
}

function SummaryCard({ title, value, mode, highlight = false }: { title: string; value: string; mode: DetailMode; highlight?: boolean }) {
  const isClosedView = mode === "closed";
  return (
    <article className={`rounded-[28px] border p-5 shadow-sm ${isClosedView ? "border-slate-200 bg-white text-slate-900" : highlight ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
      <p className={`text-sm ${isClosedView ? "text-slate-500" : highlight ? "text-slate-300" : "text-slate-500"}`}>{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}

function OverviewRow({ label, value, archived = false }: { label: string; value: string; archived?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${archived ? "bg-white ring-slate-200" : "bg-slate-50 ring-slate-200"}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function SectionHeader({ index, title, description, archived = false }: { index: string; title: string; description: string; archived?: boolean }) {
  return (
    <div>
      <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${archived ? "bg-slate-100 text-slate-600 ring-slate-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
        {index}. {archived ? "留存區塊" : "工作區塊"}
      </div>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function InfoChip({ label, value, archived = false, inverted = false }: { label: string; value: string; archived?: boolean; inverted?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${inverted ? "border-white/10 bg-black/10" : archived ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white"}`}>
      <p className={`text-xs ${inverted ? "text-slate-300" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-1 text-sm font-semibold ${inverted ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
