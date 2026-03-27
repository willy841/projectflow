import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CopyEventInfoButton } from "@/components/copy-event-info-button";
import { ExecutionTree } from "@/components/execution-tree";
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
              <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(project.status)}`}>
                {project.status}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.note}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <CopyEventInfoButton
              projectName={project.name}
              eventDate={project.eventDate}
              location={project.location}
              loadInTime={project.loadInTime}
            />
            <Link href="/projects" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
              返回列表
            </Link>
            <button className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              編輯專案
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {[
          { label: "活動日期", value: project.eventDate },
          { label: "活動地點", value: project.location },
          { label: "進場時間", value: project.loadInTime },
          { label: "專案預算", value: project.budget },
          { label: "目前成本", value: project.cost },
        ].map((item) => (
          <article key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold">專案基本資訊</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">專案主檔與客戶聯繫窗口。</p>
            </div>
            <div className="text-left text-sm text-slate-500 sm:text-right">
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
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">{item.category}</p>
                    <h4 className="mt-1 font-semibold text-slate-900">{item.title}</h4>
                  </div>
                  <span className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">專案執行項目</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">改成樹狀子項目操作，可直接展開、收合，並在項目底下新增子項目。</p>
          </div>
        </div>

        <ExecutionTree projectId={project.id} items={project.executionItems} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold">專案設計</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">顯示此專案目前已建立的設計任務。</p>
            </div>
            <Link href="/design-tasks" className="text-sm font-medium text-slate-700 hover:text-blue-600">查看全部</Link>
          </div>

          <div className="space-y-3">
            {project.designTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">負責人：{task.assignee}</p>
                    <p className="mt-1 text-sm text-slate-500">期限：{task.due}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
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
              <h3 className="text-xl font-semibold">專案備品</h3>
              <p className="mt-1 text-sm text-slate-500">顯示此專案目前已建立的備品交辦與採購項目。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增備品項目</button>
          </div>

          <div className="space-y-3">
            {project.procurementTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">採購：{task.buyer}</p>
                    <p className="mt-1 text-sm text-slate-500">預算：{task.budget}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
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
