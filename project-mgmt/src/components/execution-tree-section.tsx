"use client";

import { useMemo, useState } from "react";
import {
  ProjectTaskSummaryList,
  type ProjectTaskSummaryItem,
} from "@/components/project-task-summary-list";
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

type DesignAssignmentItem = {
  targetId: string;
  title: string;
  data: DesignAssignmentDraft;
};
type ProcurementAssignmentItem = {
  targetId: string;
  title: string;
  data: ProcurementAssignmentDraft;
};
export type VendorAssignmentItem = {
  targetId: string;
  title: string;
  data: VendorAssignmentDraft;
};

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
  replies: Array<
    ParsedDesignReply & {
      sourceTitle: string;
      replyId: string;
      sequence: number;
    }
  >;
};

type ParsedProcurementReply = {
  title: string;
  quantity: string;
  amount: string;
  size: string;
  material: string;
  previewUrl: string;
  vendor: string;
};

type ProcurementDocumentGroup = {
  id: string;
  status: "未生成" | "已生成" | "需更新";
  replies: Array<
    ParsedProcurementReply & {
      sourceTitle: string;
      replyId: string;
      sequence: number;
    }
  >;
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
    title:
      meta?.title ||
      getFromMessage("回覆標題") ||
      getFromMessage("項目") ||
      "未命名回覆",
    quantity: meta?.quantity || getFromMessage("數量") || "未填寫",
    amount: meta?.amount || getFromMessage("金額") || "未填寫",
    size: meta?.size || getFromMessage("尺寸") || "未填寫",
    materialStructure:
      meta?.materialStructure ||
      getFromMessage("材質 + 結構") ||
      getFromMessage("材質") ||
      "未填寫",
    fileUrl:
      meta?.fileUrl ||
      getFromMessage("檔案位置（URL）") ||
      getFromMessage("預覽圖 URL") ||
      "未填寫",
    vendor: meta?.vendor || getFromMessage("執行廠商") || "未指定廠商",
  };
}

function parseProcurementReply(reply: AssignmentReply): ParsedProcurementReply {
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
    title:
      meta?.title || getFromMessage("回覆標題") || getFromMessage("項目") || "未命名回覆",
    quantity: meta?.quantity || getFromMessage("數量") || "未填寫",
    amount: meta?.amount || getFromMessage("金額") || "未填寫",
    size: meta?.size || getFromMessage("尺寸") || "未填寫",
    material:
      meta?.materialStructure || getFromMessage("材質") || "未填寫",
    previewUrl:
      meta?.fileUrl || getFromMessage("預覽圖 URL") || "未填寫",
    vendor: meta?.vendor || getFromMessage("廠商") || "未指定廠商",
  };
}

function ExecutionFieldGrid({ fields }: { fields: DisplayField[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => (
        <div
          key={`${field.label}-${field.value}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <p className="text-xs font-medium text-slate-500">{field.label}</p>
          <p
            className={`mt-2 break-words text-sm font-medium ${field.tone === "muted" ? "text-slate-500" : "text-slate-900"}`}
          >
            {field.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function getDocumentStatusClass(status: "未生成" | "已生成" | "需更新") {
  if (status === "已生成") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "需更新") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
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
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            設計文件
          </p>
          <h6 className="mt-1 text-base font-semibold text-slate-900">
            {group.vendor}
          </h6>
        </div>
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${group.status === "已生成" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : group.status === "需更新" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}
        >
          {group.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">專案名稱</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {project.name}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">活動日期</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {project.eventDate}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">地點</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {project.location}
          </p>
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
                <th
                  key={label}
                  className="border-b border-slate-200 px-4 py-3 font-medium"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.replies.map((reply, index) => (
              <tr key={reply.replyId} className="align-top text-slate-700">
                <td className="border-b border-slate-200 px-4 py-3">
                  {index + 1}
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  {reply.title}
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  {reply.size}
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  {reply.materialStructure}
                </td>
                <td className="border-b border-slate-200 px-4 py-3 break-all">
                  {reply.fileUrl !== "未填寫" ? (
                    <a
                      href={reply.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline-offset-4 hover:underline"
                    >
                      {reply.fileUrl}
                    </a>
                  ) : (
                    reply.fileUrl
                  )}
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  {reply.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProcurementDocumentPreview({
  project,
  group,
}: {
  project: Project;
  group: ProcurementDocumentGroup;
}) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            備品文件
          </p>
          <h6 className="mt-1 text-base font-semibold text-slate-900">
            {project.name}
          </h6>
        </div>
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${group.status === "已生成" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : group.status === "需更新" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}
        >
          {group.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">專案名稱</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {project.name}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">活動日期</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {project.eventDate}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">地點</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {project.location}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {["編號", "項目", "數量"].map((label) => (
                <th
                  key={label}
                  className="border-b border-slate-200 px-4 py-3 font-medium"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.replies.map((reply, index) => (
              <tr key={reply.replyId} className="align-top text-slate-700">
                <td className="border-b border-slate-200 px-4 py-3">
                  {index + 1}
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  {reply.title}
                </td>
                <td className="border-b border-slate-200 px-4 py-3">
                  {reply.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExecutionTreeSection({ project }: { project: Project }) {
  const [designAssignments, setDesignAssignments] = useState<
    DesignAssignmentItem[]
  >([]);
  const [procurementAssignments, setProcurementAssignments] = useState<
    ProcurementAssignmentItem[]
  >([]);
  const [vendorAssignments, setVendorAssignments] = useState<
    VendorAssignmentItem[]
  >([]);
  const [openCategory, setOpenCategory] = useState<OpenCategory>("design");
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [expandedDetailId, setExpandedDetailId] = useState<string | null>(null);
  const [expandedReplyListId, setExpandedReplyListId] = useState<string | null>(
    null,
  );
  const [expandedReplyDetailId, setExpandedReplyDetailId] = useState<
    string | null
  >(null);
  const [replyForms, setReplyForms] = useState<Record<string, ReplyForm>>({});
  const [replyOverrides, setReplyOverrides] = useState<
    Record<string, AssignmentReply[]>
  >({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyMessage, setEditingReplyMessage] = useState("");
  const [generatedDesignDocuments, setGeneratedDesignDocuments] = useState<
    Record<string, number>
  >({});
  const [generatedProcurementDocuments, setGeneratedProcurementDocuments] =
    useState<Record<string, number>>({});
  const [activeDesignDocumentVendor, setActiveDesignDocumentVendor] = useState<
    string | null
  >(null);
  const [
    activeDesignDocumentContentVendor,
    setActiveDesignDocumentContentVendor,
  ] = useState<string | null>(null);
  const [activeProcurementDocument, setActiveProcurementDocument] = useState<
    string | null
  >(null);
  const [activeProcurementContent, setActiveProcurementContent] = useState<
    string | null
  >(null);

  function resetCategoryExpansions() {
    setActiveReplyBoxId(null);
    setExpandedDetailId(null);
    setExpandedReplyListId(null);
    setExpandedReplyDetailId(null);
    setEditingReplyId(null);
    setEditingReplyMessage("");
    setActiveDesignDocumentVendor(null);
    setActiveDesignDocumentContentVendor(null);
    setActiveProcurementDocument(null);
    setActiveProcurementContent(null);
  }

  function handleOpenCategory(category: OpenCategory) {
    setOpenCategory(category);
    resetCategoryExpansions();
  }

  function focusItem(itemId: string, target: "replies" | "replyBox" | "detail") {
    setEditingReplyId(null);
    setEditingReplyMessage("");
    setExpandedReplyDetailId(null);
    setExpandedReplyListId(target === "replies" ? itemId : null);
    setActiveReplyBoxId(target === "replyBox" ? itemId : null);
    setExpandedDetailId(target === "detail" ? itemId : null);
  }

  function toggleReplyList(itemId: string) {
    const nextId = expandedReplyListId === itemId ? null : itemId;
    if (!nextId) {
      setExpandedReplyListId(null);
      setExpandedReplyDetailId(null);
      setEditingReplyId(null);
      setEditingReplyMessage("");
      return;
    }
    focusItem(itemId, "replies");
  }

  function toggleReplyBox(itemId: string) {
    if (activeReplyBoxId === itemId) {
      setActiveReplyBoxId(null);
      return;
    }
    focusItem(itemId, "replyBox");
  }

  function toggleDetail(itemId: string) {
    if (expandedDetailId === itemId) {
      setExpandedDetailId(null);
      return;
    }
    focusItem(itemId, "detail");
  }

  function toggleReplyDetail(replyId: string) {
    setEditingReplyId(null);
    setEditingReplyMessage("");
    setExpandedReplyDetailId((prev) => (prev === replyId ? null : replyId));
  }

  function toggleDesignOrganizeContent(vendor: string) {
    setActiveDesignDocumentVendor(null);
    setActiveDesignDocumentContentVendor((prev) =>
      prev === vendor ? null : vendor,
    );
  }

  function toggleDesignOrganizeDocument(vendor: string) {
    setActiveDesignDocumentContentVendor(null);
    setActiveDesignDocumentVendor((prev) => (prev === vendor ? null : vendor));
  }

  function toggleProcurementOrganizeContent(projectId: string) {
    setActiveProcurementDocument(null);
    setActiveProcurementContent((prev) => (prev === projectId ? null : projectId));
  }

  function toggleProcurementOrganizeDocument(projectId: string) {
    setActiveProcurementContent(null);
    setActiveProcurementDocument((prev) =>
      prev === projectId ? null : projectId,
    );
  }

  function getCurrentReplies(targetId: string, type: OpenCategory) {
    if (replyOverrides[targetId]) {
      return replyOverrides[targetId];
    }

    if (type === "design") {
      return (
        designAssignments.find((assignment) => assignment.targetId === targetId)
          ?.data.replies ?? []
      );
    }
    if (type === "procurement") {
      return (
        procurementAssignments.find(
          (assignment) => assignment.targetId === targetId,
        )?.data.replies ?? []
      );
    }
    if (type === "vendor") {
      return (
        vendorAssignments.find((assignment) => assignment.targetId === targetId)
          ?.data.replies ?? []
      );
    }
    return [];
  }

  function updateReplies(
    targetId: string,
    type: OpenCategory,
    updater: (replies: AssignmentReply[]) => AssignmentReply[],
  ) {
    const nextReplies = updater(getCurrentReplies(targetId, type));
    setReplyOverrides((prev) => ({ ...prev, [targetId]: nextReplies }));

    if (type === "design") {
      setDesignAssignments((prev) =>
        prev.map((assignment) =>
          assignment.targetId !== targetId
            ? assignment
            : {
                ...assignment,
                data: { ...assignment.data, replies: nextReplies },
              },
        ),
      );
    }
    if (type === "procurement") {
      setProcurementAssignments((prev) =>
        prev.map((assignment) =>
          assignment.targetId !== targetId
            ? assignment
            : {
                ...assignment,
                data: { ...assignment.data, replies: nextReplies },
              },
        ),
      );
    }
    if (type === "vendor") {
      setVendorAssignments((prev) =>
        prev.map((assignment) =>
          assignment.targetId !== targetId
            ? assignment
            : {
                ...assignment,
                data: { ...assignment.data, replies: nextReplies },
              },
        ),
      );
    }
  }

  function updateReplyForm(
    targetId: string,
    key: keyof ReplyForm,
    value: string,
  ) {
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
      form.item ? `回覆標題：${form.item}` : null,
      form.item ? `項目：${form.item}` : null,
      form.quantity ? `數量：${form.quantity}` : null,
      form.size ? `尺寸：${form.size}` : null,
      form.material ? `材質：${form.material}` : null,
      form.previewUrl ? `預覽圖 URL：${form.previewUrl}` : null,
      form.cost ? `金額：${form.cost}` : null,
      form.vendor ? `廠商：${form.vendor}` : null,
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
        : type === "procurement"
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
    setExpandedReplyListId(targetId);
    setExpandedReplyDetailId(null);
  }

  function startEditReply(reply: AssignmentReply) {
    setExpandedReplyDetailId(reply.id);
    setEditingReplyId(reply.id);
    setEditingReplyMessage(reply.message.replace(/\n?\[已確認金額\]/g, ""));
  }

  function saveEditedReply(
    targetId: string,
    type: OpenCategory,
    replyId: string,
  ) {
    const nextMessage = editingReplyMessage.trim();
    if (!nextMessage) return;
    updateReplies(targetId, type, (replies) =>
      replies.map((reply) => {
        if (reply.id !== replyId) return reply;
        const confirmed = /\[已確認金額\]/.test(reply.message);
        return {
          ...reply,
          message: nextMessage,
          createdAt: `${reply.createdAt}（已修改，待重新確認）`,
        };
      }),
    );
    setEditingReplyId(null);
    setEditingReplyMessage("");
  }

  function removeReply(targetId: string, type: OpenCategory, replyId: string) {
    if (!window.confirm("確定要刪除這則回覆嗎？")) return;
    updateReplies(targetId, type, (replies) =>
      replies.filter((reply) => reply.id !== replyId),
    );
    if (editingReplyId === replyId) {
      setEditingReplyId(null);
      setEditingReplyMessage("");
    }
  }

  function toggleReplyConfirmed(
    targetId: string,
    type: OpenCategory,
    replyId: string,
  ) {
    updateReplies(targetId, type, (replies) =>
      replies.map((reply) => {
        if (reply.id !== replyId) return reply;
        const confirmed = /\[已確認金額\]/.test(reply.message);
        if (!confirmed) {
          const parsedReply =
            type === "design"
              ? parseDesignReply(reply)
              : type === "procurement"
                ? parseProcurementReply(reply)
                : null;

          if (
            (type === "design" || type === "procurement") &&
            (!parsedReply?.vendor || parsedReply.vendor === "未指定廠商")
          ) {
            window.alert("要先指定廠商並儲存回覆，才能正式確認進入文件與成本主線。");
            return reply;
          }
        }
        return {
          ...reply,
          message: confirmed
            ? reply.message.replace(/\n?\[已確認金額\]/g, "")
            : `${reply.message}\n[已確認金額]`,
        };
      }),
    );
  }

  const designList = useMemo<DisplayItem[]>(
    () => [
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
          assignment.data.material
            ? `材質 + 結構：${assignment.data.material}`
            : null,
        ].filter((value): value is string => Boolean(value)),
        fields: [
          { label: "所屬專案", value: project.name },
          { label: "項目", value: assignment.title },
          {
            label: "尺寸",
            value: assignment.data.size || "未填寫",
            tone: assignment.data.size ? "default" : "muted",
          },
          {
            label: "材質 + 結構",
            value: assignment.data.material || "未填寫",
            tone: assignment.data.material ? "default" : "muted",
          },
          {
            label: "數量",
            value: assignment.data.quantity || "未填寫",
            tone: assignment.data.quantity ? "default" : "muted",
          },
          {
            label: "需求說明",
            value: assignment.data.note || "未填寫",
            tone: assignment.data.note ? "default" : "muted",
          },
          {
            label: "參考連結",
            value: assignment.data.referenceUrl || "未填寫",
            tone: assignment.data.referenceUrl ? "default" : "muted",
          },
          {
            label: "負責人",
            value: assignment.data.assignee || "未指定",
            tone: assignment.data.assignee ? "default" : "muted",
          },
          {
            label: "狀態",
            value: assignment.data.status || "未填寫",
            tone: assignment.data.status ? "default" : "muted",
          },
        ],
        collapsedFields: [],
        replies:
          replyOverrides[assignment.targetId] ?? assignment.data.replies ?? [],
      })),
      ...project.designTasks.map((task) => ({
        id: task.title,
        title: task.title,
        sourceLabel: task.title,
        badge: task.status,
        badgeClass: getStatusClass(task.status),
        categoryLabel: "設計",
        owner: task.assignee,
        cardSummary: [],
        fields: [
          { label: "所屬專案", value: project.name },
          { label: "項目", value: task.title },
          { label: "尺寸", value: "未填寫", tone: "muted" },
          { label: "材質 + 結構", value: "未填寫", tone: "muted" },
          { label: "數量", value: "未填寫", tone: "muted" },
          {
            label: "需求說明",
            value: "舊假資料未帶完整母卡欄位",
            tone: "muted",
          },
          { label: "參考連結", value: "未填寫", tone: "muted" },
          {
            label: "負責人",
            value: task.assignee || "未指定",
            tone: task.assignee ? "default" : "muted",
          },
          {
            label: "狀態",
            value: task.status || "未填寫",
            tone: task.status ? "default" : "muted",
          },
        ],
        collapsedFields: [],
        replies: replyOverrides[task.title] ?? [],
      })),
    ],
    [designAssignments, project, replyOverrides],
  );

  const procurementList = useMemo<DisplayItem[]>(
    () => [
      ...procurementAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.data.item || assignment.title,
        sourceLabel: assignment.title,
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        categoryLabel: "備品",
        owner: assignment.data.assignee || undefined,
        cardSummary: [
          assignment.data.size ? `尺寸：${assignment.data.size}` : null,
          assignment.data.material ? `材質：${assignment.data.material}` : null,
        ].filter((value): value is string => Boolean(value)),
        fields: [
          { label: "所屬專案", value: project.name },
          { label: "來源項目 / 次項目", value: assignment.title },
          {
            label: "項目",
            value: assignment.data.item || assignment.title,
            tone: assignment.data.item ? "default" : "muted",
          },
          {
            label: "尺寸",
            value: assignment.data.size || "未填寫",
            tone: assignment.data.size ? "default" : "muted",
          },
          {
            label: "材質",
            value: assignment.data.material || "未填寫",
            tone: assignment.data.material ? "default" : "muted",
          },
          {
            label: "數量",
            value: assignment.data.quantity || "未填寫",
            tone: assignment.data.quantity ? "default" : "muted",
          },
          {
            label: "需求說明",
            value: assignment.data.note || "未填寫",
            tone: assignment.data.note ? "default" : "muted",
          },
          {
            label: "參考連結",
            value: assignment.data.styleUrl || "未填寫",
            tone: assignment.data.styleUrl ? "default" : "muted",
          },
          {
            label: "負責人",
            value: assignment.data.assignee || "未指定",
            tone: assignment.data.assignee ? "default" : "muted",
          },
          {
            label: "狀態",
            value: assignment.data.status || "未填寫",
            tone: assignment.data.status ? "default" : "muted",
          },
        ],
        replies:
          replyOverrides[assignment.targetId] ?? assignment.data.replies ?? [],
      })),
      ...project.procurementTasks.map((task) => ({
        id: task.title,
        title: task.title,
        sourceLabel: task.title,
        badge: task.status,
        badgeClass: getStatusClass(task.status),
        categoryLabel: "備品",
        owner: task.buyer,
        cardSummary: [],
        fields: [
          { label: "所屬專案", value: project.name },
          { label: "來源項目 / 次項目", value: task.title },
          { label: "項目", value: task.title },
          { label: "尺寸", value: "未填寫", tone: "muted" },
          { label: "材質", value: "未填寫", tone: "muted" },
          { label: "數量", value: "未填寫", tone: "muted" },
          {
            label: "需求說明",
            value: "舊假資料未帶完整母卡欄位",
            tone: "muted",
          },
          { label: "參考連結", value: "未填寫", tone: "muted" },
          {
            label: "負責人",
            value: task.buyer || "未指定",
            tone: task.buyer ? "default" : "muted",
          },
          {
            label: "狀態",
            value: task.status || "未填寫",
            tone: task.status ? "default" : "muted",
          },
        ],
        replies: replyOverrides[task.title] ?? [],
      })),
    ],
    [procurementAssignments, project, replyOverrides],
  );

  const vendorList = useMemo<DisplayItem[]>(
    () =>
      vendorAssignments.map((assignment) => ({
        id: assignment.targetId,
        title: assignment.data.title || assignment.title,
        sourceLabel: assignment.title,
        badge: assignment.data.status,
        badgeClass: getStatusClass(assignment.data.status),
        categoryLabel: "廠商",
        owner: assignment.data.assignee || undefined,
        cardSummary: [
          assignment.data.vendorName
            ? `廠商：${assignment.data.vendorName}`
            : null,
          assignment.data.category ? `工種：${assignment.data.category}` : null,
          assignment.data.amount ? `廠商報價：${assignment.data.amount}` : null,
        ].filter((value): value is string => Boolean(value)),
        fields: [
          { label: "所屬專案", value: project.name },
          { label: "來源項目 / 次項目", value: assignment.title },
          {
            label: "負責人",
            value: assignment.data.assignee || "未指定",
            tone: assignment.data.assignee ? "default" : "muted",
          },
          {
            label: "廠商名稱",
            value: assignment.data.vendorName || "未填寫",
            tone: assignment.data.vendorName ? "default" : "muted",
          },
          {
            label: "類別 / 工種",
            value: assignment.data.category || "未填寫",
            tone: assignment.data.category ? "default" : "muted",
          },
          {
            label: "需求說明",
            value: assignment.data.requirement || "未填寫",
            tone: assignment.data.requirement ? "default" : "muted",
          },
          {
            label: "規格 / 尺寸",
            value: assignment.data.specification || "未填寫",
            tone: assignment.data.specification ? "default" : "muted",
          },
          {
            label: "參考連結 / 參考資料",
            value: assignment.data.referenceUrl || "未填寫",
            tone: assignment.data.referenceUrl ? "default" : "muted",
          },
          {
            label: "備註",
            value: assignment.data.note || "未填寫",
            tone: assignment.data.note ? "default" : "muted",
          },
          {
            label: "廠商報價",
            value: assignment.data.amount || "未填寫",
            tone: assignment.data.amount ? "default" : "muted",
          },
        ],
        replies:
          replyOverrides[assignment.targetId] ?? assignment.data.replies ?? [],
      })),
    [vendorAssignments, project.name, replyOverrides],
  );

  const designDocumentGroups = useMemo<DesignDocumentGroup[]>(() => {
    const groups = new Map<string, DesignDocumentGroup>();

    designList.forEach((item) => {
      item.replies.forEach((reply, replyIndex) => {
        const summary = parseReplyMessage(reply);
        if (!summary.confirmed) return;
        const parsed = parseDesignReply(reply);
        const vendorName = parsed.vendor || "未指定廠商";
        const existing = groups.get(vendorName);
        const nextReply = {
          ...parsed,
          sourceTitle: item.title,
          replyId: reply.id,
          sequence: replyIndex + 1,
        };

        const generatedCount = generatedDesignDocuments[vendorName] ?? 0;
        const nextReplies = existing ? [...existing.replies, nextReply] : [nextReply];
        groups.set(vendorName, {
          vendor: vendorName,
          status:
            generatedCount === 0
              ? "未生成"
              : generatedCount === nextReplies.length
                ? "已生成"
                : "需更新",
          replies: nextReplies,
        });
      });
    });

    return Array.from(groups.values());
  }, [designList, generatedDesignDocuments]);

  const procurementDocumentGroup =
    useMemo<ProcurementDocumentGroup | null>(() => {
      const replies: ProcurementDocumentGroup["replies"] = [];

      procurementList.forEach((item) => {
        item.replies.forEach((reply, replyIndex) => {
          const summary = parseReplyMessage(reply);
          if (!summary.confirmed) return;
          replies.push({
            ...parseProcurementReply(reply),
            sourceTitle: item.title,
            replyId: reply.id,
            sequence: replyIndex + 1,
          });
        });
      });

      if (!replies.length) {
        return null;
      }

      const generatedCount = generatedProcurementDocuments[project.id] ?? 0;

      return {
        id: project.id,
        status:
          generatedCount === 0
            ? "未生成"
            : generatedCount === replies.length
              ? "已生成"
              : "需更新",
        replies,
      };
    }, [generatedProcurementDocuments, procurementList, project.id]);

  const designSummaryList = useMemo<ProjectTaskSummaryItem[]>(
    () =>
      designList.map((item) => ({
        id: item.id,
        title: item.title,
        quantity:
          item.fields.find((field) => field.label === "數量")?.value || "未填寫",
        status: item.badge,
        statusClass: item.badgeClass,
        href: `/design-tasks?project=${encodeURIComponent(project.id)}&task=${encodeURIComponent(item.sourceLabel)}`,
        ctaLabel: "查看任務",
      })),
    [designList, project.id],
  );

  const procurementSummaryList = useMemo<ProjectTaskSummaryItem[]>(
    () =>
      procurementList.map((item) => ({
        id: item.id,
        title: item.title,
        quantity:
          item.fields.find((field) => field.label === "數量")?.value || "未填寫",
        status: item.badge,
        statusClass: item.badgeClass,
        href: `/procurement-tasks?project=${encodeURIComponent(project.id)}&task=${encodeURIComponent(item.sourceLabel)}`,
        ctaLabel: "查看任務",
      })),
    [procurementList, project.id],
  );

  const vendorSummaryList = useMemo<ProjectTaskSummaryItem[]>(
    () =>
      vendorList.map((item) => {
        const vendorName = item.fields.find((field) => field.label === "廠商名稱")?.value;
        return {
          id: item.id,
          title: item.title,
          status: item.badge,
          statusClass: item.badgeClass,
          href: `/vendor-issues?project=${encodeURIComponent(project.id)}&task=${encodeURIComponent(item.sourceLabel)}`,
          ctaLabel: "前往廠商發包版",
          extraSummary: vendorName && vendorName !== "未填寫" ? `廠商：${vendorName}` : undefined,
        };
      }),
    [vendorList, project.id],
  );

  const currentList =
    openCategory === "design"
      ? designSummaryList
      : openCategory === "procurement"
        ? procurementSummaryList
        : vendorSummaryList;

  const categoryMeta = {
    design: {
      title: "專案設計",
      description: "交辦設計 → 回覆 → 設計文件整理與文件預覽。",
      count: designSummaryList.length,
      accent: "text-blue-700",
      ring: "ring-blue-200",
      activeSurface: "bg-blue-50/80",
      activeBadge: "bg-blue-100 text-blue-700",
      sectionHint: "每筆任務只保留數量、任務名稱、狀態與導流。",
    },
    procurement: {
      title: "專案備品",
      description: "交辦備品 → 回覆 → 備品整理與備品文件預覽。",
      count: procurementSummaryList.length,
      accent: "text-amber-700",
      ring: "ring-amber-200",
      activeSurface: "bg-amber-50/80",
      activeBadge: "bg-amber-100 text-amber-700",
      sectionHint: "每筆任務只保留數量、任務名稱、狀態與導流。",
    },
    vendor: {
      title: "專案廠商",
      description: "廠商主卡只保留識別與入口，不再當完整工作台。",
      count: vendorSummaryList.length,
      accent: "text-violet-700",
      ring: "ring-violet-200",
      activeSurface: "bg-violet-50/80",
      activeBadge: "bg-violet-100 text-violet-700",
      sectionHint: "每筆任務只保留任務名稱、狀態與導往廠商發包版入口。",
    },
  };

  return (
    <>
      <section id="project-execution-section" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <ExecutionTree
          heading="專案執行項目"
          items={project.executionItems}
          projectId={project.id}
          onDesignAssignmentsChange={setDesignAssignments}
          onProcurementAssignmentsChange={setProcurementAssignments}
          onVendorAssignmentsChange={setVendorAssignments}
        />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">專案分類檢視</h3>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {(["design", "procurement", "vendor"] as OpenCategory[]).map(
            (category) => {
              const meta = categoryMeta[category];
              const isActive = openCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleOpenCategory(category)}
                  className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition ${isActive ? `${meta.ring} border-transparent ring-2 shadow-md` : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"}`}
                >
                  <div className="flex min-h-[84px] items-center justify-between gap-3">
                    <div className="flex min-h-full flex-1 items-center justify-center text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className={`text-lg font-semibold ${meta.accent}`}>
                          {meta.title}
                        </p>
                        {isActive ? (
                          <span className="inline-flex w-fit items-center justify-center rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                            目前檢視
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className={`inline-flex min-w-[36px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                      {meta.count}
                    </span>
                  </div>
                </button>
              );
            },
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-300 bg-slate-100 p-5 shadow-inner">
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-lg font-semibold text-slate-900">
                  {categoryMeta[openCategory].title}
                </h4>
                <span className="text-sm font-medium text-slate-500">
                  共 {currentList.length} 筆
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {categoryMeta[openCategory].sectionHint}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ProjectTaskSummaryList items={currentList} />
          </div>

          {openCategory === "design" ? (
            <div className="mt-6 space-y-4 rounded-3xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
              <div>
                <h5 className="text-lg font-semibold text-slate-900">
                  設計文件整理
                </h5>
                <p className="mt-1 text-sm text-slate-500">
                  只吃已確認回覆，依執行廠商分組整理；一個執行廠商 = 一組整理單位 =
                  一份設計文件。
                </p>
              </div>

              {designDocumentGroups.length ? (
                <div className="space-y-3">
                  {designDocumentGroups.map((group) => {
                    const isContentOpen =
                      activeDesignDocumentContentVendor === group.vendor;
                    const isDocumentOpen =
                      activeDesignDocumentVendor === group.vendor;
                    return (
                      <div
                        key={group.vendor}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-slate-900">
                                {group.vendor}
                              </p>
                              <span
                                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${getDocumentStatusClass(group.status)}`}
                              >
                                {group.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                              項目數量：{group.replies.length}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setGeneratedDesignDocuments((prev) => ({
                                  ...prev,
                                  [group.vendor]: group.replies.length,
                                }))
                              }
                              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              {group.status === "未生成"
                                ? "生成文件"
                                : "重新生成文件"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleDesignOrganizeContent(group.vendor)
                              }
                              className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition ${isContentOpen ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                            >
                              {isContentOpen ? "收合整理內容" : "查看整理內容"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleDesignOrganizeDocument(group.vendor)
                              }
                              className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition ${isDocumentOpen ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                            >
                              {isDocumentOpen ? "收合文件" : "查看文件"}
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
                                    "執行廠商",
                                    "數量",
                                    "金額",
                                    "尺寸",
                                    "材質 + 結構",
                                    "檔案位置（URL）",
                                  ].map((label) => (
                                    <th
                                      key={label}
                                      className="border-b border-slate-200 px-4 py-3 font-medium"
                                    >
                                      {label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {group.replies.map((reply) => (
                                  <tr
                                    key={reply.replyId}
                                    className="align-top text-slate-700"
                                  >
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      {reply.sourceTitle}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      R{reply.sequence}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      {reply.title}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      {reply.vendor}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      {reply.quantity}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      {reply.amount}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      {reply.size}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3">
                                      {reply.materialStructure}
                                    </td>
                                    <td className="border-b border-slate-200 px-4 py-3 break-all">
                                      {reply.fileUrl}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {isDocumentOpen ? (
                          <div className="mt-4">
                            <DesignDocumentPreview
                              project={project}
                              group={group}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                  目前尚無可整理的設計回覆；先在上方設計任務新增回覆，指定執行廠商並完成確認。
                </div>
              )}
            </div>
          ) : null}

          {openCategory === "procurement" ? (
            <div className="mt-6 space-y-4 rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 p-5">
              <div>
                <h5 className="text-lg font-semibold text-slate-900">
                  備品整理
                </h5>
                <p className="mt-1 text-sm text-slate-500">
                  只吃已確認回覆，不覆蓋版本；先作為採購 /
                  備品文件輸出前整理層。
                </p>
              </div>

              {procurementDocumentGroup ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">
                          {project.name}
                        </p>
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${getDocumentStatusClass(procurementDocumentGroup.status)}`}
                        >
                          {procurementDocumentGroup.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        回覆筆數：{procurementDocumentGroup.replies.length}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setGeneratedProcurementDocuments((prev) => ({
                            ...prev,
                            [project.id]: procurementDocumentGroup.replies.length,
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        {procurementDocumentGroup.status === "未生成"
                          ? "生成文件"
                          : "重新生成文件"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProcurementOrganizeContent(project.id)}
                        className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition ${activeProcurementContent === project.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        {activeProcurementContent === project.id
                          ? "收合整理內容"
                          : "查看整理內容"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProcurementOrganizeDocument(project.id)}
                        className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition ${activeProcurementDocument === project.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        {activeProcurementDocument === project.id
                          ? "收合文件"
                          : "查看文件"}
                      </button>
                    </div>
                  </div>

                  {activeProcurementContent === project.id ? (
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="min-w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            {[
                              "來源任務",
                              "回覆序號",
                              "回覆標題",
                              "廠商",
                              "數量",
                              "金額",
                              "尺寸",
                              "材質",
                              "預覽圖 URL",
                            ].map((label) => (
                              <th
                                key={label}
                                className="border-b border-slate-200 px-4 py-3 font-medium"
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {procurementDocumentGroup.replies.map((reply) => (
                            <tr
                              key={reply.replyId}
                              className="align-top text-slate-700"
                            >
                              <td className="border-b border-slate-200 px-4 py-3">
                                {reply.sourceTitle}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3">
                                R{reply.sequence}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3">
                                {reply.title}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3">
                                {reply.vendor}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3">
                                {reply.quantity}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3">
                                {reply.amount}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3">
                                {reply.size}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3">
                                {reply.material}
                              </td>
                              <td className="border-b border-slate-200 px-4 py-3 break-all">
                                {reply.previewUrl}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {activeProcurementDocument === project.id ? (
                    <div className="mt-4">
                      <ProcurementDocumentPreview
                        project={project}
                        group={procurementDocumentGroup}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                  目前尚無可整理的備品回覆；先在上方備品任務新增回覆。
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
