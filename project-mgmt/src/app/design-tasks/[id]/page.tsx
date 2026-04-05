import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDesignTaskById } from "@/components/design-task-data";
import { FeedbackActionButtons } from "@/components/mock-workflow-feedback";

const mockPlans = [
  {
    id: "plan-a",
    title: "主視覺輸出方案",
    size: "W240 x H300 cm",
    material: "珍珠板",
    structure: "鋁架固定",
    quantity: "1 式",
    amount: "NT$ 18,000",
    previewUrl: "https://example.com/design-preview-a",
    vendor: "星澄輸出",
  },
  {
    id: "plan-b",
    title: "入口海報延伸方案",
    size: "A1 / 594 x 841 mm",
    material: "海報紙",
    structure: "立架展示",
    quantity: "2 張",
    amount: "NT$ 6,800",
    previewUrl: "https://example.com/design-preview-b",
    vendor: "光域輸出",
  },
];

export default async function DesignTaskDetailPage({
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
            <a href={task.referenceUrl} className="mt-2 block break-all text-sm font-medium text-blue-600 underline-offset-4 hover:underline">
              {task.referenceUrl}
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">執行處理</h3>
            <p className="mt-1 text-sm text-slate-500">每筆處理方案彼此獨立，單筆儲存後，再由整區確認正式成立。</p>
          </div>
          <FeedbackActionButtons
            confirmLabel="確認"
            confirmMessage="這個設計任務的執行處理區已確認；目前區內方案視為正式成立，可進入最終文件頁。"
          />
        </div>

        <div className="space-y-4">
          {mockPlans.map((plan) => (
            <article key={plan.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
                  <p className="text-xs text-slate-500">標題</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.title}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">尺寸</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.size}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">材質</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.material}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">結構</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.structure}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">數量</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.quantity}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">金額</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.amount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
                  <p className="text-xs text-slate-500">預覽位置</p>
                  <a href={plan.previewUrl} className="mt-2 block break-all text-sm font-medium text-blue-600 underline-offset-4 hover:underline">
                    {plan.previewUrl}
                  </a>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
                  <p className="text-xs text-slate-500">執行廠商</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.vendor}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <FeedbackActionButtons
                  saveLabel="儲存"
                  saveMessage="已儲存這筆設計處理方案。"
                  confirmLabel="確認"
                  confirmMessage="這筆設計處理方案已標記為目前版本的一部分；整區仍需再確認一次才正式進文件。"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
