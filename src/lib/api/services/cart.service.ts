import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Cart, AddToCartRequest, UpdateCartRequest } from '@/lib/types/cart.types';

const normalizeCart = (payload: any): Cart => {
  if (!payload) {
    return { id: '', memberId: '', items: [], totalAmount: 0 };
  }

  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data as Cart;
  }

  return payload as Cart;
};

export const cartService = {

  getByMember: async (memberId: string): Promise<Cart> => {
    const { data } = await apiClient.get(ENDPOINTS.CART.BY_MEMBER(memberId));
    return normalizeCart(data);
  },

  addToCart: async (memberId: string, payload: AddToCartRequest): Promise<Cart> => {
    const { data } = await apiClient.post(ENDPOINTS.CART.ADD_TO_CART(memberId), payload);
    return normalizeCart(data);
  },

  update: async (memberId: string, payload: UpdateCartRequest): Promise<Cart> => {
    const { data } = await apiClient.put(ENDPOINTS.CART.BY_MEMBER(memberId), payload);
    return normalizeCart(data);
  },

  clear: async (memberId: string): Promise<void> => {
    const cart = await cartService.getByMember(memberId);
    const cartItems = Array.isArray(cart)
      ? cart
      : (cart as any)?.cartItems ?? (cart as any)?.items ?? [];

    for (const item of cartItems) {
      const cartItemId = Number(item?.id ?? item?.cartItemId);
      if (Number.isInteger(cartItemId)) {
        await apiClient.delete(ENDPOINTS.CART.BY_MEMBER(memberId), {
          params: { cartItemId },
        });
      }
    }
  },
};
