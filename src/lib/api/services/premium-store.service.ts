// src/api/services/premium-store.service.ts

import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export interface PremiumStore {
  id: string;
  memberId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  businessName?: string;
  storeDescription?: string;
  enabled: boolean;
  availableBalance: number;
  totalSales?: number;
  totalOrders?: number;
  rating?: number;
  registeredOn?: string;
  sponsorUsername?: string;
  placerUsername?: string;
}

export interface CreatePremiumStoreRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  businessName?: string;
  sponsorId?: string;
  placementId?: string;
  leg?: 'LEFT' | 'RIGHT';
}

export interface UpdatePremiumStoreRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  businessName?: string;
  storeDescription?: string;
}

function mapToPremiumStore(raw: any): PremiumStore {
  return {
    id: raw.memberId,
    memberId: raw.memberId,
    username: raw.username,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    address: raw.address,
    businessName: raw.businessName,
    storeDescription: raw.storeDescription,
    enabled: raw.enabled ?? true,
    availableBalance: raw.availableBalance ?? 0,
    totalSales: raw.totalSales ?? 0,
    totalOrders: raw.totalOrders ?? 0,
    rating: raw.rating ?? 5.0,
    registeredOn: raw.registeredOn,
    sponsorUsername: raw.sponsorUsername,
    placerUsername: raw.placerUsername,
  };
}

export const premiumStoreService = {
  /**
   * GET /api/v1/members/premium-stores
   * Returns all members with ROLE_PREMIUM_STORE
   */
  getAll: async (): Promise<PremiumStore[]> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.PREMIUM_STORES);
    // Handle both wrapped and unwrapped responses
    const list: any[] = data.data ?? data;
    return Array.isArray(list) ? list.map(mapToPremiumStore) : [];
  },

  /**
   * GET /api/v1/members/:memberId
   * Get single state center by ID
   */
  getById: async (memberId: string): Promise<PremiumStore> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.BY_ID(memberId));
    return mapToPremiumStore(data.data ?? data);
  },

  /**
   * POST /api/v1/members
   * Create a new state center
   */
  create: async (req: CreatePremiumStoreRequest): Promise<PremiumStore> => {
    const body = {
      username: req.username,
      email: req.email,
      firstName: req.firstName ?? '',
      lastName: req.lastName ?? '',
      phoneNumber: req.phoneNumber,
      address: req.address,
      businessName: req.businessName,
      memberType: 'PREMIUM_STORE',
    };

    // Only attach MLM placement params when all three are provided
    const hasPlacement = req.sponsorId?.trim() && req.placementId?.trim() && req.leg;
    const params = hasPlacement
      ? { sponsor: req.sponsorId, placer: req.placementId, leg: req.leg }
      : {};

    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.BASE, body, { params });
    return mapToPremiumStore(data.data ?? data);
  },

  /**
   * PUT /api/v1/admins/update-member-info/:memberId
   * Update state center information
   */
  update: async (memberId: string, req: UpdatePremiumStoreRequest): Promise<PremiumStore> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_MEMBER_INFO(memberId),
      req
    );
    return mapToPremiumStore(data.data ?? data);
  },

  /**
   * PUT /api/v1/admins/:memberId/members?enabled=false
   * Deactivate/reactivate a state center
   */
  toggleStatus: async (memberId: string, enabled: boolean): Promise<PremiumStore> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_MEMBER(memberId),
      null,
      { params: { enabled } }
    );
    return mapToPremiumStore(data.data ?? data);
  },
};
