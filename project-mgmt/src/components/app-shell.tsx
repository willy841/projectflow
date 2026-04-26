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
      <div className="mx-auto flex min-h-screen w-full max-w-[1660px] gap-7 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-60 shrink-0 rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.95),rgba(12,21,39,0.84))] p-6 text-white shadow-[0_28px_70px_-30px_rgba(2,6,23,0.96)] backdrop-blur-xl lg:block xl:w-64">
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
                  className={`relative block rounded-[20px] border px-4 py-3 transition-all ${
                    isActive
                      ? "border-white/14 bg-[linear-gradient(180deg,rgba(94,162,255,0.16),rgba(255,255,255,0.08))] text-white shadow-[0_18px_44px_-30px_rgba(94,162,255,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "border-transparent text-slate-300 hover:border-white/8 hover:bg-white/6"
                  }`}
                >
                  {isActive ? <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[var(--accent)] shadow-[0_0_16px_rgba(94,162,255,0.95)]" /> : null}
                  <span className="pl-2">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 space-y-6 rounded-[32px] border border-white/9 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_34px_80px_-40px_rgba(2,6,23,0.95)] backdrop-blur-[10px] sm:p-4 lg:p-5">{children}</section>
      </div>
    </main>
  );
}
