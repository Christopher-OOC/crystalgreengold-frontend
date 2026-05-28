import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Clock,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';

import { OrderDetails } from '@/features/commerce/orders/OrderDetails';
import { useAuthStore, selectMember } from '@/lib/store/authStore';
import { orderService } from '@/lib/api/services/order.service';
import { formatCurrency } from '@/lib/utils/format';
import type { Order } from '@/lib/types/order.types';

const wideTrackingStyle: React.CSSProperties = { letterSpacing: '0.12em' };

const getOrderKey = (order: Order, index: number) => {
  const orderId = order.id ? String(order.id) : 'missing-id';
  const reference = order.paystackReference || order.createdAt || order.updatedAt || 'no-reference';
  return `order-${orderId}-${reference}-${index}`;
};

interface OrderHistoryProps {
  initialShowDetails?: boolean;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ initialShowDetails }) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('All Orders');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const member = useAuthStore(selectMember);

  const fetchData = async () => {
    if (!member?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getByMember(member.id);
      setOrders(Array.isArray(data) ? data : []);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err?.response?.data?.message || err.message || "Failed to retrieve order history. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [member?.id]);

  if (selectedOrder) {
    return <OrderDetails order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Order History Error"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Order History</h2>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium">View and manage your past orders</p>
      </div>

      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-400 uppercase" style={wideTrackingStyle}>Order Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-medium"
            >
              <option>All Orders</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-400 uppercase" style={wideTrackingStyle}>From Date</label>
            <div className="relative">
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-400 uppercase" style={wideTrackingStyle}>To Date</label>
            <div className="relative">
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <Button className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-bold transition-all shadow-lg">
            Apply Filters
          </Button>
        </div>

        <div className="mt-10 space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={getOrderKey(order, index)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-white dark:bg-emerald-950/50 border border-emerald-50 dark:border-white/5 rounded-[2rem] p-8 hover:shadow-xl hover:border-amber-400/20 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black text-emerald-950 dark:text-white">Order #{order.id}</h3>
                    <span style={wideTrackingStyle} className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                      order.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' :
                      order.status === 'CANCELLED' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500' :
                      'bg-amber-100 dark:bg-amber-400/10 text-amber-400 dark:text-amber-400'
                    }`}>
                      {order.status}
                    </span>
                    <span style={wideTrackingStyle} className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                      order.confirmation === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' :
                      'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500'
                    }`}>
                      {order.confirmation || 'NOT_CONFIRMED'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-emerald-400">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span className="text-xs font-bold">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package size={16} />
                      <span className="text-xs font-bold">{order.items?.length || 0} items</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1" style={wideTrackingStyle}>Total Amount</p>
                    <p className="text-2xl font-black text-emerald-950 dark:text-white">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center space-x-2 px-6 py-3 border border-emerald-100 dark:border-white/10 rounded-2xl text-emerald-700 dark:text-emerald-200 hover:bg-amber-400 hover:text-white hover:border-amber-400 transition-all font-bold text-sm"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-emerald-400 uppercase" style={wideTrackingStyle}>Showing page 1 of 1</p>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-xl border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 bg-amber-400 text-white rounded-xl font-bold shadow-lg shadow-amber-400/20">
              1
            </button>
            <button className="p-2 rounded-xl border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
