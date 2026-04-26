import { ReactNode } from 'react';
import { AuthShellServer } from '@/components/auth-shell-server';

export async function AppShellAuth({
  children,
  activePath = '/',
  contentSurfaceClassName,
}: {
  children: ReactNode;
  activePath?: string;
  contentSurfaceClassName?: string;
}) {
  return <AuthShellServer activePath={activePath} contentSurfaceClassName={contentSurfaceClassName}>{children}</AuthShellServer>;
}
