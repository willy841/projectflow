import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getProjectById, getStatusClass } from "@/components/project-data";
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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  const vendorAssignments = getAssignmentsByProjectId(project.id);
  const vendorPackages = getPackagesByProjectId(project.id);

  return (
    <AppShell activePath="/projects">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">{project.code}</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(project.status)}`}>
                {project.status}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.note}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700">
              返回列表
            </Link>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
              編輯專案
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "活動日期", value: project.eventDate },
          { label: "活動地點", value: project.location },
          { label: "專案預算", value: project.budget },
          { label: "目前成本", value: project.cost },
        ].map((item) => (
          <article key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">專案基本資訊</h3>
              <p className="mt-1 text-sm text-slate-500">專案主檔與客戶聯繫窗口。</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>負責人：{project.owner}</p>
              <p className="mt-1">進度：{project.progress}%</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["客戶名稱", project.client],
              ["活動類型", project.eventType],
              ["聯繫人", project.contactName],
              ["電話", project.contactPhone],
              ["Email", project.contactEmail],
              ["LINE", project.contactLine],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h3 className="text-xl font-semibold">需求摘要</h3>
            <p className="mt-1 text-sm text-slate-500">從溝通需求拆解出的重點項目。</p>
          </div>

          <div className="space-y-3">
            {project.requirements.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{item.category}</p>
                    <h4 className="mt-1 font-semibold text-slate-900">{item.title}</h4>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">設計交辦</h3>
              <p className="mt-1 text-sm text-slate-500">後續可延伸為完整設計任務 CRUD。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增設計交辦</button>
          </div>

          <div className="space-y-3">
            {project.designTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">負責人：{task.assignee}</p>
                    <p className="mt-1 text-sm text-slate-500">期限：{task.due}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">備品採購</h3>
              <p className="mt-1 text-sm text-slate-500">後續可延伸為備品採購與驗收流程。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">+ 新增備品項目</button>
          </div>

          <div className="space-y-3">
            {project.procurementTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">採購：{task.buyer}</p>
                    <p className="mt-1 text-sm text-slate-500">預算：{task.budget}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-sky-700">PRE-ISSUE</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Assignment / Reply</h3>
              <p className="mt-1 text-sm text-slate-500">處理正式發包前的 assignment、reply、vendor 決策與發包入口。</p>
            </div>
          </div>

          {vendorAssignments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Assignment 名稱</th>
                    <th className="px-4 py-3 font-medium">Reply 狀況</th>
                    <th className="px-4 py-3 font-medium">已選定 Vendor</th>
                    <th className="px-4 py-3 font-medium">發包狀態</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
              <p className="mt-1 text-sm text-slate-500">只承接已正式進入 package 主線的資料；文件查看與生成仍統一在 package page 處理。</p>
            </div>
          </div>

          {vendorPackages.length ? (
            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-blue-100">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
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
    </AppShell>
  );
}
