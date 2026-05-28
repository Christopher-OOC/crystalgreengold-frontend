import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { EarnedPromo } from '@/lib/types/promotion.types';
import type { Bonus } from '@/lib/types/bonus.types';
import type { Transaction } from '@/lib/types/transaction.types';
import type { Payment, Payroll, Bank } from '@/lib/types/payment.types';
import type { AdminSettings, UpdateAdminSettingsRequest, UpdateMemberAdminRequest } from '@/lib/types/admin.types';
import type { StorePackage } from '@/lib/types/package.types';

// ── Earned Promotions ─────────────────────────────────────────────────────────

export const earnedPromoService = {
  getAll: async (page = 1, size = 10, hasReceived = 'ALL'): Promise<{ data: EarnedPromo[]; totalPages: number }> => {
    const { data } = await apiClient.get(
      `${ENDPOINTS.EARNED_PROMOS.BASE}?page=${page}&size=${size}&received=${hasReceived}`
    );
    return {
      data: data.data ?? [],
      totalPages: data.metadata?.totalPages ?? 1,
    };
  },

  getById: async (id: number): Promise<EarnedPromo> => {
    const { data } = await apiClient.get(ENDPOINTS.EARNED_PROMOS.BY_ID(String(id)));
    return data.data;
  },

  updateReceived: async (id: number, received: boolean): Promise<EarnedPromo> => {
    const { data } = await apiClient.put(
      `${ENDPOINTS.EARNED_PROMOS.BY_ID(String(id))}?received=${received}`
    );
    return data.data;
  },
};

// ── Bonuses / Earning Commissions ─────────────────────────────────────────────

export const bonusService = {
  getByMember: async (memberId: string): Promise<Bonus[]> => {
    const { data } = await apiClient.get(ENDPOINTS.BONUSES.BY_MEMBER(memberId));
    return data.data;
  },
};

// ── Transactions ──────────────────────────────────────────────────────────────

export const transactionService = {
  getByMember: async (memberId: string): Promise<Transaction[]> => {
    const { data } = await apiClient.get(ENDPOINTS.TRANSACTIONS.BY_MEMBER(memberId));
    return data.data;
  },
};

// ── Payments ──────────────────────────────────────────────────────────────────

export const paymentService = {
  getAllBanks: async (): Promise<Bank[]> => {
    const { data } = await apiClient.get(ENDPOINTS.PAYMENTS.ALL_BANKS);
    return data.data;
  },
  preparePayroll: async (): Promise<Payroll> => {
    const { data } = await apiClient.get(ENDPOINTS.PAYMENTS.PREPARE_PAYROLL);
    return data.data;
  },
  getPayroll: async (): Promise<Payroll> => {
    const { data } = await apiClient.get(ENDPOINTS.PAYMENTS.GET_PAYROLL);
    return data.data;
  },
  sendPayroll: async (payload: Payment): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.PAYMENTS.SEND_PAYROLL, payload);
    return data.data;
  },
  deletePayrollEntry: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PAYMENTS.DELETE_ENTRY(id));
  },
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminService = {
  updateMember: async (memberId: string, payload: UpdateMemberAdminRequest): Promise<unknown> => {
    const { data } = await apiClient.put(ENDPOINTS.ADMIN.UPDATE_MEMBER(memberId), payload);
    return data.data;
  },
  updateMemberInfo: async (memberId: string, payload: UpdateMemberAdminRequest): Promise<unknown> => {
    const { data } = await apiClient.put(ENDPOINTS.ADMIN.UPDATE_MEMBER_INFO(memberId), payload);
    return data.data;
  },
  getSettings: async (): Promise<AdminSettings[]> => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.SETTINGS);
    return data.data;
  },
  updateSettings: async (payload: UpdateAdminSettingsRequest): Promise<AdminSettings> => {
    const { data } = await apiClient.put(ENDPOINTS.ADMIN.SETTINGS, payload);
    return data.data;
  },
  getSettingById: async (id: string): Promise<AdminSettings> => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.SETTING_BY_ID(id));
    return data.data;
  },
  getSettingByName: async (name: string): Promise<AdminSettings> => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.SETTING_BY_NAME(name));
    return data.data;
  },
  loginAsUser: async (memberId: string, adminId: string): Promise<unknown> => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.LOGIN_AS_USER(adminId, memberId));
    return data.data;
  },
};

// ── Store Packages ────────────────────────────────────────────────────────────

export const storePackageService = {
  getById: async (id: string): Promise<StorePackage> => {
    const { data } = await apiClient.get(ENDPOINTS.STORE_PACKAGES.BY_ID(id));
    return data.data;
  },
  getByStore: async (storeId: string): Promise<StorePackage[]> => {
    const { data } = await apiClient.get(ENDPOINTS.STORE_PACKAGES.BY_STORE(storeId));
    return data.data;
  },
};

// ── Files ─────────────────────────────────────────────────────────────────────

export const fileService = {
  getOrderResource: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(ENDPOINTS.FILES.ORDER_RESOURCE(id), {
      responseType: 'blob',
    });
    return data;
  },
};
