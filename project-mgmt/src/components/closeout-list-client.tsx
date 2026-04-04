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
} from "@/components/quote-cost-data";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";
import { getRelationsByProjectId } from "@/components/project-vendor-financial-store";

export function CloseoutListClient() {
  const closedProjects = getQuoteCostProjectsWithWorkflow()
    .filter((project) => project.projectStatus === "已結案")
    .map((project) => {
      const quotationTotal = getQuotationTotal(project.quotationItems);
      const adjustedCostTotal = getAdjustedCostTotal(project.costItems);
      const grossProfit = getGrossProfit(quotationTotal, adjustedCostTotal);
      const manualCostCount = project.costItems.filter((item) => item.isManual).length;
      const excludedCostCount = project.costItems.filter((item) => !item.includedInCost).length;
      const relations = getRelationsByProjectId(project.id);
      const unpaidRelationCount = relations.filter((relation) => relation.paymentStatus === "未付款").length;
      const unpaidAmount = relations.reduce((sum, relation) => sum + relation.unpaidAmount, 0);

      return {
        project,
        quotationTotal,
        adjustedCostTotal,
        grossProfit,
        manualCostCount,
        excludedCostCount,
        unpaidRelationCount,
        unpaidAmount,
      };
    })
    .sort((a, b) => b.project.eventDate.localeCompare(a.project.eventDate));

  const fullyReconciled = closedProjects.filter(({ project }) => project.reconciliationStatus === "已完成");
  const latestEventDate = closedProjects[0]?.project.eventDate ?? "-";
  const archivedGrossProfit = closedProjects.reduce((sum, item) => sum + item.grossProfit, 0);

  return (
    <AppShell activePath="/closeouts">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <p className="text-sm text-slate-500">結案留存</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">結案</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          這裡只處理已結案專案的留存查閱：先看結案結果，再看報價、成本與例外註記，不再延續進行中管理頁的工作語氣。
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
          <p className="text-sm text-slate-500">封存毛利總額</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{formatCurrency(archivedGrossProfit)}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">最近結案檔期</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{latestEventDate}</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">留存頁定位</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <ArchiveMetric label="查閱重點" value="留存版本" helper="保留有效報價、成本與毛利結果，後續回頭查不用重建脈絡。" />
            <ArchiveMetric label="確認重點" value="結案結果" helper="維持結案當下的狀態與對帳結果，不再回到進行中操作語境。" />
            <ArchiveMetric label="補充重點" value="例外註記" helper="若有人工成本或未計入成本，作為歷史備註存在，不打亂主列表閱讀。" />
          </div>
        </article>

        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">查閱節奏</p>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <p>先按最新檔期查閱，再快速掃描每案的留存摘要與例外筆數。</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">報價留存</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">成本結果</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">例外註記</span>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">已結案專案</h3>
            <p className="mt-1 text-sm text-slate-500">每筆只保留查閱需要的結果資訊，避免看起來像進行中頁面換資料來源。</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            共 {closedProjects.length} 筆專案
          </div>
        </div>

        <div className="space-y-4">
          {closedProjects.map(({ project, quotationTotal, adjustedCostTotal, grossProfit, manualCostCount, excludedCostCount, unpaidRelationCount, unpaidAmount }) => (
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
                  href={`/closeouts/${project.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  查看留存
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <ArchiveValueCard label="對外報價總額" value={formatCurrency(quotationTotal)} />
                <ArchiveValueCard label="調整後成本總額" value={formatCurrency(adjustedCostTotal)} />
                <ArchiveValueCard label="毛利" value={formatCurrency(grossProfit)} />
                <ArchiveValueCard label="留存備註" value={excludedCostCount > 0 || manualCostCount > 0 ? `${excludedCostCount} 筆未計入 / ${manualCostCount} 筆人工` : "無額外例外"} />
                <ArchiveValueCard label="廠商付款承接" value={unpaidRelationCount > 0 ? `${unpaidRelationCount} 筆未付款 / ${formatCurrency(unpaidAmount)}` : "已無未付款"} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function ArchiveMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
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
