import Link from "next/link";
import {
  VendorAssignment,
  getAssignmentStatusLabel,
  getVendorPackageById,
  getVendorStatusClass,
} from "@/components/vendor-data";

function PackageRoutingPanel({
  hasPackage,
  packageCode,
  packageTitle,
  packageHref,
}: {
  hasPackage: boolean;
  packageCode?: string;
  packageTitle?: string;
  packageHref?: string;
}) {
  if (hasPackage && packageHref && packageCode && packageTitle) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm ring-1 ring-amber-100">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-amber-700">PACKAGE ROUTING PANEL</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">唯一正確下一步：前往 Package 頁處理正式發包</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              這筆 Assignment 已整理進 package 主線。Assignment 頁只負責單項管理；若要正式發包，請前往 Package Detail。
            </p>
            <ol className="mt-4 space-y-2 text-sm text-slate-700">
              <li>1. 確認這筆 assignment 已納入正確 package</li>
              <li>2. 前往 package detail page</li>
              <li>3. 只在 package page 執行「確認並正式發包」</li>
            </ol>
          </div>

          <div className="w-full max-w-sm rounded-2xl bg-white p-4 ring-1 ring-amber-200">
            <p className="text-xs font-medium text-slate-500">目前所屬 Package</p>
            <p className="mt-2 font-semibold text-slate-900">{packageCode}</p>
            <p className="mt-1 text-sm text-slate-600">{packageTitle}</p>
            <Link
              href={packageHref}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
            >
              前往 Package（正式發包入口）
            </Link>
            <p className="mt-2 text-center text-xs text-slate-500">本頁不提供正式發包 CTA</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm ring-1 ring-sky-100">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-sky-700">PACKAGE ROUTING PANEL</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">唯一正確下一步：先把這筆 Assignment 納入 Package</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            目前尚未有 package，所以這頁不能正式發包。要往下走，必須先建立新 package，或加入同專案 + 同廠商的既有 package。
          </p>
          <ol className="mt-4 space-y-2 text-sm text-slate-700">
            <li>1. 建立新 package 或加入既有 package</li>
            <li>2. 讓這筆 assignment 成為 package 內項目</li>
            <li>3. 再到 package detail page 進行正式發包</li>
          </ol>
        </div>

        <div className="w-full max-w-sm rounded-2xl bg-white p-4 ring-1 ring-sky-200">
          <p className="text-xs font-medium text-slate-500">目前狀態</p>
          <p className="mt-2 font-semibold text-slate-900">尚未加入任何 Package</p>
          <div className="mt-4 space-y-2">
            <button className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
              建立新 Package（mock）
            </button>
            <button className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              加入既有 Package（mock）
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">正式發包入口會在 package page 出現</p>
        </div>
      </div>
    </section>
  );
}

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
                查看所屬 Package
              </Link>
            ) : null}
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm">
              編輯 Assignment
            </button>
          </div>
        </div>
      </header>

      <PackageRoutingPanel
        hasPackage={Boolean(vendorPackage)}
        packageCode={vendorPackage?.code}
        packageTitle={vendorPackage?.title}
        packageHref={vendorPackage ? `/vendor-packages/${vendorPackage.id}` : undefined}
      />

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
