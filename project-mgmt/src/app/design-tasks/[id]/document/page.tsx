import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDesignTaskById } from "@/components/design-task-data";
import { MockDesignDocumentView } from "@/components/mock-design-document-view";
import { WorkspaceHeader, WorkspaceSection } from "@/components/workspace-ui";
import { DesignDocumentExportButton } from "@/components/document-export-button";
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
    <AppShell activePath="/design-tasks">
      <WorkspaceHeader
        title={task.title}
        backHref={`/design-tasks/${task.id}`}
        backLabel="返回任務詳情"
        actions={<DesignDocumentExportButton taskId={task.id} rows={task.documentRows} />}
      />

      <WorkspaceSection>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">文件</h3>
          </div>
        </div>

        <MockDesignDocumentView taskId={task.id} fallbackRows={task.documentRows} />
      </WorkspaceSection>
    </AppShell>
  );
}
