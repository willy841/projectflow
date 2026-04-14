import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { MockProcurementDocumentView } from "@/components/mock-procurement-document-view";
import { ProcurementDocumentExportButton } from "@/components/document-export-button";
import { getDbProcurementTaskById } from "@/lib/db/procurement-flow-adapter";
import { shouldUseDbProcurementFlow } from "@/lib/db/procurement-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

export default async function ProcurementTaskDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbProcurementFlow() && isUuidLike(id);
  const task = useDb ? await getDbProcurementTaskById(id) : procurementTaskBoardRecords.find((record) => record.id === id);

  if (!task) notFound();

  return (
    <AppShell activePath="/procurement-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><h2 className="text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2></div>
          <div className="flex flex-wrap gap-2">
            <ProcurementDocumentExportButton taskId={task.id} rows={task.documentRows} />
            <Link href={`/procurement-tasks/${task.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">返回任務詳情</Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4"><h3 className="text-xl font-semibold text-slate-900">最終文件頁</h3></div>
        <MockProcurementDocumentView taskId={task.id} fallbackRows={task.documentRows} />
      </section>
    </AppShell>
  );
}
