import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { getProjectRouteId } from "@/components/project-data";
import { WorkspaceEmptyState } from "@/components/workspace-ui";
import { getHomeOverviewReadModel } from "@/lib/db/home-overview-read-model";

export default async function Home() {
  const overview = await getHomeOverviewReadModel();
  const primaryMetrics = overview.metrics.slice(0, 4);
  const financeMetrics = overview.metrics.slice(4);

  return (
    <AppShellAuth activePath="/">
      <header className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_32%)]" />
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
            <Link href="/projects/new" className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(59,130,246,0.42),rgba(37,99,235,0.24))] px-4 text-sm font-semibold text-white shadow-[0_24px_48px_-26px_rgba(30,64,175,0.7),0_0_26px_rgba(96,165,250,0.16),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition hover:brightness-105 hover:shadow-[0_0_28px_rgba(96,165,250,0.24)]">
              + 新增專案
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {primaryMetrics.map((stat) => (
          <article key={stat.label} className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(36,48,72,0.76),rgba(14,22,39,0.52))] p-5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px]">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
        <article className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.72),rgba(13,22,39,0.52))] p-6 shadow-[0_34px_90px_-38px_rgba(0,0,0,0.68),0_0_34px_rgba(96,165,250,0.08),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-22px_44px_-28px_rgba(7,13,25,0.98)] backdrop-blur-[28px]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-100">近期專案</h3>
            </div>
            <Link href="/projects" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm font-semibold !text-slate-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition hover:bg-slate-900/60">
              查看全部
            </Link>
          </div>

          {overview.recentProjects.length ? (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl">
              <table className="min-w-full table-fixed divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.04] text-slate-400">
                  <tr>
                    <th className="w-[38%] px-4 py-3 font-medium">專案</th>
                    <th className="w-[18%] px-4 py-3 font-medium">客戶</th>
                    <th className="w-[18%] px-4 py-3 font-medium">日期</th>
                    <th className="w-[16%] px-4 py-3 font-medium">負責人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {overview.recentProjects.map((project) => (
                    <tr key={project.id} className="align-top transition hover:bg-white/6">
                      <td className="px-4 py-4 align-top">
                        <Link href={`/projects/${getProjectRouteId({ id: project.id, name: project.name })}`} className="line-clamp-2 font-semibold leading-6 text-slate-100 underline-offset-4 hover:text-slate-200 hover:underline">
                          {project.name}
                        </Link>
                      </td>
                      <td className="break-words px-4 py-4 align-top text-slate-300">{project.client}</td>
                      <td className="break-words px-4 py-4 align-top text-slate-300">{project.eventDate}</td>
                      <td className="px-4 py-4 text-slate-300">{project.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <WorkspaceEmptyState
              title="目前尚無近期專案"
              description="待正式 DB 端已有可顯示專案後，首頁才會在這裡顯示最近更新內容。"
            />
          )}
        </article>

        <article className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.72),rgba(13,22,39,0.52))] p-6 shadow-[0_34px_90px_-38px_rgba(0,0,0,0.68),0_0_34px_rgba(96,165,250,0.08),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-22px_44px_-28px_rgba(7,13,25,0.98)] backdrop-blur-[28px]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-slate-100">收款概況</h3>
            </div>
            <Link href="/quote-costs" className="inline-flex shrink-0 self-start items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition hover:bg-slate-900/60">
              前往報價成本
            </Link>
          </div>

          {financeMetrics.length ? (
            <div className="space-y-3">
              {financeMetrics.map((item) => (
                <div key={item.label} className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(36,48,72,0.76),rgba(14,22,39,0.52))] px-4 py-4 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px]">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <WorkspaceEmptyState
              title="目前尚無收款概況"
              description="待正式 DB 端已有收款或報價成本資料後，首頁才會在這裡顯示匯總結果。"
            />
          )}
        </article>
      </section>
    </AppShellAuth>
  );
}
