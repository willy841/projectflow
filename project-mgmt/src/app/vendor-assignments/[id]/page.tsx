import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments, vendorPackages } from "@/components/vendor-data";
import { projects as projectSeeds } from "@/components/project-data";
import { FeedbackActionButtons, QuickFeedbackButtons } from "@/components/mock-workflow-feedback";
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
            <QuickFeedbackButtons
              secondaryLabel="輸出文件"
              secondaryMessage="已輸出目前 mock 發包文件預覽；正式版之後會承接到文件生成流程。"
              primaryLabel="複製文字"
              primaryMessage="已複製目前 mock 發包內容文字。"
            />
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">執行處理</h3>
            <p className="mt-1 text-sm text-slate-500">此層直接列出該廠商底下所有任務，並在這一頁完成發包前處理。</p>
          </div>
          <FeedbackActionButtons
            confirmLabel="確認（正式發包）"
            confirmMessage="目前這個廠商的執行處理區已確認；此動作在 mock 語意上等於正式發包，並導向 package 主線。"
          />
        </div>

        {relatedPackage ? (
          <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-900">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="font-semibold">此廠商已有承接中的 Package</p>
                <p className="mt-1 text-blue-800">確認（正式發包）後，這批內容在 mock 閉環中會承接到 {relatedPackage.code}。</p>
              </div>
              <Link
                href={`/vendor-packages/${relatedPackage.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                前往 Package 承接頁
              </Link>
            </div>
          </div>
        ) : null}

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
                  confirmMessage="這筆 vendor 處理方案已標記為目前版本的一部分；整區仍需再確認一次才正式發包。"
                  columnsClassName="md:grid-cols-3"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
