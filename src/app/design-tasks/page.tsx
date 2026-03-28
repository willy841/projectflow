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

type EditableTask = DesignTaskRecord & {
  replies: TaskReply[];
};

export default function DesignTasksPage() {
  const [tasks, setTasks] = useState<EditableTask[]>(
    designTaskGroups.map((task) => ({ ...task, replies: [] }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditableTask | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

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

  function addReply(taskId: string) {
    const message = (replyDrafts[taskId] ?? "").trim();
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
    setReplyDrafts((prev) => ({ ...prev, [taskId]: "" }));
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
              維持目前版面，先補上可直接編輯、回覆與狀態調整，下一階段再做與專案詳細頁更深的資料連動。
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
              <p className="mt-1 text-sm leading-6 text-slate-500">可直接在此頁編輯設計交辦內容、狀態與回覆。</p>
            </div>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => {
              const isEditing = editingId === task.id;
              const current = isEditing && editDraft ? editDraft : task;
              const isRepliesOpen = expandedReplies[task.id];

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
                          ["尺寸", current.size, "size"],
                          ["材質", current.material, "material"],
                          ["數量", current.quantity, "quantity"],
                          ["交期", current.due, "due"],
                        ].map(([label, value, field]) => (
                          <div key={String(label)} className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">{label}</p>
                            {isEditing ? (
                              <input
                                value={String(value)}
                                onChange={(event) => updateEditField(field as keyof EditableTask, event.target.value as never)}
                                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                              />
                            ) : (
                              <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">需求 / 備註</p>
                        {isEditing ? (
                          <textarea
                            value={current.note}
                            onChange={(event) => updateEditField("note", event.target.value as never)}
                            className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                          />
                        ) : (
                          <p className="mt-1 text-sm leading-6 text-slate-700">{current.note}</p>
                        )}
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
                                  <p>{reply.message}</p>
                                  <p className="mt-1 text-xs text-slate-400">{reply.createdAt}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-400">目前尚無回覆。</p>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <textarea
                                value={replyDrafts[task.id] ?? ""}
                                onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [task.id]: event.target.value }))}
                                placeholder="輸入設計任務回覆內容"
                                className="min-h-24 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => addReply(task.id)}
                                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                              >
                                送出回覆
                              </button>
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
                        {isEditing ? (
                          <input
                            value={current.assignee}
                            onChange={(event) => updateEditField("assignee", event.target.value as never)}
                            className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                          />
                        ) : (
                          <p className="mt-1 text-sm font-medium text-slate-900">{current.assignee}</p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">專案負責人</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{current.owner}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">參考連結</p>
                        {isEditing ? (
                          <input
                            value={current.referenceUrl}
                            onChange={(event) => updateEditField("referenceUrl", event.target.value as never)}
                            className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                          />
                        ) : (
                          <a href={current.referenceUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-medium text-blue-600 underline-offset-4 hover:underline">
                            開啟參考資料
                          </a>
                        )}
                      </div>

                      <div className="grid gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={saveEditing}
                              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              儲存變更
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                            >
                              取消編輯
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(task)}
                              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              直接編輯交辦
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
            <h3 className="text-lg font-semibold text-slate-900">本版已補內容</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• 設計交辦可直接在列表頁編輯。</li>
              <li>• 狀態可直接切換。</li>
              <li>• 可直接在列表頁新增回覆。</li>
              <li>• 維持原本版面結構，不重做整頁 layout。</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">下一步</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <p>1. 把設計交辦回覆同步回專案詳細頁</p>
              <p>2. 把編輯資料接回專案任務進度</p>
              <p>3. 再複製同樣邏輯到備品採購版</p>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
