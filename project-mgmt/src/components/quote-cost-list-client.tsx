"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { QuoteCostProject } from "@/components/quote-cost-data";
import { WorkspaceEmptyState, workspacePrimaryButtonClass } from "@/components/workspace-ui";

export const quoteCostListClientBoundary = {
  mode: "db-only-formal-read-model-consumer",
  fallbackScope: "retired-for-formal-route",
  formalRouteStatus: "db-first-route-consumer",
} as const;

const PROJECTS_PER_PAGE = 10;

function resolveQuoteCostSourceProjects(initialProjects?: QuoteCostProject[]) {
  return initialProjects ?? [];
}

export function QuoteCostListClient({ mode = "active", initialProjects }: { mode?: "active" | "closed"; initialProjects?: QuoteCostProject[] }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const sourceProjects = resolveQuoteCostSourceProjects(initialProjects);

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

  const totalPages = Math.max(1, Math.ceil(activeProjects.length / PROJECTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedProjects = activeProjects.slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE);

  if (mode === "closed") {
    return null;
  }

  const hasKeyword = Boolean(searchKeyword.trim());

  return (
    <>
      <header className="p-1">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="min-w-0">
            <div className="flex min-h-11 flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-50">報價成本</h2>
              <p className="text-sm leading-none text-slate-400">
                目前顯示 <span className="font-semibold text-slate-100">{activeProjects.length}</span> / {sourceProjects.filter((project) => project.projectStatus === "執行中").length} 個專案
              </p>
              <p className="text-sm leading-none text-slate-400">
                第 <span className="font-semibold text-slate-100">{currentPage}</span> / {totalPages} 頁
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center 2xl:w-auto">
            <input
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="搜尋專案名稱 / 客戶"
              className="pf-input h-11 w-full min-w-0 sm:w-80 xl:w-72"
            />
          </div>
        </div>
      </header>

      <section className="p-1">
        {activeProjects.length ? (
          <>
            <div className="pf-table-shell rounded-[28px]">
              <table className="pf-table min-w-[1100px] xl:min-w-full table-fixed">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-medium">客戶名稱</th>
                    <th className="px-4 py-3 font-medium">專案名稱</th>
                    <th className="px-4 py-3 font-medium">活動日期</th>
                    <th className="px-4 py-3 font-medium">報價資料狀態</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {pagedProjects.map(({ project }) => (
                    <tr key={project.id} className="align-middle">
                      <td className="align-middle text-slate-300">{project.clientName}</td>
                      <td className="align-middle font-medium text-slate-100"><Link href={`/quote-costs/${project.id}`} className="underline-offset-4 hover:underline">{project.projectName}</Link></td>
                      <td className="align-middle text-slate-300">{project.eventDate}</td>
                      <td className="align-middle">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${project.quotationImported ? "bg-emerald-400/14 text-emerald-200 ring-emerald-300/20" : "bg-amber-400/14 text-amber-200 ring-amber-300/20"}`}>
                          {project.quotationImported ? "已上傳" : "未上傳"}
                        </span>
                      </td>
                      <td className="align-middle">
                        <Link href={`/quote-costs/${project.id}`} className="pf-btn-secondary px-3 py-2 text-sm">
                          查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">第 {currentPage} / {totalPages} 頁</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="pf-btn-secondary px-4 py-2 disabled:opacity-50"
                >
                  上一頁
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage === totalPages}
                  className="pf-btn-secondary px-4 py-2 disabled:opacity-50"
                >
                  下一頁
                </button>
              </div>
            </div>
          </>
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
                <button type="button" onClick={() => { setSearchKeyword(""); setPage(1); }} className={workspacePrimaryButtonClass}>
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
