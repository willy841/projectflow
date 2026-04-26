import Link from "next/link";

export type ProjectTaskSummaryItem = {
  id: string;
  summaryKey?: string;
  title: string;
  quantity?: string;
  status: string;
  statusClass: string;
  href: string;
  ctaLabel: string;
  extraSummary?: string;
  onDelete?: () => void;
};

export function ProjectTaskSummaryList({
  items,
}: {
  items: ProjectTaskSummaryItem[];
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/12 bg-white/5 p-5 text-sm text-slate-400">
        尚未建立資料。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, itemIndex) => (
        <div
          key={item.id}
          className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  #{itemIndex + 1}
                </span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${item.statusClass}`}
                >
                  {item.status}
                </span>
                {item.quantity ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
                    數量：{item.quantity}
                  </span>
                ) : null}
                {item.extraSummary ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
                    {item.extraSummary}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 min-w-0">
                <h5 className="text-base font-semibold text-white">
                  {item.title}
                </h5>
              </div>
            </div>

            <div className="flex gap-2 xl:w-[320px] xl:justify-end">
              {item.onDelete ? (
                <button
                  type="button"
                  onClick={item.onDelete}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/8 px-3 py-2.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/14 xl:w-auto"
                >
                  刪除
                </button>
              ) : null}
              <Link
                href={item.href}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 xl:w-auto"
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
