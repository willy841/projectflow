"use client";

import * as XLSX from "xlsx";
import { useEffect, useRef, useState } from "react";
import { parseExecutionItemsFromExcelRows, type ParsedExcelImportPreview } from "@/components/excel-task-import";
import {
  getExecutionTreeStorageKey,
  notifyProjectWorkflowUpdated,
  readStoredExecutionTreeState,
} from "@/components/project-workflow-store";
import {
  ProjectExecutionItem,
  getStatusClass,
} from "@/components/project-data";

export type AssignmentStatus = "待處理" | "進行中" | "已完成";

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
  structureRequired: string;
  note: string;
  outsourceTarget: string;
  status: AssignmentStatus;
  replies?: AssignmentReply[];
};

export type ProcurementAssignmentDraft = {
  assignee: string;
  item: string;
  size: string;
  material: string;
  quantity: string;
  styleUrl: string;
  note: string;
  status: AssignmentStatus;
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
  note: string;
  amount: string;
  status: AssignmentStatus;
  replies?: AssignmentReply[];
};

type ImportedItem = ProjectExecutionItem;

type FormActions = {
  onCancel: () => void;
  onSave: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const defaultDesignAssignmentDraft: DesignAssignmentDraft = {
  assignee: "",
  size: "",
  material: "",
  quantity: "",
  referenceUrl: "",
  structureRequired: "需要",
  note: "",
  outsourceTarget: "",
  status: "待處理",
};

const defaultProcurementAssignmentDraft: ProcurementAssignmentDraft = {
  assignee: "",
  item: "",
  size: "",
  material: "",
  quantity: "",
  styleUrl: "",
  note: "",
  status: "待處理",
};

const defaultVendorAssignmentDraft: VendorAssignmentDraft = {
  assignee: "",
  category: "音響",
  title: "",
  vendorName: "",
  requirement: "",
  specification: "",
  referenceUrl: "",
  note: "",
  amount: "",
  status: "待處理",
};

function AssignmentStatusField({
  value,
  onChange,
}: {
  value: AssignmentStatus;
  onChange: (value: AssignmentStatus) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">狀態</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AssignmentStatus)}
        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
      >
        <option value="待處理">待處理</option>
        <option value="進行中">進行中</option>
        <option value="已完成">已完成</option>
      </select>
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
}: {
  title: string;
  draft: DesignAssignmentDraft;
  saved?: DesignAssignmentDraft;
  isEditing: boolean;
  onChange: (key: keyof DesignAssignmentDraft, value: string) => void;
  actions: FormActions;
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
            saved.assignee ? `負責人：${saved.assignee}` : null,
          ].filter((item): item is string => Boolean(item))}
          fields={[
            { label: "來源項目 / 次項目", value: title },
            { label: "負責人", value: saved.assignee || "未指定" },
            { label: "尺寸", value: saved.size || "未填寫" },
            { label: "材質 + 結構", value: saved.material || "未填寫" },
            { label: "數量", value: saved.quantity || "未填寫" },
            { label: "需求說明", value: saved.note || "未填寫" },
            { label: "參考連結", value: saved.referenceUrl || "未填寫" },
            { label: "負責人", value: saved.assignee || "未指定" },
            { label: "狀態", value: saved.status || "未填寫" },
          ]}
          collapsedFields={
            saved.outsourceTarget
              ? [{ label: "執行廠商（預設）", value: saved.outsourceTarget }]
              : []
          }
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
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                執行廠商（預設，可留空）
              </span>
              <input
                value={draft.outsourceTarget}
                onChange={(e) => onChange("outsourceTarget", e.target.value)}
                placeholder="例如：星澄輸出"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <AssignmentStatusField
              value={draft.status}
              onChange={(value) => onChange("status", value)}
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
                value={draft.note}
                onChange={(e) => onChange("note", e.target.value)}
                placeholder="補充設計需求、排版重點與執行說明"
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 xl:col-span-1">
              <span className="text-sm font-medium text-slate-700">
                補充註記
              </span>
              <input
                value={draft.structureRequired}
                onChange={(e) => onChange("structureRequired", e.target.value)}
                placeholder="例如：需注意現場結構限制"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actions.onSave}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              儲存設計交辦
            </button>
            <button
              type="button"
              onClick={actions.onCancel}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
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
}: {
  title: string;
  draft: ProcurementAssignmentDraft;
  saved?: ProcurementAssignmentDraft;
  isEditing: boolean;
  onChange: (key: keyof ProcurementAssignmentDraft, value: string) => void;
  actions: FormActions;
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
            saved.assignee ? `負責人：${saved.assignee}` : null,
          ].filter((item): item is string => Boolean(item))}
          fields={[
            { label: "來源項目 / 次項目", value: title },
            { label: "項目", value: saved.item || "未填寫" },
            { label: "尺寸", value: saved.size || "未填寫" },
            { label: "材質", value: saved.material || "未填寫" },
            { label: "數量", value: saved.quantity || "未填寫" },
            { label: "需求說明", value: saved.note || "未填寫" },
            { label: "參考連結", value: saved.styleUrl || "未填寫" },
            { label: "負責人", value: saved.assignee || "未指定" },
            { label: "狀態", value: saved.status || "未填寫" },
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
            <AssignmentStatusField
              value={draft.status}
              onChange={(value) => onChange("status", value)}
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
                value={draft.note}
                onChange={(e) => onChange("note", e.target.value)}
                placeholder="補充備品需求、採購條件與使用情境"
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actions.onSave}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              儲存備品交辦
            </button>
            <button
              type="button"
              onClick={actions.onCancel}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
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
}: {
  title: string;
  draft: VendorAssignmentDraft;
  saved?: VendorAssignmentDraft;
  isEditing: boolean;
  onChange: (key: keyof VendorAssignmentDraft, value: string) => void;
  actions: FormActions;
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
            { label: "廠商名稱", value: saved.vendorName || "未填寫" },
            { label: "類別 / 工種", value: saved.category || "未填寫" },
            { label: "需求說明", value: saved.requirement || "未填寫" },
            { label: "規格 / 尺寸", value: saved.specification || "未填寫" },
            {
              label: "參考連結 / 參考資料",
              value: saved.referenceUrl || "未填寫",
            },
            { label: "備註", value: saved.note || "未填寫" },
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
            <AssignmentStatusField
              value={draft.status}
              onChange={(value) => onChange("status", value)}
            />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">項目</span>
              <input
                value={draft.title}
                onChange={(e) => onChange("title", e.target.value)}
                placeholder="例如：接待區背牆木作施作"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                廠商名稱
              </span>
              <input
                value={draft.vendorName}
                onChange={(e) => onChange("vendorName", e.target.value)}
                placeholder="例如：木與光工坊"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
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
            <label className="flex flex-col gap-2 xl:col-span-1">
              <span className="text-sm font-medium text-slate-700">備註</span>
              <textarea
                value={draft.note}
                onChange={(e) => onChange("note", e.target.value)}
                placeholder="補充施作提醒、現場限制或溝通註記"
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actions.onSave}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              儲存廠商交辦
            </button>
            <button
              type="button"
              onClick={actions.onCancel}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
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

export function ExecutionTree({
  items,
  projectId,
  onDesignAssignmentsChange,
  onProcurementAssignmentsChange,
  onVendorAssignmentsChange,
  heading = "新增主項目",
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
}) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [localItems, setLocalItems] = useState<ImportedItem[]>(
    items as ImportedItem[],
  );
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [collapsedAssignmentIds, setCollapsedAssignmentIds] = useState<Record<string, boolean>>({});
  const [editingValue, setEditingValue] = useState("");
  const [activeAssignMenu, setActiveAssignMenu] = useState<string | null>(null);
  const [showMainItemCreator, setShowMainItemCreator] = useState(false);
  const [mainItemDraft, setMainItemDraft] = useState("");
  const [activeDesignFormId, setActiveDesignFormId] = useState<string | null>(
    null,
  );
  const [activeProcurementFormId, setActiveProcurementFormId] = useState<
    string | null
  >(null);
  const [activeVendorFormId, setActiveVendorFormId] = useState<string | null>(
    null,
  );
  const [designAssignmentDrafts, setDesignAssignmentDrafts] = useState<
    Record<string, DesignAssignmentDraft>
  >({});
  const [savedDesignAssignments, setSavedDesignAssignments] = useState<
    Record<string, DesignAssignmentDraft>
  >(() =>
    projectId
      ? readStoredExecutionTreeState(projectId).savedDesignAssignments ?? {}
      : {},
  );
  const [procurementAssignmentDrafts, setProcurementAssignmentDrafts] =
    useState<Record<string, ProcurementAssignmentDraft>>({});
  const [savedProcurementAssignments, setSavedProcurementAssignments] =
    useState<Record<string, ProcurementAssignmentDraft>>(() =>
      projectId
        ? readStoredExecutionTreeState(projectId).savedProcurementAssignments ?? {}
        : {},
    );
  const [vendorAssignmentDrafts, setVendorAssignmentDrafts] = useState<
    Record<string, VendorAssignmentDraft>
  >({});
  const [savedVendorAssignments, setSavedVendorAssignments] = useState<
    Record<string, VendorAssignmentDraft>
  >(() =>
    projectId
      ? readStoredExecutionTreeState(projectId).savedVendorAssignments ?? {}
      : {},
  );
  const [importPreview, setImportPreview] = useState<ParsedExcelImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!projectId || typeof window === "undefined") return;
    window.localStorage.setItem(
      getExecutionTreeStorageKey(projectId),
      JSON.stringify({
        savedDesignAssignments,
        savedProcurementAssignments,
        savedVendorAssignments,
      }),
    );
    notifyProjectWorkflowUpdated(projectId);
  }, [projectId, savedDesignAssignments, savedProcurementAssignments, savedVendorAssignments]);

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
      Object.entries(savedDesignAssignments).map(([targetId, data]) => ({
        targetId,
        title: titleMap.get(targetId) ?? targetId,
        data,
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
      Object.entries(savedProcurementAssignments).map(([targetId, data]) => ({
        targetId,
        title: titleMap.get(targetId) ?? targetId,
        data,
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
      Object.entries(savedVendorAssignments).map(([targetId, data]) => ({
        targetId,
        title: titleMap.get(targetId) ?? targetId,
        data,
      })),
    );
  }, [localItems, onVendorAssignmentsChange, savedVendorAssignments]);

  function updateDraft(itemId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [itemId]: value }));
  }

  function toggleAssignmentCollapse(targetId: string) {
    setCollapsedAssignmentIds((prev) => ({
      ...prev,
      [targetId]: !prev[targetId],
    }));
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
    setActiveDesignFormId(null);
    setActiveProcurementFormId(null);
    setActiveVendorFormId(null);
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

  function openDesignForm(targetId: string) {
    setExpandedItemId(getParentItemId(targetId));
    setActiveDesignFormId(targetId);
    setActiveProcurementFormId(null);
    setActiveVendorFormId(null);
    setActiveAssignMenu(null);
    setDesignAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]:
        prev[targetId] ??
        savedDesignAssignments[targetId] ??
        defaultDesignAssignmentDraft,
    }));
  }
  function openProcurementForm(targetId: string) {
    setExpandedItemId(getParentItemId(targetId));
    setActiveProcurementFormId(targetId);
    setActiveDesignFormId(null);
    setActiveVendorFormId(null);
    setActiveAssignMenu(null);
    setProcurementAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]:
        prev[targetId] ??
        savedProcurementAssignments[targetId] ??
        defaultProcurementAssignmentDraft,
    }));
  }
  function openVendorForm(targetId: string, title: string) {
    setExpandedItemId(getParentItemId(targetId));
    setActiveVendorFormId(targetId);
    setActiveDesignFormId(null);
    setActiveProcurementFormId(null);
    setActiveAssignMenu(null);
    setVendorAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: prev[targetId] ??
        savedVendorAssignments[targetId] ?? {
          ...defaultVendorAssignmentDraft,
          title,
        },
    }));
  }

  function saveDesignAssignment(targetId: string) {
    setSavedDesignAssignments((prev) => ({
      ...prev,
      [targetId]:
        designAssignmentDrafts[targetId] ?? defaultDesignAssignmentDraft,
    }));
    setActiveDesignFormId(null);
  }
  function saveProcurementAssignment(targetId: string) {
    setSavedProcurementAssignments((prev) => ({
      ...prev,
      [targetId]:
        procurementAssignmentDrafts[targetId] ??
        defaultProcurementAssignmentDraft,
    }));
    setActiveProcurementFormId(null);
  }
  function saveVendorAssignment(targetId: string) {
    setSavedVendorAssignments((prev) => ({
      ...prev,
      [targetId]:
        vendorAssignmentDrafts[targetId] ?? defaultVendorAssignmentDraft,
    }));
    setActiveVendorFormId(null);
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
    if (activeDesignFormId === targetId) setActiveDesignFormId(null);
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
    if (activeProcurementFormId === targetId) setActiveProcurementFormId(null);
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
    if (activeVendorFormId === targetId) setActiveVendorFormId(null);
  }

  function addMainItem() {
    const draft = mainItemDraft.trim();
    if (!draft) return;
    const newId = `main-item-${localItems.length + 1}`;
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
    setExpandedItemId(newId);
    setMainItemDraft("");
    setShowMainItemCreator(false);
  }

  async function handleImport(file: File) {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setImportError("只支援 .xlsx 檔案。");
      setImportPreview(null);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("Excel 找不到第一個 sheet。");
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
        header: 1,
        raw: false,
        defval: "",
      });
      const preview = parseExecutionItemsFromExcelRows(rows);
      if (!preview.items.length) {
        throw new Error("沒有解析到可匯入的主項目 / 子項目。");
      }
      setImportPreview(preview);
      setImportError(null);
    } catch (error) {
      setImportPreview(null);
      setImportError(error instanceof Error ? error.message : "Excel 匯入失敗，請確認檔案內容。");
    }
  }

  function confirmImportPreview() {
    if (!importPreview) return;
    setLocalItems(importPreview.items);
    setExpandedItemId(importPreview.items[0]?.id ?? null);
    setImportPreview(null);
    setImportError(null);
  }

  function cancelImportPreview() {
    setImportPreview(null);
    setImportError(null);
  }

  function addChild(itemId: string) {
    const draft = drafts[itemId]?.trim();
    if (!draft) return;
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
  function saveEditingMain(itemId: string) {
    const nextTitle = editingValue.trim();
    if (!nextTitle) return;
    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, title: nextTitle } : item,
      ),
    );
    setEditingMainId(null);
    setEditingValue("");
  }
  function saveEditingChild(childId: string) {
    const nextTitle = editingValue.trim();
    if (!nextTitle) return;
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
    setActiveDesignFormId(null);
    setActiveProcurementFormId(null);
    setActiveVendorFormId(null);
    setActiveAssignMenu((prev) => (prev === targetId ? null : targetId));
  }

  function removeMain(itemId: string) {
    const target = localItems.find((item) => item.id === itemId);
    if (
      !window.confirm(
        `確定要刪除主項目「${target?.title ?? "未命名項目"}」嗎？\n刪除後其底下次項目與交辦資料也會一起移除。`,
      )
    )
      return;
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

  function removeChild(parentId: string, childId: string) {
    const parent = localItems.find((item) => item.id === parentId);
    const target = parent?.children?.find((child) => child.id === childId);
    if (
      !window.confirm(
        `確定要刪除次項目「${target?.title ?? "未命名次項目"}」嗎？`,
      )
    )
      return;
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
              匯入 Excel
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
        {importError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {importError}
          </div>
        ) : null}

        {importPreview ? (
          <div className="mt-4 rounded-3xl border border-sky-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Excel 匯入預覽</p>
                <p className="mt-1 text-sm text-slate-600">已鎖定第一個 sheet，並自動從第 {importPreview.headerRowNumber} 列表頭開始解析；確認後才會覆蓋目前任務樹。</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={confirmImportPreview} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">確認匯入</button>
                <button type="button" onClick={cancelImportPreview} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">取消</button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">主項目</p><p className="mt-2 text-xl font-semibold text-slate-900">{importPreview.mainItems.length}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">延續列</p><p className="mt-2 text-xl font-semibold text-slate-900">{importPreview.continuationRowNumbers.length}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">忽略列</p><p className="mt-2 text-xl font-semibold text-slate-900">{importPreview.ignoredRowNumbers.length}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">解析失敗</p><p className="mt-2 text-xl font-semibold text-slate-900">{importPreview.failedRowNumbers.length}</p></div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">預計匯入樹狀結果</p>
                <div className="mt-3 space-y-3">
                  {importPreview.mainItems.map((mainItem) => (
                    <div key={mainItem.id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-900">{mainItem.title}</p><span className="text-xs text-slate-500">{mainItem.children.length} 個子項目</span></div>
                      <ul className="mt-2 space-y-2 text-sm text-slate-600">
                        {mainItem.children.map((child) => (
                          <li key={child.id} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                            <div className="flex flex-wrap items-center justify-between gap-2"><span>{child.code} {child.title}</span><span className="text-xs text-slate-500">列 {child.rowNumber}</span></div>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>數量 {child.quantity || "-"}</span><span>單位 {child.unit || "-"}</span><span>單價 {child.unitPrice || "-"}</span><span>金額 {child.amount || "-"}</span>
                            </div>
                            {child.continuationRows.length ? <p className="mt-1 text-xs text-amber-700">延續列：{child.continuationRows.join(", ")}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">列判斷摘要</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>延續列：{importPreview.continuationRowNumbers.length ? importPreview.continuationRowNumbers.join(", ") : "無"}</p>
                    <p>忽略列：{importPreview.ignoredRowNumbers.length ? importPreview.ignoredRowNumbers.join(", ") : "無"}</p>
                    <p>解析失敗：{importPreview.failedRowNumbers.length ? importPreview.failedRowNumbers.join(", ") : "無"}</p>
                    <p>停止列：{importPreview.stopRowNumber ?? "未觸發"}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">主項目與子項目數</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {importPreview.mainItems.map((mainItem) => (
                      <div key={`${mainItem.id}-count`} className="flex items-center justify-between gap-3"><span>{mainItem.title}</span><span>{mainItem.children.length} 個子項目</span></div>
                    ))}
                  </div>
                </div>
              </div>
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

      {localItems.map((item, itemIndex) => {
        const isOpen = expandedItemId === item.id;
        const isEditingMain = editingMainId === item.id;
        const showMainDesignForm =
          activeDesignFormId === item.id ||
          Boolean(savedDesignAssignments[item.id]);
        const showMainProcurementForm =
          activeProcurementFormId === item.id ||
          Boolean(savedProcurementAssignments[item.id]);
        const showMainVendorForm =
          activeVendorFormId === item.id ||
          Boolean(savedVendorAssignments[item.id]);
        const hasMainAssignment =
          Boolean(savedDesignAssignments[item.id]) ||
          Boolean(savedProcurementAssignments[item.id]) ||
          Boolean(savedVendorAssignments[item.id]);
        const isMainAssignmentCollapsed = collapsedAssignmentIds[item.id] ?? false;
        return (
          <div
            key={item.id}
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
                      </div>
                      <div className="mt-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                          <div className="flex flex-wrap items-center gap-2">
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
                            {!hasMainAssignment ? (
                              <span className="text-xs text-slate-500">
                                尚未建立交辦
                              </span>
                            ) : null}
                            {hasMainAssignment ? (
                              <button
                                type="button"
                                onClick={() => toggleAssignmentCollapse(item.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                                aria-label={isMainAssignmentCollapsed ? "展開交辦內容" : "收合交辦內容"}
                              >
                                {isMainAssignmentCollapsed ? "›" : "⌄"}
                              </button>
                            ) : null}
                          </div>
                          <span className="text-[11px] text-slate-300">
                            主卡摘要
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <AssignmentMenu
                  targetId={item.id}
                  isActive={activeAssignMenu === item.id}
                  onToggle={toggleAssignMenu}
                  onDesign={() => openDesignForm(item.id)}
                  onProcurement={() => openProcurementForm(item.id)}
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
            {showMainDesignForm && !isMainAssignmentCollapsed ? (
              <DesignAssignmentForm
                title={item.title}
                draft={
                  designAssignmentDrafts[item.id] ??
                  defaultDesignAssignmentDraft
                }
                saved={savedDesignAssignments[item.id]}
                isEditing={activeDesignFormId === item.id}
                onChange={(key, value) =>
                  updateDesignAssignmentDraft(item.id, key, value)
                }
                actions={{
                  onSave: () => saveDesignAssignment(item.id),
                  onCancel: () => setActiveDesignFormId(null),
                  onEdit: () => openDesignForm(item.id),
                  onDelete: () => removeDesignAssignment(item.id),
                }}
              />
            ) : null}
            {showMainProcurementForm && !isMainAssignmentCollapsed ? (
              <ProcurementAssignmentForm
                title={item.title}
                draft={
                  procurementAssignmentDrafts[item.id] ??
                  defaultProcurementAssignmentDraft
                }
                saved={savedProcurementAssignments[item.id]}
                isEditing={activeProcurementFormId === item.id}
                onChange={(key, value) =>
                  updateProcurementAssignmentDraft(item.id, key, value)
                }
                actions={{
                  onSave: () => saveProcurementAssignment(item.id),
                  onCancel: () => setActiveProcurementFormId(null),
                  onEdit: () => openProcurementForm(item.id),
                  onDelete: () => removeProcurementAssignment(item.id),
                }}
              />
            ) : null}
            {showMainVendorForm && !isMainAssignmentCollapsed ? (
              <VendorAssignmentForm
                title={item.title}
                draft={
                  vendorAssignmentDrafts[item.id] ?? {
                    ...defaultVendorAssignmentDraft,
                    title: item.title,
                  }
                }
                saved={savedVendorAssignments[item.id]}
                isEditing={activeVendorFormId === item.id}
                onChange={(key, value) =>
                  updateVendorAssignmentDraft(item.id, key, value)
                }
                actions={{
                  onSave: () => saveVendorAssignment(item.id),
                  onCancel: () => setActiveVendorFormId(null),
                  onEdit: () => openVendorForm(item.id, item.title),
                  onDelete: () => removeVendorAssignment(item.id),
                }}
              />
            ) : null}

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
                    const showChildDesignForm =
                      activeDesignFormId === child.id ||
                      Boolean(savedDesignAssignments[child.id]);
                    const showChildProcurementForm =
                      activeProcurementFormId === child.id ||
                      Boolean(savedProcurementAssignments[child.id]);
                    const showChildVendorForm =
                      activeVendorFormId === child.id ||
                      Boolean(savedVendorAssignments[child.id]);
                    const hasChildAssignment =
                      Boolean(savedDesignAssignments[child.id]) ||
                      Boolean(savedProcurementAssignments[child.id]) ||
                      Boolean(savedVendorAssignments[child.id]);
                    const isChildAssignmentCollapsed = collapsedAssignmentIds[child.id] ?? false;
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
                                <h5 className="mt-2.5 font-medium text-slate-900">
                                  {child.title}
                                </h5>
                                <div className="mt-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-2">
                                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                                    <div className="flex flex-wrap items-center gap-2">
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
                                      {!hasChildAssignment ? (
                                        <span className="text-xs text-slate-500">
                                          尚未建立交辦
                                        </span>
                                      ) : null}
                                      {hasChildAssignment ? (
                                        <button
                                          type="button"
                                          onClick={() => toggleAssignmentCollapse(child.id)}
                                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                                          aria-label={isChildAssignmentCollapsed ? "展開交辦內容" : "收合交辦內容"}
                                        >
                                          {isChildAssignmentCollapsed ? "›" : "⌄"}
                                        </button>
                                      ) : null}
                                    </div>
                                    <span className="text-[11px] text-slate-300">
                                      附屬摘要
                                    </span>
                                  </div>
                                </div>
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
                              onDesign={() => openDesignForm(child.id)}
                              onProcurement={() =>
                                openProcurementForm(child.id)
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
                        {showChildDesignForm && !isChildAssignmentCollapsed ? (
                          <DesignAssignmentForm
                            title={child.title}
                            draft={
                              designAssignmentDrafts[child.id] ??
                              defaultDesignAssignmentDraft
                            }
                            saved={savedDesignAssignments[child.id]}
                            isEditing={activeDesignFormId === child.id}
                            onChange={(key, value) =>
                              updateDesignAssignmentDraft(child.id, key, value)
                            }
                            actions={{
                              onSave: () => saveDesignAssignment(child.id),
                              onCancel: () => setActiveDesignFormId(null),
                              onEdit: () => openDesignForm(child.id),
                              onDelete: () => removeDesignAssignment(child.id),
                            }}
                          />
                        ) : null}
                        {showChildProcurementForm && !isChildAssignmentCollapsed ? (
                          <ProcurementAssignmentForm
                            title={child.title}
                            draft={
                              procurementAssignmentDrafts[child.id] ??
                              defaultProcurementAssignmentDraft
                            }
                            saved={savedProcurementAssignments[child.id]}
                            isEditing={activeProcurementFormId === child.id}
                            onChange={(key, value) =>
                              updateProcurementAssignmentDraft(
                                child.id,
                                key,
                                value,
                              )
                            }
                            actions={{
                              onSave: () => saveProcurementAssignment(child.id),
                              onCancel: () => setActiveProcurementFormId(null),
                              onEdit: () => openProcurementForm(child.id),
                              onDelete: () =>
                                removeProcurementAssignment(child.id),
                            }}
                          />
                        ) : null}
                        {showChildVendorForm && !isChildAssignmentCollapsed ? (
                          <VendorAssignmentForm
                            title={child.title}
                            draft={
                              vendorAssignmentDrafts[child.id] ?? {
                                ...defaultVendorAssignmentDraft,
                                title: child.title,
                              }
                            }
                            saved={savedVendorAssignments[child.id]}
                            isEditing={activeVendorFormId === child.id}
                            onChange={(key, value) =>
                              updateVendorAssignmentDraft(child.id, key, value)
                            }
                            actions={{
                              onSave: () => saveVendorAssignment(child.id),
                              onCancel: () => setActiveVendorFormId(null),
                              onEdit: () =>
                                openVendorForm(child.id, child.title),
                              onDelete: () => removeVendorAssignment(child.id),
                            }}
                          />
                        ) : null}
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
