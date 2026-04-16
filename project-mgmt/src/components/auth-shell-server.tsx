import { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { canAccessAccountingCenter, canAccessSystemSettings } from '@/lib/authz';
import { AuthShellClient, type AuthShellNavItem } from '@/components/auth-shell-client';

const navItems: (AuthShellNavItem & { adminOnly?: boolean })[] = [
  { label: '首頁總覽', href: '/' },
  { label: '專案管理', href: '/projects' },
  { label: '設計任務版', href: '/design-tasks' },
  { label: '採購備品板', href: '/procurement-tasks' },
  { label: '廠商發包板', href: '/vendor-assignments' },
  { label: '廠商資料', href: '/vendors' },
  { label: '報價成本', href: '/quote-costs' },
  { label: '結案紀錄', href: '/closeouts' },
  { label: '帳務中心', href: '/accounting-center', adminOnly: true },
  { label: '系統設定', href: '/system-settings', adminOnly: true },
];

export async function AuthShellServer({ children, activePath = '/' }: { children: ReactNode; activePath?: string }) {
  const user = await getCurrentUser();
  const filteredNavItems = navItems.filter((item) => {
    if (!item.adminOnly) return true;
    if (item.href === '/accounting-center') return canAccessAccountingCenter(user);
    if (item.href === '/system-settings') return canAccessSystemSettings(user);
    return true;
  });

  return (
    <AuthShellClient
      activePath={activePath}
      navItems={filteredNavItems}
      user={user ? { name: user.name, email: user.email, role: user.role } : null}
    >
      {children}
    </AuthShellClient>
  );
}
