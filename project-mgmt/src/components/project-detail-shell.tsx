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
};

const summaryItemsMeta = [
  { label: "活動日期", icon: "▦" },
  { label: "活動地點", icon: "⌖" },
  { label: "進場時間", icon: "◴" },
  { label: "專案預算", icon: "◫" },
  { label: "目前成本", icon: "◩" },
] as const;

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
          owner: projectForm.owner,
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
        owner: result.project.owner ?? "-",
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
      <header className="p-1 xl:p-1">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-50">{projectView.name}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <CopyEventInfoButton
              projectName={projectView.name}
              eventDate={projectView.eventDate}
              location={projectView.location}
              loadInTime={projectView.loadInTime}
            />
            <Link href="/projects" className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 text-sm font-semibold text-slate-200 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition hover:bg-slate-900/60">
              返回列表
            </Link>
            <button
              type="button"
              onClick={() => setIsEditingProject((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(59,130,246,0.42),rgba(37,99,235,0.24))] px-4 text-sm font-semibold text-white shadow-[0_24px_48px_-26px_rgba(30,64,175,0.7),0_0_26px_rgba(96,165,250,0.16),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition hover:brightness-105"
            >
              {isEditingProject ? "收合編輯專案" : "編輯專案"}
            </button>
          </div>
        </div>
      </header>

      {isEditingProject ? (
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.72),rgba(13,22,39,0.52))] p-6 shadow-[0_34px_90px_-38px_rgba(0,0,0,0.68),0_0_34px_rgba(96,165,250,0.08),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-22px_44px_-28px_rgba(7,13,25,0.98)] backdrop-blur-[28px]">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-50">• 編輯專案</h3>
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
              ["owner", "專案負責人", "例如：Willy", "text"],
              ["contactName", "聯繫人", "例如：林雅晴", "text"],
              ["contactPhone", "電話", "例如：0912-345-678", "text"],
              ["contactEmail", "Email", "例如：name@brand.com", "text"],
              ["contactLine", "LINE", "例如：brand-team", "text"],
              ["budget", "專案預算", "目前為唯讀欄位", "text"],
              ["cost", "目前成本", "目前為唯讀欄位", "text"],
            ].map(([key, label, placeholder, type]) => {
              const isReadonly = ["budget", "cost"].includes(key);
              return (
                <label key={key} className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-300">{label}</span>
                  <input
                    type={type}
                    value={projectForm[key as keyof typeof projectForm]}
                    onChange={(event) => updateField(key as keyof typeof projectForm, event.target.value)}
                    placeholder={placeholder}
                    readOnly={isReadonly}
                    className={`h-11 rounded-2xl border px-4 text-sm outline-none transition ${
                      isReadonly
                        ? "border-white/8 bg-slate-900/30 text-slate-500"
                        : "border-white/10 bg-slate-900/45 text-slate-100 focus:border-sky-300/30"
                    }`}
                  />
                </label>
              );
            })}

          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {saveMessage ? <p className="w-full text-sm text-slate-300">{saveMessage}</p> : null}
            <button
              type="button"
              onClick={saveProject}
              disabled={isSavingProject}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_22px_44px_-22px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-slate-900/70 disabled:opacity-50"
            >
              {isSavingProject ? "儲存中..." : "儲存客戶資料與活動資訊"}
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectForm(buildProjectForm(projectView));
                setSaveMessage("");
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/60"
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
        ].map((item) => {
          const meta = summaryItemsMeta.find((entry) => entry.label === item.label);
          return (
            <article key={item.label} className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(36,48,72,0.76),rgba(14,22,39,0.52))] p-5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className="mt-3 text-[1.15rem] font-semibold tracking-tight text-slate-100">{item.value}</p>
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-300/16 bg-sky-400/10 text-base text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  {meta?.icon}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <article className="p-1">
          <div className="mb-4 min-h-11 flex items-center">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold leading-none text-white">• 專案基本資訊</h3>
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
              <div key={label} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(40,53,79,0.64),rgba(17,27,44,0.46))] px-4 py-4 shadow-[0_26px_52px_-30px_rgba(0,0,0,0.58),0_0_18px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-18px_28px_-20px_rgba(10,18,32,0.88)] backdrop-blur-2xl">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-2 font-medium text-slate-100">{value}</p>
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
