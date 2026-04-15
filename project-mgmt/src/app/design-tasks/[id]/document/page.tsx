import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DesignDocumentExportButton } from "@/components/document-export-button";
import { getDesignTaskById } from "@/components/design-task-data";
import { MockDesignDocumentView } from "@/components/mock-design-document-view";
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
    <AppShell activePath="/design-tasks">
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

      <WorkspaceSection title="文件">
        <MockDesignDocumentView taskId={task.id} fallbackRows={task.documentRows} />
      </WorkspaceSection>
    </AppShell>
  );
}
