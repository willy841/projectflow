"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  designTaskBoardRecords,
  type ConfirmStatus,
  type DesignTaskBoardRecord,
  type DocumentStatus,
} from "@/components/design-task-board-data";

function getConfirmBadgeClass(status: ConfirmStatus) {
  if (status === "已確認") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "待確認") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function getDocumentBadgeClass(status: DocumentStatus) {
  if (status === "已生成") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "需更新") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export default function DesignTasksPage() {
  const [query, setQuery] = useState("");
  const [confirmFilter, setConfirmFilter] = useState<"all" | ConfirmStatus>("all");
  const [documentFilter, setDocumentFilter] = useState<"all" | DocumentStatus>("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  const records = useMemo<DesignTaskBoardRecord[]>(() => designTaskBoardRecords, []);

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
    projectCount: new Set(records.map((record) => record.projectId)).size,
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

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">總任務數</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
            </article>
            <article className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-700">待確認</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">{stats.pendingConfirm}</p>
            </article>
            <article className="rounded-2xl bg-blue-50 px-4 py-3">
              <p className="text-xs text-blue-700">需更新文件</p>
              <p className="mt-2 text-2xl font-semibold text-blue-900">{stats.documentNeedUpdate}</p>
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
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{record.projectName}</p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">{record.title}</h4>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`inline-flex rounded-full px-3 py-1 font-medium ring-1 ${getConfirmBadgeClass(record.confirmStatus)}`}>
                      {record.confirmStatus}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 font-medium ring-1 ${getDocumentBadgeClass(record.documentStatus)}`}>
                      {record.documentStatus}
                    </span>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200">
                      回覆 {record.replyCount} 則
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">尺寸</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{record.size}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">材質 + 結構</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{record.material}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">執行廠商</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{record.vendorName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Link href={`/projects/${record.projectId}`} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                    查看任務
                  </Link>
                  {record.confirmStatus === "已確認" ? (
                    <Link href={`/projects/${record.projectId}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                      查看整理內容
                    </Link>
                  ) : null}
                  {record.documentStatus !== "未生成" ? (
                    <Link href={`/projects/${record.projectId}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                      查看文件
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
