"use client";

import { useMemo, useState } from "react";
import { projects } from "@/components/project-data";

type ProcurementTaskFormValues = {
  projectId: string;
  executionItemId?: string;
  executionItemTitle?: string;
  title: string;
  quantity: string;
  budget: string;
  referenceUrl: string;
  note: string;
};

const defaultForm: ProcurementTaskFormValues = {
  projectId: projects[0]?.id ?? "",
  executionItemId: "",
  executionItemTitle: "",
  title: "",
  quantity: "",
  budget: "",
  referenceUrl: "",
  note: "",
};

export function ProcurementTaskForm({
  initialValues,
}: {
  initialValues?: Partial<ProcurementTaskFormValues>;
}) {
  const mergedDefault = useMemo(
    () => ({
      ...defaultForm,
      ...initialValues,
    }),
    [initialValues]
  );

  const [form, setForm] = useState<ProcurementTaskFormValues>(mergedDefault);
  const [submitted, setSubmitted] = useState(false);

  function updateField(key: keyof ProcurementTaskFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const selectedProject = projects.find((project) => project.id === form.projectId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <p className="text-sm text-slate-500">建立備品交辦</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">新增備品交辦表單</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            這一版改成從專案執行項目或次項目發起備品交辦，先確認操作邏輯與欄位是否符合實際流程。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">所屬專案</span>
            <select
              value={form.projectId}
              onChange={(event) => updateField("projectId", event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.code}｜{project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">來源討論項目</span>
            <input
              type="text"
              value={form.executionItemTitle || ""}
              onChange={(event) => updateField("executionItemTitle", event.target.value)}
              placeholder="例如：陳列桌與品牌立牌"
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400"
            />
            {selectedProject?.executionItems?.length ? (
              <p className="text-xs text-slate-500">
                可對應的專案執行項目：{selectedProject.executionItems.map((item) => item.title).join("、")}
              </p>
            ) : null}
          </label>

          {[
            ["title", "備品名稱", "例如：壓克力展示架"],
            ["quantity", "數量", "例如：3 組"],
            ["budget", "預算", "例如：NT$ 18,000"],
            ["referenceUrl", "參考連結", "https://..."],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type="text"
                value={form[key as keyof ProcurementTaskFormValues] || ""}
                onChange={(event) => updateField(key as keyof ProcurementTaskFormValues, event.target.value)}
                placeholder={placeholder}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          ))}

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">需求 / 備註</span>
            <textarea
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              placeholder="例如：需可重複使用、顏色需與主視覺一致、預算可微調"
              className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
            建立備品交辦
          </button>
          <button type="button" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            清空表單
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">流程說明</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• 備品交辦同樣是從專案執行項目發起。</li>
            <li>• 這層主要負責採購需求、數量、預算與參考樣式。</li>
            <li>• 後續接資料庫後，就能完整追蹤項目與備品交辦的關聯。</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-400">表單狀態</p>
          {submitted ? (
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
              <p>已完成前端送出流程，下一階段接 API 後可真正建立資料。</p>
              <p>來源項目：{form.executionItemTitle || "尚未填寫"}</p>
              <p>備品名稱：{form.title || "尚未填寫"}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-300">
              尚未送出。這一版先讓你確認從專案項目發起備品交辦的操作流是否正確。
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
