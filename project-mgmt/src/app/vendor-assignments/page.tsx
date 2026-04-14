import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments } from "@/components/vendor-data";
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
    <AppShell activePath="/vendor-assignments">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">廠商發包板</h2>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {!activeProject ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <article key={project.projectId} className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3.5"><p className="text-xs text-slate-500">專案名稱</p><p className="mt-2 text-sm font-medium text-slate-900">{project.projectName}</p></div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3.5"><p className="text-xs text-slate-500">任務數量</p><p className="mt-2 text-sm font-medium text-slate-900">{project.taskCount}</p></div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3.5"><p className="text-xs text-slate-500">活動日期</p><p className="mt-2 text-sm font-medium text-slate-900">{project.eventDate}</p></div>
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
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5">
              <div><p className="text-lg font-semibold text-slate-900">{activeProject.projectName}</p></div>
              <Link href="/vendor-assignments" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">返回專案列表</Link>
            </div>

            <div className="space-y-3">
              {vendorGroups.map((group) => (
                <article key={group.vendorKey} className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3.5"><p className="text-xs text-slate-500">廠商</p><p className="mt-2 text-sm font-medium text-slate-900">{group.vendorName}</p></div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3.5"><p className="text-xs text-slate-500">任務數量</p><p className="mt-2 text-sm font-medium text-slate-900">{group.taskCount}</p></div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3.5"><p className="text-xs text-slate-500">活動日期</p><p className="mt-2 text-sm font-medium text-slate-900">{group.eventDate}</p></div>
                    </div>
                    <div className="flex justify-end">
                      <Link href={`/vendor-assignments/${encodeURIComponent(buildVendorGroupRouteId(activeProject.projectId, group.vendorId))}`} className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">進入廠商</Link>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">本組任務</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.taskTitles.map((title, index) => (
                        <span key={`${group.vendorKey}-${index}`} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                          {title}
                        </span>
                      ))}
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
