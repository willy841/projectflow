import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <AppShellAuth activePath="/projects">
      <header className="p-1">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">新增專案</h2>
          </div>

          <Link href="/projects" className="pf-btn-secondary px-5 py-3">
            返回專案列表
          </Link>
        </div>
      </header>

      <ProjectForm />
    </AppShellAuth>
  );
}
