"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProjectRouteId, type Project } from "@/components/project-data";
import { formatCurrency, getProjectCostTotal, getQuotationTotal } from "@/components/quote-cost-data";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";
import { WorkspaceEmptyState, WorkspaceStatusNotice, workspacePrimaryButtonClass } from "@/components/workspace-ui";
import { isUuidLike } from "@/lib/db/project-flow-toggle";

const parseEventDate = (value: string) => new Date(value).getTime();
const PROJECTS_PER_PAGE = 10;
const PROJECT_STATUS_FILTERS = ["全部", "執行中", "待發包", "採購中"] as const;
type ProjectStatusFilter = (typeof PROJECT_STATUS_FILTERS)[number];

export function ProjectsPageClient({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>("全部");
  const [page, setPage] = useState(1);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [pendingDeleteProject, setPendingDeleteProject] = useState<Project | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const visibleProjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const financialProjects = getQuoteCostProjectsWithWorkflow();

    const filteredProjects = projects.filter((project) => {
      const matchesKeyword =
        !keyword || [project.name, project.client, project.location, project.code, project.owner].some((value) => value.toLowerCase().includes(keyword));
      const matchesStatus = statusFilter === "全部" || project.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });

    return [...filteredProjects]
      .map((project) => {
        const financialProject = financialProjects.find((item) => item.id === project.id || item.projectName === project.name);
        const budget = financialProject ? formatCurrency(getQuotationTotal(financialProject.quotationItems, financialProject.quotationImport)) : project.budget;
        const cost = financialProject ? formatCurrency(getProjectCostTotal(financialProject.costItems)) : project.cost;

        return {
          ...project,
          budget,
          cost,
        };
      })
      .sort((a, b) => {
        const dateDiff = parseEventDate(a.eventDate) - parseEventDate(b.eventDate);
        return dateSortOrder === "asc" ? dateDiff : -dateDiff;
      });
  }, [dateSortOrder, projects, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / PROJECTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedProjects = visibleProjects.slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE);

  async function confirmDeleteProject() {
    if (!pendingDeleteProject) return;

    setDeletingProjectId(pendingDeleteProject.id);
    setDeleteError("");

    try {
      const response = await fetch(`/api/projects/${pendingDeleteProject.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmProjectName: deleteConfirmName,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setDeleteError(result.error || "刪除專案失敗");
        return;
      }

      const deletedProjectId = pendingDeleteProject.id;
      setProjects((current) => current.filter((project) => project.id !== deletedProjectId));
      setPendingDeleteProject(null);
      setDeleteConfirmName("");
      router.push(`/projects?deleted=${encodeURIComponent(deletedProjectId)}`);
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "刪除專案失敗");
    } finally {
      setDeletingProjectId(null);
    }
  }

  const isDeleteNameMatched = pendingDeleteProject ? deleteConfirmName.trim() === pendingDeleteProject.name : false;

  return (
    <>
      <header className="p-1">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="min-w-0">
            <div className="flex min-h-11 flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-50">專案列表</h2>
              <p className="text-sm leading-none text-slate-400">
                目前顯示 <span className="font-semibold text-slate-100">{visibleProjects.length}</span> / {projects.length} 個專案
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
              placeholder="搜尋專案 / 客戶 / 地點"
              className="h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-slate-900/45 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-sky-300/30 sm:w-80 xl:w-72"
            />
            <Link href="/projects/new" className={workspacePrimaryButtonClass}>
              + 新增專案
            </Link>
          </div>
        </div>
      </header>

      <section className="p-1">

        <div className="mb-5 flex flex-wrap gap-2">
          {PROJECT_STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setStatusFilter(filter);
                  setPage(1);
                }}
                className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${
                  isActive ? "bg-slate-900 text-white ring-slate-900" : "bg-white/8 text-slate-300 ring-white/10 hover:bg-white/12"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {visibleProjects.length ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl">
            <table className="min-w-[1280px] divide-y divide-white/10 text-left text-sm xl:min-w-full">
              <thead className="bg-white/[0.04] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">專案名稱</th>
                  <th className="px-4 py-3 font-medium">客戶</th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => setDateSortOrder((current) => (current === "asc" ? "desc" : "asc"))}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-left transition ${
                        dateSortOrder === "asc" || dateSortOrder === "desc"
                          ? "bg-white/10 text-slate-100 shadow-sm"
                          : "text-slate-400"
                      } hover:bg-white/12 hover:text-white`}
                    >
                      <span>活動日期</span>
                      <span className={`text-xs ${dateSortOrder === "asc" || dateSortOrder === "desc" ? "text-slate-200" : "text-slate-400"}`}>
                        {dateSortOrder === "asc" ? "↑ 最舊" : "↓ 最新"}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">地點</th>
                  <th className="px-4 py-3 font-medium">預算</th>
                  <th className="px-4 py-3 font-medium">成本</th>
                  <th className="px-4 py-3 font-medium">負責人</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {pagedProjects.map((project) => {
                  const isDbProject = isUuidLike(project.id);
                  const isDeleting = deletingProjectId === project.id;

                  return (
                    <tr key={project.id} className="align-middle">
                      <td className="px-4 py-4 align-middle">
                        <Link href={`/projects/${getProjectRouteId(project)}`} className="font-medium text-slate-100 underline-offset-4 hover:underline">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 align-middle text-slate-300">{project.client}</td>
                      <td className="px-4 py-4 align-middle text-slate-300">{project.eventDate}</td>
                      <td className="px-4 py-4 align-middle text-slate-300">{project.location}</td>
                      <td className="px-4 py-4 align-middle text-slate-300">{project.budget}</td>
                      <td className="px-4 py-4 align-middle text-slate-300">{project.cost}</td>
                      <td className="px-4 py-4 align-middle text-slate-300">{project.owner}</td>
                      <td className="px-4 py-4 align-middle text-right">
                        {isDbProject ? (
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => {
                              setDeleteError("");
                              setDeleteConfirmName("");
                              setPendingDeleteProject(project);
                            }}
                            className="inline-flex items-center justify-center rounded-2xl border border-rose-400/20 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? "刪除中..." : "刪除"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">僅 DB 專案可刪除</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <WorkspaceEmptyState
            title={searchKeyword.trim() || statusFilter !== "全部" ? "找不到符合條件的專案" : "目前尚無執行中專案"}
            description={searchKeyword.trim() || statusFilter !== "全部" ? "請調整搜尋或狀態條件後再查看。" : "建立新專案後，這裡會顯示可進入的執行中專案。"}
            actions={
              searchKeyword.trim() || statusFilter !== "全部" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setStatusFilter("全部");
                    setPage(1);
                  }}
                  className={workspacePrimaryButtonClass}
                >
                  清除篩選
                </button>
              ) : (
                <Link href="/projects/new" className={workspacePrimaryButtonClass}>
                  建立新專案
                </Link>
              )
            }
          />
        )}

        {visibleProjects.length ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">第 {currentPage} / {totalPages} 頁</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                上一頁
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                下一頁
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {pendingDeleteProject ? (
        <section className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6 shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54)] backdrop-blur-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-100">確認刪除專案</h3>
              <p className="mt-1 text-sm text-slate-300">
                你即將刪除 <span className="font-semibold text-slate-100">{pendingDeleteProject.name}</span>。
              </p>
              <p className="mt-2 text-sm text-rose-200">此動作不可回復，請手動輸入專案名稱後再刪除。</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingDeleteProject(null);
                setDeleteConfirmName("");
                setDeleteError("");
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/60"
            >
              取消
            </button>
          </div>

          <div className="mt-5 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(36,48,72,0.76),rgba(14,22,39,0.52))] p-4 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px]">
            <p className="text-sm font-medium text-slate-200">請輸入專案名稱確認刪除</p>
            <p className="mt-1 text-xs text-slate-400">必須完整輸入：{pendingDeleteProject.name}</p>
            <input
              value={deleteConfirmName}
              onChange={(event) => setDeleteConfirmName(event.target.value)}
              placeholder="輸入專案名稱"
              className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-slate-900/45 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-rose-300/30"
            />
            {!isDeleteNameMatched && deleteConfirmName ? <p className="mt-2 text-xs text-rose-200">名稱不一致，無法刪除。</p> : null}
          </div>

          {deleteError ? (
            <div className="mt-4" data-testid="project-delete-inline-error">
              <WorkspaceStatusNotice tone="error">{deleteError}</WorkspaceStatusNotice>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={confirmDeleteProject}
              disabled={deletingProjectId === pendingDeleteProject.id || !isDeleteNameMatched}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingProjectId === pendingDeleteProject.id ? "刪除中..." : "確認刪除專案"}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
