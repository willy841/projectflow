import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { designTaskGroups } from "@/components/design-task-data";
import { WorkspaceEmptyState, WorkspaceHeader, WorkspaceSection, WorkspaceStat, workspacePrimaryButtonClass } from "@/components/workspace-ui";
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
        badge={<span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">共 {activeProject ? projectTasks.length : projects.length} {activeProject ? "筆任務" : "個專案"}</span>}
        meta={null}
      />

      <WorkspaceSection
        title={activeProject ? `${activeProject.projectName}｜${activeProject.eventDate}` : "專案入口"}
        meta={null}
        actions={
          activeProject ? (
            <Link
              href="/design-tasks"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              返回專案列表
            </Link>
          ) : null
        }
      >
        {!activeProject ? (
          projects.length ? <div className="space-y-3">
            {projects.map((project) => (
              <article
                key={project.projectId}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50/70"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <WorkspaceStat label="專案名稱" value={project.projectName} />
                    <WorkspaceStat label="任務數量" value={`共 ${project.taskCount} 筆`} />
                    <WorkspaceStat label="活動日期" value={project.eventDate} />
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href={`/design-tasks?project=${encodeURIComponent(project.projectId)}`}
                      className={workspacePrimaryButtonClass}
                    >
                      進入工作臺
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div> : <WorkspaceEmptyState title="目前尚無可查看的專案" description="待這條工作臺有正式任務後，會從這裡進入單專案工作臺。" />
        ) : (
          projectTasks.length ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[1180px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">任務標題</th>
                    <th className="px-4 py-3 font-medium">尺寸</th>
                    <th className="px-4 py-3 font-medium">材質</th>
                    <th className="px-4 py-3 font-medium">結構</th>
                    <th className="px-4 py-3 font-medium">數量</th>
                    <th className="px-4 py-3 font-medium">執行回覆</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {projectTasks.map((task) => (
                    <tr key={task.id} className="align-middle">
                      <td className="px-4 py-4 font-medium text-slate-900">{task.title}</td>
                      <td className="px-4 py-4 text-slate-600">{task.size}</td>
                      <td className="px-4 py-4 text-slate-600">{task.material}</td>
                      <td className="px-4 py-4 text-slate-600">{task.structureRequired}</td>
                      <td className="px-4 py-4 text-slate-600">{task.quantity}</td>
                      <td className="px-4 py-4 text-slate-600">共 {task.replyCount ?? 0} 筆</td>
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
