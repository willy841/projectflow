"use client";

import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";

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
  vendorId?: string;
};

type VendorOption = {
  id: string;
  name: string;
};

export function DesignPlanEditorClient({
  taskId,
  projectId,
  plans,
  onPlansChange,
  selectedPlanId,
  onSelectPlanId,
  hideTopActions = false,
  externalHeaderActions,
}: {
  taskId: string;
  projectId: string;
  plans: DesignPlanInput[];
  onPlansChange: Dispatch<SetStateAction<DesignPlanInput[]>>;
  selectedPlanId?: string | null;
  onSelectPlanId?: (planId: string | null) => void;
  hideTopActions?: boolean;
  externalHeaderActions?: (actions: {
    addPlan: () => void;
    confirmPlans: () => void;
    confirming: boolean;
    saveSelectedPlan: () => void;
    removeSelectedPlan: () => void;
    saving: boolean;
  }) => void;
}) {
  const router = useRouter();
  const vendorListId = useId();
  const useDbActions = useMemo(
    () => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(taskId),
    [taskId],
  );
  const setPlans = onPlansChange;
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);

  useEffect(() => {
    externalHeaderActions?.({
      addPlan,
      confirmPlans,
      confirming,
      saveSelectedPlan: saveAllPlans,
      removeSelectedPlan: () => {
        if (selectedPlanId) removePlan(selectedPlanId);
      },
      saving,
    });
  }, [externalHeaderActions, confirming, saving, plans, selectedPlanId]);

  useEffect(() => {
    if (!useDbActions) return;

    let active = true;

    fetch("/api/vendors")
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { vendors?: VendorOption[] } | null) => {
        if (!active) return;
        setVendorOptions(payload?.vendors ?? []);
      })
      .catch(() => {
        if (!active) return;
        setVendorOptions([]);
      });

    return () => {
      active = false;
    };
  }, [useDbActions]);

  useEffect(() => {
    if (!vendorOptions.length) return;
    setPlans((current) =>
      current.map((plan) => {
        if (plan.vendorId) return plan;
        const matchedVendor = vendorOptions.find((vendor) => vendor.name === plan.vendor);
        return matchedVendor ? { ...plan, vendorId: matchedVendor.id } : plan;
      }),
    );
  }, [vendorOptions]);

  function updatePlan(id: string, key: keyof DesignPlanInput, value: string) {
    setPlans((current) =>
      current.map((plan) => {
        if (plan.id !== id) return plan;
        if (key === "vendor") {
          const matchedVendor = vendorOptions.find((vendor) => vendor.name === value);
          return { ...plan, vendor: value, vendorId: matchedVendor?.id };
        }
        return { ...plan, [key]: value };
      }),
    );
  }

  function addPlan() {
    const nextId = `draft-${Date.now()}-${plans.length + 1}`;
    setPlans((current) => [
      {
        id: nextId,
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
    onSelectPlanId?.(nextId);
  }

  async function syncPlans(nextPlans: DesignPlanInput[]) {
    const currentPlans = nextPlans.filter((plan) => {
      const fields = [plan.title, plan.size, plan.material, plan.structure, plan.quantity, plan.amount, plan.previewUrl, plan.vendor];
      return fields.some((value) => value.trim());
    });

    const response = await fetch(`/api/design-tasks/${taskId}/replace-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plans: currentPlans.map((plan) => ({ ...plan, vendorId: plan.vendorId ?? null })) }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "sync design plans failed");
    }

    const payload = (await response.json()) as {
      rows?: Array<{
        id: string;
        title: string;
        size: string | null;
        material: string | null;
        structure: string | null;
        quantity: string | null;
        amount: string | number | null;
        preview_url: string | null;
        vendor_name_text: string | null;
        vendor_id: string | null;
      }>;
    };

    const normalizedRows = Array.isArray(payload.rows)
      ? payload.rows.map((row) => ({
          id: row.id,
          title: row.title ?? "",
          size: row.size ?? "",
          material: row.material ?? "",
          structure: row.structure ?? "",
          quantity: row.quantity ?? "",
          amount: row.amount ? `NT$ ${row.amount}` : "",
          previewUrl: row.preview_url ?? "",
          vendor: row.vendor_name_text ?? "",
          vendorId: row.vendor_id ?? undefined,
        }))
      : [];

    setPlans(normalizedRows);
    return normalizedRows;
  }

  async function removePlan(id: string) {
    const next = plans.filter((plan) => plan.id !== id);

    if (!useDbActions) {
      setPlans(next);
      if (selectedPlanId === id) {
        onSelectPlanId?.(next[0]?.id ?? null);
      }
      return;
    }

    try {
      setSaving(true);
      const persistedRows = await syncPlans(next);
      if (selectedPlanId === id) {
        onSelectPlanId?.(persistedRows[0]?.id ?? null);
      }
    } catch (error) {
      setMessage(`刪除失敗：${error instanceof Error ? error.message : "請稍後再試。"}`);
    } finally {
      setSaving(false);
    }
  }

  async function persistCurrentPlans() {
    const selectedBeforeSave = selectedPlanId ? plans.find((plan) => plan.id === selectedPlanId) ?? null : null;
    const persistedRows = await syncPlans(plans);

    if (selectedPlanId) {
      const matchedRow = persistedRows.find((row) => {
        if (row.id === selectedPlanId) return true;
        if (!selectedBeforeSave) return false;
        return (
          row.title === selectedBeforeSave.title &&
          row.size === selectedBeforeSave.size &&
          row.material === selectedBeforeSave.material &&
          row.structure === selectedBeforeSave.structure &&
          row.quantity === selectedBeforeSave.quantity &&
          row.previewUrl === selectedBeforeSave.previewUrl &&
          row.vendor === selectedBeforeSave.vendor
        );
      });
      onSelectPlanId?.(matchedRow?.id ?? persistedRows[0]?.id ?? null);
    }

    return persistedRows.length;
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

      const response = await fetch(`/api/design-tasks/${taskId}/confirm`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("confirm failed");
      }

      router.push(`/projects/${projectId}/design-document`);
      router.refresh();
    } catch (error) {
      setMessage(`全部確認失敗：${error instanceof Error ? error.message : "請稍後再試。"}`);
    } finally {
      setConfirming(false);
    }
  }

  const visiblePlans = selectedPlanId ? plans.filter((plan) => plan.id === selectedPlanId) : plans;

  return (
    <div className="space-y-4">
      {!hideTopActions ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500">執行處理</p>
            <p className="mt-1 text-base font-semibold text-slate-900">目前正在編輯單筆執行回覆</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addPlan}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              新增執行處理
            </button>
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
      ) : null}
      {visiblePlans.map((plan, index) => (
        <article key={plan.id} className="space-y-4">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400">執行處理 #{index + 1}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="xl:col-span-2">
              <p className="text-xs font-medium tracking-wide text-slate-400">標題</p>
              <input value={plan.title} onChange={(e) => updatePlan(plan.id, "title", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" />
            </label>
            <label>
              <p className="text-xs font-medium tracking-wide text-slate-400">尺寸</p>
              <input value={plan.size} onChange={(e) => updatePlan(plan.id, "size", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" />
            </label>
            <label>
              <p className="text-xs font-medium tracking-wide text-slate-400">材質</p>
              <input value={plan.material} onChange={(e) => updatePlan(plan.id, "material", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" />
            </label>
            <label>
              <p className="text-xs font-medium tracking-wide text-slate-400">結構</p>
              <input value={plan.structure} onChange={(e) => updatePlan(plan.id, "structure", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" />
            </label>
            <label>
              <p className="text-xs font-medium tracking-wide text-slate-400">數量</p>
              <input value={plan.quantity} onChange={(e) => updatePlan(plan.id, "quantity", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" />
            </label>
            <label>
              <p className="text-xs font-medium tracking-wide text-slate-400">金額</p>
              <input value={plan.amount} onChange={(e) => updatePlan(plan.id, "amount", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" />
            </label>
            <label className="xl:col-span-2">
              <p className="text-xs font-medium tracking-wide text-slate-400">預覽連結</p>
              <input value={plan.previewUrl} onChange={(e) => updatePlan(plan.id, "previewUrl", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20" />
            </label>
            <label className="xl:col-span-2">
              <p className="text-xs font-medium tracking-wide text-slate-400">執行廠商</p>
              <input
                list={vendorListId}
                value={plan.vendor}
                onChange={(e) => updatePlan(plan.id, "vendor", e.target.value)}
                placeholder={vendorOptions.length ? "可直接輸入或選擇既有廠商" : "可直接輸入廠商名稱"}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm font-medium text-slate-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
              />
            </label>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4" />
        </article>
      ))}

      {vendorOptions.length ? (
        <datalist id={vendorListId}>
          {vendorOptions.map((vendor) => (
            <option key={vendor.id} value={vendor.name} />
          ))}
        </datalist>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm whitespace-pre-line text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
          {message}
        </div>
      ) : null}
    </div>
  );
}
