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

export function QuoteCostListClient() {
  const activeProjects = quoteCostProjects.filter((project) => project.projectStatus === "執行中");
  const closedProjects = quoteCostProjects.filter((project) => project.projectStatus === "已結案");

  const renderTable = (title: string, description: string, projects: typeof quoteCostProjects) => (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
          共 {projects.length} 筆專案
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
            {projects.map((project) => {
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
                      href={`/quote-costs/${project.id}`}
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
  );

  return (
    <AppShell activePath="/quote-costs">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <p className="text-sm text-slate-500">Quote & Cost Module</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">報價成本</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          以專案為主體管理對外報價、成本、毛利、對帳與結案。列表頁維持只分執行中 / 已結案，不再增加次狀態。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">專案總數</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{quoteCostProjects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">執行中</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{activeProjects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">已結案</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{closedProjects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">已匯入報價單</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{quoteCostProjects.filter((project) => project.quotationImported).length}</p>
        </article>
      </section>

      {renderTable("執行中", "進行中的專案集中在此管理報價、成本與對帳。", activeProjects)}
      {renderTable("已結案", "結案專案保留查看，不另增次狀態分類。", closedProjects)}
    </AppShell>
  );
}
