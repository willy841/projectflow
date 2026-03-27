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

type ReplyChild = {
  id: string;
  item: string;
  quantity: string;
  size: string;
  material: string;
  previewUrl: string;
  cost: string;
};

type ReplyParent = ReplyChild & {
  children: ReplyChild[];
};

type ReplyForm = {
  parents: ReplyParent[];
};

type DesignAssignmentItem = { targetId: string; title: string; data: DesignAssignmentDraft };
 type ProcurementAssignmentItem = { targetId: string; title: string; data: ProcurementAssignmentDraft };
 type VendorAssignmentItem = { targetId: string; title: string; data: VendorAssignmentDraft };

type DisplayItem = {
  id: string;
  title: string;
  badge: string;
  badgeClass: string;
  summary: string[];
  fields: Array<{ label: string; value: string }>;
  replies: AssignmentReply[];
};

const createReplyChild = (): ReplyChild => ({
  id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  item: "",
  quantity: "",
  size: "",
  material: "",
  previewUrl: "",
  cost: "",
});

const createReplyParent = (): ReplyParent => ({
  ...createReplyChild(),
  id: `parent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  children: [],
});

const defaultReplyForm: ReplyForm = {
  parents: [createReplyParent()],
};

function renderReplyLines(reply: AssignmentReply) {
  return reply.message.split("\n").map((line, index) => (
    <p key={`${reply.id}-${index}`} className={index === 0 ? "font-semibold text-slate-700" : "pl-4"}>
      {line}
    </p>
  ));
}

export function ExecutionTreeSection({ project }: { project: Project }) {
  const [designAssignments, setDesignAssignments] = useState<DesignAssignmentItem[]>([]);
  const [procurementAssignments, setProcurementAssignments] = useState<ProcurementAssignmentItem[]>([]);
  const [vendorAssignments, setVendorAssignments] = useState<VendorAssignmentItem[]>([]);
  const [openCategory, setOpenCategory] = useState<OpenCategory>("design");
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [expandedDetailId, setExpandedDetailId] = useState<string | null>(null);
  const [expandedReplyListId, setExpandedReplyListId] = useState<string | null>(null);
  const [replyForms, setReplyForms] = useState<Record<string, ReplyForm>>({});
  const [expandedReplyParents, setExpandedReplyParents] = useState<Record<string, boolean>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyMessage, setEditingReplyMessage] = useState("");

  function updateReplies(targetId: string, type: OpenCategory, updater: (replies: AssignmentReply[]) => AssignmentReply[]) {
    if (type === "design") {
      setDesignAssignments((prev) => prev.map((assignment) => assignment.targetId !== targetId ? assignment : { ...assignment, data: { ...assignment.data, replies: updater(assignment.data.replies ?? []) } }));
    }
    if (type === "procurement") {
      setProcurementAssignments((prev) => prev.map((assignment) => assignment.targetId !== targetId ? assignment : { ...assignment, data: { ...assignment.data, replies: updater(assignment.data.replies ?? []) } }));
    }
    if (type === "vendor") {
      setVendorAssignments((prev) => prev.map((assignment) => assignment.targetId !== targetId ? assignment : { ...assignment, data: { ...assignment.data, replies: updater(assignment.data.replies ?? []) } }));
    }
  }

  function updateParentField(targetId: string, parentId: string, key: keyof ReplyChild, value: string) {
    setReplyForms((prev) => ({
      ...prev,
      [targetId]: {
        parents: (prev[targetId]?.parents ?? [createReplyParent()]).map((parent) =>
          parent.id === parentId ? { ...parent, [key]: value } : parent
        ),
      },
    }));
  }

  function updateChildField(targetId: string, parentId: string, childId: string, key: keyof ReplyChild, value: string) {
    setReplyForms((prev) => ({
      ...prev,
      [targetId]: {
        parents: (prev[targetId]?.parents ?? [createReplyParent()]).map((parent) =>
          parent.id !== parentId
            ? parent
            : {
                ...parent,
                children: parent.children.map((child) =>
                  child.id === childId ? { ...child, [key]: value } : child
                ),
              }
        ),
      },
    }));
  }

  function addReplyParent(targetId: string) {
    setReplyForms((prev) => ({
      ...prev,
      [targetId]: {
        parents: [...(prev[targetId]?.parents ?? [createReplyParent()]), createReplyParent()],
      },
    }));
  }

  function removeReplyParent(targetId: string, parentId: string) {
    setReplyForms((prev) => {
      const current = prev[targetId]?.parents ?? [createReplyParent()];
      const next = current.filter((parent) => parent.id !== parentId);
      return { ...prev, [targetId]: { parents: next.length ? next : [createReplyParent()] } };
    });
  }

  function addReplyChild(targetId: string, parentId: string) {
    setReplyForms((prev) => ({
      ...prev,
      [targetId]: {
        parents: (prev[targetId]?.parents ?? [createReplyParent()]).map((parent) =>
          parent.id !== parentId ? parent : { ...parent, children: [...parent.children, createReplyChild()] }
        ),
      },
    }));
    setExpandedReplyParents((prev) => ({ ...prev, [parentId]: true }));
  }

  function removeReplyChild(targetId: string, parentId: string, childId: string) {
    setReplyForms((prev) => ({
      ...prev,
      [targetId]: {
        parents: (prev[targetId]?.parents ?? [createReplyParent()]).map((parent) =>
          parent.id !== parentId ? parent : { ...parent, children: parent.children.filter((child) => child.id !== childId) }
        ),
      },
    }));
  }

  function buildLine(prefix: string, line: ReplyChild) {
    return [
      prefix,
      line.item ? `項目：${line.item}` : null,
      line.quantity ? `數量：${line.quantity}` : null,
      line.size ? `尺寸：${line.size}` : null,
      line.material ? `材質：${line.material}` : null,
      line.previewUrl ? `預覽圖 URL：${line.previewUrl}` : null,
      line.cost ? `成本：${line.cost}` : null,
    ]
      .filter(Boolean)
      .join("｜");
  }

  function buildReplyMessage(form: ReplyForm) {
    return form.parents
      .flatMap((parent, parentIndex) => {
        const lines = [buildLine(`第 ${parentIndex + 1} 主項目`, parent)];
        parent.children.forEach((child, childIndex) => {
          lines.push(buildLine(`　└ 子項目 ${parentIndex + 1}-${childIndex + 1}`, child));
        });
        return lines;
      })
      .filter((line) => line.replace(/^第 .*主項目$|^　└ 子項目 .*$/u, "").trim() !== "")
      .join("\n");
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
    updateReplies(targetId, type, (replies) => [...replies, reply]);
    setReplyForms((prev) => ({ ...prev, [targetId]: defaultReplyForm }));
    setActiveReplyBoxId(null);
    setExpandedReplyListId(targetId);
  }

  function startEditReply(reply: AssignmentReply) {
    setEditingReplyId(reply.id);
    setEditingReplyMessage(reply.message);
  }

  function saveEditedReply(targetId: string, type: OpenCategory, replyId: string) {
    const nextMessage = editingReplyMessage.trim();
    if (!nextMessage) return;
    updateReplies(targetId, type, (replies) => replies.map((reply) => reply.id === replyId ? { ...reply, message: nextMessage, createdAt: `${reply.createdAt}（已修改）` } : reply));
    setEditingReplyId(null);
    setEditingReplyMessage("");
  }

  function removeReply(targetId: string, type: OpenCategory, replyId: string) {
    if (!window.confirm("確定要刪除這則回覆嗎？")) return;
    updateReplies(targetId, type, (replies) => replies.filter((reply) => reply.id !== replyId));
    if (editingReplyId === replyId) {
      setEditingReplyId(null);
      setEditingReplyMessage("");
    }
  }

  const designList = useMemo<DisplayItem[]>(() => [
    ...designAssignments.map((assignment) => ({
      id: assignment.targetId,
      title: assignment.title,
      badge: assignment.data.status,
      badgeClass: getStatusClass(assignment.data.status),
      summary: [assignment.data.size ? `尺寸：${assignment.data.size}` : null, assignment.data.material ? `材質：${assignment.data.material}` : null, assignment.data.quantity ? `數量：${assignment.data.quantity}` : null].filter((value): value is string => Boolean(value)),
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
      summary: [`負責人：${task.assignee}`, `期限：${task.due}`],
      fields: [{ label: "負責人", value: task.assignee }, { label: "期限", value: task.due }],
      replies: [],
    })),
  ], [designAssignments, project.designTasks]);

  const procurementList = useMemo<DisplayItem[]>(() => [
    ...procurementAssignments.map((assignment) => ({
      id: assignment.targetId,
      title: assignment.title,
      badge: assignment.data.status,
      badgeClass: getStatusClass(assignment.data.status),
      summary: [assignment.data.item ? `項目：${assignment.data.item}` : null, assignment.data.quantity ? `數量：${assignment.data.quantity}` : null, assignment.data.budget ? `預算：${assignment.data.budget}` : null].filter((value): value is string => Boolean(value)),
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
      summary: [`採購：${task.buyer}`, `預算：${task.budget}`],
      fields: [{ label: "採購", value: task.buyer }, { label: "預算", value: task.budget }],
      replies: [],
    })),
  ], [procurementAssignments, project.procurementTasks]);

  const vendorList = useMemo<DisplayItem[]>(() => vendorAssignments.map((assignment) => ({
    id: assignment.targetId,
    title: assignment.title,
    badge: assignment.data.status,
    badgeClass: getStatusClass(assignment.data.status),
    summary: [assignment.data.title ? `交辦名稱：${assignment.data.title}` : null, assignment.data.vendorName ? `廠商名稱：${assignment.data.vendorName}` : null, assignment.data.budget ? `預算 / 報價：${assignment.data.budget}` : null].filter((value): value is string => Boolean(value)),
    fields: [
      { label: "交辦名稱", value: assignment.data.title || "—" },
      { label: "廠商名稱", value: assignment.data.vendorName || "—" },
      { label: "預算 / 報價", value: assignment.data.budget || "—" },
      { label: "參考連結", value: assignment.data.referenceUrl || "—" },
      { label: "需求 / 備註", value: assignment.data.note || "—" },
    ],
    replies: assignment.data.replies ?? [],
  })), [vendorAssignments]);

  const currentList = openCategory === "design" ? designList : openCategory === "procurement" ? procurementList : vendorList;

  const categoryMeta = {
    design: { title: "專案設計", description: "點開後列出此專案全部設計相關項目。", count: designList.length, accent: "text-blue-700", ring: "ring-blue-200" },
    procurement: { title: "專案備品", description: "點開後列出此專案全部備品相關項目。", count: procurementList.length, accent: "text-amber-700", ring: "ring-amber-200" },
    vendor: { title: "專案廠商", description: "點開後列出此專案全部廠商相關項目。", count: vendorList.length, accent: "text-violet-700", ring: "ring-violet-200" },
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
        <ExecutionTree items={project.executionItems} onDesignAssignmentsChange={setDesignAssignments} onProcurementAssignmentsChange={setProcurementAssignments} onVendorAssignmentsChange={setVendorAssignments} />
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
              <button key={category} type="button" onClick={() => setOpenCategory(category)} className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition ${isActive ? `${meta.ring} ring-2` : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-lg font-semibold ${meta.accent}`}>{meta.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
                  </div>
                  <span className="inline-flex min-w-[36px] items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{meta.count}</span>
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
            {currentList.length ? currentList.map((item) => {
              const replyForm = replyForms[item.id] ?? defaultReplyForm;
              const isReplyOpen = activeReplyBoxId === item.id;
              const isDetailOpen = expandedDetailId === item.id;
              const isReplyListOpen = expandedReplyListId === item.id;
              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-semibold text-slate-900">{item.title}</h5>
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${item.badgeClass}`}>{item.badge}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">{item.summary.map((line) => <span key={`${item.id}-${line}`}>{line}</span>)}<span>回覆 {item.replies.length} 則</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setExpandedDetailId((prev) => (prev === item.id ? null : item.id))} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">{isDetailOpen ? "收合內容" : "查看內容"}</button>
                        <button type="button" onClick={() => setExpandedReplyListId((prev) => (prev === item.id ? null : item.id))} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">{isReplyListOpen ? "收合回覆" : `查看回覆（${item.replies.length}）`}</button>
                        <button type="button" onClick={() => setActiveReplyBoxId((prev) => (prev === item.id ? null : item.id))} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">{isReplyOpen ? "取消回覆" : "新增回覆"}</button>
                      </div>
                    </div>

                    {isDetailOpen ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{item.fields.map((field) => <div key={`${item.id}-${field.label}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-medium text-slate-500">{field.label}</p><p className="mt-2 break-words text-sm font-medium text-slate-900">{field.value}</p></div>)}</div> : null}

                    {isReplyListOpen ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-800">任務回覆</p>
                        <div className="mt-3 space-y-2">
                          {item.replies.length ? item.replies.map((reply) => (
                            <div key={reply.id} className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
                              {editingReplyId === reply.id ? (
                                <>
                                  <textarea value={editingReplyMessage} onChange={(event) => setEditingReplyMessage(event.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => saveEditedReply(item.id, openCategory, reply.id)} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">儲存修改</button><button type="button" onClick={() => { setEditingReplyId(null); setEditingReplyMessage(""); }} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">取消</button></div>
                                </>
                              ) : (
                                <>
                                  <div className="space-y-1">{renderReplyLines(reply)}</div>
                                  <p className="mt-1 text-xs text-slate-400">{reply.createdAt}</p>
                                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => startEditReply(reply)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">修改</button><button type="button" onClick={() => removeReply(item.id, openCategory, reply.id)} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">刪除</button></div>
                                </>
                              )}
                            </div>
                          )) : <p className="text-sm text-slate-400">目前尚無回覆。</p>}
                        </div>
                      </div>
                    ) : null}

                    {isReplyOpen ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">新增回覆</p>
                          <button type="button" onClick={() => addReplyParent(item.id)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">＋ 新增主項目</button>
                        </div>
                        <div className="mt-4 space-y-4">
                          {replyForm.parents.map((parent, index) => {
                            const isExpanded = expandedReplyParents[parent.id] ?? true;
                            return (
                              <div key={parent.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setExpandedReplyParents((prev) => ({ ...prev, [parent.id]: !isExpanded }))} className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm text-slate-700">{isExpanded ? "⌄" : "›"}</button>
                                    <p className="text-sm font-semibold text-slate-800">主項目 {index + 1}</p>
                                  </div>
                                  <div className="flex gap-2"><button type="button" onClick={() => addReplyChild(item.id, parent.id)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">＋ 新增子項目</button><button type="button" onClick={() => removeReplyParent(item.id, parent.id)} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">刪除主項目</button></div>
                                </div>
                                {isExpanded ? (
                                  <>
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                      <input value={parent.item} onChange={(e) => updateParentField(item.id, parent.id, "item", e.target.value)} placeholder="主項目名稱" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                      <input value={parent.quantity} onChange={(e) => updateParentField(item.id, parent.id, "quantity", e.target.value)} placeholder="數量" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                      <input value={parent.size} onChange={(e) => updateParentField(item.id, parent.id, "size", e.target.value)} placeholder="尺寸" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                      <input value={parent.material} onChange={(e) => updateParentField(item.id, parent.id, "material", e.target.value)} placeholder="材質" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                      <input value={parent.previewUrl} onChange={(e) => updateParentField(item.id, parent.id, "previewUrl", e.target.value)} placeholder="預覽圖 URL" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                      <input value={parent.cost} onChange={(e) => updateParentField(item.id, parent.id, "cost", e.target.value)} placeholder="成本" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                    </div>
                                    {parent.children.length ? <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">{parent.children.map((child, childIndex) => <div key={child.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-700">子項目 {index + 1}-{childIndex + 1}</p><button type="button" onClick={() => removeReplyChild(item.id, parent.id, child.id)} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">刪除子項目</button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><input value={child.item} onChange={(e) => updateChildField(item.id, parent.id, child.id, "item", e.target.value)} placeholder="子項目名稱" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /><input value={child.quantity} onChange={(e) => updateChildField(item.id, parent.id, child.id, "quantity", e.target.value)} placeholder="數量" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /><input value={child.size} onChange={(e) => updateChildField(item.id, parent.id, child.id, "size", e.target.value)} placeholder="尺寸" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /><input value={child.material} onChange={(e) => updateChildField(item.id, parent.id, child.id, "material", e.target.value)} placeholder="材質" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /><input value={child.previewUrl} onChange={(e) => updateChildField(item.id, parent.id, child.id, "previewUrl", e.target.value)} placeholder="預覽圖 URL" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /><input value={child.cost} onChange={(e) => updateChildField(item.id, parent.id, child.id, "cost", e.target.value)} placeholder="成本" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></div></div>)}</div> : null}
                                  </>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => submitReply(item.id, openCategory)} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">送出回覆</button><button type="button" onClick={() => setActiveReplyBoxId(null)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">取消</button></div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">目前此分類尚未建立資料。</div>}
          </div>
        </div>
      </section>
    </>
  );
}
