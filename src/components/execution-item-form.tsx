"use client";

import { useState } from "react";

type ExecutionItemFormValues = {
  title: string;
  category: string;
  status: string;
  detail: string;
  referenceExample: string;
};

const defaultForm: ExecutionItemFormValues = {
  title: "",
  category: "設計",
  status: "待交辦",
  detail: "",
  referenceExample: "",
};

export function ExecutionItemForm({
  projectName,
}: {
  projectName: string;
}) {
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  function updateField(key: keyof ExecutionItemFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <p className="text-sm text-slate-500">新增專案執行項目</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">建立討論 / 執行項目</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            項目建立後，就能從這一層發起設計交辦或備品交辦。這一版先讓你測試表單結構與操作流程。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">所屬專案</span>
            <input
              type="text"
              value={projectName}
              readOnly
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">項目名稱</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="例如：入口主背板 / 贈品包裝與動線指示"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">項目類型</span>
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="設計">設計</option>
              <option value="備品">備品</option>
              <option value="廠商">廠商</option>
              <option value="專案">專案</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">目前狀態</span>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="待交辦">待交辦</option>
              <option value="進行中">進行中</option>
              <option value="待拆解">待拆解</option>
              <option value="待確認">待確認</option>
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">內容說明</span>
            <textarea
              value={form.detail}
              onChange={(event) => updateField("detail", event.target.value)}
              placeholder="描述這個項目的需求背景、執行內容、交付重點。"
              className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">參考範例 / 備註</span>
            <input
              type="text"
              value={form.referenceExample}
              onChange={(event) => updateField("referenceExample", event.target.value)}
              placeholder="例如：春季視覺範例 A / 門市陳列範例 B"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            建立項目
          </button>
          <button type="button" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            清空表單
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">這層的角色</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• 專案執行項目是整個流程的中介層。</li>
            <li>• 先把討論內容拆成項目，再決定是否要發起設計交辦或備品交辦。</li>
            <li>• 一個項目後續可以對應多筆設計交辦與備品交辦。</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-400">表單狀態</p>
          {submitted ? (
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
              <p>已完成前端送出流程，下一階段接資料庫後可真正建立項目。</p>
              <p>項目名稱：{form.title || "尚未填寫"}</p>
              <p>類型：{form.category}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-300">
              尚未送出。這一版先讓你確認專案執行項目的表單與新增流程是否合理。
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
