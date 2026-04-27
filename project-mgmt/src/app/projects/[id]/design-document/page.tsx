import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShellAuth } from '@/components/app-shell-auth';
import { DesignDocumentExportButton } from '@/components/document-export-button';
import { TaskDocumentTable } from '@/components/task-document-table';
import { WorkspaceHeader, WorkspaceSection, workspacePrimaryButtonClass } from '@/components/workspace-ui';
import { resolveDbProjectIdByRouteId } from '@/lib/db/project-flow-adapter';
import { getProjectDesignDocument } from '@/lib/db/project-flow-documents';

export const dynamic = 'force-dynamic';

export default async function ProjectDesignDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = await resolveDbProjectIdByRouteId(id);
  if (!projectId) notFound();

  const document = await getProjectDesignDocument(projectId);
  if (!document) notFound();

  return (
    <AppShellAuth activePath="/design-tasks">
      <WorkspaceHeader
        title={document.projectName}
        meta={<> <span>專案設計文件</span> </>}
        actions={
          <>
            <DesignDocumentExportButton taskId={document.projectId} rows={document.rows.map((row) => ({ id: row.id, item: row.item, size: row.size, materialStructure: row.materialStructure, quantity: row.quantity }))} />
            <Link href={`/projects/${encodeURIComponent(id)}`} className={workspacePrimaryButtonClass}>
              返回專案詳情
            </Link>
          </>
        }
      />

      <WorkspaceSection title="文件" meta="此頁顯示本專案底下全部設計任務的匯總文件內容。">
        <TaskDocumentTable
          rows={document.rows}
          columns={[
            { key: 'id', label: '編號', render: (row) => row.id },
            { key: 'taskTitle', label: '任務', render: (row) => row.taskTitle },
            { key: 'item', label: '項目', render: (row) => row.item },
            { key: 'size', label: '尺寸', render: (row) => row.size },
            { key: 'materialStructure', label: '材質與結構', render: (row) => row.materialStructure },
            { key: 'quantity', label: '數量', render: (row) => row.quantity },
          ]}
          emptyTitle="目前尚無正式設計文件"
          emptyDescription="請先完成本專案設計任務的回覆 / 確認，文件頁才會承接匯總內容。"
        />
      </WorkspaceSection>
    </AppShellAuth>
  );
}
