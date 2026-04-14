import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getProjectRouteId } from "@/components/project-data";
import { getHomeOverviewReadModel } from "@/lib/db/home-overview-read-model";

export default async function Home() {
  const overview = await getHomeOverviewReadModel();
  const primaryMetrics = overview.metrics.slice(0, 4);
  const financeMetrics = overview.metrics.slice(4);

  return (
    <AppShell activePath="/">
      <header className="relative overflow-hidden rounded-[32px] bg-slate-950 p-7 text-white shadow-lg ring-1 ring-slate-900/80 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_35%)]" />
        <div className="relative flex flex-col gap-8 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">酷亞專案系統</h2>
              {overview.headlineBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">{badge}</span>
              ))}
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 xl:items-end">
            <Link href="/projects/new" className="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white px-5 py-3.5 text-sm font-semibold !text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-white/40">
              + 新增專案
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {primaryMetrics.map((stat) => (
          <article key={stat.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">近期專案</h3>
            </div>
            <Link href="/projects" className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold !text-slate-800 transition hover:bg-slate-100">
              查看全部
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full table-fixed divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500">
                <tr>
                  <th className="w-[38%] px-4 py-3 font-medium">專案</th>
                  <th className="w-[18%] px-4 py-3 font-medium">客戶</th>
                  <th className="w-[18%] px-4 py-3 font-medium">日期</th>
                  <th className="w-[16%] px-4 py-3 font-medium">負責人</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {overview.recentProjects.map((project) => (
                  <tr key={project.id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-4 py-4 align-top">
                      <Link href={`/projects/${getProjectRouteId({ id: project.id, name: project.name })}`} className="line-clamp-2 font-semibold leading-6 text-slate-900 underline-offset-4 hover:text-slate-700 hover:underline">
                        {project.name}
                      </Link>
                    </td>
                    <td className="break-words px-4 py-4 align-top text-slate-600">{project.client}</td>
                    <td className="break-words px-4 py-4 align-top text-slate-600">{project.eventDate}</td>
                    <td className="px-4 py-4 text-slate-600">{project.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-slate-900">收款概況</h3>
            </div>
            <Link href="/quote-costs" className="inline-flex shrink-0 self-start items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
              前往報價成本
            </Link>
          </div>

          <div className="space-y-3">
            {financeMetrics.map((item) => (
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
