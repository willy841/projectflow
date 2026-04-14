"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";
import type { QuoteCostProject } from "@/components/quote-cost-data";

const TRACE_PROJECT_ID = "11111111-1111-4111-8111-111111111111";

export function QuoteCostListClient({ mode = "active", initialProjects }: { mode?: "active" | "closed"; initialProjects?: QuoteCostProject[] }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const sourceProjects = initialProjects ?? getQuoteCostProjectsWithWorkflow();

  const tracedSourceProject = useMemo(() => sourceProjects.find((project) => project.id === TRACE_PROJECT_ID) ?? null, [sourceProjects]);

  const activeProjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return sourceProjects
      .filter((project) => project.projectStatus === "執行中")
      .filter((project) => {
        if (!keyword) return true;
        return [project.projectName, project.projectCode, project.clientName].join(" ").toLowerCase().includes(keyword);
      })
      .map((project) => {
        const excludedCostCount = project.costItems.filter((item) => !item.includedInCost).length;
        const unassignedVendorCount = project.costItems.filter((item) => !item.isManual && !item.vendorId).length;
        const needsAttentionScore = excludedCostCount + unassignedVendorCount + (project.reconciliationStatus !== "已完成" ? 1 : 0);

        return {
          project,
          needsAttentionScore,
        };
      })
      .sort((a, b) => {
        if (b.needsAttentionScore !== a.needsAttentionScore) return b.needsAttentionScore - a.needsAttentionScore;
        return a.project.eventDate.localeCompare(b.project.eventDate);
      });
  }, [searchKeyword, sourceProjects]);

  const tracedActiveProject = useMemo(
    () => activeProjects.find(({ project }) => project.id === TRACE_PROJECT_ID)?.project ?? null,
    [activeProjects],
  );

  useEffect(() => {
    console.info("[quote-costs][trace] client-pre-render", {
      traceProjectId: TRACE_PROJECT_ID,
      sourcePresent: Boolean(tracedSourceProject),
      sourceProjectStatus: tracedSourceProject?.projectStatus ?? null,
      sourceCostItemsCount: tracedSourceProject?.costItems.length ?? 0,
      activePresent: Boolean(tracedActiveProject),
      searchKeyword,
      mode,
    });
  }, [mode, searchKeyword, tracedActiveProject, tracedSourceProject]);

  if (mode === "closed") {
    return null;
  }

  return (
    <AppShell activePath="/quote-costs">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">報價成本</h2>
          </div>

          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="搜尋專案名稱 / 客戶"
            className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 lg:max-w-sm"
          />
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-4">
          {activeProjects.map(({ project }) => (
            <article key={project.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-900">{project.projectName}</h3>
                    <span
                      className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${project.quotationImported ? "bg-emerald-100 text-emerald-800 ring-emerald-300" : "bg-amber-100 text-amber-800 ring-amber-300"}`}
                    >
                      {project.quotationImported ? "已上傳" : "未上傳"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">活動日期 {project.eventDate}</p>
                </div>

                <Link
                  href={`/quote-costs/${project.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  查看
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

