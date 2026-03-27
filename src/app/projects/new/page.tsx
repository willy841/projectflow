import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">New Project</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">新增專案</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              先把專案主檔建立起來，後續需求溝通、設計交辦、備品採購與成本管理都會掛在同一個專案下。
            </p>
          </div>

          <Link href="/projects" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
            返回專案列表
          </Link>
        </div>
      </header>

      <ProjectForm />
    </AppShell>
  );
}
