"use client";

import { useMemo, useState } from "react";
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
import { Project, getStatusClass } from "@/components/project-data";


type OpenCategory = "design" | "procurement" | "vendor";

type DesignAssignmentItem = {
  targetId: string;
  title: string;
  data: DesignAssignmentDraft;
};

type ProcurementAssignmentItem = {
  targetId: string;
  title: string;
  data: ProcurementAssignmentDraft;
};

export type VendorAssignmentItem = {
  targetId: string;
  title: string;
  data: VendorAssignmentDraft;
};

export function ExecutionTreeSection({ project }: { project: Project }) {
  const [designAssignments, setDesignAssignments] = useState<DesignAssignmentItem[]>([]);
  const [procurementAssignments, setProcurementAssignments] = useState<ProcurementAssignmentItem[]>([]);
  const [vendorAssignments, setVendorAssignments] = useState<VendorAssignmentItem[]>([]);
  const [openCategory, setOpenCategory] = useState<OpenCategory>("design");

  const designSummaryList = useMemo<ProjectTaskSummaryItem[]>(() => {
    const fromAssignments = designAssignments.map((assignment) => ({
      id: assignment.targetId,
      title: assignment.title,
      status: assignment.data.status,
      statusClass: getStatusClass(assignment.data.status),
      href: `/design-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: "前往設計任務板",
    }));

    const fromLegacyTasks = project.designTasks.map((task) => ({
      id: task.title,
      title: task.title,
      status: task.status,
      statusClass: getStatusClass(task.status),
      href: `/design-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: "前往設計任務板",
    }));

    return [...fromAssignments, ...fromLegacyTasks];
  }, [designAssignments, project.designTasks, project.id]);

  const procurementSummaryList = useMemo<ProjectTaskSummaryItem[]>(() => {
    const fromAssignments = procurementAssignments.map((assignment) => ({
      id: assignment.targetId,
      title: assignment.data.item || assignment.title,
      status: assignment.data.status,
      statusClass: getStatusClass(assignment.data.status),
      href: `/procurement-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: "前往採購備品板",
    }));

    const fromLegacyTasks = project.procurementTasks.map((task) => ({
      id: task.title,
      title: task.title,
      status: task.status,
      statusClass: getStatusClass(task.status),
      href: `/procurement-tasks?project=${encodeURIComponent(project.id)}`,
      ctaLabel: "前往採購備品板",
    }));

    return [...fromAssignments, ...fromLegacyTasks];
  }, [procurementAssignments, project.procurementTasks, project.id]);

  const vendorSummaryList = useMemo<ProjectTaskSummaryItem[]>(
    () =>
      vendorAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.data.title || assignment.title,
        status: assignment.data.status,
        statusClass: getStatusClass(assignment.data.status),
        href: `/vendor-assignments?project=${encodeURIComponent(project.id)}`,
        ctaLabel: "前往廠商發包板",
      })),
    [vendorAssignments, project.id],
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
      sectionHint: "已發布任務清單 + 導流，不承擔編輯。",
    },
    procurement: {
      title: "專案備品",
      count: procurementSummaryList.length,
      accent: "text-amber-700",
      ring: "ring-amber-200",
      sectionHint: "已發布任務清單 + 導流，不承擔編輯。",
    },
    vendor: {
      title: "專案廠商",
      count: vendorSummaryList.length,
      accent: "text-violet-700",
      ring: "ring-violet-200",
      sectionHint: "已發布任務清單 + 導流，不承擔編輯。",
    },
  };

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
                        <span className="inline-flex w-fit items-center justify-center rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                          目前檢視
                        </span>
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
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-lg font-semibold text-slate-900">{categoryMeta[openCategory].title}</h4>
                <span className="text-sm font-medium text-slate-500">共 {currentList.length} 筆</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{categoryMeta[openCategory].sectionHint}</p>
            </div>
          </div>

          <div className="space-y-3">
            <ProjectTaskSummaryList items={currentList} />
          </div>
        </div>
      </section>
    </>
  );
}
