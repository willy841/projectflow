"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getStatusClass } from "@/components/project-data";
import { DesignTaskRecord, designTaskGroups } from "@/components/design-task-data";

type TaskReply = {
  id: string;
  message: string;
  createdAt: string;
};

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

type EditableTask = DesignTaskRecord & {
  replies: TaskReply[];
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

function renderReplyLines(reply: TaskReply) {
  return reply.message.split("\n").map((line, index) => (
    <p key={`${reply.id}-${index}`} className={index === 0 ? "font-semibold text-slate-700" : "pl-4"}>
      {line}
    </p>
  ));
}

export default function DesignTasksPage() {
  const [tasks, setTasks] = useState<EditableTask[]>(
    designTaskGroups.map((task) => ({ ...task, replies: [] }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditableTask | null>(null);
  const [replyForms, setReplyForms] = useState<Record<string, ReplyForm>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [expandedReplyParents, setExpandedReplyParents] = useState<Record<string, boolean>>({});

  const stats = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((task) => task.status === "進行中").length,
      pending: tasks.filter((task) => task.status === "待確認").length,
      projectCount: new Set(tasks.map((task) => task.projectId)).size,
    }),
    [tasks]
  );

  function startEditing(task: EditableTask) {
    setEditingId(task.id);
    setEditDraft({ ...task });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditDraft(null);
  }

  function saveEditing() {
    if (!editingId || !editDraft) return;
    setTasks((prev) => prev.map((task) => (task.id === editingId ? editDraft : task)));
    setEditingId(null);
    setEditDraft(null);
  }

  function updateEditField<K extends keyof EditableTask>(key: K, value: EditableTask[K]) {
    setEditDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateTaskStatus(taskId: string, status: string) {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  }

  function updateParentField(taskId: string, parentId: string, key: keyof ReplyChild, value: string) {
    setReplyForms((prev) => ({
      ...prev,
      [taskId]: {
        parents: (prev[taskId]?.parents ?? [createReplyParent()]).map((parent) =>
          parent.id === parentId ? { ...parent, [key]: value } : parent
        ),
      },
    }));
  }

  function updateChildField(taskId: string, parentId: string, childId: string, key: keyof ReplyChild, value: string) {
    setReplyForms((prev) => ({
      ...prev,
      [taskId]: {
        parents: (prev[taskId]?.parents ?? [createReplyParent()]).map((parent) =>
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

  function addReplyParent(taskId: string) {
    setReplyForms((prev) => ({
      ...prev,
      [taskId]: {
        parents: [...(prev[taskId]?.parents ?? [createReplyParent()]), createReplyParent()],
      },
    }));
  }

  function removeReplyParent(taskId: string, parentId: string) {
    setReplyForms((prev) => {
      const current = prev[taskId]?.parents ?? [createReplyParent()];
      const next = current.filter((parent) => parent.id !== parentId);
      return {
        ...prev,
        [taskId]: {
          parents: next.length ? next : [createReplyParent()],
        },
      };
    });
  }

  function addReplyChild(taskId: string, parentId: string) {
    setReplyForms((prev) => ({
      ...prev,
      [taskId]: {
        parents: (prev[taskId]?.parents ?? [createReplyParent()]).map((parent) =>
          parent.id !== parentId ? parent : { ...parent, children: [...parent.children, createReplyChild()] }
        ),
      },
    }));
    setExpandedReplyParents((prev) => ({ ...prev, [parentId]: true }));
  }

  function removeReplyChild(taskId: string, parentId: string, childId: string) {
    setReplyForms((prev) => ({
      ...prev,
      [taskId]: {
        parents: (prev[taskId]?.parents ?? [createReplyParent()]).map((parent) =>
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

  function addReply(taskId: string) {
    const form = replyForms[taskId] ?? defaultReplyForm;
    const message = buildReplyMessage(form);
    if (!message) return;

    const reply = {
      id: `${taskId}-${Date.now()}`,
      message,
      createdAt: new Date().toLocaleString("zh-TW"),
    };

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, replies: [...task.replies, reply] } : task
      )
    );
    setReplyForms((prev) => ({ ...prev, [taskId]: defaultReplyForm }));
    setExpandedReplies((prev) => ({ ...prev, [taskId]: true }));
  }

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Design Task Center</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">設計交辦中心</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              維持目前版面，先補上按鈕式編輯、樹狀回覆與狀態調整，下一階段再做與專案詳細頁更深的資料連動。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/design-tasks/new"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + 新增設計交辦
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              返回專案列表
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">設計交辦總數</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stats.total}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">進行中</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stats.inProgress}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">待確認</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stats.pending}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">關聯專案</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stats.projectCount}</p>
        </article>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-slate-900">設計交辦列表</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">先維持現有版面，將編輯與回覆改成按鈕展開。</p>
            </div>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => {
              const isEditing = editingId === task.id;
              const current = isEditing && editDraft ? editDraft : task;
              const isRepliesOpen = expandedReplies[task.id];
              const currentReplyForm = replyForms[task.id] ?? defaultReplyForm;

              return (
                <div key={task.id} className="rounded-3xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div>
                        <p className="text-xs font-semibold text-blue-600">{current.projectCode}</p>
                        <Link href={`/design-tasks/${current.id}`} className="mt-1 block text-lg font-semibold text-slate-900 underline-offset-4 hover:text-blue-600 hover:underline">
                          {current.title}
                        </Link>
                        <p className="mt-1 text-sm text-slate-600">{current.projectName}・{current.client}</p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          ["尺寸", current.size],
                          ["材質", current.material],
                          ["數量", current.quantity],
                          ["交期", current.due],
                        ].map(([label, value]) => (
                          <div key={String(label)} className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">需求 / 備註</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{current.note}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">任務回覆</p>
                          <button
                            type="button"
                            onClick={() => setExpandedReplies((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {isRepliesOpen ? "收合回覆" : `查看回覆（${task.replies.length}）`}
                          </button>
                        </div>

                        {isRepliesOpen ? (
                          <div className="mt-3 space-y-3">
                            {task.replies.length ? (
                              task.replies.map((reply) => (
                                <div key={reply.id} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
                                  <div className="space-y-1">{renderReplyLines(reply)}</div>
                                  <p className="mt-1 text-xs text-slate-400">{reply.createdAt}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-400">目前尚無回覆。</p>
                            )}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-800">新增回覆</p>
                                <button
                                  type="button"
                                  onClick={() => addReplyParent(task.id)}
                                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  ＋ 新增主項目
                                </button>
                              </div>

                              <div className="mt-4 space-y-4">
                                {currentReplyForm.parents.map((parent, index) => {
                                  const isExpanded = expandedReplyParents[parent.id] ?? true;

                                  return (
                                    <div key={parent.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                      <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setExpandedReplyParents((prev) => ({ ...prev, [parent.id]: !isExpanded }))}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm text-slate-700"
                                          >
                                            {isExpanded ? "⌄" : "›"}
                                          </button>
                                          <p className="text-sm font-semibold text-slate-800">主項目 {index + 1}</p>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => addReplyChild(task.id, parent.id)}
                                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                          >
                                            ＋ 新增子項目
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => removeReplyParent(task.id, parent.id)}
                                            className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                          >
                                            刪除主項目
                                          </button>
                                        </div>
                                      </div>

                                      {isExpanded ? (
                                        <>
                                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            <input value={parent.item} onChange={(event) => updateParentField(task.id, parent.id, "item", event.target.value)} placeholder="主項目名稱" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                            <input value={parent.quantity} onChange={(event) => updateParentField(task.id, parent.id, "quantity", event.target.value)} placeholder="數量" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                            <input value={parent.size} onChange={(event) => updateParentField(task.id, parent.id, "size", event.target.value)} placeholder="尺寸" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                            <input value={parent.material} onChange={(event) => updateParentField(task.id, parent.id, "material", event.target.value)} placeholder="材質" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                            <input value={parent.previewUrl} onChange={(event) => updateParentField(task.id, parent.id, "previewUrl", event.target.value)} placeholder="預覽圖 URL" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                            <input value={parent.cost} onChange={(event) => updateParentField(task.id, parent.id, "cost", event.target.value)} placeholder="成本" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                          </div>

                                          {parent.children.length ? (
                                            <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
                                              {parent.children.map((child, childIndex) => (
                                                <div key={child.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                  <div className="mb-3 flex items-center justify-between gap-3">
                                                    <p className="text-sm font-semibold text-slate-700">子項目 {index + 1}-{childIndex + 1}</p>
                                                    <button
                                                      type="button"
                                                      onClick={() => removeReplyChild(task.id, parent.id, child.id)}
                                                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                                    >
                                                      刪除子項目
                                                    </button>
                                                  </div>
                                                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                    <input value={child.item} onChange={(event) => updateChildField(task.id, parent.id, child.id, "item", event.target.value)} placeholder="子項目名稱" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                                    <input value={child.quantity} onChange={(event) => updateChildField(task.id, parent.id, child.id, "quantity", event.target.value)} placeholder="數量" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                                    <input value={child.size} onChange={(event) => updateChildField(task.id, parent.id, child.id, "size", event.target.value)} placeholder="尺寸" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                                    <input value={child.material} onChange={(event) => updateChildField(task.id, parent.id, child.id, "material", event.target.value)} placeholder="材質" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                                    <input value={child.previewUrl} onChange={(event) => updateChildField(task.id, parent.id, child.id, "previewUrl", event.target.value)} placeholder="預覽圖 URL" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                                    <input value={child.cost} onChange={(event) => updateChildField(task.id, parent.id, child.id, "cost", event.target.value)} placeholder="成本" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : null}
                                        </>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => addReply(task.id)}
                                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                >
                                  送出回覆
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-full max-w-xs space-y-3 lg:w-72">
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex min-w-[72px] items-center justify-center self-start whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(current.status)}`}>
                          {current.status}
                        </span>
                        <select
                          value={current.status}
                          onChange={(event) =>
                            isEditing
                              ? updateEditField("status", event.target.value as never)
                              : updateTaskStatus(task.id, event.target.value)
                          }
                          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400"
                        >
                          <option value="待確認">待確認</option>
                          <option value="進行中">進行中</option>
                          <option value="待處理">待處理</option>
                          <option value="已完成">已完成</option>
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">負責設計</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{current.assignee}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">專案負責人</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{current.owner}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">參考連結</p>
                        <a href={current.referenceUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-medium text-blue-600 underline-offset-4 hover:underline">
                          開啟參考資料
                        </a>
                      </div>

                      <div className="grid gap-2">
                        {isEditing ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                            <div className="grid gap-3">
                              <input value={current.assignee} onChange={(event) => updateEditField("assignee", event.target.value as never)} placeholder="負責設計" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400" />
                              <input value={current.size} onChange={(event) => updateEditField("size", event.target.value as never)} placeholder="尺寸" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400" />
                              <input value={current.material} onChange={(event) => updateEditField("material", event.target.value as never)} placeholder="材質" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400" />
                              <input value={current.quantity} onChange={(event) => updateEditField("quantity", event.target.value as never)} placeholder="數量" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400" />
                              <input value={current.due} onChange={(event) => updateEditField("due", event.target.value as never)} placeholder="交期" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400" />
                              <input value={current.referenceUrl} onChange={(event) => updateEditField("referenceUrl", event.target.value as never)} placeholder="參考連結" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400" />
                              <textarea value={current.note} onChange={(event) => updateEditField("note", event.target.value as never)} placeholder="需求 / 備註" className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={saveEditing} className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                                儲存變更
                              </button>
                              <button type="button" onClick={cancelEditing} className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                                取消編輯
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(task)}
                              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              修改編輯
                            </button>
                            <Link
                              href={`/projects/${task.projectId}`}
                              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                            >
                              查看所屬專案
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">本版修正重點</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• 編輯改成按鈕展開，不一開始就全開。</li>
              <li>• 回覆邏輯改成主項目 / 子項目樹狀結構。</li>
              <li>• 先不調整整體版面簡化，專注修正互動邏輯。</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">下一步</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <p>1. 設計任務版資料連回專案詳細頁</p>
              <p>2. 同樣邏輯套到備品採購版</p>
              <p>3. 再做整體版面精簡收斂</p>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
