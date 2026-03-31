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
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">{assignment.executionItemTitle}</p>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(assignment.status)}`}
              >
                {getAssignmentStatusLabel(assignment.status)}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{assignment.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{assignment.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {vendorPackage ? (
              <Link
                href={`/vendor-packages/${vendorPackage.id}`}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              >
                查看所屬發包包單
              </Link>
            ) : null}
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
              編輯 Assignment
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["合作廠商", assignment.vendorName],
          ["來源 Execution Item", assignment.executionItemTitle],
          ["單項預算", assignment.budget],
          ["最近更新", assignment.updatedAt],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h3 className="text-xl font-semibold">單項規格與內部備註</h3>
            <p className="mt-1 text-sm text-slate-500">這裡是 item-level 管理，不是正式發包主頁。</p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Spec / Deliverables</p>
              <p className="mt-2 font-medium text-slate-900">{assignment.spec}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">備註</p>
              <p className="mt-2 font-medium text-slate-900">{assignment.note}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">所屬 Package</p>
              {vendorPackage ? (
                <div className="mt-2 space-y-2">
                  <p className="font-medium text-slate-900">{vendorPackage.title}</p>
                  <Link href={`/vendor-packages/${vendorPackage.id}`} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
                    前往 package 詳細頁
                  </Link>
                </div>
              ) : (
                <p className="mt-2 font-medium text-slate-900">尚未納入任何 package</p>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Assignment 回覆</h3>
              <p className="mt-1 text-sm text-slate-500">僅保留單項補充，不承擔整包主對話。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增回覆</button>
          </div>

          <div className="space-y-3">
            {assignment.replies.map((reply) => (
              <div key={reply.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{reply.author}</p>
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
