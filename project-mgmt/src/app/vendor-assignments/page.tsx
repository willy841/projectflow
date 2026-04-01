import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  getAssignmentStatusLabel,
  getPackageStatusLabel,
  getVendorStatusClass,
  vendorAssignments,
  vendorPackages,
} from "@/components/vendor-data";

export default function VendorAssignmentsPage() {
  const packagedCount = vendorAssignments.filter((assignment) => assignment.packageId).length;
  const unpackagedCount = vendorAssignments.length - packagedCount;

  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Vendor Flow / Assignment List</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">Vendor Assignments</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              這裡是 item-level 內部逐項管理列表。Assignment 用來整理單項需求、規格、預算與補充回覆；正式發包不在這層完成。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700">
              返回專案列表
            </Link>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">+ 新增 Assignment</button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Assignment 總數</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{vendorAssignments.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">已納入 Package</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{packagedCount}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">待納入 Package</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{unpackagedCount}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">廠商往返中</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {vendorAssignments.filter((assignment) => assignment.status === "in_vendor_discussion").length}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm ring-1 ring-sky-100">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-700">FLOW RULE</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Assignment 是內部逐項頁，不是正式發包入口</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              若某筆 assignment 已歸入 package，下一步應前往 package detail page；若尚未歸入 package，下一步是先建立 / 加入同專案 + 同廠商包單。
            </p>
          </div>
          <Link href="/vendor-packages" className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
            前往 Vendor Packages 主線
          </Link>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">全部 Assignments</h3>
            <p className="mt-1 text-sm text-slate-500">點選標題可進入 assignment detail，查看 item-level 內容與 package routing。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              placeholder="搜尋 assignment / 廠商 / execution item"
              className="h-11 w-72 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            />
            <button className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">依更新時間排序</button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Assignment</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Execution Item</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Package Routing</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {vendorAssignments.map((assignment) => {
                const vendorPackage = assignment.packageId
                  ? vendorPackages.find((pkg) => pkg.id === assignment.packageId) ?? null
                  : null;

                return (
                  <tr key={assignment.id}>
                    <td className="px-4 py-4 align-top">
                      <Link href={`/vendor-assignments/${assignment.id}`} className="font-medium text-slate-900 underline-offset-4 hover:underline">
                        {assignment.title}
                      </Link>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{assignment.summary}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600">{assignment.projectId}</td>
                    <td className="px-4 py-4 align-top text-slate-600">{assignment.executionItemTitle}</td>
                    <td className="px-4 py-4 align-top text-slate-600">{assignment.vendorName}</td>
                    <td className="px-4 py-4 align-top text-slate-600">{assignment.budget}</td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(assignment.status)}`}>
                        {getAssignmentStatusLabel(assignment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {vendorPackage ? (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-amber-700">已進主線 package</p>
                          <Link href={`/vendor-packages/${vendorPackage.id}`} className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
                            {vendorPackage.code}
                          </Link>
                          <p className="text-xs text-slate-500">{getPackageStatusLabel(vendorPackage.status)}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-sky-700">待建立 / 加入 package</p>
                          <p className="text-xs text-slate-500">正式發包前必須先歸包</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600">{assignment.updatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
