import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getStatusClass } from "@/components/project-data";
import { getDesignTaskById } from "@/components/design-task-data";

export default async function DesignTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getDesignTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">{task.projectCode}</p>
              <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                {task.status}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{task.projectName}・{task.client}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/design-tasks"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              返回交辦列表
            </Link>
            <Link
              href={`/design-tasks/${task.id}/edit`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              編輯交辦
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "負責設計", value: task.assignee },
          { label: "交期", value: task.due },
          { label: "發包狀態", value: task.outsourceStatus },
          { label: "預估成本", value: task.cost },
        ].map((item) => (
          <article key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-slate-900">交辦規格</h3>
            <p className="mt-1 text-sm text-slate-500">設計任務的主要欄位與製作資訊。</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["尺寸", task.size],
              ["材質", task.material],
              ["數量", task.quantity],
              ["結構圖", task.structureRequired],
              ["發包對象", task.outsourceTarget],
              ["專案負責人", task.owner],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">需求 / 備註</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{task.note}</p>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">關聯資訊</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-slate-500">所屬專案</p>
                <Link href={`/projects/${task.projectId}`} className="mt-1 inline-block font-semibold text-blue-600 underline-offset-4 hover:underline">
                  {task.projectName}
                </Link>
              </div>
              <div>
                <p className="text-slate-500">客戶</p>
                <p className="mt-1 font-medium text-slate-900">{task.client}</p>
              </div>
              <div>
                <p className="text-slate-500">參考連結</p>
                <a href={task.referenceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-blue-600 underline-offset-4 hover:underline">
                  開啟參考資料
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">下一步可延伸</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <p>1. 補設計交辦編輯功能</p>
              <p>2. 增加狀態切換與指派流程</p>
              <p>3. 補發包記錄與附件上傳</p>
              <p>4. 接資料庫做真正 CRUD</p>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
