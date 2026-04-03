"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CopyEventInfoButton } from "@/components/copy-event-info-button";
import { ExecutionTreeSection } from "@/components/execution-tree-section";
import { Project } from "@/components/project-data";
import { getProjectWorkflowCostSummary } from "@/components/project-workflow-store";
import { RequirementsPanel } from "@/components/requirements-panel";

export function ProjectDetailShell({ project }: { project: Project }) {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: project.name,
    client: project.client,
    eventDate: project.eventDate,
    location: project.location,
    loadInTime: project.loadInTime,
    eventType: project.eventType,
    contactName: project.contactName,
    contactPhone: project.contactPhone,
    contactEmail: project.contactEmail,
    contactLine: project.contactLine,
    owner: project.owner,
    budget: project.budget,
    cost: project.cost,
    note: project.note,
  });

  function updateField(key: keyof typeof projectForm, value: string) {
    setProjectForm((prev) => ({ ...prev, [key]: value }));
  }

  const workflowCostSummary = useMemo(() => getProjectWorkflowCostSummary(project.id), [project.id]);
  const workflowAdjustedCost = workflowCostSummary?.label ?? null;
  const hasWorkflowCost = Boolean(workflowCostSummary && workflowCostSummary.workflowItemCount > 0);

  useEffect(() => {
    if (!workflowAdjustedCost) return;
    setProjectForm((prev) => (prev.cost === workflowAdjustedCost ? prev : { ...prev, cost: workflowAdjustedCost }));
  }, [workflowAdjustedCost]);

  return (
    <>
      <header className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 xl:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{projectForm.name}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <CopyEventInfoButton
              projectName={projectForm.name}
              eventDate={projectForm.eventDate}
              location={projectForm.location}
              loadInTime={projectForm.loadInTime}
            />
            <Link href="/projects" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
              返回列表
            </Link>
            <button
              type="button"
              onClick={() => setIsEditingProject((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {isEditingProject ? "收合編輯專案" : "編輯專案"}
            </button>
          </div>
        </div>
      </header>

      {isEditingProject ? (
        <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm ring-1 ring-blue-100">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">編輯專案</h3>
              <p className="mt-1 text-sm text-slate-500">這一版先做同頁前端編輯流程，讓您可直接調整專案資訊與進場時間。</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              可立即驗收
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["name", "專案名稱", "例如：春季品牌快閃活動", "text"],
              ["client", "客戶名稱", "例如：森野生活", "text"],
              ["eventDate", "活動日期", "", "date"],
              ["location", "活動地點", "例如：松山文創園區", "text"],
              ["loadInTime", "進場時間", "", "time"],
              ["eventType", "活動類型", "例如：品牌快閃", "text"],
              ["owner", "專案負責人", "例如：Willy", "text"],
              ["contactName", "聯繫人", "例如：林雅晴", "text"],
              ["contactPhone", "電話", "例如：0912-345-678", "text"],
              ["contactEmail", "Email", "例如：name@brand.com", "text"],
              ["contactLine", "LINE", "例如：brand-team", "text"],
              ["budget", "專案預算", "例如：NT$ 680,000", "text"],
              ["cost", "目前成本", "例如：NT$ 472,000", "text"],
            ].map(([key, label, placeholder, type]) => (
              <label key={key} className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  type={type}
                  value={projectForm[key as keyof typeof projectForm]}
                  onChange={(event) => updateField(key as keyof typeof projectForm, event.target.value)}
                  placeholder={placeholder}
                  readOnly={key === "cost"}
                  className={`h-11 rounded-2xl border px-4 text-sm outline-none transition ${key === "cost" ? "border-slate-200 bg-slate-50 text-slate-500" : "border-slate-200 bg-white focus:border-blue-400"}`}
                />
              </label>
            ))}

            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
              <span className="text-sm font-medium text-slate-700">專案備註</span>
              <textarea
                value={projectForm.note}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="記錄專案背景、需求重點與提醒事項"
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsEditingProject(false)}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              儲存專案內容
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectForm({
                  name: project.name,
                  client: project.client,
                  eventDate: project.eventDate,
                  location: project.location,
                  loadInTime: project.loadInTime,
                  eventType: project.eventType,
                  contactName: project.contactName,
                  contactPhone: project.contactPhone,
                  contactEmail: project.contactEmail,
                  contactLine: project.contactLine,
                  owner: project.owner,
                  budget: project.budget,
                  cost: workflowAdjustedCost ?? project.cost,
                  note: project.note,
                });
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              還原原始內容
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.05fr)_minmax(0,1.35fr)]">
        {[
          { label: "活動日期", value: projectForm.eventDate },
          { label: "活動地點", value: projectForm.location },
          { label: "進場時間", value: projectForm.loadInTime },
          { label: "專案預算", value: projectForm.budget },
        ].map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p>
          </article>
        ))}

        <article className="rounded-3xl border border-slate-900 bg-slate-900 p-5 text-white shadow-sm ring-1 ring-slate-900/10">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-300">目前成本</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${hasWorkflowCost ? "border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 ring-emerald-400/20" : "border border-white/10 bg-white/10 text-slate-200 ring-white/10"}`}>
              {hasWorkflowCost ? "workflow 主線" : "seed fallback"}
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{workflowAdjustedCost ?? projectForm.cost}</p>
          <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-300">目前有效成本</span>
              <span className="text-right font-semibold text-white">{workflowAdjustedCost ?? "尚未建立"}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-300">原始 seed 參考</span>
              <span className="text-right font-medium text-slate-200">{projectForm.cost}</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-300">
            {hasWorkflowCost
              ? "目前優先顯示 workflow 主線成本；原始 seed 僅保留作背景參考。"
              : "目前尚未接到 workflow 主線成本，先沿用 seed 顯示；後續一旦成立會自動切換。"}
          </p>
        </article>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 min-h-11 flex items-start">
            <div className="min-w-0 pt-1.5">
              <h3 className="text-xl font-semibold leading-none">專案基本資訊</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["客戶名稱", projectForm.client],
              ["活動類型", projectForm.eventType],
              ["聯繫人", projectForm.contactName],
              ["電話", projectForm.contactPhone],
              ["Email", projectForm.contactEmail],
              ["LINE", projectForm.contactLine],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3.5">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <RequirementsPanel initialItems={project.requirements} />
      </section>

      <ExecutionTreeSection project={project} />
    </>
  );
}
