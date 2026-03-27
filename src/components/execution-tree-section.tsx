"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DesignAssignmentDraft,
  ExecutionTree,
  ProcurementAssignmentDraft,
  VendorAssignmentDraft,
} from "@/components/execution-tree";
import { Project, getStatusClass } from "@/components/project-data";

export function ExecutionTreeSection({ project }: { project: Project }) {
  const [designAssignments, setDesignAssignments] = useState<
    Array<{ targetId: string; title: string; data: DesignAssignmentDraft }>
  >([]);
  const [procurementAssignments, setProcurementAssignments] = useState<
    Array<{ targetId: string; title: string; data: ProcurementAssignmentDraft }>
  >([]);
  const [vendorAssignments, setVendorAssignments] = useState<
    Array<{ targetId: string; title: string; data: VendorAssignmentDraft }>
  >([]);

  return (
    <>
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">專案執行項目</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">改成樹狀子項目操作，可直接展開、收合，並在項目底下新增子項目。</p>
          </div>
        </div>

        <ExecutionTree
          items={project.executionItems}
          onDesignAssignmentsChange={setDesignAssignments}
          onProcurementAssignmentsChange={setProcurementAssignments}
          onVendorAssignmentsChange={setVendorAssignments}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold">專案設計</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">顯示此專案目前已建立的設計交辦與既有設計任務。</p>
            </div>
            <Link href="/design-tasks" className="text-sm font-medium text-slate-700 hover:text-blue-600">查看全部</Link>
          </div>

          <div className="space-y-3">
            {designAssignments.map((assignment) => (
              <div key={assignment.targetId} className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{assignment.title}</h4>
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">新設計交辦</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    {assignment.data.size ? <span>尺寸：{assignment.data.size}</span> : null}
                    {assignment.data.material ? <span>材質：{assignment.data.material}</span> : null}
                    {assignment.data.quantity ? <span>數量：{assignment.data.quantity}</span> : null}
                    <span>結構圖：{assignment.data.structureRequired}</span>
                  </div>
                  {assignment.data.referenceUrl ? <p className="text-sm text-slate-500">參考連結：{assignment.data.referenceUrl}</p> : null}
                  {assignment.data.note ? <p className="text-sm text-slate-500">備註：{assignment.data.note}</p> : null}
                </div>
              </div>
            ))}

            {project.designTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">負責人：{task.assignee}</p>
                    <p className="mt-1 text-sm text-slate-500">期限：{task.due}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">專案備品</h3>
              <p className="mt-1 text-sm text-slate-500">顯示此專案目前已建立的備品交辦與採購項目。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增備品項目</button>
          </div>

          <div className="space-y-3">
            {procurementAssignments.map((assignment) => (
              <div key={assignment.targetId} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{assignment.title}</h4>
                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">新備品交辦</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    {assignment.data.item ? <span>項目：{assignment.data.item}</span> : null}
                    {assignment.data.quantity ? <span>數量：{assignment.data.quantity}</span> : null}
                    {assignment.data.budget ? <span>預算：{assignment.data.budget}</span> : null}
                  </div>
                  {assignment.data.styleUrl ? <p className="text-sm text-slate-500">樣式 URL：{assignment.data.styleUrl}</p> : null}
                </div>
              </div>
            ))}

            {project.procurementTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">採購：{task.buyer}</p>
                    <p className="mt-1 text-sm text-slate-500">預算：{task.budget}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">專案廠商</h3>
              <p className="mt-1 text-sm text-slate-500">顯示此專案目前已建立的廠商交辦。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增廠商項目</button>
          </div>

          <div className="space-y-3">
            {vendorAssignments.map((assignment) => (
              <div key={assignment.targetId} className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{assignment.title}</h4>
                    <span className="inline-flex items-center justify-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">新廠商交辦</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    {assignment.data.title ? <span>交辦名稱：{assignment.data.title}</span> : null}
                    {assignment.data.vendorName ? <span>廠商名稱：{assignment.data.vendorName}</span> : null}
                    {assignment.data.budget ? <span>預算 / 報價：{assignment.data.budget}</span> : null}
                  </div>
                  {assignment.data.referenceUrl ? <p className="text-sm text-slate-500">參考連結：{assignment.data.referenceUrl}</p> : null}
                  {assignment.data.note ? <p className="text-sm text-slate-500">需求 / 備註：{assignment.data.note}</p> : null}
                </div>
              </div>
            ))}

            {!vendorAssignments.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                目前尚未建立廠商交辦。
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </>
  );
}
