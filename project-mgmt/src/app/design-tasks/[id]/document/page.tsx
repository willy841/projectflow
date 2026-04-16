import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShellAuth } from "@/components/app-shell-auth";
import { DesignDocumentExportButton } from "@/components/document-export-button";
import { getDesignTaskById } from "@/components/design-task-data";
import { TaskDocumentTable } from "@/components/task-document-table";
import { WorkspaceHeader, WorkspaceSection } from "@/components/workspace-ui";
import { getDbDesignTaskById } from "@/lib/db/design-flow-adapter";
import { isUuidLike, shouldUseDbDesignFlow } from "@/lib/db/design-flow-toggle";

export default async function DesignTaskDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const useDb = shouldUseDbDesignFlow() && isUuidLike(id);
  const task = useDb ? await getDbDesignTaskById(id) : getDesignTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <AppShellAuth activePath="/design-tasks">
      <WorkspaceHeader
        title={task.title}
        meta={
          <>
            <span>{task.projectName}</span>
            <span className="text-slate-300">／</span>
            <span>設計文件</span>
          </>
        }
        actions={
          <>
            <DesignDocumentExportButton taskId={task.id} rows={task.documentRows} />
            <Link
              href={`/design-tasks/${task.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              返回任務詳情
            </Link>
          </>
        }
      />

      <WorkspaceSection title="文件" meta="此頁僅顯示正式確認後承接的文件內容。">
        <TaskDocumentTable
          rows={task.documentRows}
          columns={[
            { key: "id", label: "編號", render: (row) => row.id },
            { key: "item", label: "項目", render: (row) => row.item },
            { key: "size", label: "尺寸", render: (row) => row.size },
            { key: "materialStructure", label: "材質與結構", render: (row) => row.materialStructure },
            { key: "quantity", label: "數量", render: (row) => row.quantity },
          ]}
          emptyTitle="目前尚無正式設計文件"
          emptyDescription="請先回到任務頁完成全部確認，文件頁才會承接正式成立的內容。"
        />
      </WorkspaceSection>
    </AppShellAuth>
  );
}
