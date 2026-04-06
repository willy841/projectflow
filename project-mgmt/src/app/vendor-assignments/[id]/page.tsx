import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments } from "@/components/vendor-data";
import { VendorPlanEditorClient } from "@/components/vendor-plan-editor-client";
import { getDbVendorTaskById } from "@/lib/db/vendor-flow-adapter";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

export default async function VendorAssignmentTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbVendorFlow() && isUuidLike(id);
  if (!useDb) notFound();

  const task = await getDbVendorTaskById(id);
  if (!task) notFound();

  return (
    <AppShell activePath="/vendor-assignments">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">單 vendor 任務執行處理層</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{task.vendorName}</h2>
            <p className="mt-2 text-sm text-slate-500">{task.projectName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/vendor-assignments?project=${encodeURIComponent(task.projectId)}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">返回任務列表</Link>
            <Link href={`/vendor-assignments/${task.id}/document`} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">前往最終文件頁</Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4"><h3 className="text-xl font-semibold text-slate-900">原始任務資訊</h3></div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">任務標題</p><p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">需求說明</p><p className="mt-2 text-sm font-medium text-slate-900">{task.requirementText || '未填寫'}</p></div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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
    </AppShell>
  );
}
