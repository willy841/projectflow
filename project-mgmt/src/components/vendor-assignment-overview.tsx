"use client";

import Link from "next/link";
import { VendorAssignment, VendorPackage } from "@/components/vendor-data";

type Props = {
  assignments: VendorAssignment[];
  packages: VendorPackage[];
};

export function VendorAssignmentOverview({ assignments, packages }: Props) {
  return (
    <div className="space-y-3">
      {assignments.length ? (
        assignments.map((assignment, index) => {
          const vendorPackage = assignment.packageId ? packages.find((pkg) => pkg.id === assignment.packageId) ?? null : null;

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
                  <p className="mt-1 text-sm text-slate-500">工種：{assignment.tradeLabel || "-"}</p>
                  <p className="mt-1 text-sm text-slate-500">預算：{assignment.budget}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${assignment.status === "done" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                  {assignment.status === "done" ? "已送出" : "未送出"}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
                {vendorPackage ? (
                  <>
                    已建立
                    <Link href={`/vendor-packages/${vendorPackage.id}`} className="ml-1 font-medium text-slate-900 underline-offset-4 hover:underline">
                      查看
                    </Link>
                  </>
                ) : (
                  <>未建立</>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">尚未建立廠商需求。</div>
      )}
    </div>
  );
}
