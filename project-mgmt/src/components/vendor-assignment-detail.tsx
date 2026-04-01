import Link from "next/link";
import {
  VendorAssignment,
  getAssignmentStatusLabel,
  getVendorPackageById,
  getVendorStatusClass,
} from "@/components/vendor-data";

export function VendorAssignmentDetail({ assignment }: { assignment: VendorAssignment }) {
  const vendorPackage = assignment.packageId ? getVendorPackageById(assignment.packageId) : null;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Assignment</span>
              <p className="text-sm text-slate-500">{assignment.executionItemTitle}</p>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(assignment.status)}`}
              >
                {getAssignmentStatusLabel(assignment.status)}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{assignment.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{assignment.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {vendorPackage ? (
              <Link
                href={`/vendor-packages/${vendorPackage.id}`}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm"
              >
                前往所屬 Package
              </Link>
            ) : null}
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm">
              編輯 Assignment
            </button>
          </div>
        </div>
      </header>

      {vendorPackage ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm ring-1 ring-amber-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-amber-700">PACKAGE RELATION</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">這筆 Assignment 已歸屬到正式 Package 主線</h3>
              <p className="mt-1 text-sm text-slate-600">
                Package 才是對外正式發包主體；若要進行「確認並正式發包」，請前往 package detail page 操作。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-amber-200">
                <p className="text-xs font-medium text-slate-500">所屬 Package</p>
                <p className="mt-1 font-semibold text-slate-900">{vendorPackage.code}</p>
              </div>
              <Link
                href={`/vendor-packages/${vendorPackage.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
              >
                前往 Package 並正式發包
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm ring-1 ring-sky-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-sky-700">PACKAGE NEXT STEP</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">這筆 Assignment 尚未加入任何 Package</h3>
              <p className="mt-1 text-sm text-slate-600">
                正式發包入口只存在於 Package Detail。下一步應先建立新 package，或加入同專案 + 同廠商的既有 package。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
                建立新 Package（mock）
              </button>
              <button className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                加入既有 Package（mock）
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["合作廠商", assignment.vendorName],
          ["來源 Execution Item", assignment.executionItemTitle],
          ["單項預算", assignment.budget],
          ["最近更新", assignment.updatedAt],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Assignment 內容</h3>
              <p className="mt-1 text-sm text-slate-500">單項需求、規格與內部補充，維持 item-level 管理責任。</p>
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">內部逐項頁</span>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Spec / Deliverables</p>
              <p className="mt-2 font-medium leading-7 text-slate-900">{assignment.spec}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">備註</p>
              <p className="mt-2 font-medium leading-7 text-slate-900">{assignment.note}</p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
              <p className="text-sm text-slate-500">所屬 Package</p>
              {vendorPackage ? (
                <div className="mt-2 space-y-2">
                  <p className="font-medium text-slate-900">{vendorPackage.title}</p>
                  <Link href={`/vendor-packages/${vendorPackage.id}`} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
                    前往 package 詳細頁
                  </Link>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="font-medium text-slate-900">尚未納入任何 package</p>
                  <p className="text-sm text-slate-500">請先建立 / 加入 package，正式發包入口才會出現。</p>
                </div>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Assignment Replies</h3>
              <p className="mt-1 text-sm text-slate-500">補充支線：只保留單項補件、加價或技術限制，不承擔 package 主對話。</p>
            </div>
            <button className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">+ 新增回覆</button>
          </div>

          <div className="space-y-3">
            {assignment.replies.map((reply, index) => (
              <div key={reply.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">R{index + 1}</span>
                    <p className="font-medium text-slate-900">{reply.author}</p>
                  </div>
                  <span className="text-xs text-slate-500">{reply.createdAt}</span>
                </div>
                {reply.type ? <p className="mt-2 text-xs font-medium text-slate-500">{reply.type}</p> : null}
                <p className="mt-2 text-sm leading-6 text-slate-700">{reply.message}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
