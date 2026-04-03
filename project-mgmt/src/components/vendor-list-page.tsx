import Link from "next/link";
import { getVendorOutstandingTotal, vendorProfiles, formatCurrency } from "@/components/vendor-data";

export function VendorListPage() {
  const vendors = vendorProfiles.map((vendor) => ({
    ...vendor,
    outstandingTotal: getVendorOutstandingTotal(vendor.id),
  }));

  const totalOutstanding = vendors.reduce((sum, vendor) => sum + vendor.outstandingTotal, 0);

  return (
    <>
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Vendor Directory</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">廠商資料</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              第一輪先做可驗收 mock / front-end MVP：列表頁只保留廠商名稱與未付款總額，點進去再看廠商資料、未付款專案與往來歷史。
            </p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <p className="font-semibold">全部未付款總額</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.id}`}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{vendor.category}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{vendor.name}</h3>
              </div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                廠商詳情
              </span>
            </div>
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4">
              <p className="text-sm text-amber-800">未付款總額</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(vendor.outstandingTotal)}</p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
