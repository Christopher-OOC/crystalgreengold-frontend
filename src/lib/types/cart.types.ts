// types/cart.types.ts
import type { Product } from '@/lib/types/product.types';

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  memberId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}