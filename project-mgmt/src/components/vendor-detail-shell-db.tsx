"use client";

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { formatCurrency, type VendorBasicProfile, type VendorProjectRecord } from '@/components/vendor-data';
import type { VendorPaymentRecord } from '@/lib/db/vendor-directory-adapter';

type VendorEditableForm = {
  tradeLabel: string;
  tradeLabels: string[];
  contactName: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  laborName: string;
  nationalId: string;
  birthDateRoc: string;
  unionMembership: string;
};

function buildVendorEditableForm(vendor: VendorBasicProfile): VendorEditableForm {
  return {
    tradeLabel: vendor.tradeLabel || '',
    tradeLabels: vendor.tradeLabels?.length ? vendor.tradeLabels : (vendor.tradeLabel ? vendor.tradeLabel.split(/\s*\/\s*/).map((item) => item.trim()).filter(Boolean) : []),
    contactName: vendor.contactName || '',
    phone: vendor.phone || '',
    email: vendor.email || '',
    lineId: vendor.lineId || '',
    address: vendor.address || '',
    bankName: vendor.bankName || '',
    accountName: vendor.accountName || '',
    accountNumber: vendor.accountNumber || '',
    laborName: (vendor as VendorBasicProfile & { laborName?: string }).laborName || '',
    nationalId: (vendor as VendorBasicProfile & { nationalId?: string }).nationalId || '',
    birthDateRoc: (vendor as VendorBasicProfile & { birthDateRoc?: string }).birthDateRoc || '',
    unionMembership: (vendor as VendorBasicProfile & { unionMembership?: string }).unionMembership || '',
  };
}

export function VendorDetailShellDb({ vendor, initialOpenRecords, tradeOptions = [] }: { vendor: VendorBasicProfile; initialOpenRecords: VendorProjectRecord[]; tradeOptions?: string[] }) {
  const [openRecords, setOpenRecords] = useState<VendorProjectRecord[]>(initialOpenRecords);
  const [historyRecords, setHistoryRecords] = useState<VendorProjectRecord[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [detailLoadingIds, setDetailLoadingIds] = useState<string[]>([]);

  const unpaidRecords = useMemo(
    () =>
      [...openRecords]
        .filter((record) => record.paymentStatus !== '已付款')
        .sort((a, b) => {
          if (a.hasUnreconciledGroups !== b.hasUnreconciledGroups) {
            return a.hasUnreconciledGroups ? -1 : 1;
          }
          return (b.unpaidAmount ?? b.adjustedCost) - (a.unpaidAmount ?? a.adjustedCost);
        }),
    [openRecords],
  );
  const unpaidTotalAmount = unpaidRecords.reduce((sum, record) => sum + (record.unpaidAmount ?? record.adjustedCost), 0);
  const incompleteReconciliationCount = unpaidRecords.filter((record) => record.reconciliationStatus === '尚未全部對帳').length;

  const [profileForm, setProfileForm] = useState<VendorEditableForm>(() => buildVendorEditableForm(vendor));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  const [historyTab, setHistoryTab] = useState<'open' | 'history'>('open');
  const [detailSectionTab, setDetailSectionTab] = useState<'unpaid' | 'history'>('unpaid');
  const [historyKeyword, setHistoryKeyword] = useState('');
  const [historySort, setHistorySort] = useState<'project-asc' | 'project-desc' | 'amount-desc' | 'amount-asc'>('project-asc');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [batchPaymentMessage, setBatchPaymentMessage] = useState('');
  const [batchPaying, setBatchPaying] = useState(false);
  const [paymentForm, setPaymentForm] = useState<{ projectId: string; projectName: string; paidOn: string; amount: string; note: string } | null>(null);
  const [profileExpanded, setProfileExpanded] = useState(false);

  const selectedPayableRecords = unpaidRecords.filter((record) => selectedRecordIds.includes(record.id));
  const selectedPayableTotal = selectedPayableRecords.reduce((sum, record) => sum + (record.unpaidAmount ?? record.adjustedCost), 0);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    console.log('[vendor-detail-client-nav]', JSON.stringify({
      vendorId: vendor.id,
      openRecordCount: initialOpenRecords.length,
      domContentLoadedMs: navigationEntry ? Number(navigationEntry.domContentLoadedEventEnd.toFixed(1)) : null,
      loadEventMs: navigationEntry ? Number(navigationEntry.loadEventEnd.toFixed(1)) : null,
      type: navigationEntry?.type ?? null,
    }));
  }, [initialOpenRecords.length, vendor.id]);

  const filteredHistoryRecords = useMemo(() => {
    const keyword = historyKeyword.trim().toLowerCase();
    const sourceRecords = historyTab === 'open' ? openRecords : (historyRecords ?? []);
    const next = sourceRecords.filter((record) => {
      const matchesTab = historyTab === 'open' ? record.paymentStatus !== '已付款' : record.paymentStatus === '已付款';
      if (!matchesTab) return false;
      if (!keyword) return true;
      return [record.projectName, record.reconciliationSummary, ...record.sourceItemDetails].join(' ').toLowerCase().includes(keyword);
    });

    next.sort((a, b) => {
      switch (historySort) {
        case 'project-desc':
          return b.projectName.localeCompare(a.projectName, 'zh-Hant');
        case 'amount-desc':
          return (b.unpaidAmount ?? b.adjustedCost) - (a.unpaidAmount ?? a.adjustedCost);
        case 'amount-asc':
          return (a.unpaidAmount ?? a.adjustedCost) - (b.unpaidAmount ?? b.adjustedCost);
        case 'project-asc':
        default:
          return a.projectName.localeCompare(b.projectName, 'zh-Hant');
      }
    });

    return next;
  }, [historyKeyword, historySort, historyTab, openRecords, historyRecords]);

  useEffect(() => {
    if (detailSectionTab !== 'history' || historyRecords !== null || historyLoading) return;

    let cancelled = false;
    const requestStartedAt = performance.now();
    setHistoryLoading(true);
    setHistoryError('');
    fetch(`/api/vendors/${vendor.id}/records?scope=history&includeDetails=false`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result?.ok || !Array.isArray(result?.records)) {
          throw new Error(result?.error ?? '載入往來紀錄失敗');
        }
        if (!cancelled) {
          console.log('[vendor-detail-client-history-fetch]', JSON.stringify({ vendorId: vendor.id, recordCount: result.records.length, totalMs: Number((performance.now() - requestStartedAt).toFixed(1)) }));
          setHistoryRecords(result.records as VendorProjectRecord[]);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setHistoryError(error instanceof Error ? error.message : '載入往來紀錄失敗');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [detailSectionTab, historyRecords, historyLoading, vendor.id]);

  function updateRecordCollection(record: VendorProjectRecord) {
    setOpenRecords((current) => current.map((item) => (item.id === record.id ? record : item)));
    setHistoryRecords((current) => (current ? current.map((item) => (item.id === record.id ? record : item)) : current));
  }

  async function ensureRecordDetails(record: VendorProjectRecord) {
    if (record.costBreakdown.length || detailLoadingIds.includes(record.id)) return;

    const requestStartedAt = performance.now();
    setDetailLoadingIds((current) => [...current, record.id]);
    try {
      const response = await fetch(`/api/vendors/${vendor.id}/records?recordId=${encodeURIComponent(record.id)}&includeDetails=true`);
      const result = await response.json();
      if (!response.ok || !result?.ok || !Array.isArray(result?.records) || !result.records[0]) {
        throw new Error(result?.error ?? '載入明細失敗');
      }
      console.log('[vendor-detail-client-record-fetch]', JSON.stringify({ vendorId: vendor.id, recordId: record.id, totalMs: Number((performance.now() - requestStartedAt).toFixed(1)) }));
      updateRecordCollection(result.records[0] as VendorProjectRecord);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '載入明細失敗');
    } finally {
      setDetailLoadingIds((current) => current.filter((id) => id !== record.id));
    }
  }

  function updateProfileField(field: keyof VendorEditableForm, value: string) {
    setProfileForm((current) => ({ ...current, [field]: value }));
    if (profileMessage) setProfileMessage('');
  }

  async function toggleExpandedRecord(record: VendorProjectRecord) {
    const id = record.id;
    const isExpanded = expandedRecordIds.includes(id);
    if (isExpanded) {
      setExpandedRecordIds((current) => current.filter((item) => item !== id));
      return;
    }

    setExpandedRecordIds((current) => [...current, id]);
    await ensureRecordDetails(record);
  }

  function toggleSelectableRecord(record: VendorProjectRecord) {
    if (record.hasUnreconciledGroups) {
      setBatchPaymentMessage('尚未全部對帳的專案不可勾選已付款，請先完成全部對帳。');
      return;
    }
    setBatchPaymentMessage('');
    setSelectedRecordIds((current) => (current.includes(record.id) ? current.filter((item) => item !== record.id) : [...current, record.id]));
  }

  async function createPaymentRecord(input: { projectId: string; paidOn: string; amount: number; note: string }) {
    const response = await fetch(`/api/vendors/${vendor.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const result = await response.json();
    if (!response.ok || !result?.ok || !result?.id) {
      throw new Error(result?.error ?? '新增付款失敗');
    }
    return {
      id: result.id as string,
      projectId: input.projectId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      paidOn: input.paidOn,
      amount: input.amount,
      note: input.note,
    } satisfies VendorPaymentRecord;
  }

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileMessage('');
    const response = await fetch(`/api/vendors/${vendor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...profileForm,
        tradeLabel: profileForm.tradeLabels.length ? profileForm.tradeLabels.join(' / ') : profileForm.tradeLabel,
      }),
    });
    const result = await response.json();
    setProfileSaving(false);
    if (!response.ok || !result?.ok) {
      window.alert(result?.error ?? '儲存廠商資料失敗');
      return;
    }
    setProfileMessage('已儲存，頁面即將重新整理以顯示最新資料。');
    window.location.reload();
  }

  async function handleCreatePayment() {
    if (!paymentForm) return;
    const amount = Number(paymentForm.amount);
    if (!paymentForm.projectId || !paymentForm.paidOn || Number.isNaN(amount) || amount <= 0) return;

    try {
      const createdPayment = await createPaymentRecord({
        projectId: paymentForm.projectId,
        paidOn: paymentForm.paidOn,
        amount,
        note: paymentForm.note,
      });
      void createdPayment;
      window.location.reload();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '新增付款失敗');
    }
  }

  async function handleBatchMarkPaid() {
    if (!selectedPayableRecords.length || batchPaying) return;
    setBatchPaying(true);
    setBatchPaymentMessage('');

    try {
      const paidOn = new Date().toISOString().slice(0, 10);
      const createdPayments: VendorPaymentRecord[] = [];
      for (const record of selectedPayableRecords) {
        if (record.hasUnreconciledGroups) {
          throw new Error(`「${record.projectName}」尚未全部對帳，不能標記為已付款。`);
        }
        const amount = record.unpaidAmount ?? record.adjustedCost;
        const createdPayment = await createPaymentRecord({
          projectId: record.projectId,
          paidOn,
          amount,
          note: '批次標記為已付款',
        });
        createdPayments.push(createdPayment);
      }
      setSelectedRecordIds([]);
      setBatchPaymentMessage(`已完成 ${createdPayments.length} 筆已付款標記。`);
      window.location.reload();
    } catch (error) {
      setBatchPaymentMessage(error instanceof Error ? error.message : '批次標記已付款失敗');
    } finally {
      setBatchPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="p-1">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.45)]">{vendor.name}</h2>
              {(vendor.tradeLabels?.length ? vendor.tradeLabels : [vendor.tradeLabel || vendor.category || '—']).map((trade) => (
                <span key={`${vendor.id}-${trade}`} className="inline-flex rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">{trade}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setProfileExpanded((current) => !current)}
              className="pf-btn-secondary px-5 py-3"
            >
              {profileExpanded ? '收合廠商資訊' : '展開廠商資訊'}
            </button>
            <Link href="/vendors" className="pf-btn-secondary px-5 py-3">返回廠商列表</Link>
          </div>
        </div>

        {profileExpanded ? (
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">• 廠商資訊</h3>
              </div>
              <div className="flex items-center gap-3">
                {profileMessage ? <p className="text-xs text-emerald-300">{profileMessage}</p> : null}
                <button type="button" onClick={handleSaveProfile} disabled={profileSaving} className="pf-btn-create px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-60">{profileSaving ? '儲存中…' : '儲存'}</button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:col-span-2">
                <p className="text-sm text-slate-400">工種（可複選）</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tradeOptions.map((trade) => {
                    const active = profileForm.tradeLabels.includes(trade);
                    return (
                      <button
                        key={trade}
                        type="button"
                        onClick={() => setProfileForm((current) => ({
                          ...current,
                          tradeLabel: trade,
                          tradeLabels: active
                            ? current.tradeLabels.filter((item) => item !== trade)
                            : [...current.tradeLabels, trade],
                        }))}
                        className={`pf-pill px-3 py-2 ${active ? 'pf-pill-active text-white' : 'pf-pill-muted'}`}
                      >
                        {trade}
                      </button>
                    );
                  })}
                </div>
              </div>
              {[
                ['聯絡人', 'contactName', '請輸入聯絡人'],
                ['電話', 'phone', '請輸入電話'],
                ['Email', 'email', '請輸入 Email'],
                ['LINE', 'lineId', '請輸入 LINE'],
                ['地址', 'address', '請輸入地址'],
                ['銀行', 'bankName', '請輸入銀行名稱'],
                ['戶名', 'accountName', '請輸入戶名'],
                ['帳號', 'accountNumber', '請輸入帳號'],
              ].map(([label, field, placeholder]) => (
                <label key={String(field)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                  <p className="text-sm text-slate-400">{label}</p>
                  <input value={profileForm[field as keyof VendorEditableForm]} onChange={(event) => updateProfileField(field as keyof VendorEditableForm, event.target.value)} placeholder={String(placeholder)} className="pf-input mt-2 h-11" />
                </label>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <h4 className="text-base font-semibold text-slate-100">勞報資訊</h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  ['勞報姓名', 'laborName', '請輸入勞報姓名'],
                  ['身分證字號', 'nationalId', '請輸入身分證字號'],
                  ['出生年月日（民國）', 'birthDateRoc', '例如：78/05/21'],
                  ['參加工會', 'unionMembership', '請輸入公會或會員資訊'],
                ].map(([label, field, placeholder]) => (
                  <label key={String(field)} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-sm text-slate-400">{label}</p>
                    <input value={profileForm[field as keyof VendorEditableForm]} onChange={(event) => updateProfileField(field as keyof VendorEditableForm, event.target.value)} placeholder={String(placeholder)} className="pf-input mt-2 h-11" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <section className="space-y-6">

        <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1">
          <button
            type="button"
            onClick={() => setDetailSectionTab('unpaid')}
            className={`pf-pill inline-flex h-10 items-center justify-center px-4 text-sm ${detailSectionTab === 'unpaid' ? 'pf-pill-active text-white' : 'pf-pill-muted'}`}
          >
            未付款專案
          </button>
          <button
            type="button"
            onClick={() => setDetailSectionTab('history')}
            className={`pf-pill inline-flex h-10 items-center justify-center px-4 text-sm ${detailSectionTab === 'history' ? 'pf-pill-active text-white' : 'pf-pill-muted'}`}
          >
            往來紀錄
          </button>
        </div>

        {detailSectionTab === 'unpaid' ? (
      <article className="p-1">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-100">• 未付款專案</h3>
            </div>
            <div className="min-w-[320px] rounded-2xl bg-white/[0.05] px-5 py-3 text-sm text-slate-300 ring-1 ring-white/10 lg:min-w-[380px]">
              <p className="whitespace-nowrap font-semibold text-slate-100">待付款 {unpaidRecords.length} 筆｜未付款總額 {formatCurrency(unpaidTotalAmount)}</p>
              <p className="mt-1 whitespace-nowrap text-slate-400">其中 {incompleteReconciliationCount} 筆尚未全部對帳。</p>
            </div>
          </div>

          {batchPaymentMessage ? (
            <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${batchPaymentMessage.includes('已完成') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
              {batchPaymentMessage}
            </div>
          ) : null}

          <div className="pf-table-shell rounded-2xl">
            {unpaidRecords.length ? (
              <table className="pf-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-medium">勾選</th>
                    <th className="px-4 py-3 font-medium">專案名稱</th>
                    <th className="px-4 py-3 font-medium">對帳狀態</th>
                    <th className="px-4 py-3 font-medium">累計未付金額</th>
                    <th className="px-4 py-3 font-medium">對帳摘要</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidRecords.map((record) => {
                    const isSelectable = !record.hasUnreconciledGroups;
                    const isSelected = selectedRecordIds.includes(record.id);
                    const isExpanded = expandedRecordIds.includes(record.id);
                    const isDetailLoading = detailLoadingIds.includes(record.id);
                    return (
                      <Fragment key={record.id}>
                        <tr>
                          <td className="px-4 py-4 align-top">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isSelectable}
                              onChange={() => toggleSelectableRecord(record)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-4 align-top font-medium text-slate-900">{record.projectName}</td>
                          <td className="px-4 py-4 align-top">
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold leading-tight text-center ring-1 ${getVendorReconciliationStatusClass(record)}`}>{record.reconciliationStatus}</span>
                          </td>
                          <td className="px-4 py-4 align-top font-semibold text-slate-900">{formatCurrency(record.unpaidAmount ?? record.adjustedCost)}</td>
                          <td className="px-4 py-4 align-top text-slate-600">
                            <div>{record.reconciliationSummary}</div>
                            {record.reconciliationWarning ? (
                              <div className="mt-2 text-xs text-amber-700">{record.reconciliationWarning}</div>
                            ) : null}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <button
                              type="button"
                              onClick={() => toggleExpandedRecord(record)}
                              className="pf-btn-secondary px-3 py-2 text-sm"
                            >
                              {isExpanded ? (isDetailLoading ? '載入明細中…' : '收合明細') : '查看明細'}
                            </button>
                          </td>
                        </tr>
                      {isExpanded ? (
                        <tr key={`${record.id}-detail`}>
                          <td colSpan={6} className="px-4 py-4 bg-white/[0.03]">
                            {isDetailLoading ? (
                              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] px-4 py-6 text-sm text-slate-400">明細載入中…</div>
                            ) : (
                              <div className="grid gap-4 xl:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                                  <h4 className="text-lg font-semibold text-slate-100">成本明細</h4>
                                  <div className="mt-3 space-y-3">
                                    {record.costBreakdown.map((item, index) => (
                                      <div key={`${record.id}-cost-${index}-${item.label}-${item.amount}`} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="font-medium text-slate-100">{item.amount}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                                  <h4 className="text-lg font-semibold text-slate-100">發包內容明細</h4>
                                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                    {record.sourceItemDetails.map((item, index) => (
                                      <li key={`${record.id}-source-${index}-${item}`} className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">• {item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : <div className="px-5 py-6 text-sm text-slate-500">目前沒有待付款專案。</div>}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold">已勾選 {selectedPayableRecords.length} 筆，合計 {formatCurrency(selectedPayableTotal)}</p>

            </div>
            <button
              type="button"
              onClick={handleBatchMarkPaid}
              disabled={!selectedPayableRecords.length || batchPaying}
              className="pf-btn-primary min-h-11 px-5 py-3 disabled:border-sky-400/20 disabled:bg-[linear-gradient(180deg,rgba(37,99,235,0.92),rgba(29,78,216,0.84))] disabled:text-white disabled:opacity-100"
            >
              {batchPaying ? '處理中…' : '標記為已付款'}
            </button>
          </div>
        </article>
        ) : null}

        {detailSectionTab === 'history' ? (
      <article className="p-1">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-100">• 往來紀錄</h3>
            <button
              type="button"
              onClick={() => setHistoryTab('open')}
              className={`pf-pill inline-flex h-10 items-center justify-center px-4 text-sm ${historyTab === 'open' ? 'pf-pill-active text-white' : 'pf-pill-muted'}`}
            >
              未結帳
            </button>
            <button
              type="button"
              onClick={() => setHistoryTab('history')}
              className={`pf-pill inline-flex h-10 items-center justify-center px-4 text-sm ${historyTab === 'history' ? 'pf-pill-active text-white' : 'pf-pill-muted'}`}
            >
              過往紀錄
            </button>
            <label className="min-w-[260px] flex-1 lg:max-w-md">
              <input type="search" value={historyKeyword} onChange={(event) => setHistoryKeyword(event.target.value)} placeholder="搜尋專案名稱、摘要或發包內容" className="pf-input h-10 w-full" />
            </label>
            <label className="block w-[220px]">
              <select value={historySort} onChange={(event) => setHistorySort(event.target.value as typeof historySort)} className="pf-select h-10 w-full">
                <option value="project-asc">專案名稱 A → Z</option>
                <option value="project-desc">專案名稱 Z → A</option>
                <option value="amount-desc">未付款金額高 → 低</option>
                <option value="amount-asc">未付款金額低 → 高</option>
              </select>
            </label>
          </div>
          <div className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-slate-300 ring-1 ring-white/10">
            目前顯示 {filteredHistoryRecords.length} 筆往來紀錄
          </div>
        </div>

        <div className="space-y-4">
          {historyLoading && historyTab === 'history' ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] px-5 py-6 text-sm text-slate-400">往來紀錄載入中…</div> : null}
          {historyError && historyTab === 'history' ? <div className="rounded-2xl border border-rose-400/20 bg-rose-950/20 px-5 py-6 text-sm text-rose-200">{historyError}</div> : null}
          {(!historyLoading || historyTab === 'open') && filteredHistoryRecords.length ? filteredHistoryRecords.map((record) => {
            const isExpanded = expandedRecordIds.includes(record.id);
            const isDetailLoading = detailLoadingIds.includes(record.id);
            return (
              <div key={record.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="flex h-8 items-center text-lg font-semibold text-slate-100">{record.projectName}</h4>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{record.reconciliationSummary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                    <div className="text-left xl:text-right">
                      <p className="text-sm text-slate-400">未付金額</p>
                      <p className="text-2xl font-semibold tracking-tight text-slate-100">{formatCurrency(record.unpaidAmount ?? record.adjustedCost)}</p>
                    </div>
                    <button type="button" onClick={() => toggleExpandedRecord(record)} className="pf-btn-secondary px-4 py-2.5">{isExpanded ? (isDetailLoading ? '載入明細中…' : '收合明細') : '查看明細'}</button>
                  </div>
                </div>
                {isExpanded ? (
                  isDetailLoading ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.04] px-4 py-6 text-sm text-slate-400">明細載入中…</div>
                  ) : (
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                        <h4 className="text-lg font-semibold text-slate-100">成本明細</h4>
                        <div className="mt-3 space-y-3">
                          {record.costBreakdown.map((item, index) => (
                            <div key={`${record.id}-history-cost-${index}-${item.label}-${item.amount}`} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-slate-400">{item.label}</span>
                              <span className="font-medium text-slate-100">{item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                        <h4 className="text-lg font-semibold text-slate-100">發包內容明細</h4>
                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                          {record.sourceItemDetails.map((item, index) => (
                            <li key={`${record.id}-history-source-${index}-${item}`} className="rounded-2xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                ) : null}

              </div>
            );
          }) : <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] px-5 py-6 text-sm text-slate-400">目前沒有符合條件的往來紀錄。</div>}
        </div>
      </article>
        ) : null}
      </div>
      </section>

      {paymentForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">登記付款</h3>
            <p className="mt-2 text-sm text-slate-500">{paymentForm.projectName}</p>
            <div className="mt-5 space-y-4">
              <Field label="付款日期"><input value={paymentForm.paidOn} onChange={(event) => setPaymentForm((current) => current ? { ...current, paidOn: event.target.value } : current)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></Field>
              <Field label="付款金額"><input value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => current ? { ...current, amount: event.target.value } : current)} inputMode="numeric" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></Field>
              <Field label="備註"><input value={paymentForm.note} onChange={(event) => setPaymentForm((current) => current ? { ...current, note: event.target.value } : current)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></Field>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setPaymentForm(null)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">取消</button>
              <button type="button" onClick={handleCreatePayment} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">建立付款</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getVendorReconciliationStatusClass(record: VendorProjectRecord) {
  return record.reconciliationStatus === '尚未全部對帳'
    ? 'bg-amber-50 text-amber-700 ring-amber-200'
    : 'bg-emerald-50 text-emerald-700 ring-emerald-200';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>{children}</div>;
}
