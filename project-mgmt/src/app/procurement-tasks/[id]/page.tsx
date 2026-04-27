import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShellAuth } from "@/components/app-shell-auth";
import { ProcurementTaskWorkspace } from "@/components/procurement-task-workspace";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { WorkspaceHeader, WorkspaceSection, WorkspaceStat, workspacePrimaryButtonClass } from "@/components/workspace-ui";
import { getDbProcurementTaskById } from "@/lib/db/procurement-flow-adapter";
import { shouldUseDbProcurementFlow } from "@/lib/db/procurement-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

export default async function ProcurementTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbProcurementFlow() && isUuidLike(id);
  const task = useDb ? await getDbProcurementTaskById(id) : procurementTaskBoardRecords.find((record) => record.id === id);

  if (!task) notFound();

  return (
    <AppShellAuth activePath="/procurement-tasks">
      <WorkspaceHeader
        title={task.title}
        meta={task.projectName}
        actions={
          <>
            <Link href={`/procurement-tasks?project=${encodeURIComponent(task.projectId)}`} className={workspacePrimaryButtonClass}>返回任務列表</Link>
            <Link href={`/projects/${encodeURIComponent(task.projectId)}/procurement-document`} className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">前往文件</Link>
          </>
        }
      />

      <WorkspaceSection title="原始任務資訊">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <WorkspaceStat label="任務標題" value={task.title} />
          <WorkspaceStat label="數量" value={task.quantity} />
          <WorkspaceStat label="預算" value={task.costLabel} />
          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(36,48,72,0.76),rgba(14,22,39,0.52))] px-4 py-3.5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px] xl:col-span-3">
            <p className="text-xs font-medium tracking-wide text-slate-400">需求說明</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{task.note}</p>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(36,48,72,0.76),rgba(14,22,39,0.52))] px-4 py-3.5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px] xl:col-span-2">
            <p className="text-xs font-medium tracking-wide text-slate-400">參考連結</p>
            {task.referenceUrl ? <a href={task.referenceUrl} className="mt-2 block break-all text-sm font-medium text-sky-200 underline-offset-4 hover:text-sky-100 hover:underline">{task.referenceUrl}</a> : <p className="mt-2 text-sm font-medium text-slate-400">未填寫</p>}
          </div>
        </div>
      </WorkspaceSection>

      <ProcurementTaskWorkspace
        taskId={task.id}
        projectId={task.projectId}
        taskTitle={task.title}
        plans={task.plans.map((plan) => ({
          id: plan.id,
          title: plan.title,
          quantity: plan.quantity,
          amount: plan.amount,
          previewUrl: plan.previewUrl,
          vendor: plan.vendor,
        }))}
      />
    </AppShellAuth>
  );
}
