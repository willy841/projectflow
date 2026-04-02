import Link from "next/link";
import {
  getAssignmentIssueStatusClass,
  getAssignmentIssueStatusLabel,
  getAssignmentReplyStatusLabel,
  getAssignmentSelectedVendorLabel,
  getAssignmentsByProjectId,
  getPackageDocumentStatus,
  getPackageDocumentStatusClass,
  getPackagesByProjectId,
} from "@/components/vendor-data";

export function ProjectVendorSection({ projectId }: { projectId: string }) {
  const vendorAssignments = getAssignmentsByProjectId(projectId);
  const vendorPackages = getPackagesByProjectId(projectId);

  return (
    <section className="space-y-6">
      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-700">PRE-ISSUE</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Assignment / Reply</h3>
            <p className="mt-1 text-sm text-slate-500">長在舊 project detail 內，處理正式發包前的 assignment、reply、vendor 決策與發包入口。</p>
          </div>
        </div>

        {vendorAssignments.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[880px] divide-y divide-slate-200 text-sm xl:min-w-full">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Assignment 名稱</th>
                  <th className="px-4 py-3 font-medium">Reply 狀況</th>
                  <th className="px-4 py-3 font-medium">已選定 Vendor</th>
                  <th className="px-4 py-3 font-medium">發包狀態</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vendorAssignments.map((assignment) => (
                  <tr key={assignment.id} className="align-top">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{assignment.title}</p>
                        <p className="mt-1 text-xs text-slate-500">來源：{assignment.executionItemTitle}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {getAssignmentReplyStatusLabel(assignment)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{getAssignmentSelectedVendorLabel(assignment)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getAssignmentIssueStatusClass(assignment)}`}>
                        {getAssignmentIssueStatusLabel(assignment)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/vendor-assignments/${assignment.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                        >
                          查看 Reply
                        </Link>
                        <Link
                          href={assignment.packageId ? `/vendor-packages/${assignment.packageId}` : `/vendor-assignments/${assignment.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                        >
                          發包
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            目前尚無 Assignment / Reply 資料。
          </div>
        )}
      </article>

      <article className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-700">POST-ISSUE</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Issued Packages</h3>
            <p className="mt-1 text-sm text-slate-500">承接正式發包後的 package 主線；文件查看、生成與重新生成都仍留在 package page。</p>
          </div>
        </div>

        {vendorPackages.length ? (
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-blue-100">
            <table className="min-w-[760px] divide-y divide-slate-200 text-sm xl:min-w-full">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">廠商名稱</th>
                  <th className="px-4 py-3 font-medium">assignment 數</th>
                  <th className="px-4 py-3 font-medium">文件狀態</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorPackages.map((vendorPackage) => {
                  const documentStatus = getPackageDocumentStatus(vendorPackage);

                  return (
                    <tr key={vendorPackage.id}>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{vendorPackage.vendorName}</p>
                          <p className="mt-1 text-xs text-slate-500">{vendorPackage.code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{vendorPackage.assignmentIds.length} 筆</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getPackageDocumentStatusClass(documentStatus)}`}>
                          {documentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/vendor-packages/${vendorPackage.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          查看 Package
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500">
            目前尚未建立 Issued Package。
          </div>
        )}
      </article>
    </section>
  );
}
