"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatCurrency,
  getVendorPaymentStatusClass,
  getVendorRecordsByVendorId,
  vendorPackages,
  type VendorBasicProfile,
  type VendorProjectRecord,
} from "@/components/vendor-data";
import { useVendorStore } from "@/components/vendor-store";

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
  laborName: string;
  guildName: string;
  nationalId: string;
  birthDateRoc: string;
  mailingAddress: string;
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
    laborName: (vendor as VendorBasicProfile & { laborName?: string }).laborName || "",
    guildName: (vendor as VendorBasicProfile & { guildName?: string }).guildName || "",
    nationalId: (vendor as VendorBasicProfile & { nationalId?: string }).nationalId || "",
    birthDateRoc: (vendor as VendorBasicProfile & { birthDateRoc?: string }).birthDateRoc || "",
    mailingAddress: (vendor as VendorBasicProfile & { mailingAddress?: string }).mailingAddress || "",
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
  const [activeTab, setActiveTab] = useState<"basic" | "labor">("basic");

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
      laborName: editableForm.laborName.trim(),
      guildName: editableForm.guildName.trim(),
      nationalId: editableForm.nationalId.trim(),
      birthDateRoc: editableForm.birthDateRoc.trim(),
      mailingAddress: editableForm.mailingAddress.trim(),
    };
    setEditableForm(patch);
    onSave(patch);
    setSaveMessage("已儲存");
  }

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-slate-900">廠商資訊</h3>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`rounded-2xl px-4 py-2.5 text-sm font-medium ring-1 transition ${activeTab === "basic" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
          >
            基本資料 / 匯款資訊
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("labor")}
            className={`rounded-2xl px-4 py-2.5 text-sm font-medium ring-1 transition ${activeTab === "labor" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
          >
            勞報資訊
          </button>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage ? <p className="text-xs text-emerald-700">{saveMessage}</p> : null}
          <button
            type="button"
            onClick={saveVendorProfile}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {activeTab === "basic" ? "儲存基本資料與匯款資訊" : "儲存勞報資訊"}
          </button>
        </div>
      </div>

      {activeTab === "basic" ? (
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "姓名", field: "laborName", type: "text", placeholder: "請輸入勞報姓名" },
            { label: "公會名稱", field: "guildName", type: "text", placeholder: "請輸入公會名稱" },
            { label: "身分證字號", field: "nationalId", type: "text", placeholder: "請輸入身分證字號" },
            { label: "出生年月日（民國）", field: "birthDateRoc", type: "text", placeholder: "例如：78/05/21" },
            { label: "通訊地址", field: "mailingAddress", type: "text", placeholder: "請輸入通訊地址", fullWidth: true },
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
      )}

    </article>
  );
}

export function VendorDetailShell({ vendorId }: Props) {
  const router = useRouter();
  const { getVendorById, updateVendor, deleteVendor, isReady, tradeOptions, addTradeOption, removeTradeOption } = useVendorStore();
  const vendor = getVendorById(vendorId);
  const [records, setRecords] = useState<VendorProjectRecord[]>(() => getVendorRecordsByVendorId(vendorId));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isTradeEditorOpen, setIsTradeEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTrade, setNewTrade] = useState("");
  const [historyTab, setHistoryTab] = useState<"unpaid" | "paid">("unpaid");
  const [historyKeyword, setHistoryKeyword] = useState("");
  const [historyProjectStatus, setHistoryProjectStatus] = useState<"all" | "執行中" | "已結案">("all");
  const [historyPage, setHistoryPage] = useState(1);

  const packageEventDateMap = useMemo(() => {
    return new Map(vendorPackages.map((pkg) => [pkg.id, pkg.eventDate]));
  }, []);

  const unpaidRecords = useMemo(() => records.filter((record) => record.paymentStatus === "未付款"), [records]);
  const selectedRecords = unpaidRecords.filter((record) => selectedIds.includes(record.id));
  const selectedCount = selectedRecords.length;
  const selectedTotal = selectedRecords.reduce((sum, record) => sum + record.adjustedCost, 0);
  const historySourceRecords = useMemo(
    () => records.filter((record) => (historyTab === "unpaid" ? record.paymentStatus === "未付款" : record.paymentStatus === "已付款")),
    [historyTab, records],
  );
  const filteredHistoryRecords = useMemo(() => {
    const keyword = historyKeyword.trim().toLowerCase();
    return historySourceRecords.filter((record) => {
      const matchesKeyword =
        !keyword || [record.projectName, record.payableSummary].join(" ").toLowerCase().includes(keyword);
      const matchesStatus = historyProjectStatus === "all" || record.projectStatus === historyProjectStatus;
      return matchesKeyword && matchesStatus;
    });
  }, [historyKeyword, historyProjectStatus, historySourceRecords]);
  const HISTORY_PAGE_SIZE = 4;
  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistoryRecords.length / HISTORY_PAGE_SIZE));
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages);
  const pagedHistoryRecords = filteredHistoryRecords.slice((currentHistoryPage - 1) * HISTORY_PAGE_SIZE, currentHistoryPage * HISTORY_PAGE_SIZE);

  if (!vendor) {
    if (!isReady) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
          廠商資料載入中，正在同步前端 local state / localStorage…
        </div>
      );
    }

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const encodedVendorId = encodeURIComponent(vendorId);
      const decodedVendorId = decodeURIComponent(vendorId);

      if (currentPath.endsWith(encodedVendorId) && encodedVendorId !== decodedVendorId) {
        router.replace(`/vendors/${decodedVendorId}`);
        return (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
            正在把新建立廠商導向正確 detail 路徑…
          </div>
        );
      }
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

  function selectTrade(trade: string) {
    updateVendor(currentVendor.id, {
      tradeLabel: trade,
      category: trade,
    });
  }

  function createTrade() {
    const nextTrade = newTrade.trim();
    if (!nextTrade) return;
    addTradeOption(nextTrade);
    selectTrade(nextTrade);
    setNewTrade("");
  }

  function handleDeleteVendor() {
    deleteVendor(currentVendor.id);
    setIsDeleteDialogOpen(false);
    router.push("/vendors");
  }

  return (
    <>
      <div className="space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{vendor.name}</h2>
                <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                  {vendor.tradeLabel || vendor.category || "—"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsTradeEditorOpen((current) => !current)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                {isTradeEditorOpen ? "收合工種管理" : "管理工種"}
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
                  </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-sky-200">
                  <span className="font-semibold text-slate-900">{vendor.tradeLabel || vendor.category || "—"}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tradeOptions.map((trade) => {
                  const active = (vendor.tradeLabel || vendor.category) === trade;
                  return (
                    <div key={trade} className="inline-flex items-center overflow-hidden rounded-full ring-1 ring-slate-200">
                      <button
                        type="button"
                        onClick={() => selectTrade(trade)}
                        className={`px-3 py-2 text-xs font-medium transition ${active ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        {trade}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTradeOption(trade)}
                        className="border-l border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        aria-label={`刪除工種 ${trade}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={newTrade}
                  onChange={(event) => setNewTrade(event.target.value)}
                  placeholder="新增工種，例如：舞台"
                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={createTrade}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  新增工種
                </button>
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
                <h3 className="text-xl font-semibold text-slate-900">未付款專案</h3>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-amber-200">
                <p className="font-semibold text-slate-900">已勾選 {selectedCount} 筆｜勾選總額 {formatCurrency(selectedTotal)}</p>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{record.projectName}</p>
                          <span className="text-sm text-slate-500">{record.packageId ? packageEventDateMap.get(record.packageId) ?? "-" : "-"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="mt-1 text-xl font-semibold text-slate-900">{record.adjustedCostLabel}</p>
                    </div>
                  </label>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-white">
                  <div>
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
          <div className="mb-5 flex min-h-12 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="flex h-10 items-center text-xl font-semibold text-slate-900">往來紀錄</h3>
              <button
                type="button"
                onClick={() => {
                  setHistoryTab("unpaid");
                  setHistoryPage(1);
                }}
                className={`inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium ring-1 transition ${historyTab === "unpaid" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
              >
                未付款
              </button>
              <button
                type="button"
                onClick={() => {
                  setHistoryTab("paid");
                  setHistoryPage(1);
                }}
                className={`inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium ring-1 transition ${historyTab === "paid" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
              >
                已付款
              </button>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
              目前顯示 {filteredHistoryRecords.length} 筆 / 第 {currentHistoryPage} / {totalHistoryPages} 頁
            </div>
          </div>

          <div className="space-y-4">

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="block">
                <input
                  type="search"
                  value={historyKeyword}
                  onChange={(event) => {
                    setHistoryKeyword(event.target.value);
                    setHistoryPage(1);
                  }}
                  placeholder="搜尋專案名稱或發包摘要"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block lg:min-w-[180px]">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">專案狀態</span>
                <select
                  value={historyProjectStatus}
                  onChange={(event) => {
                    setHistoryProjectStatus(event.target.value as "all" | "執行中" | "已結案");
                    setHistoryPage(1);
                  }}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="all">全部</option>
                  <option value="執行中">進行中案件</option>
                  <option value="已結案">已結案</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              {pagedHistoryRecords.length ? pagedHistoryRecords.map((record) => {
                const isExpanded = expandedIds.includes(record.id);
                return (
                  <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="flex h-8 items-center text-lg font-semibold text-slate-900">{record.projectName}</h4>
                          <span className="inline-flex h-8 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{record.projectStatus}</span>
                          <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ring-1 ${getVendorPaymentStatusClass(record.paymentStatus)}`}>
                            {record.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 xl:justify-end xl:self-center">
                        <div className="flex items-center gap-2 text-left xl:text-right">
                          <span className="leading-none text-sm text-slate-500">調整後成本總額</span>
                          <p className="leading-none text-2xl font-semibold tracking-tight text-slate-900">{record.adjustedCostLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(record.id)}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                        >
                          {isExpanded ? "收合明細" : "查看明細"}
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
                            {record.sourceItemDetails.map((item) => (
                              <li key={`${record.id}-${item}`} className="rounded-2xl bg-slate-50 px-3 py-2">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  目前沒有符合條件的歷史紀錄。
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">第 {currentHistoryPage} / {totalHistoryPages} 頁</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}
                  disabled={currentHistoryPage === 1}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  上一頁
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryPage((current) => Math.min(totalHistoryPages, current + 1))}
                  disabled={currentHistoryPage === totalHistoryPages}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  下一頁
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      {isDeleteDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{DELETE_CONFIRM_TITLE}</h3>
            <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-slate-700">
              目前準備刪除：<span className="font-semibold text-slate-900">{currentVendor.name}</span>
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
