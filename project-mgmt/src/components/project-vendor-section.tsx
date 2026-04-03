"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getPackagesByProjectId,
  getVendorDocumentStatusClass,
  vendorPackages,
  type VendorAssignment,
  type VendorPackage,
} from "@/components/vendor-data";
import type { VendorAssignmentItem } from "@/components/execution-tree-section";
import { VendorQuickCreateDialog } from "@/components/vendor-quick-create-dialog";
import { useVendorStore } from "@/components/vendor-store";

type ProjectVendorInfo = {
  name: string;
  eventDate: string;
  location: string;
  loadInTime: string;
};

type PackageMap = Record<string, VendorPackage>;

function mapVendorTaskItemToAssignment(projectId: string, item: VendorAssignmentItem): VendorAssignment {
  return {
    id: item.targetId,
    projectId,
    executionItemId: item.targetId,
    executionItemTitle: item.title,
    title: item.data.title || item.title,
    summary: item.data.requirement || "",
    budget: item.data.amount || "",
    tradeLabel: item.data.category || "",
    selectedVendorName: item.data.vendorName || "",
    status: item.data.status === "已完成" ? "done" : "draft",
    packageId: null,
    replies: (item.data.replies ?? []).map((reply) => ({
      id: reply.id,
      author: "執行者",
      message: reply.message,
      createdAt: reply.createdAt,
    })),
    createdAt: "",
    updatedAt: "",
  };
}

function buildPackageMap(packages: VendorPackage[]): PackageMap {
  return Object.fromEntries(packages.map((pkg) => [pkg.id, pkg]));
}

export function ProjectVendorSection({
  projectId,
  projectInfo,
  visible = true,
  vendorTaskItems = [],
}: {
  projectId: string;
  projectInfo: ProjectVendorInfo;
  visible?: boolean;
  vendorTaskItems?: VendorAssignmentItem[];
}) {
  const { vendors } = useVendorStore();
  const [packages, setPackages] = useState<VendorPackage[]>(() => getPackagesByProjectId(projectId));
  const packageMap = useMemo(() => buildPackageMap(packages), [packages]);
  const [assignments, setAssignments] = useState<VendorAssignment[]>(() =>
    vendorTaskItems.map((item) => mapVendorTaskItemToAssignment(projectId, item))
  );
  const [quickCreateAssignmentId, setQuickCreateAssignmentId] = useState<string | null>(null);
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAssignments((current) => {
      const currentMap = new Map(current.map((assignment) => [assignment.id, assignment]));
      return vendorTaskItems.map((item) => {
        const nextAssignment = mapVendorTaskItemToAssignment(projectId, item);
        const existing = currentMap.get(item.targetId);
        if (!existing) return nextAssignment;
        return {
          ...nextAssignment,
          title: existing.title,
          summary: existing.summary,
          budget: existing.budget,
          tradeLabel: existing.tradeLabel,
          selectedVendorName: existing.selectedVendorName,
          status: existing.status,
          packageId: existing.packageId,
        };
      });
    });
  }, [projectId, vendorTaskItems]);

  function handleAssignmentChange(id: string, patch: Partial<VendorAssignment>) {
    setAssignments((current) => current.map((assignment) => (assignment.id === id ? { ...assignment, ...patch } : assignment)));
    setInlineErrors((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function handleSend(assignment: VendorAssignment) {
    const title = assignment.title.trim();
    const summary = assignment.summary.trim();
    const tradeLabel = assignment.tradeLabel?.trim() || "";
    const selectedVendorName = assignment.selectedVendorName?.trim() || "";

    if (!title || !summary || !tradeLabel || !selectedVendorName || assignment.status === "done") return;

    let nextPackageId = assignment.packageId;

    setPackages((current) => {
      const matchedPackage = current.find((pkg) => pkg.vendorName === selectedVendorName);

      if (matchedPackage) {
        nextPackageId = matchedPackage.id;
        const alreadyExists = matchedPackage.items.some((item) => item.assignmentId === assignment.id);
        if (alreadyExists) {
          return current;
        }
        return current.map((pkg) =>
          pkg.id === matchedPackage.id
            ? {
                ...pkg,
                items: [
                  ...pkg.items,
                  {
                    id: `line-${assignment.id}`,
                    assignmentId: assignment.id,
                    itemName: title,
                    requirementText: summary,
                  },
                ],
                documentStatus: pkg.documentStatus === "已生成" ? "需更新" : pkg.documentStatus,
              }
            : pkg,
        );
      }

      const vendorCodeSeed = vendorPackages.length + current.length + 1;
      const createdPackage: VendorPackage = {
        id: `vp-${assignment.id}`,
        code: `VP-${projectId}-${vendorCodeSeed}`,
        projectId,
        projectName: projectInfo.name,
        vendorName: selectedVendorName,
        eventDate: projectInfo.eventDate,
        location: projectInfo.location,
        loadInTime: projectInfo.loadInTime,
        items: [
          {
            id: `line-${assignment.id}`,
            assignmentId: assignment.id,
            itemName: title,
            requirementText: summary,
          },
        ],
        note: "",
        documentStatus: "未生成",
      };
      nextPackageId = createdPackage.id;
      return [...current, createdPackage];
    });

    handleAssignmentChange(assignment.id, {
      title,
      summary,
      tradeLabel,
      selectedVendorName,
      status: "done",
      packageId: nextPackageId,
    });
  }

  if (!visible) {
    return null;
  }

  return (
    <section className="space-y-6">
      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-700">PRE-ISSUE</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">廠商需求</h3>
          </div>
        </div>

        <div className="space-y-4">
          {assignments.map((assignment, index) => {
            const packageVendorName = assignment.packageId ? packageMap[assignment.packageId]?.vendorName : undefined;
            const selectedVendorName = assignment.selectedVendorName || packageVendorName || "";
            const isSubmitted = assignment.status === "done" || Boolean(assignment.packageId);
            const statusLabel = isSubmitted ? "已送出" : "未送出";
            const canSubmit = Boolean(
              assignment.title.trim() && assignment.summary.trim() && (assignment.tradeLabel || "").trim() && selectedVendorName.trim() && !isSubmitted,
            );

            return (
              <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
                  <p className="font-semibold text-slate-900">{assignment.title || "未命名任務"}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${isSubmitted ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_280px] xl:grid-rows-[auto_1fr] xl:items-start">
                  <div className="space-y-4 xl:row-span-2">
                    <label className="block">
                      <p className="mb-2 text-sm font-medium text-slate-700">任務標題</p>
                      <input
                        value={assignment.title}
                        onChange={(event) => handleAssignmentChange(assignment.id, { title: event.target.value })}
                        disabled={isSubmitted}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </label>

                    <label className="block">
                      <p className="mb-2 text-sm font-medium text-slate-700">需求說明</p>
                      <textarea
                        value={assignment.summary}
                        onChange={(event) => handleAssignmentChange(assignment.id, { summary: event.target.value })}
                        disabled={isSubmitted}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </label>
                  </div>

                  <div className="space-y-4 xl:row-span-2">
                    <label className="block">
                      <p className="mb-2 text-sm font-medium text-slate-700">工種</p>
                      <input
                        value={assignment.tradeLabel || ""}
                        onChange={(event) => handleAssignmentChange(assignment.id, { tradeLabel: event.target.value })}
                        disabled={isSubmitted}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </label>
                    <label className="block">
                      <p className="mb-2 text-sm font-medium text-slate-700">廠商報價</p>
                      <input
                        value={assignment.budget}
                        onChange={(event) => handleAssignmentChange(assignment.id, { budget: event.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-4 xl:row-span-2">
                    <div>
                      <div className="mb-2 flex h-6 items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-700">選擇廠商</p>
                        {!isSubmitted ? (
                          <button
                            type="button"
                            onClick={() => setQuickCreateAssignmentId(assignment.id)}
                            title="快速建立廠商"
                            aria-label="快速建立廠商"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            +
                          </button>
                        ) : null}
                      </div>
                      <select
                        value={selectedVendorName}
                        onChange={(event) => handleAssignmentChange(assignment.id, { selectedVendorName: event.target.value })}
                        disabled={isSubmitted}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value="">請選擇廠商</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-end">
                      <button
                        type="button"
                        disabled={!canSubmit}
                        onClick={() => handleSend({ ...assignment, selectedVendorName })}
                        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        送出
                      </button>
                    </div>

                    {inlineErrors[assignment.id] ? (
                      <p className="text-xs leading-5 text-rose-600">{inlineErrors[assignment.id]}</p>
                    ) : null}
                    {isSubmitted ? <p className="text-xs leading-5 text-slate-500">已送出後不可再次送出；後續整理請到 package 內進行。</p> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <article className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-700">POST-ISSUE</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">廠商發包清單</h3>
          </div>
        </div>

        {packages.length ? (
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-blue-100">
            <table className="min-w-[720px] divide-y divide-slate-200 text-sm xl:min-w-full">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">廠商名稱</th>
                  <th className="px-4 py-3 font-medium">項目數</th>
                  <th className="px-4 py-3 font-medium">文件狀態</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((vendorPackage) => (
                  <tr key={vendorPackage.id}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{vendorPackage.vendorName}</p>
                        <p className="mt-1 text-xs text-slate-500">{vendorPackage.code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">{vendorPackage.items.length} 筆</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(vendorPackage.documentStatus)}`}>
                        {vendorPackage.documentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/vendor-packages/${vendorPackage.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50">
                        查看 Package
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500">目前尚未建立廠商發包清單。</div>
        )}
      </article>

      <VendorQuickCreateDialog
        open={Boolean(quickCreateAssignmentId)}
        onClose={() => setQuickCreateAssignmentId(null)}
        title="流程內快速建立廠商"
        description="入口 B：設計 / 備品 / Vendor 流程匹配不到廠商時，可直接建立；成功後立刻回填當前選單並自動選中。"
        onCreated={(vendor) => {
          if (!quickCreateAssignmentId) return;
          handleAssignmentChange(quickCreateAssignmentId, {
            selectedVendorName: vendor.name,
            tradeLabel: assignments.find((item) => item.id === quickCreateAssignmentId)?.tradeLabel || vendor.tradeLabels?.[0] || "",
          });
          setInlineErrors((current) => {
            const next = { ...current };
            delete next[quickCreateAssignmentId];
            return next;
          });
        }}
      />
    </section>
  );
}
