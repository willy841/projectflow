"use client";

import { useState } from "react";
import {
  VendorDocumentStatus,
  VendorPackage,
  getVendorDocumentStatusClass,
} from "@/components/vendor-data";

function getDocumentStatusMessage(status: VendorDocumentStatus) {
  if (status === "已生成") return "目前文件為最新版本";
  if (status === "需更新") return "目前文件不是最新內容，請重新生成";
  return "尚未生成正式文件";
}

function buildDocumentText(vendorPackage: VendorPackage) {
  const lines = [
    `${vendorPackage.eventDate} ${vendorPackage.projectName}`,
    `地點 ${vendorPackage.location}`,
    `進場時間 ${vendorPackage.loadInTime}`,
    "",
    "需求內容",
    ...vendorPackage.items.map(
      (item, index) => `${index + 1}. ${item.itemName || "-"}：${item.requirementText || "-"}`,
    ),
    "",
    "備註",
    vendorPackage.note || "-",
  ];

  return lines.join("\n");
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
  const statusMessage = getDocumentStatusMessage(documentStatus);

  async function handleCopy() {
    await navigator.clipboard.writeText(documentText);
  }

  function handleExport() {
    const blob = new Blob([documentText], {
      type: "text/plain;charset=utf-8",
    });
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

  const primaryActionLabel = documentStatus === "未生成" ? "生成文件" : documentStatus === "需更新" ? "重新生成文件" : null;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-700">PACKAGE 層</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h2>
            <p className="mt-2 text-sm text-slate-600">package 固定帶入 project detail 主資料副本；可在 package 層調整，但不回寫 project。</p>
            <p className="mt-3 text-sm font-medium text-slate-700">{statusMessage}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
              {documentStatus}
            </span>
            {primaryActionLabel ? (
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {primaryActionLabel}
              </button>
            ) : (
              <span className="inline-flex items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                文件已是最新
              </span>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              複製文件
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              匯出 txt
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">文件背景</h3>
          <p className="mt-1 text-sm text-slate-500">只保留專案名稱、活動日期、地點、進場時間。修改後，若原本文件已生成，狀態會轉成需更新。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <p className="mb-2 text-sm font-medium text-slate-700">專案名稱</p>
            <input
              value={projectName}
              onChange={(event) => {
                setProjectName(event.target.value);
                markDirty();
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block">
            <p className="mb-2 text-sm font-medium text-slate-700">活動日期</p>
            <input
              value={eventDate}
              onChange={(event) => {
                setEventDate(event.target.value);
                markDirty();
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block">
            <p className="mb-2 text-sm font-medium text-slate-700">地點</p>
            <input
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                markDirty();
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
          <label className="block">
            <p className="mb-2 text-sm font-medium text-slate-700">進場時間</p>
            <input
              value={loadInTime}
              onChange={(event) => {
                setLoadInTime(event.target.value);
                markDirty();
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        </div>
      </section>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">發包項目</h3>
          <p className="mt-1 text-sm text-slate-500">每筆只保留項目名稱、需求說明。package 不承擔工種、預算、來源 execution item、客戶聯絡與其他複雜任務管理資訊。</p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
                <p className="font-semibold text-slate-900">{item.itemName || "未命名項目"}</p>
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <label className="block">
                  <p className="mb-2 text-sm font-medium text-slate-700">項目名稱</p>
                  <input
                    value={item.itemName}
                    onChange={(event) => updateItemName(item.id, event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                  />
                </label>
                <label className="block">
                  <p className="mb-2 text-sm font-medium text-slate-700">需求說明</p>
                  <textarea
                    value={item.requirementText}
                    onChange={(event) => updateRequirement(item.id, event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900">文件整體備註</h3>
          <p className="mt-1 text-sm text-slate-500">若無備註內容，最終文件會固定顯示 - 。</p>
        </div>
        <textarea
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            markDirty();
          }}
          rows={4}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        />
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">最終文件預覽</h3>
            <p className="mt-1 text-sm text-slate-500">條列式文本模板：日期 + 活動名稱、地點、進場時間、需求內容、備註。</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
            {documentStatus}
          </span>
        </div>

        <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-800 ring-1 ring-slate-200">
{documentText}
        </pre>
      </article>
    </div>
  );
}
