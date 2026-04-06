"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const sourceProjects = initialProjects ?? getQuoteCostProjectsWithWorkflow();

  const activeProjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return sourceProjects
      .filter((project) => project.projectStatus === "執行中")
      .filter((project) => {
        if (!keyword) return true;
        return [project.projectName, project.projectCode, project.clientName].join(" ").toLowerCase().includes(keyword);
      })
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
          projectCostTotal,
          grossProfit,
          manualCostCount,
          sourceSummary,
          excludedCostCount,
          unassignedVendorCount,
          needsAttentionScore,
        };
      })
      .sort((a, b) => {
        if (b.needsAttentionScore !== a.needsAttentionScore) return b.needsAttentionScore - a.needsAttentionScore;
        return a.project.eventDate.localeCompare(b.project.eventDate);
      });
  }, [searchKeyword, sourceProjects]);

  if (mode === "closed") {
    return null;
  }

  return (
    <AppShell activePath="/quote-costs">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">報價成本</h2>
            <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
              共 {activeProjects.length} 筆專案
            </div>
          </div>

          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="搜尋專案名稱 / 客戶 / 專案代碼"
            className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 lg:max-w-sm"
          />
        </div>
      </header>

      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-[31%]" />
              <col className="w-[14%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3">專案</th>
                <th className="border-b border-slate-200 px-4 py-3 text-right">對外報價</th>
                <th className="border-b border-slate-200 px-4 py-3 text-right">實際成本</th>
                <th className="border-b border-slate-200 px-4 py-3 text-right">毛利</th>
                <th className="border-b border-slate-200 px-4 py-3">成本來源</th>
                <th className="border-b border-slate-200 px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.map(({ project, quotationTotal, projectCostTotal, grossProfit, manualCostCount, sourceSummary, excludedCostCount, unassignedVendorCount }) => (
                <tr key={project.id} className="align-top text-sm text-slate-700">
                  <td className="border-b border-slate-200 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{project.projectName}</h3>
                      <span className="text-xs text-slate-500">活動日期 {project.eventDate}</span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${project.quotationImported ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                        {project.quotationImported ? "已上傳" : "未上傳"}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getCloseStatusClass(project.closeStatus)}`}>
                        {project.closeStatus}
                      </span>
                    </div>
                    {(excludedCostCount > 0 || unassignedVendorCount > 0 || manualCostCount > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {excludedCostCount > 0 ? <ExceptionBadge label={`未計入 ${excludedCostCount} 筆`} tone="amber" /> : null}
                        {unassignedVendorCount > 0 ? <ExceptionBadge label={`未指定廠商 ${unassignedVendorCount} 筆`} tone="sky" /> : null}
                        {manualCostCount > 0 ? <ExceptionBadge label={`人工 ${manualCostCount} 筆`} tone="slate" /> : null}
                      </div>
                    )}
                  </td>
                  <td className="border-b border-slate-200 px-4 py-4 text-right font-semibold tabular-nums text-slate-900">{formatCurrency(quotationTotal)}</td>
                  <td className="border-b border-slate-200 px-4 py-4 text-right font-semibold tabular-nums text-slate-900">{formatCurrency(projectCostTotal)}</td>
                  <td className="border-b border-slate-200 px-4 py-4 text-right font-semibold tabular-nums text-slate-900">{formatCurrency(grossProfit)}</td>
                  <td className="border-b border-slate-200 px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {sourceSummary.map((item) => (
                        <span key={item.label} className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${item.badgeClass}`}>
                          {item.label} {formatCurrency(item.total)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="border-b border-slate-200 px-4 py-4 text-right">
                    <Link
                      href={`/quote-costs/${project.id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      查看詳情
                    </Link>
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
      total: items.reduce((sum, item) => sum + (item.originalAmount ?? item.adjustedAmount), 0),
      badgeClass: sourceTone[sourceType],
    };
  });
}

function ExceptionBadge({ label, tone }: { label: string; tone: "amber" | "sky" | "slate" }) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  }[tone];

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${toneClass}`}>{label}</span>;
}
