"use client";

import { useMemo, useState } from "react";
import { WorkspaceSection } from "@/components/workspace-ui";
import { DesignPlanEditorClient } from "@/components/design-plan-editor-client";

type PlanRow = {
  id: string;
  title: string;
  size: string;
  material: string;
  structure: string;
  quantity: string;
  amount: string;
  previewUrl: string;
  vendor: string;
};

export function DesignTaskWorkspace({
  taskId,
  projectId,
  taskTitle,
  plans: initialPlans,
}: {
  taskId: string;
  projectId: string;
  taskTitle: string;
  plans: PlanRow[];
}) {
  const [plans, setPlans] = useState<PlanRow[]>(
    initialPlans.length
      ? initialPlans
      : [
          {
            id: `draft-${Date.now()}`,
            title: "",
            size: "",
            material: "",
            structure: "",
            quantity: "",
            amount: "",
            previewUrl: "",
            vendor: "",
          },
        ],
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPlans[0]?.id ?? plans[0]?.id ?? null);
  const [headerActions, setHeaderActions] = useState<{
    addPlan: () => void;
    confirmPlans: () => void;
    confirming: boolean;
    saveSelectedPlan: () => void;
    removeSelectedPlan: () => void;
    saving: boolean;
  } | null>(null);

  const selectedPlan = useMemo(() => {
    if (selectedPlanId) {
      return plans.find((plan) => plan.id === selectedPlanId) ?? null;
    }
    return plans[0] ?? null;
  }, [plans, selectedPlanId]);

  return (
    <WorkspaceSection
      title="執行處理"
      actions={headerActions ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={headerActions.addPlan}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            新增執行處理
          </button>
          <button
            type="button"
            onClick={headerActions.confirmPlans}
            disabled={headerActions.confirming}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {headerActions.confirming ? "確認中..." : "全部確認"}
          </button>
        </div>
      ) : null}
      className="p-0"
    >
      <div className="grid gap-4 p-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4">
            <h3 className="text-base font-semibold text-slate-900">執行回覆列表</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {plans.length ? plans.map((plan, index) => {
              const active = selectedPlan?.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`block w-full px-4 py-4 text-left transition ${active ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-xs font-medium ${active ? 'text-slate-300' : 'text-slate-500'}`}>回覆 #{index + 1}</p>
                      <p className={`mt-1 line-clamp-2 text-sm font-semibold ${active ? 'text-white' : 'text-slate-900'}`}>{plan.title || taskTitle}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${active ? 'bg-white/10 text-white ring-white/15' : 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                      {plan.amount || '未填金額'}
                    </span>
                  </div>
                  <div className={`mt-3 grid gap-2 text-xs ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                    <div>尺寸：{plan.size || '未填寫'}</div>
                    <div>材質：{plan.material || '未填寫'}</div>
                    <div>結構：{plan.structure || '未填寫'}</div>
                    <div>數量：{plan.quantity || '未填寫'}</div>
                  </div>
                </button>
              );
            }) : (
              <div className="px-4 py-6 text-sm text-slate-500">目前尚無執行回覆，請先在右側建立第一筆處理內容。</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500">目前檢視</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{selectedPlan?.title || taskTitle}</p>
            </div>
            {selectedPlan && headerActions ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={headerActions.saveSelectedPlan}
                  disabled={headerActions.saving}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
                >
                  {headerActions.saving ? "儲存中..." : "儲存"}
                </button>
                <button
                  type="button"
                  onClick={headerActions.removeSelectedPlan}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
                >
                  刪除這筆處理
                </button>
              </div>
            ) : null}
          </div>

          <DesignPlanEditorClient
            taskId={taskId}
            projectId={projectId}
            plans={plans}
            onPlansChange={setPlans}
            selectedPlanId={selectedPlanId}
            onSelectPlanId={setSelectedPlanId}
            hideTopActions
            externalHeaderActions={setHeaderActions}
          />
        </section>
      </div>
    </WorkspaceSection>
  );
}
