import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDbVendorTaskById } from "@/lib/db/vendor-flow-adapter";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

export default async function VendorTaskDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbVendorFlow() && isUuidLike(id);
  const task = useDb ? await getDbVendorTaskById(id) : null;

  if (!task) notFound();

  return (
    <AppShell activePath="/vendor-assignments">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><p className="text-sm text-slate-500">vendor 文件整理頁</p><h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{task.vendorName}</h2></div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/vendor-assignments/${task.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">返回任務詳情</Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4"><h3 className="text-xl font-semibold text-slate-900">最終文件頁</h3></div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['編號', '項目', '金額'].map((label) => (
                  <th key={label} className="border-b border-slate-200 px-4 py-3 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {task.documentRows.map((row) => (
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
