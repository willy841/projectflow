"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProjectRouteId } from "@/components/project-data";

const defaultForm = {
  name: "",
  client: "",
  eventDate: "",
  location: "",
  eventType: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactLine: "",
  owner: "",
  budget: "",
  note: "",
};

export function ProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(key: keyof typeof defaultForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setSubmitError(result.error || "建立專案失敗");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      router.push(`/projects/${getProjectRouteId({ id: result.project.id, name: result.project.name })}`);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "建立專案失敗");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-1">
      <form onSubmit={handleSubmit} className="pf-card p-6 md:p-7">
        <div className="mb-6">
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">新增專案表單</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["name", "專案名稱", "例如：春季品牌快閃活動"],
            ["client", "客戶名稱", "例如：森野生活"],
            ["eventDate", "活動日期", ""],
            ["location", "活動地點", "例如：松山文創園區"],
            ["eventType", "活動類型", "例如：品牌快閃 / 發表會"],
            ["owner", "專案負責人", "例如：Willy"],
            ["contactName", "聯繫人", "例如：林雅晴"],
            ["contactPhone", "聯絡電話", "例如：0912-345-678"],
            ["contactEmail", "Email", "例如：name@brand.com"],
            ["contactLine", "LINE", "例如：brand-team"],
            ["budget", "預估預算", "例如：NT$ 500,000"],
          ].map(([key, label, placeholder]) => (
            <label key={key} className={`flex flex-col gap-2 ${key === "note" ? "md:col-span-2" : ""}`}>
              <span className="text-sm font-medium text-slate-300">{label}</span>
              <input
                type={key === "eventDate" ? "date" : "text"}
                value={form[key as keyof typeof defaultForm]}
                onChange={(event) => updateField(key as keyof typeof defaultForm, event.target.value)}
                placeholder={placeholder}
                className="pf-input h-12"
              />
            </label>
          ))}

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-300">專案備註</span>
            <textarea
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              placeholder="記錄需求背景、特殊備註、後續提醒事項"
              className="pf-input min-h-32 px-4 py-3"
            />
          </label>
        </div>

        {submitError ? <p className="mt-4 text-sm text-rose-300">{submitError}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={isSubmitting} className="pf-btn-primary px-5 py-3 disabled:opacity-50">
            {isSubmitting ? "建立中..." : "儲存專案"}
          </button>
          <button type="button" className="pf-btn-secondary px-5 py-3 text-slate-200">
            清空表單
          </button>
        </div>
      </form>
    </div>
  );
}
