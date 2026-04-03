"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getVendorDocumentStatusClass, vendorPackages } from "@/components/vendor-data";

type DocumentFilter = "全部" | "未生成" | "需更新" | "已生成";

function getDocumentStatusMessage(status: "未生成" | "已生成" | "需更新") {
  if (status === "已生成") return "目前文件為最新版本";
  if (status === "需更新") return "目前文件不是最新內容，請重新生成";
  return "尚未生成正式文件";
}

export default function VendorPackagesPage() {
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>("全部");
  const [searchKeyword, setSearchKeyword] = useState("");

  const visiblePackages = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return vendorPackages
      .filter((item) => (documentFilter === "全部" ? true : item.documentStatus === documentFilter))
      .filter((item) => {
        if (!keyword) return true;
        return [item.projectName, item.vendorName, item.location, item.code].some((value) => value.toLowerCase().includes(keyword));
      })
      .sort((a, b) => {
        const dateDiff = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.vendorName.localeCompare(b.vendorName, "zh-Hant");
      });
  }, [documentFilter, searchKeyword]);

  const statusCounts = {
    全部: vendorPackages.length,
    未生成: vendorPackages.filter((item) => item.documentStatus === "未生成").length,
    需更新: vendorPackages.filter((item) => item.documentStatus === "需更新").length,
    已生成: vendorPackages.filter((item) => item.documentStatus === "已生成").length,
  } as const;

  return (
    <AppShell activePath="/vendor-packages">
      <header className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">Package 主線</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">廠商發包清單</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
              這裡只處理已送出的 Package：先看廠商、文件狀態與項目數，再進入單一 Package 整理對外內容。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 2xl:min-w-[430px]">
            <article className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100">
              <p className="text-xs font-medium text-slate-500">全部 Package</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{vendorPackages.length}</p>
            </article>
            <article className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100">
              <p className="text-xs font-medium text-slate-500">待生成 / 更新</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{statusCounts["未生成"] + statusCounts["需更新"]}</p>
            </article>
            <article className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100">
              <p className="text-xs font-medium text-slate-500">已生成</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{statusCounts["已生成"]}</p>
            </article>
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["全部", "未生成", "需更新", "已生成"] as const).map((status) => {
              const active = documentFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setDocumentFilter(status)}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                    active ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/15 text-white" : "bg-white text-slate-600"}`}>
                    {statusCounts[status]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="搜尋廠商 / 專案 / 地點 / Package 代碼"
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:w-[320px]"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1280px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">廠商 / 專案</th>
                <th className="px-4 py-3 font-medium">活動資訊</th>
                <th className="px-4 py-3 font-medium">文件狀態</th>
                <th className="px-4 py-3 font-medium">項目數</th>
                <th className="px-4 py-3 font-medium">整體備註</th>
                <th className="px-4 py-3 font-medium">代碼</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visiblePackages.map((vendorPackage) => (
                <tr key={vendorPackage.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{vendorPackage.vendorName}</p>
                    <p className="mt-1 text-xs text-slate-500">{vendorPackage.projectName}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{vendorPackage.eventDate}</p>
                    <p className="mt-1 text-xs text-slate-500">{vendorPackage.location}</p>
                    <p className="mt-1 text-xs text-slate-500">進場時間 {vendorPackage.loadInTime}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getVendorDocumentStatusClass(vendorPackage.documentStatus)}`}>
                      {vendorPackage.documentStatus}
                    </span>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{getDocumentStatusMessage(vendorPackage.documentStatus)}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <span className="font-semibold text-slate-900">{vendorPackage.items.length}</span> 筆
                  </td>
                  <td className="px-4 py-4 text-slate-600">{vendorPackage.note || "-"}</td>
                  <td className="px-4 py-4 text-xs text-slate-500">{vendorPackage.code}</td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/vendor-packages/${vendorPackage.id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      查看 Package
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visiblePackages.length ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            目前沒有符合篩選條件的 package。
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
