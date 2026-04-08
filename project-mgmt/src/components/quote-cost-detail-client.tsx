"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  formatCurrency,
  getAdditionalManualCostTotal,
  getCloseStatusClass,
  getFormalOriginalCostTotal,
  getGrossProfit,
  getQuotationTotal,
  getReconciliationStatusClass,
  QuoteCostProject,
  sampleQuoteImports,
  sampleQuoteLineItemsByProject,
  type CostLineItem,
  type CostSourceType,
} from "@/components/quote-cost-data";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";

type DetailMode = "active" | "closed";

type Props = {
  project: QuoteCostProject;
  mode?: DetailMode;
  initialProject?: QuoteCostProject;
};

type EditableProjectState = QuoteCostProject;

export function QuoteCostDetailClient({ project, mode = "active", initialProject }: Props) {
  const router = useRouter();
  const workflowProject = initialProject ?? getQuoteCostProjectsWithWorkflow().find((item) => item.id === project.id) ?? project;
  const [state, setState] = useState<EditableProjectState>(workflowProject);
  const [manualSyncError, setManualSyncError] = useState<string | null>(null);
  const [manualSyncSuccess, setManualSyncSuccess] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [quoteImportIndex, setQuoteImportIndex] = useState(0);
  const quoteImportOptions = sampleQuoteImports[project.id] ?? [project.quotationImport].filter(Boolean);
  const quoteLineItemOptions = sampleQuoteLineItemsByProject[project.id] ?? [project.quotationItems];
  const isClosedView = mode === "closed";

  const quotationTotal = useMemo(() => getQuotationTotal(state.quotationItems), [state.quotationItems]);
  const originalCostTotal = useMemo(() => getFormalOriginalCostTotal(state.costItems), [state.costItems]);
  const additionalManualCostTotal = useMemo(() => getAdditionalManualCostTotal(state.costItems), [state.costItems]);
  const projectCostTotal = useMemo(() => originalCostTotal + additionalManualCostTotal, [originalCostTotal, additionalManualCostTotal]);
  const grossProfit = useMemo(() => getGrossProfit(quotationTotal, projectCostTotal), [quotationTotal, projectCostTotal]);
  const costSourceSummary = useMemo(() => getCostSourceSummary(state.costItems, state.id), [state.costItems, state.id]);
  const manualItems = useMemo(() => state.costItems.filter((item) => item.isManual), [state.costItems]);
  const manualSyncPayload = useMemo(() => JSON.stringify(manualItems.map((item) => ({
    itemName: item.itemName,
    description: item.sourceRef,
    amount: item.adjustedAmount,
    includedInCost: item.includedInCost,
  }))), [manualItems]);
  const [lastSavedManualSyncPayload, setLastSavedManualSyncPayload] = useState(manualSyncPayload);
  const hasUnsavedManualChanges = manualSyncPayload !== lastSavedManualSyncPayload;

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

  async function handleSaveManualCosts() {
    if (isClosedView || isManualSyncing || !hasUnsavedManualChanges) return;

    setIsManualSyncing(true);
    setManualSyncError(null);
    setManualSyncSuccess(null);

    try {
      const response = await fetch(`/api/financial-projects/${state.id}/manual-costs/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: JSON.parse(manualSyncPayload) }),
      });

      if (!response.ok) {
        throw new Error("manual-cost-sync-failed");
      }

      setLastSavedManualSyncPayload(manualSyncPayload);
      setManualSyncSuccess("人工新增費用已儲存，list / detail / closeout 會承接最新資料。");
      router.refresh();
    } catch {
      setManualSyncError("人工新增費用儲存失敗，尚未寫入正式資料，請再按一次「儲存」。");
    } finally {
      setIsManualSyncing(false);
    }
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

  function handleIncludeToggle(itemId: string, included: boolean) {
    mutateCosts((prev) => ({
      ...prev,
      costItems: prev.costItems.map((item) => (item.id === itemId ? { ...item, includedInCost: included } : item)),
    }));
  }

  function handleAddManualCost() {
    setManualSyncError(null);
    setManualSyncSuccess(null);
    mutateCosts((prev) => ({
      ...prev,
      costItems: [
        ...prev.costItems,
        {
          id: `manual-${Date.now()}`,
          itemName: `人工成本 ${manualItems.length + 1}`,
          sourceType: "人工",
          sourceRef: "",
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
    setManualSyncError(null);
    setManualSyncSuccess(null);
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
    <>
      <AppShell activePath={isClosedView ? "/closeouts" : "/quote-costs"}>
      <header className={`overflow-hidden rounded-[28px] border p-6 shadow-sm xl:p-7 ${isClosedView ? "border-slate-200 bg-linear-to-br from-slate-50 to-white" : "border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white"}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1 xl:self-center">
            <h2 className={`text-3xl font-semibold tracking-tight ${isClosedView ? "text-slate-900" : "text-white"}`}>{state.projectName}</h2>
            <div className={`mt-4 grid gap-3 sm:grid-cols-2 xl:max-w-[520px] ${isClosedView ? "text-slate-600" : "text-slate-200"}`}>
              <OverviewRow label="客戶" value={state.clientName} archived={isClosedView} />
              <OverviewRow label="活動日期" value={state.eventDate} archived={isClosedView} />
            </div>
          </div>
          <div className={`grid gap-3 rounded-3xl border p-4 text-sm sm:min-w-[300px] ${isClosedView ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/6 text-slate-200"}`}>
            <div>
              <p className={`text-xs font-medium tracking-[0.16em] uppercase ${isClosedView ? "text-slate-400" : "text-slate-300"}`}>{isClosedView ? "Archive Focus" : "Management Focus"}</p>
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
        <SummaryCard title="原始總成本總額" value={formatCurrency(originalCostTotal)} mode={mode} />
        <SummaryCard title="新增費用" value={formatCurrency(additionalManualCostTotal)} mode={mode} highlight={!isClosedView} />
        <SummaryCard title="毛利" value={formatCurrency(grossProfit)} mode={mode} />
      </section>


      <section className={`rounded-[28px] border p-6 shadow-sm ${isClosedView ? "border-slate-200 bg-white" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SimpleSectionTitle title="對外報價單" />
          <div className="flex flex-wrap gap-2">
            {isClosedView ? (
              <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                結案版本已鎖定
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (quoteImportOptions.length === 0) return;
                  handleImportQuote((quoteImportIndex + 1) % quoteImportOptions.length);
                }}
                disabled={quoteImportOptions.length === 0}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                匯入報價單
              </button>
            )}
          </div>
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
          <SimpleSectionTitle title="成本管理" />
          <div className="flex flex-wrap gap-2">
            {!isClosedView && (
              <button
                type="button"
                onClick={handleAddManualCost}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                + 新增人工成本
              </button>
            )}
            {!isClosedView && (
              <button
                type="button"
                onClick={handleConfirmReconciliation}
                disabled={!state.quotationImported || state.costItems.length === 0}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                確認對帳完成
              </button>
            )}
            {isClosedView && (
              <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                已結案留存版本
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          {costSourceSummary.map((item) => (
            <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${item.badgeClass}`}>{item.label}</span>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{formatCurrency(item.originalTotal)}</p>
                </div>
                {item.href ? (
                  <Link href={item.href} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                    {item.count} 筆
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    {item.count} 筆
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
            </article>
          ))}

          <article className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 bg-slate-100 text-slate-700 ring-slate-200">人工</span>
                <p className="mt-3 text-lg font-semibold text-slate-900">{formatCurrency(additionalManualCostTotal)}</p>
              </div>
              <span className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                {manualItems.length} 筆
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">新增 / 管理型成本卡。欄位固定為項目、說明、金額。</p>
          </article>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">人工新增費用</h4>
              <p className="mt-1 text-sm text-slate-500">固定欄位：項目 / 說明 / 金額。編輯內容只先留在本頁，按下「儲存」才正式寫入資料庫。</p>
              {!isClosedView && (
                <p className={`mt-2 text-xs ${manualSyncError ? "text-rose-600" : manualSyncSuccess ? "text-emerald-600" : hasUnsavedManualChanges ? "text-amber-600" : "text-slate-400"}`}>
                  {manualSyncError
                    ?? manualSyncSuccess
                    ?? (isManualSyncing
                      ? "人工新增費用儲存中..."
                      : hasUnsavedManualChanges
                        ? "你目前有尚未儲存的人工新增費用；按下「儲存」後才會同步到 list / detail / closeout。"
                        : "目前人工新增費用已與正式資料同步。")}
                </p>
              )}
            </div>
            {!isClosedView && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveManualCosts}
                  disabled={!hasUnsavedManualChanges || isManualSyncing}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {isManualSyncing ? "儲存中..." : "儲存人工新增費用"}
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
            )}
          </div>

          <div className="space-y-3">
            {manualItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">目前尚未新增人工成本。</div>
            ) : (
              manualItems.map((item) => (
                <div key={item.id} className={`rounded-2xl border p-4 ${isClosedView ? "border-slate-200 bg-slate-50/80" : "border-slate-200 bg-slate-50/50"}`}>
                  <div className="grid gap-4 xl:grid-cols-[1.4fr_1.4fr_1fr]">
                    <div>
                      <label className="text-xs font-medium text-slate-500">項目</label>
                      <input value={item.itemName} onChange={(event) => handleManualItemChange(item.id, "itemName", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">說明</label>
                      <input value={item.sourceRef} onChange={(event) => handleManualItemChange(item.id, "sourceRef", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">金額</label>
                      <input type="number" value={item.adjustedAmount} onChange={(event) => handleManualItemChange(item.id, "adjustedAmount", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      </AppShell>
    </>
  );
}

function getCostSourceSummary(costItems: CostLineItem[], projectId: string) {
  const sourceOrder: CostSourceType[] = ["設計", "備品", "廠商"];
  const sourceTone: Record<CostSourceType, string> = {
    設計: "bg-blue-50 text-blue-700 ring-blue-200",
    備品: "bg-amber-50 text-amber-700 ring-amber-200",
    廠商: "bg-violet-50 text-violet-700 ring-violet-200",
    人工: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  const sourceHref: Record<Exclude<CostSourceType, "人工">, string> = {
    設計: `/design-tasks?project=${encodeURIComponent(projectId)}`,
    備品: `/procurement-tasks?project=${encodeURIComponent(projectId)}`,
    廠商: `/vendor-assignments?project=${encodeURIComponent(projectId)}`,
  };
  const sourceDescription: Record<Exclude<CostSourceType, "人工">, string> = {
    設計: "承接設計線全部確認後的正式成本，需回設計任務列表層更新。",
    備品: "承接備品線全部確認後的正式成本，需回備品任務列表層更新。",
    廠商: "承接廠商線全部確認後的正式成本，需回廠商發包列表層更新。",
  };

  return sourceOrder.map((sourceType) => {
    const items = costItems.filter((item) => item.sourceType === sourceType && item.includedInCost);
    return {
      label: sourceType,
      count: items.length,
      originalTotal: items.reduce((sum, item) => sum + item.originalAmount, 0),
      badgeClass: sourceTone[sourceType],
      href: sourceHref[sourceType as Exclude<CostSourceType, "人工">],
      description: sourceDescription[sourceType as Exclude<CostSourceType, "人工">],
    };
  });
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

function SimpleSectionTitle({ title }: { title: string }) {
  return <h3 className="text-xl font-semibold text-slate-900">{title}</h3>;
}

function StatusBadge({ label, value, toneClass }: { label: string; value: string; toneClass: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClass}`}>
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
