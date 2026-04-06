"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/components/project-data";

type FlowType = "design" | "procurement" | "vendor";

type DispatchState = {
  itemId: string;
  flowType: FlowType;
  title: string;
  size: string;
  material: string;
  structure: string;
  quantity: string;
  referenceUrl: string;
  note: string;
  budgetNote: string;
  vendorName: string;
  requirement: string;
  amount: string;
};

const defaultDispatchState: DispatchState = {
  itemId: "",
  flowType: "design",
  title: "",
  size: "",
  material: "",
  structure: "",
  quantity: "",
  referenceUrl: "",
  note: "",
  budgetNote: "",
  vendorName: "",
  requirement: "",
  amount: "",
};

export function DbExecutionTreeSection({ project }: { project: Project }) {
  const router = useRouter();
  const [mainTitle, setMainTitle] = useState("");
  const [childDrafts, setChildDrafts] = useState<Record<string, string>>({});
  const [dispatch, setDispatch] = useState<DispatchState | null>(null);
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => ({
    design: project.designTasks.length,
    procurement: project.procurementTasks.length,
    vendor: 0,
  }), [project.designTasks.length, project.procurementTasks.length]);

  async function createExecutionItem(parentId?: string) {
    const title = (parentId ? childDrafts[parentId] : mainTitle).trim();
    if (!title) return;
    setSubmitting(true);
    setMessage("");
    const response = await fetch(`/api/projects/${project.id}/execution-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, parentId: parentId ?? null }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok || !result.ok) {
      setMessage(result.error || "新增執行項目失敗");
      return;
    }
    if (parentId) {
      setChildDrafts((prev) => ({ ...prev, [parentId]: "" }));
    } else {
      setMainTitle("");
    }
    router.refresh();
  }

  async function submitDispatch() {
    if (!dispatch) return;
    setSubmitting(true);
    setMessage("");
    const response = await fetch(`/api/projects/${project.id}/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dispatch),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok || !result.ok) {
      setMessage(result.error || "正式交辦失敗");
      return;
    }
    setDispatch(null);
    router.refresh();
    router.push(result.boardPath);
  }

  return (
    <>
      <section id="project-execution-section" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">專案執行項目</h3>
            <p className="mt-1 text-sm text-slate-500">這一版直接把 upstream 主幹接進正式資料：新增項目後即可正式交辦到三板。</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">設計：{summary.design}</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">備品：{summary.procurement}</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">廠商：正式交辦後請至廠商發包板查看</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">新增主項目</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input value={mainTitle} onChange={(event) => setMainTitle(event.target.value)} placeholder="輸入主項目名稱" className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
            <button type="button" disabled={submitting} onClick={() => createExecutionItem()} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">新增主項目</button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {project.executionItems.map((item, index) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">#{index + 1}</span>
                    <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setDispatch({ ...defaultDispatchState, itemId: item.id, title: item.title, flowType: "design" })} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">交辦設計</button>
                  <button type="button" onClick={() => setDispatch({ ...defaultDispatchState, itemId: item.id, title: item.title, flowType: "procurement" })} className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white">交辦備品</button>
                  <button type="button" onClick={() => setDispatch({ ...defaultDispatchState, itemId: item.id, title: item.title, flowType: "vendor", vendorName: "" })} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">交辦廠商</button>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
                {(item.children ?? []).map((child) => (
                  <div key={child.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{child.title}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setDispatch({ ...defaultDispatchState, itemId: child.id, title: child.title, flowType: "design" })} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">設計</button>
                        <button type="button" onClick={() => setDispatch({ ...defaultDispatchState, itemId: child.id, title: child.title, flowType: "procurement" })} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white">備品</button>
                        <button type="button" onClick={() => setDispatch({ ...defaultDispatchState, itemId: child.id, title: child.title, flowType: "vendor" })} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white">廠商</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">新增次項目</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input value={childDrafts[item.id] ?? ""} onChange={(event) => setChildDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))} placeholder="輸入次項目名稱" className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                    <button type="button" disabled={submitting} onClick={() => createExecutionItem(item.id)} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">新增</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {message ? <p className="mt-4 text-sm text-rose-600">{message}</p> : null}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5"><h3 className="text-xl font-semibold">專案分類檢視</h3></div>
        <div className="grid gap-3 lg:grid-cols-3">
          <Link href={`/design-tasks?project=${encodeURIComponent(project.id)}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-lg font-semibold text-blue-700">專案設計</p><p className="mt-2 text-sm text-slate-500">共 {project.designTasks.length} 筆，正式導到設計任務板。</p></Link>
          <Link href={`/procurement-tasks?project=${encodeURIComponent(project.id)}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-lg font-semibold text-amber-700">專案備品</p><p className="mt-2 text-sm text-slate-500">共 {project.procurementTasks.length} 筆，正式導到備品任務板。</p></Link>
          <Link href={`/vendor-assignments?project=${encodeURIComponent(project.id)}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-lg font-semibold text-violet-700">專案廠商</p><p className="mt-2 text-sm text-slate-500">正式導到廠商發包板與文件層。</p></Link>
        </div>
      </section>

      {dispatch ? (
        <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm ring-1 ring-blue-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">正式交辦：{dispatch.flowType === "design" ? "設計" : dispatch.flowType === "procurement" ? "備品" : "廠商"}</h3>
              <p className="mt-1 text-sm text-slate-500">這筆交辦會直接建立正式 task，建立後立即進入對應任務板。</p>
            </div>
            <button type="button" onClick={() => setDispatch(null)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">取消</button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">任務標題</span><input value={dispatch.title} onChange={(event) => setDispatch({ ...dispatch, title: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label>
            {(dispatch.flowType === "design" || dispatch.flowType === "procurement") ? <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">數量</span><input value={dispatch.quantity} onChange={(event) => setDispatch({ ...dispatch, quantity: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label> : null}
            {dispatch.flowType === "design" ? <><label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">尺寸</span><input value={dispatch.size} onChange={(event) => setDispatch({ ...dispatch, size: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label><label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">材質</span><input value={dispatch.material} onChange={(event) => setDispatch({ ...dispatch, material: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label><label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">結構</span><input value={dispatch.structure} onChange={(event) => setDispatch({ ...dispatch, structure: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label></> : null}
            {dispatch.flowType === "procurement" ? <label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">預算說明</span><input value={dispatch.budgetNote} onChange={(event) => setDispatch({ ...dispatch, budgetNote: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label> : null}
            {dispatch.flowType === "vendor" ? <><label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">廠商名稱</span><input value={dispatch.vendorName} onChange={(event) => setDispatch({ ...dispatch, vendorName: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label><label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">需求摘要</span><input value={dispatch.requirement} onChange={(event) => setDispatch({ ...dispatch, requirement: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label><label className="flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">金額</span><input value={dispatch.amount} onChange={(event) => setDispatch({ ...dispatch, amount: event.target.value })} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" /></label></> : null}
            <label className="md:col-span-2 xl:col-span-3 flex flex-col gap-2"><span className="text-sm font-medium text-slate-700">備註 / 說明</span><textarea value={dispatch.note} onChange={(event) => setDispatch({ ...dispatch, note: event.target.value })} className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" /></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={submitting} onClick={submitDispatch} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">正式交辦</button>
          </div>
        </section>
      ) : null}
    </>
  );
}
