"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getPackagesByProjectId,
  getVendorDocumentStatusClass,
  vendorPackages,
  vendorProfiles,
  type VendorAssignment,
  type VendorBasicProfile,
  type VendorPackage,
} from "@/components/vendor-data";
import type { VendorAssignmentItem } from "@/components/execution-tree-section";

type ProjectVendorInfo = {
  name: string;
  eventDate: string;
  location: string;
  loadInTime: string;
};

type PackageMap = Record<string, VendorPackage>;
type QuickCreateForm = {
  name: string;
  category: string;
  trades: string[];
};

type QuickCreateFeedback =
  | { type: "success"; message: string }
  | { type: "duplicate"; message: string }
  | null;

const TRADE_PRESETS = ["輸出", "木作", "施工", "佈置", "電工", "燈光", "活動執行"];

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

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

function buildVendorOptionNames(packages: VendorPackage[], createdVendors: VendorBasicProfile[]) {
  const names = new Set<string>();

  vendorProfiles.forEach((vendor) => names.add(vendor.name));
  createdVendors.forEach((vendor) => names.add(vendor.name));
  packages.forEach((pkg) => names.add(pkg.vendorName));

  return Array.from(names).sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

function createEmptyQuickForm(): QuickCreateForm {
  return { name: "", category: "", trades: [] };
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
  const [packages, setPackages] = useState<VendorPackage[]>(() => getPackagesByProjectId(projectId));
  const [createdVendors, setCreatedVendors] = useState<VendorBasicProfile[]>([]);
  const packageMap = useMemo(() => buildPackageMap(packages), [packages]);
  const vendorOptions = useMemo(() => buildVendorOptionNames(packages, createdVendors), [packages, createdVendors]);
  const [assignments, setAssignments] = useState<VendorAssignment[]>(() =>
    vendorTaskItems.map((item) => mapVendorTaskItemToAssignment(projectId, item))
  );
  const [openQuickCreateId, setOpenQuickCreateId] = useState<string | null>(null);
  const [quickCreateDrafts, setQuickCreateDrafts] = useState<Record<string, QuickCreateForm>>({});
  const [quickCreateFeedback, setQuickCreateFeedback] = useState<Record<string, QuickCreateFeedback>>({});

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
  }

  function toggleQuickCreate(assignment: VendorAssignment) {
    setQuickCreateFeedback((current) => ({ ...current, [assignment.id]: null }));
    setQuickCreateDrafts((current) => ({
      ...current,
      [assignment.id]: current[assignment.id] ?? createEmptyQuickForm(),
    }));
    setOpenQuickCreateId((current) => (current === assignment.id ? null : assignment.id));
  }

  function updateQuickCreateDraft(id: string, patch: Partial<QuickCreateForm>) {
    setQuickCreateDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? createEmptyQuickForm()),
        ...patch,
      },
    }));
  }

  function toggleQuickTrade(id: string, trade: string) {
    const draft = quickCreateDrafts[id] ?? createEmptyQuickForm();
    const trades = draft.trades.includes(trade)
      ? draft.trades.filter((item) => item !== trade)
      : [...draft.trades, trade];
    updateQuickCreateDraft(id, { trades });
  }

  function createVendorFromQuickForm(assignment: VendorAssignment) {
    const draft = quickCreateDrafts[assignment.id] ?? createEmptyQuickForm();
    const normalizedName = normalizeName(draft.name);
    if (!normalizedName) return;

    const existingVendor = [...vendorProfiles, ...createdVendors].find((vendor) => normalizeName(vendor.name) === normalizedName);

    if (existingVendor) {
      handleAssignmentChange(assignment.id, { selectedVendorName: existingVendor.name });
      if (!assignment.tradeLabel?.trim() && draft.trades.length) {
        handleAssignmentChange(assignment.id, { tradeLabel: draft.trades.join(" / ") });
      }
      setQuickCreateFeedback((current) => ({
        ...current,
        [assignment.id]: {
          type: "duplicate",
          message: `「${existingVendor.name}」已存在，已直接幫你選取。`,
        },
      }));
      return;
    }

    const nextVendor: VendorBasicProfile = {
      id: `vendor-inline-${assignment.id}`,
      name: draft.name.trim(),
      category: draft.category.trim() || draft.trades.join(" / ") || "未分類",
      contactName: "",
      phone: "",
      email: "",
      lineId: "",
      address: "",
      note: draft.trades.length ? `Quick create 工種：${draft.trades.join(" / ")}` : "Quick create 建立",
      bankName: "",
      bankCode: "",
      accountName: "",
      accountNumber: "",
    };

    setCreatedVendors((current) => [...current, nextVendor]);
    handleAssignmentChange(assignment.id, {
      selectedVendorName: nextVendor.name,
      tradeLabel: assignment.tradeLabel?.trim() ? assignment.tradeLabel : draft.trades.join(" / "),
    });
    setQuickCreateFeedback((current) => ({
      ...current,
      [assignment.id]: {
        type: "success",
        message: `已建立「${nextVendor.name}」，並自動選取到這張需求卡。`,
      },
    }));
    setQuickCreateDrafts((current) => ({ ...current, [assignment.id]: createEmptyQuickForm() }));
    setOpenQuickCreateId(null);
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
            <p className="mt-1 text-sm text-slate-500">主欄位只有任務標題、需求說明、工種。送出後正式進入 package 主線，主欄位鎖住。</p>
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
            const isQuickCreateOpen = openQuickCreateId === assignment.id;
            const quickCreateState = quickCreateDrafts[assignment.id] ?? createEmptyQuickForm();
            const feedback = quickCreateFeedback[assignment.id];

            return (
              <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
                  <p className="font-semibold text-slate-900">{assignment.title || "未命名任務"}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${isSubmitted ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                    {statusLabel}
                  </span>
                  {selectedVendorName ? (
                    <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                      已選：{selectedVendorName}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px_260px]">
                  <div className="space-y-4">
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

                  <div className="space-y-4">
                    <label className="block">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-700">工種</p>
                        <span className="text-xs text-slate-400">可多選後自動帶入</span>
                      </div>
                      <input
                        value={assignment.tradeLabel || ""}
                        onChange={(event) => handleAssignmentChange(assignment.id, { tradeLabel: event.target.value })}
                        disabled={isSubmitted}
                        placeholder="例如：輸出 / 施工"
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

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-700">選擇廠商</p>
                        {!isSubmitted ? (
                          <button
                            type="button"
                            onClick={() => toggleQuickCreate(assignment)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                          >
                            {isQuickCreateOpen ? "收合 quick create" : "+ 快速建立廠商"}
                          </button>
                        ) : null}
                      </div>

                      <select
                        value={selectedVendorName}
                        onChange={(event) => handleAssignmentChange(assignment.id, { selectedVendorName: event.target.value })}
                        disabled={isSubmitted}
                        className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value="">請選擇廠商</option>
                        {vendorOptions.map((vendorName) => (
                          <option key={vendorName} value={vendorName}>{vendorName}</option>
                        ))}
                      </select>

                      {feedback ? (
                        <div className={`mt-3 rounded-2xl px-3 py-2 text-xs font-medium ring-1 ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                          {feedback.message}
                        </div>
                      ) : null}

                      {isQuickCreateOpen ? (
                        <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Quick create 廠商</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">不用離開流程；建立後會自動選中這張需求卡。</p>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">輕量建立</span>
                          </div>

                          <div className="mt-3 space-y-3">
                            <input
                              value={quickCreateState.name}
                              onChange={(event) => updateQuickCreateDraft(assignment.id, { name: event.target.value })}
                              placeholder="廠商名稱"
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
                            />
                            <input
                              value={quickCreateState.category}
                              onChange={(event) => updateQuickCreateDraft(assignment.id, { category: event.target.value })}
                              placeholder="合作類型（可不填）"
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
                            />
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-700">工種（可多選）</p>
                                <span className="text-[11px] text-slate-400">不把表單做重，只保留常用選項</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {TRADE_PRESETS.map((trade) => {
                                  const active = quickCreateState.trades.includes(trade);
                                  return (
                                    <button
                                      key={trade}
                                      type="button"
                                      onClick={() => toggleQuickTrade(assignment.id, trade)}
                                      className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                                    >
                                      {trade}
                                    </button>
                                  );
                                })}
                              </div>
                              {quickCreateState.trades.length ? (
                                <p className="mt-2 text-xs text-slate-500">已選工種：{quickCreateState.trades.join(" / ")}</p>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => createVendorFromQuickForm(assignment)}
                              disabled={!quickCreateState.name.trim()}
                              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              建立並選取
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenQuickCreateId(null)}
                              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              稍後再建
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      disabled={!canSubmit}
                      onClick={() => handleSend({ ...assignment, selectedVendorName })}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      送出
                    </button>

                    {isSubmitted ? <p className="text-xs leading-5 text-slate-500">已送出後不可再次送出；後續整理請到 package 內進行。</p> : <p className="text-xs leading-5 text-slate-500">建立成功後會直接歸入同專案 + 同廠商的 Package，流程不中斷。</p>}
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
            <p className="mt-1 text-sm text-slate-500">清單顯示的是文件狀態：未生成 / 已生成 / 需更新；進入 package 後只整理文件背景、發包項目與文件整體備註。</p>
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
                      <Link href={`/vendor-packages/${vendorPackage.id}`} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
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
    </section>
  );
}
