import { WorkspaceEmptyState } from "@/components/workspace-ui";

type DocumentColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => string | number | null | undefined;
};

export function TaskDocumentTable<T>({
  rows,
  columns,
  emptyTitle = "目前尚無正式文件內容",
  emptyDescription = "請先完成正式確認，文件頁才會承接可驗收的內容。",
}: {
  rows: T[];
  columns: DocumentColumn<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!rows.length) {
    return <WorkspaceEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-[26px] border border-white/70 bg-[var(--surface-card)] shadow-[var(--shadow-soft)]">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50/90 text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-slate-200/80 px-5 py-3.5 text-xs font-semibold tracking-[0.02em] text-slate-500">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top text-slate-700 transition-colors hover:bg-slate-50/70">
              {columns.map((column) => {
                const value = column.render(row);
                return (
                  <td key={column.key} className="border-b border-slate-200/75 px-5 py-4 leading-6">
                    {value === null || value === undefined || value === "" ? "未填寫" : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
