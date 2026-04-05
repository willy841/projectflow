import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { FeedbackActionButtons } from "@/components/mock-workflow-feedback";

const mockPlans = [
  {
    id: "plan-a",
    title: "主採購方案",
    quantity: "3 組",
    amount: "NT$ 18,000",
    previewUrl: "https://example.com/procurement-preview-a",
    vendor: "Momo",
  },
  {
    id: "plan-b",
    title: "替代採購方案",
    quantity: "1 式",
    amount: "NT$ 12,500",
    previewUrl: "https://example.com/procurement-preview-b",
    vendor: "Una",
  },
];

export default async function ProcurementTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = procurementTaskBoardRecords.find((record) => record.id === id);

  if (!task) {
    notFound();
  }

  return (
    <AppShell activePath="/procurement-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">採購備品任務詳情頁</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/procurement-tasks?project=${encodeURIComponent(task.projectId)}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              返回任務列表
            </Link>
            <Link
              href={`/procurement-tasks/${task.id}/document`}
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
            <p className="text-xs text-slate-500">任務標題</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">數量</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.quantity}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">預算</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{task.costLabel}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-3">
            <p className="text-xs text-slate-500">需求說明</p>
            <p className="mt-2 text-sm font-medium text-slate-900">此處為備品原始需求說明骨架，後續再接正式資料。</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
            <p className="text-xs text-slate-500">參考連結</p>
            <a href="https://example.com/procurement-reference" className="mt-2 block break-all text-sm font-medium text-blue-600 underline-offset-4 hover:underline">
              https://example.com/procurement-reference
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
            confirmMessage="這個備品任務的執行處理區已確認；目前區內方案視為正式成立，可進入最終文件頁。"
          />
        </div>

        <div className="space-y-4">
          {mockPlans.map((plan) => (
            <article key={plan.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 xl:col-span-2">
                  <p className="text-xs text-slate-500">標題</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{plan.title}</p>
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
                  saveMessage="已儲存這筆備品處理方案。"
                  confirmLabel="確認"
                  confirmMessage="這筆備品處理方案已標記為目前版本的一部分；整區仍需再確認一次才正式進文件。"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
