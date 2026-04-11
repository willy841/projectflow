import Link from 'next/link';
import { formatCurrency, getVendorPaymentStatusClass, type VendorBasicProfile, type VendorProjectRecord } from '@/components/vendor-data';

export function VendorDetailShellDb({ vendor, records }: { vendor: VendorBasicProfile; records: VendorProjectRecord[] }) {
  const unpaidRecords = records.filter((record) => record.paymentStatus === '未付款');
  const totalOutstanding = unpaidRecords.reduce((sum, record) => sum + record.adjustedCost, 0);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{vendor.name}</h2>
              <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                {vendor.tradeLabel || vendor.category || '待補充'}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                DB-first（唯讀）
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/vendors" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
              返回廠商列表
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-slate-900">廠商資訊</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['聯絡人', vendor.contactName || '未填寫'],
              ['電話', vendor.phone || '未填寫'],
              ['Email', vendor.email || '未填寫'],
              ['LINE', vendor.lineId || '未填寫'],
              ['地址', vendor.address || '未填寫'],
              ['銀行', vendor.bankName || '未填寫'],
              ['戶名', vendor.accountName || '未填寫'],
              ['帳號', vendor.accountNumber || '未填寫'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm ring-1 ring-amber-100">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-slate-900">未付款專案</h3>
            <p className="mt-2 text-sm text-slate-600">這裡只顯示目前仍在執行中、且尚未付款的專案。主目的為提醒付款與快速篩選；若尚未全部對帳，會同步顯示提醒。</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-amber-200">
            <p className="font-semibold text-slate-900">未付款總額 {formatCurrency(totalOutstanding)}</p>
          </div>
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
                  <p className="text-xl font-semibold text-slate-900">{record.adjustedCostLabel}</p>
                </div>
                {record.reconciliationWarning ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {record.reconciliationWarning}
                  </div>
                ) : null}
              </div>
            )) : <div className="rounded-2xl border border-dashed border-amber-300 bg-white px-5 py-6 text-sm text-slate-500">目前沒有未付款專案。</div>}
          </div>
        </article>
      </section>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">往來紀錄</h3>
          <p className="mt-2 text-sm text-slate-600">這裡是歷史存檔與查看明細區。主要用來回看這個廠商在各專案當時到底發包了哪些內容，而不是作為當前付款提醒主區。</p>
        </div>
        <div className="space-y-4">
          {records.length ? records.map((record) => (
            <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="flex h-8 items-center text-lg font-semibold text-slate-900">{record.projectName}</h4>
                    <span className="inline-flex h-8 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{record.projectStatus}</span>
                    <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(record.paymentStatus)}`}>
                      {record.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="text-left xl:text-right">
                  <p className="text-sm text-slate-500">調整後成本總額</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">{record.adjustedCostLabel}</p>
                </div>
              </div>
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
            </div>
          )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">目前沒有任何 DB 往來紀錄。</div>}
        </div>
      </article>
    </div>
  );
}
