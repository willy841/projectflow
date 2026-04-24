"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";
import type { QuoteCostProject } from "@/components/quote-cost-data";
import { WorkspaceEmptyState, workspacePrimaryButtonClass } from "@/components/workspace-ui";

export function QuoteCostListClient({ mode = "active", initialProjects }: { mode?: "active" | "closed"; initialProjects?: QuoteCostProject[] }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const sourceProjects = initialProjects ?? getQuoteCostProjectsWithWorkflow();

  const activeProjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return sourceProjects
      .filter((project) => project.projectStatus === "執行中")
      .filter((project) => {
        if (!keyword) return true;
        return [project.projectName, project.projectCode, project.clientName].join(" ").toLowerCase().includes(keyword);
      })
      .map((project) => {
        const excludedCostCount = project.costItems.filter((item) => !item.includedInCost).length;
        const unassignedVendorCount = project.costItems.filter((item) => !item.isManual && !item.vendorId).length;
        const needsAttentionScore = excludedCostCount + unassignedVendorCount + (project.reconciliationStatus !== "已完成" ? 1 : 0);

        return {
          project,
          needsAttentionScore,
        };
      })
      .sort((a, b) => {
        if (b.needsAttentionScore !== a.needsAttentionScore) return b.needsAttentionScore - a.needsAttentionScore;
        return a.project.eventDate.localeCompare(b.project.eventDate);
      });
  }, [searchKeyword, sourceProjects]);

  if (mode === "closed") {
    return null;
  }

  const hasKeyword = Boolean(searchKeyword.trim());

  return (
    <>
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">報價成本</h2>
          </div>

          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="搜尋專案名稱 / 客戶"
            className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 lg:max-w-sm"
          />
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {activeProjects.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">客戶名稱</th>
                  <th className="px-4 py-3 font-medium">專案名稱</th>
                  <th className="px-4 py-3 font-medium">活動日期</th>
                  <th className="px-4 py-3 font-medium">報價資料狀態</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {activeProjects.map(({ project }) => (
                  <tr key={project.id}>
                    <td className="px-4 py-3 text-slate-700">{project.clientName}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{project.projectName}</td>
                    <td className="px-4 py-3 text-slate-700">{project.eventDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${project.quotationImported ? "bg-emerald-100 text-emerald-800 ring-emerald-300" : "bg-amber-100 text-amber-800 ring-amber-300"}`}>
                        {project.quotationImported ? "已上傳" : "未上傳"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/quote-costs/${project.id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <WorkspaceEmptyState
            title={hasKeyword ? "找不到符合條件的專案" : "目前尚無可進入的報價成本專案"}
            description={
              hasKeyword
                ? "請調整搜尋條件，或改從其他關鍵字重新查找。"
                : "待正式 DB 端已有執行中專案、確認成本項目或報價資料後，這裡才會出現可承接專案。"
            }
            actions={
              hasKeyword ? (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className={workspacePrimaryButtonClass}
                >
                  清除搜尋
                </button>
              ) : (
                <Link href="/projects" className={workspacePrimaryButtonClass}>
                  前往專案列表
                </Link>
              )
            }
          />
        )}
      </section>
    </>
  );
}
