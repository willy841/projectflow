"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CopyEventInfoButton } from "@/components/copy-event-info-button";
import { ExecutionTreeSection } from "@/components/execution-tree-section";
import { Project } from "@/components/project-data";
import { RequirementsPanel } from "@/components/requirements-panel";
import { isUuidLike } from "@/lib/db/project-flow-toggle";

type ProjectDetailEntryContext = {
  task?: string;
  source?: string;
};

type ProjectFormState = {
  name: string;
  client: string;
  eventDate: string;
  location: string;
  loadInTime: string;
  eventType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactLine: string;
  owner: string;
  budget: string;
  cost: string;
  note: string;
};

function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "-";
  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function buildProjectForm(project: Project): ProjectFormState {
  return {
    name: project.name,
    client: project.client,
    eventDate: formatDateOnly(project.eventDate),
    location: project.location,
    loadInTime: project.loadInTime,
    eventType: project.eventType,
    contactName: project.contactName,
    contactPhone: project.contactPhone,
    contactEmail: project.contactEmail,
    contactLine: project.contactLine,
    owner: project.owner,
    budget: project.budget,
    cost: project.cost,
    note: project.note,
  };
}

export function ProjectDetailShell({ project, entryContext }: { project: Project; entryContext?: ProjectDetailEntryContext }) {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const isDbProject = isUuidLike(project.id);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(() => buildProjectForm(project));

  useEffect(() => {
    setProjectForm(buildProjectForm(project));
  }, [project]);

  function updateField(key: keyof ProjectFormState, value: string) {
    setProjectForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveProject() {
    if (!isDbProject) {
      setIsEditingProject(false);
      return;
    }

    setIsSavingProject(true);
    setSaveMessage("");

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectForm.name,
          client: projectForm.client,
          eventDate: projectForm.eventDate,
          location: projectForm.location,
          loadInTime: projectForm.loadInTime,
          eventType: projectForm.eventType,
          contactName: projectForm.contactName,
          contactPhone: projectForm.contactPhone,
          contactEmail: projectForm.contactEmail,
          contactLine: projectForm.contactLine,
          status: project.status,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setSaveMessage(result.error || "專案儲存失敗");
        return;
      }

      setProjectForm((prev) => ({
        ...prev,
        name: result.project.name ?? prev.name,
        client: result.project.client_name ?? "-",
        eventDate: formatDateOnly(result.project.event_date),
        location: result.project.location ?? "-",
        loadInTime: result.project.load_in_time ?? "-",
        eventType: result.project.event_type ?? "-",
        contactName: result.project.contact_name ?? "-",
        contactPhone: result.project.contact_phone ?? "-",
        contactEmail: result.project.contact_email ?? "-",
        contactLine: result.project.contact_line ?? "-",
      }));
      setSaveMessage("已儲存客戶資料與活動資訊");
      setIsEditingProject(false);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "專案儲存失敗");
    } finally {
      setIsSavingProject(false);
    }
  }

  const focusedExecutionTargetId = useMemo(() => {
    const target = entryContext?.task?.trim();
    if (!target) return null;

    for (const item of project.executionItems) {
      if (item.title === target) return item.id;
      const matchedChild = item.children?.find((child) => child.title === target);
      if (matchedChild) return item.id;
    }

    return null;
  }, [entryContext?.task, project.executionItems]);

  useEffect(() => {
    if (!focusedExecutionTargetId) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector(`[data-execution-item-id="${focusedExecutionTargetId}"]`) as HTMLElement | null;
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-2", "ring-blue-300", "border-blue-300", "bg-blue-50/40");
      window.setTimeout(() => {
        target.classList.remove("ring-2", "ring-blue-300", "border-blue-300", "bg-blue-50/40");
      }, 2200);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusedExecutionTargetId]);

  return (
    <>
      <header className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 xl:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{projectForm.name}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <CopyEventInfoButton
              projectName={projectForm.name}
              eventDate={projectForm.eventDate}
              location={projectForm.location}
              loadInTime={projectForm.loadInTime}
            />
            <Link href="/projects" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
              返回列表
            </Link>
            <button
              type="button"
              onClick={() => setIsEditingProject((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {isEditingProject ? "收合編輯專案" : "編輯專案"}
            </button>
          </div>
        </div>
      </header>

      {isEditingProject ? (
        <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm ring-1 ring-blue-100">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">編輯專案</h3>
              <p className="mt-1 text-sm text-slate-500">這一版會正式儲存客戶資料與活動資訊到 DB。</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              正式版
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["name", "專案名稱", "例如：春季品牌快閃活動", "text"],
              ["client", "客戶名稱", "例如：森野生活", "text"],
              ["eventDate", "活動日期", "", "date"],
              ["location", "活動地點", "例如：松山文創園區", "text"],
              ["loadInTime", "進場時間", "", "time"],
              ["eventType", "活動類型", "例如：品牌快閃", "text"],
              ["owner", "專案負責人", "目前為唯讀欄位", "text"],
              ["contactName", "聯繫人", "例如：林雅晴", "text"],
              ["contactPhone", "電話", "例如：0912-345-678", "text"],
              ["contactEmail", "Email", "例如：name@brand.com", "text"],
              ["contactLine", "LINE", "例如：brand-team", "text"],
              ["budget", "專案預算", "目前為唯讀欄位", "text"],
              ["cost", "目前成本", "目前為唯讀欄位", "text"],
            ].map(([key, label, placeholder, type]) => {
              const isReadonly = ["owner", "budget", "cost"].includes(key);
              return (
                <label key={key} className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <input
                    type={type}
                    value={projectForm[key as keyof typeof projectForm]}
                    onChange={(event) => updateField(key as keyof typeof projectForm, event.target.value)}
                    placeholder={placeholder}
                    readOnly={isReadonly}
                    className={`h-11 rounded-2xl border px-4 text-sm outline-none transition ${
                      isReadonly
                        ? "border-slate-100 bg-slate-100 text-slate-500"
                        : "border-slate-200 bg-white focus:border-blue-400"
                    }`}
                  />
                </label>
              );
            })}

            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
              <span className="text-sm font-medium text-slate-700">專案備註</span>
              <textarea
                value={projectForm.note}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="目前為前端顯示欄位，正式 DB 欄位尚未納入"
                readOnly
                className="min-h-28 rounded-2xl border border-slate-100 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {saveMessage ? <p className="w-full text-sm text-blue-700">{saveMessage}</p> : null}
            <button
              type="button"
              onClick={saveProject}
              disabled={isSavingProject}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSavingProject ? "儲存中..." : "儲存客戶資料與活動資訊"}
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectForm(buildProjectForm(project));
                setSaveMessage("");
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              還原原始內容
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {[
          { label: "活動日期", value: projectForm.eventDate },
          { label: "活動地點", value: projectForm.location },
          { label: "進場時間", value: projectForm.loadInTime },
          { label: "專案預算", value: projectForm.budget },
          { label: "目前成本", value: projectForm.cost },
        ].map((item) => (
          <article key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 min-h-11 flex items-start">
            <div className="min-w-0 pt-1.5">
              <h3 className="text-xl font-semibold leading-none">專案基本資訊</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["客戶名稱", projectForm.client],
              ["活動類型", projectForm.eventType],
              ["聯繫人", projectForm.contactName],
              ["電話", projectForm.contactPhone],
              ["Email", projectForm.contactEmail],
              ["LINE", projectForm.contactLine],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3.5">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <RequirementsPanel initialItems={project.requirements} />
      </section>

      <ExecutionTreeSection project={{ ...project, ...projectForm }} />
    </>
  );
}
