"use client";

import { useState } from "react";

type RequirementItem = {
  title: string;
  date: string;
};

function getCurrentTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function RequirementsPanel({
  initialItems,
}: {
  initialItems: { title: string }[];
}) {
  const initialTimestamp = getCurrentTimestamp();

  const [items, setItems] = useState<RequirementItem[]>(
    initialItems.map((item) => ({
      title: item.title,
      date: initialTimestamp,
    }))
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");

  function resetForm() {
    setFormTitle("");
  }

  function handleCreate() {
    const title = formTitle.trim();
    if (!title) return;

    setItems((prev) => [{ title, date: getCurrentTimestamp() }, ...prev]);
    resetForm();
    setShowCreate(false);
  }

  function handleEdit(index: number) {
    setEditingIndex(index);
    setShowCreate(false);
    setFormTitle(items[index].title);
  }

  function handleSaveEdit() {
    if (editingIndex === null) return;
    const title = formTitle.trim();
    if (!title) return;

    setItems((prev) => {
      const updatedItem = { title, date: getCurrentTimestamp() };
      return [
        updatedItem,
        ...prev.filter((_, index) => index !== editingIndex),
      ];
    });

    setEditingIndex(null);
    resetForm();
  }

  function handleDelete(index: number) {
    const confirmed = window.confirm("確定要刪除這筆需求溝通紀錄嗎？");
    if (!confirmed) return;

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
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 pt-2 sm:pt-1.5">
          <h3 className="text-xl font-semibold leading-none">需求溝通</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowCreate((prev) => !prev);
            setEditingIndex(null);
            resetForm();
          }}
          className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
        >
          + 新增紀錄
        </button>
      </div>

      {(showCreate || isEditing) ? (
        <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="space-y-3 text-left">
            <textarea
              value={formTitle}
              onChange={(event) => setFormTitle(event.target.value)}
              placeholder="輸入需求溝通內容，例如：入口主背板需搭配春季主題色與產品燈箱"
              className="min-h-48 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-slate-400"
            />
            <p className="text-left text-xs text-slate-500">儲存時會自動記錄當下日期與時間</p>
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
          <div key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 px-4 py-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
