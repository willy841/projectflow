"use client";

import { utils, writeFile } from "xlsx";

type DesignRow = {
  id: number;
  item: string;
  size?: string;
  materialStructure?: string;
  quantity: string;
};

type ProcurementRow = {
  id: number;
  item: string;
  quantity: string;
};

export function DesignDocumentExportButton({ taskId, rows }: { taskId: string; rows: DesignRow[] }) {
  function handleExportExcel() {
    const worksheet = utils.json_to_sheet(
      rows.map((row) => ({
        編號: row.id,
        項目: row.item,
        尺寸: row.size || "未填寫",
        材質與結構: row.materialStructure || "未填寫",
        數量: row.quantity,
      })),
    );

    worksheet["!cols"] = [
      { wch: 50 },
      { wch: 50 },
      { wch: 50 },
      { wch: 50 },
      { wch: 50 },
    ];

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "設計文件");
    writeFile(workbook, `${taskId}-design-document.xlsx`);
  }

  return (
    <button
      type="button"
      onClick={handleExportExcel}
      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      匯出 Excel
    </button>
  );
}

export function ProcurementDocumentExportButton({ taskId, rows }: { taskId: string; rows: ProcurementRow[] }) {
  function handleExportExcel() {
    const worksheet = utils.json_to_sheet(
      rows.map((row) => ({
        編號: row.id,
        項目: row.item,
        數量: row.quantity,
      })),
    );

    worksheet["!cols"] = [{ wch: 50 }, { wch: 50 }, { wch: 50 }];

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "備品文件");
    writeFile(workbook, `${taskId}-procurement-document.xlsx`);
  }

  return (
    <button
      type="button"
      onClick={handleExportExcel}
      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      匯出 Excel
    </button>
  );
}
