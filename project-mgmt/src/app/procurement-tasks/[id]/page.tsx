import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShellAuth } from "@/components/app-shell-auth";
import { ProcurementTaskWorkspace } from "@/components/procurement-task-workspace";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { WorkspaceHeader, WorkspaceInfoTable, WorkspaceSection, workspacePrimaryButtonClass } from "@/components/workspace-ui";
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

      <WorkspaceSection title="原始任務資訊" className="shell-none">
        <WorkspaceInfoTable
          rows={[
            { label: '任務標題', value: task.title },
            { label: '數量', value: task.quantity },
            { label: '預算', value: task.costLabel },
            { label: '需求說明', value: task.note },
            {
              label: '參考連結',
              value: task.referenceUrl ? (
                <a href={task.referenceUrl} className="block break-all text-sm font-medium text-sky-200 underline-offset-4 hover:text-sky-100 hover:underline">{task.referenceUrl}</a>
              ) : '',
            },
          ]}
        />
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
