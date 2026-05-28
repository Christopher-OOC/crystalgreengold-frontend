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
import { ManageOrderDetails } from '@/features/commerce/orders/ManageOrderDetails';
import { orderService } from '@/lib/api/services/order.service';
import { useAuth } from '../../auth/AuthContext';

// Orders will be loaded from the API

export const ManageOrders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('All Orders');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { member } = useAuth();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {


      let data: any[] = await orderService.getManagedOrders(member.memberId as string);

      setOrders(Array.isArray(data) ? data : (data ?? []));
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (selectedOrder) {
    return <ManageOrderDetails order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading manage orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Manage Orders Error"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Manage Orders</h2>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium">Oversee and update order statuses across your network</p>
      </div>

      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Order Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-medium"
            >
              <option>All Orders</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Declined</option>
              <option>Delivered</option>
              <option>Refunded</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">From Date</label>
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">To Date</label>
            <input 
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-medium"
            />
          </div>

          <Button onClick={fetchData} className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-bold transition-all shadow-lg">
            Apply Filters
          </Button>
        </div>

        <div className="mt-10 space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order.orderId ?? order.id ?? idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-white dark:bg-emerald-950/50 border border-emerald-50 dark:border-white/5 rounded-[2rem] p-8 hover:shadow-xl hover:border-amber-400/20 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black text-emerald-950 dark:text-white">Order #{order.orderId ?? order.id}</h3>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-400/10 text-amber-400 dark:text-amber-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                      {order.orderStatus ?? order.status}
                    </span>
                    <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                      {order.transaction?.status || order.confirmation || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-emerald-400">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span className="text-xs font-bold">{new Date(order.orderDate ?? order.createdAt ?? order.date ?? '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package size={16} />
                      <span className="text-xs font-bold">{order.orderItems?.length ?? order.items?.length ?? 0} items</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-emerald-950 dark:text-white">₦{(order.totalAmount ?? order.amount ?? 0).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center space-x-2 px-6 py-3 border border-emerald-100 dark:border-white/10 rounded-2xl text-emerald-700 dark:text-emerald-200 hover:bg-amber-400 hover:text-white hover:border-amber-400 transition-all font-bold text-sm"
                  >
                    <Eye size={18} />
                    <span>Manage Order</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};
