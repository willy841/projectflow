"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { formatCurrency } from "@/components/quote-cost-data";
import type { CloseoutListRow } from "@/lib/db/closeout-list-read-model";

const ITEMS_PER_PAGE = 10;

export function CloseoutListClient({ initialProjects }: { initialProjects: CloseoutListRow[] }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [dateSortOrder, setDateSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(initialProjects.map((project) => project.eventYear))).filter((year) => year !== '-').sort((a, b) => Number(b) - Number(a));
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    const next = initialProjects.filter((project) => {
      const matchesKeyword = !keyword || [project.projectName, project.clientName].join(" ").toLowerCase().includes(keyword);
      const matchesYear = selectedYear === "all" || project.eventYear === selectedYear;
      return matchesKeyword && matchesYear;
    });

    next.sort((a, b) => dateSortOrder === "desc"
      ? b.eventDate.localeCompare(a.eventDate)
      : a.eventDate.localeCompare(b.eventDate));

    return next;
  }, [dateSortOrder, initialProjects, searchKeyword, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedProjects = filteredProjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <AppShell activePath="/closeouts">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">結案紀錄</h2>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="搜尋活動標題 / 客戶名稱"
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:max-w-sm"
            />
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="all">全部年份</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setDateSortOrder((current) => (current === "desc" ? "asc" : "desc"))}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {dateSortOrder === "desc" ? "日期排序：最新" : "日期排序：最舊"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {pagedProjects.map((project) => (
            <article key={project.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-slate-900">{project.projectName}</h4>
                  <p className="mt-2 text-sm text-slate-600">{project.clientName} ・ 活動日期 {project.eventDate}</p>
                </div>

                <Link
                  href={`/closeout/${project.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  查看留存
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <ArchiveValueCard label="對外報價總額" value={formatCurrency(project.quotationTotal)} />
                <ArchiveValueCard label="專案成本" value={formatCurrency(project.projectCostTotal)} />
                <ArchiveValueCard label="毛利" value={formatCurrency(project.grossProfit)} />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">第 {currentPage} / {totalPages} 頁</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function ArchiveValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}
