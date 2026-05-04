"use client";

import { useMemo, useRef, useState } from "react";
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
  type CostLineItem,
  type CostSourceType,
} from "@/components/quote-cost-data";
import { getQuoteCostDetailPresenter, type QuoteCostDetailPresenter } from "@/components/quote-cost-detail-presenter";
import {
  QuoteOverviewSection,
  VendorPaymentSummarySection,
  CollectionSection,
  CostManagementSection,
  getCostSourceSummary,
  QuoteDetailModal,
  type CollectionRecordView,
  type ReconciliationGroupView,
  type VendorPaymentView,
  QuoteCostHeader,
  SimpleSectionTitle,
} from "@/components/quote-cost-detail-sections";

type DetailMode = "active" | "closed";

function isGroupReconciled(status: string) {
  return status === '已對帳';
}

function normalizeGroupStatus(groups: ReconciliationGroupView[]): '未開始' | '待確認' | '已完成' {
  if (!groups.length) return '未開始';
  const reconciledCount = groups.filter((group) => isGroupReconciled(group.reconciliationStatus)).length;
  if (reconciledCount === 0) return '未開始';
  if (reconciledCount === groups.length) return '已完成';
  return '待確認';
}


type CloseoutWriteState = 'idle' | 'submitting';

type Props = {
  project: QuoteCostProject;
  mode?: DetailMode;
  presenter?: QuoteCostDetailPresenter;
  initialProject?: QuoteCostProject & { reconciliationGroups?: ReconciliationGroupView[]; collectionRecords?: CollectionRecordView[]; vendorPaymentRecords?: VendorPaymentView[] };
};

type EditableProjectState = QuoteCostProject;

export function QuoteCostDetailClient({ project, mode = "active", presenter = getQuoteCostDetailPresenter(mode), initialProject }: Props) {
  const router = useRouter();
  const resolvedProject = initialProject ?? project;
  const [reconciliationGroups, setReconciliationGroups] = useState<ReconciliationGroupView[]>(initialProject?.reconciliationGroups ?? []);
  const [state, setState] = useState<EditableProjectState>(() => ({
    ...resolvedProject,
    reconciliationStatus: normalizeGroupStatus(initialProject?.reconciliationGroups ?? []),
  }));
  const derivedReconciliationStatus = useMemo(
    () => normalizeGroupStatus(reconciliationGroups),
    [reconciliationGroups],
  );
  const [manualSyncError, setManualSyncError] = useState<string | null>(null);
  const [manualSyncSuccess, setManualSyncSuccess] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [reconciliationSyncingKey, setReconciliationSyncingKey] = useState<string | null>(null);
  const [collectionRecords, setCollectionRecords] = useState<CollectionRecordView[]>(initialProject?.collectionRecords ?? []);
  const [collectionForm, setCollectionForm] = useState<{ collectedOn: string; amount: string; note: string } | null>(null);
  const [vendorPaymentRecords] = useState<VendorPaymentView[]>(initialProject?.vendorPaymentRecords ?? []);
  const [closeoutWriteState, setCloseoutWriteState] = useState<CloseoutWriteState>('idle');
  const [closeoutError, setCloseoutError] = useState<string | null>(null);
  const [activeArchiveSource, setActiveArchiveSource] = useState<CostSourceType>("設計");
  const [isQuoteDetailModalOpen, setIsQuoteDetailModalOpen] = useState(false);
  const [isQuoteImporting, setIsQuoteImporting] = useState(false);
  const quoteImportInputRef = useRef<HTMLInputElement | null>(null);
  const quoteImportRecord = state.quotationImport;
  const isClosedView = presenter.archived;

  const quotationTotal = useMemo(() => getQuotationTotal(state.quotationItems, state.quotationImport), [state.quotationItems, state.quotationImport]);
  const collectedTotal = useMemo(() => collectionRecords.reduce((sum, record) => sum + record.amount, 0), [collectionRecords]);
  const outstandingTotal = useMemo(() => Math.max(quotationTotal - collectedTotal, 0), [quotationTotal, collectedTotal]);
  const originalCostTotal = useMemo(() => getFormalOriginalCostTotal(state.costItems), [state.costItems]);
  const additionalManualCostTotal = useMemo(() => getAdditionalManualCostTotal(state.costItems), [state.costItems]);
  const projectCostTotal = useMemo(() => originalCostTotal + additionalManualCostTotal, [originalCostTotal, additionalManualCostTotal]);
  const grossProfit = useMemo(() => getGrossProfit(quotationTotal, projectCostTotal), [quotationTotal, projectCostTotal]);
  const costSourceSummary = useMemo(() => getCostSourceSummary(state.costItems, state.id), [state.costItems, state.id]);
  const manualItems = useMemo(() => state.costItems.filter((item) => item.isManual), [state.costItems]);
  const visibleReconciliationGroups = useMemo(
    () => (activeArchiveSource === '人工' ? [] : reconciliationGroups.filter((group) => group.sourceType === activeArchiveSource)),
    [activeArchiveSource, reconciliationGroups],
  );
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
      if (derivedReconciliationStatus === "已完成") {
        return {
          ...next,
          reconciliationStatus: "待確認",
          closeStatus: next.closeStatus === "已結案" ? "未結案" : next.closeStatus,
        };
      }
      return {
        ...next,
        reconciliationStatus: derivedReconciliationStatus,
      };
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
      setManualSyncSuccess("人工新增費用已儲存,list / detail / closeout 會承接最新資料。");
      router.refresh();
    } catch {
      setManualSyncError("人工新增費用儲存失敗,尚未寫入正式資料,請再按一次「儲存」。");
    } finally {
      setIsManualSyncing(false);
    }
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

  async function handleConfirmGroup(groupKey: string) {
    const nextGroups = reconciliationGroups.map((group) =>
      group.key === groupKey ? { ...group, reconciliationStatus: '已對帳' as const } : group,
    );

    setReconciliationSyncingKey(groupKey);
    try {
      const response = await fetch(`/api/financial-projects/${state.id}/reconciliation-groups/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: nextGroups.map((group) => ({
            sourceType: group.sourceType,
            vendorId: group.vendorId ?? null,
            vendorName: group.vendorName,
            reconciliationStatus: group.reconciliationStatus,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('reconciliation-group-sync-failed');
      }

      const nextStatus = normalizeGroupStatus(nextGroups);
      setReconciliationGroups(nextGroups);
      setState((prev) => ({
        ...prev,
        reconciliationStatus: nextStatus,
        closeStatus: prev.closeStatus === '已結案' && nextStatus !== '已完成' ? '未結案' : prev.closeStatus,
      }));
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setReconciliationSyncingKey(null);
    }
  }

  async function handleQuotationImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || isQuoteImporting) return;

    setIsQuoteImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/financial-projects/${state.id}/quotation-import`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.ok) {
        window.alert(result?.error ?? 'Excel 匯入失敗');
        return;
      }

      setState((prev) => ({
        ...prev,
        quotationImported: true,
        quotationImport: {
          importedAt: result.importedAt as string,
          fileName: result.fileName as string,
          note: 'Excel 匯入正式版本',
          totalAmount: typeof result.totalAmount === 'number' ? result.totalAmount : null,
        },
        quotationItems: Array.isArray(result.items)
          ? result.items.map((item: any, index: number) => ({
              id: item.id ?? `quotation-${index + 1}`,
              category: item.category ?? '',
              itemName: item.itemName ?? '',
              description: item.description ?? '',
              quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity ?? 0),
              unit: item.unit ?? '',
              unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice ?? 0),
              amount: typeof item.amount === 'number' ? item.amount : Number(item.amount ?? 0),
              remark: item.remark ?? '',
            }))
          : prev.quotationItems,
      }));
      router.refresh();
      window.alert(`Excel 匯入完成，共承接 ${result.itemCount ?? 0} 筆明細。`);
    } catch {
      window.alert('Excel 匯入失敗');
    } finally {
      setIsQuoteImporting(false);
    }
  }

  async function handleAddCollectionRecord() {
    if (!collectionForm) return;
    const collectedOn = collectionForm.collectedOn.trim();
    const amount = Number(collectionForm.amount);
    if (!collectedOn || Number.isNaN(amount) || amount <= 0) return;

    const response = await fetch(`/api/accounting/projects/${state.id}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectedOn, amount, note: collectionForm.note.trim() }),
    });
    const result = await response.json();
    if (!response.ok || !result?.ok || !result?.id) {
      window.alert(result?.error ?? '新增收款失敗');
      return;
    }
    setCollectionRecords((current) => [
      { id: result.id as string, collectedOn, amount, note: collectionForm.note.trim() },
      ...current,
    ]);
    setCollectionForm(null);
    router.refresh();
  }

  async function handleDeleteCollectionRecord(id: string) {
    const confirmed = window.confirm('確認刪除這筆收款紀錄?');
    if (!confirmed) return;
    const response = await fetch(`/api/accounting/collections/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok || !result?.ok) {
      window.alert(result?.error ?? '刪除收款失敗');
      return;
    }
    setCollectionRecords((current) => current.filter((record) => record.id !== id));
    router.refresh();
  }

  const hasReconciliationGroups = reconciliationGroups.length > 0;
  const allReconciliationGroupsComplete = hasReconciliationGroups && reconciliationGroups.every((group) => isGroupReconciled(group.reconciliationStatus));
  const canCloseProject = state.quotationImported && outstandingTotal === 0 && allReconciliationGroupsComplete;
  const canReopenProject = isClosedView && closeoutWriteState !== 'submitting';

  async function handleCloseProject() {
    if (!canCloseProject || closeoutWriteState === 'submitting') return;

    setCloseoutWriteState('submitting');
    setCloseoutError(null);

    try {
      const response = await fetch(`/api/financial-projects/${state.id}/closeout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedOutstandingTotal: outstandingTotal,
          expectedReconciliationStatus: derivedReconciliationStatus,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result?.ok) {
        setCloseoutError(result?.error ?? '結案失敗');
        return;
      }

      setState((prev) => ({ ...prev, projectStatus: '已結案', closeStatus: '已結案' }));
      router.refresh();
      router.push(`/closeouts/${state.id}`);
    } catch (error) {
      console.error(error);
      setCloseoutError('結案失敗');
    } finally {
      setCloseoutWriteState('idle');
    }
  }

  async function handleReopenProject() {
    if (!canReopenProject) return;

    setCloseoutWriteState('submitting');
    setCloseoutError(null);

    try {
      const response = await fetch(`/api/financial-projects/${state.id}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();

      if (!response.ok || !result?.ok) {
        setCloseoutError(result?.error ?? '取消結案失敗');
        return;
      }

      setState((prev) => ({ ...prev, projectStatus: '執行中', closeStatus: '未結案' }));
      router.refresh();
      router.push(`/quote-costs/${state.id}`);
    } catch (error) {
      console.error(error);
      setCloseoutError('取消結案失敗');
    } finally {
      setCloseoutWriteState('idle');
    }
  }



  return (
    <>
      <AppShell activePath={presenter.activePath} variant="dark-glass">
      <QuoteCostHeader
        presenter={presenter}
        projectName={state.projectName}
        eventDate={state.eventDate}
        reconciliationStatus={derivedReconciliationStatus}
        closeStatus={state.closeStatus}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="應收總金額" value={formatCurrency(quotationTotal)} mode={mode} />
        <SummaryCard title="已收款" value={formatCurrency(collectedTotal)} mode={mode} />
        <SummaryCard title="未收款" value={formatCurrency(outstandingTotal)} mode={mode} highlight={!isClosedView} />
        <SummaryCard title="毛利" value={formatCurrency(grossProfit)} mode={mode} />
      </section>

      {!isClosedView ? (
        <section className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:items-start">
            <QuoteOverviewSection
              quoteImportRecord={quoteImportRecord}
              quotationItems={state.quotationItems}
              quotationTotal={quotationTotal}
              onOpenQuoteDetail={() => setIsQuoteDetailModalOpen(true)}
              onImportExcel={() => quoteImportInputRef.current?.click()}
            />
            <CollectionSection
              presenter={presenter}
              eventDate={state.eventDate}
              collectionRecords={collectionRecords}
              onCreate={() => setCollectionForm({ collectedOn: state.eventDate, amount: '', note: '' })}
              onDelete={handleDeleteCollectionRecord}
            />
          </div>
          <VendorPaymentSummarySection
            vendorPaymentRecords={vendorPaymentRecords}
          />
        </section>
      ) : (
        <CollectionSection
          presenter={presenter}
          eventDate={state.eventDate}
          collectionRecords={collectionRecords}
          onCreate={() => setCollectionForm({ collectedOn: state.eventDate, amount: '', note: '' })}
          onDelete={handleDeleteCollectionRecord}
        />
      )}

      <CostManagementSection archived={isClosedView}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SimpleSectionTitle title="• 成本管理" />
          <div className="flex flex-wrap gap-2">
            {presenter.canAddManualCost && (
              <button
                type="button"
                onClick={handleAddManualCost}
                className="pf-btn-create px-4 py-2.5"
              >
                + 新增人工成本
              </button>
            )}
            {presenter.canConfirmReconciliationGroup && reconciliationGroups.length === 0 ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300"
              >
                尚無可對帳群組
              </button>
            ) : null}
            {isClosedView && (
              <span className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200">
                {presenter.costSectionLockedLabel}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          {costSourceSummary.map((item) => {
            const isActiveArchiveSource = activeArchiveSource === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveArchiveSource(item.label)}
                className={`rounded-3xl border bg-[linear-gradient(180deg,rgba(20,31,51,0.82),rgba(10,18,33,0.72))] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition ${isActiveArchiveSource ? "border-sky-400/35 ring-2 ring-sky-400/20" : "border-white/10 hover:border-white/20"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${item.badgeClass}`}>{item.label}</span>
                  <span className="text-lg font-semibold text-slate-100">{formatCurrency(item.originalTotal)}</span>
                  <span className="text-sm font-semibold text-slate-400">{item.count} 筆</span>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveArchiveSource("人工")}
            className={`rounded-3xl border bg-[linear-gradient(180deg,rgba(20,31,51,0.82),rgba(10,18,33,0.72))] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition ${activeArchiveSource === "人工" ? "border-sky-400/35 ring-2 ring-sky-400/20" : "border-white/10 hover:border-white/20"}`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 bg-white/[0.07] text-slate-200 ring-white/10">人工</span>
              <span className="text-lg font-semibold text-slate-100">{formatCurrency(additionalManualCostTotal)}</span>
              <span className="text-sm font-semibold text-slate-400">{manualItems.length} 筆</span>
            </div>
          </button>
        </div>

        {visibleReconciliationGroups.length ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-slate-50">對帳群組</h4>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-300">
                共 {visibleReconciliationGroups.length} 組
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {visibleReconciliationGroups.map((group) => (
                <div key={group.key} className={`rounded-2xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${isClosedView ? 'border-white/10 bg-[linear-gradient(180deg,rgba(26,40,66,0.76),rgba(11,18,32,0.7))]' : 'border-white/10 bg-[linear-gradient(180deg,rgba(20,31,51,0.8),rgba(10,18,33,0.72))]'}`}>
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${group.sourceType === '設計' ? 'bg-sky-400/14 text-sky-200 ring-sky-300/20' : group.sourceType === '備品' ? 'bg-amber-400/14 text-amber-200 ring-amber-300/20' : 'bg-violet-400/14 text-violet-200 ring-violet-300/20'}`}>{group.sourceType}</span>
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">{group.vendorName}</span>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${group.reconciliationStatus === '已對帳' ? 'bg-emerald-400/14 text-emerald-200 ring-emerald-300/20' : 'bg-rose-400/14 text-rose-200 ring-rose-300/20'}`}>{group.reconciliationStatus}</span>
                        <span className="text-xs font-medium text-slate-400">{group.itemCount} 筆資料來源</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">群組總額</span>
                        <span className="text-lg font-semibold tracking-tight text-slate-100">{formatCurrency(group.amountTotal)}</span>
                      </div>
                      {presenter.canConfirmReconciliationGroup ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmGroup(group.key)}
                          disabled={isGroupReconciled(group.reconciliationStatus) || reconciliationSyncingKey === group.key}
                          className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-500/18 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/24 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-slate-400"
                        >
                          {isGroupReconciled(group.reconciliationStatus)
                            ? '已對帳'
                            : reconciliationSyncingKey === group.key
                              ? '對帳中...'
                              : '確認對帳'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="pf-table-shell mt-3">
                    <table className="pf-table">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 font-medium">來源項目</th>
                          <th className="px-4 py-3 font-medium">來源摘要</th>
                          <th className="px-4 py-3 font-medium">廠商</th>
                          <th className="px-4 py-3 font-medium">金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(group.items ?? []).length ? (group.items ?? []).map((item) => (
                          <tr key={item.id}>
                            <td className="font-medium text-slate-100">{item.itemName}</td>
                            <td className="text-slate-300">{item.sourceRef || '-'}</td>
                            <td className="text-slate-300">{item.vendorName || '未指定廠商'}</td>
                            <td className="font-semibold text-slate-100">{formatCurrency(item.adjustedAmount)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-sm text-slate-400">目前沒有可顯示的對帳明細。</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-slate-50">• 項目明細</h4>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {presenter.canPersistManualCosts && activeArchiveSource === "人工" ? (
                <button
                  type="button"
                  onClick={handleSaveManualCosts}
                  disabled={!hasUnsavedManualChanges || isManualSyncing}
                  className="pf-btn-secondary px-4 py-2.5 disabled:bg-white/10 disabled:text-slate-500"
                >
                  {isManualSyncing ? "儲存中..." : "儲存人工新增費用"}
                </button>
              ) : null}
              {presenter.canCloseProject ? (
                <button
                  type="button"
                  onClick={handleCloseProject}
                  disabled={!canCloseProject || closeoutWriteState === 'submitting'}
                  className="pf-btn-create px-4 py-2.5 disabled:border-sky-400/20 disabled:bg-[linear-gradient(180deg,rgba(59,130,246,0.42),rgba(37,99,235,0.24))] disabled:text-white disabled:opacity-100"
                >
                  {closeoutWriteState === 'submitting' ? '結案中...' : '確認結案'}
                </button>
              ) : null}
              {isClosedView ? (
                <button
                  type="button"
                  onClick={handleReopenProject}
                  disabled={!canReopenProject}
                  className="pf-btn-secondary min-h-11 px-4 py-2.5 disabled:bg-white/10 disabled:text-slate-500"
                >
                  {closeoutWriteState === 'submitting' ? '處理中...' : '取消結案'}
                </button>
              ) : null}
            </div>
          </div>
          {presenter.canPersistManualCosts && activeArchiveSource === "人工" ? (
            <div className={`mb-4 text-xs ${manualSyncError ? "text-rose-300" : manualSyncSuccess ? "text-emerald-300" : hasUnsavedManualChanges ? "text-amber-300" : "text-slate-400"}`}>
              {manualSyncError
                ?? manualSyncSuccess
                ?? (isManualSyncing
                  ? "人工新增費用儲存中..."
                  : hasUnsavedManualChanges
                    ? "你目前有尚未儲存的人工新增費用;按下「儲存」後才會同步到 list / detail / closeout。"
                    : "目前人工新增費用已與正式資料同步。")}
            </div>
          ) : null}
          {presenter.canCloseProject && closeoutError ? (
            <div className="mb-4 text-xs text-rose-300">{closeoutError}</div>
          ) : null}
          <ArchiveContentPanel source={activeArchiveSource} costItems={state.costItems} manualItems={manualItems} isClosedView={isClosedView} onManualItemChange={handleManualItemChange} />
        </div>
      </CostManagementSection>
      <input
        ref={quoteImportInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleQuotationImport}
        disabled={isQuoteImporting}
      />
      {isQuoteDetailModalOpen ? (
        <QuoteDetailModal
          items={state.quotationItems}
          quoteImportRecord={quoteImportRecord}
          onClose={() => setIsQuoteDetailModalOpen(false)}
        />
      ) : null}
      {collectionForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.9),rgba(10,18,33,0.84))] p-6 shadow-[0_40px_120px_-46px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-semibold text-slate-50">新增收款</h3>
            <div className="mt-5 space-y-4">
              <Field label="收款日期"><input value={collectionForm.collectedOn} onChange={(event) => setCollectionForm((current) => current ? { ...current, collectedOn: event.target.value } : current)} className="pf-input h-11" /></Field>
              <Field label="收款金額"><input value={collectionForm.amount} onChange={(event) => setCollectionForm((current) => current ? { ...current, amount: event.target.value } : current)} inputMode="numeric" className="pf-input h-11" /></Field>
              <Field label="備註"><input value={collectionForm.note} onChange={(event) => setCollectionForm((current) => current ? { ...current, note: event.target.value } : current)} className="pf-input h-11" /></Field>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setCollectionForm(null)} className="pf-btn-secondary px-4 py-2.5">取消</button>
              <button type="button" onClick={handleAddCollectionRecord} className="pf-btn-primary px-4 py-2.5">建立收款</button>
            </div>
          </div>
        </div>
      ) : null}
      </AppShell>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1.5 text-sm font-semibold text-slate-300">{label}</p>{children}</div>;
}

function ArchiveContentPanel({
  source,
  costItems,
  manualItems,
  isClosedView,
  onManualItemChange,
}: {
  source: CostSourceType;
  costItems: CostLineItem[];
  manualItems: CostLineItem[];
  isClosedView: boolean;
  onManualItemChange: (itemId: string, field: "itemName" | "sourceRef" | "adjustedAmount", value: string) => void;
}) {
  if (source === "設計") {
    const rows = costItems
      .filter((item) => item.sourceType === "設計" && item.includedInCost)
      .map((item) => [item.itemName, item.sourceRef || '-', item.vendorName || '未指定廠商', formatCurrency(item.adjustedAmount)]);

    return <ArchiveTable title="" headers={["標題", "來源摘要", "執行廠商", "金額"]} rows={rows} emptyText="目前沒有設計正式成本項目。" />;
  }

  if (source === "備品") {
    const rows = costItems
      .filter((item) => item.sourceType === "備品" && item.includedInCost)
      .map((item) => [item.itemName, item.sourceRef || '-', item.vendorName || '未指定廠商', formatCurrency(item.adjustedAmount)]);

    return <ArchiveTable title="" headers={["標題", "來源摘要", "供應廠商", "金額"]} rows={rows} emptyText="目前沒有備品正式成本項目。" />;
  }

  if (source === "廠商") {
    const rows = costItems
      .filter((item) => item.sourceType === "廠商" && item.includedInCost)
      .map((item) => [item.vendorName || '未指定廠商', item.itemName, item.sourceRef || '-', formatCurrency(item.adjustedAmount)]);

    return <ArchiveTable title="" headers={["廠商", "標題", "需求內容", "金額"]} rows={rows} emptyText="目前沒有廠商正式成本項目。" />;
  }

  return <ManualArchiveTable manualItems={manualItems} isClosedView={isClosedView} onManualItemChange={onManualItemChange} />;
}

function ManualArchiveTable({
  manualItems,
  isClosedView,
  onManualItemChange,
}: {
  manualItems: CostLineItem[];
  isClosedView: boolean;
  onManualItemChange: (itemId: string, field: "itemName" | "sourceRef" | "adjustedAmount", value: string) => void;
}) {
  if (manualItems.length === 0) {
    return <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">目前尚未新增人工成本。</div>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {manualItems.map((item) => (
          <div key={item.id} className={`rounded-3xl border p-4 ${isClosedView ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))]" : "border-white/10 bg-white/[0.04]"}`}>
            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <div>
                <label className="text-xs font-medium text-slate-400">項目</label>
                <input value={item.itemName} onChange={(event) => onManualItemChange(item.id, "itemName", event.target.value)} readOnly={isClosedView} className="pf-input mt-2 h-11 px-3 read-only:bg-white/[0.03] read-only:text-slate-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">金額</label>
                <input type="number" value={item.adjustedAmount} onChange={(event) => onManualItemChange(item.id, "adjustedAmount", event.target.value)} readOnly={isClosedView} className="pf-input mt-2 h-11 px-3 read-only:bg-white/[0.03] read-only:text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchiveTable({ title, headers, rows, compact = false, emptyText = '目前沒有內容。' }: { title: string; headers: string[]; rows: string[][]; compact?: boolean; emptyText?: string }) {
  return (
    <div>
      {title ? <h5 className="text-base font-semibold text-slate-50">{title}</h5> : null}
      {rows.length ? (
        <div className={`${title ? 'mt-4 ' : ''}pf-table-shell`}>
          <table className="pf-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-medium whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className={`${compact ? "py-3" : "py-4"} ${cellIndex === 0 ? "font-semibold text-slate-100" : "text-slate-300"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">{emptyText}</div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, mode, highlight = false }: { title: string; value: string; mode: DetailMode; highlight?: boolean }) {
  const isClosedView = mode === "closed";
  return (
    <article className={`rounded-[32px] border p-5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px] ${isClosedView ? "border-white/10 bg-[linear-gradient(180deg,rgba(24,38,63,0.76),rgba(9,16,30,0.66))] text-slate-100" : highlight ? "border-sky-400/24 bg-[linear-gradient(180deg,rgba(8,47,73,0.9),rgba(15,23,42,0.92))] text-white" : "border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.76),rgba(10,18,33,0.66))] text-slate-100"}`}>
      <p className={`text-sm ${isClosedView ? "text-slate-400" : highlight ? "text-slate-300" : "text-slate-400"}`}>{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}

function StatusBadge({ label, value, toneClass }: { label: string; value: string; toneClass: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClass}`}>
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
