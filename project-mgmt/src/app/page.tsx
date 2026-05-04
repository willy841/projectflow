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
      <header className="px-1 py-2 text-white">
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">酷亞專案系統</h2>
              {overview.headlineBadges.map((badge) => (
                <span key={badge} className="pf-badge px-3 py-1.5 text-sm text-slate-300">{badge}</span>
              ))}
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 xl:items-end">
            <Link href="/projects/new" className="pf-btn-create h-11 px-4">
              + 新增專案
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {primaryMetrics.map((stat) => (
          <article key={stat.label} className="pf-panel-soft h-full p-5">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
        <article className="p-1">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-100">• 近期專案</h3>
            </div>
            <Link href="/projects" className="pf-btn-secondary rounded-xl px-3 py-2 !text-slate-200">
              查看全部
            </Link>
          </div>

          {overview.recentProjects.length ? (
            <div className="pf-table-shell rounded-2xl">
              <table className="pf-table min-w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-[38%] px-4 py-3 font-medium">專案</th>
                    <th className="w-[18%] px-4 py-3 font-medium">客戶</th>
                    <th className="w-[18%] px-4 py-3 font-medium">日期</th>
                    <th className="w-[16%] px-4 py-3 font-medium">負責人</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {overview.recentProjects.map((project) => (
                    <tr key={project.id} className="align-top hover:bg-white/6">
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

        <article className="p-1">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-slate-100">• 收款概況</h3>
            </div>
            <Link href="/quote-costs" className="pf-btn-secondary shrink-0 self-start px-4 py-2 text-slate-200">
              前往報價成本
            </Link>
          </div>

          {financeMetrics.length ? (
            <div className="space-y-3">
              {financeMetrics.map((item) => (
                <div key={item.label} className="pf-panel-soft px-4 py-4">
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
