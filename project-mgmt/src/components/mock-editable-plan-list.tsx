"use client";

import { useEffect, useState } from "react";
import { saveMockTaskDocument, type MockDocumentRow } from "@/components/mock-workflow-document-store";

type FieldType = "text" | "textarea" | "link";

type EditableField = {
  key: string;
  label: string;
  value: string;
  type?: FieldType;
  span?: string;
};

type EditablePlan = {
  id: string;
  fields: EditableField[];
};

type DocumentMode = "design" | "procurement" | "vendor";

type MockEditablePlanListProps = {
  taskId: string;
  mode: DocumentMode;
  plans: EditablePlan[];
  saveMessage: string;
  confirmMessage: string;
  columnsClassName?: string;
  addLabel?: string;
  addTemplate: EditableField[];
  documentLink?: string;
  externalAddButtonId?: string;
};

export function MockEditablePlanList({
  taskId,
  mode,
  plans,
  saveMessage,
  confirmMessage,
  columnsClassName = "md:grid-cols-2 xl:grid-cols-4",
  addLabel = "新增執行處理",
  addTemplate,
  documentLink,
  externalAddButtonId,
}: MockEditablePlanListProps) {
  const [draftPlans, setDraftPlans] = useState(plans);

  function updateField(planId: string, key: string, value: string) {
    setDraftPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              fields: plan.fields.map((field) => (field.key === key ? { ...field, value } : field)),
            }
          : plan,
      ),
    );
  }

  function addPlan() {
    setDraftPlans((current) => [
      ...current,
      {
        id: `mock-plan-${Date.now()}-${current.length + 1}`,
        fields: addTemplate.map((field) => ({ ...field })),
      },
    ]);
  }

  function removePlan(planId: string) {
    setDraftPlans((current) => current.filter((plan) => plan.id !== planId));
  }

  useEffect(() => {
    if (!externalAddButtonId) return;

    const element = document.getElementById(externalAddButtonId);
    if (!element) return;

    const handleClick = () => addPlan();
    element.addEventListener("click", handleClick);
    return () => element.removeEventListener("click", handleClick);
  }, [externalAddButtonId]);

  function getValue(plan: EditablePlan, key: string) {
    return plan.fields.find((field) => field.key === key)?.value || "";
  }

  function buildDocumentRows(plans: EditablePlan[]): MockDocumentRow[] {
    return plans.map((plan, index) => {
      if (mode === "design") {
        return {
          id: index + 1,
          item: getValue(plan, "title") || `處理方案 ${index + 1}`,
          size: getValue(plan, "size") || "未填寫",
          materialStructure: `${getValue(plan, "material") || "未填寫"} + ${getValue(plan, "structure") || "未填寫"}`,
          quantity: getValue(plan, "quantity") || "未填寫",
        };
      }

      return {
        id: index + 1,
        item: getValue(plan, "title") || `處理方案 ${index + 1}`,
        quantity: mode === "vendor" ? getValue(plan, "amount") || "未填寫" : getValue(plan, "quantity") || "未填寫",
      };
    });
  }

  return (
    <div className="space-y-4">
      {draftPlans.length ? draftPlans.map((plan) => (
        <article key={plan.id} className="rounded-2xl border border-slate-200 p-5">
          <div className={`grid gap-3 ${columnsClassName}`}>
            {plan.fields.map((field) => {
              const spanClass = field.span || "";
              const baseClass = `rounded-2xl bg-slate-50 px-4 py-3 ${spanClass}`.trim();

              return (
                <label key={field.key} className={baseClass}>
                  <p className="text-xs text-slate-500">{field.label}</p>
                  {field.type === "textarea" ? (
                    <textarea
                      value={field.value}
                      onChange={(event) => updateField(plan.id, field.key, event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-400"
                    />
                  ) : (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(event) => updateField(plan.id, field.key, event.target.value)}
                      className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-400"
                    />
                  )}
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => removePlan(plan.id)}
              className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              刪除這筆處理
            </button>

            <div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.alert(saveMessage)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                >
                  儲存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveMockTaskDocument(taskId, {
                      rows: buildDocumentRows(draftPlans),
                      documentLink,
                      updatedAt: Date.now(),
                    });
                    window.alert(confirmMessage);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        </article>
      )) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-500">
          目前尚無執行處理方案，請先新增一筆處理內容。
        </div>
      )}
    </div>
  );
}
