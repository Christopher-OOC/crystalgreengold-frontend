// src/api/services/service-center.service.ts

import apiClient from '@/lib/api/client';   // your axios instance with JWT interceptor
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ServiceCenter, CreateServiceCenterRequest, UpdateServiceCenterRequest } from '@/lib/types/service-center.types';


function mapToServiceCenter(raw: any): ServiceCenter {
  return {
    memberId:          raw.memberId,
    username:          raw.username,
    firstName:         raw.firstName,
    lastName:          raw.lastName,
    email:             raw.email,
    phoneNumber:       raw.phoneNumber,
    address:           raw.address,
    businessName:      raw.businessName,
    storeDescription:  raw.storeDescription,
    image:             raw.image ?? raw.profileImageUrl,
    sponsorId:         raw.sponsorId,
    placerId:          raw.placerId,
    sponsorUsername:   raw.sponsorUsername,
    placerUsername:    raw.placerUsername,
    registeredOn:      raw.registeredOn,
    enabled:           raw.enabled ?? true,
    canReceivePayment: raw.canReceivePayment ?? false,
    availableBalance:  raw.availableBalance ?? 0,
    accountDetails:    raw.accountDetails,
    roles:             raw.roles,
  };
}

// ─── service ─────────────────────────────────────────────────────────────────

export const serviceCenterService = {

  /**
   * GET /api/v1/members/service-centers
   * Returns all members with ROLE_SERVICE_CENTER.
   */
  getAll: async (): Promise<ServiceCenter[]> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.SERVICE_CENTERS);
    // backend wraps in ApiResponse: { status, message, data, metadata }
    const list: any[] = data.data ?? data;
    return list.map(mapToServiceCenter);
  },

  /**
   * GET /api/v1/members/:memberId
   * Single local center by memberId.
   */
  getById: async (memberId: string): Promise<ServiceCenter> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.BY_ID(memberId));
    return mapToServiceCenter(data.data ?? data);
  },

  /**
   * POST /api/v1/members?sponsor=&placer=&leg=
   *
   * Body  → MemberCreateRequest  (username, email, firstName, lastName,
   *                                phoneNumber, address, businessName,
   *                                memberType: "SERVICE_CENTER")
   * Params → sponsor / placer / leg   (only sent when all three are present)
   */
  create: async (req: CreateServiceCenterRequest): Promise<ServiceCenter> => {
    const body = {
      username:     req.username,
      email:        req.email,
      firstName:    req.firstName ?? '',
      lastName:     req.lastName  ?? '',
      phoneNumber:  req.phoneNumber,
      address:      req.address,
      businessName: req.businessName,
      memberType:   'SERVICE_CENTER',   // tells the backend which role to assign
    };

    // Only attach MLM placement params when all three are provided
    const hasPlacement =
      req.sponsorId?.trim() &&
      req.placementId?.trim() &&
      req.leg;

    const params = hasPlacement
      ? { sponsor: req.sponsorId, placer: req.placementId, leg: req.leg }
      : {};

    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.BASE, body, { params });
    return mapToServiceCenter(data.data ?? data);
  },

  /**
   * PUT /api/v1/admins/update-member-info/:memberId
   * Update personal / business info for an existing local center.
   */
  update: async (
    memberId: string,
    req: UpdateServiceCenterRequest,
  ): Promise<ServiceCenter> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_MEMBER_INFO(memberId),
      req,
    );
    return mapToServiceCenter(data.data ?? data);
  },

  /**
   * PUT /api/v1/admins/:memberId/members?enabled=false
   * Deactivate (soft-delete) a local center.
   * Pass enabled=true to re-activate.
   */
  toggleStatus: async (memberId: string, enabled: boolean): Promise<ServiceCenter> => {
    const { data } = await apiClient.put(
      ENDPOINTS.ADMIN.UPDATE_MEMBER(memberId),
      null,
      { params: { enabled } },   // role param is omitted → backend keeps existing role
    );
    return mapToServiceCenter(data.data ?? data);
  },

  /**
   * PUT /api/v1/members/:memberId/add-store-info
   * Update business name + address via the member's own endpoint.
   */
  updateStoreInfo: async (
    memberId: string,
    businessName: string,
    address: string,
  ): Promise<ServiceCenter> => {
    const { data } = await apiClient.post(
      ENDPOINTS.MEMBERS.ADD_STORE_INFO(memberId),
      { businessName, address },
    );
    return mapToServiceCenter(data.data ?? data);
  },
};