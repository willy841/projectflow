"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { type DesignTaskBoardRecord, designTaskBoardRecords } from "@/components/design-task-board-data";
import { getStatusClass } from "@/components/project-data";

function buildTaskHref(record: DesignTaskBoardRecord) {
  return `/projects/${record.projectId}?source=design&task=${encodeURIComponent(record.title)}`;
}

export default function DesignTasksPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const records = useMemo<DesignTaskBoardRecord[]>(() => designTaskBoardRecords, []);

  const statusOptions = useMemo(
    () => Array.from(new Set(records.map((record) => record.confirmStatus))).filter(Boolean),
    [records],
  );

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const haystack = `${record.title} ${record.projectName} ${record.size} ${record.material}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || record.confirmStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [records, query, statusFilter]);

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">設計任務版</h2>
            <span className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">共 {filtered.length} 筆任務</span>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">搜尋任務</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋任務名稱、專案名稱、尺寸或材質"
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">狀態</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="all">全部</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-3">
          {filtered.map((record) => (
            <article key={record.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50/70">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <h4 className="text-lg font-semibold text-slate-900">{record.title}</h4>
                      <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(record.confirmStatus)}`}>
                        {record.confirmStatus}
                      </span>

                      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">尺寸</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{record.size}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">材質</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{record.material}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">所屬專案</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{record.projectName}</p>
                      </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Link
                    href={buildTaskHref(record)}
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    回到原任務區
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
