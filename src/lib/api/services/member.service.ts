import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Member, CreateMemberRequest, UpdateMemberRequest, GenealogyNode, AnalysisData, AccountDetails, ForgotPasswordRequest, AddRootsRequest, AddStoreInfoRequest, AddAccountDetailsRequest, ChangePasswordRequest, TransferFundsRequest, BuyPackageRequest } from '@/lib/types/member.types';

export const memberService = {

  getAll: async (page = 1, size = 10, search = '', role = 'ALL', sortByBv = 'ALL', enabled = 'ALL'): Promise<{ data: Member[]; totalPages: number; totalElements: number }> => {
    const { data } = await apiClient.get(
      `${ENDPOINTS.MEMBERS.BASE}?page=${page}&size=${size}&search=${search}&role=${role}&sortByBv=${sortByBv}&enabled=${enabled}`
    );
    return {
      data: data.data ?? [],
      totalPages: data.metadata?.totalPages ?? 1,
      totalElements: data.metadata?.totalNumberOfElements ?? 0,
    };
  },

  getById: async (memberId: string): Promise<Member> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.BY_ID(memberId));
    return data.data ?? data;
  },

  checkUsername: async (username: string): Promise<any> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.CHECK_USERNAME(username));
    return data.data;
  },

  getServiceCenters: async (): Promise<Member[]> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.SERVICE_CENTERS);
    return data.data;
  },

  getPremiumStores: async (): Promise<Member[]> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.PREMIUM_STORES);
    return data.data;
  },

  getGenealogy: async (memberId: string): Promise<GenealogyNode> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.GENEALOGY(memberId));
    return data.data;
  },

  getAnalysis: async (memberId: string): Promise<AnalysisData> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.ANALYSIS(memberId));
    return data.data;
  },

  getAccountDetails: async (memberId: string): Promise<AccountDetails> => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS.ACCOUNT_DETAILS(memberId));
    return data.data;
  },

  // create: async (payload: CreateMemberRequest): Promise<Member> => {
  //   const { data } = await apiClient.post(ENDPOINTS.MEMBERS.BASE, payload);
  //   return data.data;
  // },

  create: async (payload: CreateMemberRequest): Promise<Member> => {
  const { sponsorId, placementId, leg, ...body } = payload;
  const { data } = await apiClient.post(
    `${ENDPOINTS.MEMBERS.BASE}?sponsor=${sponsorId}&placer=${placementId}&leg=${leg}`,
    body
  );
  return data.data;
},

  update: async (memberId: string, payload: UpdateMemberRequest): Promise<Member> => {
    const { data } = await apiClient.put(ENDPOINTS.ADMIN.UPDATE_MEMBER_INFO(memberId), payload);
    return data.data ?? data;
  },

  addRoots: async (memberId: string, payload: AddRootsRequest): Promise<unknown> => {
    const { data } = await apiClient.put(ENDPOINTS.MEMBERS.ADD_ROOTS(memberId), payload);
    return data.data;
  },

  transferFunds: async (memberId: string, payload: TransferFundsRequest): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.TRANSFER_FUNDS(memberId), payload);
    return data.data;
  },

  changePassword: async (memberId: string, payload: ChangePasswordRequest): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.CHANGE_PASSWORD(memberId), payload);
    return data.data;
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.FORGOT_PASSWORD, payload);
    return data.data;
  },

  buyPackage: async (memberId: string, payload: { packageId: number, quantity: number, storeId: string, txnReference: string }): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.BUY_PACKAGE(memberId), payload);
    return data.data;
  },

  activatePackage: async (memberId: string, payload: { packageId: number, storeId: string, txnReference: string }): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.ACTIVATE_PACKAGE(memberId), payload);
    return data.data;
  },

  addStoreInfo: async (memberId: string, payload: AddStoreInfoRequest): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.ADD_STORE_INFO(memberId), payload);
    return data.data;
  },

  addAccountDetails: async (memberId: string, payload: any): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS.ADD_ACCOUNT_DETAILS(memberId), payload);
    return data.data;
  },

  adminActivateMemberPackage: async (memberId: string, packageId: string | number): Promise<{ success: boolean; message: string }> => {
   const { data } = await apiClient.put(ENDPOINTS.ADMIN.ACTIVATE_MEMBER_PACKAGE(memberId, packageId ));
    return data.data ?? data;
  },
};
