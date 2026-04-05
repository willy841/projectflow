"use client";

import { utils, writeFile } from "xlsx";
import { useMemo } from "react";
import { getMockTaskDocument } from "@/components/mock-workflow-document-store";
import type { DesignDocumentRow } from "@/components/design-task-data";

export function MockDesignDocumentView({
  taskId,
  fallbackRows,
  fallbackLink,
}: {
  taskId: string;
  fallbackRows: DesignDocumentRow[];
  fallbackLink: string;
}) {
  const stored = useMemo(() => getMockTaskDocument(taskId), [taskId]);
  const rows = stored?.rows?.length ? stored.rows : fallbackRows;
  const documentLink = stored?.documentLink || fallbackLink;

  function handleExportExcel() {
    const worksheet = utils.json_to_sheet(
      rows.map((row) => ({
        編號: row.id,
        項目: row.item,
        尺寸: "size" in row ? row.size || "未填寫" : "未填寫",
        材質與結構: "materialStructure" in row ? row.materialStructure || "未填寫" : "未填寫",
        數量: row.quantity,
      })),
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "設計文件");
    writeFile(workbook, `${taskId}-design-document.xlsx`);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          匯出 Excel
        </button>
      </div>

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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs text-slate-500">檔案位置連結</p>
        <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
          {documentLink}
        </div>
      </div>
    </>
  );
}
