"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  type ConfirmStatus,
  type DesignTaskBoardRecord,
  type DocumentStatus,
} from "@/components/design-task-board-data";
import { projects } from "@/components/project-data";
import {
  getDesignBoardRecords,
  PROJECTFLOW_WORKFLOW_UPDATED_EVENT,
} from "@/components/project-workflow-store";

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

function buildProjectTaskHref(record: DesignTaskBoardRecord, panel: "detail" | "organize" | "document") {
  const params = new URLSearchParams({ tab: "design", panel });
  if (panel === "detail" && record.sourceTargetId) {
    params.set("item", record.sourceTargetId);
  }
  if ((panel === "organize" || panel === "document") && record.vendorName && record.vendorName !== "未指定") {
    params.set("vendor", record.vendorName);
  }
  return `/projects/${record.projectId}?${params.toString()}`;
}

export default function DesignTasksPage() {
  const [query, setQuery] = useState("");
  const [confirmFilter, setConfirmFilter] = useState<"all" | ConfirmStatus>("all");
  const [documentFilter, setDocumentFilter] = useState<"all" | DocumentStatus>("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [records, setRecords] = useState<DesignTaskBoardRecord[]>(() => getDesignBoardRecords(projects));

  useEffect(() => {
    const refreshRecords = () => setRecords(getDesignBoardRecords(projects));

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
    return records.filter((record) => {
      const haystack = `${record.projectName} ${record.title}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      const matchesConfirm = confirmFilter === "all" || record.confirmStatus === confirmFilter;
      const matchesDocument = documentFilter === "all" || record.documentStatus === documentFilter;
      const matchesVendor = vendorFilter === "all" || record.vendorName === vendorFilter;
      return matchesQuery && matchesConfirm && matchesDocument && matchesVendor;
    });
  }, [records, query, confirmFilter, documentFilter, vendorFilter]);

  const stats = useMemo(() => ({
    total: records.length,
    pendingConfirm: records.filter((record) => record.confirmStatus === "待確認").length,
    documentNeedUpdate: records.filter((record) => record.documentStatus === "需更新").length,
    confirmedCostTotal: records.filter((record) => record.costLocked).reduce((sum, record) => sum + record.costAmount, 0),
    lockedVendorCount: new Set(records.filter((record) => record.costLocked).map((record) => record.vendorName).filter((vendor) => vendor && vendor !== "未指定")).size,
  }), [records]);

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">跨專案工作台</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">設計任務版</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">以跨專案視角追蹤設計任務是否已被回覆、是否已被確認、是否已進文件主線。</p>
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
              <p className="mt-1 text-xs text-emerald-700">已鎖定 {stats.lockedVendorCount} 家執行廠商</p>
            </article>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.75fr))]">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">搜尋</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋專案名稱或任務標題"
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">回覆 / 確認狀態</span>
            <select
              value={confirmFilter}
              onChange={(event) => setConfirmFilter(event.target.value as typeof confirmFilter)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="all">全部</option>
              <option value="尚無回覆">尚無回覆</option>
              <option value="待確認">待確認</option>
              <option value="已確認">已確認</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">文件狀態</span>
            <select
              value={documentFilter}
              onChange={(event) => setDocumentFilter(event.target.value as typeof documentFilter)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="all">全部</option>
              <option value="未生成">未生成</option>
              <option value="已生成">已生成</option>
              <option value="需更新">需更新</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">執行廠商</span>
            <select
              value={vendorFilter}
              onChange={(event) => setVendorFilter(event.target.value)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
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
          <h3 className="text-xl font-semibold text-slate-900">跨專案設計任務總表</h3>
          <span className="text-sm text-slate-500">共 {filtered.length} 筆</span>
        </div>

        <div className="space-y-3">
          {filtered.map((record) => (
            <article key={record.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50/70">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{record.projectName}</p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-900">{record.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`inline-flex rounded-full px-3 py-1 font-medium ${getConfirmBadgeClass(record.confirmStatus)}`}>
                        回覆 / 確認：{record.confirmStatus}
                      </span>
                      <span className={`inline-flex rounded-full px-3 py-1 font-medium ${getDocumentBadgeClass(record.documentStatus)}`}>
                        文件：{record.documentStatus}
                      </span>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700">
                        回覆 {record.replyCount} 則
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[11px] font-medium text-slate-500">尺寸</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{record.size}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[11px] font-medium text-slate-500">材質 + 結構</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{record.material}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[11px] font-medium text-slate-500">執行廠商</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{record.vendorName}</p>
                    </div>
                    <div className={`rounded-2xl border px-3 py-2.5 ${record.costLocked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[11px] font-medium ${record.costLocked ? "text-emerald-700" : "text-slate-500"}`}>成本主線</p>
                      <p className={`mt-1 text-sm font-medium ${record.costLocked ? "text-emerald-900" : "text-slate-900"}`}>
                        {record.costLocked ? record.costLabel : "待確認後成立"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 xl:w-[320px] xl:justify-end">
                  <Link href={buildProjectTaskHref(record, "detail")} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                    查看任務
                  </Link>
                  {record.confirmStatus === "已確認" ? (
                    <Link href={buildProjectTaskHref(record, "organize")} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                      查看整理內容
                    </Link>
                  ) : null}
                  {record.documentStatus !== "未生成" ? (
                    <Link href={buildProjectTaskHref(record, "document")} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                      {getDocumentActionLabel(record.documentStatus)}
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
