import Link from "next/link";
import { AppShellAuth } from "@/components/app-shell-auth";
import { WorkspaceEmptyState, workspacePrimaryButtonClass } from "@/components/workspace-ui";

export default function NotFound() {
  return (
    <AppShellAuth activePath="/projects">
      <WorkspaceEmptyState
        title="找不到你要查看的頁面"
        description="這個頁面可能已不存在、連結已變更，或目前沒有對應的正式資料可讀取。"
        actions={
          <>
            <Link href="/projects" className={workspacePrimaryButtonClass}>
              返回專案列表
            </Link>
            <Link
              href="/"
              className="pf-btn-secondary px-4 py-2.5"
            >
              返回首頁
            </Link>
          </>
        }
      />
    </AppShellAuth>
  );
}
