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

function normalizeProject(project: Project): Project {
  return {
    ...project,
    eventDate: formatDateOnly(project.eventDate),
  };
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

function buildProjectView(baseProject: Project, form: ProjectFormState): Project {
  return {
    ...baseProject,
    name: form.name,
    client: form.client,
    eventDate: formatDateOnly(form.eventDate),
    location: form.location,
    loadInTime: form.loadInTime,
    eventType: form.eventType,
    contactName: form.contactName,
    contactPhone: form.contactPhone,
    contactEmail: form.contactEmail,
    contactLine: form.contactLine,
    owner: form.owner,
    budget: form.budget,
    cost: form.cost,
    note: form.note,
  };
}

export function ProjectDetailShell({ project, entryContext }: { project: Project; entryContext?: ProjectDetailEntryContext }) {
  const normalizedIncomingProject = useMemo(() => normalizeProject(project), [project]);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const isDbProject = isUuidLike(project.id);
  const [projectView, setProjectView] = useState<Project>(normalizedIncomingProject);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(() => buildProjectForm(normalizedIncomingProject));

  useEffect(() => {
    setProjectView(normalizedIncomingProject);
    setProjectForm(buildProjectForm(normalizedIncomingProject));
  }, [normalizedIncomingProject]);

  function updateField(key: keyof ProjectFormState, value: string) {
    setProjectForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveProject() {
    if (!isDbProject) {
      const nextView = buildProjectView(projectView, projectForm);
      setProjectView(nextView);
      setProjectForm(buildProjectForm(nextView));
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

      const nextForm: ProjectFormState = {
        ...projectForm,
        name: result.project.name ?? projectForm.name,
        client: result.project.client_name ?? "-",
        eventDate: formatDateOnly(result.project.event_date),
        location: result.project.location ?? "-",
        loadInTime: result.project.load_in_time ?? "-",
        eventType: result.project.event_type ?? "-",
        contactName: result.project.contact_name ?? "-",
        contactPhone: result.project.contact_phone ?? "-",
        contactEmail: result.project.contact_email ?? "-",
        contactLine: result.project.contact_line ?? "-",
      };
      const nextView = buildProjectView(projectView, nextForm);

      setProjectForm(nextForm);
      setProjectView(nextView);
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

    for (const item of projectView.executionItems) {
      if (item.title === target) return item.id;
      const matchedChild = item.children?.find((child) => child.title === target);
      if (matchedChild) return item.id;
    }

    return null;
  }, [entryContext?.task, projectView.executionItems]);

  useEffect(() => {
    if (!focusedExecutionTargetId) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector(`[data-execution-item-id="${focusedExecutionTargetId}"]`) as HTMLElement | null;
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-2", "ring-slate-300", "border-slate-300", "bg-slate-100/70");
      window.setTimeout(() => {
        target.classList.remove("ring-2", "ring-slate-300", "border-slate-300", "bg-slate-100/70");
      }, 2200);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusedExecutionTargetId]);

  return (
    <>
      <header className="rounded-[30px] border border-white/70 bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] xl:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{projectView.name}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <CopyEventInfoButton
              projectName={projectView.name}
              eventDate={projectView.eventDate}
              location={projectView.location}
              loadInTime={projectView.loadInTime}
            />
            <Link href="/projects" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200/90 bg-white/95 px-4 text-sm font-semibold text-slate-800 shadow-[var(--shadow-soft)] transition hover:border-slate-300 hover:bg-slate-50/95">
              返回列表
            </Link>
            <button
              type="button"
              onClick={() => setIsEditingProject((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200/90 bg-white/95 px-4 text-sm font-semibold text-slate-800 shadow-[var(--shadow-soft)] transition hover:border-slate-300 hover:bg-slate-50/95"
            >
              {isEditingProject ? "收合編輯專案" : "編輯專案"}
            </button>
          </div>
        </div>
      </header>

      {isEditingProject ? (
        <section className="rounded-[28px] border border-white/65 bg-[rgba(248,250,252,0.92)] p-6 shadow-[var(--shadow-card)] backdrop-blur-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">編輯專案</h3>
            </div>
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
                    className={`h-11 rounded-2xl border px-4 text-sm shadow-[var(--shadow-soft)] outline-none transition ${
                      isReadonly
                        ? "border-slate-100 bg-slate-100 text-slate-500"
                        : "border-slate-200/90 bg-white/95 focus:border-[var(--accent-strong)]"
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
                className="min-h-28 rounded-2xl border border-slate-100 bg-slate-100 px-4 py-3 text-sm text-slate-500 shadow-[var(--shadow-soft)] outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {saveMessage ? <p className="w-full text-sm text-slate-700">{saveMessage}</p> : null}
            <button
              type="button"
              onClick={saveProject}
              disabled={isSavingProject}
              className="inline-flex items-center justify-center rounded-2xl border border-[rgba(47,109,244,0.8)] bg-[linear-gradient(180deg,#4f8cff,#2f6df4)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:brightness-105 disabled:opacity-50"
            >
              {isSavingProject ? "儲存中..." : "儲存客戶資料與活動資訊"}
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectForm(buildProjectForm(projectView));
                setSaveMessage("");
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[var(--shadow-soft)] transition hover:border-slate-300 hover:bg-slate-50/95"
            >
              還原原始內容
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {[
          { label: "活動日期", value: projectView.eventDate },
          { label: "活動地點", value: projectView.location },
          { label: "進場時間", value: projectView.loadInTime },
          { label: "專案預算", value: projectView.budget },
          { label: "目前成本", value: projectView.cost },
        ].map((item) => (
          <article key={item.label} className="rounded-[28px] border border-white/70 bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <article className="rounded-[30px] border border-white/70 bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          <div className="mb-4 min-h-11 flex items-center">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold leading-none">專案基本資訊</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["客戶名稱", projectView.client],
              ["活動類型", projectView.eventType],
              ["聯繫人", projectView.contactName],
              ["電話", projectView.contactPhone],
              ["Email", projectView.contactEmail],
              ["LINE", projectView.contactLine],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200/70 bg-slate-50/85 px-4 py-4 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <RequirementsPanel projectId={isDbProject ? project.id : undefined} initialItems={projectView.requirements} />
      </section>

      <ExecutionTreeSection project={projectView} />
    </>
  );
}
