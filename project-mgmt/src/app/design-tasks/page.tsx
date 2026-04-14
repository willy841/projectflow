import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { designTaskGroups } from "@/components/design-task-data";
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
    projectTasks = activeProjectId ? await listDbDesignTasksByProject(activeProjectId) : [];
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
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">設計任務版</h2>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {!activeProject ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <article
                key={project.projectId}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">專案名稱</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{project.projectName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">任務數量</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{project.taskCount}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">活動日期</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{project.eventDate}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href={`/design-tasks?project=${encodeURIComponent(project.projectId)}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      進入專案
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{activeProject.projectName}</p>
              </div>
              <Link
                href="/design-tasks"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                返回專案列表
              </Link>
            </div>

            <div className="space-y-3">
              {projectTasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-5">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 md:col-span-1">
                        <p className="text-xs text-slate-500">任務標題</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">尺寸</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{task.size}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">材質</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{task.material}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">結構</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{task.structureRequired}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">數量</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{task.quantity}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/design-tasks/${task.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        查看任務
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
