import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DesignTaskForm } from "@/components/design-task-form";
import { getDesignTaskById } from "@/components/design-task-data";

export default async function EditDesignTaskPage({
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Edit Design Task</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">編輯設計交辦</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              你目前正在編輯：{task.title}。這一版先完成前端編輯體驗，下一階段再接上真正的更新功能。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/design-tasks/${task.id}`}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              返回交辦詳細頁
            </Link>
          </div>
        </div>
      </header>

      <DesignTaskForm
        mode="edit"
        initialValues={{
          projectId: task.projectId,
          title: task.title,
          assignee: task.assignee,
          due: task.due,
          size: task.size,
          material: task.material,
          quantity: task.quantity,
          structureRequired: task.structureRequired,
          referenceUrl: task.referenceUrl,
          note: task.note,
          outsourceTarget: task.outsourceTarget,
          cost: task.cost,
        }}
      />
    </AppShell>
  );
}
