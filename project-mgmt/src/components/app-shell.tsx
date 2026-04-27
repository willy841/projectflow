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
  variant = "default",
}: {
  children: ReactNode;
  activePath?: string;
  variant?: "default" | "dark-glass";
}) {
  const isDarkGlass = variant === "dark-glass";

  return (
    <main className={isDarkGlass ? "min-h-screen text-slate-100" : "min-h-screen bg-[#f4f7fb] text-slate-900"}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-4 py-6 lg:px-6 xl:px-8">
        <aside className={isDarkGlass ? "hidden w-56 shrink-0 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.52),rgba(15,23,42,0.34))] p-6 text-white shadow-[0_32px_80px_-44px_rgba(0,0,0,0.7)] backdrop-blur-2xl lg:block lg:min-h-[calc(100vh-3rem)] xl:w-60" : "hidden w-56 shrink-0 rounded-3xl bg-slate-950 p-6 text-white lg:block xl:w-60"}>
          <div className="mb-6 flex min-h-10 items-center justify-center text-center">
            <h1 className={isDarkGlass ? "text-2xl font-semibold tracking-wide text-white/96" : "text-2xl font-semibold"}>任務版</h1>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = item.href !== "#" && activePath === item.href;

              if (item.href === "#") {
                return (
                  <div key={item.label} className={isDarkGlass ? "rounded-2xl px-4 py-3 text-slate-300 hover:bg-white/6" : "rounded-2xl px-4 py-3 text-slate-300 hover:bg-white/6"}>
                    {item.label}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={isDarkGlass
                    ? `block rounded-2xl px-4 py-3 transition ${isActive ? "bg-[linear-gradient(180deg,rgba(75,132,220,0.24),rgba(34,53,92,0.12))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_28px_rgba(59,130,246,0.18)]" : "text-slate-300 hover:bg-white/6 hover:shadow-[0_0_22px_rgba(96,165,250,0.08)]"}`
                    : `block rounded-2xl px-4 py-3 ${isActive ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/6"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className={isDarkGlass ? "flex-1 space-y-4" : "flex-1 space-y-6"}>{children}</section>
      </div>
    </main>
  );
}
