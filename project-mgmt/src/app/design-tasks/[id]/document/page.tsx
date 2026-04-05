import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDesignTaskById } from "@/components/design-task-data";
import { MockDesignDocumentView } from "@/components/mock-design-document-view";

export default async function DesignTaskDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getDesignTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">設計文件整理頁</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2>
          </div>
          <Link
            href={`/design-tasks/${task.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            返回任務詳情
          </Link>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">最終文件頁</h3>
            <p className="mt-1 text-sm text-slate-500">設計文件整理頁即最終文件頁，欄位可編輯但不回寫上一層處理方案。</p>
          </div>
        </div>

        <MockDesignDocumentView
          taskId={task.id}
          fallbackRows={task.documentRows}
          fallbackLink={task.documentLink}
        />
      </section>
    </AppShell>
  );
}
