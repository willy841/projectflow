"use client";

import { useState } from "react";
import {
  VendorDocumentStatus,
  VendorPackage,
  formatCurrency,
  getVendorDirectoryEntryByPackageId,
  getVendorDocumentStatusClass,
  getVendorPaymentStatusClass,
} from "@/components/vendor-data";

function getDocumentStatusMessage(status: VendorDocumentStatus) {
  if (status === "已生成") return "目前文件為最新版本";
  if (status === "需更新") return "目前文件不是最新內容，請重新生成";
  return "尚未生成正式文件";
}

function buildDocumentText(vendorPackage: VendorPackage) {
  const lines = [
    `${vendorPackage.eventDate} ${vendorPackage.projectName}`,
    `地點：${vendorPackage.location}`,
    `進場時間：${vendorPackage.loadInTime}`,
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
  const vendorEntry = getVendorDirectoryEntryByPackageId(vendorPackage.id);
  const [projectName, setProjectName] = useState(vendorPackage.projectName);
  const [eventDate, setEventDate] = useState(vendorPackage.eventDate);
  const [location, setLocation] = useState(vendorPackage.location);
  const [loadInTime, setLoadInTime] = useState(vendorPackage.loadInTime);
  const [items, setItems] = useState(vendorPackage.items);
  const [note, setNote] = useState(vendorPackage.note);
  const [documentStatus, setDocumentStatus] = useState<VendorDocumentStatus>(vendorPackage.documentStatus);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

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
  const unpaidLines = vendorEntry?.unpaidLines ?? [];
  const historyEntries = vendorEntry?.historyEntries ?? [];
  const selectedTotal = unpaidLines
    .filter((line) => selectedPayments.includes(line.id))
    .reduce((sum, line) => sum + line.amount, 0);

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

  function togglePaymentLine(id: string) {
    setSelectedPayments((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAllPayments() {
    if (selectedPayments.length === unpaidLines.length) {
      setSelectedPayments([]);
      return;
    }

    setSelectedPayments(unpaidLines.map((line) => line.id));
  }

  const primaryActionLabel = documentStatus === "未生成" ? "生成文件" : documentStatus === "需更新" ? "重新生成文件" : null;

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white p-6 shadow-sm ring-1 ring-rose-100">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">廠商資料</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
                文件 {documentStatus}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-rose-700">{vendorPackage.code}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                第一屏先集中看廠商身份、匯款資訊與待付款專案；文件整理與發包細節放在下方查閱與展開區。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl bg-white px-4 py-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-500">聯絡窗口</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{vendorEntry?.contactName ?? "-"}</p>
                <p className="mt-1 text-sm text-slate-500">{vendorEntry?.contactPhone ?? "-"}</p>
              </div>
              <div className="rounded-3xl bg-white px-4 py-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-500">未付款總額</p>
                <p className="mt-2 text-lg font-semibold text-rose-700">{formatCurrency(vendorEntry?.costSummary.unpaidAmount ?? 0)}</p>
                <p className="mt-1 text-sm text-slate-500">{unpaidLines.length} 筆待處理</p>
              </div>
              <div className="rounded-3xl bg-white px-4 py-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-500">已付款 / 報價總額</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(vendorEntry?.costSummary.paidAmount ?? 0)} / {formatCurrency(vendorEntry?.costSummary.quotedAmount ?? 0)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{statusMessage}</p>
              </div>
            </div>
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">匯款資訊</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">銀行</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {vendorEntry?.remittanceInfo.bankName ?? "-"} ({vendorEntry?.remittanceInfo.bankCode ?? "-"})
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">戶名</p>
                <p className="mt-1 font-semibold text-slate-900">{vendorEntry?.remittanceInfo.accountName ?? "-"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">帳號</p>
                <p className="mt-1 font-semibold text-slate-900">{vendorEntry?.remittanceInfo.accountNumber ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {vendorEntry?.remittanceInfo.note ?? "目前無補充說明。"}
              </div>
            </div>
          </aside>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <article className="rounded-[32px] border border-rose-200 bg-white p-6 shadow-sm ring-1 ring-rose-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-rose-600">未付款處理區</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">待付款專案與金額</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">保留明確勾選與批次付款操作感；這一區是操作區，不和歷史紀錄混在一起。</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-right">
              <p className="text-xs font-medium text-rose-600">已勾選金額</p>
              <p className="mt-1 text-xl font-semibold text-rose-700">{formatCurrency(selectedTotal)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={unpaidLines.length > 0 && selectedPayments.length === unpaidLines.length}
                  onChange={toggleAllPayments}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
                全選待付款項目
              </label>
              <button
                type="button"
                disabled={!selectedPayments.length}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                批次付款（{selectedPayments.length}）
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {unpaidLines.map((line) => (
                <label
                  key={line.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-3xl border px-4 py-4 transition ${
                    selectedPayments.includes(line.id)
                      ? "border-rose-300 bg-rose-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(line.id)}
                    onChange={() => togglePaymentLine(line.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{line.label}</p>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(line.status)}`}>
                        {line.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">付款期限：{line.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">應付金額</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(line.amount)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">查閱區</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">往來 / 歷史紀錄</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">這裡只做查閱，不承擔編輯操作；付款狀態在每筆紀錄上直接看得見。</p>
            </div>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600">Read only</span>
          </div>

          <div className="mt-5 space-y-3">
            {historyEntries.map((entry) => (
              <div key={entry.id} className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{entry.type}</p>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{entry.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{entry.date}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(entry.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">成本摘要</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">首屏先看摘要，需要時再展開看細項，避免 detail 第一屏塞滿編輯欄位。</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs text-slate-500">未付款占比</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {vendorEntry?.costSummary.quotedAmount
                  ? `${Math.round(((vendorEntry.costSummary.unpaidAmount / vendorEntry.costSummary.quotedAmount) * 100))}%`
                  : "0%"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs text-slate-500">報價總額</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(vendorEntry?.costSummary.quotedAmount ?? 0)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-4">
              <p className="text-xs text-emerald-700">已付款</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700">{formatCurrency(vendorEntry?.costSummary.paidAmount ?? 0)}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 px-4 py-4">
              <p className="text-xs text-rose-700">未付款</p>
              <p className="mt-2 text-lg font-semibold text-rose-700">{formatCurrency(vendorEntry?.costSummary.unpaidAmount ?? 0)}</p>
            </div>
          </div>

          <details className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">展開查看成本明細</summary>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {unpaidLines.map((line) => (
                <div key={line.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <p>{line.label}</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(line.amount)}</p>
                </div>
              ))}
            </div>
          </details>
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">發包內容摘要</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">先看發包重點，再展開讀詳細需求與文件備註。</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(documentStatus)}`}>
              {documentStatus}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
                  <p className="font-semibold text-slate-900">{item.itemName || "未命名項目"}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.requirementText}</p>
              </div>
            ))}
          </div>

          <details className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">展開查看文件編修區</summary>
            <div className="mt-5 space-y-6">
              <section>
                <div className="mb-5">
                  <h4 className="text-lg font-semibold text-slate-900">文件背景</h4>
                  <p className="mt-1 text-sm text-slate-500">只保留專案名稱、活動日期、地點、進場時間。修改後，若原本文件已生成，狀態會轉成需更新。</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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

              <section>
                <div className="mb-5">
                  <h4 className="text-lg font-semibold text-slate-900">發包項目細節</h4>
                  <p className="mt-1 text-sm text-slate-500">維持最小範圍可編修，避免改動資料模型。</p>
                </div>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5">
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
              </section>

              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">最終文件預覽</h4>
                    <p className="mt-1 text-sm text-slate-500">條列式文本模板：日期 + 活動名稱、地點、進場時間、需求內容、備註。</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
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
                <textarea
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    markDirty();
                  }}
                  rows={4}
                  className="mb-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                />
                <pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100 ring-1 ring-slate-800">
{documentText}
                </pre>
              </section>
            </div>
          </details>
        </article>
      </section>
    </div>
  );
}
