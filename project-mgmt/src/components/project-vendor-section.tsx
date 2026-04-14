"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getVendorDocumentStatusClass,
  vendorPackages,
  type VendorAssignment,
  type VendorPackage,
} from "@/components/vendor-data";
import { useStoredVendorPackages } from "@/components/vendor-package-store";
import type { VendorAssignmentItem } from "@/components/execution-tree-section";
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
    status: "draft",
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
  const { packages, syncPackages } = useStoredVendorPackages(projectId);
  const packageMap = useMemo(() => buildPackageMap(packages), [packages]);
  const [assignments, setAssignments] = useState<VendorAssignment[]>(() =>
    vendorTaskItems.map((item) => mapVendorTaskItemToAssignment(projectId, item))
  );
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

    const matchedPackage = packages.find((pkg) => pkg.vendorName === selectedVendorName);

    if (matchedPackage) {
      nextPackageId = matchedPackage.id;
      const alreadyExists = matchedPackage.items.some((item) => item.assignmentId === assignment.id);
      if (!alreadyExists) {
        syncPackages(
          packages.map((pkg) =>
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
          ),
        );
      }
    } else {
      const vendorCodeSeed = vendorPackages.length + packages.length + 1;
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
      syncPackages([...packages, createdPackage]);
    }

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
            <h3 className="text-xl font-semibold text-slate-900">廠商需求</h3>
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

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_220px_280px] xl:grid-rows-[auto_auto] xl:items-start">
                  <label className="block">
                    <p className="mb-2 flex h-6 items-center text-sm font-medium text-slate-700">任務標題</p>
                    <input
                      value={assignment.title}
                      onChange={(event) => handleAssignmentChange(assignment.id, { title: event.target.value })}
                      disabled={isSubmitted}
                      className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </label>

                  <label className="block">
                    <p className="mb-2 flex h-6 items-center text-sm font-medium text-slate-700">工種</p>
                    <input
                      value={assignment.tradeLabel || ""}
                      onChange={(event) => handleAssignmentChange(assignment.id, { tradeLabel: event.target.value })}
                      disabled={isSubmitted}
                      className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </label>

                  <div>
                    <div className="mb-2 flex h-6 items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700">選擇廠商</p>
                    </div>
                    <select
                      value={selectedVendorName}
                      onChange={(event) => handleAssignmentChange(assignment.id, { selectedVendorName: event.target.value })}
                      disabled={isSubmitted}
                      className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="">請選擇廠商</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                      ))}
                    </select>
                  </div>

                  <label className="block">
                    <p className="mb-2 flex h-6 items-center text-sm font-medium text-slate-700">需求說明</p>
                    <textarea
                      value={assignment.summary}
                      onChange={(event) => handleAssignmentChange(assignment.id, { summary: event.target.value })}
                      disabled={isSubmitted}
                      rows={4}
                      className="min-h-[112px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </label>

                  <label className="block">
                    <p className="mb-2 flex h-6 items-center text-sm font-medium text-slate-600">廠商報價</p>
                    <input
                      value={assignment.budget}
                      onChange={(event) => handleAssignmentChange(assignment.id, { budget: event.target.value })}
                      disabled={isSubmitted}
                      className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </label>

                  <div className="flex h-full flex-col">
                    <p className="mb-2 flex h-6 items-center text-sm font-medium text-slate-700">送出</p>
                    <button
                      type="button"
                      disabled={!canSubmit}
                      onClick={() => handleSend({ ...assignment, selectedVendorName })}
                      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isSubmitted ? "已送出" : "送出"}
                    </button>
                    <div className="mt-3 min-h-10">
                      {inlineErrors[assignment.id] ? (
                        <p className="text-xs leading-5 text-rose-600">{inlineErrors[assignment.id]}</p>
                      ) : isSubmitted ? (
                        <p className="text-xs leading-5 text-slate-500">已送出後主欄位已鎖定；後續整理請到 package 內進行。</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">廠商發包清單</h3>
          </div>
        </div>

        {packages.length ? (
          <div className="space-y-3">
            {packages.map((vendorPackage) => (
              <article key={vendorPackage.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-semibold text-slate-900">{vendorPackage.vendorName}</h4>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(vendorPackage.documentStatus)}`}>
                        {vendorPackage.documentStatus}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <p>項目數：<span className="font-medium text-slate-800">{vendorPackage.items.length} 筆</span></p>
                    </div>
                  </div>
                  <Link href={`/vendor-packages/${vendorPackage.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                    查看文件
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">目前尚未建立廠商發包清單。</div>
        )}
      </article>

    </section>
  );
}
