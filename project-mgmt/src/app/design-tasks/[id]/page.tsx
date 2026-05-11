import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShellAuth } from "@/components/app-shell-auth";
import { DesignTaskWorkspace } from "@/components/design-task-workspace";
import { getDesignTaskById } from "@/components/design-task-data";
import { WorkspaceHeader, WorkspaceInfoTable, WorkspaceSection, workspacePrimaryButtonClass } from "@/components/workspace-ui";
import { getDbDesignTaskById } from "@/lib/db/design-flow-adapter";
import { isUuidLike, shouldUseDbDesignFlow } from "@/lib/db/design-flow-toggle";

export default async function DesignTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const useDb = shouldUseDbDesignFlow() && isUuidLike(id);
  const task = useDb ? await getDbDesignTaskById(id) : getDesignTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <AppShellAuth activePath="/design-tasks">
      <WorkspaceHeader
        title={task.title}
        meta={task.projectName}
        actions={
          <>
            <Link
              href={`/design-tasks?project=${encodeURIComponent(task.projectId)}`}
              className={workspacePrimaryButtonClass}
            >
              返回任務列表
            </Link>
            <Link
              href={`/projects/${encodeURIComponent(task.projectId)}/design-document`}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              前往文件
            </Link>
          </>
        }
      />

      <WorkspaceSection title="原始任務資訊" className="shell-none">
        <WorkspaceInfoTable
          rows={[
            { label: '任務標題', value: task.title },
            { label: '設計負責人', value: task.assignee || '未指定' },
            { label: '尺寸', value: task.size },
            { label: '材質 + 結構', value: task.material },
            { label: '數量', value: task.quantity },
            { label: '需求說明', value: task.note },
            {
              label: '參考連結',
              value: task.referenceUrl ? (
                <a href={task.referenceUrl} className="block break-all text-sm font-medium text-sky-200 underline-offset-4 hover:text-sky-100 hover:underline">
                  {task.referenceUrl}
                </a>
              ) : '',
            },
          ]}
        />
      </WorkspaceSection>

      <DesignTaskWorkspace
        taskId={task.id}
        projectId={task.projectId}
        taskTitle={task.title}
        plans={task.plans.map((plan) => ({
          id: plan.id,
          title: plan.title,
          size: plan.size,
          material: plan.material,
          structure: plan.structure,
          quantity: plan.quantity,
          amount: plan.amount,
          previewUrl: plan.previewUrl,
          vendor: plan.vendor,
        }))}
      />
    </AppShellAuth>
  );
}
