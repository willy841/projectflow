import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProcurementDocumentExportButton } from "@/components/document-export-button";
import { MockProcurementDocumentView } from "@/components/mock-procurement-document-view";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { WorkspaceHeader, WorkspaceSection } from "@/components/workspace-ui";
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
      <WorkspaceHeader
        title={task.title}
        meta={
          <>
            <span>{task.projectName}</span>
            <span className="text-slate-300">／</span>
            <span>備品文件</span>
          </>
        }
        actions={
          <>
            <ProcurementDocumentExportButton taskId={task.id} rows={task.documentRows} />
            <Link href={`/procurement-tasks/${task.id}`} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">返回任務詳情</Link>
          </>
        }
      />

      <WorkspaceSection title="文件">
        <MockProcurementDocumentView taskId={task.id} fallbackRows={task.documentRows} />
      </WorkspaceSection>
    </AppShell>
  );
}
