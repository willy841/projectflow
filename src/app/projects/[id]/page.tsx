import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getProjectById, getStatusClass } from "@/components/project-data";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">{project.code}</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(project.status)}`}>
                {project.status}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.note}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700">
              返回列表
            </Link>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
              編輯專案
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "活動日期", value: project.eventDate },
          { label: "活動地點", value: project.location },
          { label: "專案預算", value: project.budget },
          { label: "目前成本", value: project.cost },
        ].map((item) => (
          <article key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">專案基本資訊</h3>
              <p className="mt-1 text-sm text-slate-500">專案主檔與客戶聯繫窗口。</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>負責人：{project.owner}</p>
              <p className="mt-1">進度：{project.progress}%</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["客戶名稱", project.client],
              ["活動類型", project.eventType],
              ["聯繫人", project.contactName],
              ["電話", project.contactPhone],
              ["Email", project.contactEmail],
              ["LINE", project.contactLine],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h3 className="text-xl font-semibold">需求摘要</h3>
            <p className="mt-1 text-sm text-slate-500">從溝通需求拆解出的重點項目。</p>
          </div>

          <div className="space-y-3">
            {project.requirements.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{item.category}</p>
                    <h4 className="mt-1 font-semibold text-slate-900">{item.title}</h4>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">專案執行項目</h3>
            <p className="mt-1 text-sm text-slate-500">從討論項目展開執行，並由每個項目發起設計交辦或備品交辦。</p>
          </div>
          <Link
            href={`/projects/${project.id}/execution-items/new`}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            + 新增項目
          </Link>
        </div>

        <div className="space-y-4">
          {project.executionItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-semibold text-blue-600">{item.category}</p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {item.referenceExample ? <span>參考範例：{item.referenceExample}</span> : null}
                    <span>設計交辦：{item.designTaskCount ?? 0}</span>
                    <span>備品交辦：{item.procurementTaskCount ?? 0}</span>
                  </div>
                </div>

                <div className="grid w-full gap-2 sm:w-auto">
                  <button className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                    交辦
                  </button>
                  <Link
                    href={`/design-tasks/new?projectId=${project.id}&itemId=${item.id}&itemTitle=${encodeURIComponent(item.title)}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    設計交辦
                  </Link>
                  <button className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                    備品交辦
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">現有設計交辦</h3>
              <p className="mt-1 text-sm text-slate-500">目前已建立的設計任務清單。</p>
            </div>
            <Link href="/design-tasks" className="text-sm font-medium text-slate-700 hover:text-blue-600">查看全部</Link>
          </div>

          <div className="space-y-3">
            {project.designTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">負責人：{task.assignee}</p>
                    <p className="mt-1 text-sm text-slate-500">期限：{task.due}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">備品採購</h3>
              <p className="mt-1 text-sm text-slate-500">後續可延伸為備品採購與驗收流程。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增備品項目</button>
          </div>

          <div className="space-y-3">
            {project.procurementTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">採購：{task.buyer}</p>
                    <p className="mt-1 text-sm text-slate-500">預算：{task.budget}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
