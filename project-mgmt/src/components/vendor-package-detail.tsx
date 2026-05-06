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
  const [isSaving, setIsSaving] = useState(false);

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

  async function persist(nextStatus: VendorDocumentStatus) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vendor-packages/${vendorPackage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note,
          documentStatus: nextStatus,
          items: items.map((item) => ({
            id: item.id,
            assignmentId: item.assignmentId,
            itemName: item.itemName,
            requirementText: item.requirementText,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error ?? 'vendor package save failed');
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '儲存失敗');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

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

  async function handleGenerate() {
    if (documentStatus === "需更新") {
      const confirmed = window.confirm("目前文件不是最新內容，確定要重新生成文件嗎？");
      if (!confirmed) return;
    }
    await persist("已生成");
    setDocumentStatus("已生成");
  }

  async function handleSaveDraft() {
    await persist(documentStatus);
    window.alert('已儲存包件內容');
  }

  const dirtyMessage = useMemo(() => getDocumentStatusMessage(documentStatus), [documentStatus]);

  return (
    <div className="space-y-6">
      <header className="pf-card p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-50">{vendorPackage.vendorName}</h2>
          </div>
          <span className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
            文件 {documentStatus}
          </span>
        </div>
      </header>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <article className="space-y-6 pf-card p-6">
          <section>
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-100">背景資訊</h3>
            </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">專案名稱</span>
              <input value={projectName} onChange={(event) => { setProjectName(event.target.value); markDirty(); }} className="pf-input h-11" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">活動日期</span>
              <input type="date" value={eventDate} onChange={(event) => { setEventDate(event.target.value); markDirty(); }} className="pf-input h-11" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">地點</span>
              <input value={location} onChange={(event) => { setLocation(event.target.value); markDirty(); }} className="pf-input h-11" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">進場時間</span>
              <input type="time" value={loadInTime} onChange={(event) => { setLoadInTime(event.target.value); markDirty(); }} className="pf-input h-11" />
            </label>
          </div>
          </section>

          <section>
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-100">發包項目整理</h3>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <p className="text-sm font-semibold text-slate-300">項目 {index + 1}</p>
                  <div className="mt-3 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-300">項目名稱</span>
                      <input value={item.itemName} onChange={(event) => updateItemName(item.id, event.target.value)} className="pf-input h-11" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-300">需求內容</span>
                      <textarea value={item.requirementText} onChange={(event) => updateRequirement(item.id, event.target.value)} rows={3} className="pf-input" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">文件整體備註</span>
              <textarea value={note} onChange={(event) => { setNote(event.target.value); markDirty(); }} rows={4} className="pf-input" />
            </label>
          </section>
        </article>

        <aside className="space-y-4 pf-card p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-100">預覽</h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
                {documentStatus}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{dirtyMessage}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {primaryActionLabel ? (
              <button type="button" disabled={isSaving} onClick={handleGenerate} className="pf-btn-primary px-4 py-2.5 disabled:opacity-60">
                {primaryActionLabel}
              </button>
            ) : null}
            <button type="button" disabled={isSaving} onClick={handleSaveDraft} className="pf-btn-secondary px-4 py-2.5 disabled:opacity-60">
              {isSaving ? '儲存中...' : '儲存包件內容'}
            </button>
          </div>

          <pre className="min-h-[360px] whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">{documentText}</pre>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleCopy} className="pf-btn-secondary px-4 py-2.5">複製內容</button>
            <button type="button" onClick={handleExport} className="pf-btn-secondary px-4 py-2.5">匯出 TXT</button>
          </div>
        </aside>
      </section>
    </div>
  );
}
