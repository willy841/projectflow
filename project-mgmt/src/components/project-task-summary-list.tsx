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
      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] p-5 text-sm text-slate-400 shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl">
        尚未建立資料。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, itemIndex) => (
        <div
          key={item.id}
          className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] p-4 shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl"
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
                  <span className="inline-flex items-center justify-center rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                    數量：{item.quantity}
                  </span>
                ) : null}
                {item.extraSummary ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                    {item.extraSummary}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 min-w-0">
                <h5 className="text-base font-semibold text-slate-100">
                  {item.title}
                </h5>
              </div>
            </div>

            <div className="flex gap-2 xl:w-[320px] xl:justify-end">
              {item.onDelete ? (
                <button
                  type="button"
                  onClick={item.onDelete}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-rose-400/20 bg-slate-900/40 px-3 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-950/30 xl:w-auto"
                >
                  刪除
                </button>
              ) : null}
              <Link
                href={item.href}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2.5 text-xs font-semibold text-slate-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition hover:bg-slate-900/60 xl:w-auto"
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
