import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ExecutionItemForm } from "@/components/execution-item-form";
import { getProjectById } from "@/components/project-data";

export default async function NewExecutionItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">New Execution Item</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">新增專案執行項目</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              目前專案：{project.name}。先新增討論 / 執行項目，後續再從項目發起交辦。
            </p>
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            返回專案詳細頁
          </Link>
        </div>
      </header>

      <ExecutionItemForm projectName={project.name} />
    </AppShell>
  );
}
