import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { label: "首頁總覽", href: "/" },
  { label: "專案管理", href: "/projects" },
  { label: "設計任務版", href: "/design-tasks" },
  { label: "備品採購版", href: "/procurement-tasks" },
  { label: "廠商資料", href: "/vendors" },
  { label: "報價成本", href: "/quote-costs" },
  { label: "結案紀錄", href: "/closeouts" },
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
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-56 shrink-0 rounded-3xl bg-slate-950 p-6 text-white lg:block xl:w-60">
          <div className="mb-6 flex min-h-10 items-center justify-center text-center">
            <h1 className="text-2xl font-semibold">任務版</h1>
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
