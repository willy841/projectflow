"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  formatCurrency,
  getAdjustedCostTotal,
  getCloseStatusClass,
  getGrossProfit,
  getQuotationTotal,
  getReconciliationStatusClass,
  quoteCostProjects,
} from "@/components/quote-cost-data";

export function CloseoutListClient() {
  const closedProjects = quoteCostProjects.filter((project) => project.projectStatus === "已結案");
  const fullyReconciled = closedProjects.filter((project) => project.reconciliationStatus === "已完成");
  const latestEventDate = [...closedProjects].sort((a, b) => b.eventDate.localeCompare(a.eventDate))[0]?.eventDate ?? "-";

  return (
    <AppShell activePath="/closeout">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <p className="text-sm text-slate-500">Closeout Archive</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">結案</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          集中查看已完成專案的報價、成本、毛利與對帳結果。此區以歷史查閱與結果確認為主，不混入進行中管理節奏。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">已結案專案</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{closedProjects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">已完成對帳</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{fullyReconciled.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">最近結案檔期</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{latestEventDate}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">查閱定位</p>
          <p className="mt-3 text-base font-semibold leading-7 text-slate-900">歷史留存 / 結果確認</p>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">已結案專案列表</h3>
            <p className="mt-1 text-sm text-slate-500">保留結案當下的報價與成本結果，供後續查閱與確認。</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            共 {closedProjects.length} 筆專案
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1080px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">專案</th>
                <th className="px-4 py-3 font-medium">客戶</th>
                <th className="px-4 py-3 font-medium">活動日期</th>
                <th className="px-4 py-3 font-medium">對外報價總額</th>
                <th className="px-4 py-3 font-medium">調整後成本總額</th>
                <th className="px-4 py-3 font-medium">毛利</th>
                <th className="px-4 py-3 font-medium">對帳狀態</th>
                <th className="px-4 py-3 font-medium">結案狀態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {closedProjects.map((project) => {
                const quotationTotal = getQuotationTotal(project.quotationItems);
                const adjustedCostTotal = getAdjustedCostTotal(project.costItems);
                const grossProfit = getGrossProfit(quotationTotal, adjustedCostTotal);

                return (
                  <tr key={project.id} className="align-middle">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{project.projectName}</p>
                      <p className="mt-1 text-xs text-slate-500">{project.projectCode}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{project.clientName}</td>
                    <td className="px-4 py-4 text-slate-600">{project.eventDate}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{formatCurrency(quotationTotal)}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{formatCurrency(adjustedCostTotal)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(grossProfit)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getReconciliationStatusClass(project.reconciliationStatus)}`}>
                        {project.reconciliationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getCloseStatusClass(project.closeStatus)}`}>
                        {project.closeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/closeout/${project.id}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
