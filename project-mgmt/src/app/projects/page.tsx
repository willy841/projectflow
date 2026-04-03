"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getStatusClass, projects, type ProjectStatus } from "@/components/project-data";

const parseEventDate = (value: string) => new Date(value).getTime();
const projectStatuses: Array<"全部" | ProjectStatus> = ["全部", "執行中", "待發包", "採購中", "已結案"];

export default function ProjectsPage() {
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"全部" | ProjectStatus>("全部");

  const statusCounts = useMemo(
    () => ({
      全部: projects.length,
      執行中: projects.filter((project) => project.status === "執行中").length,
      待發包: projects.filter((project) => project.status === "待發包").length,
      採購中: projects.filter((project) => project.status === "採購中").length,
      已結案: projects.filter((project) => project.status === "已結案").length,
    }),
    [],
  );

  const visibleProjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return projects
      .filter((project) => (statusFilter === "全部" ? true : project.status === statusFilter))
      .filter((project) => {
        if (!keyword) return true;
        return [project.name, project.client, project.location, project.code, project.owner].some((value) => value.toLowerCase().includes(keyword));
      })
      .sort((a, b) => {
        const dateDiff = parseEventDate(a.eventDate) - parseEventDate(b.eventDate);
        if (dateDiff !== 0) return dateSortOrder === "asc" ? dateDiff : -dateDiff;
        return a.name.localeCompare(b.name, "zh-Hant");
      });
  }, [dateSortOrder, searchKeyword, statusFilter]);

  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">專案管理台</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">專案管理</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              以專案為主入口，快速查看狀態、活動日期與成本節奏，並直接進入詳情工作流。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 2xl:min-w-[420px]">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">全部專案</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{projects.length}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">執行中</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{statusCounts["執行中"]}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">平均進度</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length)}%
              </p>
            </article>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex min-h-11 flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold leading-none">專案總表</h3>
                <p className="text-sm leading-none text-slate-500">
                  目前顯示 <span className="font-semibold text-slate-800">{visibleProjects.length}</span> / {projects.length} 筆
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:items-center">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm font-medium text-slate-600">搜尋</span>
                <input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="專案 / 客戶 / 地點 / 代碼 / 負責人"
                  className="h-11 w-full min-w-0 bg-transparent text-sm outline-none sm:w-80 xl:w-80"
                />
              </div>
              <Link
                href="/projects/new"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                + 新增專案
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {projectStatuses.map((status) => {
                const active = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                      active ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {status}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {statusCounts[status]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">排序</span>
              <button
                type="button"
                onClick={() => setDateSortOrder((current) => (current === "asc" ? "desc" : "asc"))}
                className="inline-flex h-10 items-center rounded-full bg-white px-4 font-medium ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                活動日期 {dateSortOrder === "asc" ? "↑ 最舊" : "↓ 最新"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1280px] table-fixed divide-y divide-slate-200 text-left text-sm xl:min-w-full">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[8.5%]" />
              <col className="w-[8.5%]" />
              <col className="w-[11%]" />
            </colgroup>
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">專案 / 代碼</th>
                <th className="px-4 py-3 font-medium">活動日期</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">地點</th>
                <th className="px-4 py-3 font-medium">負責人</th>
                <th className="px-4 py-3 text-right font-medium">預算</th>
                <th className="px-4 py-3 text-right font-medium">成本</th>
                <th className="px-4 py-3 font-medium">進度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleProjects.map((project) => (
                <tr key={project.id} className="align-middle transition hover:bg-slate-50/70">
                  <td className="px-4 py-4 align-middle">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-slate-900 px-2 text-xs font-semibold text-white">
                          {project.code.slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/projects/${project.id}`} className="line-clamp-2 font-semibold text-slate-900 underline-offset-4 hover:underline">
                            {project.name}
                          </Link>
                          <p className="mt-1 text-xs font-medium tracking-[0.08em] text-slate-500">{project.code}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.eventDate}</td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.client}</td>
                  <td className="px-4 py-4 align-middle">
                    <span className={`inline-flex min-w-[72px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle text-slate-600">
                    <p className="line-clamp-2">{project.location}</p>
                  </td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.owner}</td>
                  <td className="px-4 py-4 text-right align-middle font-medium tabular-nums text-slate-700">{project.budget}</td>
                  <td className="px-4 py-4 text-right align-middle font-medium tabular-nums text-slate-700">{project.cost}</td>
                  <td className="px-4 py-4 align-middle">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>進度</span>
                        <span className="font-semibold tabular-nums text-slate-700">{project.progress}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">待推進事項</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{statusCounts["待發包"] + statusCounts["採購中"]}</p>
          <p className="mt-2 text-sm text-slate-500">方便快速抓出仍在推進中的專案節點。</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">排序與檢索</p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">預設依活動日期最新在上，可依表頭切換。</p>
          <p className="mt-2 text-sm text-slate-500">搜尋支援專案、客戶、地點、專案代碼與負責人。</p>
        </article>
      </section>
    </AppShell>
  );
}
