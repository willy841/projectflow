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
    <div className="pf-table-shell rounded-[28px]">
      <table className="pf-table min-w-[880px] xl:min-w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => {
                const value = column.render(row);
                return (
                  <td key={column.key} className="text-slate-300">
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
