"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatCurrency,
  getVendorPaymentStatusClass,
  getVendorRecordsByVendorId,
  type VendorBasicProfile,
  type VendorProjectRecord,
} from "@/components/vendor-data";
import { TRADE_OPTIONS, useVendorStore } from "@/components/vendor-store";

const DELETE_CONFIRM_TITLE = "確認刪除這個廠商？";
const DELETE_CONFIRM_DESCRIPTION = "這是刪除動作，刪除後會從目前的前端 vendor 清單移除。請再次確認是否要刪除這個廠商。";

type Props = {
  vendorId: string;
};

type VendorEditableForm = {
  contactName: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

function buildVendorEditableForm(vendor: VendorBasicProfile): VendorEditableForm {
  return {
    contactName: vendor.contactName || "",
    phone: vendor.phone || "",
    email: vendor.email || "",
    lineId: vendor.lineId || "",
    address: vendor.address || "",
    bankName: vendor.bankName || "",
    accountName: vendor.accountName || "",
    accountNumber: vendor.accountNumber || "",
  };
}

function VendorProfileEditor({
  vendor,
  onSave,
}: {
  vendor: VendorBasicProfile;
  onSave: (patch: VendorEditableForm) => void;
}) {
  const [editableForm, setEditableForm] = useState<VendorEditableForm>(() => buildVendorEditableForm(vendor));
  const [saveMessage, setSaveMessage] = useState("");

  function updateEditableField(field: keyof VendorEditableForm, value: string) {
    setEditableForm((current) => ({ ...current, [field]: value }));
    if (saveMessage) {
      setSaveMessage("");
    }
  }

  function saveVendorProfile() {
    const patch = {
      contactName: editableForm.contactName.trim(),
      phone: editableForm.phone.trim(),
      email: editableForm.email.trim(),
      lineId: editableForm.lineId.trim(),
      address: editableForm.address.trim(),
      bankName: editableForm.bankName.trim(),
      accountName: editableForm.accountName.trim(),
      accountNumber: editableForm.accountNumber.trim(),
    };
    setEditableForm(patch);
    onSave(patch);
    setSaveMessage("已儲存，vendor detail 已同步更新。");
  }

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500">A. 廠商資料</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">基本資料與匯款資訊</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">維持 local state / localStorage MVP，儲存後直接同步 vendor detail 顯示，不碰後端。</p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            可直接編輯
          </span>
          {saveMessage ? <p className="text-xs text-emerald-700">{saveMessage}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "聯絡人", field: "contactName", type: "text", placeholder: "請輸入聯絡人" },
          { label: "電話", field: "phone", type: "text", placeholder: "請輸入電話" },
          { label: "Email", field: "email", type: "email", placeholder: "請輸入 Email" },
          { label: "LINE", field: "lineId", type: "text", placeholder: "請輸入 LINE" },
          { label: "地址", field: "address", type: "text", placeholder: "請輸入地址", fullWidth: true },
          { label: "銀行", field: "bankName", type: "text", placeholder: "請輸入銀行名稱" },
          { label: "戶名", field: "accountName", type: "text", placeholder: "請輸入戶名" },
          { label: "帳號", field: "accountNumber", type: "text", placeholder: "請輸入帳號" },
        ].map((item) => (
          <label
            key={item.field}
            className={`rounded-2xl bg-slate-50 p-4 ${item.fullWidth ? "md:col-span-2" : ""}`}
          >
            <span className="text-sm text-slate-500">{item.label}</span>
            <input
              type={item.type}
              value={editableForm[item.field as keyof VendorEditableForm]}
              onChange={(event) => updateEditableField(item.field as keyof VendorEditableForm, event.target.value)}
              placeholder={item.placeholder}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-4">
        <p className="text-sm text-slate-500">銀行代碼目前維持既有資料顯示：{vendor.bankCode || "未填"}</p>
        <button
          type="button"
          onClick={saveVendorProfile}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          儲存基本資料與匯款資訊
        </button>
      </div>
    </article>
  );
}

export function VendorDetailShell({ vendorId }: Props) {
  const router = useRouter();
  const { getVendorById, updateVendor, deleteVendor, isReady } = useVendorStore();
  const vendor = getVendorById(vendorId);
  const [records, setRecords] = useState<VendorProjectRecord[]>(() => getVendorRecordsByVendorId(vendorId));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isTradeEditorOpen, setIsTradeEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const unpaidRecords = useMemo(() => records.filter((record) => record.paymentStatus === "未付款"), [records]);
  const selectedRecords = unpaidRecords.filter((record) => selectedIds.includes(record.id));
  const selectedCount = selectedRecords.length;
  const selectedTotal = selectedRecords.reduce((sum, record) => sum + record.adjustedCost, 0);

  if (!vendor) {
    if (!isReady) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
          廠商資料載入中，正在同步前端 local state / localStorage…
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
        找不到此廠商。前端資料同步已完成，但目前 store 內沒有這筆 vendor。
      </div>
    );
  }

  const currentVendor = vendor;

  function toggleSelect(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function markSelectedAsPaid() {
    if (!selectedIds.length) return;
    setRecords((current) =>
      current.map((record) => (selectedIds.includes(record.id) ? { ...record, paymentStatus: "已付款" } : record)),
    );
    setSelectedIds([]);
  }

  function toggleTrade(trade: string) {
    if (!vendor) return;
    const currentTrades = vendor.tradeLabels ?? [];
    const nextTrades = currentTrades.includes(trade)
      ? currentTrades.filter((item) => item !== trade)
      : [...currentTrades, trade];
    updateVendor(vendor.id, {
      tradeLabels: nextTrades,
      category: nextTrades[0] || vendor.category || "待補充",
    });
  }

  function handleDeleteVendor() {
    deleteVendor(vendor.id);
    setIsDeleteDialogOpen(false);
    router.push("/vendors");
  }

  return (
    <>
      <div className="space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-500">Vendor Detail</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{vendor.name}</h2>
                {(vendor.tradeLabels?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {vendor.tradeLabels?.map((trade) => (
                      <span
                        key={trade}
                        className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200"
                      >
                        {trade}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    尚未設定工種
                  </span>
                )}
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{vendor.note || "此廠商尚未補齊正式說明。"}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsTradeEditorOpen((current) => !current)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                {isTradeEditorOpen ? "收合工種編輯" : "編輯工種"}
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-100"
              >
                刪除廠商
              </button>
              <Link href="/vendors" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
                返回廠商列表
              </Link>
            </div>
          </div>

          {isTradeEditorOpen ? (
            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 ring-1 ring-sky-100">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-sky-700">Vendor identity / 工種</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">維持既有工種多選規則，只把編輯入口整合回主卡附近，避免獨立主區塊搶走版面。</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-sky-200">
                  已選 {vendor.tradeLabels?.length ?? 0} 個工種
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {TRADE_OPTIONS.map((trade) => {
                  const active = vendor.tradeLabels?.includes(trade) ?? false;
                  return (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => toggleTrade(trade)}
                      className={`rounded-full px-3 py-2 text-xs font-medium ring-1 transition ${active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                    >
                      {trade}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">
          <div className="min-w-0">
            <VendorProfileEditor
              key={vendor.id}
              vendor={vendor}
              onSave={(patch) => {
                updateVendor(vendor.id, patch);
              }}
            />
          </div>

          <article className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm ring-1 ring-amber-100">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-amber-700">C. 未付款專案區</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">專案 × 廠商 付款管理</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">每列代表一個「專案 × 廠商」付款單位，第一版未付款金額直接等於該專案對該廠商的調整後成本總額。</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-amber-200">
                <p>已勾選 {selectedCount} 筆</p>
                <p className="mt-1 font-semibold text-slate-900">勾選總額 {formatCurrency(selectedTotal)}</p>
              </div>
            </div>

            {unpaidRecords.length ? (
              <div className="space-y-3">
                {unpaidRecords.map((record) => (
                  <label key={record.id} className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white p-4 ring-1 ring-amber-100 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => toggleSelect(record.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{record.projectName}</p>
                        <p className="mt-1 text-sm text-slate-500">{record.procurementSummary}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500">未付款金額</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{record.adjustedCostLabel}</p>
                    </div>
                  </label>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-white">
                  <div>
                    <p className="text-sm text-slate-300">即時計算</p>
                    <p className="mt-1 font-semibold">已勾選 {selectedCount} 個專案 × 廠商，合計 {formatCurrency(selectedTotal)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={markSelectedAsPaid}
                    disabled={!selectedCount}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    標記為已付款
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-white px-5 py-6 text-sm text-slate-500">目前沒有未付款專案。</div>
            )}
          </article>
        </section>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500">D. 往來 / 歷史紀錄區</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">所有有往來的專案紀錄</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">包含執行中與已結案專案。此區不可修正，只提供付款狀態、調整後成本總額、發包摘要與可展開的成本 / 發包明細。</p>
          </div>

          <div className="space-y-4">
            {records.map((record) => {
              const isExpanded = expandedIds.includes(record.id);
              return (
                <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-900">{record.projectName}</h4>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{record.projectStatus}</span>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(record.paymentStatus)}`}>
                          {record.paymentStatus}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{record.procurementSummary}</p>
                    </div>
                    <div className="flex flex-col gap-3 xl:items-end">
                      <div className="text-left xl:text-right">
                        <p className="text-sm text-slate-500">調整後成本總額</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{record.adjustedCostLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(record.id)}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                      >
                        {isExpanded ? "收合明細" : "展開看成本 / 發包明細"}
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-sm font-semibold text-slate-900">成本明細</p>
                        <div className="mt-3 space-y-3">
                          {record.costBreakdown.map((item) => (
                            <div key={`${record.id}-${item.label}`} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-slate-600">{item.label}</span>
                              <span className="font-medium text-slate-900">{item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-sm font-semibold text-slate-900">發包內容明細</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                          {record.procurementDetails.map((item) => (
                            <li key={`${record.id}-${item}`} className="rounded-2xl bg-slate-50 px-3 py-2">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>
      </div>

      {isDeleteDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
              刪除確認
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{DELETE_CONFIRM_TITLE}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{DELETE_CONFIRM_DESCRIPTION}</p>
            <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-slate-700">
              目前準備刪除：<span className="font-semibold text-slate-900">{vendor.name}</span>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteVendor}
                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
              >
                確認刪除廠商
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
