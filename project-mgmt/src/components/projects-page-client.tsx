"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getProjectRouteId, getStatusClass, type Project } from "@/components/project-data";
import { formatCurrency, getProjectCostTotal, getQuotationTotal } from "@/components/quote-cost-data";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";
import { isUuidLike } from "@/lib/db/project-flow-toggle";

const parseEventDate = (value: string) => new Date(value).getTime();

export function ProjectsPageClient({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");
  const [searchKeyword, setSearchKeyword] = useState("");
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

    const filteredProjects = keyword
      ? projects.filter((project) => {
          return [project.name, project.client, project.location, project.code].some((value) => value.toLowerCase().includes(keyword));
        })
      : projects;

    return [...filteredProjects]
      .map((project) => {
        const financialProject = financialProjects.find((item) => item.id === project.id || item.projectName === project.name);
        const budget = financialProject ? formatCurrency(getQuotationTotal(financialProject.quotationItems)) : project.budget;
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
  }, [dateSortOrder, projects, searchKeyword]);

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
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight">專案列表</h2>
            <span className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">共 {projects.length} 筆專案</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              + 新增專案
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-h-11 flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold leading-none">全部專案</h3>
              <p className="text-sm leading-none text-slate-500">
                目前顯示 <span className="font-semibold text-slate-800">{visibleProjects.length}</span> / {projects.length} 個專案
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:items-center xl:w-auto">
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="搜尋專案 / 客戶 / 地點 / 專案代碼"
              className="h-11 w-full min-w-0 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:w-80 xl:w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1280px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">專案名稱</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => setDateSortOrder((current) => (current === "asc" ? "desc" : "asc"))}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-left transition ${
                      dateSortOrder === "asc" || dateSortOrder === "desc"
                        ? "bg-slate-200 text-slate-900 shadow-sm"
                        : "text-slate-500"
                    } hover:bg-slate-200 hover:text-slate-900`}
                  >
                    <span>活動日期</span>
                    <span className={`text-xs ${dateSortOrder === "asc" || dateSortOrder === "desc" ? "text-slate-700" : "text-slate-400"}`}>
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
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleProjects.map((project) => {
                const isDbProject = isUuidLike(project.id);
                const isDeleting = deletingProjectId === project.id;

                return (
                  <tr key={project.id} className="align-middle">
                    <td className="px-4 py-4 align-middle">
                      <Link href={`/projects/${getProjectRouteId(project)}`} className="font-medium text-slate-900 underline-offset-4 hover:underline">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 align-middle text-slate-600">{project.client}</td>
                    <td className="px-4 py-4 align-middle text-slate-600">{project.eventDate}</td>
                    <td className="px-4 py-4 align-middle text-slate-600">{project.location}</td>
                    <td className="px-4 py-4 align-middle text-slate-600">{project.budget}</td>
                    <td className="px-4 py-4 align-middle text-slate-600">{project.cost}</td>
                    <td className="px-4 py-4 align-middle text-slate-600">{project.owner}</td>
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
                          className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
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
      </section>

      {pendingDeleteProject ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-sm ring-1 ring-rose-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">確認刪除專案</h3>
              <p className="mt-1 text-sm text-slate-600">
                你即將刪除 <span className="font-semibold text-slate-900">{pendingDeleteProject.name}</span>。
              </p>
              <p className="mt-2 text-sm text-rose-700">此動作不可回復，請手動輸入專案名稱後再刪除。</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingDeleteProject(null);
                setDeleteConfirmName("");
                setDeleteError("");
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              取消
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-sm font-medium text-slate-700">請輸入專案名稱確認刪除</p>
            <p className="mt-1 text-xs text-slate-500">必須完整輸入：{pendingDeleteProject.name}</p>
            <input
              value={deleteConfirmName}
              onChange={(event) => setDeleteConfirmName(event.target.value)}
              placeholder="輸入專案名稱"
              className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
            {!isDeleteNameMatched && deleteConfirmName ? (
              <p className="mt-2 text-xs text-rose-700">名稱不一致，無法刪除。</p>
            ) : null}
          </div>

          {deleteError ? <p className="mt-4 text-sm text-rose-700">{deleteError}</p> : null}

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
    </AppShell>
  );
}
