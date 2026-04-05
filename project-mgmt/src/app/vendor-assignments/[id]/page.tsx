import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments } from "@/components/vendor-data";
import { projects as projectSeeds } from "@/components/project-data";

const mockPlans = [
  {
    id: "vendor-plan-a",
    title: "主背板發包內容",
    requirement: "主背板輸出、裱板、現場安裝與收邊。",
    amount: "NT$ 68,000",
  },
  {
    id: "vendor-plan-b",
    title: "導視輸出發包內容",
    requirement: "入口指示、動線牌與桌牌輸出。",
    amount: "NT$ 24,000",
  },
];

export default async function VendorAssignmentVendorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ project?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const vendorName = decodeURIComponent(id);
  const projectId = resolvedSearch?.project;

  const tasks = vendorAssignments.filter(
    (assignment) => assignment.projectId === projectId && (assignment.selectedVendorName || "未指定廠商") === vendorName,
  );

  if (!tasks.length) {
    notFound();
  }

  const projectName = projectSeeds.find((project) => project.id === tasks[0].projectId)?.name || tasks[0].projectId;

  return (
    <AppShell activePath="/vendor-assignments">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">單廠商執行處理層</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{vendorName}</h2>
            <p className="mt-2 text-sm text-slate-500">{projectName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/vendor-assignments?project=${encodeURIComponent(projectId || "")}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              返回廠商列表
            </Link>
            <button className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              輸出文件
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              複製文字
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">執行處理</h3>
            <p className="mt-1 text-sm text-slate-500">此層直接列出該廠商底下所有任務，並在這一頁完成發包前處理。</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
            確認（正式發包）
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">任務標題</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">需求說明</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{task.summary}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {mockPlans.map((plan) => (
                  <div key={`${task.id}-${plan.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs text-slate-500">標題</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{plan.title}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 md:col-span-1">
                        <p className="text-xs text-slate-500">需求說明</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{plan.requirement}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs text-slate-500">金額</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{plan.amount}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                        儲存
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
