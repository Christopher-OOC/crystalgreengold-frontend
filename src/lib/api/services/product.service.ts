

import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Product } from '@/lib/types/product.types';

export const productService = {

  getAll: async (page?: number, size?: number, search?: string, categoryId?: string): Promise<{ data: Product[]; totalPages: number; totalElements: number }> => {
    let url = ENDPOINTS.PRODUCTS.BASE;
    const params = new URLSearchParams();

    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    if (search !== undefined && search.trim().length > 0) {
      params.append('search', search.trim());
    }
    if (categoryId !== undefined && categoryId !== '') {
      params.append('categoryId', categoryId);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const { data } = await apiClient.get(url);

    // Handle both { data: [...], metadata: {} } and plain array [...]
    const items = Array.isArray(data) ? data : (data?.data ?? []);
    const metadata = data?.metadata ?? {};

    return {
      data: items,
      totalPages: metadata.totalPages ?? 1,
      totalElements: metadata.totalNumberOfElements ?? items.length,
    };
  },

  getById: async (productId: string): Promise<Product> => {
    const { data } = await apiClient.get(ENDPOINTS.PRODUCTS.BY_ID(productId));
    return data.data;
  },

  getDiscounted: async (): Promise<Product[]> => {
    const { data } = await apiClient.get(ENDPOINTS.PRODUCTS.DISCOUNTED);
    return data.data;
  },

  getStoreByMember: async (memberId: string): Promise<Product[]> => {
    const { data } = await apiClient.get(ENDPOINTS.PRODUCTS.STORE_BY_MEMBER(memberId));
    return data.data;
  },

  getStoreProduct: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(ENDPOINTS.PRODUCTS.STORE_PRODUCT(id));
    return data.data;
  },

  create: async (formData: FormData): Promise<Product> => {
    const { data } = await apiClient.post(ENDPOINTS.PRODUCTS.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (productId: string, formData: FormData): Promise<Product> => {
    const { data } = await apiClient.put(ENDPOINTS.PRODUCTS.BY_ID(productId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  delete: async (productId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PRODUCTS.BY_ID(productId));
  },
};