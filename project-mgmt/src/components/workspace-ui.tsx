import type { ReactNode } from "react";

export const workspacePrimaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold tracking-[0.01em] text-slate-100 shadow-[0_22px_46px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-slate-900/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

type WorkspaceHeaderProps = {
  title: ReactNode;
  badge?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function WorkspaceHeader({
  title,
  badge,
  backHref,
  backLabel = "返回列表",
  actions,
  meta,
}: WorkspaceHeaderProps) {
  return (
    <header className="p-1">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          {backHref ? (
            <a
              href={backHref}
              className="inline-flex items-center text-sm font-medium text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
            >
              ← {backLabel}
            </a>
          ) : null}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-50">{title}</h2>
              {badge ? <div>{badge}</div> : null}
            </div>
            {meta ? <div className="text-sm text-slate-400">{meta}</div> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function WorkspaceSection({
  children,
  className = "",
  title,
  meta,
  actions,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  const shellNone = className.includes("shell-none");

  return (
    <section className={`${shellNone ? "p-0 bg-transparent border-0 shadow-none backdrop-blur-0" : "rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.72),rgba(13,22,39,0.52))] p-6 shadow-[0_34px_90px_-38px_rgba(0,0,0,0.68),0_0_34px_rgba(96,165,250,0.08),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-22px_44px_-28px_rgba(7,13,25,0.98)] backdrop-blur-[28px]"} ${className}`.trim()}>
      {title || meta || actions ? (
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            {title ? <h3 className="text-xl font-semibold text-slate-100">{typeof title === 'string' && !title.trim().startsWith('•') ? `• ${title}` : title}</h3> : null}
            {meta ? <div className="text-sm text-slate-400">{meta}</div> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function WorkspaceStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(36,48,72,0.76),rgba(14,22,39,0.52))] px-4 py-3.5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px]">
      <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}

export function WorkspaceActionBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-white/10 pb-4 xl:flex-row xl:items-center xl:justify-between">{children}</div>;
}

export function WorkspaceFooterActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-between sm:items-center">{children}</div>;
}

export function WorkspaceStatusNotice({ tone = "info", children }: { tone?: "info" | "success" | "warning" | "error"; children: ReactNode }) {
  const toneClass = {
    info: "border-white/10 bg-white/6 text-slate-300",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    error: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  }[tone];

  return <div className={`rounded-2xl border px-4 py-3 text-sm whitespace-pre-line ${toneClass}`}>{children}</div>;
}

export function WorkspaceEmptyState({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(39,52,77,0.62),rgba(17,26,42,0.46))] p-10 text-center shadow-[0_24px_46px_-28px_rgba(0,0,0,0.54),0_0_16px_rgba(96,165,250,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_24px_-18px_rgba(10,18,32,0.86)] backdrop-blur-2xl">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {actions ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
