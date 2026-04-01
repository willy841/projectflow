import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  getAssignmentStatusLabel,
  getAssignmentsForPackage,
  getPackageStatusLabel,
  getVendorStatusClass,
  vendorPackages,
} from "@/components/vendor-data";

export default function VendorPackagesPage() {
  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Vendor Flow / Package List</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Vendor Packages</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              這裡是同專案 + 同廠商的對外正式發包主線列表。整包總價、整包回覆與正式發包成立，都應在 package 層處理。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
              返回專案列表
            </Link>
            <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm">+ 新增 Package</button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Package 總數</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{vendorPackages.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">已正式發包</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {vendorPackages.filter((pkg) => pkg.status === "formally_confirmed").length}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">討論往返中</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {vendorPackages.filter((pkg) => pkg.status === "in_discussion").length}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">包內 Assignment 總數</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {vendorPackages.reduce((total, pkg) => total + pkg.assignmentIds.length, 0)}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm ring-1 ring-amber-100">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-700">FORMAL CONFIRMATION RULE</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">正式發包只在 Package Detail Page 發生</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              這一層才是對外整包主體。Assignment 頁只管理單項內容；若要確認整包金額、整包回覆與正式發包，請進入 package detail page。
            </p>
          </div>
          <Link href="/vendor-assignments" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
            回看 Assignments 補充支線
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        {vendorPackages.map((vendorPackage, index) => {
          const assignments = getAssignmentsForPackage(vendorPackage.id);

          return (
            <article key={vendorPackage.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">P{index + 1}</span>
                    <p className="text-sm text-slate-500">{vendorPackage.projectName}</p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(vendorPackage.status)}`}>
                      {getPackageStatusLabel(vendorPackage.status)}
                    </span>
                  </div>
                  <Link href={`/vendor-packages/${vendorPackage.id}`} className="mt-3 inline-block text-2xl font-semibold tracking-tight text-slate-900 underline-offset-4 hover:underline">
                    {vendorPackage.title}
                  </Link>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{vendorPackage.summary}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`/vendor-packages/${vendorPackage.id}`} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    進入 Package Detail
                  </Link>
                  <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
                    複製整包內容
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Package Code", vendorPackage.code],
                  ["Vendor", vendorPackage.vendorName],
                  ["整包金額", vendorPackage.quotedAmount],
                  ["交付節奏", vendorPackage.deliveryWindow],
                  ["主線回覆數", `${vendorPackage.replies.length} 則`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-2 font-semibold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">包內 Assignments</p>
                      <p className="mt-1 text-xs text-slate-500">同專案 + 同廠商被彙整進這張 package 的項目。</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {assignments.length} 筆
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/vendor-assignments/${assignment.id}`} className="font-semibold text-slate-900 underline-offset-4 hover:underline">
                              {assignment.title}
                            </Link>
                            <p className="mt-1 text-sm text-slate-500">來源：{assignment.executionItemTitle}</p>
                          </div>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(assignment.status)}`}>
                            {assignment.status === "confirmed_under_package"
                              ? "已隨包正式發包"
                              : getAssignmentStatusLabel(assignment.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
                  <p className="text-sm font-semibold text-slate-900">Package Notes</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{vendorPackage.notes}</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
                      <p className="text-xs font-medium text-slate-500">正式發包時間</p>
                      <p className="mt-2 font-medium text-slate-900">{vendorPackage.formallyConfirmedAt ?? "尚未正式發包"}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
                      <p className="text-xs font-medium text-slate-500">正式發包人</p>
                      <p className="mt-2 font-medium text-slate-900">{vendorPackage.formallyConfirmedBy ?? "尚未指定"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
