"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProjectExecutionItem, getStatusClass } from "@/components/project-data";

export type DesignAssignmentDraft = {
  size: string;
  material: string;
  quantity: string;
  referenceUrl: string;
  structureRequired: string;
  note: string;
};

export type ProcurementAssignmentDraft = {
  item: string;
  quantity: string;
  budget: string;
  styleUrl: string;
};

type ImportedItem = ProjectExecutionItem;

const defaultDesignAssignmentDraft: DesignAssignmentDraft = {
  size: "",
  material: "",
  quantity: "",
  referenceUrl: "",
  structureRequired: "需要",
  note: "",
};

const defaultProcurementAssignmentDraft: ProcurementAssignmentDraft = {
  item: "",
  quantity: "",
  budget: "",
  styleUrl: "",
};

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
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);
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
        {
          id: `${currentMain.id}-child-${childMatch[1]}-${childMatch[2]}-${rowIndex}`,
          title,
          status: "待交辦",
          category: currentMain.category,
          assignee: "未指派",
          quantity,
          unit,
          amount,
          note,
        },
      ];
      return;
    }

    if (mainMatch) {
      const title = titleRaw || mainMatch[2] || codeRaw;
      currentMain = {
        id: `import-main-${mainMatch[1]}-${rowIndex}`,
        title,
        status: "待交辦",
        category: "專案",
        detail: note || "匯入自 CSV 的主項目",
        referenceExample: "",
        designTaskCount: 0,
        procurementTaskCount: 0,
        quantity,
        unit,
        amount,
        note,
        children: [],
      };
      result.push(currentMain);
      return;
    }

    currentMain = {
      id: `import-main-generic-${rowIndex}`,
      title: titleRaw || codeRaw,
      status: "待交辦",
      category: "專案",
      detail: note || "匯入自 CSV 的主項目",
      referenceExample: "",
      designTaskCount: 0,
      procurementTaskCount: 0,
      quantity,
      unit,
      amount,
      note,
      children: [],
    };
    result.push(currentMain);
  });

  return result;
}

export function ExecutionTree({
  projectId,
  items,
  onDesignAssignmentsChange,
  onProcurementAssignmentsChange,
}: {
  projectId: string;
  items: ProjectExecutionItem[];
  onDesignAssignmentsChange?: (payload: Array<{ targetId: string; title: string; data: DesignAssignmentDraft }>) => void;
  onProcurementAssignmentsChange?: (payload: Array<{ targetId: string; title: string; data: ProcurementAssignmentDraft }>) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((item) => [item.id, false]))
  );
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
  const [designAssignmentDrafts, setDesignAssignmentDrafts] = useState<Record<string, DesignAssignmentDraft>>({});
  const [savedDesignAssignments, setSavedDesignAssignments] = useState<Record<string, DesignAssignmentDraft>>({});
  const [procurementAssignmentDrafts, setProcurementAssignmentDrafts] = useState<Record<string, ProcurementAssignmentDraft>>({});
  const [savedProcurementAssignments, setSavedProcurementAssignments] = useState<Record<string, ProcurementAssignmentDraft>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!onDesignAssignmentsChange) return;

    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) => {
        titleMap.set(child.id, child.title);
      });
    });

    const payload = Object.entries(savedDesignAssignments).map(([targetId, data]) => ({
      targetId,
      title: titleMap.get(targetId) ?? targetId,
      data,
    }));

    onDesignAssignmentsChange(payload);
  }, [localItems, onDesignAssignmentsChange, savedDesignAssignments]);

  useEffect(() => {
    if (!onProcurementAssignmentsChange) return;

    const titleMap = new Map<string, string>();
    localItems.forEach((item) => {
      titleMap.set(item.id, item.title);
      (item.children ?? []).forEach((child) => {
        titleMap.set(child.id, child.title);
      });
    });

    const payload = Object.entries(savedProcurementAssignments).map(([targetId, data]) => ({
      targetId,
      title: titleMap.get(targetId) ?? targetId,
      data,
    }));

    onProcurementAssignmentsChange(payload);
  }, [localItems, onProcurementAssignmentsChange, savedProcurementAssignments]);

  function toggleItem(itemId: string) {
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function updateDraft(itemId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [itemId]: value }));
  }

  function updateDesignAssignmentDraft(
    targetId: string,
    key: keyof DesignAssignmentDraft,
    value: string
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
    value: string
  ) {
    setProcurementAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] ?? defaultProcurementAssignmentDraft),
        [key]: value,
      },
    }));
  }

  function openDesignForm(targetId: string) {
    setActiveDesignFormId(targetId);
    setActiveProcurementFormId(null);
    setActiveAssignMenu(null);
    setDesignAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: prev[targetId] ?? savedDesignAssignments[targetId] ?? defaultDesignAssignmentDraft,
    }));
  }

  function openProcurementForm(targetId: string) {
    setActiveProcurementFormId(targetId);
    setActiveDesignFormId(null);
    setActiveAssignMenu(null);
    setProcurementAssignmentDrafts((prev) => ({
      ...prev,
      [targetId]: prev[targetId] ?? savedProcurementAssignments[targetId] ?? defaultProcurementAssignmentDraft,
    }));
  }

  function saveDesignAssignment(targetId: string) {
    const draft = designAssignmentDrafts[targetId] ?? defaultDesignAssignmentDraft;
    setSavedDesignAssignments((prev) => ({ ...prev, [targetId]: draft }));
    setActiveDesignFormId(null);
  }

  function saveProcurementAssignment(targetId: string) {
    const draft = procurementAssignmentDrafts[targetId] ?? defaultProcurementAssignmentDraft;
    setSavedProcurementAssignments((prev) => ({ ...prev, [targetId]: draft }));
    setActiveProcurementFormId(null);
  }

  function addMainItem() {
    const draft = mainItemDraft.trim();
    if (!draft) return;

    const nextIndex = localItems.length + 1;
    const newId = `main-item-${nextIndex}`;

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

    setLocalItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextIndex = (item.children?.length ?? 0) + 1;
        return {
          ...item,
          children: [
            ...(item.children ?? []),
            {
              id: `${item.id}-new-${nextIndex}`,
              title: draft,
              status: "待交辦",
              assignee: "未指派",
              category: item.category,
            },
          ],
        };
      })
    );

    setDrafts((prev) => ({ ...prev, [itemId]: "" }));
    setExpanded((prev) => ({ ...prev, [itemId]: true }));
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
      prev.map((item) => (item.id === itemId ? { ...item, title: nextTitle } : item))
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
          child.id === childId ? { ...child, title: nextTitle } : child
        ),
      }))
    );

    setEditingChildId(null);
    setEditingValue("");
  }

  function removeMain(itemId: string) {
    setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
    setExpanded((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
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
    if (editingMainId === itemId) {
      setEditingMainId(null);
      setEditingValue("");
    }
  }

  function removeChild(parentId: string, childId: string) {
    setLocalItems((prev) =>
      prev.map((item) => {
        if (item.id !== parentId) return item;
        return {
          ...item,
          children: (item.children ?? []).filter((child) => child.id !== childId),
        };
      })
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

    if (editingChildId === childId) {
      setEditingChildId(null);
      setEditingValue("");
    }
  }

  function cancelEditing() {
    setEditingMainId(null);
    setEditingChildId(null);
    setEditingValue("");
  }

  function toggleAssignMenu(targetId: string) {
    setActiveAssignMenu((prev) => (prev === targetId ? null : targetId));
  }

  function InlineDesignForm({ targetId, title }: { targetId: string; title: string }) {
    const draft = designAssignmentDrafts[targetId] ?? defaultDesignAssignmentDraft;
    const saved = savedDesignAssignments[targetId];
    const isEditing = activeDesignFormId === targetId;

    return (
      <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-blue-700">設計交辦</p>
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
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-blue-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">已儲存的設計交辦內容</p>
              <button
                type="button"
                onClick={() => openDesignForm(targetId)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                編輯設計交辦
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              {saved.size ? <span>尺寸：{saved.size}</span> : null}
              {saved.material ? <span>材質：{saved.material}</span> : null}
              {saved.quantity ? <span>數量：{saved.quantity}</span> : null}
              <span>結構圖：{saved.structureRequired}</span>
            </div>
            {saved.referenceUrl ? <p className="mt-2 text-sm text-slate-600">參考連結：{saved.referenceUrl}</p> : null}
            {saved.note ? <p className="mt-2 text-sm text-slate-600">備註：{saved.note}</p> : null}
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">尺寸</span>
                <input
                  value={draft.size}
                  onChange={(event) => updateDesignAssignmentDraft(targetId, "size", event.target.value)}
                  placeholder="例如：W240 x H300 cm"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">材質</span>
                <input
                  value={draft.material}
                  onChange={(event) => updateDesignAssignmentDraft(targetId, "material", event.target.value)}
                  placeholder="例如：珍珠板＋輸出"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">數量</span>
                <input
                  value={draft.quantity}
                  onChange={(event) => updateDesignAssignmentDraft(targetId, "quantity", event.target.value)}
                  placeholder="例如：1 式"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
                <span className="text-sm font-medium text-slate-700">參考連結</span>
                <input
                  value={draft.referenceUrl}
                  onChange={(event) => updateDesignAssignmentDraft(targetId, "referenceUrl", event.target.value)}
                  placeholder="https://..."
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">是否需結構圖</span>
                <select
                  value={draft.structureRequired}
                  onChange={(event) => updateDesignAssignmentDraft(targetId, "structureRequired", event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-400"
                >
                  <option value="需要">需要</option>
                  <option value="不需要">不需要</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
                <span className="text-sm font-medium text-slate-700">備註</span>
                <textarea
                  value={draft.note}
                  onChange={(event) => updateDesignAssignmentDraft(targetId, "note", event.target.value)}
                  placeholder="補充設計需求、印刷提醒或其他說明"
                  className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveDesignAssignment(targetId)}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                儲存設計交辦
              </button>
              <button
                type="button"
                onClick={() => setActiveDesignFormId(null)}
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

  function InlineProcurementForm({ targetId, title }: { targetId: string; title: string }) {
    const draft = procurementAssignmentDrafts[targetId] ?? defaultProcurementAssignmentDraft;
    const saved = savedProcurementAssignments[targetId];
    const isEditing = activeProcurementFormId === targetId;

    return (
      <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-amber-700">備品交辦</p>
              {saved ? (
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  已建立
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">來源項目：{title}</p>
          </div>
          <div className="text-xs text-slate-500">同頁輸入，不跳轉頁面</div>
        </div>

        {saved && !isEditing ? (
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-amber-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">已儲存的備品交辦內容</p>
              <button
                type="button"
                onClick={() => openProcurementForm(targetId)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                編輯備品交辦
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              {saved.item ? <span>項目：{saved.item}</span> : null}
              {saved.quantity ? <span>數量：{saved.quantity}</span> : null}
              {saved.budget ? <span>預算：{saved.budget}</span> : null}
            </div>
            {saved.styleUrl ? <p className="mt-2 text-sm text-slate-600">樣式 URL：{saved.styleUrl}</p> : null}
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">項目</span>
                <input
                  value={draft.item}
                  onChange={(event) => updateProcurementAssignmentDraft(targetId, "item", event.target.value)}
                  placeholder="例如：壓克力桌牌"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">數量</span>
                <input
                  value={draft.quantity}
                  onChange={(event) => updateProcurementAssignmentDraft(targetId, "quantity", event.target.value)}
                  placeholder="例如：3 組"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">預算</span>
                <input
                  value={draft.budget}
                  onChange={(event) => updateProcurementAssignmentDraft(targetId, "budget", event.target.value)}
                  placeholder="例如：NT$ 18,000"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-1">
                <span className="text-sm font-medium text-slate-700">樣式 URL</span>
                <input
                  value={draft.styleUrl}
                  onChange={(event) => updateProcurementAssignmentDraft(targetId, "styleUrl", event.target.value)}
                  placeholder="https://..."
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-amber-400"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveProcurementAssignment(targetId)}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
              >
                儲存備品交辦
              </button>
              <button
                type="button"
                onClick={() => setActiveProcurementFormId(null)}
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

  function AssignmentMenu({ targetId, title }: { targetId: string; title: string }) {
    const isActive = activeAssignMenu === targetId;
    const hasSavedDesignAssignment = Boolean(savedDesignAssignments[targetId]);
    const hasSavedProcurementAssignment = Boolean(savedProcurementAssignments[targetId]);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleAssignMenu(targetId)}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          交辦
        </button>

        {isActive ? (
          <div className="absolute right-0 z-10 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => openDesignForm(targetId)}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
            >
              {hasSavedDesignAssignment ? "編輯設計" : "設計"}
            </button>
            <button
              type="button"
              onClick={() => openProcurementForm(targetId)}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-amber-700"
            >
              {hasSavedProcurementAssignment ? "編輯備品" : "備品"}
            </button>
            <Link
              href={`/vendor-tasks/new?projectId=${projectId}&itemId=${targetId}&itemTitle=${encodeURIComponent(title)}`}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              廠商
            </Link>
          </div>
        ) : null}
      </div>
    );
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
            <button
              type="button"
              onClick={() => setShowMainItemCreator((prev) => !prev)}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              + 新增主項目
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              匯入 CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImport(file);
                }
                event.currentTarget.value = "";
              }}
            />
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white p-3 text-xs leading-6 text-slate-500 ring-1 ring-slate-200">
          匯入規則：第一欄若為 <span className="font-semibold text-slate-700">1.</span>、<span className="font-semibold text-slate-700">2.</span> 會建立主項目；若為 <span className="font-semibold text-slate-700">1-1</span>、<span className="font-semibold text-slate-700">2-2</span> 會自動掛到對應主項目底下。其餘欄位會依序帶入名稱、數量、單位、金額、備註。
        </div>

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

      {localItems.map((item) => {
        const isOpen = expanded[item.id];
        const isEditingMain = editingMainId === item.id;
        const showMainDesignForm = activeDesignFormId === item.id || Boolean(savedDesignAssignments[item.id]);
        const showMainProcurementForm = activeProcurementFormId === item.id || Boolean(savedProcurementAssignments[item.id]);
        const hasMainDesignAssignment = Boolean(savedDesignAssignments[item.id]);
        const hasMainProcurementAssignment = Boolean(savedProcurementAssignments[item.id]);

        return (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-base text-slate-700 transition hover:bg-slate-50"
                  aria-label={isOpen ? "收合主項目" : "展開主項目"}
                >
                  {isOpen ? "⌄" : "›"}
                </button>

                <div className="min-w-0 flex-1">
                  {isEditingMain ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
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
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                        <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.children?.length ?? 0} 個次項目
                        </span>
                        {hasMainDesignAssignment ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                            已建立設計交辦
                          </span>
                        ) : null}
                        {hasMainProcurementAssignment ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                            已建立備品交辦
                          </span>
                        ) : null}
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

              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <AssignmentMenu targetId={item.id} title={item.title} />
                <button
                  type="button"
                  onClick={() => startEditingMain(item.id, item.title)}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => removeMain(item.id)}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  刪除
                </button>
              </div>
            </div>

            {showMainDesignForm ? <InlineDesignForm targetId={item.id} title={item.title} /> : null}
            {showMainProcurementForm ? <InlineProcurementForm targetId={item.id} title={item.title} /> : null}

            {isOpen ? (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-600">{item.detail}</p>
                {item.note ? <p className="mb-3 text-sm text-slate-500">備註：{item.note}</p> : null}

                <div className="space-y-3 border-l border-slate-200 pl-4 md:pl-6">
                  {(item.children ?? []).map((child) => {
                    const isEditingChild = editingChildId === child.id;
                    const showChildDesignForm = activeDesignFormId === child.id || Boolean(savedDesignAssignments[child.id]);
                    const showChildProcurementForm = activeProcurementFormId === child.id || Boolean(savedProcurementAssignments[child.id]);
                    const hasChildDesignAssignment = Boolean(savedDesignAssignments[child.id]);
                    const hasChildProcurementAssignment = Boolean(savedProcurementAssignments[child.id]);

                    return (
                      <div
                        key={child.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            {isEditingChild ? (
                              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                                <input
                                  value={editingValue}
                                  onChange={(event) => setEditingValue(event.target.value)}
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
                                <div className="flex flex-wrap items-center gap-3">
                                  <h5 className="font-medium text-slate-900">{child.title}</h5>
                                  <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(child.status)}`}>
                                    {child.status}
                                  </span>
                                  {hasChildDesignAssignment ? (
                                    <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                                      已建立設計交辦
                                    </span>
                                  ) : null}
                                  {hasChildProcurementAssignment ? (
                                    <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                                      已建立備品交辦
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                                  <span>類型：{child.category}</span>
                                  {child.assignee ? <span>負責：{child.assignee}</span> : null}
                                  {child.quantity ? <span>數量：{child.quantity}</span> : null}
                                  {child.unit ? <span>單位：{child.unit}</span> : null}
                                  {child.amount ? <span>金額：{child.amount}</span> : null}
                                </div>
                                {child.note ? <p className="mt-1 text-sm text-slate-500">備註：{child.note}</p> : null}
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <AssignmentMenu targetId={child.id} title={child.title} />
                            <button
                              type="button"
                              onClick={() => startEditingChild(child.id, child.title)}
                              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              編輯
                            </button>
                            <button
                              type="button"
                              onClick={() => removeChild(item.id, child.id)}
                              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              刪除
                            </button>
                          </div>
                        </div>

                        {showChildDesignForm ? <InlineDesignForm targetId={child.id} title={child.title} /> : null}
                        {showChildProcurementForm ? <InlineProcurementForm targetId={child.id} title={child.title} /> : null}
                      </div>
                    );
                  })}

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">+ 新增次項目</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={drafts[item.id] ?? ""}
                        onChange={(event) => updateDraft(item.id, event.target.value)}
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
