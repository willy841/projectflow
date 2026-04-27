import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { vendorAssignments } from "@/components/vendor-data";
import { WorkspaceEmptyState, WorkspaceHeader, WorkspaceSection, workspacePrimaryButtonClass } from "@/components/workspace-ui";
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
        title={
          activeProject ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-slate-50">
              <span>廠商發包板</span>
              <span className="text-xl font-semibold text-slate-100">{activeProject.projectName}</span>
              <span className="text-base font-medium text-slate-400">{activeProject.eventDate}</span>
            </span>
          ) : (
            "廠商發包板"
          )
        }
        badge={<span className="inline-flex items-center rounded-full bg-white/8 px-2.5 py-0.5 text-xs font-medium text-slate-200 ring-1 ring-white/10">共 {activeProject ? vendorGroups.length : projects.length} {activeProject ? "組廠商" : "個專案"}</span>}
        meta={null}
        actions={
          activeProject ? (
            <Link href="/vendor-assignments" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">返回專案列表</Link>
          ) : null
        }
      />

      <WorkspaceSection className="shell-none p-1">
        {!activeProject ? (
          projects.length ? (
            <div className="pf-table-shell rounded-[28px]">
              <table className="pf-table min-w-[980px] table-fixed xl:min-w-full">
                <thead>
                  <tr>
                    <th className="w-[46%] px-4 py-3 font-medium align-middle">專案名稱</th>
                    <th className="w-[16%] px-4 py-3 font-medium align-middle">任務數量</th>
                    <th className="w-[20%] px-4 py-3 font-medium align-middle">活動日期</th>
                    <th className="w-[18%] px-4 py-3 font-medium text-center align-middle">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {projects.map((project) => (
                    <tr key={project.projectId} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-100"><Link href={`/vendor-assignments?project=${encodeURIComponent(project.projectId)}`} className="underline-offset-4 hover:underline">{project.projectName}</Link></td>
                      <td className="px-4 py-4 text-slate-300">共 {project.taskCount} 筆</td>
                      <td className="px-4 py-4 text-slate-300">{project.eventDate}</td>
                      <td className="px-4 py-4 text-center">
                        <Link href={`/vendor-assignments?project=${encodeURIComponent(project.projectId)}`} className={`${workspacePrimaryButtonClass} whitespace-nowrap`}>進入工作臺</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <WorkspaceEmptyState title="目前尚無可查看的專案" description="待這條工作臺有正式任務後，會從這裡進入單專案工作臺。" />
        ) : (
          vendorGroups.length ? (
            <div className="pf-table-shell rounded-[28px]">
              <table className="pf-table min-w-[1180px] table-fixed xl:min-w-full">
                <thead>
                  <tr>
                    <th className="w-[18%] px-4 py-3 font-medium align-middle">廠商</th>
                    <th className="w-[12%] px-4 py-3 font-medium align-middle">任務數量</th>
                    <th className="w-[16%] px-4 py-3 font-medium align-middle">活動日期</th>
                    <th className="w-[38%] px-4 py-3 font-medium align-middle">任務摘要</th>
                    <th className="w-[16%] px-4 py-3 font-medium text-center align-middle">操作</th>
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
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center whitespace-nowrap">
                          <Link href={`/vendor-assignments/${encodeURIComponent(buildVendorGroupRouteId(activeProject.projectId, group.vendorId))}`} className={`${workspacePrimaryButtonClass} whitespace-nowrap`}>進入廠商</Link>
                        </div>
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
