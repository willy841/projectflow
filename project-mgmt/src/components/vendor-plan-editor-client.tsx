"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type VendorPlanInput = {
  id: string;
  title: string;
  requirement: string;
  amount: string;
  vendorName?: string;
};

export function VendorPlanEditorClient({ taskId, initialPlans, showConfirmButton = true, vendorName }: { taskId: string; initialPlans: VendorPlanInput[]; showConfirmButton?: boolean; vendorName?: string }) {
  const router = useRouter();
  const useDbActions = useMemo(
    () => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(taskId),
    [taskId],
  );
  const [plans, setPlans] = useState<VendorPlanInput[]>(
    initialPlans.length ? initialPlans : [{ id: `draft-${Date.now()}`, title: "", requirement: "", amount: "", vendorName }],
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function updatePlan(id: string, key: keyof VendorPlanInput, value: string) {
    setPlans((current) => current.map((plan) => (plan.id === id ? { ...plan, [key]: value } : plan)));
  }

  function addPlan() {
    setPlans((current) => [{ id: `draft-${Date.now()}-${current.length + 1}`, title: "", requirement: "", amount: "", vendorName }, ...current]);
  }

  function removePlan(id: string) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
  }

  async function persistCurrentPlans() {
    const currentPlans = plans.filter((plan) => plan.title.trim());
    const response = await fetch(`/api/vendor-tasks/${taskId}/sync-plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plans: currentPlans.map((plan) => ({ ...plan, vendorName: plan.vendorName ?? vendorName ?? '' })) }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "sync vendor plans failed");
    }
  }

  async function saveAllPlans() {
    setSaving(true);
    setMessage("");
    try {
      if (!useDbActions) {
        setMessage("這筆任務目前不是正式 DB 任務。\n請改從正式任務列表進入，這裡不會寫入正式資料。");
        return;
      }
      await persistCurrentPlans();
      setMessage("已儲存目前執行處理內容。\n若要正式承接到文件，仍需由頁首進行全部確認。");
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
        setMessage("這筆任務目前不是正式 DB 任務。\n請改從正式任務列表進入，這裡不會建立正式確認結果。");
        return;
      }
      await persistCurrentPlans();
      const response = await fetch(`/api/vendor-tasks/${taskId}/confirm`, { method: "POST" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "confirm vendor failed");
      }
      setMessage("已完成全部確認，正在前往文件。\n文件會承接這次正式成立的內容。");
      router.push(`/vendor-assignments/${taskId}/document`);
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
        <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={addPlan} className="pf-btn-create min-h-11 px-4 py-2.5">新增執行處理</button></div>
        <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={saveAllPlans} disabled={saving} className="pf-btn-secondary min-h-11 px-4 py-2.5 disabled:opacity-60">{saving ? "儲存中..." : "儲存"}</button>{showConfirmButton ? <button type="button" onClick={confirmPlans} disabled={confirming} className="pf-btn-create min-h-11 px-4 py-2.5 disabled:opacity-60">{confirming ? "確認中..." : "全部確認"}</button> : null}</div>
      </div>

      {plans.map((plan, index) => (
        <article key={plan.id} className="space-y-4">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400">執行處理 #{index + 1}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label><p className="text-xs font-medium tracking-wide text-slate-400">標題</p><input value={plan.title} onChange={(e) => updatePlan(plan.id, "title", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" /></label>
            <label className="md:col-span-2"><p className="text-xs font-medium tracking-wide text-slate-400">需求說明</p><textarea value={plan.requirement} onChange={(e) => updatePlan(plan.id, "requirement", e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" /></label>
            <label><p className="text-xs font-medium tracking-wide text-slate-400">金額</p><input value={plan.amount} onChange={(e) => updatePlan(plan.id, "amount", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" /></label>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4"><button type="button" onClick={() => removePlan(plan.id)} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20">刪除這筆處理</button></div>
        </article>
      ))}

      {message ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm whitespace-pre-line text-emerald-200">{message}</div> : null}
    </div>
  );
}
