import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Promotion } from '@/lib/types/promotion.types';

export const promotionService = {
  getAll: async (): Promise<Promotion[]> => {
    const { data } = await apiClient.get(ENDPOINTS.PROMOTIONS.BASE);
    return data.data;
  },

  getById: async (id: string): Promise<Promotion> => {
    const { data } = await apiClient.get(ENDPOINTS.PROMOTIONS.BY_ID(id));
    return data.data;
  },

  create: async (formData: FormData): Promise<Promotion> => {
    const { data } = await apiClient.post(ENDPOINTS.PROMOTIONS.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (id: number, formData: FormData): Promise<Promotion> => {
    const { data } = await apiClient.put(ENDPOINTS.PROMOTIONS.BY_ID(String(id)), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PROMOTIONS.BY_ID(String(id)));
  },
};