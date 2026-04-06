import Link from "next/link";
import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

type SummaryCard = {
  label: string;
  value: string;
  hint: string;
  tone: "amber" | "emerald" | "violet" | "rose" | "sky";
};

type RevenueDetail = {
  project: string;
  client: string;
  category: string;
  status: string;
  amount: string;
};

type ExpenseDetail = {
  item: string;
  owner: string;
  status: string;
  amount: string;
};

const availableYears = [2026, 2025, 2024];
const availableMonths = [
  "1 月",
  "2 月",
  "3 月",
  "4 月",
  "5 月",
  "6 月",
  "7 月",
  "8 月",
  "9 月",
  "10 月",
  "11 月",
  "12 月",
];

const summaryCards: SummaryCard[] = [
  {
    label: "未收款",
    value: "NT$ 612,000",
    hint: "包含訂金與尾款待收金額",
    tone: "amber",
  },
  {
    label: "已帳款 / 已收款",
    value: "NT$ 1,486,000",
    hint: "承接執行中應收與結案後已完成入帳",
    tone: "emerald",
  },
  {
    label: "應付帳款",
    value: "NT$ 428,000",
    hint: "已對完帳且已進入廠商未付款區",
    tone: "violet",
  },
  {
    label: "人事成本",
    value: "NT$ 356,000",
    hint: "本月人工與內部執行成本 placeholder",
    tone: "rose",
  },
  {
    label: "庶務費用",
    value: "NT$ 94,000",
    hint: "行政、物流、雜支等營運費用 placeholder",
    tone: "sky",
  },
];

const revenueCollection: RevenueDetail[] = [
  {
    project: "春季新品發表會主視覺",
    client: "霓虹品牌顧問",
    category: "未收訂金",
    status: "執行中應收",
    amount: "NT$ 180,000",
  },
  {
    project: "企業家庭日活動統籌",
    client: "達曜科技",
    category: "未收尾款",
    status: "執行中應收",
    amount: "NT$ 252,000",
  },
  {
    project: "品牌巡迴快閃活動",
    client: "和曜生活",
    category: "已帳款 / 已收款",
    status: "結案承接",
    amount: "NT$ 468,000",
  },
];

const payableCollection: RevenueDetail[] = [
  {
    project: "活動燈光與音響統包",
    client: "星緯展演",
    category: "廠商未付款",
    status: "已對帳待出款",
    amount: "NT$ 210,000",
  },
  {
    project: "輸出物與施工進場",
    client: "光嶼製作",
    category: "廠商未付款",
    status: "已對帳待出款",
    amount: "NT$ 118,000",
  },
  {
    project: "倉儲與物流支援",
    client: "城北物流",
    category: "廠商未付款",
    status: "已對帳待出款",
    amount: "NT$ 100,000",
  },
];

const hrCollection: ExpenseDetail[] = [
  {
    item: "專案 PM / 執行統籌",
    owner: "內部人員",
    status: "本月估列",
    amount: "NT$ 168,000",
  },
  {
    item: "設計與完稿工時",
    owner: "設計團隊",
    status: "本月估列",
    amount: "NT$ 104,000",
  },
  {
    item: "現場支援與加班",
    owner: "執行支援",
    status: "本月估列",
    amount: "NT$ 84,000",
  },
];

const generalExpenseCollection: ExpenseDetail[] = [
  {
    item: "物流 / 車趟 / 運費",
    owner: "庶務費用",
    status: "本月費用",
    amount: "NT$ 42,000",
  },
  {
    item: "行政採買 / 雜支",
    owner: "庶務費用",
    status: "本月費用",
    amount: "NT$ 26,000",
  },
  {
    item: "倉儲 / 場地零星支出",
    owner: "庶務費用",
    status: "本月費用",
    amount: "NT$ 26,000",
  },
];

export function AccountingCenterPage() {
  return (
    <AppShell activePath="/accounting-center">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">帳務中心</h2>
              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                骨架版 / mock data
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              以月份 / 年份切換為主體，集中驗證營收、應付、人事成本與庶務費用的資訊架構。
              本頁目前只提供前端骨架與 placeholder data，不連正式資料。
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">年份</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableYears.map((year, index) => (
                  <button
                    key={year}
                    type="button"
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition ${
                      index === 0
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">月份</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableMonths.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    className={`rounded-2xl px-3.5 py-2 text-sm font-medium ring-1 transition ${
                      index === 3
                        ? "bg-blue-600 text-white ring-blue-600"
                        : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getToneClass(card.tone)}`}>
              核心欄位
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.95fr)]">
        <Panel
          eyebrow="營收"
          title="營收總覽"
          description="承接執行中的應收帳款與結案後已帳款，未收款需明確包含訂金與尾款。"
          action={
            <Link
              href="/quote-costs"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              查看報價成本
            </Link>
          }
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <SubPanel title="未收款 / 已帳款結構">
              <DataTable
                headers={["專案", "客戶", "帳務類型", "承接語意", "金額"]}
                rows={revenueCollection.map((item) => [item.project, item.client, item.category, item.status, item.amount])}
              />
            </SubPanel>

            <SubPanel title="營收語意提醒">
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">未收款包含：訂金待收 + 尾款待收。</li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">已帳款 / 已收款：承接已成立收入與結案後正式承接金額。</li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">首頁未來只做摘要入口，正式帳務主體以帳務中心為準。</li>
              </ul>
            </SubPanel>
          </div>
        </Panel>

        <Panel
          eyebrow="營收延伸"
          title="應付帳款"
          description="對應已對完帳且已進入廠商清單未付款區的金額，本輪先做資訊架構位置。"
        >
          <DataTable
            headers={["項目", "對象", "類型", "狀態", "金額"]}
            rows={payableCollection.map((item) => [item.project, item.client, item.category, item.status, item.amount])}
          />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel
          eyebrow="人事成本"
          title="人事成本區"
          description="集中呈現本月內部人工與執行人力成本，先以 mock 數字驗資訊階層。"
        >
          <DataTable
            headers={["項目", "歸屬", "狀態", "金額"]}
            rows={hrCollection.map((item) => [item.item, item.owner, item.status, item.amount])}
          />
        </Panel>

        <Panel
          eyebrow="庶務費用"
          title="庶務費用區"
          description="集中呈現行政、物流、雜支等營運成本，先確認頁面承接位置與卡位方式。"
        >
          <DataTable
            headers={["項目", "歸屬", "狀態", "金額"]}
            rows={generalExpenseCollection.map((item) => [item.item, item.owner, item.status, item.amount])}
          />
        </Panel>
      </section>
    </AppShell>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function SubPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 p-4">
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="align-top">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className={`px-4 py-3 ${cellIndex === row.length - 1 ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getToneClass(tone: SummaryCard["tone"]) {
  return {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
  }[tone];
}
