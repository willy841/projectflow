import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { WorkspaceEmptyState, WorkspaceHeader, WorkspaceSection, WorkspaceStat, workspacePrimaryButtonClass } from "@/components/workspace-ui";
import {
  listDbProcurementTaskProjects,
  listDbProcurementTasksByProject,
} from "@/lib/db/procurement-flow-adapter";
import { shouldUseDbProcurementFlow } from "@/lib/db/procurement-flow-toggle";

type ProjectEntry = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

type ProjectTaskEntry = {
  id: string;
  title: string;
  quantity: string;
  costLabel: string;
};

export default async function ProcurementTasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ project?: string }>;
}) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const activeProjectId = resolvedSearch?.project;

  let projects: ProjectEntry[] = [];
  let projectTasks: ProjectTaskEntry[] = [];

  if (shouldUseDbProcurementFlow()) {
    projects = await listDbProcurementTaskProjects();
    projectTasks = activeProjectId ? await listDbProcurementTasksByProject(activeProjectId) : [];
  } else {
    const map = new Map<string, ProjectEntry>();
    procurementTaskBoardRecords.forEach((record) => {
      const existing = map.get(record.projectId);
      if (existing) {
        existing.taskCount += 1;
        return;
      }
      map.set(record.projectId, {
        projectId: record.projectId,
        projectName: record.projectName,
        eventDate: "未設定",
        taskCount: 1,
      });
    });
    projects = Array.from(map.values());
    projectTasks = activeProjectId
      ? procurementTaskBoardRecords
          .filter((task) => task.projectId === activeProjectId)
          .map((task) => ({
            id: task.id,
            title: task.title,
            quantity: task.quantity,
            costLabel: task.costLabel,
          }))
      : [];
  }

  const activeProject = projects.find((project) => project.projectId === activeProjectId);

  return (
    <AppShellAuth activePath="/procurement-tasks">
      <WorkspaceHeader
        title="採購備品板"
        badge={<span className="inline-flex items-center rounded-full bg-white/8 px-2.5 py-0.5 text-xs font-medium text-slate-200 ring-1 ring-white/10">共 {activeProject ? projectTasks.length : projects.length} {activeProject ? "筆任務" : "個專案"}</span>}
        meta={activeProject ? activeProject.projectName : null}
      />

      <WorkspaceSection
        title={undefined}
        meta={null}
        actions={
          activeProject ? (
            <Link
              href="/procurement-tasks"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl"
            >
              返回專案列表
            </Link>
          ) : null
        }
       className="shell-none p-1">
        {!activeProject ? (
          projects.length ? (
            <div className="pf-table-shell rounded-[28px]">
              <table className="pf-table min-w-[980px] xl:min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-medium">專案名稱</th>
                    <th className="px-4 py-3 font-medium">任務數量</th>
                    <th className="px-4 py-3 font-medium">活動日期</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {projects.map((project) => (
                    <tr key={project.projectId} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-100">{project.projectName}</td>
                      <td className="px-4 py-4 text-slate-300">共 {project.taskCount} 筆</td>
                      <td className="px-4 py-4 text-slate-300">{project.eventDate}</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/procurement-tasks?project=${encodeURIComponent(project.projectId)}`} className={workspacePrimaryButtonClass}>進入工作臺</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <WorkspaceEmptyState title="目前尚無可查看的專案" description="待這條工作臺有正式任務後，會從這裡進入單專案工作臺。" />
        ) : (
          projectTasks.length ? (
            <div className="pf-table-shell rounded-[28px]">
              <table className="pf-table min-w-[980px] xl:min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-medium">任務標題</th>
                    <th className="px-4 py-3 font-medium">數量</th>
                    <th className="px-4 py-3 font-medium">預算</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {projectTasks.map((task) => (
                    <tr key={task.id} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-100">{task.title}</td>
                      <td className="px-4 py-4 text-slate-300">{task.quantity}</td>
                      <td className="px-4 py-4 text-slate-300">{task.costLabel}</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/procurement-tasks/${task.id}`} className={workspacePrimaryButtonClass}>進入任務</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <WorkspaceEmptyState title="目前尚無任務" description="這個專案目前還沒有正式資料可進入處理頁。" />
        )}
      </WorkspaceSection>
    </AppShellAuth>
  );
}
