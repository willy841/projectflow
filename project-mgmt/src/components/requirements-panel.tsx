"use client";

import { useState } from "react";

type RequirementItem = {
  id?: string;
  title: string;
  date: string;
};

export function RequirementsPanel({
  projectId,
  initialItems,
}: {
  projectId?: string;
  initialItems: { id?: string; title: string; date?: string }[];
}) {
  const [items, setItems] = useState<RequirementItem[]>(
    initialItems.map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date ?? '-',
    }))
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");

  function resetForm() {
    setFormTitle("");
  }

  async function handleCreate() {
    const title = formTitle.trim();
    if (!title) return;

    if (!projectId) {
      setItems((prev) => [{ title, date: '-' }, ...prev]);
      resetForm();
      setShowCreate(false);
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const result = await response.json();
    if (!response.ok || !result?.ok || !result.item) return;

    setItems((prev) => [{ id: result.item.id, title: result.item.title, date: result.item.updatedAt }, ...prev]);
    resetForm();
    setShowCreate(false);
  }

  function handleEdit(index: number) {
    setEditingIndex(index);
    setShowCreate(false);
    setFormTitle(items[index].title);
  }

  async function handleSaveEdit() {
    if (editingIndex === null) return;
    const title = formTitle.trim();
    if (!title) return;

    const target = items[editingIndex];
    if (!target) return;

    if (!projectId || !target.id) {
      setItems((prev) => {
        const updatedItem = { ...target, title, date: target.date };
        return [updatedItem, ...prev.filter((_, index) => index !== editingIndex)];
      });
      setEditingIndex(null);
      resetForm();
      return;
    }

    const response = await fetch(`/api/project-requirements/${target.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const result = await response.json();
    if (!response.ok || !result?.ok || !result.item) return;

    setItems((prev) => {
      const updatedItem = { id: result.item.id, title: result.item.title, date: result.item.updatedAt };
      return [updatedItem, ...prev.filter((_, index) => index !== editingIndex)];
    });

    setEditingIndex(null);
    resetForm();
  }

  async function handleDelete(index: number) {
    const confirmed = window.confirm("確定要刪除這筆需求溝通紀錄嗎？");
    if (!confirmed) return;

    const target = items[index];
    if (projectId && target?.id) {
      const response = await fetch(`/api/project-requirements/${target.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result?.ok) return;
    }

    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      resetForm();
    }
  }

  function cancelEditing() {
    setEditingIndex(null);
    setShowCreate(false);
    resetForm();
  }

  const isEditing = editingIndex !== null;

  return (
    <article className="rounded-[32px] border border-white/70 bg-[var(--surface-card)] p-6 shadow-[var(--shadow-elevated)]">
      <div className="mb-4 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold leading-none">需求溝通</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowCreate((prev) => !prev);
            setEditingIndex(null);
            resetForm();
          }}
          className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl border border-[rgba(47,109,244,0.28)] bg-[linear-gradient(180deg,rgba(94,162,255,0.12),rgba(255,255,255,0.94))] px-4 text-sm font-semibold text-slate-800 shadow-[var(--shadow-soft)] transition hover:border-[rgba(47,109,244,0.42)] hover:bg-[linear-gradient(180deg,rgba(94,162,255,0.16),rgba(255,255,255,0.98))]"
        >
          + 新增紀錄
        </button>
      </div>

      {(showCreate || isEditing) ? (
        <div className="mb-4 rounded-[24px] border border-dashed border-slate-300/85 bg-[linear-gradient(180deg,rgba(244,248,255,0.95),rgba(237,243,253,0.9))] p-4 shadow-[var(--shadow-soft)]">
          <div className="space-y-3 text-left">
            <textarea
              value={formTitle}
              onChange={(event) => setFormTitle(event.target.value)}
              placeholder="輸入需求溝通內容，例如：入口主背板需搭配春季主題色與產品燈箱"
              className="min-h-48 w-full rounded-2xl border border-slate-200/90 bg-white/96 px-4 py-3 text-sm leading-7 shadow-[var(--shadow-soft)] outline-none transition focus:border-[var(--accent-strong)]"
            />
            <p className="text-left text-xs text-slate-500">儲存時會自動記錄當下日期與時間</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={isEditing ? handleSaveEdit : handleCreate}
              className="inline-flex items-center justify-center rounded-2xl border border-[rgba(47,109,244,0.8)] bg-[linear-gradient(180deg,#5ea2ff,#3478f6)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:brightness-105"
            >
              {isEditing ? "儲存修改" : "建立紀錄"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[var(--shadow-soft)] transition hover:border-slate-300 hover:bg-slate-50/95"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-[22px] border border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.9))] px-4 py-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium text-slate-500">{item.date}</p>
                <h4 className="mt-2 font-semibold text-slate-900">{item.title}</h4>
              </div>
              <div className="flex flex-wrap gap-2 self-start">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
