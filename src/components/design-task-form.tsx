"use client";

import { useMemo, useState } from "react";
import { projects } from "@/components/project-data";

type DesignTaskFormValues = {
  projectId: string;
  title: string;
  assignee: string;
  due: string;
  size: string;
  material: string;
  quantity: string;
  structureRequired: string;
  referenceUrl: string;
  note: string;
  outsourceTarget: string;
  cost: string;
};

const defaultForm: DesignTaskFormValues = {
  projectId: projects[0]?.id ?? "",
  title: "",
  assignee: "",
  due: "",
  size: "",
  material: "",
  quantity: "",
  structureRequired: "需要",
  referenceUrl: "",
  note: "",
  outsourceTarget: "",
  cost: "",
};

export function DesignTaskForm({
  mode = "create",
  initialValues,
}: {
  mode?: "create" | "edit";
  initialValues?: Partial<DesignTaskFormValues>;
}) {
  const mergedDefault = useMemo(
    () => ({
      ...defaultForm,
      ...initialValues,
    }),
    [initialValues]
  );

  const [form, setForm] = useState<DesignTaskFormValues>(mergedDefault);
  const [submitted, setSubmitted] = useState(false);

  function updateField(key: keyof DesignTaskFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const isEdit = mode === "edit";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <p className="text-sm text-slate-500">{isEdit ? "編輯設計交辦" : "建立設計交辦"}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {isEdit ? "編輯設計交辦表單" : "新增設計交辦表單"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isEdit
              ? "這一版先做前端編輯流程，讓你確認欄位與修改體驗；之後接資料庫就能真正更新資料。"
              : "這一版先做前端可操作表單，讓你確認欄位是否符合實際交辦流程；之後接資料庫就能直接儲存。"}
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

          {[
            ["title", "項目名稱", "例如：主背板輸出完稿"],
            ["assignee", "負責設計", "例如：Aster"],
            ["due", "交期", "2026-03-31"],
            ["size", "尺寸", "例如：W240 x H300 cm"],
            ["material", "材質", "例如：珍珠板 + 輸出貼圖"],
            ["quantity", "數量", "例如：1 式"],
            ["referenceUrl", "參考連結", "https://..."],
            ["outsourceTarget", "發包對象", "例如：星澄輸出"],
            ["cost", "預估成本", "例如：NT$ 18,000"],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type="text"
                value={form[key as keyof DesignTaskFormValues]}
                onChange={(event) => updateField(key as keyof DesignTaskFormValues, event.target.value)}
                placeholder={placeholder}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          ))}

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">結構圖</span>
            <select
              value={form.structureRequired}
              onChange={(event) => updateField("structureRequired", event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="需要">需要</option>
              <option value="不需要">不需要</option>
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">需求 / 備註</span>
            <textarea
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              placeholder="例如：延續主視覺、需保留客戶二次修改、入口燈箱要同步調整"
              className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            {isEdit ? "儲存修改" : "儲存設計交辦"}
          </button>
          <button type="button" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            清空表單
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">欄位建議</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• 交辦名稱盡量明確，避免只寫「海報」這種太模糊的名稱。</li>
            <li>• 尺寸、材質、數量先寫完整，發包與製作才不容易出錯。</li>
            <li>• 參考連結可放 Figma、雲端圖片或範例頁。</li>
            <li>• 需求備註建議寫清楚修改方向與交付標準。</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-400">表單狀態</p>
          {submitted ? (
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
              <p>{isEdit ? "已完成前端修改流程，下一階段接 API 後可真正更新資料。" : "已完成前端送出流程，下一階段接 API 後可真正建立資料。"}</p>
              <p>設計交辦名稱：{form.title || "尚未填寫"}</p>
              <p>負責設計：{form.assignee || "尚未填寫"}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {isEdit ? "尚未送出。這一版先讓你確認編輯流程與欄位修改體驗。" : "尚未送出。這一版先讓你確認新增交辦的欄位與操作流是否順手。"}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
