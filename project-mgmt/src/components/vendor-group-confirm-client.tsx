"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VendorGroupConfirmClient({
  projectId,
  vendorId,
  packageId,
}: {
  projectId: string;
  vendorId: string;
  packageId: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  async function handleConfirmGroup() {
    setConfirming(true);
    setMessage("");
    try {
      const response = await fetch(`/api/vendor-groups/${projectId}/${vendorId}/confirm`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; taskCount?: number }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "group confirm failed");
      }

      setMessage(`已完成全部確認，共承接 ${payload.taskCount ?? 0} 筆任務，正在前往文件。`);
      router.push(`/vendor-packages/${packageId}`);
      router.refresh();
    } catch (error) {
      setMessage(`全部確認失敗：${error instanceof Error ? error.message : "請稍後再試。"}`);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 xl:items-end">
      <button
        type="button"
        onClick={handleConfirmGroup}
        disabled={confirming}
        className="pf-btn-create min-h-11 px-4 py-2.5 disabled:opacity-60"
      >
        {confirming ? "確認中..." : "全部確認"}
      </button>
      {message ? <p className="text-xs leading-5 text-slate-400 xl:max-w-sm">{message}</p> : null}
    </div>
  );
}
