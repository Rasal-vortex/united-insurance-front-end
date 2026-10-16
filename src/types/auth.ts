export type UserRole = 'ADMIN' | 'BRANCH';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  designation?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface BranchLoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
