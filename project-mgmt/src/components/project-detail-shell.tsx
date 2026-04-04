"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ReplySummaryCard = {
  title: string;
  owner: string;
  status: string;
  meta: string;
  detail: string;
};

type AppendedReply = {
  id: string;
  text: string;
};
import { CopyEventInfoButton } from "@/components/copy-event-info-button";
import { ExecutionTree } from "@/components/execution-tree";
import { Project } from "@/components/project-data";
import { getProjectWorkflowCostSummary } from "@/components/project-workflow-store";
import { RequirementsPanel } from "@/components/requirements-panel";

type ProjectDetailInitialFocus = {
  tab?: string;
  itemId?: string;
  panel?: string;
  vendor?: string;
};

export function ProjectDetailShell({
  project,
  initialFocus,
}: {
  project: Project;
  initialFocus?: ProjectDetailInitialFocus;
}) {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [expandedReplyKey, setExpandedReplyKey] = useState<string | null>(null);
  const [replyDraftKey, setReplyDraftKey] = useState<string | null>(null);
  const [replyDraftText, setReplyDraftText] = useState("");
  const [appendedReplies, setAppendedReplies] = useState<Record<string, AppendedReply[]>>({});
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

  function submitMinimalReply(targetKey: string) {
    const nextText = replyDraftText.trim();
    if (!nextText) return;

    setAppendedReplies((prev) => ({
      ...prev,
      [targetKey]: [
        ...(prev[targetKey] ?? []),
        {
          id: `${targetKey}-${Date.now()}`,
          text: nextText,
        },
      ],
    }));
    setReplyDraftText("");
    setReplyDraftKey(null);
  }

  const workflowCostSummary = useMemo(() => getProjectWorkflowCostSummary(project.id), [project.id]);
  const workflowAdjustedCost = workflowCostSummary?.label ?? null;
  const hasWorkflowCost = Boolean(workflowCostSummary && workflowCostSummary.workflowItemCount > 0);
  const displayCost = workflowAdjustedCost ?? projectForm.cost;

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
                  value={key === "cost" ? displayCost : projectForm[key as keyof typeof projectForm]}
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

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.92fr)_minmax(0,1.1fr)]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">活動資訊</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{projectForm.eventDate}</h3>
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              {projectForm.eventType}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3.5">
              <p className="text-xs text-slate-500">活動地點</p>
              <p className="mt-2 font-medium text-slate-900">{projectForm.location}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3.5">
              <p className="text-xs text-slate-500">進場時間</p>
              <p className="mt-2 font-medium text-slate-900">{projectForm.loadInTime}</p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-900 bg-slate-900 p-5 text-white shadow-sm ring-1 ring-slate-900/10">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-300">成本 / 預算摘要</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${hasWorkflowCost ? "border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 ring-emerald-400/20" : "border border-white/10 bg-white/10 text-slate-200 ring-white/10"}`}>
              {hasWorkflowCost ? "主線成本" : "參考成本"}
            </span>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-300">目前有效成本</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{displayCost}</p>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-300">專案預算</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-white">{projectForm.budget}</p>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-300">
            {hasWorkflowCost
              ? "首屏只保留目前有效成本作為主資訊；預算與原始基準降階作管理參考。"
              : "目前尚未接到主線成本，先沿用專案基準顯示；後續一旦成立會自動切換。"}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">客戶資訊</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{projectForm.client}</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["聯繫人", projectForm.contactName],
              ["電話", projectForm.contactPhone],
              ["Email", projectForm.contactEmail],
              ["LINE", projectForm.contactLine],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3.5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
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

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <ExecutionTree heading="專案執行項目" items={project.executionItems} projectId={project.id} />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">專案分類檢視</h3>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {[
            { key: "design", title: "專案設計", count: project.designTasks.length, accent: "text-blue-700" },
            { key: "procurement", title: "專案備品", count: project.procurementTasks.length, accent: "text-amber-700" },
            { key: "vendor", title: "專案廠商", count: 0, accent: "text-violet-700" },
          ].map((category) => (
            <div
              key={category.key}
              className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm"
            >
              <div className="flex min-h-[84px] items-center justify-between gap-3">
                <div className="flex min-h-full flex-1 items-center justify-center text-center">
                  <p className={`text-lg font-semibold ${category.accent}`}>{category.title}</p>
                </div>
                <span className="inline-flex min-w-[36px] items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {category.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">回覆整理（測試版）</h4>
                <p className="mt-1 text-sm text-slate-500">先只補回回覆區容器與分類摘要，不接主卡、不接文件整理，確認這一層不會再影響左側導航。</p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                phase 1 / replies only
              </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {[
                {
                  key: "design-replies",
                  title: "設計回覆",
                  count: project.designTasks.length,
                  description: "先以既有設計任務數量作為回覆區恢復測試基準。",
                  tone: "bg-blue-50 text-blue-700 ring-blue-200",
                  items: project.designTasks.slice(0, 2).map((task): ReplySummaryCard => ({
                    title: task.title,
                    owner: task.assignee,
                    status: task.status,
                    meta: `交期：${task.due}`,
                    detail: `設計回覆詳情（測試版）：${task.title}｜負責人：${task.assignee}｜交期：${task.due}｜目前狀態：${task.status}`,
                  })),
                },
                {
                  key: "procurement-replies",
                  title: "備品回覆",
                  count: project.procurementTasks.length,
                  description: "先以既有備品任務數量作為回覆區恢復測試基準。",
                  tone: "bg-amber-50 text-amber-700 ring-amber-200",
                  items: project.procurementTasks.slice(0, 2).map((task): ReplySummaryCard => ({
                    title: task.title,
                    owner: task.buyer,
                    status: task.status,
                    meta: `預算：${task.budget}`,
                    detail: `備品回覆詳情（測試版）：${task.title}｜負責人：${task.buyer}｜預算：${task.budget}｜目前狀態：${task.status}`,
                  })),
                },
                {
                  key: "vendor-replies",
                  title: "廠商回覆",
                  count: 0,
                  description: "廠商回覆區先保留空殼，暫不接文件整理。",
                  tone: "bg-violet-50 text-violet-700 ring-violet-200",
                  items: [],
                },
              ].map((replyGroup) => (
                <article key={replyGroup.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{replyGroup.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{replyGroup.description}</p>
                    </div>
                    <span className={`inline-flex min-w-[40px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${replyGroup.tone}`}>
                      {replyGroup.count}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {replyGroup.items.length ? replyGroup.items.map((item) => (
                      <div key={`${replyGroup.key}-${item.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                              {item.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>負責人：{item.owner}</span>
                            <span>{item.meta}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setExpandedReplyKey((prev) => prev === `${replyGroup.key}-${item.title}` ? null : `${replyGroup.key}-${item.title}`)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              {expandedReplyKey === `${replyGroup.key}-${item.title}` ? "收合回覆詳情" : "查看回覆詳情"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyDraftKey((prev) => prev === `${replyGroup.key}-${item.title}` ? null : `${replyGroup.key}-${item.title}`);
                                setReplyDraftText("");
                              }}
                              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              {replyDraftKey === `${replyGroup.key}-${item.title}` ? "取消新增" : "新增回覆"}
                            </button>
                          </div>
                          {expandedReplyKey === `${replyGroup.key}-${item.title}` ? (
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                              {item.detail}
                            </div>
                          ) : null}
                          {replyDraftKey === `${replyGroup.key}-${item.title}` ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                              <p className="text-sm font-semibold text-slate-900">新增回覆（最小真實版）</p>
                              <p className="mt-1 text-xs text-slate-500">這一輪只驗證 local append，不接編輯、刪除、金額確認等複雜邏輯。</p>
                              <textarea
                                value={replyDraftText}
                                onChange={(event) => setReplyDraftText(event.target.value)}
                                placeholder="輸入回覆內容..."
                                className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                              />
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => submitMinimalReply(`${replyGroup.key}-${item.title}`)}
                                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                  送出回覆
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyDraftKey(null);
                                    setReplyDraftText("");
                                  }}
                                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  關閉
                                </button>
                              </div>
                            </div>
                          ) : null}
+                          {(appendedReplies[`${replyGroup.key}-${item.title}`] ?? []).length ? (
+                            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
+                              <p className="text-xs font-semibold tracking-wide text-slate-500">新增回覆結果（local）</p>
+                              {(appendedReplies[`${replyGroup.key}-${item.title}`] ?? []).map((reply, index) => (
+                                <div key={reply.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
+                                  <p className="text-xs font-medium text-slate-500">R{index + 1}</p>
+                                  <p className="mt-2 whitespace-pre-wrap leading-6">{reply.text}</p>
+                                </div>
+                              ))}
+                            </div>
+                          ) : null}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-400">
                        目前尚無可顯示的回覆摘要。
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">文件整理（測試版）</h4>
                <p className="mt-1 text-sm text-slate-500">先只補回文件整理區容器與靜態摘要，不接表格生成、不接真正文件流程。</p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                phase 2 / documents shell
              </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {[
                {
                  key: "design-docs",
                  title: "設計文件",
                  count: project.designTasks.length,
                  description: "後續會接設計回覆整理與文件輸出。",
                  rows: project.designTasks.slice(0, 2).map((task, index) => ({
                    no: index + 1,
                    name: task.title,
                    owner: task.assignee,
                    meta: task.due,
                  })),
                },
                {
                  key: "procurement-docs",
                  title: "備品文件",
                  count: project.procurementTasks.length,
                  description: "後續會接採買回覆整理與清單輸出。",
                  rows: project.procurementTasks.slice(0, 2).map((task, index) => ({
                    no: index + 1,
                    name: task.title,
                    owner: task.buyer,
                    meta: task.budget,
                  })),
                },
                {
                  key: "vendor-docs",
                  title: "廠商文件",
                  count: 0,
                  description: "後續會接廠商發包整理與文件狀態。",
                  rows: [],
                },
              ].map((docGroup) => (
                <article key={docGroup.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{docGroup.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{docGroup.description}</p>
                    </div>
                    <span className="inline-flex min-w-[40px] items-center justify-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {docGroup.count}
                    </span>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="grid grid-cols-[64px_minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-px bg-slate-200 text-xs font-semibold text-slate-600">
                      {['編號', '項目', '負責人', '備註'].map((label) => (
                        <div key={`${docGroup.key}-${label}`} className="bg-slate-50 px-3 py-2.5">{label}</div>
                      ))}
                    </div>
                    {docGroup.rows.length ? docGroup.rows.map((row) => (
                      <div key={`${docGroup.key}-${row.no}-${row.name}`} className="grid grid-cols-[64px_minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-px border-t border-slate-200 bg-slate-200 text-sm text-slate-700">
                        <div className="bg-white px-3 py-3">{row.no}</div>
                        <div className="bg-white px-3 py-3 font-medium text-slate-900">{row.name}</div>
                        <div className="bg-white px-3 py-3">{row.owner}</div>
                        <div className="bg-white px-3 py-3">{row.meta}</div>
                      </div>
                    )) : (
                      <div className="px-4 py-6 text-sm text-slate-400">目前尚無可顯示的文件資料。</div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
