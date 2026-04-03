"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type VendorDocumentStatus,
  type VendorPackage,
  getVendorDocumentStatusClass,
} from "@/components/vendor-data";
import { upsertStoredVendorPackage } from "@/components/vendor-package-store";

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

  const currentPackage: VendorPackage = useMemo(
    () => ({
      ...vendorPackage,
      projectName,
      eventDate,
      location,
      loadInTime,
      items,
      note,
      documentStatus,
    }),
    [documentStatus, eventDate, items, loadInTime, location, note, projectName, vendorPackage],
  );

  useEffect(() => {
    upsertStoredVendorPackage(currentPackage);
  }, [currentPackage]);

  const documentText = buildDocumentText(currentPackage);
  const primaryActionLabel = documentStatus === "未生成" ? "生成文件" : documentStatus === "需更新" ? "重新生成文件" : null;
  const generatedCountLabel = `${items.length} 項`;

  async function handleCopy() {
    await navigator.clipboard.writeText(documentText);
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
      <header className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">發包主線</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h2>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
                文件 {documentStatus}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {projectName} ・ {eventDate}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">先整理這張發包單真正要對外發出的內容，再決定是否生成最新文件。</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
            <article className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">發包單代碼</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{vendorPackage.code}</p>
            </article>
            <article className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">項目數</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{items.length}</p>
            </article>
            <article className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">目前狀態</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{getDocumentStatusMessage(documentStatus)}</p>
            </article>
          </div>
        </div>
      </header>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <article className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">背景副本</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">文件背景</h3>
                <p className="mt-1 text-sm text-slate-500">保留發包單自己的背景副本，讓整理文件時不需要回頭改專案主資料。</p>
              </div>
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

          <section className="rounded-3xl border border-slate-200 p-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">主線整理</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">發包內容整理</h3>
                <p className="mt-1 text-sm text-slate-500">主線只整理項目名稱與需求內容，避免又回到任務管理頁語氣。</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">目前共 {generatedCountLabel}</div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">項目 {index + 1}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">對外列項</span>
                  </div>
                  <div className="mt-3 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">項目名稱</span>
                      <input value={item.itemName} onChange={(event) => updateItemName(item.id, event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">需求內容</span>
                      <textarea value={item.requirementText} onChange={(event) => updateRequirement(item.id, event.target.value)} rows={3} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 p-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">整體備註</span>
              <textarea value={note} onChange={(event) => { setNote(event.target.value); markDirty(); }} rows={4} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400" />
            </label>
          </section>
        </article>

        <aside className="space-y-4 self-start rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 2xl:sticky 2xl:top-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">文件狀態</h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
                {documentStatus}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{getDocumentStatusMessage(documentStatus)}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">對外文件預覽</h3>
              <span className="text-xs font-medium text-slate-500">TXT 文字稿</span>
            </div>

            {primaryActionLabel ? (
              <button type="button" onClick={handleGenerate} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                {primaryActionLabel}
              </button>
            ) : null}

            <pre className="mt-4 min-h-[420px] whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">{documentText}</pre>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <button type="button" onClick={handleCopy} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">複製內容</button>
              <button type="button" onClick={handleExport} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">匯出 TXT</button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
