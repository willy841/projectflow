import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";

export const dynamic = "force-dynamic";

const quickLinks = [
  { label: "專案管理", href: "/projects", description: "查看與管理正式專案資料。" },
  { label: "廠商資料", href: "/vendors", description: "查看廠商主檔、付款與往來紀錄。" },
  { label: "報價成本", href: "/quote-costs", description: "查看報價、成本與收款相關頁面。" },
  { label: "帳務中心", href: "/accounting-center", description: "查看收款、支出與帳務彙整。" },
];

export default async function Home() {
  return (
    <AppShellAuth>
      <header className="px-1 py-2 text-white">
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">酷亞專案系統</h2>
              <span className="pf-badge px-3 py-1.5 text-sm text-slate-300">正式入口頁</span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              目前首頁已先切換為穩定入口頁，方便你從正式網址快速進入核心功能。後續若要恢復更完整的 dashboard overview，
              會再另外收斂首頁專屬 read-model / render 問題。
            </p>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 xl:items-end">
            <Link href="/projects/new" className="pf-btn-create h-11 px-4">
              + 新增專案
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <article key={item.href} className="pf-panel-soft h-full p-5">
            <p className="text-sm text-slate-400">快速入口</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">{item.label}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            <div className="mt-5">
              <Link href={item.href} className="pf-btn-secondary rounded-xl px-3 py-2 !text-slate-200">
                前往 {item.label}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </AppShellAuth>
  );
}
