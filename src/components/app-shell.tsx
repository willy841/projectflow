import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { label: "首頁總覽", href: "/" },
  { label: "專案管理", href: "/projects" },
  { label: "需求溝通", href: "#" },
  { label: "設計交辦", href: "#" },
  { label: "備品採購", href: "#" },
  { label: "廠商資料", href: "#" },
  { label: "成本與報價", href: "#" },
  { label: "帳務中心", href: "#" },
  { label: "報表分析", href: "#" },
  { label: "系統設定", href: "#" },
];

export function AppShell({
  children,
  activePath = "/",
}: {
  children: ReactNode;
  activePath?: string;
}) {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-64 shrink-0 rounded-3xl bg-slate-950 p-6 text-white lg:block">
          <div className="mb-8">
            <p className="text-sm text-slate-400">Project OS</p>
            <h1 className="mt-2 text-2xl font-semibold">專案營運管理系統</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              專案、設計、備品、廠商、帳務集中管理。
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = item.href !== "#" && activePath === item.href;

              if (item.href === "#") {
                return (
                  <div key={item.label} className="rounded-2xl px-4 py-3 text-slate-300 hover:bg-white/6">
                    {item.label}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 ${
                    isActive ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/6"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 space-y-6">{children}</section>
      </div>
    </main>
  );
}
