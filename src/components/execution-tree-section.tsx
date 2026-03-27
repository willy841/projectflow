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

type ReplyForm = {
  item: string;
  quantity: string;
  size: string;
  material: string;
  previewUrl: string;
  cost: string;
};

type DesignAssignmentItem = { targetId: string; title: string; data: DesignAssignmentDraft };
type ProcurementAssignmentItem = { targetId: string; title: string; data: ProcurementAssignmentDraft };
type VendorAssignmentItem = { targetId: string; title: string; data: VendorAssignmentDraft };

type DisplayItem = {
  id: string;
  title: string;
  badge: string;
  badgeClass: string;
  fields: Array<{ label: string; value: string }>;
  replies: AssignmentReply[];
};

const defaultReplyForm: ReplyForm = {
  item: "",
  quantity: "",
  size: "",
  material: "",
  previewUrl: "",
  cost: "",
};

export function ExecutionTreeSection({ project }: { project: Project }) {
  const [designAssignments, setDesignAssignments] = useState<DesignAssignmentItem[]>([]);
  const [procurementAssignments, setProcurementAssignments] = useState<ProcurementAssignmentItem[]>([]);
  const [vendorAssignments, setVendorAssignments] = useState<VendorAssignmentItem[]>([]);
  const [openCategory, setOpenCategory] = useState<OpenCategory>("design");
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [replyForms, setReplyForms] = useState<Record<string, ReplyForm>>({});

  function updateReplyForm(targetId: string, key: keyof ReplyForm, value: string) {
    setReplyForms((prev) => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] ?? defaultReplyForm),
        [key]: value,
      },
    }));
  }

  function buildReplyMessage(form: ReplyForm) {
    return [
      form.item ? `項目：${form.item}` : null,
      form.quantity ? `數量：${form.quantity}` : null,
      form.size ? `尺寸：${form.size}` : null,
      form.material ? `材質：${form.material}` : null,
      form.previewUrl ? `預覽圖 URL：${form.previewUrl}` : null,
      form.cost ? `成本：${form.cost}` : null,
    ]
      .filter(Boolean)
      .join("｜");
  }

  function createReply(form: ReplyForm): AssignmentReply {
    return {
      id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message: buildReplyMessage(form),
      createdAt: new Date().toLocaleString("zh-TW"),
    };
  }

  function submitReply(targetId: string, type: OpenCategory) {
    const form = replyForms[targetId] ?? defaultReplyForm;
    const message = buildReplyMessage(form);
    if (!message) return;

    const reply = createReply(form);

    if (type === "design") {
      setDesignAssignments((prev) =>
        prev.map((assignment) =>
          assignment.targetId !== targetId
            ? assignment
            : {
                ...assignment,
                data: {
                  ...assignment.data,
                  replies: [...(assignment.data.replies ?? []), reply],
                },
              }
        )
      );
    }

    if (type === "procurement") {
      setProcurementAssignments((prev) =>
        prev.map((assignment) =>
          assignment.targetId !== targetId
            ? assignment
            : {
                ...assignment,
                data: {
                  ...assignment.data,
                  replies: [...(assignment.data.replies ?? []), reply],
                },
              }
        )
      );
    }

    if (type === "vendor") {
      setVendorAssignments((prev) =>
        prev.map((assignment) =>
          assignment.targetId !== targetId
            ? assignment
            : {
                ...assignment,
                data: {
                  ...assignment.data,
                  replies: [...(assignment.data.replies ?? []), reply],
                },
              }
        )
      );
    }

    setReplyForms((prev) => ({ ...prev, [targetId]: defaultReplyForm }));
    setActiveReplyBoxId(null);
  }

  const designList = useMemo<DisplayItem[]>(
    () => [
      ...designAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.title,
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        fields: [
          { label: "尺寸", value: assignment.data.size || "—" },
          { label: "材質", value: assignment.data.material || "—" },
          { label: "數量", value: assignment.data.quantity || "—" },
          { label: "結構圖", value: assignment.data.structureRequired || "—" },
          { label: "參考連結", value: assignment.data.referenceUrl || "—" },
          { label: "備註", value: assignment.data.note || "—" },
        ],
        replies: assignment.data.replies ?? [],
      })),
      ...project.designTasks.map((task) => ({
        id: task.title,
        title: task.title,
        badge: task.status,
        badgeClass: getStatusClass(task.status),
        fields: [
          { label: "負責人", value: task.assignee },
          { label: "期限", value: task.due },
        ],
        replies: [],
      })),
    ],
    [designAssignments, project.designTasks]
  );

  const procurementList = useMemo<DisplayItem[]>(
    () => [
      ...procurementAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.title,
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        fields: [
          { label: "項目", value: assignment.data.item || "—" },
          { label: "數量", value: assignment.data.quantity || "—" },
          { label: "預算", value: assignment.data.budget || "—" },
          { label: "樣式 URL", value: assignment.data.styleUrl || "—" },
        ],
        replies: assignment.data.replies ?? [],
      })),
      ...project.procurementTasks.map((task) => ({
        id: task.title,
        title: task.title,
        badge: task.status,
        badgeClass: getStatusClass(task.status),
        fields: [
          { label: "採購", value: task.buyer },
          { label: "預算", value: task.budget },
        ],
        replies: [],
      })),
    ],
    [procurementAssignments, project.procurementTasks]
  );

  const vendorList = useMemo<DisplayItem[]>(
    () =>
      vendorAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.title,
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        fields: [
          { label: "交辦名稱", value: assignment.data.title || "—" },
          { label: "廠商名稱", value: assignment.data.vendorName || "—" },
          { label: "預算 / 報價", value: assignment.data.budget || "—" },
          { label: "參考連結", value: assignment.data.referenceUrl || "—" },
          { label: "需求 / 備註", value: assignment.data.note || "—" },
        ],
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
              currentList.map((item) => {
                const replyForm = replyForms[item.id] ?? defaultReplyForm;
                const isReplyOpen = activeReplyBoxId === item.id;

                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-semibold text-slate-900">{item.title}</h5>
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {item.fields.map((field) => (
                          <div key={`${item.id}-${field.label}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-medium text-slate-500">{field.label}</p>
                            <p className="mt-2 text-sm font-medium break-words text-slate-900">{field.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">任務回覆</p>
                          <button
                            type="button"
                            onClick={() => setActiveReplyBoxId((prev) => (prev === item.id ? null : item.id))}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {isReplyOpen ? "收合回覆" : "新增回覆"}
                          </button>
                        </div>

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

                        {isReplyOpen ? (
                          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <label className="flex flex-col gap-2">
                              <span className="text-sm font-medium text-slate-700">項目</span>
                              <input
                                value={replyForm.item}
                                onChange={(event) => updateReplyForm(item.id, "item", event.target.value)}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                              />
                            </label>
                            <label className="flex flex-col gap-2">
                              <span className="text-sm font-medium text-slate-700">數量</span>
                              <input
                                value={replyForm.quantity}
                                onChange={(event) => updateReplyForm(item.id, "quantity", event.target.value)}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                              />
                            </label>
                            <label className="flex flex-col gap-2">
                              <span className="text-sm font-medium text-slate-700">尺寸</span>
                              <input
                                value={replyForm.size}
                                onChange={(event) => updateReplyForm(item.id, "size", event.target.value)}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                              />
                            </label>
                            <label className="flex flex-col gap-2">
                              <span className="text-sm font-medium text-slate-700">材質</span>
                              <input
                                value={replyForm.material}
                                onChange={(event) => updateReplyForm(item.id, "material", event.target.value)}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                              />
                            </label>
                            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-1">
                              <span className="text-sm font-medium text-slate-700">預覽圖 URL</span>
                              <input
                                value={replyForm.previewUrl}
                                onChange={(event) => updateReplyForm(item.id, "previewUrl", event.target.value)}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                              />
                            </label>
                            <label className="flex flex-col gap-2">
                              <span className="text-sm font-medium text-slate-700">成本</span>
                              <input
                                value={replyForm.cost}
                                onChange={(event) => updateReplyForm(item.id, "cost", event.target.value)}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                              />
                            </label>

                            <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => submitReply(item.id, openCategory)}
                                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                              >
                                送出回覆
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveReplyBoxId(null)}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
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
