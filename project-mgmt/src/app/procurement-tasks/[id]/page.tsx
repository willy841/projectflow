import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { ProcurementPlanEditorClient } from "@/components/procurement-plan-editor-client";
import { getDbProcurementTaskById } from "@/lib/db/procurement-flow-adapter";
import { shouldUseDbProcurementFlow } from "@/lib/db/procurement-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

export default async function ProcurementTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbProcurementFlow() && isUuidLike(id);
  const task = useDb ? await getDbProcurementTaskById(id) : procurementTaskBoardRecords.find((record) => record.id === id);

  if (!task) notFound();

  return (
    <AppShell activePath="/procurement-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><h2 className="text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2></div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/procurement-tasks?project=${encodeURIComponent(task.projectId)}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">返回任務列表</Link>
            <Link href={`/procurement-tasks/${task.id}/document`} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">前往文件</Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4"><h3 className="text-xl font-semibold text-slate-900">原始任務資訊</h3></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2"><p className="text-xs text-slate-500">任務標題</p><p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">數量</p><p className="mt-2 text-sm font-medium text-slate-900">{task.quantity}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">預算</p><p className="mt-2 text-sm font-medium text-slate-900">{task.costLabel}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-3"><p className="text-xs text-slate-500">需求說明</p><p className="mt-2 text-sm font-medium text-slate-900">{task.note}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2"><p className="text-xs text-slate-500">參考連結</p>{task.referenceUrl ? <a href={task.referenceUrl} className="mt-2 block break-all text-sm font-medium text-slate-700 underline-offset-4 hover:underline">{task.referenceUrl}</a> : <p className="mt-2 text-sm font-medium text-slate-400">未填寫</p>}</div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <ProcurementPlanEditorClient
          taskId={task.id}
          initialPlans={task.plans.map((plan) => ({
            id: plan.id,
            title: plan.title,
            quantity: plan.quantity,
            amount: plan.amount,
            previewUrl: plan.previewUrl,
            vendor: plan.vendor,
          }))}
        />
      </section>
    </AppShell>
  );
}
