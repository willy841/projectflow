import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { formatCurrency, getQuoteCostProjects } from "@/components/quote-cost-data";

function getReconciliationBadge(confirmed: boolean) {
  return confirmed
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";
}

function getClosureBadge(status: string) {
  return status === "已結案"
    ? "bg-slate-100 text-slate-700 ring-slate-200"
    : "bg-sky-50 text-sky-700 ring-sky-200";
}

function ProjectRow({ item }: { item: ReturnType<typeof getQuoteCostProjects>[number] }) {
  return (
    <tr className="align-top transition hover:bg-slate-50/70">
      <td className="px-4 py-4">
        <Link href={`/quote-cost/${item.project.id}`} className="font-semibold text-slate-900 underline-offset-4 hover:text-blue-600 hover:underline">
          {item.project.name}
        </Link>
        <p className="mt-1 text-xs text-slate-500">{item.project.code}</p>
      </td>
      <td className="px-4 py-4 text-slate-600">{item.project.client}</td>
      <td className="px-4 py-4 text-slate-600">{item.project.eventDate}</td>
      <td className="px-4 py-4 font-medium text-slate-700">{formatCurrency(item.quoteTotal)}</td>
      <td className="px-4 py-4 font-medium text-slate-700">{formatCurrency(item.adjustedCostTotal)}</td>
      <td className={`px-4 py-4 font-semibold ${item.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
        {formatCurrency(item.grossProfit)}
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex min-w-[108px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getReconciliationBadge(item.reconciliationConfirmed)}`}>
          {item.reconciliationConfirmed ? "已確認對帳" : "待確認對帳"}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getClosureBadge(item.status)}`}>
          {item.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <Link href={`/quote-cost/${item.project.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
          查看
        </Link>
      </td>
    </tr>
  );
}

export default function QuoteCostPage() {
  const items = getQuoteCostProjects();
  const activeItems = items.filter((item) => item.status !== "已結案");
  const closedItems = items.filter((item) => item.status === "已結案");

  return (
    <AppShell activePath="/quote-cost">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Quote & Cost</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">報價成本</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              以專案為主體集中管理對外報價、調整後成本、對帳與結案狀態。列表首屏先分成執行中與已結案，方便財務與 PM 快速切換工作區。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-sm text-slate-500">執行中</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{activeItems.length}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-sm text-slate-500">已結案</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{closedItems.length}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-sm text-slate-500">待確認對帳</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{items.filter((item) => !item.reconciliationConfirmed).length}</p>
            </article>
          </div>
        </div>
      </header>

      {[
        { title: "執行中", description: "優先處理尚未完成對帳或尚未手動結案的專案。", items: activeItems, tone: "border-blue-200 bg-blue-50/40" },
        { title: "已結案", description: "保留已完成對帳與人工結案的專案，作為歷史查核區。", items: closedItems, tone: "border-slate-200 bg-white" },
      ].map((section) => (
        <section key={section.title} className={`rounded-3xl border p-6 shadow-sm ring-1 ring-slate-200/80 ${section.tone}`}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{section.description}</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {section.items.length} 個專案
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-[1120px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">專案名稱</th>
                  <th className="px-4 py-3 font-medium">客戶名稱</th>
                  <th className="px-4 py-3 font-medium">活動日期</th>
                  <th className="px-4 py-3 font-medium">對外報價總額</th>
                  <th className="px-4 py-3 font-medium">調整後成本總額</th>
                  <th className="px-4 py-3 font-medium">差額 / 毛利</th>
                  <th className="px-4 py-3 font-medium">對帳狀態</th>
                  <th className="px-4 py-3 font-medium">結案狀態</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {section.items.map((item) => (
                  <ProjectRow key={item.project.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </AppShell>
  );
}
