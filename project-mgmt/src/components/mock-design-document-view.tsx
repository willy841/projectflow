"use client";

import { useMemo } from "react";
import { getMockTaskDocument } from "@/components/mock-workflow-document-store";
import type { DesignDocumentRow } from "@/components/design-task-data";
import { isUuidLike } from "@/lib/db/project-flow-toggle";

export function MockDesignDocumentView({
  taskId,
  fallbackRows,
}: {
  taskId: string;
  fallbackRows: DesignDocumentRow[];
}) {
  const stored = useMemo(() => (isUuidLike(taskId) ? null : getMockTaskDocument(taskId)), [taskId]);
  const rows = stored?.rows?.length ? stored.rows : fallbackRows;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {["編號", "項目", "尺寸", "材質與結構", "數量"].map((label) => (
              <th key={label} className="border-b border-slate-200 px-4 py-3 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="align-top text-slate-700">
              <td className="border-b border-slate-200 px-4 py-3">{row.id}</td>
              <td className="border-b border-slate-200 px-4 py-3">{row.item}</td>
              <td className="border-b border-slate-200 px-4 py-3">{"size" in row ? row.size || "未填寫" : "未填寫"}</td>
              <td className="border-b border-slate-200 px-4 py-3">{"materialStructure" in row ? row.materialStructure || "未填寫" : "未填寫"}</td>
              <td className="border-b border-slate-200 px-4 py-3">{row.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
