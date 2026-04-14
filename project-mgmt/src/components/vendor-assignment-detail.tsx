import Link from "next/link";
import { VendorAssignment, getVendorPackageById } from "@/components/vendor-data";

export function VendorAssignmentDetail({ assignment }: { assignment: VendorAssignment }) {
  const vendorPackage = assignment.packageId ? getVendorPackageById(assignment.packageId) : null;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${assignment.status === "done" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                {assignment.status === "done" ? "已送出" : "未送出"}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{assignment.title}</h2>
          </div>
          {vendorPackage ? (
            <Link href={`/vendor-packages/${vendorPackage.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              前往所屬 Package
            </Link>
          ) : null}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["來源執行項目", assignment.executionItemTitle],
          ["工種", assignment.tradeLabel || "-"],
          ["預算", assignment.budget],
          ["已選廠商", assignment.selectedVendorName || "未選定"],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">需求說明</h3>
        <p className="mt-3 text-sm leading-7 text-slate-700">{assignment.summary}</p>
      </article>
    </div>
  );
}
