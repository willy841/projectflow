import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VendorPlanEditorClient } from "@/components/vendor-plan-editor-client";
import { buildVendorPackageId } from "@/lib/db/vendor-package-adapter";
import { getDbVendorGroupDetail, getDbVendorTaskById } from "@/lib/db/vendor-flow-adapter";
import { parseVendorGroupRouteId } from "@/lib/db/vendor-group-route";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

export default async function VendorAssignmentTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbVendorFlow();
  if (!useDb) notFound();

  const groupRoute = parseVendorGroupRouteId(id);
  const group = groupRoute
    ? await getDbVendorGroupDetail(groupRoute.projectId, groupRoute.vendorId)
    : isUuidLike(id)
      ? await (async () => {
          const task = await getDbVendorTaskById(id);
          if (!task) return null;
          return getDbVendorGroupDetail(task.projectId, task.vendorId);
        })()
      : null;

  if (!group) notFound();

  const packageId = buildVendorPackageId(group.projectId, group.vendorId);

  return (
    <AppShell activePath="/vendor-assignments">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">單 vendor 群組執行處理層</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{group.vendorName}</h2>
            <p className="mt-2 text-sm text-slate-500">{group.projectName} ・ 共 {group.tasks.length} 筆任務</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/vendor-assignments?project=${encodeURIComponent(group.projectId)}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">返回任務列表</Link>
            <Link href={`/vendor-packages/${packageId}`} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">前往最終文件頁</Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">專案</p><p className="mt-2 text-sm font-medium text-slate-900">{group.projectName}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">活動日期</p><p className="mt-2 text-sm font-medium text-slate-900">{group.eventDate}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">群組任務數</p><p className="mt-2 text-sm font-medium text-slate-900">{group.tasks.length}</p></div>
        </div>
      </section>

      <div className="space-y-6">
        {group.tasks.map((task, index) => (
          <section key={task.id} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm text-slate-500">群組任務 {index + 1}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{task.title}</h3>
              </div>
              <Link href={`/vendor-assignments/${task.id}/document`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">用此任務入口前往文件</Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">任務標題</p><p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p></div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">需求說明</p><p className="mt-2 text-sm font-medium text-slate-900">{task.requirementText || '未填寫'}</p></div>
            </div>

            <VendorPlanEditorClient
              taskId={task.id}
              initialPlans={task.plans.map((plan) => ({
                id: plan.id,
                title: plan.title,
                requirement: plan.requirement,
                amount: plan.amount,
              }))}
            />
          </section>
        ))}
      </div>
    </AppShell>
  );
}
