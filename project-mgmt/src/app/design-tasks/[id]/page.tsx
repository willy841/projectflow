import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShellAuth } from "@/components/app-shell-auth";
import { DesignTaskWorkspace } from "@/components/design-task-workspace";
import { getDesignTaskById } from "@/components/design-task-data";
import { WorkspaceHeader, WorkspaceSection, WorkspaceStat } from "@/components/workspace-ui";
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
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
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

      <WorkspaceSection title="原始任務資訊">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <WorkspaceStat label="任務標題" value={task.title} />
          <WorkspaceStat label="尺寸" value={task.size} />
          <WorkspaceStat label="材質 + 結構" value={task.material} />
          <WorkspaceStat label="數量" value={task.quantity} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 xl:col-span-2">
            <p className="text-xs font-medium tracking-wide text-slate-500">需求說明</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.note}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 xl:col-span-2">
            <p className="text-xs font-medium tracking-wide text-slate-500">參考連結</p>
            {task.referenceUrl ? (
              <a href={task.referenceUrl} className="mt-2 block break-all text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
                {task.referenceUrl}
              </a>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-400">未填寫</p>
            )}
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="執行處理">
        <DesignTaskWorkspace
          taskId={task.id}
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
      </WorkspaceSection>
    </AppShellAuth>
  );
}
