'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Cart, CartItem } from '@/lib/types/cart.types';

// ─── State & Actions ──────────────────────────────────────────────────────────

interface CartState {
  cart: Cart | null;
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // optimistic local actions (call API first, then these)
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
}

const computeTotals = (items: CartItem[]) => ({
  itemCount:   items.reduce((sum, i) => sum + i.quantity, 0),
  totalAmount: items.reduce((sum, i) => sum + i.totalPrice, 0),
});

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      cart:        null,
      itemCount:   0,
      totalAmount: 0,
      isLoading:   false,
      error:       null,

      setCart: (cart) =>
        set({ cart, ...computeTotals(cart.items), error: null }),

      clearCart: () =>
        set({ cart: null, itemCount: 0, totalAmount: 0 }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      incrementItem: (productId) => {
        const cart = get().cart;
        if (!cart) return;
        const items = cart.items.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
            : i,
        );
        const updated = { ...cart, items };
        set({ cart: updated, ...computeTotals(items) });
      },

      decrementItem: (productId) => {
        const cart = get().cart;
        if (!cart) return;
        const items = cart.items
          .map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity - 1, totalPrice: (i.quantity - 1) * i.unitPrice }
              : i,
          )
          .filter((i) => i.quantity > 0);
        const updated = { ...cart, items };
        set({ cart: updated, ...computeTotals(items) });
      },

      removeItem: (productId) => {
        const cart = get().cart;
        if (!cart) return;
        const items = cart.items.filter((i) => i.productId !== productId);
        const updated = { ...cart, items };
        set({ cart: updated, ...computeTotals(items) });
      },
    }),
    {
      name:       'crystalgreengold-cart',
      storage:    createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart, itemCount: state.itemCount, totalAmount: state.totalAmount }),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCart        = (s: CartState & CartActions) => s.cart;
export const selectItemCount   = (s: CartState & CartActions) => s.itemCount;
export const selectTotalAmount = (s: CartState & CartActions) => s.totalAmount;
export const selectCartItems   = (s: CartState & CartActions) => s.cart?.items ?? [];
