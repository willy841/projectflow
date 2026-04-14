import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { procurementTaskBoardRecords } from "@/components/procurement-task-board-data";
import { MockProcurementDocumentView } from "@/components/mock-procurement-document-view";
import { WorkspaceHeader, WorkspaceSection } from "@/components/workspace-ui";
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
      <WorkspaceHeader
        title={task.title}
        backHref={`/procurement-tasks/${task.id}`}
        backLabel="返回任務詳情"
        actions={<ProcurementDocumentExportButton taskId={task.id} rows={task.documentRows} />}
      />

      <WorkspaceSection>
        <div className="mb-4"><h3 className="text-xl font-semibold text-slate-900">文件</h3></div>
        <MockProcurementDocumentView taskId={task.id} fallbackRows={task.documentRows} />
      </WorkspaceSection>
    </AppShell>
  );
}
