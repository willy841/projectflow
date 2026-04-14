"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type DesignPlanInput = {
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

export function DesignPlanEditorClient({
  taskId,
  initialPlans,
}: {
  taskId: string;
  initialPlans: DesignPlanInput[];
}) {
  const router = useRouter();
  const useDbActions = useMemo(
    () => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(taskId),
    [taskId],
  );
  const [plans, setPlans] = useState<DesignPlanInput[]>(
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
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function updatePlan(id: string, key: keyof DesignPlanInput, value: string) {
    setPlans((current) =>
      current.map((plan) => (plan.id === id ? { ...plan, [key]: value } : plan)),
    );
  }

  function addPlan() {
    setPlans((current) => [
      {
        id: `draft-${Date.now()}-${current.length + 1}`,
        title: "",
        size: "",
        material: "",
        structure: "",
        quantity: "",
        amount: "",
        previewUrl: "",
        vendor: "",
      },
      ...current,
    ]);
  }

  function removePlan(id: string) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
  }

  async function persistCurrentPlans() {
    const currentPlans = plans.filter((plan) => plan.title.trim());

    const response = await fetch(`/api/design-tasks/${taskId}/sync-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plans: currentPlans }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "sync design plans failed");
    }

    return currentPlans.length;
  }

  async function saveAllPlans() {
    setSaving(true);
    setMessage("");

    try {
      if (!useDbActions) {
        setMessage("這筆任務目前仍是舊 mock 路由資料，請改從正式任務列表進入。\n目前不會寫入正式資料。");
        return;
      }

      await persistCurrentPlans();
      setMessage("已儲存目前執行處理內容。\n重新整理後應可看到最新結果。");
      router.refresh();
    } catch (error) {
      setMessage(`儲存失敗：${error instanceof Error ? error.message : "請稍後再試。"}`);
    } finally {
      setSaving(false);
    }
  }

  async function confirmPlans() {
    setConfirming(true);
    setMessage("");

    try {
      if (!useDbActions) {
        setMessage("這筆任務目前仍是舊 mock 路由資料，請改從正式任務列表進入。\n目前不會建立正式確認結果。");
        return;
      }

      await persistCurrentPlans();

      const response = await fetch(`/api/design-tasks/${taskId}/confirm`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("confirm failed");
      }

      setMessage("已完成全部確認，正在前往文件。\n文件會承接這次正式成立的內容。");
      router.push(`/design-tasks/${taskId}/document`);
      router.refresh();
    } catch (error) {
      setMessage(`全部確認失敗：${error instanceof Error ? error.message : "請稍後再試。"}`);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addPlan}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            新增執行處理
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveAllPlans}
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
          >
            {saving ? "儲存中..." : "儲存"}
          </button>
          <button
            type="button"
            onClick={confirmPlans}
            disabled={confirming}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {confirming ? "確認中..." : "全部確認"}
          </button>
        </div>
      </div>

      {plans.map((plan, index) => (
        <article key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500">執行處理 #{index + 1}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">可先逐筆整理內容，再由上方統一確認。</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 xl:col-span-2">
              <p className="text-xs font-medium tracking-wide text-slate-500">標題</p>
              <input value={plan.title} onChange={(e) => updatePlan(plan.id, "title", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-slate-500">尺寸</p>
              <input value={plan.size} onChange={(e) => updatePlan(plan.id, "size", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-slate-500">材質</p>
              <input value={plan.material} onChange={(e) => updatePlan(plan.id, "material", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-slate-500">結構</p>
              <input value={plan.structure} onChange={(e) => updatePlan(plan.id, "structure", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-slate-500">數量</p>
              <input value={plan.quantity} onChange={(e) => updatePlan(plan.id, "quantity", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-slate-500">金額</p>
              <input value={plan.amount} onChange={(e) => updatePlan(plan.id, "amount", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 xl:col-span-2">
              <p className="text-xs font-medium tracking-wide text-slate-500">預覽連結</p>
              <input value={plan.previewUrl} onChange={(e) => updatePlan(plan.id, "previewUrl", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 xl:col-span-2">
              <p className="text-xs font-medium tracking-wide text-slate-500">執行廠商</p>
              <input value={plan.vendor} onChange={(e) => updatePlan(plan.id, "vendor", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900" />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => removePlan(plan.id)}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
            >
              刪除這筆處理
            </button>
          </div>
        </article>
      ))}

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm whitespace-pre-line text-emerald-800">
          {message}
        </div>
      ) : null}
    </div>
  );
}
