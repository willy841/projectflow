import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments, vendorPackages } from "@/components/vendor-data";
import { projects as projectSeeds } from "@/components/project-data";
import { FeedbackActionButtons } from "@/components/mock-workflow-feedback";
import { MockEditablePlanList } from "@/components/mock-editable-plan-list";

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
  const relatedPackage = vendorPackages.find((pkg) => pkg.projectId === projectId && pkg.vendorName === vendorName);

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
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-slate-900">執行處理</h3>
            <button
              id={`vendor-add-plan-${vendorName}-${projectId || "default"}`}
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              新增執行處理
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {relatedPackage ? (
              <Link
                href={`/vendor-packages/${relatedPackage.id}`}
                className="inline-flex items-center justify-center rounded-2xl border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                前往最終文件
              </Link>
            ) : null}
            <FeedbackActionButtons
              hideSave
              confirmLabel="全部確認"
              confirmMessage="目前這個廠商的執行處理區已全部確認；此動作在 mock 語意上等於正式發包，並導向最終文件承接頁。"
            />
          </div>
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

              <div className="mt-4">
                <MockEditablePlanList
                  taskId={task.id}
                  mode="vendor"
                  plans={mockPlans.map((plan) => ({
                    id: `${task.id}-${plan.id}`,
                    fields: [
                      { key: "title", label: "標題", value: plan.title },
                      { key: "requirement", label: "需求說明", value: plan.requirement, type: "textarea" },
                      { key: "amount", label: "金額", value: plan.amount },
                    ],
                  }))}
                  addTemplate={[
                    { key: "title", label: "標題", value: "" },
                    { key: "requirement", label: "需求說明", value: "", type: "textarea" },
                    { key: "amount", label: "金額", value: "" },
                  ]}
                  saveMessage="已儲存這筆 vendor 處理方案。"
                  confirmMessage="已確認目前 vendor 處理內容；後續承接會以這次確認結果為準。"
                  columnsClassName="md:grid-cols-3"
                  externalAddButtonId={`vendor-add-plan-${vendorName}-${projectId || "default"}`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
