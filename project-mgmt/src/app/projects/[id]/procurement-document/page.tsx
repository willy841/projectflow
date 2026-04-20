import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShellAuth } from '@/components/app-shell-auth';
import { ProcurementDocumentExportButton } from '@/components/document-export-button';
import { TaskDocumentTable } from '@/components/task-document-table';
import { WorkspaceHeader, WorkspaceSection } from '@/components/workspace-ui';
import { resolveDbProjectIdByRouteId } from '@/lib/db/project-flow-adapter';
import { getProjectProcurementDocument } from '@/lib/db/project-flow-documents';

export const dynamic = 'force-dynamic';

export default async function ProjectProcurementDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await resolveDbProjectIdByRouteId(id);
  if (!projectId) notFound();

  const document = await getProjectProcurementDocument(projectId);
  if (!document) notFound();

  return (
    <AppShellAuth activePath="/procurement-tasks">
      <WorkspaceHeader
        title={document.projectName}
        meta={<> <span>專案備品文件</span> </>}
        actions={
          <>
            <ProcurementDocumentExportButton taskId={document.projectId} rows={document.rows.map((row) => ({ id: row.id, item: row.item, quantity: row.quantity }))} />
            <Link href={`/projects/${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
              返回專案詳情
            </Link>
          </>
        }
      />

      <WorkspaceSection title="文件" meta="此頁顯示本專案底下全部備品任務的匯總文件內容。">
        <TaskDocumentTable
          rows={document.rows}
          columns={[
            { key: 'id', label: '編號', render: (row) => row.id },
            { key: 'taskTitle', label: '任務', render: (row) => row.taskTitle },
            { key: 'item', label: '項目', render: (row) => row.item },
            { key: 'quantity', label: '數量', render: (row) => row.quantity },
          ]}
          emptyTitle="目前尚無正式備品文件"
          emptyDescription="請先完成本專案備品任務的回覆 / 確認，文件頁才會承接匯總內容。"
        />
      </WorkspaceSection>
    </AppShellAuth>
  );
}
