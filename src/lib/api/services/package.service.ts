import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Package } from '@/lib/types/package.types';

export const packageService = {
  getAll: async (storeId?: string | null): Promise<Package[]> => {
    const url = storeId ? ENDPOINTS.STORE_PACKAGES.BY_STORE(String(storeId)) : ENDPOINTS.PACKAGES.BASE;
    const { data } = await apiClient.get(url);
    return data.data;
  },

  getById: async (packageId: string | number): Promise<Package> => {
    const { data } = await apiClient.get(ENDPOINTS.PACKAGES.BY_ID(String(packageId)));
    return data.data;
  },

  create: async (formData: FormData): Promise<Package> => {
    const { data } = await apiClient.post(ENDPOINTS.PACKAGES.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (packageId: string | number, formData: FormData): Promise<Package> => {
    const { data } = await apiClient.put(ENDPOINTS.PACKAGES.BY_ID(String(packageId)), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  delete: async (packageId: string | number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PACKAGES.BY_ID(String(packageId)));
  },
};
