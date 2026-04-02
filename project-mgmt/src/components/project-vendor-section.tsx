"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getAssignmentsByProjectId,
  getPackagesByProjectId,
  vendorPackages,
  type VendorAssignment,
  type VendorPackage,
} from "@/components/vendor-data";

type PackageMap = Record<string, VendorPackage>;

function buildPackageMap(): PackageMap {
  return Object.fromEntries(vendorPackages.map((pkg) => [pkg.id, pkg]));
}

function groupPackagesByVendor(packages: VendorPackage[]) {
  return packages.reduce<Record<string, VendorPackage[]>>((acc, pkg) => {
    if (!acc[pkg.vendorName]) acc[pkg.vendorName] = [];
    acc[pkg.vendorName].push(pkg);
    return acc;
  }, {});
}

export function ProjectVendorSection({ projectId }: { projectId: string }) {
  const packageMap = useMemo(() => buildPackageMap(), []);
  const initialAssignments = useMemo(() => getAssignmentsByProjectId(projectId), [projectId]);
  const packages = useMemo(() => getPackagesByProjectId(projectId), [projectId]);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [activeBoard, setActiveBoard] = useState<"design" | "procurement" | "vendor" | null>(null);

  function handleAssignmentChange(id: string, patch: Partial<VendorAssignment>) {
    setAssignments((current) => current.map((assignment) => (assignment.id === id ? { ...assignment, ...patch } : assignment)));
  }

  function handleSend(assignment: VendorAssignment) {
    if (!assignment.selectedVendorName) return;
    const matchedPackage = packages.find((pkg) => pkg.vendorName === assignment.selectedVendorName);
    handleAssignmentChange(assignment.id, {
      status: "done",
      packageId: matchedPackage?.id ?? assignment.packageId,
    });
  }

  const vendorPackagesByName = groupPackagesByVendor(packages);

  return (
    <section className="space-y-6">
      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500">7 區</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">任務檢視區</h3>
          <p className="mt-1 text-sm text-slate-500">7-1、7-2 為設計與備品任務檢視；7-3 專案廠商僅作為 Vendor Flow 入口卡。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveBoard("design")}
            className={`rounded-3xl border p-5 text-left shadow-sm transition ${activeBoard === "design" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
          >
            <p className={`text-xs font-semibold tracking-wide ${activeBoard === "design" ? "text-slate-200" : "text-slate-500"}`}>7-1</p>
            <p className="mt-2 text-lg font-semibold">專案設計</p>
            <p className={`mt-2 text-sm ${activeBoard === "design" ? "text-slate-200" : "text-slate-500"}`}>設計任務發佈後的需求列表與回覆檢視。</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveBoard("procurement")}
            className={`rounded-3xl border p-5 text-left shadow-sm transition ${activeBoard === "procurement" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
          >
            <p className={`text-xs font-semibold tracking-wide ${activeBoard === "procurement" ? "text-slate-200" : "text-slate-500"}`}>7-2</p>
            <p className="mt-2 text-lg font-semibold">專案備品</p>
            <p className={`mt-2 text-sm ${activeBoard === "procurement" ? "text-slate-200" : "text-slate-500"}`}>備品任務發佈後的需求列表與回覆檢視。</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveBoard("vendor")}
            className={`rounded-3xl border p-5 text-left shadow-sm transition ${activeBoard === "vendor" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
          >
            <p className={`text-xs font-semibold tracking-wide ${activeBoard === "vendor" ? "text-blue-100" : "text-slate-500"}`}>7-3</p>
            <p className="mt-2 text-lg font-semibold">專案廠商</p>
            <p className={`mt-2 text-sm ${activeBoard === "vendor" ? "text-blue-100" : "text-slate-500"}`}>只保留入口卡；點選後才顯示廠商需求與廠商發包清單。</p>
          </button>
        </div>
      </article>

      {activeBoard === "vendor" ? (
        <>
          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-sky-700">PRE-ISSUE</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">廠商需求</h3>
                <p className="mt-1 text-sm text-slate-500">所有廠商需求列表，同時也是直接處理需求的地方。</p>
              </div>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment, index) => {
                const packageVendorName = assignment.packageId ? packageMap[assignment.packageId]?.vendorName : undefined;
                const selectedVendorName = assignment.selectedVendorName || packageVendorName || "";
                const statusLabel = assignment.status === "done" || assignment.packageId ? "已處理" : "未處理";

                return (
                  <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
                      <p className="font-semibold text-slate-900">{assignment.title}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusLabel === "已處理" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_180px]">
                      <label className="block">
                        <p className="mb-2 text-sm font-medium text-slate-700">需求說明</p>
                        <textarea
                          value={assignment.summary}
                          onChange={(event) => handleAssignmentChange(assignment.id, { summary: event.target.value })}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        />
                      </label>

                      <div className="space-y-4">
                        <label className="block">
                          <p className="mb-2 text-sm font-medium text-slate-700">工種</p>
                          <input
                            value={assignment.tradeLabel || ""}
                            onChange={(event) => handleAssignmentChange(assignment.id, { tradeLabel: event.target.value })}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                          />
                        </label>
                        <label className="block">
                          <p className="mb-2 text-sm font-medium text-slate-700">預算</p>
                          <input
                            value={assignment.budget}
                            onChange={(event) => handleAssignmentChange(assignment.id, { budget: event.target.value })}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                          />
                        </label>
                      </div>

                      <div className="space-y-4">
                        <label className="block">
                          <p className="mb-2 text-sm font-medium text-slate-700">選擇廠商</p>
                          <select
                            value={selectedVendorName}
                            onChange={(event) => handleAssignmentChange(assignment.id, { selectedVendorName: event.target.value })}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                          >
                            <option value="">請選擇廠商</option>
                            {Object.keys(vendorPackagesByName).map((vendorName) => (
                              <option key={vendorName} value={vendorName}>{vendorName}</option>
                            ))}
                          </select>
                        </label>

                        <button
                          type="button"
                          disabled={!selectedVendorName || statusLabel === "已處理"}
                          onClick={() => handleSend({ ...assignment, selectedVendorName })}
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          送出
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6 shadow-sm ring-1 ring-blue-100">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-700">POST-ISSUE</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">廠商發包清單</h3>
                <p className="mt-1 text-sm text-slate-500">送出後直接進入 package 主線，依同專案 + 同廠商歸包。</p>
              </div>
            </div>

            {packages.length ? (
              <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-blue-100">
                <table className="min-w-[720px] divide-y divide-slate-200 text-sm xl:min-w-full">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="px-4 py-3 font-medium">廠商名稱</th>
                      <th className="px-4 py-3 font-medium">項目數</th>
                      <th className="px-4 py-3 font-medium">文件狀態</th>
                      <th className="px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {packages.map((vendorPackage) => (
                      <tr key={vendorPackage.id}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{vendorPackage.vendorName}</p>
                            <p className="mt-1 text-xs text-slate-500">{vendorPackage.code}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-700">{vendorPackage.items.length} 筆</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${vendorPackage.documentGenerated ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                            {vendorPackage.documentGenerated ? "已處理" : "未處理"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/vendor-packages/${vendorPackage.id}`} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
                            查看 Package
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500">目前尚未建立廠商發包清單。</div>
            )}
          </article>
        </>
      ) : null}
    </section>
  );
}
