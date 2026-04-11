import Link from 'next/link';
import { formatCurrency, getVendorOutstandingTotal, type VendorBasicProfile } from '@/components/vendor-data';

export function VendorListPageDb({ vendors }: { vendors: VendorBasicProfile[] }) {
  const vendorCards = vendors.map((vendor) => ({
    ...vendor,
    outstandingTotal: getVendorOutstandingTotal(vendor.id),
  }));

  const totalOutstanding = vendorCards.reduce((sum, vendor) => sum + vendor.outstandingTotal, 0);

  return (
    <>
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 xl:pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">廠商資料</h2>
              <span className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                DB-first（唯讀）
              </span>
            </div>
          </div>

          <div className="sm:min-w-[260px] xl:self-stretch">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 xl:h-full xl:min-h-[104px] xl:flex xl:flex-col xl:justify-center">
              <p className="font-semibold">目前未付款總額（暫以既有摘要邏輯顯示）</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>
      </header>

      {vendorCards.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendorCards.map((vendor) => (
            <div key={vendor.id} className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{vendor.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {vendor.tradeLabel || vendor.category || '待補充'}
                    </span>
                  </div>
                </div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  廠商詳情
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4">
                <p className="text-sm text-amber-800">未付款總額</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(vendor.outstandingTotal)}</p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  查看廠商詳情
                </Link>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">目前沒有任何 DB 廠商資料</p>
        </section>
      )}
    </>
  );
}
