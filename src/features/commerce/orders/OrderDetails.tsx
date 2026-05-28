import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ShoppingBag, 
  AlertTriangle, 
  Calendar, 
  Package, 
  FileText, 
  Store,
  Phone,
  MapPin
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import type { Order } from '@/lib/types/order.types';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  const orderId = order.orderId ?? order.id;
  const orderDate = order.orderDate ?? order.createdAt ?? 'Unknown Date';
  const orderStatus = order.orderStatus ?? order.status ?? 'PENDING';
  const orderItems = order.orderItems ?? order.items ?? [];
  const totalAmount = order.totalAmount ?? order.amount ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Order Details</h2>
      </div>

      {/* Order Status Card */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Order #{orderId}</h3>
              <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} />
                  <span>Placed on {new Date(orderDate).toLocaleString()}</span>
                </div>
                {order.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} />
                    <span>{order.address}</span>
                  </div>
                )}
                {order.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone size={14} />
                    <span>{order.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest ${
              orderStatus === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' :
              'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500'
            }`}>
              {orderStatus}
            </span>
            <div className={`flex items-center space-x-2 px-4 py-1.5 text-xs font-black rounded-full border uppercase tracking-widest ${
              orderStatus === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-200' :
              'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200'
            }`}>
              <AlertTriangle size={14} className={orderStatus === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'} />
              <span>{orderStatus === 'COMPLETED' ? 'CONFIRMED' : 'NOT CONFIRMED'}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 space-y-8">
            <div className="flex items-center space-x-3">
              <Package className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Order Items (ACTIVATE PACKAGE)</h3>
            </div>

            <div className="space-y-8">
              {orderItems.map((item, idx) => (
                <div key={item.id ?? idx} className="flex flex-col md:flex-row gap-6">
                  <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-4 flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src={item.image || item.productId ? `https://picsum.photos/seed/${item.productId || item.id}/200/200` : 'https://picsum.photos/seed/order-item/200/200'} 
                      alt={item.name || item.productName || 'Order Item'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/order-item/200/200';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase">{item.name || item.productName || 'Order Item'}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                          {item.categoryName || item.category || 'Uncategorized'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1 text-[10px] font-bold text-slate-400">
                          <span>Qty: {item.quantity}</span>
                          {item.bv != null && <span>BV: {item.bv}</span>}
                          {item.pv != null && <span>PV: {item.pv}</span>}
                          {item.remainingOrderQuantity != null && <span>Remaining: {item.remainingOrderQuantity}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(item.totalPrice ?? item.price ?? 0)}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatCurrency(item.price ?? 0)} each</p>
                      </div>
                    </div>
                    {item.store?.name && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Store: {item.store.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Package Info Box */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                  <FileText size={18} className="text-slate-400" />
                  <span className="font-black text-sm uppercase tracking-widest">Package Information:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Daily Capping:</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">210000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Direct Commission:</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Binary Commission:</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">12%</span>
                  </div>
                </div>
              </div>

              {/* Store Info Box */}
              <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-500/10 space-y-4">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                  <Store size={18} className="text-indigo-400" />
                  <span className="font-black text-sm uppercase tracking-widest">Store Information:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Name:</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{orderItems[0]?.store?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Phone:</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{orderItems[0]?.store?.phoneNumber || order.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Amount</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</span>
              </div>
              {order.orderType && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Order Type</span>
                  <span className="font-bold text-slate-900 dark:text-white">{order.orderType}</span>
                </div>
              )}
              {order.address && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Delivery Address</span>
                  <span className="font-bold text-slate-900 dark:text-white">{order.address}</span>
                </div>
              )}
              <div className="pt-6 border-t border-slate-50 dark:divide-white/5 flex justify-between items-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">Total</span>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
