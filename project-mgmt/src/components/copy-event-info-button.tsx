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
      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
    >
      {copied ? "已複製活動資訊" : "複製活動資訊"}
    </button>
  );
}
