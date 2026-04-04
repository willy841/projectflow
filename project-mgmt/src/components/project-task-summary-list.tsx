import Link from "next/link";

export type ProjectTaskSummaryItem = {
  id: string;
  title: string;
  quantity?: string;
  status: string;
  statusClass: string;
  href: string;
  ctaLabel: string;
  extraSummary?: string;
};

export function ProjectTaskSummaryList({
  items,
}: {
  items: ProjectTaskSummaryItem[];
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        目前此分類尚未建立資料。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, itemIndex) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  #{itemIndex + 1}
                </span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${item.statusClass}`}
                >
                  {item.status}
                </span>
                {item.quantity ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    數量：{item.quantity}
                  </span>
                ) : null}
                {item.extraSummary ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    {item.extraSummary}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 min-w-0">
                <h5 className="text-base font-semibold text-slate-900">
                  {item.title}
                </h5>
              </div>
            </div>

            <div className="flex xl:w-[220px] xl:justify-end">
              <Link
                href={item.href}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 xl:w-auto"
              >
                {item.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
