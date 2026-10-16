import { UserRole, AuthUser } from '@/types/auth';

export const PERMISSIONS = {
  CAN_MANAGE_BRANCHES: (user: AuthUser | null) => user?.role === 'ADMIN',
  CAN_CREATE_BRANCH: (user: AuthUser | null) => user?.role === 'ADMIN',
  CAN_VIEW_ALL_BRANCHES: (user: AuthUser | null) => user?.role === 'ADMIN',
  CAN_MANAGE_STAFF: (user: AuthUser | null) => !!user,
  CAN_MANAGE_POLICIES: (user: AuthUser | null) => !!user,
  CAN_MANAGE_CLAIMS: (user: AuthUser | null) => !!user,
  CAN_UPLOAD_DOCUMENTS: (user: AuthUser | null) => !!user,
  CAN_VIEW_REPORTS: (user: AuthUser | null) => !!user,
};

export function canAccessRoute(role: UserRole | undefined, pathname: string): boolean {
  if (!role) return false;
  if (pathname.startsWith('/admin')) {
    return role === 'ADMIN';
  }
  return true;
}
