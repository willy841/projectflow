"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getStatusClass, projects } from "@/components/project-data";

const parseEventDate = (value: string) => new Date(value).getTime();

export default function ProjectsPage() {
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");
  const [searchKeyword, setSearchKeyword] = useState("");

  const visibleProjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    const filteredProjects = keyword
      ? projects.filter((project) => {
          return [project.name, project.client, project.location, project.code].some((value) => value.toLowerCase().includes(keyword));
        })
      : projects;

    return [...filteredProjects].sort((a, b) => {
      const dateDiff = parseEventDate(a.eventDate) - parseEventDate(b.eventDate);
      return dateSortOrder === "asc" ? dateDiff : -dateDiff;
    });
  }, [dateSortOrder, searchKeyword]);

  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Project List</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">專案列表</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              先提供管理者快速檢視所有專案的狀態、預算、成本與活動日期，後續可再接搜尋、篩選與真實資料來源。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
              篩選條件
            </button>
            <Link
              href="/projects/new"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + 新增專案
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">專案總數</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{projects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">執行中</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {projects.filter((project) => project.status === "執行中").length}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">待發包 / 採購中</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {projects.filter((project) => ["待發包", "採購中"].includes(project.status)).length}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">平均進度</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length)}%
          </p>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold">全部專案</h3>
              <p className="text-sm text-slate-500">
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
            <p className="text-sm text-slate-500">日期排序：{dateSortOrder === "desc" ? "最新在上" : "最舊在上"}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1180px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
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
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">預算</th>
                <th className="px-4 py-3 font-medium">成本</th>
                <th className="px-4 py-3 font-medium">負責人</th>
                <th className="px-4 py-3 font-medium">進度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleProjects.map((project) => (
                <tr key={project.id} className="align-middle">
                  <td className="px-4 py-4 align-middle">
                    <Link href={`/projects/${project.id}`} className="font-medium text-slate-900 underline-offset-4 hover:underline">
                      {project.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{project.code}</p>
                  </td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.client}</td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.eventDate}</td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.location}</td>
                  <td className="px-4 py-4 align-middle">
                    <span className={`inline-flex min-w-[72px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.budget}</td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.cost}</td>
                  <td className="px-4 py-4 align-middle text-slate-600">{project.owner}</td>
                  <td className="px-4 py-4 align-middle">
                    <div className="w-28 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{project.progress}%</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
