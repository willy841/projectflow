"use client";

import Link from 'next/link';
import { ReactNode } from 'react';

export type AuthShellNavItem = {
  label: string;
  href: string;
};

export type AuthShellUser = {
  name: string;
  email: string;
  role: 'admin' | 'member';
};

export function AuthShellClient({
  children,
  activePath = '/',
  navItems,
  user,
}: {
  children: ReactNode;
  activePath?: string;
  navItems: AuthShellNavItem[];
  user: AuthShellUser | null;
}) {
  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-56 shrink-0 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.52),rgba(15,23,42,0.34))] p-6 text-white shadow-[0_32px_80px_-44px_rgba(0,0,0,0.7)] backdrop-blur-2xl lg:flex lg:min-h-[calc(100vh-3rem)] lg:flex-col xl:w-60">
          <div className="mb-6 flex min-h-10 items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-wide text-white/96">任務版</h1>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? 'bg-[linear-gradient(180deg,rgba(75,132,220,0.24),rgba(34,53,92,0.12))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_28px_rgba(59,130,246,0.18)]'
                      : 'text-slate-300 hover:bg-white/6 hover:shadow-[0_0_22px_rgba(96,165,250,0.08)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="mt-1 break-all text-xs text-slate-300">{user.email}</div>
                  <div className="mt-2 text-xs text-slate-400">{user.role === 'admin' ? 'Admin' : 'Member'}</div>
                </div>
                <form action="/api/auth/logout" method="post" className="mt-4">
                  <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_-24px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition hover:bg-slate-900/60">
                    登出
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </aside>

        <section className="flex-1 space-y-4">{children}</section>
      </div>
    </main>
  );
}
