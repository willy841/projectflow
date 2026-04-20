"use client";

import { useMemo, useState } from "react";
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
  taskTitle,
  plans,
}: {
  taskId: string;
  taskTitle: string;
  plans: PlanRow[];
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[0]?.id ?? null);

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null, [plans, selectedPlanId]);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <h3 className="text-base font-semibold text-slate-900">執行回覆列表</h3>
          <p className="mt-1 text-sm text-slate-500">左側快速切換這筆設計任務底下的執行回覆。</p>
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
        <div className="mb-5 border-b border-slate-100 pb-4">
          <p className="text-xs font-medium tracking-wide text-slate-500">執行處理</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{selectedPlan?.title || taskTitle}</p>
          <p className="mt-1 text-sm text-slate-500">右側固定只顯示一筆執行回覆的欄位內容，左側切換時同步切換。</p>
        </div>

        <DesignPlanEditorClient
          taskId={taskId}
          initialPlans={plans}
          selectedPlanId={selectedPlan?.id ?? null}
          onSelectPlanId={setSelectedPlanId}
        />
      </section>
    </div>
  );
}
