"use client";

import { useMemo, useState } from "react";
import { ProjectVendorSection } from "@/components/project-vendor-section";
import {
  AssignmentReply,
  DesignAssignmentDraft,
  ExecutionTree,
  ProcurementAssignmentDraft,
  VendorAssignmentDraft,
} from "@/components/execution-tree";
import { Project, getStatusClass } from "@/components/project-data";

type OpenCategory = "design" | "procurement" | "vendor";

type ReplyForm = {
  item: string;
  quantity: string;
  size: string;
  material: string;
  previewUrl: string;
  cost: string;
  vendor: string;
};

type DesignAssignmentItem = { targetId: string; title: string; data: DesignAssignmentDraft };
type ProcurementAssignmentItem = { targetId: string; title: string; data: ProcurementAssignmentDraft };
export type VendorAssignmentItem = { targetId: string; title: string; data: VendorAssignmentDraft };

type DisplayField = { label: string; value: string; tone?: string };

type DisplayItem = {
  id: string;
  title: string;
  sourceLabel: string;
  badge: string;
  badgeClass: string;
  categoryLabel: string;
  owner?: string;
  cardSummary: string[];
  fields: DisplayField[];
  collapsedFields?: DisplayField[];
  replies: AssignmentReply[];
};

type ParsedDesignReply = {
  title: string;
  quantity: string;
  amount: string;
  size: string;
  materialStructure: string;
  fileUrl: string;
  vendor: string;
};

type DesignDocumentGroup = {
  vendor: string;
  status: "未生成" | "已生成" | "需更新";
  replies: Array<ParsedDesignReply & { sourceTitle: string; replyId: string; sequence: number }>;
};

const defaultReplyForm: ReplyForm = {
  item: "",
  quantity: "",
  size: "",
  material: "",
  previewUrl: "",
  cost: "",
  vendor: "",
};

function parseReplyMessage(reply: AssignmentReply) {
  const lines = reply.message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const getValue = (label: string) => {
    for (const line of lines) {
      const parts = line.split("｜").map((part) => part.trim());
      for (const part of parts) {
        if (part.startsWith(`${label}：`)) {
          return part.slice(label.length + 1).trim();
        }
      }
    }
    return "";
  };

  const title = getValue("回覆標題") || getValue("項目") || "未命名回覆";
  const amount = getValue("金額") || "未填金額";
  const confirmed = /\[已確認金額\]/.test(reply.message);
  const contentLines = lines.filter((line) => !line.startsWith("[已確認金額]"));

  return {
    title,
    amount,
    confirmed,
    statusLabel: confirmed ? "已確認" : "待確認",
    contentLines,
  };
}

function parseDesignReply(reply: AssignmentReply): ParsedDesignReply {
  const meta = reply.meta;
  const getFromMessage = (label: string) => {
    const lines = reply.message
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      const parts = line.split("｜").map((part) => part.trim());
      for (const part of parts) {
        if (part.startsWith(`${label}：`)) {
          return part.slice(label.length + 1).trim();
        }
      }
    }

    return "";
  };

  return {
    title: meta?.title || getFromMessage("回覆標題") || getFromMessage("項目") || "未命名回覆",
    quantity: meta?.quantity || getFromMessage("數量") || "未填寫",
    amount: meta?.amount || getFromMessage("金額") || "未填寫",
    size: meta?.size || getFromMessage("尺寸") || "未填寫",
    materialStructure: meta?.materialStructure || getFromMessage("材質 + 結構") || getFromMessage("材質") || "未填寫",
    fileUrl: meta?.fileUrl || getFromMessage("檔案位置（URL）") || getFromMessage("預覽圖 URL") || "未填寫",
    vendor: meta?.vendor || getFromMessage("執行廠商") || "未指定廠商",
  };
}

function ExecutionFieldGrid({ fields }: { fields: DisplayField[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => (
        <div key={`${field.label}-${field.value}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">{field.label}</p>
          <p className={`mt-2 break-words text-sm font-medium ${field.tone === "muted" ? "text-slate-500" : "text-slate-900"}`}>
            {field.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function DesignDocumentPreview({
  project,
  group,
}: {
  project: Project;
  group: DesignDocumentGroup;
}) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500">設計文件</p>
          <h6 className="mt-1 text-base font-semibold text-slate-900">{group.vendor}</h6>
        </div>
        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${group.status === "已生成" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : group.status === "需更新" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
          {group.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">專案名稱</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{project.name}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">活動日期</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{project.eventDate}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">地點</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{project.location}</p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {[
                "編號",
                "項目",
                "尺寸",
                "材質 + 結構",
                "檔案位置（URL）",
                "數量",
              ].map((label) => (
                <th key={label} className="border-b border-slate-200 px-4 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.replies.map((reply, index) => (
              <tr key={reply.replyId} className="align-top text-slate-700">
                <td className="border-b border-slate-200 px-4 py-3">{index + 1}</td>
                <td className="border-b border-slate-200 px-4 py-3">{reply.title}</td>
                <td className="border-b border-slate-200 px-4 py-3">{reply.size}</td>
                <td className="border-b border-slate-200 px-4 py-3">{reply.materialStructure}</td>
                <td className="border-b border-slate-200 px-4 py-3 break-all">
                  {reply.fileUrl !== "未填寫" ? (
                    <a href={reply.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline-offset-4 hover:underline">
                      {reply.fileUrl}
                    </a>
                  ) : (
                    reply.fileUrl
                  )}
                </td>
                <td className="border-b border-slate-200 px-4 py-3">{reply.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExecutionTreeSection({ project }: { project: Project }) {
  const [designAssignments, setDesignAssignments] = useState<DesignAssignmentItem[]>([]);
  const [procurementAssignments, setProcurementAssignments] = useState<ProcurementAssignmentItem[]>([]);
  const [vendorAssignments, setVendorAssignments] = useState<VendorAssignmentItem[]>([]);
  const [openCategory, setOpenCategory] = useState<OpenCategory>("design");
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [expandedDetailId, setExpandedDetailId] = useState<string | null>(null);
  const [expandedReplyNodes, setExpandedReplyNodes] = useState<Record<string, boolean>>({});
  const [replyForms, setReplyForms] = useState<Record<string, ReplyForm>>({});
  const [replyOverrides, setReplyOverrides] = useState<Record<string, AssignmentReply[]>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyMessage, setEditingReplyMessage] = useState("");
  const [generatedDesignDocuments, setGeneratedDesignDocuments] = useState<Record<string, boolean>>({});
  const [activeDesignDocumentVendor, setActiveDesignDocumentVendor] = useState<string | null>(null);
  const [activeDesignDocumentContentVendor, setActiveDesignDocumentContentVendor] = useState<string | null>(null);

  function getCurrentReplies(targetId: string, type: OpenCategory) {
    if (replyOverrides[targetId]) {
      return replyOverrides[targetId];
    }

    if (type === "design") {
      return designAssignments.find((assignment) => assignment.targetId === targetId)?.data.replies ?? [];
    }
    if (type === "procurement") {
      return procurementAssignments.find((assignment) => assignment.targetId === targetId)?.data.replies ?? [];
    }
    if (type === "vendor") {
      return vendorAssignments.find((assignment) => assignment.targetId === targetId)?.data.replies ?? [];
    }
    return [];
  }

  function updateReplies(targetId: string, type: OpenCategory, updater: (replies: AssignmentReply[]) => AssignmentReply[]) {
    const nextReplies = updater(getCurrentReplies(targetId, type));
    setReplyOverrides((prev) => ({ ...prev, [targetId]: nextReplies }));

    if (type === "design") {
      setDesignAssignments((prev) => prev.map((assignment) => assignment.targetId !== targetId ? assignment : { ...assignment, data: { ...assignment.data, replies: nextReplies } }));
    }
    if (type === "procurement") {
      setProcurementAssignments((prev) => prev.map((assignment) => assignment.targetId !== targetId ? assignment : { ...assignment, data: { ...assignment.data, replies: nextReplies } }));
    }
    if (type === "vendor") {
      setVendorAssignments((prev) => prev.map((assignment) => assignment.targetId !== targetId ? assignment : { ...assignment, data: { ...assignment.data, replies: nextReplies } }));
    }
  }

  function updateReplyForm(targetId: string, key: keyof ReplyForm, value: string) {
    setReplyForms((prev) => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] ?? defaultReplyForm),
        [key]: value,
      },
    }));
  }

  function buildReplyMessage(form: ReplyForm, type: OpenCategory) {
    if (type === "design") {
      return [
        form.item ? `回覆標題：${form.item}` : null,
        form.quantity ? `數量：${form.quantity}` : null,
        form.cost ? `金額：${form.cost}` : null,
        form.size ? `尺寸：${form.size}` : null,
        form.material ? `材質 + 結構：${form.material}` : null,
        form.previewUrl ? `檔案位置（URL）：${form.previewUrl}` : null,
        form.vendor ? `執行廠商：${form.vendor}` : null,
      ]
        .filter(Boolean)
        .join("｜");
    }

    return [
      form.item ? `項目：${form.item}` : null,
      form.quantity ? `數量：${form.quantity}` : null,
      form.size ? `尺寸：${form.size}` : null,
      form.material ? `材質：${form.material}` : null,
      form.previewUrl ? `預覽圖 URL：${form.previewUrl}` : null,
      form.cost ? `金額：${form.cost}` : null,
    ]
      .filter(Boolean)
      .join("｜");
  }

  function submitReply(targetId: string, type: OpenCategory) {
    const form = replyForms[targetId] ?? defaultReplyForm;
    const message = buildReplyMessage(form, type);
    if (!message) return;
    const reply: AssignmentReply = {
      id: crypto.randomUUID(),
      message,
      createdAt: new Date().toLocaleString("zh-TW"),
      ...(type === "design"
        ? {
            meta: {
              title: form.item,
              quantity: form.quantity,
              amount: form.cost,
              size: form.size,
              materialStructure: form.material,
              fileUrl: form.previewUrl,
              vendor: form.vendor,
            },
          }
        : {}),
    };
    updateReplies(targetId, type, (replies) => [...replies, reply]);
    setReplyForms((prev) => ({ ...prev, [targetId]: defaultReplyForm }));
    setActiveReplyBoxId(null);
    setExpandedReplyNodes((prev) => ({ ...prev, [reply.id]: false }));
  }

  function startEditReply(reply: AssignmentReply) {
    setEditingReplyId(reply.id);
    setEditingReplyMessage(reply.message.replace(/\n?\[已確認金額\]/g, ""));
  }

  function saveEditedReply(targetId: string, type: OpenCategory, replyId: string) {
    const nextMessage = editingReplyMessage.trim();
    if (!nextMessage) return;
    updateReplies(targetId, type, (replies) => replies.map((reply) => {
      if (reply.id !== replyId) return reply;
      const confirmed = /\[已確認金額\]/.test(reply.message);
      return {
        ...reply,
        message: `${nextMessage}${confirmed ? "\n[已確認金額]" : ""}`,
        createdAt: `${reply.createdAt}（已修改）`,
      };
    }));
    setEditingReplyId(null);
    setEditingReplyMessage("");
  }

  function removeReply(targetId: string, type: OpenCategory, replyId: string) {
    if (!window.confirm("確定要刪除這則回覆嗎？")) return;
    updateReplies(targetId, type, (replies) => replies.filter((reply) => reply.id !== replyId));
    if (editingReplyId === replyId) {
      setEditingReplyId(null);
      setEditingReplyMessage("");
    }
  }

  function toggleReplyConfirmed(targetId: string, type: OpenCategory, replyId: string) {
    updateReplies(targetId, type, (replies) => replies.map((reply) => {
      if (reply.id !== replyId) return reply;
      const confirmed = /\[已確認金額\]/.test(reply.message);
      return {
        ...reply,
        message: confirmed ? reply.message.replace(/\n?\[已確認金額\]/g, "") : `${reply.message}\n[已確認金額]`,
      };
    }));
  }

  const designList = useMemo<DisplayItem[]>(() => [
    ...designAssignments.map((assignment) => ({
      id: assignment.targetId,
      title: assignment.title,
      sourceLabel: assignment.title,
      badge: assignment.data.status,
      badgeClass: getStatusClass(assignment.data.status),
      categoryLabel: "設計",
      owner: assignment.data.assignee || undefined,
      cardSummary: [
        assignment.data.size ? `尺寸：${assignment.data.size}` : null,
        assignment.data.material ? `材質 + 結構：${assignment.data.material}` : null,
      ].filter((value): value is string => Boolean(value)),
      fields: [
        { label: "所屬專案", value: project.name },
        { label: "項目", value: assignment.title },
        { label: "尺寸", value: assignment.data.size || "未填寫", tone: assignment.data.size ? "default" : "muted" },
        { label: "材質 + 結構", value: assignment.data.material || "未填寫", tone: assignment.data.material ? "default" : "muted" },
        { label: "數量", value: assignment.data.quantity || "未填寫", tone: assignment.data.quantity ? "default" : "muted" },
        { label: "需求說明", value: assignment.data.note || "未填寫", tone: assignment.data.note ? "default" : "muted" },
        { label: "參考連結", value: assignment.data.referenceUrl || "未填寫", tone: assignment.data.referenceUrl ? "default" : "muted" },
        { label: "負責人", value: assignment.data.assignee || "未指定", tone: assignment.data.assignee ? "default" : "muted" },
        { label: "狀態", value: assignment.data.status || "未填寫", tone: assignment.data.status ? "default" : "muted" },
      ],
      collapsedFields: [],
      replies: replyOverrides[assignment.targetId] ?? assignment.data.replies ?? [],
    })),
    ...project.designTasks.map((task) => ({
      id: task.title,
      title: task.title,
      sourceLabel: task.title,
      badge: task.status,
      badgeClass: getStatusClass(task.status),
      categoryLabel: "設計",
      owner: task.assignee,
      cardSummary: [
        `任務標題：${task.title}`,
      ],
      fields: [
        { label: "所屬專案", value: project.name },
        { label: "項目", value: task.title },
        { label: "尺寸", value: "未填寫", tone: "muted" },
        { label: "材質 + 結構", value: "未填寫", tone: "muted" },
        { label: "數量", value: "未填寫", tone: "muted" },
        { label: "需求說明", value: "舊假資料未帶完整母卡欄位", tone: "muted" },
        { label: "參考連結", value: "未填寫", tone: "muted" },
        { label: "負責人", value: task.assignee || "未指定", tone: task.assignee ? "default" : "muted" },
        { label: "狀態", value: task.status || "未填寫", tone: task.status ? "default" : "muted" },
      ],
      collapsedFields: [],
      replies: replyOverrides[task.title] ?? [],
    })),
  ], [designAssignments, project, replyOverrides]);

  const procurementList = useMemo<DisplayItem[]>(() => [
    ...procurementAssignments.map((assignment) => ({
      id: assignment.targetId,
      title: assignment.data.item || assignment.title,
      sourceLabel: assignment.title,
      badge: assignment.data.status,
      badgeClass: getStatusClass(assignment.data.status),
      categoryLabel: "備品",
      owner: assignment.data.assignee || undefined,
      cardSummary: [
        assignment.data.quantity ? `數量：${assignment.data.quantity}` : null,
        assignment.data.unit ? `單位：${assignment.data.unit}` : null,
        assignment.data.budget ? `採買預算：${assignment.data.budget}` : null,
      ].filter((value): value is string => Boolean(value)),
      fields: [
        { label: "所屬專案", value: project.name },
        { label: "來源項目 / 次項目", value: assignment.title },
        { label: "負責人", value: assignment.data.assignee || "未指定", tone: assignment.data.assignee ? "default" : "muted" },
        { label: "備品名稱", value: assignment.data.item || "未填寫", tone: assignment.data.item ? "default" : "muted" },
        { label: "數量", value: assignment.data.quantity || "未填寫", tone: assignment.data.quantity ? "default" : "muted" },
        { label: "單位", value: assignment.data.unit || "未填寫", tone: assignment.data.unit ? "default" : "muted" },
        { label: "規格 / 尺寸", value: assignment.data.specification || "未填寫", tone: assignment.data.specification ? "default" : "muted" },
        { label: "樣式 / 參考連結", value: assignment.data.styleUrl || "未填寫", tone: assignment.data.styleUrl ? "default" : "muted" },
        { label: "採買預算", value: assignment.data.budget || "未填寫", tone: assignment.data.budget ? "default" : "muted" },
        { label: "採買需求說明", value: assignment.data.note || "未填寫", tone: assignment.data.note ? "default" : "muted" },
      ],
      replies: replyOverrides[assignment.targetId] ?? assignment.data.replies ?? [],
    })),
    ...project.procurementTasks.map((task) => ({
      id: task.title,
      title: task.title,
      sourceLabel: task.title,
      badge: task.status,
      badgeClass: getStatusClass(task.status),
      categoryLabel: "備品",
      owner: task.buyer,
      cardSummary: [task.buyer ? `負責人：${task.buyer}` : null, task.budget ? `採買預算：${task.budget}` : null].filter((value): value is string => Boolean(value)),
      fields: [
        { label: "所屬專案", value: project.name },
        { label: "來源項目 / 次項目", value: task.title },
        { label: "負責人", value: task.buyer || "未指定", tone: task.buyer ? "default" : "muted" },
        { label: "備品名稱", value: task.title },
        { label: "採買預算", value: task.budget || "未填寫", tone: task.budget ? "default" : "muted" },
        { label: "目前資料狀態", value: "舊假資料僅保留基本欄位", tone: "muted" },
      ],
      replies: replyOverrides[task.title] ?? [],
    })),
  ], [procurementAssignments, project, replyOverrides]);

  const vendorList = useMemo<DisplayItem[]>(() => vendorAssignments.map((assignment) => ({
    id: assignment.targetId,
    title: assignment.data.title || assignment.title,
    sourceLabel: assignment.title,
    badge: assignment.data.status,
    badgeClass: getStatusClass(assignment.data.status),
    categoryLabel: "廠商",
    owner: assignment.data.assignee || undefined,
    cardSummary: [
      assignment.data.vendorName ? `廠商：${assignment.data.vendorName}` : null,
      assignment.data.category ? `工種：${assignment.data.category}` : null,
      assignment.data.amount ? `廠商報價：${assignment.data.amount}` : null,
    ].filter((value): value is string => Boolean(value)),
    fields: [
      { label: "所屬專案", value: project.name },
      { label: "來源項目 / 次項目", value: assignment.title },
      { label: "負責人", value: assignment.data.assignee || "未指定", tone: assignment.data.assignee ? "default" : "muted" },
      { label: "廠商名稱", value: assignment.data.vendorName || "未填寫", tone: assignment.data.vendorName ? "default" : "muted" },
      { label: "類別 / 工種", value: assignment.data.category || "未填寫", tone: assignment.data.category ? "default" : "muted" },
      { label: "需求說明", value: assignment.data.requirement || "未填寫", tone: assignment.data.requirement ? "default" : "muted" },
      { label: "規格 / 尺寸", value: assignment.data.specification || "未填寫", tone: assignment.data.specification ? "default" : "muted" },
      { label: "參考連結 / 參考資料", value: assignment.data.referenceUrl || "未填寫", tone: assignment.data.referenceUrl ? "default" : "muted" },
      { label: "備註", value: assignment.data.note || "未填寫", tone: assignment.data.note ? "default" : "muted" },
      { label: "廠商報價", value: assignment.data.amount || "未填寫", tone: assignment.data.amount ? "default" : "muted" },
    ],
    replies: replyOverrides[assignment.targetId] ?? assignment.data.replies ?? [],
  })), [vendorAssignments, project.name, replyOverrides]);

  const designDocumentGroups = useMemo<DesignDocumentGroup[]>(() => {
    const groups = new Map<string, DesignDocumentGroup>();

    designList.forEach((item) => {
      item.replies.forEach((reply, replyIndex) => {
        const parsed = parseDesignReply(reply);
        const vendorName = parsed.vendor || "未指定廠商";
        const existing = groups.get(vendorName);
        const nextReply = {
          ...parsed,
          sourceTitle: item.title,
          replyId: reply.id,
          sequence: replyIndex + 1,
        };

        if (!existing) {
          groups.set(vendorName, {
            vendor: vendorName,
            status: generatedDesignDocuments[vendorName] ? "已生成" : "未生成",
            replies: [nextReply],
          });
          return;
        }

        groups.set(vendorName, {
          ...existing,
          status: generatedDesignDocuments[vendorName] ? "需更新" : "未生成",
          replies: [...existing.replies, nextReply],
        });
      });
    });

    return Array.from(groups.values());
  }, [designList, generatedDesignDocuments]);

  const currentList = openCategory === "design" ? designList : openCategory === "procurement" ? procurementList : [];

  const categoryMeta = {
    design: { title: "專案設計", description: "交辦設計 → 回覆 → 設計文件整理與文件預覽。", count: designList.length, accent: "text-blue-700", ring: "ring-blue-200" },
    procurement: { title: "專案備品", description: "備品主層欄位收斂為需求、預算與規格資訊。", count: procurementList.length, accent: "text-amber-700", ring: "ring-amber-200" },
    vendor: { title: "專案廠商", description: "廠商主卡只保留識別與入口，不再當完整工作台。", count: vendorList.length, accent: "text-violet-700", ring: "ring-violet-200" },
  };

  return (
    <>
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">專案執行項目</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">維持樹狀項目操作，交辦主卡改為摘要呈現，避免同頁資訊過重。</p>
          </div>
        </div>
        <ExecutionTree items={project.executionItems} onDesignAssignmentsChange={setDesignAssignments} onProcurementAssignmentsChange={setProcurementAssignments} onVendorAssignmentsChange={setVendorAssignments} />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">專案分類檢視</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">主卡先看摘要，詳細內容與回覆資訊都改成按需展開。</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {(["design", "procurement", "vendor"] as OpenCategory[]).map((category) => {
            const meta = categoryMeta[category];
            const isActive = openCategory === category;
            return (
              <button key={category} type="button" onClick={() => setOpenCategory(category)} className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition ${isActive ? `${meta.ring} ring-2` : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-lg font-semibold ${meta.accent}`}>{meta.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
                  </div>
                  <span className="inline-flex min-w-[36px] items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{meta.count}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-300 bg-slate-100 p-5 shadow-inner">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-900">{categoryMeta[openCategory].title}</h4>
            <p className="mt-1 text-sm text-slate-500">
              {openCategory === "vendor" ? "點選專案廠商後，這裡應承接廠商需求與廠商發包清單主線。" : `共 ${currentList.length} 筆，已依分類集中顯示於下方。`}
            </p>
          </div>

          <div className="space-y-3">
            {openCategory === "vendor" ? (
              <ProjectVendorSection
                projectId={project.id}
                projectInfo={{
                  name: project.name,
                  eventDate: project.eventDate,
                  location: project.location,
                  loadInTime: project.loadInTime,
                }}
                visible
                vendorTaskItems={vendorAssignments}
              />
            ) : currentList.length ? currentList.map((item, itemIndex) => {
              const replyForm = replyForms[item.id] ?? defaultReplyForm;
              const isReplyOpen = activeReplyBoxId === item.id;
              const isDetailOpen = expandedDetailId === item.id;
              const latestReply = item.replies[item.replies.length - 1];
              const latestSummary = latestReply ? parseReplyMessage(latestReply) : null;
              return (
                <div key={item.id} className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                            #{itemIndex + 1}
                          </span>
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {item.categoryLabel}
                          </span>
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${item.badgeClass}`}>
                            {item.badge}
                          </span>
                        </div>
                        <h5 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h5>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                          <span>所屬專案：{project.name}</span>
                          <span>來源：{item.sourceLabel}</span>
                          {item.owner ? <span>負責人：{item.owner}</span> : null}
                          <span>回覆 {item.replies.length} 則</span>
                        </div>
                        {item.cardSummary.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.cardSummary.map((line) => (
                              <span key={`${item.id}-${line}`} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {line}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                              <span>回覆數量：{item.replies.length}</span>
                              <span>
                                最近狀態摘要：{latestSummary ? `${latestSummary.statusLabel}｜${latestSummary.amount}` : "尚無回覆"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => setExpandedReplyNodes((prev) => ({ ...prev, [item.id]: !(prev[item.id] ?? false) }))} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                {(expandedReplyNodes[item.id] ?? false) ? "收合回覆" : "查看回覆"}
                              </button>
                              <button type="button" onClick={() => setActiveReplyBoxId((prev) => (prev === item.id ? null : item.id))} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                                {isReplyOpen ? "取消回覆" : "新增回覆"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setExpandedDetailId((prev) => (prev === item.id ? null : item.id))} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                          {isDetailOpen ? "收合主卡資訊" : "查看主卡資訊"}
                        </button>
                      </div>
                    </div>

                    {isDetailOpen ? (
                      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <ExecutionFieldGrid fields={item.fields} />
                        {item.collapsedFields?.length ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                            <p className="text-xs font-semibold tracking-wide text-slate-500">折疊資訊</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {item.collapsedFields.map((field) => (
                                <div key={`${item.id}-${field.label}-collapsed`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                  <p className="text-xs font-medium text-slate-500">{field.label}</p>
                                  <p className="mt-2 break-words text-sm font-medium text-slate-900">{field.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {(expandedReplyNodes[item.id] ?? false) ? (
                      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">回覆列表</p>
                            <p className="mt-1 text-xs text-slate-500">按需展開查看回覆摘要與詳細內容。</p>
                          </div>
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            {item.replies.length} 則
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          {item.replies.length ? item.replies.map((reply, replyIndex) => {
                            const isExpanded = expandedReplyNodes[reply.id] ?? false;
                            const isEditing = editingReplyId === reply.id;
                            const summary = parseReplyMessage(reply);
                            const parsedDesign = openCategory === "design" ? parseDesignReply(reply) : null;
                            return (
                              <div key={reply.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                  <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(140px,0.6fr)_auto]">
                                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                      <p className="text-[11px] font-semibold tracking-wide text-slate-500">標題</p>
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                                          R{replyIndex + 1}
                                        </span>
                                        <p className="truncate text-sm font-semibold text-slate-900">{summary.title}</p>
                                      </div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                      <p className="text-[11px] font-semibold tracking-wide text-slate-500">金額</p>
                                      <p className="mt-2 text-sm font-semibold text-slate-900">{summary.amount}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                      <p className="text-[11px] font-semibold tracking-wide text-slate-500">狀態</p>
                                      <div className="mt-2">
                                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${summary.confirmed ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"}`}>
                                          {summary.statusLabel}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 xl:justify-end">
                                    <button type="button" onClick={() => setExpandedReplyNodes((prev) => ({ ...prev, [reply.id]: !isExpanded }))} className="inline-flex min-w-[104px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                                      {isExpanded ? "收合資訊" : "回覆資訊"}
                                    </button>
                                    <button type="button" onClick={() => toggleReplyConfirmed(item.id, openCategory, reply.id)} className={`inline-flex min-w-[120px] items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition ${summary.confirmed ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                                      {summary.confirmed ? "取消確認金額" : "確認金額"}
                                    </button>
                                  </div>
                                </div>

                                {isExpanded ? (
                                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    {isEditing ? (
                                      <>
                                        <textarea value={editingReplyMessage} onChange={(event) => setEditingReplyMessage(event.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          <button type="button" onClick={() => saveEditedReply(item.id, openCategory, reply.id)} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">儲存修改</button>
                                          <button type="button" onClick={() => { setEditingReplyId(null); setEditingReplyMessage(""); }} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">取消</button>
                                        </div>
                                      </>
                                    ) : openCategory === "design" && parsedDesign ? (
                                      <>
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">回覆標題</p><p className="mt-2 text-sm font-medium text-slate-900">{parsedDesign.title}</p></div>
                                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">數量</p><p className="mt-2 text-sm font-medium text-slate-900">{parsedDesign.quantity}</p></div>
                                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">金額</p><p className="mt-2 text-sm font-medium text-slate-900">{parsedDesign.amount}</p></div>
                                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">尺寸</p><p className="mt-2 text-sm font-medium text-slate-900">{parsedDesign.size}</p></div>
                                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">材質 + 結構</p><p className="mt-2 text-sm font-medium text-slate-900">{parsedDesign.materialStructure}</p></div>
                                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">執行廠商</p><p className="mt-2 text-sm font-medium text-slate-900">{parsedDesign.vendor}</p></div>
                                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-2 xl:col-span-3"><p className="text-xs text-slate-500">檔案位置（URL）</p><p className="mt-2 break-all text-sm font-medium text-slate-900">{parsedDesign.fileUrl !== "未填寫" ? <a href={parsedDesign.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline-offset-4 hover:underline">{parsedDesign.fileUrl}</a> : parsedDesign.fileUrl}</p></div>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          <button type="button" onClick={() => startEditReply(reply)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">修改</button>
                                          <button type="button" onClick={() => removeReply(item.id, openCategory, reply.id)} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">刪除</button>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="space-y-2 text-sm text-slate-600">
                                          {summary.contentLines.map((line, index) => (
                                            <p key={`${reply.id}-${index}`} className={index === 0 ? "font-semibold text-slate-700" : "pl-4"}>
                                              {line}
                                            </p>
                                          ))}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          <button type="button" onClick={() => startEditReply(reply)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">修改</button>
                                          <button type="button" onClick={() => removeReply(item.id, openCategory, reply.id)} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">刪除</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            );
                          }) : <p className="text-sm text-slate-400">目前尚無回覆。</p>}
                        </div>
                      </div>
                    ) : null}

                    {isReplyOpen ? (
                      <div className="rounded-2xl border border-slate-300 bg-slate-200/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">新增回覆</p>
                            <p className="mt-1 text-xs text-slate-500">每次送出會 append 成新的單層回覆，不會再往下掛子回覆。</p>
                          </div>
                          <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            下一筆：R{item.replies.length + 1}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <input value={replyForm.item} onChange={(e) => updateReplyForm(item.id, "item", e.target.value)} placeholder={openCategory === "design" ? "回覆標題" : "項目"} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                          <input value={replyForm.quantity} onChange={(e) => updateReplyForm(item.id, "quantity", e.target.value)} placeholder="數量" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                          <input value={replyForm.cost} onChange={(e) => updateReplyForm(item.id, "cost", e.target.value)} placeholder="金額" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                          <input value={replyForm.size} onChange={(e) => updateReplyForm(item.id, "size", e.target.value)} placeholder="尺寸" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                          <input value={replyForm.material} onChange={(e) => updateReplyForm(item.id, "material", e.target.value)} placeholder={openCategory === "design" ? "材質 + 結構" : "材質"} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                          <input value={replyForm.previewUrl} onChange={(e) => updateReplyForm(item.id, "previewUrl", e.target.value)} placeholder={openCategory === "design" ? "檔案位置（URL）" : "預覽圖 URL"} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
                          {openCategory === "design" ? <input value={replyForm.vendor} onChange={(e) => updateReplyForm(item.id, "vendor", e.target.value)} placeholder="執行廠商" className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 md:col-span-2 xl:col-span-3" /> : null}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => submitReply(item.id, openCategory)} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">送出回覆</button><button type="button" onClick={() => setActiveReplyBoxId(null)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">取消</button></div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">目前此分類尚未建立資料。</div>}
          </div>

          {openCategory === "design" ? (
            <div className="mt-6 space-y-4 rounded-3xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
              <div>
                <h5 className="text-lg font-semibold text-slate-900">設計文件整理</h5>
                <p className="mt-1 text-sm text-slate-500">依執行廠商分組吃所有設計回覆；一個執行廠商 = 一組整理單位 = 一份設計文件。</p>
              </div>

              {designDocumentGroups.length ? (
                <div className="space-y-3">
                  {designDocumentGroups.map((group) => {
                    const isContentOpen = activeDesignDocumentContentVendor === group.vendor;
                    const isDocumentOpen = activeDesignDocumentVendor === group.vendor;
                    return (
                      <div key={group.vendor} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-slate-900">{group.vendor}</p>
                              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${group.status === "已生成" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : group.status === "需更新" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                                {group.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">項目數量：{group.replies.length}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setActiveDesignDocumentContentVendor((prev) => prev === group.vendor ? null : group.vendor)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                              {isContentOpen ? "收合整理內容" : "查看整理內容"}
                            </button>
                            <button type="button" onClick={() => setActiveDesignDocumentVendor((prev) => prev === group.vendor ? null : group.vendor)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                              {isDocumentOpen ? "收合文件" : "查看文件"}
                            </button>
                            <button type="button" onClick={() => setGeneratedDesignDocuments((prev) => ({ ...prev, [group.vendor]: true }))} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                              {group.status === "未生成" ? "生成文件" : "重新生成文件"}
                            </button>
                          </div>
                        </div>

                        {isContentOpen ? (
                          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full border-collapse text-left text-sm">
                              <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                  {[
                                    "來源任務",
                                    "回覆序號",
                                    "回覆標題",
                                    "數量",
                                    "金額",
                                    "尺寸",
                                    "材質 + 結構",
                                    "檔案位置（URL）",
                                  ].map((label) => (
                                    <th key={label} className="border-b border-slate-200 px-4 py-3 font-medium">{label}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {group.replies.map((reply) => (
                                  <tr key={reply.replyId} className="align-top text-slate-700">
                                    <td className="border-b border-slate-200 px-4 py-3">{reply.sourceTitle}</td>
                                    <td className="border-b border-slate-200 px-4 py-3">R{reply.sequence}</td>
                                    <td className="border-b border-slate-200 px-4 py-3">{reply.title}</td>
                                    <td className="border-b border-slate-200 px-4 py-3">{reply.quantity}</td>
                                    <td className="border-b border-slate-200 px-4 py-3">{reply.amount}</td>
                                    <td className="border-b border-slate-200 px-4 py-3">{reply.size}</td>
                                    <td className="border-b border-slate-200 px-4 py-3">{reply.materialStructure}</td>
                                    <td className="border-b border-slate-200 px-4 py-3 break-all">{reply.fileUrl}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {isDocumentOpen ? <div className="mt-4"><DesignDocumentPreview project={project} group={group} /></div> : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">目前尚無可整理的設計回覆；先在上方設計任務新增回覆，並填入執行廠商。</div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
