import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProcurementPlanEditorClient } from "@/components/procurement-plan-editor-client";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { WorkspaceHeader, WorkspaceSection, WorkspaceStat } from "@/components/workspace-ui";
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
      <WorkspaceHeader
        title={task.title}
        meta={task.projectName}
        actions={
          <>
            <Link href={`/procurement-tasks?project=${encodeURIComponent(task.projectId)}`} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">返回任務列表</Link>
            <Link href={`/procurement-tasks/${task.id}/document`} className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">前往文件</Link>
          </>
        }
      />

      <WorkspaceSection title="原始任務資訊">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <WorkspaceStat label="任務標題" value={task.title} />
          <WorkspaceStat label="數量" value={task.quantity} />
          <WorkspaceStat label="預算" value={task.costLabel} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 xl:col-span-3">
            <p className="text-xs font-medium tracking-wide text-slate-500">需求說明</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.note}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 xl:col-span-2">
            <p className="text-xs font-medium tracking-wide text-slate-500">參考連結</p>
            {task.referenceUrl ? <a href={task.referenceUrl} className="mt-2 block break-all text-sm font-medium text-slate-700 underline-offset-4 hover:underline">{task.referenceUrl}</a> : <p className="mt-2 text-sm font-medium text-slate-400">未填寫</p>}
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="執行處理">
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
      </WorkspaceSection>
    </AppShell>
  );
}
