"use client";

import { useMemo, useState } from "react";
import {
  AssignmentReply,
  DesignAssignmentDraft,
  ExecutionTree,
  ProcurementAssignmentDraft,
  VendorAssignmentDraft,
} from "@/components/execution-tree";
import { Project, getStatusClass } from "@/components/project-data";

type OpenCategory = "design" | "procurement" | "vendor";

type DesignAssignmentItem = { targetId: string; title: string; data: DesignAssignmentDraft };
type ProcurementAssignmentItem = { targetId: string; title: string; data: ProcurementAssignmentDraft };
type VendorAssignmentItem = { targetId: string; title: string; data: VendorAssignmentDraft };

export function ExecutionTreeSection({ project }: { project: Project }) {
  const [designAssignments, setDesignAssignments] = useState<DesignAssignmentItem[]>([]);
  const [procurementAssignments, setProcurementAssignments] = useState<ProcurementAssignmentItem[]>([]);
  const [vendorAssignments, setVendorAssignments] = useState<VendorAssignmentItem[]>([]);
  const [openCategory, setOpenCategory] = useState<OpenCategory>("design");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  function createReply(message: string): AssignmentReply {
    return {
      id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      createdAt: new Date().toLocaleString("zh-TW"),
    };
  }

  function addDesignReply(targetId: string) {
    const message = (replyDrafts[targetId] ?? "").trim();
    if (!message) return;

    setDesignAssignments((prev) =>
      prev.map((assignment) =>
        assignment.targetId !== targetId
          ? assignment
          : {
              ...assignment,
              data: {
                ...assignment.data,
                replies: [...(assignment.data.replies ?? []), createReply(message)],
              },
            }
      )
    );

    setReplyDrafts((prev) => ({ ...prev, [targetId]: "" }));
  }

  function addProcurementReply(targetId: string) {
    const message = (replyDrafts[targetId] ?? "").trim();
    if (!message) return;

    setProcurementAssignments((prev) =>
      prev.map((assignment) =>
        assignment.targetId !== targetId
          ? assignment
          : {
              ...assignment,
              data: {
                ...assignment.data,
                replies: [...(assignment.data.replies ?? []), createReply(message)],
              },
            }
      )
    );

    setReplyDrafts((prev) => ({ ...prev, [targetId]: "" }));
  }

  function addVendorReply(targetId: string) {
    const message = (replyDrafts[targetId] ?? "").trim();
    if (!message) return;

    setVendorAssignments((prev) =>
      prev.map((assignment) =>
        assignment.targetId !== targetId
          ? assignment
          : {
              ...assignment,
              data: {
                ...assignment.data,
                replies: [...(assignment.data.replies ?? []), createReply(message)],
              },
            }
      )
    );

    setReplyDrafts((prev) => ({ ...prev, [targetId]: "" }));
  }

  const designList = useMemo(
    () => [
      ...designAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.title,
        summary: [
          assignment.data.size ? `尺寸：${assignment.data.size}` : null,
          assignment.data.material ? `材質：${assignment.data.material}` : null,
          assignment.data.quantity ? `數量：${assignment.data.quantity}` : null,
          `結構圖：${assignment.data.structureRequired}`,
        ].filter(Boolean),
        extra: [
          assignment.data.referenceUrl ? `參考連結：${assignment.data.referenceUrl}` : null,
          assignment.data.note ? `備註：${assignment.data.note}` : null,
        ].filter(Boolean),
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        replies: assignment.data.replies ?? [],
      })),
      ...project.designTasks.map((task) => ({
        id: task.title,
        title: task.title,
        summary: [`負責人：${task.assignee}`, `期限：${task.due}`],
        extra: [],
        badge: task.status,
        badgeClass: getStatusClass(task.status),
        replies: [] as AssignmentReply[],
      })),
    ],
    [designAssignments, project.designTasks]
  );

  const procurementList = useMemo(
    () => [
      ...procurementAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.title,
        summary: [
          assignment.data.item ? `項目：${assignment.data.item}` : null,
          assignment.data.quantity ? `數量：${assignment.data.quantity}` : null,
          assignment.data.budget ? `預算：${assignment.data.budget}` : null,
        ].filter(Boolean),
        extra: [assignment.data.styleUrl ? `樣式 URL：${assignment.data.styleUrl}` : null].filter(Boolean),
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        replies: assignment.data.replies ?? [],
      })),
      ...project.procurementTasks.map((task) => ({
        id: task.title,
        title: task.title,
        summary: [`採購：${task.buyer}`, `預算：${task.budget}`],
        extra: [],
        badge: task.status,
        badgeClass: getStatusClass(task.status),
        replies: [] as AssignmentReply[],
      })),
    ],
    [procurementAssignments, project.procurementTasks]
  );

  const vendorList = useMemo(
    () =>
      vendorAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.title,
        summary: [
          assignment.data.title ? `交辦名稱：${assignment.data.title}` : null,
          assignment.data.vendorName ? `廠商名稱：${assignment.data.vendorName}` : null,
          assignment.data.budget ? `預算 / 報價：${assignment.data.budget}` : null,
        ].filter(Boolean),
        extra: [
          assignment.data.referenceUrl ? `參考連結：${assignment.data.referenceUrl}` : null,
          assignment.data.note ? `需求 / 備註：${assignment.data.note}` : null,
        ].filter(Boolean),
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        replies: assignment.data.replies ?? [],
      })),
    [vendorAssignments]
  );

  const currentList =
    openCategory === "design"
      ? designList
      : openCategory === "procurement"
        ? procurementList
        : vendorList;

  const categoryMeta = {
    design: {
      title: "專案設計",
      description: "點開後列出此專案全部設計相關項目。",
      count: designList.length,
      accent: "text-blue-700",
      ring: "ring-blue-200",
    },
    procurement: {
      title: "專案備品",
      description: "點開後列出此專案全部備品相關項目。",
      count: procurementList.length,
      accent: "text-amber-700",
      ring: "ring-amber-200",
    },
    vendor: {
      title: "專案廠商",
      description: "點開後列出此專案全部廠商相關項目。",
      count: vendorList.length,
      accent: "text-violet-700",
      ring: "ring-violet-200",
    },
  };

  return (
    <>
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">專案執行項目</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">改成樹狀子項目操作，可直接展開、收合，並在項目底下新增子項目。</p>
          </div>
        </div>

        <ExecutionTree
          items={project.executionItems}
          onDesignAssignmentsChange={setDesignAssignments}
          onProcurementAssignmentsChange={setProcurementAssignments}
          onVendorAssignmentsChange={setVendorAssignments}
        />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">專案分類檢視</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">點選分類後，會在下方直接展開此專案所有同類別資料。</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {(["design", "procurement", "vendor"] as OpenCategory[]).map((category) => {
            const meta = categoryMeta[category];
            const isActive = openCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setOpenCategory(category)}
                className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition ${
                  isActive ? `${meta.ring} ring-2` : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-lg font-semibold ${meta.accent}`}>{meta.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
                  </div>
                  <span className="inline-flex min-w-[36px] items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {meta.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-900">{categoryMeta[openCategory].title}</h4>
            <p className="mt-1 text-sm text-slate-500">共 {currentList.length} 筆，已依同類別集中條列於下方。</p>
          </div>

          <div className="space-y-3">
            {currentList.length ? (
              currentList.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-semibold text-slate-900">{item.title}</h5>
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                        {item.summary.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </div>
                      {item.extra.length ? (
                        <div className="mt-2 space-y-1 text-sm text-slate-500">
                          {item.extra.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-800">任務回覆</p>

                      <div className="mt-3 space-y-2">
                        {item.replies.length ? (
                          item.replies.map((reply) => (
                            <div key={reply.id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
                              <p>{reply.message}</p>
                              <p className="mt-1 text-xs text-slate-400">{reply.createdAt}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400">目前尚無回覆。</p>
                        )}
                      </div>

                      {openCategory === "design" ? (
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                          <textarea
                            value={replyDrafts[item.id] ?? ""}
                            onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
                            placeholder="輸入這筆設計任務的回覆內容"
                            className="min-h-24 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => addDesignReply(item.id)}
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                          >
                            送出回覆
                          </button>
                        </div>
                      ) : null}

                      {openCategory === "procurement" ? (
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                          <textarea
                            value={replyDrafts[item.id] ?? ""}
                            onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
                            placeholder="輸入這筆備品任務的回覆內容"
                            className="min-h-24 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => addProcurementReply(item.id)}
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                          >
                            送出回覆
                          </button>
                        </div>
                      ) : null}

                      {openCategory === "vendor" ? (
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                          <textarea
                            value={replyDrafts[item.id] ?? ""}
                            onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
                            placeholder="輸入這筆廠商任務的回覆內容"
                            className="min-h-24 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => addVendorReply(item.id)}
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                          >
                            送出回覆
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                目前此分類尚未建立資料。
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
