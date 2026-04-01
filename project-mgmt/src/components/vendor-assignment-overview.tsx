"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  VendorAssignment,
  VendorPackage,
  getAssignmentStatusLabel,
  getVendorStatusClass,
} from "@/components/vendor-data";

type Props = {
  assignments: VendorAssignment[];
  packages: VendorPackage[];
};

export function VendorAssignmentOverview({ assignments, packages }: Props) {
  const packageMap = useMemo(() => new Map(packages.map((pkg) => [pkg.id, pkg])), [packages]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noticeById, setNoticeById] = useState<Record<string, string>>({});

  function handleMockAction(assignmentId: string, action: "create" | "join") {
    setNoticeById((prev) => ({
      ...prev,
      [assignmentId]: action === "create" ? "已建立 mock package flow，下一步請前往 package page 正式發包。" : "已加入 mock package flow，下一步請前往 package page 正式發包。",
    }));
    setExpandedId(null);
  }

  return (
    <div className="space-y-3">
      {assignments.length ? (
        assignments.map((assignment, index) => {
          const vendorPackage = assignment.packageId ? packageMap.get(assignment.packageId) ?? null : null;
          const isExpanded = expandedId === assignment.id;
          const notice = noticeById[assignment.id];

          return (
            <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
                    <Link href={`/vendor-assignments/${assignment.id}`} className="font-semibold text-slate-900 underline-offset-4 hover:underline">
                      {assignment.title}
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">來源：{assignment.executionItemTitle}</p>
                  <p className="mt-1 text-sm text-slate-500">廠商：{assignment.vendorName}</p>
                  <p className="mt-1 text-sm text-slate-500">預算：{assignment.budget}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(assignment.status)}`}>
                  {getAssignmentStatusLabel(assignment.status)}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="text-sm text-slate-600">
                    {vendorPackage ? (
                      <>
                        <p className="font-medium text-slate-900">已納入 Package：{vendorPackage.code}</p>
                        <p className="mt-1">正式發包請前往 package detail page。</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-900">尚未加入任何 Package</p>
                        <p className="mt-1">正式發包入口不在 assignment/list 層；下一步需先建立或加入 package。</p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId((prev) => (prev === assignment.id ? null : assignment.id))}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {isExpanded ? "收合" : "查看下一步"}
                    </button>
                    {vendorPackage ? (
                      <Link
                        href={`/vendor-packages/${vendorPackage.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                      >
                        前往 Package
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              {notice ? (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {notice}
                </div>
              ) : null}

              {isExpanded ? (
                <div className="mt-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                  {vendorPackage ? (
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-amber-700">PACKAGE ROUTING</p>
                        <p className="mt-1 font-semibold text-slate-900">這筆 assignment 已進入正式 package 主線</p>
                        <ol className="mt-3 space-y-2 text-sm text-slate-600">
                          <li>1. 前往 package detail page</li>
                          <li>2. 在 package 主頁確認整包內容與 reply</li>
                          <li>3. 只在 package 頁執行「確認並正式發包」</li>
                        </ol>
                      </div>
                      <div className="w-full max-w-xs rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                        <p className="text-xs font-medium text-slate-500">所屬 Package</p>
                        <p className="mt-2 font-semibold text-slate-900">{vendorPackage.code}</p>
                        <p className="mt-1 text-sm text-slate-600">{vendorPackage.title}</p>
                        <Link
                          href={`/vendor-packages/${vendorPackage.id}`}
                          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                        >
                          前往 Package 正式發包
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-sky-700">NEXT STEP</p>
                        <p className="mt-1 font-semibold text-slate-900">先把這筆 assignment 收進 package，再進行正式發包</p>
                        <ol className="mt-3 space-y-2 text-sm text-slate-600">
                          <li>1. 建立新 package 或加入既有 package</li>
                          <li>2. 讓這筆 assignment 成為 package 內項目</li>
                          <li>3. 再到 package detail page 處理正式發包</li>
                        </ol>
                      </div>
                      <div className="w-full max-w-xs space-y-2 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
                        <button
                          type="button"
                          onClick={() => handleMockAction(assignment.id, "create")}
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                        >
                          建立新 Package（mock）
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMockAction(assignment.id, "join")}
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          加入既有 Package（mock）
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          目前尚未建立 Vendor Assignment。
        </div>
      )}
    </div>
  );
}
