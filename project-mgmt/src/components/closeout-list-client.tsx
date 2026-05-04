"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/components/quote-cost-data";
import { WorkspaceEmptyState, workspacePrimaryButtonClass } from "@/components/workspace-ui";
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
    <>
      <header className="p-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-50">結案紀錄</h2>
        </div>
      </header>

      <section className="p-1">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="搜尋活動標題 / 客戶名稱"
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20 sm:max-w-sm"
            />
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none transition focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
            >
              <option value="all">全部年份</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setDateSortOrder((current) => (current === "desc" ? "asc" : "desc"))}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 text-sm font-semibold text-slate-100 shadow-[0_22px_46px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-slate-900/70"
            >
              {dateSortOrder === "desc" ? "日期排序：最新" : "日期排序：最舊"}
            </button>
          </div>
        </div>

        {pagedProjects.length ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">客戶名稱</th>
                  <th className="px-4 py-3 font-medium">專案名稱</th>
                  <th className="px-4 py-3 font-medium">活動日期</th>
                  <th className="px-4 py-3 font-medium">對外報價總額</th>
                  <th className="px-4 py-3 font-medium">專案成本</th>
                  <th className="px-4 py-3 font-medium">毛利</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {pagedProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-4 text-slate-300">{project.clientName}</td>
                    <td className="px-4 py-4 font-medium text-slate-100">{project.projectName}</td>
                    <td className="px-4 py-4 text-slate-300">{project.eventDate}</td>
                    <td className="px-4 py-4 text-slate-300">{formatCurrency(project.quotationTotal)}</td>
                    <td className="px-4 py-4 text-slate-300">{formatCurrency(project.projectCostTotal)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-100">{formatCurrency(project.grossProfit)}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/closeouts/${project.id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 shadow-[0_20px_42px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-slate-900/70"
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
            title={searchKeyword.trim() || selectedYear !== 'all' ? '找不到符合條件的結案紀錄' : '目前尚無結案紀錄'}
            description={searchKeyword.trim() || selectedYear !== 'all' ? '請調整搜尋、年份或排序條件後再查看。' : '待專案完成結案後，這裡會顯示可留存的結案紀錄。'}
            actions={
              searchKeyword.trim() || selectedYear !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setSelectedYear('all');
                    setPage(1);
                  }}
                  className={workspacePrimaryButtonClass}
                >
                  清除篩選
                </button>
              ) : (
                <Link href="/quote-costs" className={workspacePrimaryButtonClass}>
                  前往報價成本
                </Link>
              )
            }
          />
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">第 {currentPage} / {totalPages} 頁</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 shadow-[0_20px_42px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 shadow-[0_20px_42px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
