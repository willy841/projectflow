import Link from "next/link";

export function QuoteCostDetailShell() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="text-2xl font-semibold text-slate-900">舊版報價成本詳情已停用</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        目前請改走新的 <code>/quote-cost/[id]</code> 路由。此元件僅保留為相容 stub，避免舊檔型別檢查失敗。
      </p>
      <Link href="/quote-cost" className="mt-4 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
        返回報價成本列表
      </Link>
    </section>
  );
}
