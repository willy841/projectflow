"use client";

import { useState } from "react";

type RequirementItem = {
  title: string;
  date: string;
};

export function RequirementsPanel({
  initialItems,
}: {
  initialItems: { title: string }[];
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [items, setItems] = useState<RequirementItem[]>(
    initialItems.map((item, index) => ({
      title: item.title,
      date: index === 0 ? today : today,
    }))
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<RequirementItem>({
    title: "",
    date: today,
  });

  function resetForm() {
    setForm({
      title: "",
      date: today,
    });
  }

  function handleCreate() {
    const title = form.title.trim();
    if (!title) return;

    setItems((prev) => [...prev, { ...form, title }]);
    resetForm();
    setShowCreate(false);
  }

  function handleEdit(index: number) {
    setEditingIndex(index);
    setShowCreate(false);
    setForm(items[index]);
  }

  function handleSaveEdit() {
    if (editingIndex === null) return;
    const title = form.title.trim();
    if (!title) return;

    setItems((prev) =>
      prev.map((item, index) =>
        index === editingIndex ? { ...form, title } : item
      )
    );

    setEditingIndex(null);
    resetForm();
  }

  function cancelEditing() {
    setEditingIndex(null);
    setShowCreate(false);
    resetForm();
  }

  const isEditing = editingIndex !== null;

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold">需求溝通</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">在專案內直接記錄需求溝通內容與此次溝通日期。</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowCreate((prev) => !prev);
            setEditingIndex(null);
            resetForm();
          }}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
        >
          + 新增紀錄
        </button>
      </div>

      {(showCreate || isEditing) ? (
        <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-[160px_1fr]">
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            />
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="輸入需求溝通內容，例如：入口主背板需搭配春季主題色與產品燈箱"
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={isEditing ? handleSaveEdit : handleCreate}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {isEditing ? "儲存修改" : "建立紀錄"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{item.date}</p>
                <h4 className="mt-2 font-semibold text-slate-900">{item.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => handleEdit(index)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                編輯
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
