import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { designTaskGroups } from "@/components/design-task-data";
import { WorkspaceEmptyState, WorkspaceHeader, WorkspaceSection, workspacePrimaryButtonClass } from "@/components/workspace-ui";
import {
  listDbDesignTaskProjects,
  listDbDesignTasksByProject,
} from "@/lib/db/design-flow-adapter";
import { shouldUseDbDesignFlow } from "@/lib/db/design-flow-toggle";

type ProjectEntry = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

type ProjectTaskEntry = {
  id: string;
  title: string;
  size: string;
  material: string;
  structureRequired: string;
  quantity: string;
  eventDate?: string;
  replyCount?: number;
};

export default async function DesignTasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ project?: string }>;
}) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const activeProjectId = resolvedSearch?.project;

  let projects: ProjectEntry[] = [];
  let projectTasks: ProjectTaskEntry[] = [];

  if (shouldUseDbDesignFlow()) {
    projects = await listDbDesignTaskProjects();
    projectTasks = activeProjectId
      ? (await listDbDesignTasksByProject(activeProjectId)).map((task) => ({
          ...task,
          eventDate: task.eventDate,
          replyCount: task.replyCount,
        }))
      : [];
  } else {
    const map = new Map<string, ProjectEntry>();

    designTaskGroups.forEach((record) => {
      const existing = map.get(record.projectId);
      if (existing) {
        existing.taskCount += 1;
        return;
      }

      map.set(record.projectId, {
        projectId: record.projectId,
        projectName: record.projectName,
        eventDate: record.due,
        taskCount: 1,
      });
    });

    projects = Array.from(map.values());
    projectTasks = activeProjectId
      ? designTaskGroups
          .filter((task) => task.projectId === activeProjectId)
          .map((task) => ({
            id: task.id,
            title: task.title,
            size: task.size,
            material: task.material,
            structureRequired: task.structureRequired,
            quantity: task.quantity,
          }))
      : [];
  }

  const activeProject = projects.find((project) => project.projectId === activeProjectId);

  return (
    <AppShellAuth activePath="/design-tasks">
      <WorkspaceHeader
        title="設計任務板"
        badge={<span className="inline-flex items-center rounded-full bg-white/8 px-2.5 py-0.5 text-xs font-medium text-slate-200 ring-1 ring-white/10">共 {activeProject ? projectTasks.length : projects.length} {activeProject ? "筆任務" : "個專案"}</span>}
        meta={null}
      />

      <WorkspaceSection
        title={activeProject ? <span className="text-xl font-semibold text-slate-100">{activeProject.projectName}</span> : undefined}
        meta={null}
        actions={
          activeProject ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-300">{activeProject.eventDate}</span>
              <Link
                href="/design-tasks"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl"
              >
                返回專案列表
              </Link>
            </div>
          ) : null
        }
       className="shell-none p-1">
        {!activeProject ? (
          projects.length ? (
            <div className="pf-table-shell rounded-[28px]">
              <table className="pf-table min-w-[980px] table-fixed xl:min-w-full">
                <thead>
                  <tr>
                    <th className="w-[46%] px-4 py-3 font-medium align-middle">專案名稱</th>
                    <th className="w-[16%] px-4 py-3 font-medium align-middle">任務數量</th>
                    <th className="w-[20%] px-4 py-3 font-medium align-middle">活動日期</th>
                    <th className="w-[18%] px-4 py-3 font-medium text-right align-middle">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {projects.map((project) => (
                    <tr key={project.projectId} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-100">{project.projectName}</td>
                      <td className="px-4 py-4 text-slate-300">共 {project.taskCount} 筆</td>
                      <td className="px-4 py-4 text-slate-300">{project.eventDate}</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/design-tasks?project=${encodeURIComponent(project.projectId)}`} className={workspacePrimaryButtonClass}>進入工作臺</Link>
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
              <table className="pf-table min-w-[1180px] table-fixed xl:min-w-full">
                <thead>
                  <tr>
                    <th className="w-[28%] px-4 py-3 font-medium align-middle">任務標題</th>
                    <th className="w-[11%] px-4 py-3 font-medium align-middle">尺寸</th>
                    <th className="w-[11%] px-4 py-3 font-medium align-middle">材質</th>
                    <th className="w-[11%] px-4 py-3 font-medium align-middle">結構</th>
                    <th className="w-[10%] px-4 py-3 font-medium align-middle">數量</th>
                    <th className="w-[12%] px-4 py-3 font-medium align-middle">執行回覆</th>
                    <th className="w-[17%] px-4 py-3 font-medium text-right align-middle">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {projectTasks.map((task) => (
                    <tr key={task.id} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-100">{task.title}</td>
                      <td className="px-4 py-4 text-slate-300">{task.size}</td>
                      <td className="px-4 py-4 text-slate-300">{task.material}</td>
                      <td className="px-4 py-4 text-slate-300">{task.structureRequired}</td>
                      <td className="px-4 py-4 text-slate-300">{task.quantity}</td>
                      <td className="px-4 py-4 text-slate-300">共 {task.replyCount ?? 0} 筆</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/design-tasks/${task.id}`} className={workspacePrimaryButtonClass}>進入任務</Link>
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
