// types/auth.types.ts

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  member: Member;
  user?: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// import Member here to avoid circular — re-exported below
import type { Member } from '@/lib/types/member.types';