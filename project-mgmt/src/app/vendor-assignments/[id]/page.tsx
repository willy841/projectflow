import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShellAuth } from "@/components/app-shell-auth";
import { VendorGroupConfirmClient } from "@/components/vendor-group-confirm-client";
import { VendorPlanEditorClient } from "@/components/vendor-plan-editor-client";
import { WorkspaceHeader, WorkspaceSection, WorkspaceStat } from "@/components/workspace-ui";
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
    <AppShellAuth activePath="/vendor-assignments">
      <WorkspaceHeader
        title={group.vendorName}
        meta={group.projectName}
        actions={
          <>
            <Link href={`/vendor-assignments?project=${encodeURIComponent(group.projectId)}`} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-slate-100 shadow-[0_22px_46px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-slate-900/70 hover:text-white">返回任務列表</Link>
            <Link href={`/vendor-packages/${packageId}`} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(30,41,59,0.92),rgba(37,99,235,0.6))] px-4 py-2.5 text-sm font-medium text-slate-50 shadow-[0_24px_48px_-26px_rgba(37,99,235,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition hover:brightness-110">查看文件</Link>
            <VendorGroupConfirmClient projectId={group.projectId} vendorId={group.vendorId} packageId={packageId} />
          </>
        }
      />

      <WorkspaceSection className="shell-none p-0">
        <div className="grid gap-3 md:grid-cols-3">
          <WorkspaceStat label="專案" value={group.projectName} />
          <WorkspaceStat label="活動日期" value={group.eventDate} />
          <WorkspaceStat label="群組任務數" value={`共 ${group.tasks.length} 筆`} />
        </div>
      </WorkspaceSection>

      <div className="space-y-6">
        {group.tasks.map((task, index) => (
          <WorkspaceSection
            key={task.id}
            title={task.title}
            meta={undefined}
            className="shell-none"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <WorkspaceStat label="任務標題" value={task.title} />
              <WorkspaceStat label="需求說明" value={task.requirementText || "未填寫"} />
            </div>


            <div className="mt-5">
              <VendorPlanEditorClient
                taskId={task.id}
                showConfirmButton={false}
                vendorName={group.vendorName}
                initialPlans={task.plans.map((plan) => ({
                  id: plan.id,
                  title: plan.title,
                  requirement: plan.requirement,
                  amount: plan.amount,
                  vendorName: group.vendorName,
                }))}
              />
            </div>
          </WorkspaceSection>
        ))}
      </div>
    </AppShellAuth>
  );
}
