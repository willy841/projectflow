"use client";

import { useMemo, useState } from "react";
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

  const documentText = useMemo(() => buildDocumentText(currentPackage), [currentPackage]);
  const primaryActionLabel = documentStatus === "未生成" ? "生成文件" : documentStatus === "需更新" ? "重新生成文件" : null;

  async function handleCopy() {
    await navigator.clipboard.writeText(documentText);
  }

  function handleExport() {
    const blob = new Blob([documentText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${vendorPackage.code}-發包文件.txt`;
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
      <header className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-slate-500">發包主線</p>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h2>
              <p className="text-sm text-slate-600">{projectName} ・ {eventDate}</p>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">先在左側整理真正要對外發出的內容；右側只負責判讀文件狀態、預覽與輸出，不讓操作節奏搶走主線。</p>
          </div>
          <div className="flex flex-col items-start gap-2 xl:items-end">
            <span className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
              文件 {documentStatus}
            </span>
            <p className="text-xs text-slate-500">{items.length} 筆項目待整理</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <article className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">發包背景</h3>
                <p className="mt-1 text-sm text-slate-500">保留這張發包單自己的背景副本，整理內容時不用回頭改專案主資料。</p>
              </div>
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">左主區先處理背景與項目</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">專案名稱</span>
                <input value={projectName} onChange={(event) => { setProjectName(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">活動日期</span>
                <input type="date" value={eventDate} onChange={(event) => { setEventDate(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">地點</span>
                <input value={location} onChange={(event) => { setLocation(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">進場時間</span>
                <input type="time" value={loadInTime} onChange={(event) => { setLoadInTime(event.target.value); markDirty(); }} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400" />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">發包內容整理</h3>
                <p className="mt-1 text-sm text-slate-500">主線只整理項目名稱與需求內容，讓頁面維持成熟的左主右輔閱讀節奏。</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
                共 {items.length} 筆項目
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-900 px-3 text-sm font-semibold text-white">{index + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">發包項目 {index + 1}</p>
                        <p className="mt-1 text-xs text-slate-500">先定義對外看的項目名稱，再收斂實際需求內容。</p>
                      </div>
                    </div>
                    <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">對外條目</span>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">項目名稱</span>
                      <input value={item.itemName} onChange={(event) => updateItemName(item.id, event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">需求內容</span>
                      <textarea value={item.requirementText} onChange={(event) => updateRequirement(item.id, event.target.value)} rows={4} className="min-h-[124px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">整體備註</span>
              <textarea value={note} onChange={(event) => { setNote(event.target.value); markDirty(); }} rows={4} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400" />
            </label>
          </section>
        </article>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-900">文件狀態</h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
                {documentStatus}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{getDocumentStatusMessage(documentStatus)}</p>

            {primaryActionLabel ? (
              <button type="button" onClick={handleGenerate} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                {primaryActionLabel}
              </button>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-500">文件條目</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{items.length} 筆</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-500">備註狀態</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{note.trim() ? "已填寫" : "未填寫"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-900">文件預覽</h3>
              <span className="text-xs text-slate-500">右輔區</span>
            </div>
            <pre className="mt-4 min-h-[360px] whitespace-pre-wrap rounded-2xl bg-slate-900 p-5 text-sm leading-7 text-slate-100">{documentText}</pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={handleCopy} className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">複製內容</button>
              <button type="button" onClick={handleExport} className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">匯出文字檔</button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
