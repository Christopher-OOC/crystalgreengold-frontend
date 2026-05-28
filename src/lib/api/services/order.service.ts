import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Order, CreateOrderRequest, UpdateOrderRequest, ValidateOrderRequest } from '@/lib/types/order.types';

export const orderService = {

  getAll: async (): Promise<Order[]> => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS.ALL_ORDERS);
    return data.data || data;
  },

  getByMember: async (memberId: string): Promise<Order[]> => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS.BY_MEMBER(memberId));
    return data.data || data;
  },

  getByIdAndMember: async (orderId: string, memberId: string): Promise<Order> => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS.BY_ID_AND_MEMBER(orderId, memberId));
    return data.data || data;
  },

  getManagedOrders: async (storeId: string): Promise<Order[]> => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS.MANAGE(storeId));
    return data.data || data;
  },

  create: async (memberId: string, payload: CreateOrderRequest): Promise<Order> => {
    const { data } = await apiClient.post(ENDPOINTS.ORDERS.CREATE(memberId), payload);
    return data.data || data;
  },

  validate: async (memberId: string, payload: ValidateOrderRequest): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.ORDERS.VALIDATE(memberId), payload);
    return data.data || data;
  },

  update: async (orderId: string, memberId: string, payload: UpdateOrderRequest): Promise<Order> => {
    const { data } = await apiClient.put(ENDPOINTS.ORDERS.UPDATE(orderId, memberId), payload);
    return data.data || data;
  },

  confirm: async (orderId: string, memberId: string): Promise<Order> => {
    const { data } = await apiClient.put(ENDPOINTS.ORDERS.CONFIRM(orderId, memberId), {});
    return data.data || data;
  },
};