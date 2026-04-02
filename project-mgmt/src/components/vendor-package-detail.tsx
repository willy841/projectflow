"use client";

import { useState } from "react";
import { VendorPackage } from "@/components/vendor-data";

function buildDocumentText(vendorPackage: VendorPackage) {
  const lines = [
    `${vendorPackage.eventDate} ${vendorPackage.projectName}`,
    `地點 ${vendorPackage.location}`,
    `進場時間 ${vendorPackage.loadInTime}`,
    "",
    "需求內容",
    ...vendorPackage.items.map((item, index) => `${index + 1}. ${item.requirementText}`),
    "",
    "備註",
    vendorPackage.note || "-",
  ];

  return lines.join("\n");
}

export function VendorPackageDetail({ vendorPackage }: { vendorPackage: VendorPackage }) {
  const [items, setItems] = useState(vendorPackage.items);
  const [note, setNote] = useState(vendorPackage.note);
  const [generated, setGenerated] = useState(vendorPackage.documentGenerated);

  function updateRequirement(id: string, value: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, requirementText: value } : item)));
  }

  function buildCurrentPackage(): VendorPackage {
    return {
      ...vendorPackage,
      items,
      note,
      documentGenerated: generated,
    };
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildDocumentText(buildCurrentPackage()));
  }

  function handleExport() {
    const blob = new Blob([buildDocumentText(buildCurrentPackage())], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${vendorPackage.code}-document.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-700">PACKAGE 層</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h2>
            <p className="mt-2 text-sm text-slate-600">這一層只保留活動資訊、項目整理與生成文件，不加入其他過多功能。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setGenerated(true)}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              生成文件
            </button>
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

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["日期", vendorPackage.eventDate],
          ["地點", vendorPackage.location],
          ["進場時間", vendorPackage.loadInTime],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">發包項目</h3>
          <p className="mt-1 text-sm text-slate-500">在這一層只整理每筆項目的需求說明，整理完直接生成文件。</p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
                <p className="font-semibold text-slate-900">{item.itemName}</p>
              </div>
              <label className="mt-4 block">
                <p className="mb-2 text-sm font-medium text-slate-700">需求說明（可編輯）</p>
                <textarea
                  value={item.requirementText}
                  onChange={(event) => updateRequirement(item.id, event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </label>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900">備註</h3>
          <p className="mt-1 text-sm text-slate-500">保留文件最後的備註區。</p>
        </div>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        />
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">文件預覽</h3>
            <p className="mt-1 text-sm text-slate-500">條列式最終文件模板。</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${generated ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
            {generated ? "已生成" : "未生成"}
          </span>
        </div>

        <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-800 ring-1 ring-slate-200">
{buildDocumentText(buildCurrentPackage())}
        </pre>
      </article>
    </div>
  );
}
