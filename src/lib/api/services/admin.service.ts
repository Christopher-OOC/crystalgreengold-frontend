// src/api/services/admin.service.ts

import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Member } from '@/lib/types/member.types';

export interface SystemSetting {
  id: string;
  name: string;
  value: string;
  description?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AdminUser {
  id: string;
  memberId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  enabled: boolean;
  roles: { id: number; name: string }[];
  createdAt?: string;
  lastLogin?: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  password?: string;
  role: 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';
}

export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  businessName?: string;
  address?: string;
}

function mapToAdminUser(raw: any): AdminUser {
  return {
    id: raw.memberId,
    memberId: raw.memberId,
    username: raw.username,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    enabled: raw.enabled ?? true,
    roles: raw.roles || [],
    createdAt: raw.createdAt || raw.registeredOn,
    lastLogin: raw.lastLogin,
  };
}

export const adminService = {
  /**
   * GET /api/v1/members/admins
   * Returns all members with ROLE_ADMIN or ROLE_SUPER_ADMIN
   */
  getAll: async (): Promise<AdminUser[]> => {
    // First get all members, then filter for admin roles
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.BASE, {
      params: { page: 1, size: 100 }
    });
    const allMembers = data.data || data;
    
    // Filter members with admin roles
    const admins = allMembers.filter((member: any) => 
      member.roles?.some((r: any) => r.name === 'ROLE_ADMIN' || r.name === 'ROLE_SUPER_ADMIN')
    );
    
    return admins.map(mapToAdminUser);
  },

  /**
   * GET /api/v1/members/:memberId
   * Get single admin by ID
   */
  getById: async (memberId: string): Promise<AdminUser> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.BY_ID(memberId));
    return mapToAdminUser(data.data || data);
  },

  /**
   * POST /api/v1/members
   * Create a new admin user
   */
  create: async (req: CreateAdminRequest): Promise<AdminUser> => {
    const body = {
      username: req.username,
      email: req.email,
      firstName: req.firstName ?? '',
      lastName: req.lastName ?? '',
      phoneNumber: req.phoneNumber,
      password: req.password,
      memberType: req.role === 'ROLE_SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
    };

    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.BASE, body);
    return mapToAdminUser(data.data || data);
  },

  /**
   * PUT /api/v1/admins/update-member-info/:memberId
   * Update admin information
   */
  update: async (memberId: string, req: UpdateAdminRequest): Promise<AdminUser> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_MEMBER_INFO(memberId),
      req
    );
    return mapToAdminUser(data.data || data);
  },

  /**
   * PUT /api/v1/admins/:memberId/members?enabled=false
   * Deactivate/reactivate an admin
   */
  toggleStatus: async (memberId: string, enabled: boolean): Promise<AdminUser> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_MEMBER(memberId),
      null,
      { params: { enabled } }
    );
    return mapToAdminUser(data.data || data);
  },

  updateMemberRoleAndEnabled: async (
    memberId: string,
    role: 'ROLE_ADMIN' | 'ROLE_PREMIUM_STORE' | 'ROLE_SERVICE_CENTER',
    enabled: boolean,
  ): Promise<AdminUser> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_MEMBER(memberId),
      null,
      { params: { role, enabled } }
    );
    return mapToAdminUser(data.data || data);
  },

  /**
   * PUT /api/v1/admins/:memberId/role
   * Update admin role
   */
  updateRole: async (memberId: string, roleId: number): Promise<AdminUser> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_ROLE(memberId),
      { roleId }
    );
    return mapToAdminUser(data.data || data);
  },

  loginAsUser: async (memberId: string, adminId: string): Promise<{ token: string; refreshToken?: string | null; member?: Partial<Member> | null }> => {
    // Try GET first as it's the more common method for session creation via path params
    const { data } = await apiClient.get(
      ENDPOINTS.ADMIN.LOGIN_AS_USER(adminId, memberId)
    );
    const payload = data?.data ?? data ?? {};
    const payloadObject: Record<string, any> = typeof payload === 'object' && payload !== null ? payload : {};
    const member = payloadObject.member || payloadObject.user || (
      payloadObject.id || payloadObject.memberId || payloadObject.username ? payloadObject : null
    );

    return {
      token: payloadObject.token || payloadObject.accessToken || payloadObject.access_token,
      refreshToken: payloadObject.refreshToken || payloadObject.refresh_token || null,
      member,
    };
  },

  /**
   * GET /api/v1/admins/settings
   * Fetch all system settings
   */
  getSettings: async (): Promise<SystemSetting[]> => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.SETTINGS);
    const raw = data.data ?? data;
    return Array.isArray(raw) ? raw : [];
  },

  /**
   * PUT /api/v1/admins/settings/:id
   * Update a single system setting by its id
   */
  updateSetting: async (id: string, value: string): Promise<SystemSetting> => {
    const { data } = await apiClient.put(ENDPOINTS.ADMIN.SETTING_BY_ID(id), { value });
    return data.data ?? data;
  },

  updateAllSettings: async (settings: { id: number; value: number }[]): Promise<void> => {
    await apiClient.put(ENDPOINTS.ADMIN.SETTINGS, settings);
  },
};
