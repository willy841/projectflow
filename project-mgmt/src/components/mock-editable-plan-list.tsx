"use client";

import { useState } from "react";
import { FeedbackActionButtons } from "@/components/mock-workflow-feedback";

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

type MockEditablePlanListProps = {
  plans: EditablePlan[];
  saveMessage: string;
  confirmMessage: string;
  columnsClassName?: string;
};

export function MockEditablePlanList({
  plans,
  saveMessage,
  confirmMessage,
  columnsClassName = "md:grid-cols-2 xl:grid-cols-4",
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

  return (
    <div className="space-y-4">
      {draftPlans.map((plan) => (
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

          <div className="mt-4 flex justify-end">
            <FeedbackActionButtons
              saveLabel="儲存"
              saveMessage={saveMessage}
              confirmLabel="確認"
              confirmMessage={confirmMessage}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
