import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getVendorDocumentStatusClass } from "@/components/vendor-data";
import { WorkspaceEmptyState, WorkspaceHeader, workspacePrimaryButtonClass } from "@/components/workspace-ui";
import { listDbVendorPackages } from "@/lib/db/vendor-package-adapter";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";

function getDocumentStatusMessage(status: "未生成" | "已生成" | "需更新") {
  if (status === "已生成") return "目前文件為最新版本";
  if (status === "需更新") return "目前文件不是最新內容，請重新生成";
  return "尚未生成正式文件";
}

export default async function VendorPackagesPage() {
  const packages = shouldUseDbVendorFlow() ? await listDbVendorPackages() : [];

  return (
    <AppShell activePath="/vendor-packages">
      <WorkspaceHeader title="廠商發包清單" />

      <section className="space-y-4">
        {packages.length ? packages.map((vendorPackage) => (
          <article key={vendorPackage.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h3>
                <p className="mt-2 text-sm text-slate-600">{vendorPackage.eventDate}｜{vendorPackage.location}｜進場時間 {vendorPackage.loadInTime}</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{getDocumentStatusMessage(vendorPackage.documentStatus)}</p>
              </div>
              <Link href={`/vendor-packages/${vendorPackage.id}`} className={workspacePrimaryButtonClass}>查看文件</Link>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <p>項目數：{vendorPackage.items.length}</p>
              <p>文件狀態：<span className={`ml-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(vendorPackage.documentStatus)}`}>{vendorPackage.documentStatus}</span></p>
              <p>文件整體備註：{vendorPackage.note || '-'}</p>
            </div>
          </article>
        )) : (
          <WorkspaceEmptyState
            title="目前尚無可承接的文件"
            description="請先回到廠商發包板完成全部確認；確認後，這裡會承接可整理與查看的發包內容。"
            actions={<Link href="/vendor-assignments" className={workspacePrimaryButtonClass}>前往廠商發包板</Link>}
          />
        )}
      </section>
    </AppShell>
  );
}
