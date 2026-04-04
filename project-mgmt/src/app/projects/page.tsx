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
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight">專案列表</h2>
            <span className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">共 {projects.length} 筆專案</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleProjects.map((project) => (
                <tr key={project.id} className="align-middle">
                  <td className="px-4 py-4 align-middle">
                    <Link href={`/projects/${project.id}`} className="font-medium text-slate-900 underline-offset-4 hover:underline">
                      {project.name}
                    </Link>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
