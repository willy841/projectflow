"use client";

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
  type CostLineItem,
  type CostSourceType,
} from "@/components/quote-cost-data";
import { getQuoteCostDetailPresenter, type QuoteCostDetailPresenter } from "@/components/quote-cost-detail-presenter";
import {
  ActiveOnlyFinancialSections,
  CollectionSection,
  CostManagementSection,
  getCostSourceSummary,
  type CollectionRecordView,
  type ReconciliationGroupView,
  type VendorPaymentView,
  QuoteCostHeader,
  SimpleSectionTitle,
} from "@/components/quote-cost-detail-sections";

type DetailMode = "active" | "closed";

function normalizeGroupStatus(groups: ReconciliationGroupView[]): '未開始' | '待確認' | '已完成' {
  if (!groups.length) return '未開始';
  const reconciledCount = groups.filter((group) => group.reconciliationStatus === '已對帳').length;
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
  const quoteImportRecord = state.quotationImport;
  const isClosedView = presenter.archived;

  const quotationTotal = useMemo(() => getQuotationTotal(state.quotationItems), [state.quotationItems]);
  const collectedTotal = useMemo(() => collectionRecords.reduce((sum, record) => sum + record.amount, 0), [collectionRecords]);
  const outstandingTotal = useMemo(() => Math.max(quotationTotal - collectedTotal, 0), [quotationTotal, collectedTotal]);
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

  const canCloseProject = state.quotationImported && outstandingTotal === 0 && derivedReconciliationStatus === "已完成";
  const canReopenProject = isClosedView && closeoutWriteState !== 'submitting';
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
      router.push(`/closeout/${state.id}`);
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

      setState((prev) => ({ ...prev, projectStatus: '執行中', closeStatus: '執行中' }));
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
      <AppShell activePath={presenter.activePath}>
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

      <CollectionSection
        presenter={presenter}
        eventDate={state.eventDate}
        collectionRecords={collectionRecords}
        onCreate={() => setCollectionForm({ collectedOn: state.eventDate, amount: '', note: '' })}
        onDelete={handleDeleteCollectionRecord}
      />

      {!isClosedView ? (
        <ActiveOnlyFinancialSections
          quoteImportRecord={quoteImportRecord}
          quotationItems={state.quotationItems}
          vendorPaymentRecords={vendorPaymentRecords}
        />
      ) : null}

      <CostManagementSection archived={isClosedView}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SimpleSectionTitle title="成本管理" />
          <div className="flex flex-wrap gap-2">
            {presenter.canAddManualCost && (
              <button
                type="button"
                onClick={handleAddManualCost}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                + 新增人工成本
              </button>
            )}
            {presenter.canConfirmReconciliationGroup && reconciliationGroups.length === 0 ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded-2xl bg-slate-300 px-4 py-2.5 text-sm font-semibold text-white"
              >
                尚無可對帳群組
              </button>
            ) : null}
            {isClosedView && (
              <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
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
                className={`rounded-3xl border bg-white p-4 text-left transition ${isActiveArchiveSource ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${item.badgeClass}`}>{item.label}</span>
                  <span className="text-lg font-semibold text-slate-900">{formatCurrency(item.originalTotal)}</span>
                  <span className="text-sm font-semibold text-slate-600">{item.count} 筆</span>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveArchiveSource("人工")}
            className={`rounded-3xl border bg-white p-4 text-left transition ${activeArchiveSource === "人工" ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"}`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 bg-slate-100 text-slate-700 ring-slate-200">人工</span>
              <span className="text-lg font-semibold text-slate-900">{formatCurrency(additionalManualCostTotal)}</span>
              <span className="text-sm font-semibold text-slate-600">{manualItems.length} 筆</span>
            </div>
          </button>
        </div>

        {reconciliationGroups.length ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">對帳群組</h4>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                共 {reconciliationGroups.length} 組
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {reconciliationGroups.map((group) => (
                <div key={group.key} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{group.sourceType}</span>
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{group.vendorName}</span>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${group.reconciliationStatus === '已對帳' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>{group.reconciliationStatus}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{group.itemCount} 筆來源項目</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 xl:items-end">
                      <div className="text-left xl:text-right">
                        <p className="text-sm text-slate-500">群組金額總額</p>
                        <p className="text-2xl font-semibold tracking-tight text-slate-900">{formatCurrency(group.amountTotal)}</p>
                      </div>
                      {presenter.canConfirmReconciliationGroup ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmGroup(group.key)}
                          disabled={group.reconciliationStatus === '已對帳' || reconciliationSyncingKey === group.key}
                          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {group.reconciliationStatus === '已對帳'
                            ? '已對帳'
                            : reconciliationSyncingKey === group.key
                              ? '對帳中...'
                              : '確認對帳'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">來源項目</th>
                          <th className="px-4 py-3 font-medium">來源摘要</th>
                          <th className="px-4 py-3 font-medium">廠商</th>
                          <th className="px-4 py-3 font-medium">金額</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(group.items ?? []).length ? (group.items ?? []).map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">{item.itemName}</td>
                            <td className="px-4 py-3 text-slate-600">{item.sourceRef || '-'}</td>
                            <td className="px-4 py-3 text-slate-600">{item.vendorName || '未指定廠商'}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(item.adjustedAmount)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-sm text-slate-500">目前沒有可顯示的對帳明細。</td>
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

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h4 className="text-lg font-semibold text-slate-900">成本明細</h4>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {presenter.canPersistManualCosts && activeArchiveSource === "人工" ? (
                <button
                  type="button"
                  onClick={handleSaveManualCosts}
                  disabled={!hasUnsavedManualChanges || isManualSyncing}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {isManualSyncing ? "儲存中..." : "儲存人工新增費用"}
                </button>
              ) : null}
              {presenter.canCloseProject ? (
                <button
                  type="button"
                  onClick={handleCloseProject}
                  disabled={!canCloseProject || closeoutWriteState === 'submitting'}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {closeoutWriteState === 'submitting' ? '結案中...' : '確認結案'}
                </button>
              ) : null}
              {isClosedView ? (
                <button
                  type="button"
                  onClick={handleReopenProject}
                  disabled={!canReopenProject}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {closeoutWriteState === 'submitting' ? '處理中...' : '取消結案'}
                </button>
              ) : null}
            </div>
          </div>
          {presenter.canPersistManualCosts && activeArchiveSource === "人工" ? (
            <div className={`mb-4 text-xs ${manualSyncError ? "text-rose-600" : manualSyncSuccess ? "text-emerald-600" : hasUnsavedManualChanges ? "text-amber-600" : "text-slate-400"}`}>
              {manualSyncError
                ?? manualSyncSuccess
                ?? (isManualSyncing
                  ? "人工新增費用儲存中..."
                  : hasUnsavedManualChanges
                    ? "你目前有尚未儲存的人工新增費用;按下「儲存」後才會同步到 list / detail / closeout。"
                    : "目前人工新增費用已與正式資料同步。")}
            </div>
          ) : null}
          {presenter.canCloseProject ? (
            <div className={`mb-4 text-xs ${closeoutError ? 'text-rose-600' : canCloseProject ? 'text-emerald-600' : 'text-amber-600'}`}>
              {closeoutError
                ?? (canCloseProject
                  ? '已符合結案條件:未收款 = 0 且全部對帳完畢。'
                  : `尚未符合結案條件:目前未收款 ${formatCurrency(outstandingTotal)},對帳狀態 ${derivedReconciliationStatus}。`)}
            </div>
          ) : null}
          <ArchiveContentPanel source={activeArchiveSource} costItems={state.costItems} manualItems={manualItems} isClosedView={isClosedView} onManualItemChange={handleManualItemChange} />
        </div>
      </CostManagementSection>
      {collectionForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">新增收款</h3>
            <div className="mt-5 space-y-4">
              <Field label="收款日期"><input value={collectionForm.collectedOn} onChange={(event) => setCollectionForm((current) => current ? { ...current, collectedOn: event.target.value } : current)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></Field>
              <Field label="收款金額"><input value={collectionForm.amount} onChange={(event) => setCollectionForm((current) => current ? { ...current, amount: event.target.value } : current)} inputMode="numeric" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></Field>
              <Field label="備註"><input value={collectionForm.note} onChange={(event) => setCollectionForm((current) => current ? { ...current, note: event.target.value } : current)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></Field>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setCollectionForm(null)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">取消</button>
              <button type="button" onClick={handleAddCollectionRecord} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">建立收款</button>
            </div>
          </div>
        </div>
      ) : null}
      </AppShell>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>{children}</div>;
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

    return <ArchiveTable title="設計最終留存內容" headers={["標題", "來源摘要", "執行廠商", "金額"]} rows={rows} emptyText="目前沒有設計正式成本項目。" />;
  }

  if (source === "備品") {
    const rows = costItems
      .filter((item) => item.sourceType === "備品" && item.includedInCost)
      .map((item) => [item.itemName, item.sourceRef || '-', item.vendorName || '未指定廠商', formatCurrency(item.adjustedAmount)]);

    return <ArchiveTable title="備品最終留存內容" headers={["標題", "來源摘要", "供應廠商", "金額"]} rows={rows} emptyText="目前沒有備品正式成本項目。" />;
  }

  if (source === "廠商") {
    const rows = costItems
      .filter((item) => item.sourceType === "廠商" && item.includedInCost)
      .map((item) => [item.vendorName || '未指定廠商', item.itemName, item.sourceRef || '-', formatCurrency(item.adjustedAmount)]);

    return <ArchiveTable title="廠商最終留存內容" headers={["廠商", "標題", "需求內容", "金額"]} rows={rows} emptyText="目前沒有廠商正式成本項目。" />;
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
    return <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">目前尚未新增人工成本。</div>;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h5 className="text-base font-semibold text-slate-900">人工最終留存內容</h5>
      <div className="mt-4 space-y-3">
        {manualItems.map((item) => (
          <div key={item.id} className={`rounded-2xl border p-4 ${isClosedView ? "border-slate-200 bg-slate-50/80" : "border-slate-200 bg-slate-50/50"}`}>
            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <div>
                <label className="text-xs font-medium text-slate-500">項目</label>
                <input value={item.itemName} onChange={(event) => onManualItemChange(item.id, "itemName", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">金額</label>
                <input type="number" value={item.adjustedAmount} onChange={(event) => onManualItemChange(item.id, "adjustedAmount", event.target.value)} readOnly={isClosedView} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 read-only:bg-slate-50 read-only:text-slate-600" />
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h5 className="text-base font-semibold text-slate-900">{title}</h5>
      {rows.length ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-medium whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className={`px-4 ${compact ? "py-3" : "py-4"} ${cellIndex === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">{emptyText}</div>
      )}
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

function StatusBadge({ label, value, toneClass }: { label: string; value: string; toneClass: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClass}`}>
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
