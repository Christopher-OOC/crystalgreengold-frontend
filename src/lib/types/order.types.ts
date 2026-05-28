// types/order.types.ts
import type { MemberType } from '@/lib/types/member.types';
import type { Transaction } from '@/lib/types/misc.types';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SUCCESS';

export interface OrderItem {
  id?: string | number;
  productId?: string;
  productName?: string;
  name?: string;
  description?: string;
  image?: string;
  bv?: number;
  pv?: number;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  subtotal?: number;
  quantity: number;
  remainingOrderQuantity?: number;
  categoryName?: string;
  category?: string;
  store?: {
    id?: string;
    name?: string;
    phoneNumber?: string;
  };
  packageItems?: string[];
  directCommissionRate?: number;
  binaryCommissionRate?: number;
  dailyCapping?: number;
}

export interface Order {
  id?: string;
  orderId?: string;
  memberId?: string;
  memberType?: MemberType;
  orderItems?: OrderItem[];
  items?: OrderItem[];
  orderStatus?: OrderStatus;
  status?: OrderStatus;
  orderDate?: string;
  createdAt?: string;
  updatedAt?: string;
  orderType?: string;
  address?: string;
  phoneNumber?: string;
  totalAmount?: number;
  amount?: number;
  pdfText?: string;
  transaction?: Transaction;
  confirmation?: 'CONFIRMED' | 'NOT_CONFIRMED' | string;
  paystackReference?: string;
}

export interface CreateOrderRequest {
  memberType?: MemberType;
  address?: string;
  phoneNumber?: string;
  items: OrderItem[];
  totalAmount?: number;
  status?: OrderStatus;
}

export interface UpdateOrderRequest {
  address?: string;
  phoneNumber?: string;
  status?: OrderStatus;
  paystackReference?: string;
}

export interface ValidateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}
