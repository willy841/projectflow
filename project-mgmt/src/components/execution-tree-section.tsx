"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ProjectTaskSummaryList,
  type ProjectTaskSummaryItem,
} from "@/components/project-task-summary-list";
import {
  ExecutionTree,
  DesignAssignmentDraft,
  ProcurementAssignmentDraft,
  VendorAssignmentDraft,
} from "@/components/execution-tree";
import { Project, getStatusClass, type ProjectExecutionSubItem } from "@/components/project-data";
import type { VendorBasicProfile } from "@/components/vendor-data";
import { isUuidLike } from "@/lib/db/project-flow-toggle";

type OpenCategory = "design" | "procurement" | "vendor";

type DesignAssignmentItem = {
  targetId: string;
  title: string;
  data: DesignAssignmentDraft;
  boardPath?: string;
};

type ProcurementAssignmentItem = {
  targetId: string;
  title: string;
  data: ProcurementAssignmentDraft;
  boardPath?: string;
};

export type VendorAssignmentItem = {
  targetId: string;
  title: string;
  data: VendorAssignmentDraft;
  boardPath?: string;
};

function findExecutionTitle(project: Project, targetId: string) {
  for (const item of project.executionItems) {
    if (item.id === targetId) return item.title;
    const child = item.children?.find((entry) => entry.id === targetId);
    if (child) return child.title;
  }
  return targetId;
}

function resolveExecutionTargetId(project: Project, sourceExecutionItemId?: string, fallbackTitle?: string) {
  if (sourceExecutionItemId) {
    for (const item of project.executionItems) {
      if (item.id === sourceExecutionItemId) return item.id;
      const child = item.children?.find((entry) => entry.id === sourceExecutionItemId);
      if (child) return child.id;
    }
  }

  if (fallbackTitle) {
    for (const item of project.executionItems) {
      if (item.title === fallbackTitle) return item.id;
      const child = item.children?.find((entry) => entry.title === fallbackTitle);
      if (child) return child.id;
    }
  }

  return sourceExecutionItemId ?? fallbackTitle ?? null;
}

function buildImportedChild(child: { id: string; title: string; quantity?: string | null; note?: string | null }, category = "專案"): ProjectExecutionSubItem {
  return {
    id: child.id,
    title: child.title,
    status: "待交辦",
    assignee: "未指派",
    category,
    quantity: child.quantity ?? undefined,
    note: child.note ?? undefined,
  };
}

function dedupeProjectTaskSummaryItems(items: ProjectTaskSummaryItem[]) {
  const map = new Map<string, ProjectTaskSummaryItem>();
  items.forEach((item) => {
    map.set(item.summaryKey ?? item.id, item);
  });
  return Array.from(map.values());
}

export function ExecutionTreeSection({ project }: { project: Project }) {
  const isDbProject = isUuidLike(project.id);
  const [designAssignments, setDesignAssignments] = useState<DesignAssignmentItem[]>([]);
  const [procurementAssignments, setProcurementAssignments] = useState<ProcurementAssignmentItem[]>([]);
  const [vendorAssignments, setVendorAssignments] = useState<VendorAssignmentItem[]>([]);
  const [openCategory, setOpenCategory] = useState<OpenCategory>("design");
  const [saveFeedback, setSaveFeedback] = useState<{ category: OpenCategory; message: string } | null>(null);
  const [vendorOptions, setVendorOptions] = useState<VendorBasicProfile[]>([]);

  const initialDesignAssignments = useMemo<Record<string, DesignAssignmentDraft>>(
    () =>
      isDbProject
        ? Object.fromEntries(
            (project.designTasks ?? [])
              .map((task) => ({
                targetId: resolveExecutionTargetId(project, task.sourceExecutionItemId, task.title),
                task,
              }))
              .filter((entry) => entry.targetId)
              .map(({ targetId, task }) => [
                targetId as string,
                {
                  assignee: task.assignee,
                  size: "",
                  material: "",
                  quantity: "",
                  referenceUrl: "",
                  vendorName: task.assignee === '-' ? '' : task.assignee,
                  requirement: task.title,
                },
              ]),
          )
        : {},
    [isDbProject, project.designTasks],
  );

  const initialProcurementAssignments = useMemo<Record<string, ProcurementAssignmentDraft>>(
    () =>
      isDbProject
        ? Object.fromEntries(
            (project.procurementTasks ?? [])
              .map((task) => ({
                targetId: resolveExecutionTargetId(project, task.sourceExecutionItemId, task.title),
                task,
              }))
              .filter((entry) => entry.targetId)
              .map(({ targetId, task }) => [
                targetId as string,
                {
                  assignee: task.buyer,
                  item: task.title,
                  size: "",
                  material: "",
                  quantity: "",
                  styleUrl: "",
                  vendorName: task.buyer === '-' ? '' : task.buyer,
                  requirement: task.title,
                },
              ]),
          )
        : {},
    [isDbProject, project.procurementTasks],
  );

  const initialVendorAssignments = useMemo<Record<string, VendorAssignmentDraft>>(
    () =>
      isDbProject
        ? Object.fromEntries(
            (project.vendorTasks ?? [])
              .map((task) => ({
                targetId: resolveExecutionTargetId(project, task.sourceExecutionItemId, task.title),
                task,
              }))
              .filter((entry) => entry.targetId)
              .map(({ targetId, task }) => [
                targetId as string,
                {
                  assignee: "",
                  category: "其他",
                  title: task.title,
                  vendorName: task.vendorName,
                  requirement: task.title,
                  specification: "",
                  referenceUrl: "",
                  amount: "",
                },
              ]),
          )
        : {},
    [isDbProject, project.vendorTasks],
  );

  const designSummaryList = useMemo<ProjectTaskSummaryItem[]>(() => {
    const fromAssignments = designAssignments.map((assignment) => ({
      id: assignment.targetId,
      summaryKey: assignment.targetId,
      title: assignment.title,
      status: '已建立',
      statusClass: getStatusClass('已完成'),
      href: assignment.boardPath || `/design-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: assignment.boardPath ? "前往設計任務詳情" : "前往設計任務板",
    }));

    const fromLegacyTasks = project.designTasks.map((task, index) => ({
      id: task.id ?? `${task.sourceExecutionItemId ?? task.title}-design-${index}`,
      summaryKey: task.sourceExecutionItemId ?? task.id ?? `${task.title}-${index}`,
      title: task.title,
      status: task.status,
      statusClass: getStatusClass(task.status),
      href: task.id ? `/design-tasks/${task.id}` : `/design-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: task.id ? "前往設計任務詳情" : "前往設計任務板",
    }));

    return dedupeProjectTaskSummaryItems([...fromAssignments, ...fromLegacyTasks]);
  }, [designAssignments, project.designTasks, project.id]);

  const procurementSummaryList = useMemo<ProjectTaskSummaryItem[]>(() => {
    const fromAssignments = procurementAssignments.map((assignment) => ({
      id: assignment.targetId,
      summaryKey: assignment.targetId,
      title: assignment.data.item || assignment.title,
      status: '已建立',
      statusClass: getStatusClass('已完成'),
      href: assignment.boardPath || `/procurement-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: assignment.boardPath ? "前往備品任務詳情" : "前往採購備品板",
    }));

    const fromLegacyTasks = project.procurementTasks.map((task, index) => ({
      id: task.id ?? `${task.sourceExecutionItemId ?? task.title}-procurement-${index}`,
      summaryKey: task.sourceExecutionItemId ?? task.id ?? `${task.title}-${index}`,
      title: task.title,
      status: task.status,
      statusClass: getStatusClass(task.status),
      href: task.id ? `/procurement-tasks/${task.id}` : `/procurement-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: task.id ? "前往備品任務詳情" : "前往採購備品板",
    }));

    return dedupeProjectTaskSummaryItems([...fromAssignments, ...fromLegacyTasks]);
  }, [procurementAssignments, project.procurementTasks, project.id]);

  const vendorSummaryList = useMemo<ProjectTaskSummaryItem[]>(
    () =>
      dedupeProjectTaskSummaryItems([
        ...vendorAssignments.map((assignment) => ({
          id: assignment.targetId,
          summaryKey: assignment.targetId,
          title: assignment.data.title || assignment.title,
          status: '已建立',
          statusClass: getStatusClass('已完成'),
          href: assignment.boardPath || `/vendor-assignments?project=${encodeURIComponent(project.id)}`,
          ctaLabel: assignment.boardPath ? "前往廠商任務詳情" : "前往廠商發包板",
        })),
        ...(project.vendorTasks ?? []).map((task, index) => ({
          id: task.id ?? `${task.sourceExecutionItemId ?? task.title}-vendor-${index}`,
          summaryKey: task.sourceExecutionItemId ?? task.id ?? `${task.title}-${index}`,
          title: task.title,
          status: task.status,
          statusClass: getStatusClass(task.status),
          href: task.id ? `/vendor-assignments/${task.id}` : `/vendor-assignments?project=${encodeURIComponent(project.id)}`,
          ctaLabel: task.id ? "前往廠商任務詳情" : "前往廠商發包板",
        })),
      ]),
    [vendorAssignments, project.id, project.vendorTasks],
  );

  const currentList =
    openCategory === "design"
      ? designSummaryList
      : openCategory === "procurement"
        ? procurementSummaryList
        : vendorSummaryList;

  const categoryMeta = {
    design: {
      title: "專案設計",
      count: designSummaryList.length,
      accent: "text-blue-700",
      ring: "ring-blue-200",
      sectionHint: "",
    },
    procurement: {
      title: "專案備品",
      count: procurementSummaryList.length,
      accent: "text-amber-700",
      ring: "ring-amber-200",
      sectionHint: "",
    },
    vendor: {
      title: "專案廠商",
      count: vendorSummaryList.length,
      accent: "text-violet-700",
      ring: "ring-violet-200",
      sectionHint: "",
    },
  };

  useEffect(() => {
    if (!saveFeedback) return;
    const timer = window.setTimeout(() => setSaveFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [saveFeedback]);

  useEffect(() => {
    if (!isDbProject) return;
    let cancelled = false;
    fetch('/api/vendors')
      .then((response) => response.json())
      .then((result) => {
        if (cancelled) return;
        if (result?.ok && Array.isArray(result.vendors)) {
          setVendorOptions(result.vendors as VendorBasicProfile[]);
        }
      })
      .catch(() => {
        if (!cancelled) setVendorOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isDbProject]);

  const serverHandlers = isDbProject
    ? {
        createExecutionItem: async ({ title, parentId }: { title: string; parentId?: string | null }) => {
          const response = await fetch(`/api/projects/${project.id}/execution-items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, parentId: parentId ?? null }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            throw new Error(result.error || "新增執行項目失敗");
          }
          return {
            parentId: parentId ?? null,
            item: parentId
              ? buildImportedChild(result.item)
              : {
                  id: result.item.id,
                  title: result.item.title,
                  status: "待交辦",
                  category: "專案",
                  detail: result.item.note ?? "待補充執行說明。",
                  quantity: result.item.quantity ?? undefined,
                  note: result.item.note ?? undefined,
                  children: [],
                },
          };
        },
        importExecutionItems: async ({ items }: { items: Array<{ id: string; title: string; children?: Array<{ id: string; title: string }> }> }) => {
          const response = await fetch(`/api/projects/${project.id}/execution-items/import`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((item) => ({
                title: item.title,
                children: (item.children ?? []).map((child) => ({ title: child.title })),
              })),
            }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            throw new Error(result.error || "批次匯入執行項目失敗");
          }
          return { items: result.items as Array<{ id: string; title: string; status: string; category: string; detail: string; children: Array<{ id: string; title: string; status: string; assignee: string; category: string }> }> };
        },
        updateExecutionItem: async ({ itemId, title }: { itemId: string; title: string }) => {
          const response = await fetch(`/api/projects/${project.id}/execution-items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            throw new Error(result.error || "更新執行項目失敗");
          }
          return {
            item: result.item.parent_id
              ? buildImportedChild(result.item)
              : {
                  id: result.item.id,
                  title: result.item.title,
                  status: "待交辦",
                  category: "專案",
                  detail: result.item.note ?? "待補充執行說明。",
                  quantity: result.item.quantity ?? undefined,
                  note: result.item.note ?? undefined,
                  children: [],
                },
          };
        },
        deleteExecutionItem: async ({ itemId }: { itemId: string }) => {
          const response = await fetch(`/api/projects/${project.id}/execution-items/${itemId}`, {
            method: "DELETE",
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            throw new Error(result.error || "刪除執行項目失敗");
          }
          return { deletedId: result.deletedId as string, childIds: result.childIds as string[] | undefined };
        },
        saveDesignAssignment: async ({ targetId, title, draft }: { targetId: string; title: string; draft: DesignAssignmentDraft }) => {
          const response = await fetch(`/api/projects/${project.id}/dispatch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flowType: "design",
              executionItemId: targetId,
              title: title || findExecutionTitle(project, targetId),
              size: draft.size,
              material: draft.material,
              structure: draft.material,
              quantity: draft.quantity,
              referenceUrl: draft.referenceUrl,
              note: draft.requirement,
              vendorName: draft.vendorName,
            }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) throw new Error(result.error || "設計交辦失敗");
          return { boardPath: result.boardPath as string | undefined };
        },
        saveProcurementAssignment: async ({ targetId, title, draft }: { targetId: string; title: string; draft: ProcurementAssignmentDraft }) => {
          const response = await fetch(`/api/projects/${project.id}/dispatch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flowType: "procurement",
              executionItemId: targetId,
              title: draft.item || title || findExecutionTitle(project, targetId),
              quantity: draft.quantity,
              budgetNote: "",
              note: draft.requirement,
              referenceUrl: draft.styleUrl,
              vendorName: draft.vendorName,
            }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) throw new Error(result.error || "備品交辦失敗");
          return { boardPath: result.boardPath as string | undefined };
        },
        saveVendorAssignment: async ({ targetId, title, draft }: { targetId: string; title: string; draft: VendorAssignmentDraft }) => {
          const response = await fetch(`/api/projects/${project.id}/dispatch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flowType: "vendor",
              executionItemId: targetId,
              title: draft.title || title || findExecutionTitle(project, targetId),
              vendorName: draft.vendorName,
              requirement: draft.requirement,
              amount: draft.amount,
            }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) throw new Error(result.error || "廠商交辦失敗");
          return { boardPath: result.boardPath as string | undefined };
        },
      }
    : undefined;

  return (
    <>
      <section id="project-execution-section" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <ExecutionTree
          heading="專案執行項目"
          items={project.executionItems}
          projectId={project.id}
          onDesignAssignmentsChange={setDesignAssignments}
          onProcurementAssignmentsChange={setProcurementAssignments}
          onVendorAssignmentsChange={setVendorAssignments}
          onAssignmentSaved={({ flowType, targetId, boardPath }) => {
            setOpenCategory(flowType);
            if (boardPath) {
              if (flowType === "design") {
                setDesignAssignments((prev) => prev.map((assignment) => assignment.targetId === targetId ? { ...assignment, boardPath } : assignment));
              } else if (flowType === "procurement") {
                setProcurementAssignments((prev) => prev.map((assignment) => assignment.targetId === targetId ? { ...assignment, boardPath } : assignment));
              } else {
                setVendorAssignments((prev) => prev.map((assignment) => assignment.targetId === targetId ? { ...assignment, boardPath } : assignment));
              }
            }
            setSaveFeedback({
              category: flowType,
              message: "已建立，摘要已更新。",
            });
          }}
          initialDesignAssignments={initialDesignAssignments}
          initialProcurementAssignments={initialProcurementAssignments}
          initialVendorAssignments={initialVendorAssignments}
          vendorOptions={vendorOptions}
          serverHandlers={serverHandlers}
        />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">專案分類檢視</h3>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {(["design", "procurement", "vendor"] as OpenCategory[]).map((category) => {
            const meta = categoryMeta[category];
            const isActive = openCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setOpenCategory(category)}
                className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition ${isActive ? `${meta.ring} border-transparent ring-2 shadow-md` : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"}`}
              >
                <div className="flex min-h-[84px] items-center justify-between gap-3">
                  <div className="flex min-h-full flex-1 items-center justify-center text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className={`text-lg font-semibold ${meta.accent}`}>{meta.title}</p>
                      {isActive ? (
                      ) : null}
                    </div>
                  </div>
                  <span className={`inline-flex min-w-[36px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {meta.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-300 bg-slate-100 p-5 shadow-inner">
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-lg font-semibold text-slate-900">{categoryMeta[openCategory].title}</h4>
                <span className="text-sm font-medium text-slate-500">共 {currentList.length} 筆</span>
              </div>
            </div>
          </div>

          {saveFeedback && saveFeedback.category === openCategory ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {saveFeedback.message}
            </div>
          ) : null}

          <div className="space-y-3">
            <ProjectTaskSummaryList items={currentList} />
          </div>
        </div>
      </section>
    </>
  );
}
