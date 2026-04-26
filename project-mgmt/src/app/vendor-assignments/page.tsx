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
        badge={<span className="inline-flex items-center rounded-full bg-white/8 px-2.5 py-0.5 text-xs font-medium text-slate-200 ring-1 ring-white/10">共 {activeProject ? vendorGroups.length : projects.length} {activeProject ? "組廠商" : "個專案"}</span>}
        meta={null}
      />

      <WorkspaceSection
        title={activeProject ? activeProject.projectName : ""}
        meta={null}
        actions={
          activeProject ? (
            <Link href="/vendor-assignments" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">返回專案列表</Link>
          ) : null
        }
       className="shell-none p-1">
        {!activeProject ? (
          projects.length ? (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl">
              <table className="min-w-[980px] divide-y divide-white/10 text-left text-sm xl:min-w-full">
                <thead className="bg-white/[0.04] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">專案名稱</th>
                    <th className="px-4 py-3 font-medium">任務數量</th>
                    <th className="px-4 py-3 font-medium">活動日期</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {projects.map((project) => (
                    <tr key={project.projectId} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-100">{project.projectName}</td>
                      <td className="px-4 py-4 text-slate-300">共 {project.taskCount} 筆</td>
                      <td className="px-4 py-4 text-slate-300">{project.eventDate}</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/vendor-assignments?project=${encodeURIComponent(project.projectId)}`} className={workspacePrimaryButtonClass}>進入工作臺</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <WorkspaceEmptyState title="目前尚無可查看的專案" description="待這條工作臺有正式任務後，會從這裡進入單專案工作臺。" />
        ) : (
          vendorGroups.length ? (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl">
              <table className="min-w-[1180px] divide-y divide-white/10 text-left text-sm xl:min-w-full">
                <thead className="bg-white/[0.04] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">廠商</th>
                    <th className="px-4 py-3 font-medium">任務數量</th>
                    <th className="px-4 py-3 font-medium">活動日期</th>
                    <th className="px-4 py-3 font-medium">任務摘要</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {vendorGroups.map((group) => (
                    <tr key={group.vendorKey} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-100">{group.vendorName}</td>
                      <td className="px-4 py-4 text-slate-300">共 {group.taskCount} 筆</td>
                      <td className="px-4 py-4 text-slate-300">{group.eventDate}</td>
                      <td className="px-4 py-4 text-slate-300">
                        <div className="flex flex-wrap gap-2">
                          {group.taskTitles.map((title, index) => (
                            <span key={`${group.vendorKey}-${index}`} className="inline-flex rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs font-medium text-slate-200">
                              {title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/vendor-assignments/${encodeURIComponent(buildVendorGroupRouteId(activeProject.projectId, group.vendorId))}`} className={workspacePrimaryButtonClass}>進入廠商</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <WorkspaceEmptyState title="目前尚無廠商群組" description="請先完成廠商任務發布與廠商指定，再回到這裡進行處理。" />
        )}
      </WorkspaceSection>
    </AppShellAuth>
  );
}
