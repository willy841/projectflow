import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDesignTaskById } from "@/components/design-task-data";
import { DesignPlanEditorClient } from "@/components/design-plan-editor-client";
import { getDbDesignTaskById } from "@/lib/db/design-flow-adapter";
import { shouldUseDbDesignFlow } from "@/lib/db/design-flow-toggle";

export default async function DesignTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = shouldUseDbDesignFlow() ? await getDbDesignTaskById(id) : getDesignTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">設計任務詳情頁</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/design-tasks?project=${encodeURIComponent(task.projectId)}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              返回任務列表
            </Link>
            <Link
              href={`/design-tasks/${task.id}/document`}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              前往最終文件頁
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900">原始任務資訊</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
            <p className="text-xs text-slate-500">任務標題</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">尺寸</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.size}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">材質</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.material}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">結構</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.structureRequired}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">數量</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.quantity}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
            <p className="text-xs text-slate-500">需求說明</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.note}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
            <p className="text-xs text-slate-500">參考連結</p>
            {task.referenceUrl ? (
              <a href={task.referenceUrl} className="mt-2 block break-all text-sm font-medium text-blue-600 underline-offset-4 hover:underline">
                {task.referenceUrl}
              </a>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-400">未填寫</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <DesignPlanEditorClient
          taskId={task.id}
          initialPlans={task.plans.map((plan) => ({
            id: plan.id,
            title: plan.title,
            size: plan.size,
            material: plan.material,
            structure: plan.structure,
            quantity: plan.quantity,
            amount: plan.amount,
            previewUrl: plan.previewUrl,
            vendor: plan.vendor,
          }))}
        />
      </section>
    </AppShell>
  );
}
