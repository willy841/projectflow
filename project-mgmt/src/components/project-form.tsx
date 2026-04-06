"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

  const generatedCode = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    return `PRJ-${stamp}`;
  }, []);

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
      router.push(`/projects/${result.project.id}`);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "建立專案失敗");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">建立專案</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">新增專案表單</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              建立後即正式啟動，送出後會直接進入 Project Detail 並作為三板 upstream source-of-truth。
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            專案編號預覽：{generatedCode}
          </span>
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
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type={key === "eventDate" ? "date" : "text"}
                value={form[key as keyof typeof defaultForm]}
                onChange={(event) => updateField(key as keyof typeof defaultForm, event.target.value)}
                placeholder={placeholder}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0 transition focus:border-slate-400"
              />
            </label>
          ))}

          <label className="md:col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">專案備註</span>
            <textarea
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              placeholder="記錄需求背景、特殊備註、後續提醒事項"
              className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </label>
        </div>

        {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
            {isSubmitting ? "建立中..." : "儲存專案"}
          </button>
          <button type="button" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700">
            清空表單
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold">填寫建議</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• 專案名稱建議包含活動名稱或客戶辨識關鍵字。</li>
            <li>• 活動日期、地點、聯絡資訊先補齊，後續交辦會更順。</li>
            <li>• 預估預算先填概算即可，正式成本可在後續模組補齊。</li>
            <li>• 備註欄可先記錄客戶重點需求與風險事項。</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-400">表單狀態</p>
          {submitted ? (
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
              <p>已完成前端送出流程，下一階段接 API 後就能真正建立資料。</p>
              <p>目前輸入的專案名稱：{form.name || "尚未填寫"}</p>
              <p>客戶名稱：{form.client || "尚未填寫"}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-300">
              尚未送出。這一版先讓你確認欄位是否符合實際使用流程。
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
