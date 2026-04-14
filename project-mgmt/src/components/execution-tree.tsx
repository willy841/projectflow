"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  getExecutionTreeStorageKey,
  readStoredExecutionTreeState,
} from "@/components/project-workflow-store";
import {
  parseExecutionItemsFromExcelRows,
  type ParsedExcelImportPreview,
} from "@/components/excel-task-import";
import {
  ProjectExecutionItem,
  ProjectExecutionSubItem,
  getStatusClass,
} from "@/components/project-data";
import type { VendorBasicProfile } from "@/components/vendor-data";

export type AssignmentReply = {
  id: string;
  message: string;
  createdAt: string;
  meta?: {
    title?: string;
    quantity?: string;
    amount?: string;
    size?: string;
    materialStructure?: string;
    fileUrl?: string;
    vendor?: string;
  };
};

export type DesignAssignmentDraft = {
  assignee: string;
  size: string;
  material: string;
  quantity: string;
  referenceUrl: string;
  vendorName: string;
  requirement: string;
  replies?: AssignmentReply[];
};

export type ProcurementAssignmentDraft = {
  assignee: string;
  item: string;
  size: string;
  material: string;
  quantity: string;
  styleUrl: string;
  vendorName: string;
  requirement: string;
  replies?: AssignmentReply[];
};

export type VendorAssignmentDraft = {
  assignee: string;
  category: string;
  title: string;
  vendorName: string;
  requirement: string;
  specification: string;
  referenceUrl: string;
  amount: string;
  replies?: AssignmentReply[];
};

type ImportedItem = ProjectExecutionItem;

type FormActions = {
  onCancel: () => void;
  onSave: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
};

type ActiveAssignmentDrawer = {
  targetId: string;
  title: string;
  flowType: "design" | "procurement" | "vendor";
  level: "main" | "child";
  parentItemId: string;
};

const defaultDesignAssignmentDraft: DesignAssignmentDraft = {
  assignee: "",
  size: "",
  material: "",
  quantity: "",
  referenceUrl: "",
  vendorName: "",
  requirement: "",
};

const defaultProcurementAssignmentDraft: ProcurementAssignmentDraft = {
  assignee: "",
  item: "",
  size: "",
  material: "",
  quantity: "",
  styleUrl: "",
  vendorName: "",
  requirement: "",
};

const defaultVendorAssignmentDraft: VendorAssignmentDraft = {
  assignee: "",
  category: "音響",
  title: "",
  vendorName: "",
  requirement: "",
  specification: "",
  referenceUrl: "",
  amount: "",
};

function normalizeVendorKeyword(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function VendorMatchField({
  label = "執行廠商",
  value,
  onChange,
  vendors,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  vendors: VendorBasicProfile[];
}) {
  const keyword = normalizeVendorKeyword(value);
  const matchedVendors = useMemo(() => {
    if (!keyword) return [] as VendorBasicProfile[];
    return vendors.filter((vendor) => normalizeVendorKeyword(vendor.name).includes(keyword)).slice(0, 6);
  }, [keyword, vendors]);
  const isExactMatch = vendors.some((vendor) => normalizeVendorKeyword(vendor.name) === keyword);

  return (
    <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="輸入廠商名稱，自動匹配既有廠商資料"
        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
      />
      {value.trim() ? (
        <div className={`rounded-2xl border px-3 py-2 text-xs ${isExactMatch ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
          {isExactMatch ? "已匹配既有廠商資料" : "尚未精準匹配既有廠商資料，需從下列建議帶入或輸入完整名稱"}
        </div>
      ) : null}
      {matchedVendors.length ? (
        <div className="flex flex-wrap gap-2">
          {matchedVendors.map((vendor) => (
            <button
              key={vendor.id}
              type="button"
              onClick={() => onChange(vendor.name)}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {vendor.name}
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function SavedSummary({
  title,
  subtitle,
  summary,
  fields,
  collapsedFields,
  actions,
}: {
  title: string;
  subtitle?: string;
  summary: string[];
  fields: Array<{ label: string; value: string }>;
  collapsedFields?: Array<{ label: string; value: string }>;
  actions: Pick<FormActions, "onEdit" | "onDelete">;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              已建立
            </span>
          </div>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          {summary.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          {actions.onEdit ? (
            <button
              type="button"
              onClick={actions.onEdit}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              編輯
            </button>
          ) : null}
          {actions.onDelete ? (
            <button
              type="button"
              onClick={actions.onDelete}
              className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              刪除
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <div
            key={`${field.label}-${field.value}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <p className="text-xs font-medium text-slate-500">{field.label}</p>
            <p
              className={`mt-2 break-words text-sm font-medium ${field.value === "未填寫" || field.value === "未指定" ? "text-slate-500" : "text-slate-900"}`}
            >
              {field.value}
            </p>
          </div>
        ))}
      </div>

      {collapsedFields?.length ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            折疊資訊
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {collapsedFields.map((field) => (
              <div
                key={`${field.label}-${field.value}-collapsed`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-xs font-medium text-slate-500">
                  {field.label}
                </p>
                <p className="mt-2 break-words text-sm font-medium text-slate-900">
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DesignAssignmentForm({
  title,
  draft,
  saved,
  isEditing,
  onChange,
  actions,
  vendors,
}: {
  title: string;
  draft: DesignAssignmentDraft;
  saved?: DesignAssignmentDraft;
  isEditing: boolean;
  onChange: (key: keyof DesignAssignmentDraft, value: string) => void;
  actions: FormActions;
  vendors: VendorBasicProfile[];
}) {
  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">設計交辦</p>
            <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              設計
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">來源項目：{title}</p>
        </div>
        <div className="text-xs text-slate-500">
          母卡主欄位：項目、尺寸、材質 + 結構、數量；補充欄位放在展開層
        </div>
      </div>

      {saved && !isEditing ? (
        <SavedSummary
          title={title}
          subtitle="設計交辦主層欄位已依 spec v1 收斂"
          summary={[
            saved.size ? `尺寸：${saved.size}` : null,
            saved.material ? `材質 + 結構：${saved.material}` : null,
            saved.quantity ? `數量：${saved.quantity}` : null,
            saved.vendorName ? `執行廠商：${saved.vendorName}` : null,
          ].filter((item): item is string => Boolean(item))}
          fields={[
            { label: "來源項目 / 次項目", value: title },
            { label: "負責人", value: saved.assignee || "未指定" },
            { label: "尺寸", value: saved.size || "未填寫" },
            { label: "材質 + 結構", value: saved.material || "未填寫" },
            { label: "數量", value: saved.quantity || "未填寫" },
            { label: "執行廠商", value: saved.vendorName || "未填寫" },
            { label: "需求說明", value: saved.requirement || "未填寫" },
            { label: "參考連結", value: saved.referenceUrl || "未填寫" },
          ]}
          actions={{ onEdit: actions.onEdit, onDelete: actions.onDelete }}
        />
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">負責人</span>
              <input
                value={draft.assignee}
                onChange={(e) => onChange("assignee", e.target.value)}
                placeholder="例如：Aster"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">尺寸</span>
              <input
                value={draft.size}
                onChange={(e) => onChange("size", e.target.value)}
                placeholder="例如：W240 x H300 cm"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                材質 + 結構
              </span>
              <input
                value={draft.material}
                onChange={(e) => onChange("material", e.target.value)}
                placeholder="例如：珍珠板＋輸出＋木作結構"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">數量</span>
              <input
                value={draft.quantity}
                onChange={(e) => onChange("quantity", e.target.value)}
                placeholder="例如：1 式"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <VendorMatchField
              value={draft.vendorName}
              onChange={(value) => onChange("vendorName", value)}
              vendors={vendors}
            />
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
              <span className="text-sm font-medium text-slate-700">
                參考連結
              </span>
              <input
                value={draft.referenceUrl}
                onChange={(e) => onChange("referenceUrl", e.target.value)}
                placeholder="https://..."
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                設計內容 / 需求說明
              </span>
              <textarea
                value={draft.requirement}
                onChange={(e) => onChange("requirement", e.target.value)}
                placeholder="補充設計需求、排版重點與執行說明"
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actions.onSave}
              disabled={actions.isSaving}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {actions.saveLabel ?? "儲存設計交辦"}
            </button>
            <button
              type="button"
              onClick={actions.onCancel}
              disabled={actions.isSaving}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ProcurementAssignmentForm({
  title,
  draft,
  saved,
  isEditing,
  onChange,
  actions,
  vendors,
}: {
  title: string;
  draft: ProcurementAssignmentDraft;
  saved?: ProcurementAssignmentDraft;
  isEditing: boolean;
  onChange: (key: keyof ProcurementAssignmentDraft, value: string) => void;
  actions: FormActions;
  vendors: VendorBasicProfile[];
}) {
  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">備品交辦</p>
            <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              備品
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">來源項目：{title}</p>
        </div>
        <div className="text-xs text-slate-500">
          母卡主欄位：項目、尺寸、材質、數量；補充欄位放在展開層
        </div>
      </div>

      {saved && !isEditing ? (
        <SavedSummary
          title={saved.item || title}
          subtitle="備品交辦主層欄位已依最新 spec 收斂"
          summary={[
            saved.size ? `尺寸：${saved.size}` : null,
            saved.material ? `材質：${saved.material}` : null,
            saved.quantity ? `數量：${saved.quantity}` : null,
            saved.vendorName ? `執行廠商：${saved.vendorName}` : null,
          ].filter((item): item is string => Boolean(item))}
          fields={[
            { label: "來源項目 / 次項目", value: title },
            { label: "項目", value: saved.item || "未填寫" },
            { label: "尺寸", value: saved.size || "未填寫" },
            { label: "材質", value: saved.material || "未填寫" },
            { label: "數量", value: saved.quantity || "未填寫" },
            { label: "執行廠商", value: saved.vendorName || "未填寫" },
            { label: "需求說明", value: saved.requirement || "未填寫" },
            { label: "參考連結", value: saved.styleUrl || "未填寫" },
            { label: "負責人", value: saved.assignee || "未指定" },
          ]}
          actions={{ onEdit: actions.onEdit, onDelete: actions.onDelete }}
        />
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">負責人</span>
              <input
                value={draft.assignee}
                onChange={(e) => onChange("assignee", e.target.value)}
                placeholder="例如：Mina"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">項目</span>
              <input
                value={draft.item}
                onChange={(e) => onChange("item", e.target.value)}
                placeholder="例如：壓克力桌牌"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <VendorMatchField
              value={draft.vendorName}
              onChange={(value) => onChange("vendorName", value)}
              vendors={vendors}
            />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">數量</span>
              <input
                value={draft.quantity}
                onChange={(e) => onChange("quantity", e.target.value)}
                placeholder="例如：3"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">尺寸</span>
              <input
                value={draft.size}
                onChange={(e) => onChange("size", e.target.value)}
                placeholder="例如：A4 直式"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">材質</span>
              <input
                value={draft.material}
                onChange={(e) => onChange("material", e.target.value)}
                placeholder="例如：透明壓克力"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-1">
              <span className="text-sm font-medium text-slate-700">
                參考連結
              </span>
              <input
                value={draft.styleUrl}
                onChange={(e) => onChange("styleUrl", e.target.value)}
                placeholder="https://..."
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                需求說明
              </span>
              <textarea
                value={draft.requirement}
                onChange={(e) => onChange("requirement", e.target.value)}
                placeholder="補充備品需求、採購條件與使用情境"
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actions.onSave}
              disabled={actions.isSaving}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {actions.saveLabel ?? "儲存備品交辦"}
            </button>
            <button
              type="button"
              onClick={actions.onCancel}
              disabled={actions.isSaving}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function VendorAssignmentForm({
  title,
  draft,
  saved,
  isEditing,
  onChange,
  actions,
  vendors,
}: {
  title: string;
  draft: VendorAssignmentDraft;
  saved?: VendorAssignmentDraft;
  isEditing: boolean;
  onChange: (key: keyof VendorAssignmentDraft, value: string) => void;
  actions: FormActions;
  vendors: VendorBasicProfile[];
}) {
  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">廠商交辦</p>
            <span className="inline-flex items-center justify-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
              廠商
            </span>
          </div>
        </div>
      </div>

      {saved && !isEditing ? (
        <SavedSummary
          title={saved.title || title}
          summary={[
            saved.vendorName ? `廠商：${saved.vendorName}` : null,
            saved.category ? `工種：${saved.category}` : null,
            saved.amount ? `廠商報價：${saved.amount}` : null,
            saved.assignee ? `負責人：${saved.assignee}` : null,
          ].filter((item): item is string => Boolean(item))}
          fields={[
            { label: "來源項目 / 次項目", value: title },
            { label: "負責人", value: saved.assignee || "未指定" },
            { label: "執行廠商", value: saved.vendorName || "未填寫" },
            { label: "類別 / 工種", value: saved.category || "未填寫" },
            { label: "需求說明", value: saved.requirement || "未填寫" },
            { label: "規格 / 尺寸", value: saved.specification || "未填寫" },
            {
              label: "參考連結 / 參考資料",
              value: saved.referenceUrl || "未填寫",
            },
            { label: "廠商報價", value: saved.amount || "未填寫" },
          ]}
          actions={{ onEdit: actions.onEdit, onDelete: actions.onDelete }}
        />
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">負責人</span>
              <input
                value={draft.assignee}
                onChange={(e) => onChange("assignee", e.target.value)}
                placeholder="例如：Dora"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                類別 / 工種
              </span>
              <select
                value={draft.category}
                onChange={(e) => onChange("category", e.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              >
                <option value="音響">音響</option>
                <option value="燈光">燈光</option>
                <option value="結構">結構</option>
                <option value="印刷">印刷</option>
                <option value="輸出">輸出</option>
                <option value="租借">租借</option>
                <option value="其他">其他</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">項目</span>
              <input
                value={draft.title}
                onChange={(e) => onChange("title", e.target.value)}
                placeholder="例如：接待區背牆木作施作"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <VendorMatchField
              label="執行廠商"
              value={draft.vendorName}
              onChange={(value) => onChange("vendorName", value)}
              vendors={vendors}
            />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                廠商報價
              </span>
              <input
                value={draft.amount}
                onChange={(e) => onChange("amount", e.target.value)}
                placeholder="例如：NT$ 120,000"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-1">
              <span className="text-sm font-medium text-slate-700">
                規格 / 尺寸
              </span>
              <input
                value={draft.specification}
                onChange={(e) => onChange("specification", e.target.value)}
                placeholder="例如：木作包柱＋烤漆面"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                參考連結 / 參考資料
              </span>
              <input
                value={draft.referenceUrl}
                onChange={(e) => onChange("referenceUrl", e.target.value)}
                placeholder="https://..."
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                需求說明
              </span>
              <textarea
                value={draft.requirement}
                onChange={(e) => onChange("requirement", e.target.value)}
                placeholder="例如：需確認尺寸、結構與施工方式，回覆可執行作法"
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actions.onSave}
              disabled={actions.isSaving}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {actions.saveLabel ?? "儲存廠商交辦"}
            </button>
            <button
              type="button"
              onClick={actions.onCancel}
              disabled={actions.isSaving}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AssignmentMenu({
  targetId,
  isActive,
  onToggle,
  onDesign,
  onProcurement,
  onVendor,
  hasDesign,
  hasProcurement,
  hasVendor,
  size = "main",
}: {
  targetId: string;
  isActive: boolean;
  onToggle: (targetId: string) => void;
  onDesign: () => void;
  onProcurement: () => void;
  onVendor: () => void;
  hasDesign: boolean;
  hasProcurement: boolean;
  hasVendor: boolean;
  size?: "main" | "child";
}) {
  const buttonClass =
    size === "child"
      ? "inline-flex h-9 w-[54px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
      : "inline-flex h-11 w-[72px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(targetId)}
        className={buttonClass}
      >
        交辦
      </button>
      {isActive ? (
        <div className="absolute right-0 z-10 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={onDesign}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
          >
            {hasDesign ? "編輯設計" : "設計"}
          </button>
          <button
            type="button"
            onClick={onProcurement}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-amber-700"
          >
            {hasProcurement ? "編輯備品" : "備品"}
          </button>
          <button
            type="button"
            onClick={onVendor}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-700"
          >
            {hasVendor ? "編輯廠商" : "廠商"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

type PersistedAssignmentPayload = {
  targetId: string;
  title: string;
  draft: DesignAssignmentDraft | ProcurementAssignmentDraft | VendorAssignmentDraft;
};

type SavedAssignment<TDraft> = {
  data: TDraft;
  boardPath?: string;
};

type AssignmentSaveResult = {
  boardPath?: string;
};

type ExecutionTreeServerHandlers = {
  createExecutionItem?: (input: { title: string; parentId?: string | null }) => Promise<{ item: ImportedItem | ProjectExecutionSubItem; parentId?: string | null }>;
  importExecutionItems?: (input: { items: ImportedItem[] }) => Promise<{ items: ImportedItem[] }>;
  updateExecutionItem?: (input: { itemId: string; title: string }) => Promise<{ item: ImportedItem | ProjectExecutionSubItem }>;
  deleteExecutionItem?: (input: { itemId: string }) => Promise<{ deletedId: string; childIds?: string[] }>;
  saveDesignAssignment?: (payload: PersistedAssignmentPayload & { draft: DesignAssignmentDraft }) => Promise<AssignmentSaveResult | void>;
  saveProcurementAssignment?: (payload: PersistedAssignmentPayload & { draft: ProcurementAssignmentDraft }) => Promise<AssignmentSaveResult | void>;
  saveVendorAssignment?: (payload: PersistedAssignmentPayload & { draft: VendorAssignmentDraft }) => Promise<AssignmentSaveResult | void>;
};

function AssignmentDrawer({
  activeDrawer,
  designDraft,
  savedDesign,
  procurementDraft,
  savedProcurement,
  vendorDraft,
  savedVendor,
  onClose,
  onDesignChange,
  onProcurementChange,
  onVendorChange,
  onSaveDesign,
  onSaveProcurement,
  onSaveVendor,
  onDeleteDesign,
  onDeleteProcurement,
  onDeleteVendor,
  vendorOptions,
  isSaving = false,
  errorMessage,
}: {
  activeDrawer: ActiveAssignmentDrawer | null;
  designDraft: DesignAssignmentDraft;
  savedDesign?: DesignAssignmentDraft;
  procurementDraft: ProcurementAssignmentDraft;
  savedProcurement?: ProcurementAssignmentDraft;
  vendorDraft: VendorAssignmentDraft;
  savedVendor?: VendorAssignmentDraft;
  onClose: () => void;
  onDesignChange: (key: keyof DesignAssignmentDraft, value: string) => void;
  onProcurementChange: (key: keyof ProcurementAssignmentDraft, value: string) => void;
  onVendorChange: (key: keyof VendorAssignmentDraft, value: string) => void;
  onSaveDesign: () => void;
  onSaveProcurement: () => void;
  onSaveVendor: () => void;
  onDeleteDesign: () => void;
  onDeleteProcurement: () => void;
  onDeleteVendor: () => void;
  vendorOptions: VendorBasicProfile[];
  isSaving?: boolean;
  errorMessage?: string | null;
}) {
  if (!activeDrawer) return null;

  const flowMeta =
    activeDrawer.flowType === "design"
      ? { label: "設計交辦", accent: "text-blue-700", badge: "bg-blue-50 text-blue-700 ring-blue-200" }
      : activeDrawer.flowType === "procurement"
        ? { label: "備品交辦", accent: "text-amber-700", badge: "bg-amber-50 text-amber-700 ring-amber-200" }
        : { label: "廠商交辦", accent: "text-violet-700", badge: "bg-violet-50 text-violet-700 ring-violet-200" };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[720px] flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${flowMeta.badge}`}>
                {flowMeta.label}
              </span>
              <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {activeDrawer.level === "main" ? "主項目" : "子項目"}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{activeDrawer.title}</h3>
            <p className="mt-1 text-sm text-slate-500">在不改變任務發布 workflow 的前提下，改由右側抽屜完成交辦編輯。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-lg text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="關閉交辦抽屜"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {errorMessage ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {activeDrawer.flowType === "design" ? (
            <DesignAssignmentForm
              title={activeDrawer.title}
              draft={designDraft}
              saved={savedDesign}
              isEditing
              onChange={onDesignChange}
              vendors={vendorOptions}
              actions={{
                onSave: onSaveDesign,
                onCancel: onClose,
                onDelete: savedDesign ? onDeleteDesign : undefined,
                isSaving,
                saveLabel: isSaving ? "儲存中..." : "儲存設計交辦",
              }}
            />
          ) : null}

          {activeDrawer.flowType === "procurement" ? (
            <ProcurementAssignmentForm
              title={activeDrawer.title}
              draft={procurementDraft}
              saved={savedProcurement}
              isEditing
              onChange={onProcurementChange}
              vendors={vendorOptions}
              actions={{
                onSave: onSaveProcurement,
                onCancel: onClose,
                onDelete: savedProcurement ? onDeleteProcurement : undefined,
                isSaving,
                saveLabel: isSaving ? "儲存中..." : "儲存備品交辦",
              }}
            />
          ) : null}

          {activeDrawer.flowType === "vendor" ? (
            <VendorAssignmentForm
              title={activeDrawer.title}
              draft={vendorDraft}
              saved={savedVendor}
              isEditing
              onChange={onVendorChange}
              vendors={vendorOptions}
              actions={{
                onSave: onSaveVendor,
                onCancel: onClose,
                onDelete: savedVendor ? onDeleteVendor : undefined,
                isSaving,
                saveLabel: isSaving ? "儲存中..." : "儲存廠商交辦",
              }}
            />
          ) : null}
        </div>
      </aside>
    </>
  );
}

export function ExecutionTree({
  items,
  projectId,
  onDesignAssignmentsChange,
  onProcurementAssignmentsChange,
  onVendorAssignmentsChange,
  onAssignmentSaved,
  heading = "新增主項目",
  initialDesignAssignments = {},
  initialProcurementAssignments = {},
  initialVendorAssignments = {},
  vendorOptions = [],
  serverHandlers,
}: {
  items: ProjectExecutionItem[];
  projectId?: string;
  onDesignAssignmentsChange?: (
    payload: Array<{
      targetId: string;
      title: string;
      data: DesignAssignmentDraft;
    }>,
  ) => void;
  onProcurementAssignmentsChange?: (
    payload: Array<{
      targetId: string;
      title: string;
      data: ProcurementAssignmentDraft;
    }>,
  ) => void;
  onVendorAssignmentsChange?: (
    payload: Array<{
      targetId: string;
      title: string;
      data: VendorAssignmentDraft;
    }>,
  ) => void;
  heading?: string;
  initialDesignAssignments?: Record<string, DesignAssignmentDraft>;
  initialProcurementAssignments?: Record<string, ProcurementAssignmentDraft>;
  initialVendorAssignments?: Record<string, VendorAssignmentDraft>;
  vendorOptions?: VendorBasicProfile[];
  onAssignmentSaved?: (payload: { flowType: "design" | "procurement" | "vendor"; targetId: string; boardPath?: string }) => void;
  serverHandlers?: ExecutionTreeServerHandlers;
}) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [localItems, setLocalItems] = useState<ImportedItem[]>(
    items as ImportedItem[],
  );
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [activeAssignMenu, setActiveAssignMenu] = useState<string | null>(null);
  const [showMainItemCreator, setShowMainItemCreator] = useState(false);
  const [mainItemDraft, setMainItemDraft] = useState("");
  const [excelPreview, setExcelPreview] = useState<ParsedExcelImportPreview | null>(null);
  const [excelImportError, setExcelImportError] = useState("");
  const [excelDebugRows, setExcelDebugRows] = useState<string[][]>([]);
  const [activeAssignmentDrawer, setActiveAssignmentDrawer] = useState<ActiveAssignmentDrawer | null>(null);
  const [designAssignmentDrafts, setDesignAssignmentDrafts] = useState<
    Record<string, DesignAssignmentDraft>
  >({});
  const [savedDesignAssignments, setSavedDesignAssignments] = useState<
    Record<string, SavedAssignment<DesignAssignmentDraft>>
  >(
    Object.fromEntries(
      Object.entries(initialDesignAssignments).map(([targetId, data]) => [targetId, { data }]),
    ),
  );
  const [procurementAssignmentDrafts, setProcurementAssignmentDrafts] =
    useState<Record<string, ProcurementAssignmentDraft>>({});
  const [savedProcurementAssignments, setSavedProcurementAssignments] =
    useState<Record<string, SavedAssignment<ProcurementAssignmentDraft>>>(
      Object.fromEntries(
        Object.entries(initialProcurementAssignments).map(([targetId, data]) => [targetId, { data }]),
      ),
    );
  const [vendorAssignmentDrafts, setVendorAssignmentDrafts] = useState<
    Record<string, VendorAssignmentDraft>
  >({});
  const [savedVendorAssignments, setSavedVendorAssignments] = useState<
    Record<string, SavedAssignment<VendorAssignmentDraft>>
  >(
    Object.fromEntries(
      Object.entries(initialVendorAssignments).map(([targetId, data]) => [targetId, { data }]),
    ),
  );
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [assignmentSaveError, setAssignmentSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalItems(items as ImportedItem[]);
  }, [items]);

  useEffect(() => {
    if (serverHandlers || !projectId || typeof window === "undefined") return;
    const stored = readStoredExecutionTreeState(projectId);
    setSavedDesignAssignments(
      Object.fromEntries(
        Object.entries(stored.savedDesignAssignments ?? {}).map(([targetId, value]) => [
          targetId,
          value && typeof value === "object" && "data" in value
            ? (value as SavedAssignment<DesignAssignmentDraft>)
            : { data: value as DesignAssignmentDraft },
        ]),
      ),
    );
    setSavedProcurementAssignments(
      Object.fromEntries(
        Object.entries(stored.savedProcurementAssignments ?? {}).map(([targetId, value]) => [
          targetId,
          value && typeof value === "object" && "data" in value
            ? (value as SavedAssignment<ProcurementAssignmentDraft>)
            : { data: value as ProcurementAssignmentDraft },
        ]),
      ),
    );
    setSavedVendorAssignments(
      Object.fromEntries(
        Object.entries(stored.savedVendorAssignments ?? {}).map(([targetId, value]) => [
          targetId,
          value && typeof value === "object" && "data" in value
            ? (value as SavedAssignment<VendorAssignmentDraft>)
            : { data: value as VendorAssignmentDraft },
        ]),
      ),
    );
  }, [projectId, serverHandlers]);

  useEffect(() => {
    setSavedDesignAssignments(
      Object.fromEntries(
        Object.entries(initialDesignAssignments).map(([targetId, data]) => [targetId, { data }]),
      ),
    );
    setSavedProcurementAssignments(
      Object.fromEntries(
        Object.entries(initialProcurementAssignments).map(([targetId, data]) => [targetId, { data }]),
      ),
    );
    setSavedVendorAssignments(
      Object.fromEntries(
        Object.entries(initialVendorAssignments).map(([targetId, data]) => [targetId, { data }]),
      ),
    );
  }, [initialDesignAssignments, initialProcurementAssignments, initialVendorAssignments]);

  useEffect(() => {
    if (serverHandlers || !projectId || typeof window === "undefined") return;
    window.localStorage.setItem(
      getExecutionTreeStorageKey(projectId),
      JSON.stringify({
        savedDesignAssignments,
        savedProcurementAssignments,
        savedVendorAssignments,
      }),
    );
  }, [projectId, savedDesignAssignments, savedProcurementAssignments, savedVendorAssignments, serverHandlers]);

  useEffect(() => {
    if (!onDesignAssignmentsChange) return;
    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) =>
        titleMap.set(child.id, child.title),
      );
    });
    onDesignAssignmentsChange(
      Object.entries(savedDesignAssignments).map(([targetId, saved]) => ({
        targetId,
        title: titleMap.get(targetId) ?? targetId,
        data: saved.data,
        boardPath: saved.boardPath,
      })),
    );
  }, [localItems, onDesignAssignmentsChange, savedDesignAssignments]);

  useEffect(() => {
    if (!onProcurementAssignmentsChange) return;
    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) =>
        titleMap.set(child.id, child.title),
      );
    });
    onProcurementAssignmentsChange(
      Object.entries(savedProcurementAssignments).map(([targetId, saved]) => ({
        targetId,
        title: titleMap.get(targetId) ?? targetId,
        data: saved.data,
        boardPath: saved.boardPath,
      })),
    );
  }, [localItems, onProcurementAssignmentsChange, savedProcurementAssignments]);

  useEffect(() => {
    if (!onVendorAssignmentsChange) return;
    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) =>
        titleMap.set(child.id, child.title),
      );
    });
    onVendorAssignmentsChange(
      Object.entries(savedVendorAssignments).map(([targetId, saved]) => ({
        targetId,
        title: titleMap.get(targetId) ?? targetId,
        data: saved.data,
        boardPath: saved.boardPath,
      })),
    );
  }, [localItems, onVendorAssignmentsChange, savedVendorAssignments]);

  function updateDraft(itemId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [itemId]: value }));
  }

  function getParentItemId(targetId: string) {
    const matchedParent = localItems.find(
      (item) =>
        item.id === targetId ||
        (item.children ?? []).some((child) => child.id === targetId),
    );
    return matchedParent?.id ?? targetId;
  }

  function resetTransientPanels() {
    setActiveAssignMenu(null);
    setActiveAssignmentDrawer(null);
  }

  function toggleItem(itemId: string) {
    setExpandedItemId((prev) => {
      const nextId = prev === itemId ? null : itemId;
      if (nextId !== prev) {
        resetTransientPanels();
      }
      return nextId;
    });
  }
  function updateDesignAssignmentDraft(
    targetId: string,
    key: keyof DesignAssignmentDraft,
    value: string,
  ) {
    setDesignAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] ?? defaultDesignAssignmentDraft),
        [key]: value,
      },
    }));
  }
  function updateProcurementAssignmentDraft(
    targetId: string,
    key: keyof ProcurementAssignmentDraft,
    value: string,
  ) {
    setProcurementAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] ?? defaultProcurementAssignmentDraft),
        [key]: value,
      },
    }));
  }
  function updateVendorAssignmentDraft(
    targetId: string,
    key: keyof VendorAssignmentDraft,
    value: string,
  ) {
    setVendorAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] ?? defaultVendorAssignmentDraft),
        [key]: value,
      },
    }));
  }

  function cloneDesignAssignmentDraft(draft: DesignAssignmentDraft): DesignAssignmentDraft {
    return { ...draft, replies: draft.replies ? [...draft.replies] : undefined };
  }

  function cloneProcurementAssignmentDraft(draft: ProcurementAssignmentDraft): ProcurementAssignmentDraft {
    return { ...draft, replies: draft.replies ? [...draft.replies] : undefined };
  }

  function cloneVendorAssignmentDraft(draft: VendorAssignmentDraft): VendorAssignmentDraft {
    return { ...draft, replies: draft.replies ? [...draft.replies] : undefined };
  }

  function openDesignForm(targetId: string, title: string) {
    setAssignmentSaveError(null);
    const parentItemId = getParentItemId(targetId);
    setExpandedItemId(parentItemId);
    setActiveAssignMenu(null);
    setDesignAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]:
        prev[targetId] ??
        savedDesignAssignments[targetId]?.data ??
        defaultDesignAssignmentDraft,
    }));
    setActiveAssignmentDrawer({
      targetId,
      title,
      flowType: "design",
      level: targetId === parentItemId ? "main" : "child",
      parentItemId,
    });
  }
  function openProcurementForm(targetId: string, title: string) {
    setAssignmentSaveError(null);
    const parentItemId = getParentItemId(targetId);
    setExpandedItemId(parentItemId);
    setActiveAssignMenu(null);
    setProcurementAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]:
        prev[targetId] ??
        savedProcurementAssignments[targetId]?.data ??
        defaultProcurementAssignmentDraft,
    }));
    setActiveAssignmentDrawer({
      targetId,
      title,
      flowType: "procurement",
      level: targetId === parentItemId ? "main" : "child",
      parentItemId,
    });
  }
  function openVendorForm(targetId: string, title: string) {
    setAssignmentSaveError(null);
    const parentItemId = getParentItemId(targetId);
    setExpandedItemId(parentItemId);
    setActiveAssignMenu(null);
    setVendorAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: prev[targetId] ??
        savedVendorAssignments[targetId]?.data ?? {
          ...defaultVendorAssignmentDraft,
          title,
        },
    }));
    setActiveAssignmentDrawer({
      targetId,
      title,
      flowType: "vendor",
      level: targetId === parentItemId ? "main" : "child",
      parentItemId,
    });
  }

  async function saveDesignAssignment(targetId: string) {
    const draft = cloneDesignAssignmentDraft(designAssignmentDrafts[targetId] ?? defaultDesignAssignmentDraft);
    setIsSubmittingAssignment(true);
    setAssignmentSaveError(null);
    try {
      let saveResult: AssignmentSaveResult | void = undefined;
      if (serverHandlers?.saveDesignAssignment) {
        const title = localItems.find((item) => item.id === targetId)?.title
          ?? localItems.flatMap((item) => item.children ?? []).find((child) => child.id === targetId)?.title
          ?? targetId;
        saveResult = await serverHandlers.saveDesignAssignment({ targetId, title, draft });
      }
      setSavedDesignAssignments((prev) => ({
        ...prev,
        [targetId]: {
          data: draft,
          boardPath: saveResult?.boardPath,
        },
      }));
      setActiveAssignmentDrawer(null);
      onAssignmentSaved?.({ flowType: "design", targetId, boardPath: saveResult?.boardPath });
    } catch (error) {
      setAssignmentSaveError(error instanceof Error ? error.message : "設計交辦儲存失敗");
    } finally {
      setIsSubmittingAssignment(false);
    }
  }
  async function saveProcurementAssignment(targetId: string) {
    const draft = cloneProcurementAssignmentDraft(procurementAssignmentDrafts[targetId] ?? defaultProcurementAssignmentDraft);
    setIsSubmittingAssignment(true);
    setAssignmentSaveError(null);
    try {
      let saveResult: AssignmentSaveResult | void = undefined;
      if (serverHandlers?.saveProcurementAssignment) {
        const title = localItems.find((item) => item.id === targetId)?.title
          ?? localItems.flatMap((item) => item.children ?? []).find((child) => child.id === targetId)?.title
          ?? targetId;
        saveResult = await serverHandlers.saveProcurementAssignment({ targetId, title, draft });
      }
      setSavedProcurementAssignments((prev) => ({
        ...prev,
        [targetId]: {
          data: draft,
          boardPath: saveResult?.boardPath,
        },
      }));
      setActiveAssignmentDrawer(null);
      onAssignmentSaved?.({ flowType: "procurement", targetId, boardPath: saveResult?.boardPath });
    } catch (error) {
      setAssignmentSaveError(error instanceof Error ? error.message : "備品交辦儲存失敗");
    } finally {
      setIsSubmittingAssignment(false);
    }
  }
  async function saveVendorAssignment(targetId: string) {
    const draft = cloneVendorAssignmentDraft(vendorAssignmentDrafts[targetId] ?? defaultVendorAssignmentDraft);
    setIsSubmittingAssignment(true);
    setAssignmentSaveError(null);
    try {
      let saveResult: AssignmentSaveResult | void = undefined;
      if (serverHandlers?.saveVendorAssignment) {
        const title = localItems.find((item) => item.id === targetId)?.title
          ?? localItems.flatMap((item) => item.children ?? []).find((child) => child.id === targetId)?.title
          ?? targetId;
        saveResult = await serverHandlers.saveVendorAssignment({ targetId, title, draft });
      }
      setSavedVendorAssignments((prev) => ({
        ...prev,
        [targetId]: {
          data: draft,
          boardPath: saveResult?.boardPath,
        },
      }));
      setActiveAssignmentDrawer(null);
      onAssignmentSaved?.({ flowType: "vendor", targetId, boardPath: saveResult?.boardPath });
    } catch (error) {
      setAssignmentSaveError(error instanceof Error ? error.message : "廠商交辦儲存失敗");
    } finally {
      setIsSubmittingAssignment(false);
    }
  }

  function removeDesignAssignment(targetId: string) {
    if (!window.confirm("確定要刪除這筆設計交辦嗎？")) return;
    setSavedDesignAssignments((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    setDesignAssignmentDrafts((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    if (activeAssignmentDrawer?.flowType === "design" && activeAssignmentDrawer.targetId === targetId) {
      setActiveAssignmentDrawer(null);
    }
  }
  function removeProcurementAssignment(targetId: string) {
    if (!window.confirm("確定要刪除這筆備品交辦嗎？")) return;
    setSavedProcurementAssignments((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    setProcurementAssignmentDrafts((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    if (activeAssignmentDrawer?.flowType === "procurement" && activeAssignmentDrawer.targetId === targetId) {
      setActiveAssignmentDrawer(null);
    }
  }
  function removeVendorAssignment(targetId: string) {
    if (!window.confirm("確定要刪除這筆廠商交辦嗎？")) return;
    setSavedVendorAssignments((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    setVendorAssignmentDrafts((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    if (activeAssignmentDrawer?.flowType === "vendor" && activeAssignmentDrawer.targetId === targetId) {
      setActiveAssignmentDrawer(null);
    }
  }

  async function addMainItem() {
    const draft = mainItemDraft.trim();
    if (!draft) return;

    let createdItemId: string;
    if (serverHandlers?.createExecutionItem) {
      const created = await serverHandlers.createExecutionItem({ title: draft, parentId: null });
      createdItemId = created.item.id;
      setLocalItems((prev) => [...prev, created.item as ImportedItem]);
    } else {
      const newId = `main-item-${localItems.length + 1}`;
      createdItemId = newId;
      setLocalItems((prev) => [
        ...prev,
        {
          id: newId,
          title: draft,
          status: "待交辦",
          category: "專案",
          detail: "請補充此主項目的需求說明與執行方向。",
          referenceExample: "",
          designTaskCount: 0,
          procurementTaskCount: 0,
          children: [],
        },
      ]);
    }
    setExpandedItemId(createdItemId);
    setMainItemDraft("");
    setShowMainItemCreator(false);
  }

  async function handleImport(file: File) {
    try {
      setExcelImportError("");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames?.[0];
      if (!firstSheetName) {
        setExcelImportError("找不到可讀取的工作表。請確認 .xlsx 內容是否正確。");
        return;
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as unknown[][];
      setExcelDebugRows(rows.slice(0, 20).map((row) => row.map((cell) => String(cell ?? "").trim())));
      const preview = parseExecutionItemsFromExcelRows(rows);
      if (!preview.mainItems.length) {
        setExcelImportError("這份 .xlsx 沒有可匯入的主 / 子項目；系統只會納入有編號的列。");
        setExcelPreview(preview);
        return;
      }
      setExcelPreview(preview);
    } catch (error) {
      setExcelImportError(error instanceof Error ? error.message : "無法解析這份 .xlsx，請確認格式是否正確。");
    }
  }

  async function confirmExcelImport() {
    if (!excelPreview?.items.length) return;

    if (serverHandlers?.importExecutionItems) {
      try {
        const result = await serverHandlers.importExecutionItems({ items: excelPreview.items as ImportedItem[] });
        setLocalItems((prev) => [...prev, ...result.items]);
        setExpandedItemId(result.items[0]?.id ?? null);
        setExcelPreview(null);
        setExcelImportError("");
        return;
      } catch (error) {
        setExcelImportError(error instanceof Error ? error.message : "Excel 匯入寫入 DB 失敗");
        return;
      }
    }

    setLocalItems(excelPreview.items);
    setExpandedItemId(excelPreview.items[0]?.id ?? null);
    setExcelPreview(null);
  }

  async function addChild(itemId: string) {
    const draft = drafts[itemId]?.trim();
    if (!draft) return;

    if (serverHandlers?.createExecutionItem) {
      const created = await serverHandlers.createExecutionItem({ title: draft, parentId: itemId });
      setLocalItems((prev) =>
        prev.map((item) =>
          item.id !== itemId
            ? item
            : {
                ...item,
                children: [...(item.children ?? []), created.item],
              },
        ),
      );
    } else {
      setLocalItems((prev) =>
        prev.map((item) =>
          item.id !== itemId
            ? item
            : {
                ...item,
                children: [
                  ...(item.children ?? []),
                  {
                    id: `${item.id}-new-${(item.children?.length ?? 0) + 1}`,
                    title: draft,
                    status: "待交辦",
                    assignee: "未指派",
                    category: item.category,
                  },
                ],
              },
        ),
      );
    }
    setDrafts((prev) => ({ ...prev, [itemId]: "" }));
    setExpandedItemId(itemId);
  }

  function startEditingMain(itemId: string, currentTitle: string) {
    setEditingMainId(itemId);
    setEditingChildId(null);
    setEditingValue(currentTitle);
  }
  function startEditingChild(childId: string, currentTitle: string) {
    setEditingChildId(childId);
    setEditingMainId(null);
    setEditingValue(currentTitle);
  }
  async function saveEditingMain(itemId: string) {
    const nextTitle = editingValue.trim();
    if (!nextTitle) return;

    if (serverHandlers?.updateExecutionItem) {
      try {
        await serverHandlers.updateExecutionItem({ itemId, title: nextTitle });
      } catch (error) {
        setExcelImportError(error instanceof Error ? error.message : "更新主項目失敗");
        return;
      }
    }

    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, title: nextTitle } : item,
      ),
    );
    setEditingMainId(null);
    setEditingValue("");
  }
  async function saveEditingChild(childId: string) {
    const nextTitle = editingValue.trim();
    if (!nextTitle) return;

    if (serverHandlers?.updateExecutionItem) {
      try {
        await serverHandlers.updateExecutionItem({ itemId: childId, title: nextTitle });
      } catch (error) {
        setExcelImportError(error instanceof Error ? error.message : "更新次項目失敗");
        return;
      }
    }

    setLocalItems((prev) =>
      prev.map((item) => ({
        ...item,
        children: (item.children ?? []).map((child) =>
          child.id === childId ? { ...child, title: nextTitle } : child,
        ),
      })),
    );
    setEditingChildId(null);
    setEditingValue("");
  }
  function cancelEditing() {
    setEditingMainId(null);
    setEditingChildId(null);
    setEditingValue("");
  }
  function toggleAssignMenu(targetId: string) {
    setExpandedItemId(getParentItemId(targetId));
    setActiveAssignmentDrawer(null);
    setActiveAssignMenu((prev) => (prev === targetId ? null : targetId));
  }

  async function removeMain(itemId: string) {
    const target = localItems.find((item) => item.id === itemId);
    if (
      !window.confirm(
        `確定要刪除主項目「${target?.title ?? "未命名項目"}」嗎？\n刪除後其底下次項目與交辦資料也會一起移除。`,
      )
    )
      return;

    if (serverHandlers?.deleteExecutionItem) {
      try {
        await serverHandlers.deleteExecutionItem({ itemId });
      } catch (error) {
        setExcelImportError(error instanceof Error ? error.message : "刪除主項目失敗");
        return;
      }
    }

    setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
    }
    setSavedDesignAssignments((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setSavedProcurementAssignments((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setSavedVendorAssignments((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  async function removeChild(parentId: string, childId: string) {
    const parent = localItems.find((item) => item.id === parentId);
    const target = parent?.children?.find((child) => child.id === childId);
    if (
      !window.confirm(
        `確定要刪除次項目「${target?.title ?? "未命名次項目"}」嗎？`,
      )
    )
      return;

    if (serverHandlers?.deleteExecutionItem) {
      try {
        await serverHandlers.deleteExecutionItem({ itemId: childId });
      } catch (error) {
        setExcelImportError(error instanceof Error ? error.message : "刪除次項目失敗");
        return;
      }
    }

    setLocalItems((prev) =>
      prev.map((item) =>
        item.id !== parentId
          ? item
          : {
              ...item,
              children: (item.children ?? []).filter(
                (child) => child.id !== childId,
              ),
            },
      ),
    );
    setSavedDesignAssignments((prev) => {
      const next = { ...prev };
      delete next[childId];
      return next;
    });
    setSavedProcurementAssignments((prev) => {
      const next = { ...prev };
      delete next[childId];
      return next;
    });
    setSavedVendorAssignments((prev) => {
      const next = { ...prev };
      delete next[childId];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{heading}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowMainItemCreator((prev) => !prev)}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              + 新增主項目
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              匯入 .xlsx
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
                event.currentTarget.value = "";
              }}
            />
          </div>
        </div>
        {excelImportError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {excelImportError}
          </div>
        ) : null}

        {excelImportError && excelDebugRows.length ? (
          <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/60 p-4 ring-1 ring-amber-100">
            <p className="text-xs font-semibold tracking-wide text-amber-700">XLSX DEBUG</p>
            <p className="mt-2 text-sm text-slate-600">以下是目前實際讀到的前 20 列內容，方便直接對照 A 欄 / B 欄是否如預期。</p>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              {excelDebugRows.map((row, index) => (
                <div key={`debug-row-${index}`} className="rounded-2xl bg-white px-3 py-2 ring-1 ring-amber-100">
                  <span className="font-semibold text-slate-900">Row {index + 1}</span>
                  <span className="ml-2">A={row[0] || ""}</span>
                  <span className="ml-2">B={row[1] || ""}</span>
                  <span className="ml-2">C={row[2] || ""}</span>
                  <span className="ml-2">D={row[3] || ""}</span>
                  <span className="ml-2">E={row[4] || ""}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {excelPreview ? (
          <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50/60 p-4 ring-1 ring-blue-100">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-700">XLSX PREVIEW</p>
                <h4 className="mt-1 text-lg font-semibold text-slate-900">匯入預覽</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  第一版只納入有編號的列。主項目：{excelPreview.mainItems.length} 筆，總子項目：{excelPreview.mainItems.reduce((sum, item) => sum + item.children.length, 0)} 筆。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={confirmExcelImport}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  確認匯入
                </button>
                <button
                  type="button"
                  onClick={() => setExcelPreview(null)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  取消預覽
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">解析摘要</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <span>header row：{excelPreview.headerRowNumber}</span>
                <span>mainItems：{excelPreview.mainItems.length}</span>
                <span>items：{excelPreview.items.length}</span>
                <span>ignored：{excelPreview.ignoredRowNumbers.length}</span>
                <span>failed：{excelPreview.failedRowNumbers.length}</span>
                <span>stop row：{excelPreview.stopRowNumber ?? "-"}</span>
              </div>
              <div className="mt-3 space-y-2">
                {excelPreview.rows.slice(0, 20).map((row) => (
                  <div key={`parsed-${row.rowNumber}`} className="rounded-xl bg-slate-50 px-3 py-2">
                    Row {row.rowNumber} ｜ type={row.type} ｜ code={row.code || ""} ｜ name={row.name || ""}
                    {row.reason ? <span> ｜ reason={row.reason}</span> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {excelPreview.mainItems.map((mainItem) => (
                <div key={mainItem.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">主項目</span>
                    <p className="text-sm font-semibold text-slate-900">{mainItem.title}</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {mainItem.children.map((child) => (
                      <div key={child.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">{child.code}</span>
                          <span className="font-medium text-slate-900">{child.title}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                          {child.quantity ? <span>數量：{child.quantity}</span> : null}
                          {child.unit ? <span>單位：{child.unit}</span> : null}
                          {child.amount ? <span>金額：{child.amount}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {showMainItemCreator ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={mainItemDraft}
              onChange={(event) => setMainItemDraft(event.target.value)}
              placeholder="輸入主項目名稱，例如：入口主背板"
              className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addMainItem}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                建立
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMainItemCreator(false);
                  setMainItemDraft("");
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <AssignmentDrawer
        activeDrawer={activeAssignmentDrawer}
        designDraft={
          activeAssignmentDrawer && activeAssignmentDrawer.flowType === "design"
            ? designAssignmentDrafts[activeAssignmentDrawer.targetId] ?? defaultDesignAssignmentDraft
            : defaultDesignAssignmentDraft
        }
        savedDesign={
          activeAssignmentDrawer && activeAssignmentDrawer.flowType === "design"
            ? savedDesignAssignments[activeAssignmentDrawer.targetId]?.data
            : undefined
        }
        procurementDraft={
          activeAssignmentDrawer && activeAssignmentDrawer.flowType === "procurement"
            ? procurementAssignmentDrafts[activeAssignmentDrawer.targetId] ?? defaultProcurementAssignmentDraft
            : defaultProcurementAssignmentDraft
        }
        savedProcurement={
          activeAssignmentDrawer && activeAssignmentDrawer.flowType === "procurement"
            ? savedProcurementAssignments[activeAssignmentDrawer.targetId]?.data
            : undefined
        }
        vendorDraft={
          activeAssignmentDrawer && activeAssignmentDrawer.flowType === "vendor"
            ? vendorAssignmentDrafts[activeAssignmentDrawer.targetId] ?? {
                ...defaultVendorAssignmentDraft,
                title: activeAssignmentDrawer.title,
              }
            : defaultVendorAssignmentDraft
        }
        savedVendor={
          activeAssignmentDrawer && activeAssignmentDrawer.flowType === "vendor"
            ? savedVendorAssignments[activeAssignmentDrawer.targetId]?.data
            : undefined
        }
        onClose={() => setActiveAssignmentDrawer(null)}
        onDesignChange={(key, value) => {
          if (!activeAssignmentDrawer) return;
          updateDesignAssignmentDraft(activeAssignmentDrawer.targetId, key, value);
        }}
        onProcurementChange={(key, value) => {
          if (!activeAssignmentDrawer) return;
          updateProcurementAssignmentDraft(activeAssignmentDrawer.targetId, key, value);
        }}
        onVendorChange={(key, value) => {
          if (!activeAssignmentDrawer) return;
          updateVendorAssignmentDraft(activeAssignmentDrawer.targetId, key, value);
        }}
        onSaveDesign={() => {
          if (!activeAssignmentDrawer) return;
          void saveDesignAssignment(activeAssignmentDrawer.targetId);
        }}
        onSaveProcurement={() => {
          if (!activeAssignmentDrawer) return;
          void saveProcurementAssignment(activeAssignmentDrawer.targetId);
        }}
        onSaveVendor={() => {
          if (!activeAssignmentDrawer) return;
          void saveVendorAssignment(activeAssignmentDrawer.targetId);
        }}
        onDeleteDesign={() => {
          if (!activeAssignmentDrawer) return;
          removeDesignAssignment(activeAssignmentDrawer.targetId);
        }}
        onDeleteProcurement={() => {
          if (!activeAssignmentDrawer) return;
          removeProcurementAssignment(activeAssignmentDrawer.targetId);
        }}
        onDeleteVendor={() => {
          if (!activeAssignmentDrawer) return;
          removeVendorAssignment(activeAssignmentDrawer.targetId);
        }}
        vendorOptions={vendorOptions}
        isSaving={isSubmittingAssignment}
        errorMessage={assignmentSaveError}
      />

      {localItems.map((item, itemIndex) => {
        const isOpen = expandedItemId === item.id;
        const isEditingMain = editingMainId === item.id;
        const hasMainAssignment =
          Boolean(savedDesignAssignments[item.id]) ||
          Boolean(savedProcurementAssignments[item.id]) ||
          Boolean(savedVendorAssignments[item.id]);
        return (
          <div
            key={item.id}
            data-execution-item-id={item.id}
            className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-base text-slate-700 transition hover:bg-slate-50"
                  aria-label={isOpen ? "收合主項目" : "展開主項目"}
                >
                  {isOpen ? "⌄" : "›"}
                </button>
                <div className="min-w-0 flex-1">
                  {isEditingMain ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={editingValue}
                        onChange={(event) =>
                          setEditingValue(event.target.value)
                        }
                        className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEditingMain(item.id)}
                          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                          儲存
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                          #{itemIndex + 1}
                        </span>
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          主項目
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-900">
                          {item.title}
                        </h4>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                          <span aria-hidden="true">≡</span>
                          <span>{item.children?.length ?? 0}</span>
                        </span>
                        {savedDesignAssignments[item.id] ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                            已建立設計交辦
                          </span>
                        ) : null}
                        {savedProcurementAssignments[item.id] ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                            已建立備品交辦
                          </span>
                        ) : null}
                        {savedVendorAssignments[item.id] ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
                            已建立廠商交辦
                          </span>
                        ) : null}
                      </div>
                      {!hasMainAssignment ? (
                        <div className="mt-3 text-xs text-slate-500">尚未建立交辦</div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <AssignmentMenu
                  targetId={item.id}
                  isActive={activeAssignMenu === item.id}
                  onToggle={toggleAssignMenu}
                  onDesign={() => openDesignForm(item.id, item.title)}
                  onProcurement={() => openProcurementForm(item.id, item.title)}
                  onVendor={() => openVendorForm(item.id, item.title)}
                  hasDesign={Boolean(savedDesignAssignments[item.id])}
                  hasProcurement={Boolean(savedProcurementAssignments[item.id])}
                  hasVendor={Boolean(savedVendorAssignments[item.id])}
                />
                <button
                  type="button"
                  onClick={() => startEditingMain(item.id, item.title)}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => removeMain(item.id)}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  刪除
                </button>
              </div>
            </div>

            {isOpen ? (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                {item.note ? (
                  <p className="mb-3 text-sm text-slate-500">
                    備註：{item.note}
                  </p>
                ) : null}
                <div className="space-y-3 border-l border-slate-200 pl-4 md:pl-6">
                  {(item.children ?? []).map((child, childIndex) => {
                    const isEditingChild = editingChildId === child.id;
                    const hasChildAssignment =
                      Boolean(savedDesignAssignments[child.id]) ||
                      Boolean(savedProcurementAssignments[child.id]) ||
                      Boolean(savedVendorAssignments[child.id]);
                    return (
                      <div
                        key={child.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            {isEditingChild ? (
                              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                                <input
                                  value={editingValue}
                                  onChange={(event) =>
                                    setEditingValue(event.target.value)
                                  }
                                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveEditingChild(child.id)}
                                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                  >
                                    儲存
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                    #{itemIndex + 1}-{childIndex + 1}
                                  </span>
                                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                    次項目
                                  </span>
                                  <span
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(child.status)}`}
                                  >
                                    {child.status}
                                  </span>
                                </div>
                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                  <h5 className="font-medium text-slate-900">
                                    {child.title}
                                  </h5>
                                  {savedDesignAssignments[child.id] ? (
                                    <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                                      已建立設計交辦
                                    </span>
                                  ) : null}
                                  {savedProcurementAssignments[child.id] ? (
                                    <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                                      已建立備品交辦
                                    </span>
                                  ) : null}
                                  {savedVendorAssignments[child.id] ? (
                                    <span className="inline-flex items-center justify-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
                                      已建立廠商交辦
                                    </span>
                                  ) : null}
                                </div>
                                {!hasChildAssignment ? (
                                  <div className="mt-3 text-xs text-slate-500">尚未建立交辦</div>
                                ) : null}
                                {child.note ? (
                                  <p className="mt-2 text-sm text-slate-500">
                                    備註：{child.note}
                                  </p>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <AssignmentMenu
                              targetId={child.id}
                              isActive={activeAssignMenu === child.id}
                              onToggle={toggleAssignMenu}
                              onDesign={() => openDesignForm(child.id, child.title)}
                              onProcurement={() =>
                                openProcurementForm(child.id, child.title)
                              }
                              onVendor={() =>
                                openVendorForm(child.id, child.title)
                              }
                              hasDesign={Boolean(
                                savedDesignAssignments[child.id],
                              )}
                              hasProcurement={Boolean(
                                savedProcurementAssignments[child.id],
                              )}
                              hasVendor={Boolean(
                                savedVendorAssignments[child.id],
                              )}
                              size="child"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                startEditingChild(child.id, child.title)
                              }
                              className="inline-flex h-9 w-[54px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              編輯
                            </button>
                            <button
                              type="button"
                              onClick={() => removeChild(item.id, child.id)}
                              className="inline-flex h-9 w-[54px] items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-200/70 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      + 新增次項目
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={drafts[item.id] ?? ""}
                        onChange={(event) =>
                          updateDraft(item.id, event.target.value)
                        }
                        placeholder="輸入次項目名稱，例如：主背板燈箱版型"
                        className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => addChild(item.id)}
                        className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        新增
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
