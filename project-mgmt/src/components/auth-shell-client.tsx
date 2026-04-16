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
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-56 shrink-0 rounded-3xl bg-slate-950 p-6 text-white lg:block xl:w-60">
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
        </aside>

        <section className="flex-1 space-y-4">
          {user ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                <div className="mt-1 text-sm text-slate-500">{user.email}・{user.role === 'admin' ? 'Admin' : 'Member'}</div>
              </div>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                  登出
                </button>
              </form>
            </div>
          ) : null}

          {children}
        </section>
      </div>
    </main>
  );
}
