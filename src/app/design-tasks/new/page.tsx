import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DesignTaskForm } from "@/components/design-task-form";
import { getProjectById } from "@/components/project-data";

export default async function NewDesignTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; itemId?: string; itemTitle?: string }>;
}) {
  const params = await searchParams;
  const project = params.projectId ? getProjectById(params.projectId) : undefined;
  const matchedItem = project?.executionItems.find((item) => item.id === params.itemId);
  const itemTitle = params.itemTitle || matchedItem?.title || "";

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">New Design Task</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">新增設計交辦</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              這一版已改成從專案執行項目發起交辦。{project ? `目前來源專案為：${project.name}` : "你也可以手動選擇所屬專案。"}
            </p>
          </div>

          <Link
            href={project ? `/projects/${project.id}` : "/projects"}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            {project ? "返回專案詳細頁" : "返回專案列表"}
          </Link>
        </div>
      </header>

      <DesignTaskForm
        initialValues={{
          projectId: project?.id || "",
          executionItemId: matchedItem?.id || params.itemId || "",
          executionItemTitle: itemTitle,
          title: itemTitle ? `${itemTitle} - 設計交辦` : "",
          note: matchedItem?.detail || "",
        }}
      />
    </AppShell>
  );
}
