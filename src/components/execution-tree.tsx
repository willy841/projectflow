"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectExecutionItem, getStatusClass } from "@/components/project-data";

export type AssignmentStatus = "待處理" | "進行中" | "已完成";

export type AssignmentReply = {
  id: string;
  message: string;
  createdAt: string;
};

export type DesignAssignmentDraft = {
  size: string;
  material: string;
  quantity: string;
  referenceUrl: string;
  structureRequired: string;
  note: string;
  status: AssignmentStatus;
  replies?: AssignmentReply[];
};

export type ProcurementAssignmentDraft = {
  item: string;
  quantity: string;
  budget: string;
  styleUrl: string;
  status: AssignmentStatus;
  replies?: AssignmentReply[];
};

export type VendorAssignmentDraft = {
  category: string;
  title: string;
  vendorName: string;
  requirement: string;
  referenceUrl: string;
  budget: string;
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
  size: "",
  material: "",
  quantity: "",
  referenceUrl: "",
  structureRequired: "需要",
  note: "",
  status: "待處理",
};

const defaultProcurementAssignmentDraft: ProcurementAssignmentDraft = {
  item: "",
  quantity: "",
  budget: "",
  styleUrl: "",
  status: "待處理",
};

const defaultVendorAssignmentDraft: VendorAssignmentDraft = {
  category: "音響",
  title: "",
  vendorName: "",
  requirement: "",
  referenceUrl: "",
  budget: "",
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
  summary,
  extra,
  actions,
}: {
  title: string;
  summary: string[];
  extra?: string[];
  actions: Pick<FormActions, "onEdit" | "onDelete">;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
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
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        {summary.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      {extra?.map((item) => (
        <p key={item} className="mt-2 text-sm text-slate-600">
          {item}
        </p>
      ))}
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
    <div className="mt-4 rounded-3xl border p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">設計交辦</p>
            {saved ? (
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                已建立
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-600">項目：{title}</p>
        </div>
        <div className="text-xs text-slate-500">同頁輸入，不跳轉頁面</div>
      </div>

      {saved && !isEditing ? (
        <SavedSummary
          title="已儲存的設計交辦內容"
          summary={[
            ...(saved.size ? [`尺寸：${saved.size}`] : []),
            ...(saved.material ? [`材質：${saved.material}`] : []),
            ...(saved.quantity ? [`數量：${saved.quantity}`] : []),
            `狀態：${saved.status}`,
            `結構圖：${saved.structureRequired}`,
          ]}
          extra={[
            ...(saved.referenceUrl ? [`參考連結：${saved.referenceUrl}`] : []),
            ...(saved.note ? [`備註：${saved.note}`] : []),
          ]}
          actions={{ onEdit: actions.onEdit, onDelete: actions.onDelete }}
        />
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">尺寸</span>
              <input value={draft.size} onChange={(e) => onChange("size", e.target.value)} placeholder="例如：W240 x H300 cm" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">材質</span>
              <input value={draft.material} onChange={(e) => onChange("material", e.target.value)} placeholder="例如：珍珠板＋輸出" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">數量</span>
              <input value={draft.quantity} onChange={(e) => onChange("quantity", e.target.value)} placeholder="例如：1 式" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
              <span className="text-sm font-medium text-slate-700">參考連結</span>
              <input value={draft.referenceUrl} onChange={(e) => onChange("referenceUrl", e.target.value)} placeholder="https://..." className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">是否需結構圖</span>
              <select value={draft.structureRequired} onChange={(e) => onChange("structureRequired", e.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400">
                <option value="需要">需要</option>
                <option value="不需要">不需要</option>
              </select>
            </label>
            <AssignmentStatusField value={draft.status} onChange={(value) => onChange("status", value)} />
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
              <span className="text-sm font-medium text-slate-700">備註</span>
              <textarea value={draft.note} onChange={(e) => onChange("note", e.target.value)} placeholder="補充設計需求、印刷提醒或其他說明" className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={actions.onSave} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">儲存設計交辦</button>
            <button type="button" onClick={actions.onCancel} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">取消</button>
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
    <div className="mt-4 rounded-3xl border p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">備品交辦</p>
            {saved ? <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">已建立</span> : null}
          </div>
          <p className="mt-1 text-sm text-slate-600">來源項目：{title}</p>
        </div>
        <div className="text-xs text-slate-500">同頁輸入，不跳轉頁面</div>
      </div>

      {saved && !isEditing ? (
        <SavedSummary
          title="已儲存的備品交辦內容"
          summary={[
            ...(saved.item ? [`項目：${saved.item}`] : []),
            ...(saved.quantity ? [`數量：${saved.quantity}`] : []),
            ...(saved.budget ? [`預算：${saved.budget}`] : []),
            `狀態：${saved.status}`,
          ]}
          extra={saved.styleUrl ? [`樣式 URL：${saved.styleUrl}`] : []}
          actions={{ onEdit: actions.onEdit, onDelete: actions.onDelete }}
        />
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">項目</span><input value={draft.item} onChange={(e) => onChange("item", e.target.value)} placeholder="例如：壓克力桌牌" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">數量</span><input value={draft.quantity} onChange={(e) => onChange("quantity", e.target.value)} placeholder="例如：3 組" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">預算</span><input value={draft.budget} onChange={(e) => onChange("budget", e.target.value)} placeholder="例如：NT$ 18,000" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
            <AssignmentStatusField value={draft.status} onChange={(value) => onChange("status", value)} />
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-1"><span className="text-sm font-medium text-slate-700">樣式 URL</span><input value={draft.styleUrl} onChange={(e) => onChange("styleUrl", e.target.value)} placeholder="https://..." className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={actions.onSave} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">儲存備品交辦</button>
            <button type="button" onClick={actions.onCancel} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">取消</button>
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
    <div className="mt-4 rounded-3xl border p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">廠商交辦</p>
            {saved ? <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">已建立</span> : null}
          </div>
          <p className="mt-1 text-sm text-slate-600">來源項目：{title}</p>
        </div>
        <div className="text-xs text-slate-500">同頁輸入，不跳轉頁面</div>
      </div>

      {saved && !isEditing ? (
        <SavedSummary
          title="已儲存的廠商交辦內容"
          summary={[
            `類別：${saved.category}`,
            ...(saved.title ? [`交辦名稱：${saved.title}`] : []),
            ...(saved.vendorName ? [`廠商名稱：${saved.vendorName}`] : []),
            ...(saved.budget ? [`預算 / 報價：${saved.budget}`] : []),
            `狀態：${saved.status}`,
          ]}
          extra={[
            ...(saved.referenceUrl ? [`參考連結：${saved.referenceUrl}`] : []),
            ...(saved.requirement ? [`需求內容：${saved.requirement}`] : []),
          ]}
          actions={{ onEdit: actions.onEdit, onDelete: actions.onDelete }}
        />
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">廠商類別</span><select value={draft.category} onChange={(e) => onChange("category", e.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"><option value="音響">音響</option><option value="燈光">燈光</option><option value="結構">結構</option><option value="印刷">印刷</option><option value="輸出">輸出</option><option value="租借">租借</option><option value="人員">人員</option><option value="其他">其他</option></select></label>
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">交辦名稱</span><input value={draft.title} onChange={(e) => onChange("title", e.target.value)} placeholder="例如：接待區背牆木作施作" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">廠商名稱</span><input value={draft.vendorName} onChange={(e) => onChange("vendorName", e.target.value)} placeholder="例如：木與光工坊" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">預算 / 報價</span><input value={draft.budget} onChange={(e) => onChange("budget", e.target.value)} placeholder="例如：NT$ 120,000" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2"><span className="text-sm font-medium text-slate-700">參考連結</span><input value={draft.referenceUrl} onChange={(e) => onChange("referenceUrl", e.target.value)} placeholder="https://..." className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /></label>
            <AssignmentStatusField value={draft.status} onChange={(value) => onChange("status", value)} />
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3"><span className="text-sm font-medium text-slate-700">需求內容</span><textarea value={draft.requirement} onChange={(e) => onChange("requirement", e.target.value)} placeholder="例如：需確認尺寸、結構與施工方式，並回覆報價與時程" className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={actions.onSave} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">儲存廠商交辦</button>
            <button type="button" onClick={actions.onCancel} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">取消</button>
          </div>
        </>
      )}
    </div>
  );
}

function AssignmentMenu({
  targetId,
  title,
  isActive,
  onToggle,
  onDesign,
  onProcurement,
  onVendor,
  hasDesign,
  hasProcurement,
  hasVendor,
}: {
  targetId: string;
  title: string;
  isActive: boolean;
  onToggle: (targetId: string) => void;
  onDesign: () => void;
  onProcurement: () => void;
  onVendor: () => void;
  hasDesign: boolean;
  hasProcurement: boolean;
  hasVendor: boolean;
}) {
  return (
    <div className="relative">
      <button type="button" onClick={() => onToggle(targetId)} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">交辦</button>
      {isActive ? (
        <div className="absolute right-0 z-10 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <button type="button" onClick={onDesign} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600">{hasDesign ? "編輯設計" : "設計"}</button>
          <button type="button" onClick={onProcurement} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-amber-700">{hasProcurement ? "編輯備品" : "備品"}</button>
          <button type="button" onClick={onVendor} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-700">{hasVendor ? "編輯廠商" : "廠商"}</button>
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

function parseCsvText(text: string): string[][] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(parseCsvLine);
}

function normalizeCell(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseImportedRows(rows: string[][]): ImportedItem[] {
  const result: ImportedItem[] = [];
  let currentMain: ImportedItem | null = null;
  rows.forEach((row, rowIndex) => {
    const codeRaw = normalizeCell(row[0]);
    const titleRaw = normalizeCell(row[1] || row[0]);
    const quantity = normalizeCell(row[2]);
    const unit = normalizeCell(row[3]);
    const amount = normalizeCell(row[4]);
    const note = normalizeCell(row[5]);
    if (!codeRaw && !titleRaw) return;
    const mainMatch = codeRaw.match(/^(\d+)\.?\s*(.*)$/);
    const childMatch = codeRaw.match(/^(\d+)-(\d+)\s*(.*)$/);
    if (childMatch && currentMain) {
      const title = titleRaw || childMatch[3] || codeRaw;
      currentMain.children = [
        ...(currentMain.children ?? []),
        { id: `${currentMain.id}-child-${childMatch[1]}-${childMatch[2]}-${rowIndex}`, title, status: "待交辦", category: currentMain.category, assignee: "未指派", quantity, unit, amount, note },
      ];
      return;
    }
    if (mainMatch) {
      const title = titleRaw || mainMatch[2] || codeRaw;
      currentMain = { id: `import-main-${mainMatch[1]}-${rowIndex}`, title, status: "待交辦", category: "專案", detail: note || "匯入自 CSV 的主項目", referenceExample: "", designTaskCount: 0, procurementTaskCount: 0, quantity, unit, amount, note, children: [] };
      result.push(currentMain);
      return;
    }
    currentMain = { id: `import-main-generic-${rowIndex}`, title: titleRaw || codeRaw, status: "待交辦", category: "專案", detail: note || "匯入自 CSV 的主項目", referenceExample: "", designTaskCount: 0, procurementTaskCount: 0, quantity, unit, amount, note, children: [] };
    result.push(currentMain);
  });
  return result;
}

export function ExecutionTree({
  items,
  onDesignAssignmentsChange,
  onProcurementAssignmentsChange,
  onVendorAssignmentsChange,
}: {
  items: ProjectExecutionItem[];
  onDesignAssignmentsChange?: (payload: Array<{ targetId: string; title: string; data: DesignAssignmentDraft }>) => void;
  onProcurementAssignmentsChange?: (payload: Array<{ targetId: string; title: string; data: ProcurementAssignmentDraft }>) => void;
  onVendorAssignmentsChange?: (payload: Array<{ targetId: string; title: string; data: VendorAssignmentDraft }>) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(Object.fromEntries(items.map((item) => [item.id, false])));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [localItems, setLocalItems] = useState<ImportedItem[]>(items as ImportedItem[]);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [activeAssignMenu, setActiveAssignMenu] = useState<string | null>(null);
  const [showMainItemCreator, setShowMainItemCreator] = useState(false);
  const [mainItemDraft, setMainItemDraft] = useState("");
  const [activeDesignFormId, setActiveDesignFormId] = useState<string | null>(null);
  const [activeProcurementFormId, setActiveProcurementFormId] = useState<string | null>(null);
  const [activeVendorFormId, setActiveVendorFormId] = useState<string | null>(null);
  const [designAssignmentDrafts, setDesignAssignmentDrafts] = useState<Record<string, DesignAssignmentDraft>>({});
  const [savedDesignAssignments, setSavedDesignAssignments] = useState<Record<string, DesignAssignmentDraft>>({});
  const [procurementAssignmentDrafts, setProcurementAssignmentDrafts] = useState<Record<string, ProcurementAssignmentDraft>>({});
  const [savedProcurementAssignments, setSavedProcurementAssignments] = useState<Record<string, ProcurementAssignmentDraft>>({});
  const [vendorAssignmentDrafts, setVendorAssignmentDrafts] = useState<Record<string, VendorAssignmentDraft>>({});
  const [savedVendorAssignments, setSavedVendorAssignments] = useState<Record<string, VendorAssignmentDraft>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!onDesignAssignmentsChange) return;
    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) => titleMap.set(child.id, child.title));
    });
    onDesignAssignmentsChange(Object.entries(savedDesignAssignments).map(([targetId, data]) => ({ targetId, title: titleMap.get(targetId) ?? targetId, data })));
  }, [localItems, onDesignAssignmentsChange, savedDesignAssignments]);

  useEffect(() => {
    if (!onProcurementAssignmentsChange) return;
    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) => titleMap.set(child.id, child.title));
    });
    onProcurementAssignmentsChange(Object.entries(savedProcurementAssignments).map(([targetId, data]) => ({ targetId, title: titleMap.get(targetId) ?? targetId, data })));
  }, [localItems, onProcurementAssignmentsChange, savedProcurementAssignments]);

  useEffect(() => {
    if (!onVendorAssignmentsChange) return;
    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) => titleMap.set(child.id, child.title));
    });
    onVendorAssignmentsChange(Object.entries(savedVendorAssignments).map(([targetId, data]) => ({ targetId, title: titleMap.get(targetId) ?? targetId, data })));
  }, [localItems, onVendorAssignmentsChange, savedVendorAssignments]);

  function updateDraft(itemId: string, value: string) { setDrafts((prev) => ({ ...prev, [itemId]: value })); }
  function toggleItem(itemId: string) { setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] })); }
  function updateDesignAssignmentDraft(targetId: string, key: keyof DesignAssignmentDraft, value: string) { setDesignAssignmentDrafts((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] ?? defaultDesignAssignmentDraft), [key]: value } })); }
  function updateProcurementAssignmentDraft(targetId: string, key: keyof ProcurementAssignmentDraft, value: string) { setProcurementAssignmentDrafts((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] ?? defaultProcurementAssignmentDraft), [key]: value } })); }
  function updateVendorAssignmentDraft(targetId: string, key: keyof VendorAssignmentDraft, value: string) { setVendorAssignmentDrafts((prev) => ({ ...prev, [targetId]: { ...(prev[targetId] ?? defaultVendorAssignmentDraft), [key]: value } })); }

  function openDesignForm(targetId: string) { setActiveDesignFormId(targetId); setActiveProcurementFormId(null); setActiveVendorFormId(null); setActiveAssignMenu(null); setDesignAssignmentDrafts((prev) => ({ ...prev, [targetId]: prev[targetId] ?? savedDesignAssignments[targetId] ?? defaultDesignAssignmentDraft })); }
  function openProcurementForm(targetId: string) { setActiveProcurementFormId(targetId); setActiveDesignFormId(null); setActiveVendorFormId(null); setActiveAssignMenu(null); setProcurementAssignmentDrafts((prev) => ({ ...prev, [targetId]: prev[targetId] ?? savedProcurementAssignments[targetId] ?? defaultProcurementAssignmentDraft })); }
  function openVendorForm(targetId: string, title: string) { setActiveVendorFormId(targetId); setActiveDesignFormId(null); setActiveProcurementFormId(null); setActiveAssignMenu(null); setVendorAssignmentDrafts((prev) => ({ ...prev, [targetId]: prev[targetId] ?? savedVendorAssignments[targetId] ?? { ...defaultVendorAssignmentDraft, title } })); }

  function saveDesignAssignment(targetId: string) { setSavedDesignAssignments((prev) => ({ ...prev, [targetId]: designAssignmentDrafts[targetId] ?? defaultDesignAssignmentDraft })); setActiveDesignFormId(null); }
  function saveProcurementAssignment(targetId: string) { setSavedProcurementAssignments((prev) => ({ ...prev, [targetId]: procurementAssignmentDrafts[targetId] ?? defaultProcurementAssignmentDraft })); setActiveProcurementFormId(null); }
  function saveVendorAssignment(targetId: string) { setSavedVendorAssignments((prev) => ({ ...prev, [targetId]: vendorAssignmentDrafts[targetId] ?? defaultVendorAssignmentDraft })); setActiveVendorFormId(null); }

  function removeDesignAssignment(targetId: string) { if (!window.confirm("確定要刪除這筆設計交辦嗎？")) return; setSavedDesignAssignments((prev) => { const next = { ...prev }; delete next[targetId]; return next; }); setDesignAssignmentDrafts((prev) => { const next = { ...prev }; delete next[targetId]; return next; }); if (activeDesignFormId === targetId) setActiveDesignFormId(null); }
  function removeProcurementAssignment(targetId: string) { if (!window.confirm("確定要刪除這筆備品交辦嗎？")) return; setSavedProcurementAssignments((prev) => { const next = { ...prev }; delete next[targetId]; return next; }); setProcurementAssignmentDrafts((prev) => { const next = { ...prev }; delete next[targetId]; return next; }); if (activeProcurementFormId === targetId) setActiveProcurementFormId(null); }
  function removeVendorAssignment(targetId: string) { if (!window.confirm("確定要刪除這筆廠商交辦嗎？")) return; setSavedVendorAssignments((prev) => { const next = { ...prev }; delete next[targetId]; return next; }); setVendorAssignmentDrafts((prev) => { const next = { ...prev }; delete next[targetId]; return next; }); if (activeVendorFormId === targetId) setActiveVendorFormId(null); }

  function addMainItem() {
    const draft = mainItemDraft.trim();
    if (!draft) return;
    const newId = `main-item-${localItems.length + 1}`;
    setLocalItems((prev) => [...prev, { id: newId, title: draft, status: "待交辦", category: "專案", detail: "請補充此主項目的需求說明與執行方向。", referenceExample: "", designTaskCount: 0, procurementTaskCount: 0, children: [] }]);
    setExpanded((prev) => ({ ...prev, [newId]: false }));
    setMainItemDraft("");
    setShowMainItemCreator(false);
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const rows = parseCsvText(text);
    if (!rows.length) return;
    const imported = parseImportedRows(rows.slice(1));
    if (!imported.length) return;
    setLocalItems(imported);
    setExpanded(Object.fromEntries(imported.map((item) => [item.id, false])));
  }

  function addChild(itemId: string) {
    const draft = drafts[itemId]?.trim();
    if (!draft) return;
    setLocalItems((prev) => prev.map((item) => item.id !== itemId ? item : { ...item, children: [...(item.children ?? []), { id: `${item.id}-new-${(item.children?.length ?? 0) + 1}`, title: draft, status: "待交辦", assignee: "未指派", category: item.category }] }));
    setDrafts((prev) => ({ ...prev, [itemId]: "" }));
    setExpanded((prev) => ({ ...prev, [itemId]: true }));
  }

  function startEditingMain(itemId: string, currentTitle: string) { setEditingMainId(itemId); setEditingChildId(null); setEditingValue(currentTitle); }
  function startEditingChild(childId: string, currentTitle: string) { setEditingChildId(childId); setEditingMainId(null); setEditingValue(currentTitle); }
  function saveEditingMain(itemId: string) { const nextTitle = editingValue.trim(); if (!nextTitle) return; setLocalItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, title: nextTitle } : item))); setEditingMainId(null); setEditingValue(""); }
  function saveEditingChild(childId: string) { const nextTitle = editingValue.trim(); if (!nextTitle) return; setLocalItems((prev) => prev.map((item) => ({ ...item, children: (item.children ?? []).map((child) => (child.id === childId ? { ...child, title: nextTitle } : child)) }))); setEditingChildId(null); setEditingValue(""); }
  function cancelEditing() { setEditingMainId(null); setEditingChildId(null); setEditingValue(""); }
  function toggleAssignMenu(targetId: string) { setActiveAssignMenu((prev) => (prev === targetId ? null : targetId)); }

  function removeMain(itemId: string) {
    const target = localItems.find((item) => item.id === itemId);
    if (!window.confirm(`確定要刪除主項目「${target?.title ?? "未命名項目"}」嗎？\n刪除後其底下次項目與交辦資料也會一起移除。`)) return;
    setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
    setExpanded((prev) => { const next = { ...prev }; delete next[itemId]; return next; });
    setSavedDesignAssignments((prev) => { const next = { ...prev }; delete next[itemId]; return next; });
    setSavedProcurementAssignments((prev) => { const next = { ...prev }; delete next[itemId]; return next; });
    setSavedVendorAssignments((prev) => { const next = { ...prev }; delete next[itemId]; return next; });
  }

  function removeChild(parentId: string, childId: string) {
    const parent = localItems.find((item) => item.id === parentId);
    const target = parent?.children?.find((child) => child.id === childId);
    if (!window.confirm(`確定要刪除次項目「${target?.title ?? "未命名次項目"}」嗎？`)) return;
    setLocalItems((prev) => prev.map((item) => item.id !== parentId ? item : { ...item, children: (item.children ?? []).filter((child) => child.id !== childId) }));
    setSavedDesignAssignments((prev) => { const next = { ...prev }; delete next[childId]; return next; });
    setSavedProcurementAssignments((prev) => { const next = { ...prev }; delete next[childId]; return next; });
    setSavedVendorAssignments((prev) => { const next = { ...prev }; delete next[childId]; return next; });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">新增主項目</p>
            <p className="mt-1 text-sm text-slate-500">直接在這裡建立第一層主項目，或匯入 CSV 自動展開樹狀結構。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowMainItemCreator((prev) => !prev)} className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">+ 新增主項目</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">匯入 CSV</button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleImport(file); event.currentTarget.value = ""; }} />
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-white p-3 text-xs leading-6 text-slate-500 ring-1 ring-slate-200">匯入規則：第一欄若為 <span className="font-semibold text-slate-700">1.</span>、<span className="font-semibold text-slate-700">2.</span> 會建立主項目；若為 <span className="font-semibold text-slate-700">1-1</span>、<span className="font-semibold text-slate-700">2-2</span> 會自動掛到對應主項目底下。其餘欄位會依序帶入名稱、數量、單位、金額、備註。</div>
        {showMainItemCreator ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input value={mainItemDraft} onChange={(event) => setMainItemDraft(event.target.value)} placeholder="輸入主項目名稱，例如：入口主背板" className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            <div className="flex gap-2"><button type="button" onClick={addMainItem} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">建立</button><button type="button" onClick={() => { setShowMainItemCreator(false); setMainItemDraft(""); }} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">取消</button></div>
          </div>
        ) : null}
      </div>

      {localItems.map((item) => {
        const isOpen = expanded[item.id];
        const isEditingMain = editingMainId === item.id;
        const showMainDesignForm = activeDesignFormId === item.id || Boolean(savedDesignAssignments[item.id]);
        const showMainProcurementForm = activeProcurementFormId === item.id || Boolean(savedProcurementAssignments[item.id]);
        const showMainVendorForm = activeVendorFormId === item.id || Boolean(savedVendorAssignments[item.id]);
        return (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <button type="button" onClick={() => toggleItem(item.id)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-base text-slate-700 transition hover:bg-slate-50" aria-label={isOpen ? "收合主項目" : "展開主項目"}>{isOpen ? "⌄" : "›"}</button>
                <div className="min-w-0 flex-1">
                  {isEditingMain ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                      <div className="flex gap-2"><button type="button" onClick={() => saveEditingMain(item.id)} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">儲存</button><button type="button" onClick={cancelEditing} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">取消</button></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                        <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(item.status)}`}>{item.status}</span>
                        <span className="text-xs text-slate-500">{item.children?.length ?? 0} 個次項目</span>
                        {savedDesignAssignments[item.id] ? <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">已建立設計交辦</span> : null}
                        {savedProcurementAssignments[item.id] ? <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">已建立備品交辦</span> : null}
                        {savedVendorAssignments[item.id] ? <span className="inline-flex items-center justify-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">已建立廠商交辦</span> : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{item.category}</span>
                        {item.referenceExample ? <span>參考範例：{item.referenceExample}</span> : null}
                        <span>設計交辦：{item.designTaskCount ?? 0}</span>
                        <span>備品交辦：{item.procurementTaskCount ?? 0}</span>
                        {item.quantity ? <span>數量：{item.quantity}</span> : null}
                        {item.unit ? <span>單位：{item.unit}</span> : null}
                        {item.amount ? <span>金額：{item.amount}</span> : null}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto"><AssignmentMenu targetId={item.id} title={item.title} isActive={activeAssignMenu === item.id} onToggle={toggleAssignMenu} onDesign={() => openDesignForm(item.id)} onProcurement={() => openProcurementForm(item.id)} onVendor={() => openVendorForm(item.id, item.title)} hasDesign={Boolean(savedDesignAssignments[item.id])} hasProcurement={Boolean(savedProcurementAssignments[item.id])} hasVendor={Boolean(savedVendorAssignments[item.id])} /><button type="button" onClick={() => startEditingMain(item.id, item.title)} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">編輯</button><button type="button" onClick={() => removeMain(item.id)} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">刪除</button></div>
            </div>
            {showMainDesignForm ? <DesignAssignmentForm title={item.title} draft={designAssignmentDrafts[item.id] ?? defaultDesignAssignmentDraft} saved={savedDesignAssignments[item.id]} isEditing={activeDesignFormId === item.id} onChange={(key, value) => updateDesignAssignmentDraft(item.id, key, value)} actions={{ onSave: () => saveDesignAssignment(item.id), onCancel: () => setActiveDesignFormId(null), onEdit: () => openDesignForm(item.id), onDelete: () => removeDesignAssignment(item.id) }} /> : null}
            {showMainProcurementForm ? <ProcurementAssignmentForm title={item.title} draft={procurementAssignmentDrafts[item.id] ?? defaultProcurementAssignmentDraft} saved={savedProcurementAssignments[item.id]} isEditing={activeProcurementFormId === item.id} onChange={(key, value) => updateProcurementAssignmentDraft(item.id, key, value)} actions={{ onSave: () => saveProcurementAssignment(item.id), onCancel: () => setActiveProcurementFormId(null), onEdit: () => openProcurementForm(item.id), onDelete: () => removeProcurementAssignment(item.id) }} /> : null}
            {showMainVendorForm ? <VendorAssignmentForm title={item.title} draft={vendorAssignmentDrafts[item.id] ?? { ...defaultVendorAssignmentDraft, title: item.title }} saved={savedVendorAssignments[item.id]} isEditing={activeVendorFormId === item.id} onChange={(key, value) => updateVendorAssignmentDraft(item.id, key, value)} actions={{ onSave: () => saveVendorAssignment(item.id), onCancel: () => setActiveVendorFormId(null), onEdit: () => openVendorForm(item.id, item.title), onDelete: () => removeVendorAssignment(item.id) }} /> : null}

            {isOpen ? (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-600">{item.detail}</p>
                {item.note ? <p className="mb-3 text-sm text-slate-500">備註：{item.note}</p> : null}
                <div className="space-y-3 border-l border-slate-200 pl-4 md:pl-6">
                  {(item.children ?? []).map((child) => {
                    const isEditingChild = editingChildId === child.id;
                    const showChildDesignForm = activeDesignFormId === child.id || Boolean(savedDesignAssignments[child.id]);
                    const showChildProcurementForm = activeProcurementFormId === child.id || Boolean(savedProcurementAssignments[child.id]);
                    const showChildVendorForm = activeVendorFormId === child.id || Boolean(savedVendorAssignments[child.id]);
                    return (
                      <div key={child.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            {isEditingChild ? (
                              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                                <input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                                <div className="flex gap-2"><button type="button" onClick={() => saveEditingChild(child.id)} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">儲存</button><button type="button" onClick={cancelEditing} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">取消</button></div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap items-center gap-3">
                                  <h5 className="font-medium text-slate-900">{child.title}</h5>
                                  <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(child.status)}`}>{child.status}</span>
                                  {savedDesignAssignments[child.id] ? <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">已建立設計交辦</span> : null}
                                  {savedProcurementAssignments[child.id] ? <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">已建立備品交辦</span> : null}
                                  {savedVendorAssignments[child.id] ? <span className="inline-flex items-center justify-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">已建立廠商交辦</span> : null}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500"><span>類型：{child.category}</span>{child.assignee ? <span>負責：{child.assignee}</span> : null}{child.quantity ? <span>數量：{child.quantity}</span> : null}{child.unit ? <span>單位：{child.unit}</span> : null}{child.amount ? <span>金額：{child.amount}</span> : null}</div>
                                {child.note ? <p className="mt-1 text-sm text-slate-500">備註：{child.note}</p> : null}
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2"><AssignmentMenu targetId={child.id} title={child.title} isActive={activeAssignMenu === child.id} onToggle={toggleAssignMenu} onDesign={() => openDesignForm(child.id)} onProcurement={() => openProcurementForm(child.id)} onVendor={() => openVendorForm(child.id, child.title)} hasDesign={Boolean(savedDesignAssignments[child.id])} hasProcurement={Boolean(savedProcurementAssignments[child.id])} hasVendor={Boolean(savedVendorAssignments[child.id])} /><button type="button" onClick={() => startEditingChild(child.id, child.title)} className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">編輯</button><button type="button" onClick={() => removeChild(item.id, child.id)} className="inline-flex min-h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">刪除</button></div>
                        </div>
                        {showChildDesignForm ? <DesignAssignmentForm title={child.title} draft={designAssignmentDrafts[child.id] ?? defaultDesignAssignmentDraft} saved={savedDesignAssignments[child.id]} isEditing={activeDesignFormId === child.id} onChange={(key, value) => updateDesignAssignmentDraft(child.id, key, value)} actions={{ onSave: () => saveDesignAssignment(child.id), onCancel: () => setActiveDesignFormId(null), onEdit: () => openDesignForm(child.id), onDelete: () => removeDesignAssignment(child.id) }} /> : null}
                        {showChildProcurementForm ? <ProcurementAssignmentForm title={child.title} draft={procurementAssignmentDrafts[child.id] ?? defaultProcurementAssignmentDraft} saved={savedProcurementAssignments[child.id]} isEditing={activeProcurementFormId === child.id} onChange={(key, value) => updateProcurementAssignmentDraft(child.id, key, value)} actions={{ onSave: () => saveProcurementAssignment(child.id), onCancel: () => setActiveProcurementFormId(null), onEdit: () => openProcurementForm(child.id), onDelete: () => removeProcurementAssignment(child.id) }} /> : null}
                        {showChildVendorForm ? <VendorAssignmentForm title={child.title} draft={vendorAssignmentDrafts[child.id] ?? { ...defaultVendorAssignmentDraft, title: child.title }} saved={savedVendorAssignments[child.id]} isEditing={activeVendorFormId === child.id} onChange={(key, value) => updateVendorAssignmentDraft(child.id, key, value)} actions={{ onSave: () => saveVendorAssignment(child.id), onCancel: () => setActiveVendorFormId(null), onEdit: () => openVendorForm(child.id, child.title), onDelete: () => removeVendorAssignment(child.id) }} /> : null}
                      </div>
                    );
                  })}
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">+ 新增次項目</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={drafts[item.id] ?? ""} onChange={(event) => updateDraft(item.id, event.target.value)} placeholder="輸入次項目名稱，例如：主背板燈箱版型" className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" /><button type="button" onClick={() => addChild(item.id)} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">新增</button></div>
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
