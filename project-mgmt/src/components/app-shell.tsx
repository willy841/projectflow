import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { label: "首頁總覽", href: "/" },
  { label: "專案管理", href: "/projects" },
  { label: "設計任務版", href: "/design-tasks" },
  { label: "採購備品板", href: "/procurement-tasks" },
  { label: "廠商發包板", href: "/vendor-assignments" },
  { label: "廠商資料", href: "/vendors" },
  { label: "報價成本", href: "/quote-costs" },
  { label: "結案紀錄", href: "/closeouts" },
  { label: "帳務中心", href: "/accounting-center" },
  { label: "報表分析", href: "#" },
  { label: "系統設定", href: "/system-settings" },
];

export function AppShell({
  children,
  activePath = "/",
}: {
  children: ReactNode;
  activePath?: string;
}) {
  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1640px] gap-6 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-60 shrink-0 rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.78))] p-6 text-white shadow-[0_24px_60px_-32px_rgba(2,6,23,0.9)] backdrop-blur-xl lg:block xl:w-64">
          <div className="mb-8 flex min-h-10 items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white/96">任務版</h1>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = item.href !== "#" && activePath === item.href;

              if (item.href === "#") {
                return (
                  <div key={item.label} className="rounded-2xl border border-transparent px-4 py-3 text-slate-300 transition-colors hover:border-white/6 hover:bg-white/5">
                    {item.label}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative block rounded-2xl border px-4 py-3 transition-all ${
                    isActive
                      ? "border-white/12 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "border-transparent text-slate-300 hover:border-white/6 hover:bg-white/5"
                  }`}
                >
                  {isActive ? <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[var(--accent)]" /> : null}
                  <span className="pl-2">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 space-y-6 rounded-[30px] border border-white/8 bg-[rgba(255,255,255,0.06)] p-3 shadow-[0_28px_60px_-36px_rgba(2,6,23,0.9)] backdrop-blur-[6px] sm:p-4 lg:p-5">{children}</section>
      </div>
    </main>
  );
}
