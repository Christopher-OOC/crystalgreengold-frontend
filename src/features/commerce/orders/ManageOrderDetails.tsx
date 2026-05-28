import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ShoppingBag, 
  AlertTriangle, 
  Calendar, 
  Package, 
  Store,
  Phone,
  Clock
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';

interface ManageOrderDetailsProps {
  order: any;
  onBack: () => void;
}

export const ManageOrderDetails: React.FC<ManageOrderDetailsProps> = ({ order, onBack }) => {
  const [orderStatus, setOrderStatus] = useState(order.orderStatus ?? order.status ?? 'PENDING');
  const [transactionStatus, setTransactionStatus] = useState(order.transaction?.status ?? order.confirmation ?? 'NOT_CONFIRMED');
  const orderId = order.orderId ?? order.id;
  const orderDate = order.orderDate ?? order.createdAt ?? order.date ?? 'Unknown date';
  const orderItems = order.orderItems ?? order.items ?? [];
  const totalAmount = order.totalAmount ?? order.amount ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Order Details</h2>
      </div>

      {/* Order Main Info Card */}
      <Card className="p-8">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-emerald-950 dark:text-white">
              <h3 className="text-xl font-bold">Order #{orderId}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-emerald-400 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <Calendar size={14} />
                <span>Placed on {new Date(orderDate).toLocaleString()}</span>
              </div>
              {order.address && (
                <div className="flex items-center space-x-2">
                  <Store size={14} />
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

          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-3xl border border-emerald-50 dark:border-white/5">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-400/10 text-amber-400 dark:text-amber-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                  {orderStatus}
                </span>
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <AlertTriangle size={12} className="text-amber-400" />
                  <span>{transactionStatus.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Order Status:</span>
                <select 
                  value={orderStatus} 
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-lg py-1 px-3 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-xs font-bold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Transaction Status:</span>
                <select 
                  value={transactionStatus} 
                  onChange={(e) => setTransactionStatus(e.target.value)}
                  className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-lg py-1 px-3 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-xs font-bold"
                >
                  <option value="NOT_CONFIRMED">NOT_CONFIRMED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="DECLINED">DECLINED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
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
              <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">Order Items (BUY_PRODUCT)</h3>
            </div>

            <div className="divide-y divide-emerald-50 dark:divide-white/5 space-y-8">
              {(orderItems || []).map((product: any, idx: number) => (
                <div key={product.id ?? idx} className={`flex flex-col md:flex-row gap-6 ${idx > 0 ? 'pt-8' : ''}`}>
                  <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-2xl p-2 overflow-hidden border border-emerald-50 dark:border-white/5 shrink-0">
                    <img 
                      src={product.image || (product.productId ? `https://picsum.photos/seed/${product.productId}/200/200` : 'https://picsum.photos/200')}
                      alt={product.name || product.productName || 'Order item'}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-emerald-950 dark:text-white uppercase">{product.name || product.productName || 'Order item'}</h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                          {product.categoryName || product.category || 'Uncategorized'}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-1 text-[10px] font-bold text-emerald-400">
                          <span>Qty: {product.quantity}</span>
                          {product.bv != null && <span>BV: {product.bv}</span>}
                          {product.pv != null && <span>PV: {product.pv}</span>}
                          {product.remainingOrderQuantity != null && <span>Remaining: {product.remainingOrderQuantity}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">₦{product.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}</p>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">₦{product.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'} each</p>
                      </div>
                    </div>
                    {product.store?.name && (
                      <div className="text-sm text-emerald-600 dark:text-emerald-400">
                        Store: {product.store.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-8 space-y-8">
            <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-emerald-600">Total</span>
                <span className="text-emerald-950 dark:text-white font-bold">₦{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {order.orderType && (
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-emerald-600">Order Type</span>
                  <span className="text-emerald-950 dark:text-white font-bold">{order.orderType}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
