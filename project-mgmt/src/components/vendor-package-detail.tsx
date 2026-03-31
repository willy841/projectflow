"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  VendorPackage,
  getAssignmentsForPackage,
  getAssignmentStatusLabel,
  getPackageStatusLabel,
  getVendorStatusClass,
} from "@/components/vendor-data";

export function VendorPackageDetail({ vendorPackage }: { vendorPackage: VendorPackage }) {
  const [status, setStatus] = useState(vendorPackage.status);
  const [confirmedAt, setConfirmedAt] = useState(vendorPackage.formallyConfirmedAt);
  const [confirmedBy, setConfirmedBy] = useState(vendorPackage.formallyConfirmedBy);
  const assignments = useMemo(() => getAssignmentsForPackage(vendorPackage.id), [vendorPackage.id]);

  const syncedAssignmentStatusLabel =
    status === "formally_confirmed" ? "已隨 package 正式發包" : null;

  function handleFormalConfirm() {
    setStatus("formally_confirmed");
    setConfirmedAt("2026-04-01 01:10");
    setConfirmedBy("Willy");
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">{vendorPackage.projectName}</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(status)}`}>
                {getPackageStatusLabel(status)}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{vendorPackage.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{vendorPackage.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleFormalConfirm}
              disabled={status === "formally_confirmed"}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {status === "formally_confirmed" ? "已正式發包" : "確認並正式發包"}
            </button>
            <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700">
              複製整包發包內容
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["合作廠商", vendorPackage.vendorName],
          ["包單狀態", getPackageStatusLabel(status)],
          ["正式發包時間", confirmedAt ?? "尚未正式發包"],
          ["正式發包人", confirmedBy ?? "尚未指定"],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Package 內項目</h3>
              <p className="mt-1 text-sm text-slate-500">正式發包主體在 package 層，底下 assignment 仍保留 item-level 管理。</p>
            </div>
            {syncedAssignmentStatusLabel ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                Assignment 已同步：{syncedAssignmentStatusLabel}
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/vendor-assignments/${assignment.id}`}
                      className="font-semibold text-slate-900 underline-offset-4 hover:underline"
                    >
                      {assignment.title}
                    </Link>
                    <p className="mt-2 text-sm text-slate-500">來源：{assignment.executionItemTitle}</p>
                    <p className="mt-1 text-sm text-slate-500">預算：{assignment.budget}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorStatusClass(
                      status === "formally_confirmed" ? "confirmed_under_package" : assignment.status,
                    )}`}
                  >
                    {status === "formally_confirmed"
                      ? "已隨 package 正式發包"
                      : getAssignmentStatusLabel(assignment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Package 回覆</h3>
              <p className="mt-1 text-sm text-slate-500">這裡是整包主對話，assignment reply 只作局部補充。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增 package 回覆</button>
          </div>

          <div className="space-y-3">
            {vendorPackage.replies.map((reply) => (
              <div key={reply.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{reply.author}</p>
                  <span className="text-xs text-slate-500">{reply.createdAt}</span>
                </div>
                {reply.type ? <p className="mt-2 text-xs font-medium text-slate-500">{reply.type}</p> : null}
                <p className="mt-2 text-sm leading-6 text-slate-700">{reply.message}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">整包備註</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{vendorPackage.notes}</p>
          </div>
        </article>
      </section>
    </div>
  );
}
