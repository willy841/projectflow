import type { ReactNode } from "react";

export const workspacePrimaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold tracking-[0.01em] text-white shadow-sm transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

type WorkspaceHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function WorkspaceHeader({
  title,
  backHref,
  backLabel = "返回列表",
  actions,
  meta,
}: WorkspaceHeaderProps) {
  return (
    <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          {backHref ? (
            <a
              href={backHref}
              className="inline-flex items-center text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
            >
              ← {backLabel}
            </a>
          ) : null}
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
            {meta ? <div className="text-sm text-slate-500">{meta}</div> : null}
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
  return (
    <section className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className}`.trim()}>
      {title || meta || actions ? (
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            {title ? <h3 className="text-xl font-semibold text-slate-900">{title}</h3> : null}
            {meta ? <div className="text-sm text-slate-500">{meta}</div> : null}
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
      <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export function WorkspaceActionBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">{children}</div>;
}

export function WorkspaceFooterActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between sm:items-center">{children}</div>;
}

export function WorkspaceStatusNotice({ tone = "info", children }: { tone?: "info" | "success" | "warning" | "error"; children: ReactNode }) {
  const toneClass = {
    info: "border-slate-200 bg-slate-50 text-slate-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  }[tone];

  return <div className={`rounded-2xl border px-4 py-3 text-sm whitespace-pre-line ${toneClass}`}>{children}</div>;
}

export function WorkspaceEmptyState({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {actions ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
