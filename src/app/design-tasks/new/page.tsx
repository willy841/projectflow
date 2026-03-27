import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DesignTaskForm } from "@/components/design-task-form";

export default function NewDesignTaskPage() {
  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">New Design Task</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">新增設計交辦</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              建立單筆設計交辦，後續可掛回專案詳細頁，並延伸成完整設計交辦管理流程。
            </p>
          </div>

          <Link
            href="/design-tasks"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            返回設計交辦中心
          </Link>
        </div>
      </header>

      <DesignTaskForm />
    </AppShell>
  );
}
