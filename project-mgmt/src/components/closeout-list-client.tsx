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
  const closedProjects = quoteCostProjects
    .filter((project) => project.projectStatus === "已結案")
    .map((project) => {
      const quotationTotal = getQuotationTotal(project.quotationItems);
      const adjustedCostTotal = getAdjustedCostTotal(project.costItems);
      const grossProfit = getGrossProfit(quotationTotal, adjustedCostTotal);
      const manualCostCount = project.costItems.filter((item) => item.isManual).length;
      const excludedCostCount = project.costItems.filter((item) => !item.includedInCost).length;

      return {
        project,
        quotationTotal,
        adjustedCostTotal,
        grossProfit,
        manualCostCount,
        excludedCostCount,
      };
    })
    .sort((a, b) => b.project.eventDate.localeCompare(a.project.eventDate));

  return (
    <AppShell activePath="/closeouts">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">結案紀錄</h2>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex justify-end">
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            共 {closedProjects.length} 筆專案
          </div>
        </div>

        <div className="space-y-4">
          {closedProjects.map(({ project, quotationTotal, adjustedCostTotal, grossProfit, manualCostCount, excludedCostCount }) => (
            <article key={project.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xl font-semibold text-slate-900">{project.projectName}</h4>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{project.projectCode}</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getReconciliationStatusClass(project.reconciliationStatus)}`}>
                      {project.reconciliationStatus}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getCloseStatusClass(project.closeStatus)}`}>
                      {project.closeStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{project.clientName} ・ 活動日期 {project.eventDate}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{project.note}</p>
                </div>

                <Link
                  href={`/closeout/${project.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  查看留存
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <ArchiveValueCard label="對外報價總額" value={formatCurrency(quotationTotal)} />
                <ArchiveValueCard label="調整後成本總額" value={formatCurrency(adjustedCostTotal)} />
                <ArchiveValueCard label="毛利" value={formatCurrency(grossProfit)} />
                <ArchiveValueCard label="留存備註" value={excludedCostCount > 0 || manualCostCount > 0 ? `${excludedCostCount} 筆未計入 / ${manualCostCount} 筆人工` : "無額外例外"} />
              </div>
            </article>
          ))}
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
