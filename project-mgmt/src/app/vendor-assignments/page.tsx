"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { vendorAssignments } from "@/components/vendor-data";
import { projects as projectSeeds } from "@/components/project-data";

type ProjectEntry = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

type VendorEntry = {
  vendorName: string;
  eventDate: string;
  taskCount: number;
};

export default function VendorAssignmentsPage({
  searchParams,
}: {
  searchParams?: { project?: string };
}) {
  const activeProjectId = searchParams?.project;

  const projects = useMemo<ProjectEntry[]>(() => {
    const map = new Map<string, ProjectEntry>();

    vendorAssignments.forEach((assignment) => {
      const existing = map.get(assignment.projectId);
      if (existing) {
        existing.taskCount += 1;
        return;
      }

      const projectMeta = projectSeeds.find((project) => project.id === assignment.projectId);

      map.set(assignment.projectId, {
        projectId: assignment.projectId,
        projectName: projectMeta?.name || assignment.projectId,
        eventDate: projectMeta?.eventDate || "未設定",
        taskCount: 1,
      });
    });

    return Array.from(map.values());
  }, []);

  const activeProject = projects.find((project) => project.projectId === activeProjectId);

  const vendors = useMemo<VendorEntry[]>(() => {
    if (!activeProjectId) return [];

    const map = new Map<string, VendorEntry>();

    vendorAssignments
      .filter((assignment) => assignment.projectId === activeProjectId)
      .forEach((assignment) => {
        const vendorName = assignment.selectedVendorName || "未指定廠商";
        const existing = map.get(vendorName);
        if (existing) {
          existing.taskCount += 1;
          return;
        }

        const projectMeta = projectSeeds.find((project) => project.id === assignment.projectId);

        map.set(vendorName, {
          vendorName,
          eventDate: projectMeta?.eventDate || "未設定",
          taskCount: 1,
        });
      });

    return Array.from(map.values());
  }, [activeProjectId]);

  return (
    <AppShell activePath="/vendor-assignments">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">廠商發包板</h2>
          <span className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            共 {projects.length} 個專案
          </span>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {!activeProject ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <article
                key={project.projectId}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">專案名稱</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{project.projectName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">任務數量</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{project.taskCount}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">活動日期</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{project.eventDate}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href={`/vendor-assignments?project=${encodeURIComponent(project.projectId)}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      進入專案
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm text-slate-500">目前專案</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{activeProject.projectName}</p>
              </div>
              <Link
                href="/vendor-assignments"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                返回專案列表
              </Link>
            </div>

            <div className="space-y-3">
              {vendors.map((vendor) => (
                <article
                  key={vendor.vendorName}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">廠商</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{vendor.vendorName}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">任務數量</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{vendor.taskCount}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">活動日期</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{vendor.eventDate}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/vendor-assignments/${encodeURIComponent(vendor.vendorName)}?project=${encodeURIComponent(activeProject.projectId)}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        進入廠商
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
