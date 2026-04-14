"use client";

import { useEffect, useMemo, useState } from "react";
import { useVendorStore } from "@/components/vendor-store";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (vendor: { id: string; name: string; tradeLabel?: string }) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export function VendorQuickCreateDialog({
  open,
  onClose,
  onCreated,
  title = "快速建立廠商",
  description = "保留最小建立能力：必填只有廠商名稱；工種單選、非必填。",
  confirmLabel = "建立廠商",
}: Props) {
  const { createVendor, tradeOptions } = useVendorStore();
  const [name, setName] = useState("");
  const [tradeLabel, setTradeLabel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setTradeLabel("");
      setError("");
    }
  }, [open]);

  const sortedTrades = useMemo(() => tradeOptions, [tradeOptions]);

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("請填寫廠商名稱。");
      return;
    }
    const result = createVendor({ name: trimmedName, tradeLabel: tradeLabel || undefined });
    if (!result.ok) {
      setError(`廠商「${result.vendor.name}」已存在，禁止重複建立。`);
      return;
    }
    onCreated?.(result.vendor);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500">QUICK CREATE</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            關閉
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <p className="mb-2 text-sm font-medium text-slate-700">廠商名稱 <span className="text-rose-500">*</span></p>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              placeholder="例如：晨光輸出"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>

          <label className="block">
            <p className="mb-2 text-sm font-medium text-slate-700">工種（單選、非必填）</p>
            <select
              value={tradeLabel}
              onChange={(event) => setTradeLabel(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="">暫不指定</option>
              {sortedTrades.map((trade) => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
          </label>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            取消
          </button>
          <button type="button" onClick={handleSubmit} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
