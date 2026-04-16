import type { AuthUser } from '@/lib/auth';

export function canAccessAccountingCenter(user: AuthUser | null) {
  return user?.role === 'admin';
}

export function canAccessSystemSettings(user: AuthUser | null) {
  return user?.role === 'admin';
}

export function isOwner(user: AuthUser | null) {
  return user?.isOwner === true;
}
