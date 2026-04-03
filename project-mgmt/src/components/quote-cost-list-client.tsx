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

export function QuoteCostListClient({ mode = "active" }: { mode?: "active" | "closed" }) {
  const activeProjects = quoteCostProjects
    .filter((project) => project.projectStatus === "執行中")
    .map((project) => {
      const quotationTotal = getQuotationTotal(project.quotationItems);
      const adjustedCostTotal = getAdjustedCostTotal(project.costItems);
      const grossProfit = getGrossProfit(quotationTotal, adjustedCostTotal);
      const excludedCostCount = project.costItems.filter((item) => !item.includedInCost).length;
      const unassignedVendorCount = project.costItems.filter((item) => !item.isManual && !item.vendorId).length;
      const manualCostCount = project.costItems.filter((item) => item.isManual).length;
      const needsAttentionScore = excludedCostCount + unassignedVendorCount + (project.reconciliationStatus !== "已完成" ? 1 : 0);

      return {
        project,
        quotationTotal,
        adjustedCostTotal,
        grossProfit,
        excludedCostCount,
        unassignedVendorCount,
        manualCostCount,
        needsAttentionScore,
      };
    })
    .sort((a, b) => {
      if (b.needsAttentionScore !== a.needsAttentionScore) return b.needsAttentionScore - a.needsAttentionScore;
      return a.project.eventDate.localeCompare(b.project.eventDate);
    });

  if (mode === "closed") {
    return null;
  }

  const importedProjects = activeProjects.filter(({ project }) => project.quotationImported);
  const pendingReconciliationProjects = activeProjects.filter(({ project }) => project.reconciliationStatus !== "已完成");
  const unreconciledCostProjects = activeProjects.filter(({ excludedCostCount }) => excludedCostCount > 0);
  const unassignedVendorProjects = activeProjects.filter(({ unassignedVendorCount }) => unassignedVendorCount > 0);

  return (
    <AppShell activePath="/quote-costs">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <p className="text-sm text-slate-500">Quote & Cost Module</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">報價成本</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          這裡只保留執行中專案，集中管理有效報價、成本調整與對帳收斂。畫面重點不是歷史留存，而是先看哪一案還需要往前推進。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">執行中專案</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{activeProjects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">已匯入報價單</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{importedProjects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">待完成對帳</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{pendingReconciliationProjects.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">需先收斂成本例外</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{Math.max(unreconciledCostProjects.length, unassignedVendorProjects.length)}</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">管理焦點</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <FocusMetric label="待確認對帳" value={`${pendingReconciliationProjects.length} 案`} helper="先完成毛利確認，避免後續成本調整反覆重開。" />
            <FocusMetric label="未計入成本項目" value={`${activeProjects.reduce((sum, item) => sum + item.excludedCostCount, 0)} 筆`} helper="保留例外，但要明確讓團隊知道哪些尚未進總成本。" />
            <FocusMetric label="未指定廠商" value={`${activeProjects.reduce((sum, item) => sum + item.unassignedVendorCount, 0)} 筆`} helper="不新增狀態分類，直接用現有資料凸顯需補齊的發包關聯。" />
          </div>
        </article>

        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">列表排序邏輯</p>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <p>先看需處理例外較多的案子，再看較接近檔期的專案。</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">未計入成本</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">未指定廠商</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">待完成對帳</span>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">執行中專案管理台</h3>
            <p className="mt-1 text-sm text-slate-500">沿用既有報價成本列表，但把主閱讀軸拉回管理優先序與例外收斂。</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            共 {activeProjects.length} 筆專案
          </div>
        </div>

        <div className="space-y-4">
          {activeProjects.map(({ project, quotationTotal, adjustedCostTotal, grossProfit, excludedCostCount, unassignedVendorCount, manualCostCount, needsAttentionScore }) => (
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

                <div className="flex flex-col items-start gap-2 xl:items-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${needsAttentionScore > 1 ? "border border-amber-200 bg-amber-50 text-amber-800" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {needsAttentionScore > 1 ? "優先收斂" : "節奏穩定"}
                  </span>
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
                <MetricCard label="調整後成本總額" value={formatCurrency(adjustedCostTotal)} />
                <MetricCard label="毛利" value={formatCurrency(grossProfit)} />
                <MetricCard label="人工成本筆數" value={`${manualCostCount} 筆`} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {excludedCostCount > 0 && <ExceptionBadge label={`未計入成本 ${excludedCostCount} 筆`} tone="amber" />}
                {unassignedVendorCount > 0 && <ExceptionBadge label={`未指定廠商 ${unassignedVendorCount} 筆`} tone="sky" />}
                {manualCostCount > 0 && <ExceptionBadge label={`人工成本 ${manualCostCount} 筆`} tone="slate" />}
                {excludedCostCount === 0 && unassignedVendorCount === 0 && <ExceptionBadge label="目前無成本例外" tone="emerald" />}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function FocusMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-white/70 p-4">
      <p className="text-xs font-medium text-amber-700">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function ExceptionBadge({ label, tone }: { label: string; tone: "amber" | "sky" | "slate" | "emerald" }) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  }[tone];

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClass}`}>{label}</span>;
}
