"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AuthShellClient } from "@/components/auth-shell-client";
import { WorkspaceStatusNotice, workspacePrimaryButtonClass } from "@/components/workspace-ui";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AuthShellClient activePath="/projects" navItems={[{ label: '首頁總覽', href: '/' }, { label: '專案管理', href: '/projects' }]} user={null}>
      <section className="pf-card p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-50">頁面暫時無法載入</h2>
            <p className="mt-2 text-sm text-slate-400">系統剛剛遇到未預期錯誤。你可以先重試，若仍失敗再回到列表重新進入。</p>
          </div>

          <WorkspaceStatusNotice tone="error">
            {error.message || "發生未預期錯誤，請稍後再試。"}
          </WorkspaceStatusNotice>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => reset()} className={workspacePrimaryButtonClass}>
              重新載入這頁
            </button>
            <Link
              href="/projects"
              className="pf-btn-secondary px-4 py-2.5"
            >
              返回專案列表
            </Link>
          </div>
        </div>
      </section>
    </AuthShellClient>
  );
}
