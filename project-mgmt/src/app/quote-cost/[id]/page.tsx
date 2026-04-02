import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { formatCurrency, getQuoteCostProjects, getQuoteCostRecord } from "@/components/quote-cost-data";

export function generateStaticParams() {
  return getQuoteCostProjects().map((item) => ({ id: item.project.id }));
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </article>
  );
}

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getQuoteCostProjects().find((entry) => entry.project.id === id);
  const record = getQuoteCostRecord(id);

  if (!item || !record) notFound();

  const summarySteps = [
    {
      title: "1. 專案總覽",
      description: "先確認這是哪個專案、目前狀態與本頁工作的財務基準。",
    },
    {
      title: "2. 對外報價單",
      description: "收入端基準，後續差額與毛利都以這份匯入報價為準。",
    },
    {
      title: "3. 成本管理",
      description: "先看廠商，再看廠商底下的調整後成本與原始明細。",
    },
    {
      title: "4. 對帳 / 結案",
      description: "最後判斷是否已完成對帳，以及能否進入人工結案。",
    },
  ];

  return (
    <AppShell activePath="/quote-cost">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">Quote Cost Detail</p>
              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${item.status === "已結案" ? "bg-slate-100 text-slate-700 ring-slate-200" : "bg-blue-50 text-blue-700 ring-blue-200"}`}>
                {item.status}
              </span>
              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${item.reconciliationConfirmed ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                {item.reconciliationConfirmed ? "已確認對帳完成" : "尚未確認對帳完成"}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{item.project.name}</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{record.note}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/quote-cost" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
              返回報價成本列表
            </Link>
            <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              匯出對帳摘要
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 xl:grid-cols-4">
        {summarySteps.map((step, index) => (
          <article key={step.title} className={`rounded-2xl border p-4 shadow-sm ring-1 ${index === 2 ? "border-blue-200 bg-blue-50/60 ring-blue-100" : "border-slate-200 bg-white ring-slate-200/70"}`}>
            <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">1. 專案總覽</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">專案基本財務輪廓</h3>
          </div>
          <span className="inline-flex self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            {item.project.code}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="客戶名稱" value={item.project.client} hint={`活動日期：${item.project.eventDate}`} />
          <StatCard label="活動地點" value={item.project.location} hint={`進場時間：${item.project.loadInTime}`} />
          <StatCard label="調整後成本總額" value={formatCurrency(item.adjustedCostTotal)} hint={`原始總成本 ${formatCurrency(item.originalCostTotal)}`} />
          <StatCard label="差額 / 毛利" value={formatCurrency(item.grossProfit)} hint={item.grossProfit >= 0 ? "目前仍有毛利空間" : "成本已高於報價，需優先處理"} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">2. 對外報價單</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">收入端基準</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">報價單以 Excel 匯入建立，系統保留明細列數與匯入時間，作為後續對帳依據。</p>
          </div>
          <span className="inline-flex self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            已匯入報價單
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">檔案名稱</p>
                <h4 className="mt-2 text-lg font-semibold text-slate-900">{record.quoteFileName}</h4>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {record.quoteLineCount} 列明細
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">對外報價總額</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(record.quoteTotal)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">匯入時間</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{record.quoteImportedAt}</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <p className="text-sm font-semibold text-blue-700">閱讀提醒</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• 對外報價單是收入端基準，不直接等於成本總額。</li>
              <li>• 差額 / 毛利皆以此處報價總額對比調整後成本總額。</li>
              <li>• 若未匯入報價單，不應進入結案判斷。</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">3. 成本管理</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">先看廠商，再看明細</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">預設顯示調整後總額；若要回查來源，再進各廠商區塊看原始總額與原始成本明細。</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-slate-200">主顯示：調整後成本</span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200">展開看：原始總額 / 來源紀錄</span>
          </div>
        </div>

        <div className="space-y-4">
          {item.costGroups
            .slice()
            .sort((a, b) => Number(!b.vendorName) - Number(!a.vendorName))
            .map((group) => {
              const adjustedTotal = group.lines.reduce((total, line) => total + line.adjustedAmount, 0);
              const originalTotal = group.lines.reduce((total, line) => total + line.originalAmount, 0);
              const isUnassigned = !group.vendorName;

              return (
                <details key={group.vendorName ?? "unassigned"} open={!isUnassigned} className={`group rounded-3xl border shadow-sm ring-1 ${isUnassigned ? "border-slate-200 bg-slate-50/70 ring-slate-200/70" : "border-slate-200 bg-white ring-slate-200/80"}`}>
                  <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-900">{group.vendorName ?? "未指定廠商"}</h4>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${isUnassigned ? "bg-slate-200/80 text-slate-700 ring-slate-300" : "bg-blue-50 text-blue-700 ring-blue-200"}`}>
                          {isUnassigned ? "待補綁 vendor" : `${group.lines.length} 筆成本明細`}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {isUnassigned ? "可見但降權呈現，避免搶主畫面；待補綁正式 vendor 後再歸入對應廠商。" : "首屏先看廠商與調整後總額；需要追來源時再展開。"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-sm">
                      <div>
                        <p className="text-xs text-slate-300">調整後總額</p>
                        <p className="mt-1 text-xl font-semibold">{formatCurrency(adjustedTotal)}</p>
                      </div>
                    </div>
                  </summary>

                  <div className="border-t border-slate-200 px-5 py-5">
                    <div className="mb-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">原始總額</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(originalTotal)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">調整差異</p>
                        <p className={`mt-2 text-lg font-semibold ${adjustedTotal - originalTotal > 0 ? "text-amber-700" : adjustedTotal - originalTotal < 0 ? "text-emerald-700" : "text-slate-900"}`}>
                          {formatCurrency(adjustedTotal - originalTotal)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">成本明細數</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{group.lines.length} 筆</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.lines.map((line) => (
                        <article key={line.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="font-semibold text-slate-900">{line.title}</h5>
                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">{line.source}</span>
                              </div>
                              <p className="mt-2 text-sm text-slate-500">來源紀錄：{line.sourceLabel}</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                                <p className="text-xs text-slate-300">調整後金額</p>
                                <p className="mt-1 text-lg font-semibold">{formatCurrency(line.adjustedAmount)}</p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                                <p className="text-xs text-slate-500">原始成本</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(line.originalAmount)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">查看原始成本</button>
                            <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">直接修改成本</button>
                            <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">補 / 改關聯廠商</button>
                            <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">回看來源紀錄</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">4. 對帳 / 結案</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">結案前最後檢查</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">先看是否已確認對帳完成，再看是否滿足可結案條件，最後才進入人工結案。</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-right">
            <p className="text-xs text-slate-500">差額 / 毛利</p>
            <p className={`mt-1 text-xl font-semibold ${item.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(item.grossProfit)}</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="grid gap-4 md:grid-cols-2">
            <article className={`rounded-2xl border p-5 ring-1 ${record.reconciliationConfirmed ? "border-emerald-200 bg-emerald-50/70 ring-emerald-100" : "border-amber-200 bg-amber-50/70 ring-amber-100"}`}>
              <p className="text-sm font-semibold text-slate-900">已確認對帳完成</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{record.reconciliationConfirmed ? "是" : "否"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{record.reconciliationConfirmed ? `確認時間：${record.reconciliationConfirmedAt}` : "尚未執行明確的確認對帳完成步驟。"}</p>
            </article>

            <article className={`rounded-2xl border p-5 ring-1 ${record.closeable ? "border-blue-200 bg-blue-50/70 ring-blue-100" : "border-slate-200 bg-slate-50/80 ring-slate-200/70"}`}>
              <p className="text-sm font-semibold text-slate-900">目前可否結案</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{record.closeable ? "可結案" : "不可結案"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{record.closeable ? "必要條件已滿足，仍需由人手動按結案。" : "仍有前置條件未完成，暫不可直接切換為已結案。"}</p>
            </article>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-sm font-semibold text-slate-200">結案條件檢查</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "已匯入對外報價單", ok: true },
                { label: "已有成本明細", ok: item.adjustedCostTotal > 0 },
                { label: "已確認對帳完成", ok: record.reconciliationConfirmed },
                { label: "可由人手動按結案", ok: record.closeable },
              ].map((check) => (
                <div key={check.label} className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3">
                  <span className="text-slate-100">{check.label}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${check.ok ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30" : "bg-amber-500/15 text-amber-200 ring-amber-400/30"}`}>
                    {check.ok ? "已完成" : "未完成"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">確認對帳完成</button>
              <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${record.closeable ? "bg-blue-500 text-white hover:bg-blue-400" : "cursor-not-allowed bg-slate-700 text-slate-300"}`}>
                手動結案
              </button>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
