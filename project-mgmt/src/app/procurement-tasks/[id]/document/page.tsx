import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";

const mockRows = [
  { id: 1, item: "壓克力桌牌", quantity: "3 組" },
  { id: 2, item: "贈品吊卡", quantity: "1 式" },
];

export default async function ProcurementTaskDocumentPage({
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
            <p className="text-sm text-slate-500">備品文件整理頁</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2>
          </div>
          <Link
            href={`/procurement-tasks/${task.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            返回任務詳情
          </Link>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900">最終文件頁</h3>
          <p className="mt-1 text-sm text-slate-500">此頁即備品最終文件頁，不再另外延伸下一層文件頁。</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {["編號", "項目", "數量"].map((label) => (
                  <th key={label} className="border-b border-slate-200 px-4 py-3 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockRows.map((row) => (
                <tr key={row.id} className="align-top text-slate-700">
                  <td className="border-b border-slate-200 px-4 py-3">{row.id}</td>
                  <td className="border-b border-slate-200 px-4 py-3">{row.item}</td>
                  <td className="border-b border-slate-200 px-4 py-3">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
