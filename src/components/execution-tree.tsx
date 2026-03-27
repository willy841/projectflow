"use client";

import Link from "next/link";
import { useState } from "react";
import { ProjectExecutionItem, getStatusClass } from "@/components/project-data";

export function ExecutionTree({
  projectId,
  items,
}: {
  projectId: string;
  items: ProjectExecutionItem[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((item) => [item.id, true]))
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [localItems, setLocalItems] = useState(items);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [activeAssignMenu, setActiveAssignMenu] = useState<string | null>(null);

  function toggleItem(itemId: string) {
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function updateDraft(itemId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [itemId]: value }));
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

  function startEditing(childId: string, currentTitle: string) {
    setEditingChildId(childId);
    setEditingValue(currentTitle);
  }

  function saveEditing(childId: string) {
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
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          交辦
        </button>

        {isActive ? (
          <div className="absolute right-0 z-10 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <Link
              href={`/design-tasks/new?projectId=${projectId}&itemId=${targetId}&itemTitle=${encodeURIComponent(title)}`}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
            >
              交辦給設計
            </Link>
            <Link
              href={`/procurement-tasks/new?projectId=${projectId}&itemId=${targetId}&itemTitle=${encodeURIComponent(title)}`}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              交辦給備品
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localItems.map((item) => {
        const isOpen = expanded[item.id];
        return (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    {isOpen ? "−" : "+"}
                  </button>
                  <p className="text-xs font-semibold text-blue-600">{item.category}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: true }))}
                    className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    + 新增次項目
                  </button>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  {item.referenceExample ? <span>參考範例：{item.referenceExample}</span> : null}
                  <span>設計交辦：{item.designTaskCount ?? 0}</span>
                  <span>備品交辦：{item.procurementTaskCount ?? 0}</span>
                  <span>次項目：{item.children?.length ?? 0}</span>
                </div>
              </div>

              <div className="grid w-full gap-2 sm:w-auto">
                <AssignmentMenu targetId={item.id} title={item.title} />
              </div>
            </div>

            {isOpen ? (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="space-y-3 border-l border-slate-200 pl-4 md:pl-6">
                  {(item.children ?? []).map((child) => {
                    const isEditing = editingChildId === child.id;
                    return (
                      <div
                        key={child.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                                <input
                                  value={editingValue}
                                  onChange={(event) => setEditingValue(event.target.value)}
                                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveEditing(child.id)}
                                    className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                  >
                                    儲存
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingChildId(null);
                                      setEditingValue("");
                                    }}
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap items-center gap-3">
                                  <h5 className="font-medium text-slate-900">{child.title}</h5>
                                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(child.status)}`}>
                                    {child.status}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                  類型：{child.category} {child.assignee ? `・負責：${child.assignee}` : ""}
                                </p>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <AssignmentMenu targetId={child.id} title={child.title} />
                            <button
                              type="button"
                              onClick={() => startEditing(child.id, child.title)}
                              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              編輯
                            </button>
                            <button
                              type="button"
                              onClick={() => removeChild(item.id, child.id)}
                              className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
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
                        className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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
