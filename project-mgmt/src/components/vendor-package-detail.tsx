"use client";

import { useState } from "react";
import {
  type VendorDocumentStatus,
  type VendorPackage,
  getVendorDocumentStatusClass,
} from "@/components/vendor-data";

function getDocumentStatusMessage(status: VendorDocumentStatus) {
  if (status === "已生成") return "目前文件為最新版本";
  if (status === "需更新") return "目前文件不是最新內容，請重新生成";
  return "尚未生成正式文件";
}

function buildDocumentText(vendorPackage: VendorPackage) {
  return [
    `${vendorPackage.eventDate} ${vendorPackage.projectName}`,
    `地點：${vendorPackage.location}`,
    `進場時間：${vendorPackage.loadInTime}`,
    "",
    "需求內容",
    ...vendorPackage.items.map((item, index) => `${index + 1}. ${item.itemName || "-"}：${item.requirementText || "-"}`),
    "",
    "備註",
    vendorPackage.note || "-",
  ].join("\n");
}

export function VendorPackageDetail({ vendorPackage }: { vendorPackage: VendorPackage }) {
  const [projectName, setProjectName] = useState(vendorPackage.projectName);
  const [eventDate, setEventDate] = useState(vendorPackage.eventDate);
  const [location, setLocation] = useState(vendorPackage.location);
  const [loadInTime, setLoadInTime] = useState(vendorPackage.loadInTime);
  const [items, setItems] = useState(vendorPackage.items);
  const [note, setNote] = useState(vendorPackage.note);
  const [documentStatus, setDocumentStatus] = useState<VendorDocumentStatus>(vendorPackage.documentStatus);

  function markDirty() {
    setDocumentStatus((current) => (current === "已生成" ? "需更新" : current));
  }

  function updateItemName(id: string, value: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, itemName: value } : item)));
    markDirty();
  }

  function updateRequirement(id: string, value: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, requirementText: value } : item)));
    markDirty();
  }

  const currentPackage: VendorPackage = {
    ...vendorPackage,
    projectName,
    eventDate,
    location,
    loadInTime,
    items,
    note,
    documentStatus,
  };

  const documentText = buildDocumentText(currentPackage);
  const primaryActionLabel = documentStatus === "未生成" ? "生成文件" : documentStatus === "需更新" ? "重新生成文件" : null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(documentText);
      window.alert("已複製內容");
    } catch {
      window.alert("複製失敗，請再試一次");
    }
  }

  function handleExport() {
    const blob = new Blob([documentText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${vendorPackage.code}-document.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleGenerate() {
    if (documentStatus === "需更新") {
      const confirmed = window.confirm("目前文件不是最新內容，確定要重新生成文件嗎？");
      if (!confirmed) return;
    }
    setDocumentStatus("已生成");
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h2>
          </div>
          <span className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
            文件 {documentStatus}
          </span>
        </div>
      </header>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <article className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <section>
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-900">背景資訊</h3>
            </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">專案名稱</span>
              <input value={projectName} onChange={(event) => { setProjectName(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">活動日期</span>
              <input type="date" value={eventDate} onChange={(event) => { setEventDate(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">地點</span>
              <input value={location} onChange={(event) => { setLocation(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">進場時間</span>
              <input type="time" value={loadInTime} onChange={(event) => { setLoadInTime(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
          </div>
          </section>

          <section>
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-900">發包項目整理</h3>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">項目 {index + 1}</p>
                  <div className="mt-3 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">項目名稱</span>
                      <input value={item.itemName} onChange={(event) => updateItemName(item.id, event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">需求內容</span>
                      <textarea value={item.requirementText} onChange={(event) => updateRequirement(item.id, event.target.value)} rows={3} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">文件整體備註</span>
              <textarea value={note} onChange={(event) => { setNote(event.target.value); markDirty(); }} rows={4} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
            </label>
          </section>
        </article>

        <aside className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-900">文件預覽</h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
                {documentStatus}
              </span>
            </div>
          </div>

          {primaryActionLabel ? (
            <button type="button" onClick={handleGenerate} className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              {primaryActionLabel}
            </button>
          ) : null}

          <pre className="min-h-[360px] whitespace-pre-wrap rounded-2xl bg-slate-900 p-5 text-sm leading-7 text-slate-100">{documentText}</pre>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleCopy} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">複製內容</button>
            <button type="button" onClick={handleExport} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">匯出 TXT</button>
          </div>
        </aside>
      </section>
    </div>
  );
}
