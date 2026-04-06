"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  formatCurrency,
  getCloseStatusClass,
  getFormalOriginalCostTotal,
  getGrossProfit,
  getAdditionalManualCostTotal,
  getQuotationTotal,
  type CostSourceType,
} from "@/components/quote-cost-data";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";
import type { QuoteCostProject } from "@/components/quote-cost-data";

export function QuoteCostListClient({ mode = "active", initialProjects }: { mode?: "active" | "closed"; initialProjects?: QuoteCostProject[] }) {
  const sourceProjects = initialProjects ?? getQuoteCostProjectsWithWorkflow();
  const activeProjects = sourceProjects
    .filter((project) => project.projectStatus === "執行中")
    .map((project) => {
      const quotationTotal = getQuotationTotal(project.quotationItems);
      const originalCostTotal = getFormalOriginalCostTotal(project.costItems);
      const additionalManualCostTotal = getAdditionalManualCostTotal(project.costItems);
      const projectCostTotal = originalCostTotal + additionalManualCostTotal;
      const grossProfit = getGrossProfit(quotationTotal, projectCostTotal);
      const excludedCostCount = project.costItems.filter((item) => !item.includedInCost).length;
      const unassignedVendorCount = project.costItems.filter((item) => !item.isManual && !item.vendorId).length;
      const manualCostCount = project.costItems.filter((item) => item.isManual).length;
      const needsAttentionScore = excludedCostCount + unassignedVendorCount + (project.reconciliationStatus !== "已完成" ? 1 : 0);

      const sourceSummary = getSourceSummary(project.costItems);

      return {
        project,
        quotationTotal,
        originalCostTotal,
        additionalManualCostTotal,
        projectCostTotal,
        grossProfit,
        excludedCostCount,
        unassignedVendorCount,
        manualCostCount,
        needsAttentionScore,
        sourceSummary,
      };
    })
    .sort((a, b) => {
      if (b.needsAttentionScore !== a.needsAttentionScore) return b.needsAttentionScore - a.needsAttentionScore;
      return a.project.eventDate.localeCompare(b.project.eventDate);
    });

  if (mode === "closed") {
    return null;
  }

  return (
    <AppShell activePath="/quote-costs">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">報價成本</h2>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            共 {activeProjects.length} 筆專案
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <div className="space-y-4">
          {activeProjects.map(({ project, quotationTotal, projectCostTotal, grossProfit, manualCostCount, sourceSummary }) => (
            <article key={project.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xl font-semibold text-slate-900">{project.projectName}</h4>
                      <span className="text-sm text-slate-600">活動日期 {project.eventDate}</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${project.quotationImported ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                        {project.quotationImported ? "已上傳" : "未上傳"}
                      </span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getCloseStatusClass(project.closeStatus)}`}>
                        {project.closeStatus}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/quote-costs/${project.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    查看詳情
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="對外報價總額" value={formatCurrency(quotationTotal)} />
                <MetricCard label="實際成本" value={formatCurrency(projectCostTotal)} />
                <MetricCard label="毛利" value={formatCurrency(grossProfit)} />
                <MetricCard label="人工更正新增費用筆數" value={`${manualCostCount} 筆`} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {sourceSummary.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${item.badgeClass}`}>{item.label}</span>
                      <span className="text-xs text-slate-500">正式成立成本</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function getSourceSummary(costItems: Array<{ sourceType: CostSourceType; adjustedAmount: number; originalAmount?: number; includedInCost: boolean }>) {
  const sourceOrder: CostSourceType[] = ["設計", "備品", "廠商"];
  const sourceTone: Record<CostSourceType, string> = {
    設計: "bg-blue-50 text-blue-700 ring-blue-200",
    備品: "bg-amber-50 text-amber-700 ring-amber-200",
    廠商: "bg-violet-50 text-violet-700 ring-violet-200",
    人工: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return sourceOrder.map((sourceType) => {
    const items = costItems.filter((item) => item.sourceType === sourceType && item.includedInCost);
    return {
      label: sourceType,
      count: items.length,
      total: items.reduce((sum, item) => sum + (item.originalAmount ?? item.adjustedAmount), 0),
      badgeClass: sourceTone[sourceType],
    };
  });
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

