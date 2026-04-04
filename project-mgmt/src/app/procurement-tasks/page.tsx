"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  type ConfirmStatus,
  type DocumentStatus,
  type ProcurementBoardRecord,
} from "@/components/procurement-task-board-data";
import { projects } from "@/components/project-data";
import {
  getProcurementBoardRecords,
  PROJECTFLOW_WORKFLOW_UPDATED_EVENT,
} from "@/components/project-workflow-store";

function getConfirmPriority(status: ConfirmStatus) {
  if (status === "待確認") return 0;
  if (status === "尚無回覆") return 1;
  return 2;
}

function getDocumentPriority(status: DocumentStatus) {
  if (status === "需更新") return 0;
  if (status === "未生成") return 1;
  return 2;
}

function compareRecords(a: ProcurementBoardRecord, b: ProcurementBoardRecord) {
  const confirmDiff = getConfirmPriority(a.confirmStatus) - getConfirmPriority(b.confirmStatus);
  if (confirmDiff !== 0) return confirmDiff;

  const documentDiff = getDocumentPriority(a.documentStatus) - getDocumentPriority(b.documentStatus);
  if (documentDiff !== 0) return documentDiff;

  const dateDiff = (a.eventDate ?? "9999-12-31").localeCompare(b.eventDate ?? "9999-12-31");
  if (dateDiff !== 0) return dateDiff;

  const projectDiff = a.projectName.localeCompare(b.projectName, "zh-Hant");
  if (projectDiff !== 0) return projectDiff;

  return a.title.localeCompare(b.title, "zh-Hant");
}

function getConfirmBadgeClass(status: ConfirmStatus) {
  if (status === "已確認") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "待確認") return "border border-amber-200 bg-amber-50 text-amber-700";
  return "border border-slate-200 bg-slate-100 text-slate-700";
}

function getDocumentBadgeClass(status: DocumentStatus) {
  if (status === "已生成") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "需更新") return "border border-amber-200 bg-amber-50 text-amber-700";
  return "border border-slate-200 bg-slate-100 text-slate-700";
}

function getDocumentActionLabel(status: DocumentStatus) {
  if (status === "已生成") return "查看文件";
  if (status === "需更新") return "查看舊文件";
  return "未生成";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatEventDate(date?: string) {
  if (!date) return "檔期待補";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function buildProjectTaskHref(record: ProcurementBoardRecord, panel: "detail" | "organize" | "document") {
  const params = new URLSearchParams({ tab: "procurement", panel });
  if (panel === "detail" && record.sourceTargetId) {
    params.set("item", record.sourceTargetId);
  }
  return `/projects/${record.projectId}?${params.toString()}`;
}

export default function ProcurementTasksPage() {
  const [query, setQuery] = useState("");
  const [confirmFilter, setConfirmFilter] = useState<"all" | ConfirmStatus>("all");
  const [documentFilter, setDocumentFilter] = useState<"all" | DocumentStatus>("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [records, setRecords] = useState<ProcurementBoardRecord[]>(() => getProcurementBoardRecords(projects));

  useEffect(() => {
    const refreshRecords = () => setRecords(getProcurementBoardRecords(projects));

    refreshRecords();
    window.addEventListener(PROJECTFLOW_WORKFLOW_UPDATED_EVENT, refreshRecords);
    window.addEventListener("focus", refreshRecords);
    window.addEventListener("storage", refreshRecords);

    return () => {
      window.removeEventListener(PROJECTFLOW_WORKFLOW_UPDATED_EVENT, refreshRecords);
      window.removeEventListener("focus", refreshRecords);
      window.removeEventListener("storage", refreshRecords);
    };
  }, []);

  const vendors = useMemo(
    () => Array.from(new Set(records.map((record) => record.vendorName))).filter(Boolean),
    [records],
  );

  const filtered = useMemo(() => {
    return records
      .filter((record) => {
        const haystack = `${record.projectName} ${record.title}`.toLowerCase();
        const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
        const matchesConfirm = confirmFilter === "all" || record.confirmStatus === confirmFilter;
        const matchesDocument = documentFilter === "all" || record.documentStatus === documentFilter;
        const matchesVendor = vendorFilter === "all" || record.vendorName === vendorFilter;
        return matchesQuery && matchesConfirm && matchesDocument && matchesVendor;
      })
      .sort(compareRecords);
  }, [records, query, confirmFilter, documentFilter, vendorFilter]);

  const stats = useMemo(() => ({
    total: records.length,
    pendingConfirm: records.filter((record) => record.confirmStatus === "待確認").length,
    documentNeedUpdate: records.filter((record) => record.documentStatus === "需更新").length,
    confirmedCostTotal: records.filter((record) => record.costLocked).reduce((sum, record) => sum + record.costAmount, 0),
    lockedVendorCount: new Set(records.filter((record) => record.costLocked).map((record) => record.vendorName).filter((vendor) => vendor && vendor !== "未指定")).size,
  }), [records]);

  return (
    <AppShell activePath="/procurement-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">跨專案工作台</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">備品採購版</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">以跨專案視角追蹤備品項目是否已被回覆、是否已被確認、是否已進單一備品文件主線。</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">總任務數</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
            </article>
            <article className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-700">待確認</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">{stats.pendingConfirm}</p>
            </article>
            <article className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-700">需更新文件</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">{stats.documentNeedUpdate}</p>
            </article>
            <article className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs text-emerald-700">已確認成本</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">{formatCurrency(stats.confirmedCostTotal)}</p>
              <p className="mt-1 text-xs text-emerald-700">已鎖定 {stats.lockedVendorCount} 家供應商</p>
            </article>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.75fr))]">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">搜尋</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋專案名稱或備品項目" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">回覆 / 確認狀態</span>
            <select value={confirmFilter} onChange={(event) => setConfirmFilter(event.target.value as typeof confirmFilter)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400">
              <option value="all">全部</option>
              <option value="尚無回覆">尚無回覆</option>
              <option value="待確認">待確認</option>
              <option value="已確認">已確認</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">文件狀態</span>
            <select value={documentFilter} onChange={(event) => setDocumentFilter(event.target.value as typeof documentFilter)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400">
              <option value="all">全部</option>
              <option value="未生成">未生成</option>
              <option value="已生成">已生成</option>
              <option value="需更新">需更新</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">廠商</span>
            <select value={vendorFilter} onChange={(event) => setVendorFilter(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400">
              <option value="all">全部</option>
              {vendors.map((vendor) => (
                <option key={vendor} value={vendor}>{vendor}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">跨專案備品任務總表</h3>
            <p className="mt-1 text-xs text-slate-500">排序優先看待確認，再看需更新文件，最後看較近檔期。</p>
          </div>
          <span className="text-sm text-slate-500">共 {filtered.length} 筆</span>
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((record) => (
              <article key={record.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50/70">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
                            檔期 {formatEventDate(record.eventDate)}
                          </span>
                          <span className="font-medium text-slate-500">{record.projectName}</span>
                        </div>
                        <h4 className="mt-2 text-lg font-semibold text-slate-900">{record.title}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`inline-flex rounded-full px-3 py-1 font-medium ${getConfirmBadgeClass(record.confirmStatus)}`}>回覆 / 確認：{record.confirmStatus}</span>
                        <span className={`inline-flex rounded-full px-3 py-1 font-medium ${getDocumentBadgeClass(record.documentStatus)}`}>文件：{record.documentStatus}</span>
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700">回覆 {record.replyCount} 則</span>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-5">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-500">尺寸</p><p className="mt-1 text-sm font-medium text-slate-900">{record.size}</p></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-500">材質</p><p className="mt-1 text-sm font-medium text-slate-900">{record.material}</p></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-500">數量</p><p className="mt-1 text-sm font-medium text-slate-900">{record.quantity}</p></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-500">廠商</p><p className="mt-1 text-sm font-medium text-slate-900">{record.vendorName}</p></div>
                      <div className={`rounded-2xl border px-3 py-2.5 ${record.costLocked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><p className={`text-[11px] font-medium ${record.costLocked ? "text-emerald-700" : "text-slate-500"}`}>成本主線</p><p className={`mt-1 text-sm font-medium ${record.costLocked ? "text-emerald-900" : "text-slate-900"}`}>{record.costLocked ? record.costLabel : "待確認後成立"}</p></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:w-[320px] xl:justify-end">
                    <Link href={buildProjectTaskHref(record, "detail")} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">查看任務</Link>
                    {record.confirmStatus === "已確認" ? <Link href={buildProjectTaskHref(record, "organize")} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">查看整理內容</Link> : null}
                    {record.documentStatus !== "未生成" ? <Link href={buildProjectTaskHref(record, "document")} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">{getDocumentActionLabel(record.documentStatus)}</Link> : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-base font-semibold text-slate-900">目前沒有符合條件的備品任務</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                請放寬搜尋或篩選條件；若是剛建立任務，也可回到專案主控台確認是否已有回覆、確認與文件狀態進主線。
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setConfirmFilter("all");
                  setDocumentFilter("all");
                  setVendorFilter("all");
                }}
                className="mt-4 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                清除篩選
              </button>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
