"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProjectExecutionItem, getStatusClass } from "@/components/project-data";

type ImportedItem = ProjectExecutionItem;

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
}: {
  projectId: string;
  items: ProjectExecutionItem[];
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function toggleItem(itemId: string) {
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function updateDraft(itemId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [itemId]: value }));
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

  function AssignmentMenu({ targetId, title }: { targetId: string; title: string }) {
    const isActive = activeAssignMenu === targetId;

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
            <Link
              href={`/design-tasks/new?projectId=${projectId}&itemId=${targetId}&itemTitle=${encodeURIComponent(title)}`}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
            >
              設計
            </Link>
            <Link
              href={`/procurement-tasks/new?projectId=${projectId}&itemId=${targetId}&itemTitle=${encodeURIComponent(title)}`}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              備品
            </Link>
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

            {isOpen ? (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-600">{item.detail}</p>
                {item.note ? <p className="mb-3 text-sm text-slate-500">備註：{item.note}</p> : null}

                <div className="space-y-3 border-l border-slate-200 pl-4 md:pl-6">
                  {(item.children ?? []).map((child) => {
                    const isEditingChild = editingChildId === child.id;
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
