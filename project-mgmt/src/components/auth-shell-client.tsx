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
  contentSurfaceClassName,
}: {
  children: ReactNode;
  activePath?: string;
  navItems: AuthShellNavItem[];
  user: AuthShellUser | null;
  contentSurfaceClassName?: string;
}) {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-56 shrink-0 rounded-3xl bg-slate-950 p-6 text-white lg:flex lg:min-h-[calc(100vh-3rem)] lg:flex-col xl:w-60">
          <div className="mb-6 flex min-h-10 items-center justify-center text-center">
            <h1 className="text-2xl font-semibold">任務版</h1>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 ${isActive ? 'bg-white/12 text-white' : 'text-slate-300 hover:bg-white/6'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="mt-1 text-xs text-slate-300 break-all">{user.email}</div>
                  <div className="mt-2 text-xs text-slate-400">{user.role === 'admin' ? 'Admin' : 'Member'}</div>
                </div>
                <form action="/api/auth/logout" method="post" className="mt-4">
                  <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                    登出
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </aside>

        <section className={`flex-1 space-y-4 ${contentSurfaceClassName ?? ''}`}>
          {children}
        </section>
      </div>
    </main>
  );
}
