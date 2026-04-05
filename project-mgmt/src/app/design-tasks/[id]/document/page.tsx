import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDesignTaskById } from "@/components/design-task-data";

const mockRows = [
  {
    id: 1,
    item: "主背板輸出",
    size: "W240 x H300 cm",
    materialStructure: "珍珠板 + 鋁架固定",
    quantity: "1 式",
  },
  {
    id: 2,
    item: "入口海報輸出",
    size: "A1 / 594 x 841 mm",
    materialStructure: "海報紙 + 立架展示",
    quantity: "2 張",
  },
];

export default async function DesignTaskDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getDesignTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <AppShell activePath="/design-tasks">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">設計文件整理頁</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{task.title}</h2>
          </div>
          <Link
            href={`/design-tasks/${task.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            返回任務詳情
          </Link>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">最終文件頁</h3>
            <p className="mt-1 text-sm text-slate-500">設計文件整理頁即最終文件頁，欄位可編輯但不回寫上一層處理方案。</p>
          </div>
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
              {mockRows.map((row) => (
                <tr key={row.id} className="align-top text-slate-700">
                  <td className="border-b border-slate-200 px-4 py-3">{row.id}</td>
                  <td className="border-b border-slate-200 px-4 py-3">{row.item}</td>
                  <td className="border-b border-slate-200 px-4 py-3">{row.size}</td>
                  <td className="border-b border-slate-200 px-4 py-3">{row.materialStructure}</td>
                  <td className="border-b border-slate-200 px-4 py-3">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs text-slate-500">檔案位置連結</p>
          <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
            https://example.com/design-final-file
          </div>
        </div>
      </section>
    </AppShell>
  );
}
