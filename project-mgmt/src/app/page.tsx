import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getProjectRouteId, getStatusClass, projects } from "@/components/project-data";

const stats = [
  { label: "進行中專案", value: "18", change: "+3 本週" },
  { label: "待處理設計交辦", value: "27", change: "8 件逾期" },
  { label: "待採購備品", value: "14", change: "5 件待下單" },
  { label: "未付款項", value: "9", change: "NT$ 486,000" },
];

const finance = [
  { label: "本月已收款", value: "NT$ 1,280,000" },
  { label: "本月未收款", value: "NT$ 620,000" },
  { label: "本月已付款", value: "NT$ 734,000" },
  { label: "本月預估毛利", value: "NT$ 546,000" },
];

export default function Home() {
  return (
    <AppShell activePath="/">
      <header className="relative overflow-hidden rounded-[32px] bg-slate-950 p-7 text-white shadow-lg ring-1 ring-slate-900/80 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_35%)]" />
        <div className="relative flex flex-col gap-8 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              酷亞專案系統
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">18 個進行中專案</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">27 個待處理交辦</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">本月毛利預估 NT$ 546,000</span>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 xl:items-end">
            <Link
              href="/projects/new"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              + 新增專案
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/14 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              查看專案列表
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
            <p className="mt-2 text-sm font-medium text-blue-600">{stat.change}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">近期專案</h3>
              <p className="mt-1 text-sm text-slate-500">依活動日期排序，快速追蹤進度、責任人與執行狀態。</p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              查看全部
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full table-fixed divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500">
                <tr>
                  <th className="w-[32%] px-4 py-3 font-medium">專案</th>
                  <th className="w-[12%] px-4 py-3 font-medium">客戶</th>
                  <th className="w-[14%] px-4 py-3 font-medium">日期</th>
                  <th className="w-[14%] px-4 py-3 font-medium">狀態</th>
                  <th className="w-[10%] px-4 py-3 font-medium">負責人</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {projects.map((project) => (
                  <tr key={project.code} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-4 py-4 align-top">
                      <Link
                        href={`/projects/${getProjectRouteId(project)}`}
                        className="line-clamp-2 font-semibold leading-6 text-slate-900 underline-offset-4 hover:text-blue-600 hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="break-words px-4 py-4 align-top text-slate-600">{project.client}</td>
                    <td className="px-4 py-4 align-top text-slate-600 break-words">{project.eventDate}</td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex min-w-[72px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{project.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-slate-900">本月財務摘要</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">提供管理層快速查看現金流壓力與毛利概況，正式主體請進帳務中心。</p>
            </div>
            <Link
              href="/accounting-center"
              className="inline-flex shrink-0 self-start items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              前往帳務中心
            </Link>
          </div>

          <div className="space-y-3">
            {finance.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

    </AppShell>
  );
}
