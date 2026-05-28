// src/api/services/category.service.ts

import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/types/category.types';

export const categoryService = {

  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CATEGORIES.BASE);
    
    // Handle both wrapped and unwrapped responses
    const categories = data.data || data;
    return Array.isArray(categories) ? categories : [];
  },

  getById: async (categoryId: string): Promise<Category> => {
    const { data } = await apiClient.get(ENDPOINTS.CATEGORIES.BY_ID(categoryId));
    return data.data || data;
  },

  create: async (payload: CreateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.post(ENDPOINTS.CATEGORIES.BASE, payload);
    return data.data || data;
  },

  update: async (categoryId: string, payload: UpdateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.put(ENDPOINTS.CATEGORIES.BY_ID(categoryId), payload);
    return data.data || data;
  },

  delete: async (categoryId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.CATEGORIES.BY_ID(categoryId));
  },
};
