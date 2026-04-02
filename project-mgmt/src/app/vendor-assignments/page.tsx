import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments } from "@/components/vendor-data";

export default function VendorAssignmentsPage() {
  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Vendor Flow / 廠商需求</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">廠商需求</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">輕量直接處理卡的總覽頁。這裡只保留需求摘要、工種、預算、選定廠商與送出狀態。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vendorAssignments.map((assignment, index) => (
          <article key={assignment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">#{index + 1}</span>
              <p className="font-semibold text-slate-900">{assignment.title}</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${assignment.status === "done" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                {assignment.status === "done" ? "已處理" : "未處理"}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{assignment.summary}</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <p>工種：{assignment.tradeLabel || "-"}</p>
              <p>預算：{assignment.budget}</p>
              <p>廠商：{assignment.selectedVendorName || "未選定"}</p>
              <p>來源：{assignment.executionItemTitle}</p>
            </div>
            <Link href={`/vendor-assignments/${assignment.id}`} className="mt-4 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              查看需求卡
            </Link>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
