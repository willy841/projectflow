'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, type VendorBasicProfile } from '@/components/vendor-data';

type VendorListPageDbProps = {
  vendors: VendorBasicProfile[];
  tradeOptions: string[];
};

export function VendorListPageDb({ vendors, tradeOptions: initialTradeOptions }: VendorListPageDbProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [activeTrade, setActiveTrade] = useState<string | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorTrade, setNewVendorTrade] = useState('');
  const [createVendorError, setCreateVendorError] = useState<string | null>(null);
  const [isTradeManagerOpen, setIsTradeManagerOpen] = useState(false);
  const [tradeOptions, setTradeOptions] = useState(initialTradeOptions);
  const [newTradeName, setNewTradeName] = useState('');
  const [tradeSaving, setTradeSaving] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [deletingTradeName, setDeletingTradeName] = useState<string | null>(null);

  const vendorCards = vendors.map((vendor) => ({
    ...vendor,
    outstandingTotal: (vendor as VendorBasicProfile & { outstandingTotal?: number }).outstandingTotal ?? 0,
  }));

  const tradeUsageCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const vendor of vendorCards) {
      const trade = vendor.tradeLabel || vendor.category || '';
      if (!trade) continue;
      map.set(trade, (map.get(trade) ?? 0) + 1);
    }
    return map;
  }, [vendorCards]);

  const filteredVendorCards = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return vendorCards.filter((vendor) => {
      const trade = vendor.tradeLabel || vendor.category || '';
      const matchesKeyword = !normalizedKeyword || [vendor.name, trade].join(' ').toLowerCase().includes(normalizedKeyword);
      const matchesTrade = !activeTrade || trade === activeTrade;
      return matchesKeyword && matchesTrade;
    });
  }, [activeTrade, keyword, vendorCards]);

  const totalOutstanding = filteredVendorCards.reduce((sum, vendor) => sum + vendor.outstandingTotal, 0);
  const deletingVendor = deletingVendorId ? vendorCards.find((vendor) => vendor.id === deletingVendorId) ?? null : null;

  async function handleDeleteVendor() {
    if (!deletingVendorId || deleting) return;
    setDeleting(true);
    const response = await fetch(`/api/vendors/${deletingVendorId}`, { method: 'DELETE' });
    const result = await response.json();
    setDeleting(false);
    if (!response.ok || !result?.ok) {
      window.alert(result?.error ?? '刪除廠商失敗');
      return;
    }
    setDeletingVendorId(null);
    router.refresh();
  }

  async function handleCreateVendor() {
    const trimmedName = newVendorName.trim();
    if (!trimmedName) {
      setCreateVendorError('請先輸入廠商名稱');
      return;
    }

    setCreatingVendor(true);
    setCreateVendorError(null);
    const response = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, tradeLabel: newVendorTrade.trim() || null }),
    });
    const result = await response.json();
    setCreatingVendor(false);

    if (!response.ok || !result?.ok || !result?.vendor?.id) {
      setCreateVendorError(result?.error ?? '建立廠商失敗');
      return;
    }

    setIsCreateVendorOpen(false);
    setNewVendorName('');
    setNewVendorTrade('');
    router.push(`/vendors/${encodeURIComponent(result.vendor.id)}`);
    router.refresh();
  }

  async function handleCreateTrade() {
    const trimmedName = newTradeName.trim();
    if (!trimmedName || tradeSaving) return;
    setTradeSaving(true);
    setTradeError(null);
    const response = await fetch('/api/vendors/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName }),
    });
    const result = await response.json();
    setTradeSaving(false);
    if (!response.ok || !result?.ok) {
      setTradeError(result?.error ?? '新增工種失敗');
      return;
    }
    setTradeOptions((current) => Array.from(new Set([...current, result.trade.name])).sort((a, b) => a.localeCompare(b, 'zh-Hant')));
    setNewVendorTrade(result.trade.name);
    setNewTradeName('');
  }

  async function handleDeleteTrade(name: string) {
    if (deletingTradeName) return;
    setDeletingTradeName(name);
    setTradeError(null);
    const response = await fetch(`/api/vendors/trades/${encodeURIComponent(name)}`, { method: 'DELETE' });
    const result = await response.json();
    setDeletingTradeName(null);
    if (!response.ok || !result?.ok) {
      setTradeError(result?.error ?? '刪除工種失敗');
      return;
    }
    setTradeOptions((current) => current.filter((item) => item !== name));
    if (activeTrade === name) setActiveTrade(null);
    if (newVendorTrade === name) setNewVendorTrade('');
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
                  setIsCreateVendorOpen(true);
                  setCreateVendorError(null);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                新增廠商
              </button>
              <button
                type="button"
                onClick={() => setIsTradeManagerOpen((current) => !current)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                {isTradeManagerOpen ? '收合工種管理' : '管理工種'}
              </button>
            </div>
          </div>

          <div className="sm:min-w-[260px] xl:self-stretch">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 xl:flex xl:h-full xl:min-h-[104px] xl:flex-col xl:justify-center">
              <p className="font-semibold">未付款總額</p>
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
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜尋廠商名稱或工種"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 xl:justify-end">
              <span>共 {filteredVendorCards.length} 間</span>
              {(keyword || activeTrade) ? (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('');
                    setActiveTrade(null);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  清除
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTrade(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${activeTrade === null ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
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
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${active ? 'bg-sky-600 text-white ring-sky-600' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
                  >
                    {trade}
                  </button>
                );
              })}
            </div>
          </div>

          {isTradeManagerOpen ? (
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 ring-1 ring-sky-100">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <label className="block flex-1">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">新增工種</span>
                  <input
                    value={newTradeName}
                    onChange={(event) => setNewTradeName(event.target.value)}
                    placeholder="例如：輸出 / 木作 / 施工"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleCreateTrade}
                  disabled={tradeSaving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {tradeSaving ? '新增中…' : '新增工種'}
                </button>
              </div>

              {tradeError ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{tradeError}</div> : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {tradeOptions.length ? tradeOptions.map((trade) => {
                  const usageCount = tradeUsageCountMap.get(trade) ?? 0;
                  const deletingTrade = deletingTradeName === trade;
                  return (
                    <div key={trade} className="inline-flex items-center overflow-hidden rounded-full ring-1 ring-slate-200">
                      <span className="bg-white px-3 py-2 text-xs font-medium text-slate-700">
                        {trade}
                        <span className="ml-2 text-slate-400">{usageCount} 間</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrade(trade)}
                        disabled={usageCount > 0 || deletingTrade}
                        className="border-l border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        aria-label={`刪除工種 ${trade}`}
                      >
                        {deletingTrade ? '…' : '×'}
                      </button>
                    </div>
                  );
                }) : <p className="text-sm text-slate-500">目前還沒有工種。</p>}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {filteredVendorCards.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredVendorCards.map((vendor) => (
            <div key={vendor.id} className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/vendors/${vendor.id}`} className="text-2xl font-semibold tracking-tight text-slate-900 underline-offset-4 transition hover:text-slate-700 hover:underline">
                      {vendor.name}
                    </Link>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {vendor.tradeLabel || vendor.category || '—'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingVendorId(vendor.id)}
                  className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                >
                  刪除廠商
                </button>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4">
                <p className="text-sm text-amber-800">未付款總額</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(vendor.outstandingTotal)}</p>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">目前沒有符合條件的廠商</p>
        </section>
      )}

      {isCreateVendorOpen ? (
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
                <select
                  value={newVendorTrade}
                  onChange={(event) => setNewVendorTrade(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="">不指定</option>
                  {tradeOptions.map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
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
                  setIsCreateVendorOpen(false);
                  setCreateVendorError(null);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateVendor}
                disabled={creatingVendor}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {creatingVendor ? '建立中…' : '建立廠商'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingVendor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mt-4 text-xl font-semibold text-slate-900">確認刪除這個廠商？</h3>
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
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:opacity-60"
              >
                {deleting ? '刪除中…' : '確認刪除廠商'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
