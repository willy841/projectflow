import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">新增專案</h2>
          </div>

          <Link href="/projects" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700">
            返回專案列表
          </Link>
        </div>
      </header>

      <ProjectForm />
    </AppShell>
  );
}
