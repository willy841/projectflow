import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { vendorAssignments } from "@/components/vendor-data";
import { WorkspaceEmptyState, WorkspaceHeader, WorkspaceSection, WorkspaceStat, workspacePrimaryButtonClass } from "@/components/workspace-ui";
import {
  listDbVendorGroupsByProject,
  listDbVendorProjects,
} from "@/lib/db/vendor-flow-adapter";
import { buildVendorGroupRouteId } from "@/lib/db/vendor-group-route";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";

type ProjectEntry = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

type VendorGroupEntry = {
  vendorKey: string;
  vendorId: string;
  vendorName: string;
  taskCount: number;
  eventDate: string;
  representativeTaskId: string;
  taskTitles: string[];
};

export default async function VendorAssignmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ project?: string }>;
}) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const activeProjectId = resolvedSearch?.project;

  let projects: ProjectEntry[] = [];
  let vendorGroups: VendorGroupEntry[] = [];

  if (shouldUseDbVendorFlow()) {
    projects = await listDbVendorProjects();
    vendorGroups = activeProjectId
      ? (await listDbVendorGroupsByProject(activeProjectId)).map((group) => ({
          vendorKey: `${group.projectId}::${group.vendorId}`,
          vendorId: group.vendorId,
          vendorName: group.vendorName,
          taskCount: group.taskCount,
          eventDate: group.eventDate,
          representativeTaskId: group.representativeTaskId,
          taskTitles: group.taskTitles,
        }))
      : [];
  } else {
    const map = new Map<string, ProjectEntry>();
    vendorAssignments.forEach((assignment) => {
      const existing = map.get(assignment.projectId);
      if (existing) {
        existing.taskCount += 1;
        return;
      }
      map.set(assignment.projectId, {
        projectId: assignment.projectId,
        projectName: assignment.projectId,
        eventDate: "未設定",
        taskCount: 1,
      });
    });
    projects = Array.from(map.values());
    if (activeProjectId) {
      const grouped = new Map<string, VendorGroupEntry>();
      vendorAssignments
        .filter((assignment) => assignment.projectId === activeProjectId)
        .forEach((assignment) => {
          const vendorName = assignment.selectedVendorName || "未指定廠商";
          const vendorKey = `${assignment.projectId}::${vendorName}`;
          const existing = grouped.get(vendorKey);
          if (existing) {
            existing.taskCount += 1;
            existing.taskTitles.push(assignment.title);
            return;
          }

          grouped.set(vendorKey, {
            vendorKey,
            vendorId: vendorName,
            vendorName,
            taskCount: 1,
            eventDate: map.get(assignment.projectId)?.eventDate || "未設定",
            representativeTaskId: assignment.id,
            taskTitles: [assignment.title],
          });
        });
      vendorGroups = Array.from(grouped.values()).sort((a, b) => a.vendorName.localeCompare(b.vendorName, "zh-Hant"));
    }
  }

  const activeProject = projects.find((project) => project.projectId === activeProjectId);

  return (
    <AppShellAuth activePath="/vendor-assignments">
      <WorkspaceHeader
        title="廠商發包板"
        badge={<span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">共 {activeProject ? vendorGroups.length : projects.length} {activeProject ? "組廠商" : "個專案"}</span>}
        meta={null}
      />

      <WorkspaceSection
        title={activeProject ? activeProject.projectName : "專案入口"}
        meta={null}
        actions={
          activeProject ? (
            <Link href="/vendor-assignments" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">返回專案列表</Link>
          ) : null
        }
      >
        {!activeProject ? (
          projects.length ? <div className="space-y-3">
            {projects.map((project) => (
              <article key={project.projectId} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <WorkspaceStat label="專案名稱" value={project.projectName} />
                    <WorkspaceStat label="任務數量" value={`共 ${project.taskCount} 筆`} />
                    <WorkspaceStat label="活動日期" value={project.eventDate} />
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/vendor-assignments?project=${encodeURIComponent(project.projectId)}`} className={workspacePrimaryButtonClass}>進入工作臺</Link>
                  </div>
                </div>
              </article>
            ))}
          </div> : <WorkspaceEmptyState title="目前尚無可查看的專案" description="待這條工作臺有正式任務後，會從這裡進入單專案工作臺。" />
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <WorkspaceStat label="目前專案" value={activeProject.projectName} />
              <WorkspaceStat label="廠商群組" value={`共 ${vendorGroups.length} 組`} />
              <WorkspaceStat label="活動日期" value={activeProject.eventDate} />
            </div>

            {vendorGroups.length ? vendorGroups.map((group) => (
              <article key={group.vendorKey} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <WorkspaceStat label="廠商" value={group.vendorName} />
                    <WorkspaceStat label="任務數量" value={`共 ${group.taskCount} 筆`} />
                    <WorkspaceStat label="活動日期" value={group.eventDate} />
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/vendor-assignments/${encodeURIComponent(buildVendorGroupRouteId(activeProject.projectId, group.vendorId))}`} className={workspacePrimaryButtonClass}>進入廠商</Link>
                  </div>
                </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                    <p className="text-xs font-medium tracking-wide text-slate-500">本組任務</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.taskTitles.map((title, index) => (
                        <span key={`${group.vendorKey}-${index}`} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
              </article>
            )) : <WorkspaceEmptyState title="目前尚無廠商群組" description="請先完成廠商任務發布與廠商指定，再回到這裡進行處理。" />}
          </div>
        )}
      </WorkspaceSection>
    </AppShellAuth>
  );
}
