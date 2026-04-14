"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatCurrency, getVendorPaymentStatusClass, type VendorBasicProfile, type VendorProjectRecord } from '@/components/vendor-data';
import type { VendorPaymentRecord } from '@/lib/db/vendor-directory-adapter';

type VendorEditableForm = {
  tradeLabel: string;
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

export function VendorDetailShellDb({ vendor, records, paymentRecords }: { vendor: VendorBasicProfile; records: VendorProjectRecord[]; paymentRecords: VendorPaymentRecord[] }) {
  const unpaidRecords = records.filter((record) => record.paymentStatus !== '已付款');
  const totalOutstanding = unpaidRecords.reduce((sum, record) => sum + (record.unpaidAmount ?? record.adjustedCost), 0);
  const [profileForm, setProfileForm] = useState<VendorEditableForm>(() => buildVendorEditableForm(vendor));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  const [historyKeyword, setHistoryKeyword] = useState('');
  const [historySort, setHistorySort] = useState<'project-asc' | 'project-desc' | 'amount-desc' | 'amount-asc'>('project-asc');
  const [paymentForm, setPaymentForm] = useState<{ projectId: string; projectName: string; paidOn: string; amount: string; note: string } | null>(null);
  const [payments, setPayments] = useState<VendorPaymentRecord[]>(paymentRecords);

  const paymentMap = useMemo(() => {
    const map = new Map<string, VendorPaymentRecord[]>();
    for (const record of payments) {
      const current = map.get(record.projectId) ?? [];
      current.push(record);
      map.set(record.projectId, current);
    }
    return map;
  }, [payments]);

  const filteredHistoryRecords = useMemo(() => {
    const keyword = historyKeyword.trim().toLowerCase();
    const next = records.filter((record) => {
      if (!keyword) return true;
      return [record.projectName, record.payableSummary, ...record.sourceItemDetails].join(' ').toLowerCase().includes(keyword);
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
  }, [historyKeyword, historySort, records]);

  function updateProfileField(field: keyof VendorEditableForm, value: string) {
    setProfileForm((current) => ({ ...current, [field]: value }));
    if (profileMessage) setProfileMessage('');
  }

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileMessage('');
    const response = await fetch(`/api/vendors/${vendor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    const result = await response.json();
    setProfileSaving(false);
    if (!response.ok || !result?.ok) {
      window.alert(result?.error ?? '儲存廠商資料失敗');
      return;
    }
    setProfileMessage('已儲存，重新整理後已從 DB readback。');
    window.location.reload();
  }

  function toggleExpandedRecord(id: string) {
    setExpandedRecordIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function handleCreatePayment() {
    if (!paymentForm) return;
    const amount = Number(paymentForm.amount);
    if (!paymentForm.projectId || !paymentForm.paidOn || Number.isNaN(amount) || amount <= 0) return;
    const response = await fetch(`/api/vendors/${vendor.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: paymentForm.projectId,
        paidOn: paymentForm.paidOn,
        amount,
        note: paymentForm.note,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result?.ok || !result?.id) {
      window.alert(result?.error ?? '新增付款失敗');
      return;
    }
    setPayments((current) => [
      { id: result.id, projectId: paymentForm.projectId, vendorId: vendor.id, vendorName: vendor.name, paidOn: paymentForm.paidOn, amount, note: paymentForm.note },
      ...current,
    ]);
    window.location.reload();
  }

  async function handleDeletePayment(id: string) {
    const confirmed = window.confirm('確認刪除這筆付款紀錄？');
    if (!confirmed) return;
    const response = await fetch(`/api/vendor-payments/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok || !result?.ok) {
      window.alert(result?.error ?? '刪除付款失敗');
      return;
    }
    setPayments((current) => current.filter((item) => item.id !== id));
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{vendor.name}</h2>
              <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">{vendor.tradeLabel || vendor.category || '待補充'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/vendors" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">返回廠商列表</Link>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">廠商資訊</h3>
              <p className="mt-2 text-sm text-slate-600">這裡現在已改為 Vendor master DB 寫入入口，儲存後會重新從 DB readback。</p>
            </div>
            <div className="flex items-center gap-3">
              {profileMessage ? <p className="text-xs text-emerald-700">{profileMessage}</p> : null}
              <button type="button" onClick={handleSaveProfile} disabled={profileSaving} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{profileSaving ? '儲存中…' : '儲存廠商資料'}</button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['工種', 'tradeLabel', '請輸入工種，例如：輸出'],
              ['聯絡人', 'contactName', '請輸入聯絡人'],
              ['電話', 'phone', '請輸入電話'],
              ['Email', 'email', '請輸入 Email'],
              ['LINE', 'lineId', '請輸入 LINE'],
              ['地址', 'address', '請輸入地址'],
              ['銀行', 'bankName', '請輸入銀行名稱'],
              ['戶名', 'accountName', '請輸入戶名'],
              ['帳號', 'accountNumber', '請輸入帳號'],
            ].map(([label, field, placeholder]) => (
              <label key={String(field)} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <input value={profileForm[field as keyof VendorEditableForm]} onChange={(event) => updateProfileField(field as keyof VendorEditableForm, event.target.value)} placeholder={String(placeholder)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
              </label>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
            <h4 className="text-base font-semibold text-slate-900">勞報資訊</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ['勞報姓名', 'laborName', '請輸入勞報姓名'],
                ['身分證字號', 'nationalId', '請輸入身分證字號'],
                ['出生年月日（民國）', 'birthDateRoc', '例如：78/05/21'],
                ['參加工會', 'unionMembership', '請輸入公會或會員資訊'],
              ].map(([label, field, placeholder]) => (
                <label key={String(field)} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{label}</p>
                  <input value={profileForm[field as keyof VendorEditableForm]} onChange={(event) => updateProfileField(field as keyof VendorEditableForm, event.target.value)} placeholder={String(placeholder)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                </label>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm ring-1 ring-amber-100">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-slate-900">未付款專案</h3>
            <p className="mt-2 text-sm text-slate-600">這裡顯示目前仍有未付款餘額的專案。付款狀態依付款紀錄聚合得出；若尚未全部對帳，warning 仍會保留。</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-amber-200"><p className="font-semibold text-slate-900">未付款總額 {formatCurrency(totalOutstanding)}</p></div>
          <div className="mt-4 space-y-3">
            {unpaidRecords.length ? unpaidRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-amber-200 bg-white p-4 ring-1 ring-amber-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{record.projectName}</p>
                    <p className="mt-1 text-sm text-slate-500">{record.payableSummary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{record.projectStatus}</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(record.paymentStatus)}`}>{record.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">未付款餘額</p>
                    <p className="text-xl font-semibold text-slate-900">{formatCurrency(record.unpaidAmount ?? record.adjustedCost)}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between"><span>目前應付</span><span className="font-medium text-slate-900">{record.adjustedCostLabel}</span></div>
                  <div className="flex items-center justify-between"><span>已付款</span><span className="font-medium text-slate-900">{formatCurrency(record.paidAmount ?? 0)}</span></div>
                </div>
                {record.reconciliationWarning ? <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{record.reconciliationWarning}</div> : null}
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={() => setPaymentForm({ projectId: record.projectId, projectName: record.projectName, paidOn: record.projectStatus === '已結案' ? '' : new Date().toISOString().slice(0, 10), amount: String(record.unpaidAmount ?? record.adjustedCost), note: '' })} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">登記付款</button>
                </div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-amber-300 bg-white px-5 py-6 text-sm text-slate-500">目前沒有未付款專案。</div>}
          </div>
        </article>
      </section>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">付款紀錄</h3>
        </div>
        <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">搜尋付款/歷史紀錄</span>
            <input type="search" value={historyKeyword} onChange={(event) => setHistoryKeyword(event.target.value)} placeholder="搜尋專案名稱、摘要或發包內容" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">排序方式</span>
            <select value={historySort} onChange={(event) => setHistorySort(event.target.value as typeof historySort)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400">
              <option value="project-asc">專案名稱 A → Z</option>
              <option value="project-desc">專案名稱 Z → A</option>
              <option value="amount-desc">未付款金額高 → 低</option>
              <option value="amount-asc">未付款金額低 → 高</option>
            </select>
          </label>
        </div>
        <div className="space-y-4">
          {filteredHistoryRecords.length ? filteredHistoryRecords.map((record) => {
            const projectPayments = paymentMap.get(record.projectId) ?? [];
            const isExpanded = expandedRecordIds.includes(record.id);
            return (
              <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="flex h-8 items-center text-lg font-semibold text-slate-900">{record.projectName}</h4>
                      <span className="inline-flex h-8 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{record.projectStatus}</span>
                      <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(record.paymentStatus)}`}>{record.paymentStatus}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{record.payableSummary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                    <div className="text-left xl:text-right">
                      <p className="text-sm text-slate-500">目前應付 / 未付款</p>
                      <p className="text-2xl font-semibold tracking-tight text-slate-900">{record.adjustedCostLabel} / {formatCurrency(record.unpaidAmount ?? record.adjustedCost)}</p>
                    </div>
                    <button type="button" onClick={() => toggleExpandedRecord(record.id)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">{isExpanded ? '收合明細' : '查看明細'}</button>
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
                        {record.sourceItemDetails.map((item) => (
                          <li key={`${record.id}-${item}`} className="rounded-2xl bg-slate-50 px-3 py-2">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
                <div className="mt-5 space-y-3">
                  {projectPayments.length ? projectPayments.map((payment) => (
                    <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{payment.paidOn}</p>
                        <p className="mt-1 text-sm text-slate-600">{payment.note || '—'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                        <button type="button" onClick={() => handleDeletePayment(payment.id)} className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">刪除</button>
                      </div>
                    </div>
                  )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-500">目前沒有付款紀錄。</div>}
                </div>
              </div>
            );
          }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">目前沒有符合條件的 DB 往來紀錄。</div>}
        </div>
      </article>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>{children}</div>;
}
