"use client";

import { useState } from "react";

export function CopyEventInfoButton({
  projectName,
  eventDate,
  location,
  loadInTime,
}: {
  projectName: string;
  eventDate: string;
  location: string;
  loadInTime: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [
      `活動名稱：${projectName}`,
      `活動日期：${eventDate}`,
      `場地：${location}`,
      `進場時間：${loadInTime}`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 text-sm font-semibold text-slate-100 shadow-[0_22px_46px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-slate-900/70 hover:shadow-[0_0_24px_rgba(96,165,250,0.16)]"
    >
      {copied ? "已複製活動資訊" : "複製活動資訊"}
    </button>
  );
}
