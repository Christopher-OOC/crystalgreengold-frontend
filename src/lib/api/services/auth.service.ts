// src/api/services/auth.service.ts
import axios from 'axios';
import apiClient, { tokenStorage } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { LoginRequest, LoginResponse, RefreshResponse } from '@/lib/types/auth.types';
import publicClient from '@/lib/api/publicClient';

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    console.log('Attempting login with:', payload.username);
    
    let data: any;
    try {
      // Step 1: Login to get tokens
      const response = await publicClient.post<any>(ENDPOINTS.AUTH.LOGIN, payload);
      data = response.data;
      console.log('Login response received:', data);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
    
    // Step 2: Store tokens
    const accessToken = data.access_token || data.accessToken;
    const refreshToken = data.refresh_token || data.refreshToken;
    
    if (!accessToken) {
      throw new Error('No access token in response');
    }
    
    tokenStorage.setTokens(accessToken, refreshToken);

    try {
      // Parse token
const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
console.log('Token payload:', tokenPayload);

// Map to your MemberType helper
const getMemberType = (roles: any[]) => {
  if (!Array.isArray(roles)) return 'REGULAR_MEMBER';
  
  // Extract names from array of strings OR array of objects { name: '...' }
  const names = roles.map(r => {
    if (typeof r === 'string') return r.toUpperCase();
    if (r && typeof r === 'object') return (r.name || r.authority || '').toUpperCase();
    return '';
  });

  console.log('Normalized role names:', names);

  if (names.includes('ROLE_SUPER_ADMIN') || names.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
  if (names.includes('ROLE_ADMIN') || names.includes('ADMIN')) return 'ADMIN';
  if (names.includes('ROLE_PREMIUM_STORE') || names.includes('PREMIUM_STORE')) return 'PREMIUM_STORE';
  if (names.includes('ROLE_SERVICE_CENTER') || names.includes('SERVICE_CENTER')) return 'SERVICE_CENTER';
  
  return 'REGULAR_MEMBER';
};

// Extract roles from token or response data
const tokenRoles = tokenPayload.roles || tokenPayload.authorities || tokenPayload.scope || [];
const bodyRoles = data.roles || data.authorities || [];
const combinedRoles = [...(Array.isArray(tokenRoles) ? tokenRoles : []), ...(Array.isArray(bodyRoles) ? bodyRoles : [])];

// Build the member object
const realMemberId = data.memberId || data.member_id || data.userId || data.user_id || tokenPayload.id || tokenPayload.userId || tokenPayload.sub;

const member = {
  ...(data.member || {}),
  id: realMemberId,
  username: data.username || tokenPayload.sub,
  firstName: data.firstName || data.first_name || tokenPayload.sub,
  lastName: data.lastName || data.last_name || '',
  email: data.email || `${tokenPayload.sub}@gmail.com`,
  memberType: data.memberType || data.member_type || getMemberType(combinedRoles),
};
      
return {
  accessToken,
  refreshToken,
  member,
};

    } catch (error) {
      console.error('Error parsing token:', error);
      return {
        accessToken,
        refreshToken,
        member: null,
      };
    }
  },

  refresh: async (): Promise<RefreshResponse> => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const { data } = await apiClient.post<any>(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    const newAccessToken = data.access_token || data.accessToken;
    tokenStorage.setAccess(newAccessToken);
    
    return {
      accessToken: newAccessToken,
      refreshToken: data.refresh_token || data.refreshToken,
    };
  },

  logout: (): void => {
    tokenStorage.clearTokens();
    console.log('Logged out, tokens cleared');
  },

  isAuthenticated: (): boolean => {
    const hasToken = !!tokenStorage.getAccess();
    console.log('isAuthenticated check:', hasToken);
    return hasToken;
  },
};

function getAuthErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
  }

  if (error.response?.status === 401) {
    return 'Invalid username or password.';
  }

  const data = error.response?.data as { message?: string; error?: string } | undefined;
  return data?.message || data?.error || 'Unable to sign in. Please try again.';
}
