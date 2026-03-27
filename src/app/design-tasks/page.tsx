import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getStatusClass, projects } from "@/components/project-data";
import { designTaskGroups } from "@/components/design-task-data";

export default function DesignTasksPage() {
  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Design Task Center</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">設計交辦中心</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              這一版先讓你測試設計交辦頁的瀏覽流程，集中查看所有專案的設計任務、需求欄位與目前狀態，下一階段再接真正的新增與編輯功能。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/design-tasks/new"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + 新增設計交辦
            </Link>
            <Link
              href="/projects"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              返回專案列表
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">設計交辦總數</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{designTaskGroups.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">進行中</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {designTaskGroups.filter((task) => task.status === "進行中").length}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">待確認</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {designTaskGroups.filter((task) => task.status === "待確認").length}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">關聯專案</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{projects.length}</p>
        </article>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-slate-900">設計交辦列表</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">依專案集中顯示目前的設計任務與狀態。</p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                placeholder="搜尋專案 / 設計項目"
                className="h-11 w-full min-w-0 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400 lg:w-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            {designTaskGroups.map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">{task.projectCode}</p>
                      <Link href={`/design-tasks/${task.id}`} className="mt-1 block text-lg font-semibold text-slate-900 underline-offset-4 hover:text-blue-600 hover:underline">
                        {task.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-600">{task.projectName}・{task.client}</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">尺寸</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.size}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">材質</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.material}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">數量</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.quantity}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">交期</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{task.due}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">需求 / 備註</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{task.note}</p>
                    </div>
                  </div>

                  <div className="w-full max-w-xs space-y-3 lg:w-72">
                    <span className={`inline-flex min-w-[72px] items-center justify-center self-start whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">負責設計</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{task.assignee}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">專案負責人</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{task.owner}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">參考連結</p>
                      <a href={task.referenceUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-medium text-blue-600 underline-offset-4 hover:underline">
                        開啟參考資料
                      </a>
                    </div>

                    <div className="grid gap-2">
                      <Link
                        href={`/design-tasks/${task.id}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        查看交辦詳情
                      </Link>
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        查看所屬專案
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">測試重點</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• 「新增設計交辦」現在可以進入表單頁。</li>
              <li>• 每一筆設計交辦都可以點進單筆詳細頁。</li>
              <li>• 先用假資料讓你確認欄位結構與資訊層級。</li>
              <li>• 下一階段可再補編輯、狀態更新與真正儲存功能。</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">下一步建議</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <p>1. 補設計交辦編輯頁</p>
              <p>2. 把新增交辦真正寫進資料來源</p>
              <p>3. 增加狀態切換與指派功能</p>
              <p>4. 接資料庫後再做完整 CRUD</p>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
