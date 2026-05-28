import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Rank, CreateRankRequest, UpdateRankRequest } from '@/lib/types/rank.types';

export const rankService = {
  getAll: async (): Promise<Rank[]> => {
    const { data } = await apiClient.get(ENDPOINTS.RANKS.BASE);
    return data.data;
  },

  getById: async (id: string): Promise<Rank> => {
    const { data } = await apiClient.get(ENDPOINTS.RANKS.BY_ID(id));
    return data.data;
  },

  create: async (payload: CreateRankRequest): Promise<Rank> => {
    const { data } = await apiClient.post(ENDPOINTS.RANKS.BASE, payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateRankRequest): Promise<Rank> => {
    const { data } = await apiClient.put(ENDPOINTS.RANKS.BY_ID(String(id)), payload);
    return data.data;
  },
};