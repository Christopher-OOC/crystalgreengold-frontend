import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Cart, AddToCartRequest, UpdateCartRequest } from '@/lib/types/cart.types';

export const cartService = {

  getByMember: async (memberId: string): Promise<Cart> => {
    const { data } = await apiClient.get<Cart>(ENDPOINTS.CART.BY_MEMBER(memberId));
    return data;
  },

  addToCart: async (memberId: string, payload: AddToCartRequest): Promise<Cart> => {
    const { data } = await apiClient.post<Cart>(ENDPOINTS.CART.ADD_TO_CART(memberId), payload);
    return data;
  },

  update: async (memberId: string, payload: UpdateCartRequest): Promise<Cart> => {
    const { data } = await apiClient.put<Cart>(ENDPOINTS.CART.BY_MEMBER(memberId), payload);
    return data;
  },

  clear: async (memberId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.CART.BY_MEMBER(memberId));
  },
};
