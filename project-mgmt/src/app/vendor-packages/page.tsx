import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getVendorDocumentStatusClass, vendorPackages } from "@/components/vendor-data";

function getDocumentStatusMessage(status: "未生成" | "已生成" | "需更新") {
  if (status === "已生成") return "目前文件為最新版本";
  if (status === "需更新") return "目前文件不是最新內容，請重新生成";
  return "尚未生成正式文件";
}

export default function VendorPackagesPage() {
  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm ring-1 ring-blue-100">
        <p className="text-sm text-slate-500">Vendor Flow / 廠商發包清單</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">廠商發包清單</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">送出後直接進入 package 主線。這一層只處理文件背景、發包項目與文件整體備註，並手動生成正式文件。</p>
      </header>

      <section className="space-y-4">
        {vendorPackages.map((vendorPackage) => (
          <article key={vendorPackage.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm text-slate-500">{vendorPackage.code}</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{vendorPackage.vendorName}</h3>
                <p className="mt-2 text-sm text-slate-600">{vendorPackage.eventDate}｜{vendorPackage.location}｜進場時間 {vendorPackage.loadInTime}</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{getDocumentStatusMessage(vendorPackage.documentStatus)}</p>
              </div>
              <Link href={`/vendor-packages/${vendorPackage.id}`} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                查看 Package
              </Link>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <p>項目數：{vendorPackage.items.length}</p>
              <p>
                文件狀態：
                <span className={`ml-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(vendorPackage.documentStatus)}`}>
                  {vendorPackage.documentStatus}
                </span>
              </p>
              <p>文件整體備註：{vendorPackage.note || "-"}</p>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
