import { ReactNode } from 'react';
import { AuthShellServer } from '@/components/auth-shell-server';

export async function AppShellAuth({ children, activePath = '/' }: { children: ReactNode; activePath?: string }) {
  return <AuthShellServer activePath={activePath}>{children}</AuthShellServer>;
}
