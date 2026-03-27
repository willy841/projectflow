import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getStatusClass, projects } from "@/components/project-data";

const designTaskGroups = projects.flatMap((project) =>
  project.designTasks.map((task, index) => ({
    id: `${project.id}-${index}`,
    projectId: project.id,
    projectName: project.name,
    projectCode: project.code,
    client: project.client,
    owner: project.owner,
    title: task.title,
    assignee: task.assignee,
    due: task.due,
    status: task.status,
    size: index === 0 ? "W240 x H300 cm" : "A1 / 594 x 841 mm",
    material: index === 0 ? "珍珠板 + 輸出貼圖" : "海報紙 + 霧膜",
    quantity: index === 0 ? "1 式" : "2 張",
    referenceUrl: "https://example.com/reference",
    note: index === 0 ? "請延續主視覺，需搭配現場燈箱與入口動線。" : "需保留二次修改空間，週五前送審。",
  }))
);

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
            <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              + 新增設計交辦
            </button>
            <Link
              href="/projects"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              返回專案列表
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">設計交辦列表</h3>
              <p className="mt-1 text-sm text-slate-500">依專案集中顯示目前的設計任務與狀態。</p>
            </div>
            <div className="flex gap-3">
              <input
                placeholder="搜尋專案 / 設計項目"
                className="h-11 w-64 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
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
                      <h4 className="mt-1 text-lg font-semibold text-slate-900">{task.title}</h4>
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
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
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

                    <Link
                      href={`/projects/${task.projectId}`}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      查看所屬專案
                    </Link>
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
              <li>• 側邊欄的「設計交辦」現在可以直接點進來。</li>
              <li>• 專案詳細頁也可以跳轉到交辦中心。</li>
              <li>• 先用假資料讓你確認欄位結構與資訊層級。</li>
              <li>• 下一階段可再補「新增 / 編輯 / 狀態更新 / 指派」功能。</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">下一步建議</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <p>1. 做單筆設計交辦詳細頁</p>
              <p>2. 補新增設計交辦表單</p>
              <p>3. 把設計交辦掛回各專案內可管理</p>
              <p>4. 接資料庫後再做真正 CRUD</p>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
