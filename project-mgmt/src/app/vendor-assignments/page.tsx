import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments } from "@/components/vendor-data";
import {
  listDbVendorProjects,
  listDbVendorTasksByProject,
} from "@/lib/db/vendor-flow-adapter";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";

type ProjectEntry = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

type VendorTaskEntry = {
  id: string;
  vendorName: string;
  title: string;
  requirementText: string;
};

export default async function VendorAssignmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ project?: string }>;
}) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const activeProjectId = resolvedSearch?.project;

  let projects: ProjectEntry[] = [];
  let vendorTasks: VendorTaskEntry[] = [];

  if (shouldUseDbVendorFlow()) {
    projects = await listDbVendorProjects();
    vendorTasks = activeProjectId ? await listDbVendorTasksByProject(activeProjectId) : [];
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
    vendorTasks = activeProjectId
      ? vendorAssignments
          .filter((assignment) => assignment.projectId === activeProjectId)
          .map((assignment) => ({
            id: assignment.id,
            vendorName: assignment.selectedVendorName || "未指定廠商",
            title: assignment.title,
            requirementText: assignment.summary,
          }))
      : [];
  }

  const activeProject = projects.find((project) => project.projectId === activeProjectId);

  return (
    <AppShell activePath="/vendor-assignments">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">廠商發包板</h2>
          <span className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">共 {projects.length} 個專案</span>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {!activeProject ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <article key={project.projectId} className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">專案名稱</p><p className="mt-2 text-sm font-medium text-slate-900">{project.projectName}</p></div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">任務數量</p><p className="mt-2 text-sm font-medium text-slate-900">{project.taskCount}</p></div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">活動日期</p><p className="mt-2 text-sm font-medium text-slate-900">{project.eventDate}</p></div>
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/vendor-assignments?project=${encodeURIComponent(project.projectId)}`} className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">進入專案</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div><p className="text-sm text-slate-500">目前專案</p><p className="mt-1 text-lg font-semibold text-slate-900">{activeProject.projectName}</p></div>
              <Link href="/vendor-assignments" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">返回專案列表</Link>
            </div>

            <div className="space-y-3">
              {vendorTasks.map((task) => (
                <article key={task.id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">廠商</p><p className="mt-2 text-sm font-medium text-slate-900">{task.vendorName}</p></div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">任務標題</p><p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p></div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">需求摘要</p><p className="mt-2 text-sm font-medium text-slate-900">{task.requirementText || '未填寫'}</p></div>
                    </div>
                    <div className="flex justify-end">
                      <Link href={`/vendor-assignments/${task.id}`} className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">查看任務</Link>
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
