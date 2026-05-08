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

export const vendorDetailShellLegacyBoundary = {
  mode: "legacy-fixture-detail-shell",
  routeStatus: "not-used-by-formal-vendor-detail-route",
  recordsSource: "legacy-vendorProjectRecords-fixture",
  packageSource: "legacy-vendorPackages-fixture",
} as const;

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
    <article className="pf-card p-6">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-slate-100">廠商資訊</h3>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`pf-pill ${activeTab === "basic" ? "pf-pill-active" : "pf-pill-muted"} px-4 py-2.5 text-sm`}
          >
            基本資料 / 匯款資訊
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("labor")}
            className={`pf-pill ${activeTab === "labor" ? "pf-pill-active" : "pf-pill-muted"} px-4 py-2.5 text-sm`}
          >
            勞報資訊
          </button>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage ? <p className="text-xs text-emerald-300">{saveMessage}</p> : null}
          <button
            type="button"
            onClick={saveVendorProfile}
            className="pf-btn-primary px-5 py-3"
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
              className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl ${item.fullWidth ? "md:col-span-2" : ""}`}
            >
              <span className="text-sm text-slate-400">{item.label}</span>
              <input
                type={item.type}
                value={editableForm[item.field as keyof VendorEditableForm]}
                onChange={(event) => updateEditableField(item.field as keyof VendorEditableForm, event.target.value)}
                placeholder={item.placeholder}
                className="pf-input mt-2"
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
              className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl ${item.fullWidth ? "md:col-span-2" : ""}`}
            >
              <span className="text-sm text-slate-400">{item.label}</span>
              <input
                type={item.type}
                value={editableForm[item.field as keyof VendorEditableForm]}
                onChange={(event) => updateEditableField(item.field as keyof VendorEditableForm, event.target.value)}
                placeholder={item.placeholder}
                className="pf-input mt-2"
              />
            </label>
          ))}
        </div>
      )}

    </article>
  );
}

/**
 * Legacy-only vendor detail shell.
 * Formal /vendors/[id] route uses VendorDetailShellDb.
 */
export function LegacyVendorDetailShell({ vendorId }: Props) {
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
        !keyword || [record.projectName, record.reconciliationSummary].join(" ").toLowerCase().includes(keyword);
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
        <div className="pf-card rounded-3xl border border-dashed border-white/10 p-8 text-sm text-slate-400">
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
          <div className="pf-card rounded-3xl border border-dashed border-white/10 p-8 text-sm text-slate-400">
            正在把新建立廠商導向正確 detail 路徑…
          </div>
        );
      }
    }

    return (
      <div className="pf-card rounded-3xl border border-dashed border-white/10 p-8 text-sm text-slate-400">
        找不到此廠商。前端資料同步已完成，但目前 store 內沒有這筆 vendor。
      </div>
    );
  }

  const currentVendor = vendor;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-white">{currentVendor.name}</h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              舊版前端 detail shell
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">此 detail shell 仍使用前端 vendor store、fixture records 與 local page 狀態。</p>
        </div>
        <Link href="/vendors" className="pf-btn-secondary px-4 py-2.5 text-sm">
          返回廠商列表
        </Link>
      </div>

      <VendorProfileEditor
        vendor={currentVendor}
        onSave={(patch) => updateVendor(currentVendor.id, patch)}
      />

      <article className="pf-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">未付款紀錄</h3>
            <p className="mt-1 text-sm text-slate-400">共 {unpaidRecords.length} 筆，未付款總額 {formatCurrency(selectedIds.length ? selectedTotal : unpaidRecords.reduce((sum, record) => sum + record.adjustedCost, 0))}</p>
          </div>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
            已選 {selectedCount} 筆
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {unpaidRecords.map((record) => {
            const expanded = expandedIds.includes(record.id);
            const selected = selectedIds.includes(record.id);
            return (
              <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        setSelectedIds((current) =>
                          event.target.checked ? [...current, record.id] : current.filter((item) => item !== record.id),
                        );
                      }}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-slate-100">{record.projectName}</p>
                      <p className="mt-1 text-sm text-slate-400">{record.reconciliationSummary}</p>
                    </div>
                  </label>
                  <div className="text-right">
                    <p className="font-semibold text-slate-100">{formatCurrency(record.adjustedCost)}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getVendorPaymentStatusClass(record.paymentStatus)}`}>
                      {record.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>{record.projectStatus}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedIds((current) =>
                        expanded ? current.filter((item) => item !== record.id) : [...current, record.id],
                      );
                    }}
                    className="text-cyan-300 transition hover:text-cyan-200"
                  >
                    {expanded ? "收起" : "展開"}
                  </button>
                </div>
                {expanded ? (
                  <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 text-sm text-slate-300 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">來源項目</p>
                      <ul className="mt-2 space-y-1">
                        {record.sourceItemDetails.map((detail) => (
                          <li key={detail}>• {detail}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">成本拆分</p>
                      <ul className="mt-2 space-y-1">
                        {record.costBreakdown.map((item) => (
                          <li key={`${record.id}-${item.label}`} className="flex items-center justify-between gap-3">
                            <span>{item.label}</span>
                            <span>{item.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Package：{record.packageId || "—"}</span>
                      <span>Event Date：{record.packageId ? packageEventDateMap.get(record.packageId) || "—" : "—"}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
          {!unpaidRecords.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
              目前沒有未付款紀錄。
            </div>
          ) : null}
        </div>
      </article>

      <article className="pf-card p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">歷史紀錄</h3>
            <p className="mt-1 text-sm text-slate-400">此區塊仍直接基於前端 fixture records 分頁與篩選。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setHistoryTab("unpaid")} className={`pf-pill ${historyTab === "unpaid" ? "pf-pill-active" : "pf-pill-muted"}`}>未付款</button>
            <button type="button" onClick={() => setHistoryTab("paid")} className={`pf-pill ${historyTab === "paid" ? "pf-pill-active" : "pf-pill-muted"}`}>已付款</button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input type="search" value={historyKeyword} onChange={(event) => setHistoryKeyword(event.target.value)} placeholder="搜尋專案名稱或對帳摘要" className="pf-input" />
          <select value={historyProjectStatus} onChange={(event) => setHistoryProjectStatus(event.target.value as typeof historyProjectStatus)} className="pf-input">
            <option value="all">全部狀態</option>
            <option value="執行中">執行中</option>
            <option value="已結案">已結案</option>
          </select>
          <button type="button" onClick={() => {
            setHistoryKeyword("");
            setHistoryProjectStatus("all");
            setHistoryPage(1);
          }} className="pf-btn-secondary px-4 py-2.5 text-sm">清除篩選</button>
        </div>

        <div className="mt-4 space-y-3">
          {pagedHistoryRecords.map((record) => (
            <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-100">{record.projectName}</p>
                  <p className="mt-1 text-sm text-slate-400">{record.reconciliationSummary}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-100">{formatCurrency(record.adjustedCost)}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getVendorPaymentStatusClass(record.paymentStatus)}`}>
                    {record.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {!pagedHistoryRecords.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
              目前沒有符合條件的紀錄。
            </div>
          ) : null}
        </div>

        {totalHistoryPages > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
            <span>第 {currentHistoryPage} / {totalHistoryPages} 頁</span>
            <div className="flex gap-2">
              <button type="button" disabled={currentHistoryPage <= 1} onClick={() => setHistoryPage((current) => Math.max(1, current - 1))} className="pf-btn-secondary px-3 py-2 text-sm disabled:opacity-40">上一頁</button>
              <button type="button" disabled={currentHistoryPage >= totalHistoryPages} onClick={() => setHistoryPage((current) => Math.min(totalHistoryPages, current + 1))} className="pf-btn-secondary px-3 py-2 text-sm disabled:opacity-40">下一頁</button>
            </div>
          </div>
        ) : null}
      </article>

      <article className="pf-card p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">工種設定</h3>
            <p className="mt-1 text-sm text-slate-400">管理這條 legacy detail shell 可見的工種標籤。</p>
          </div>
          <button type="button" onClick={() => setIsTradeEditorOpen((current) => !current)} className="pf-btn-secondary px-4 py-2.5 text-sm">
            {isTradeEditorOpen ? "收起編輯器" : "展開編輯器"}
          </button>
        </div>

        {isTradeEditorOpen ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {tradeOptions.map((trade) => (
                <button key={trade} type="button" onClick={() => removeTradeOption(trade)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:border-rose-300/30 hover:text-rose-200">
                  {trade} ×
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newTrade} onChange={(event) => setNewTrade(event.target.value)} placeholder="新增工種" className="pf-input" />
              <button type="button" onClick={() => {
                const value = newTrade.trim();
                if (!value) return;
                addTradeOption(value);
                setNewTrade("");
              }} className="pf-btn-primary px-4 py-2.5 text-sm">新增</button>
            </div>
          </div>
        ) : null}
      </article>

      <div className="flex justify-end">
        <button type="button" onClick={() => setIsDeleteDialogOpen(true)} className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-300/50 hover:bg-rose-500/15">
          刪除廠商
        </button>
      </div>

      {isDeleteDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-slate-100">{DELETE_CONFIRM_TITLE}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{DELETE_CONFIRM_DESCRIPTION}</p>
            <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              即將刪除：{currentVendor.name}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsDeleteDialogOpen(false)} className="pf-btn-secondary px-4 py-2.5 text-sm">取消</button>
              <button
                type="button"
                onClick={() => {
                  deleteVendor(currentVendor.id);
                  setIsDeleteDialogOpen(false);
                  router.push("/vendors");
                }}
                className="rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-400"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
