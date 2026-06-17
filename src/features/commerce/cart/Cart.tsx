// src/components/dashboard/Cart.tsx
import React, { useState } from 'react';
import { orderService } from '@/lib/api/services/order.service';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentModal } from '@/shared/ui/PaymentModal';
import {
  ShoppingCart,
  Home,
  X,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/features/auth/AuthContext';


const CheckoutComponent: React.FC<{
  items: any[];
  onBack: () => void;
  onOrderPlaced?: () => void;
  onNavigateToOrders?: () => void;
}> = ({
  items,
  onBack,
  onOrderPlaced,
  onNavigateToOrders
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [showPayment, setShowPayment] = useState(false); // 👈 new
    const { clearCart } = useCart();
    const { member } = useAuth();

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handlePlaceOrder = () => {
      if (!member) {
        setError('Please login to place your order');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
        return;
      }
      setError(null);
      setShowPayment(true);
    };

    const handlePaymentSuccess = async (reference: string) => {
      if (!member) return;

      setIsProcessing(true);
      try {
        // Step 1: Create the order as PAID
        const result = await orderService.create(member.id, {
          memberType: member.memberType,
          reference: reference,
          items: items.map(item => ({
            productId: String(item.id),
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
          totalAmount: total,
          status: 'PAID',
        });

        setOrderId(result.id);

        // Step 2: Attach the Paystack reference to the order
        try {
          await orderService.update(result.id, member.id, {
            status: 'PAID',
            paystackReference: reference,
          });
        } catch (updateErr) {
          // Reference update failed but order exists — log and continue
          console.warn('Order created but failed to attach Paystack reference:', updateErr);
        }

      } catch (err: any) {
        console.error('Failed to create order after payment:', err?.response?.data ?? err);
        // Payment went through — don't block the user, just log
      } finally {
        setIsProcessing(false);
      }

      setShowPayment(false);
      clearCart();
      setOrderSuccess(true);
      onOrderPlaced?.();
    };

    const handleViewOrders = () => {
      if (onNavigateToOrders) {
        onNavigateToOrders();
      } else {
        window.location.href = '/dashboard?tab=orders';
      }
    };

    if (orderSuccess) {
      return (
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-emerald-950 dark:text-white">Order Placed & Paid!</h2>
              {orderId && (
                <p className="text-sm text-emerald-600">
                  Order ID: <span className="font-mono font-bold text-amber-400">{orderId}</span>
                </p>
              )}
              <p className="text-emerald-600">
                Your order has been received and payment confirmed. You'll receive a confirmation email shortly.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleViewOrders} className="mt-4">View My Orders</Button>
              <Button onClick={() => window.location.href = '/products'} variant="secondary" className="mt-4">
                Continue Shopping
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Button onClick={onBack} variant="secondary" className="flex items-center space-x-2">
          <ArrowRight size={18} className="rotate-180" />
          <span>Back to Cart</span>
        </Button>

        <Card className="p-8">
          <h2 className="text-2xl font-black mb-6 text-emerald-950 dark:text-white">Checkout</h2>

          {!member && (
            <div className="mb-4 p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              <p className="text-amber-400 dark:text-amber-400 text-sm">
                Please <button onClick={() => window.location.href = '/login'} className="font-bold underline">login</button> to complete your order
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between py-3 border-b border-emerald-50 dark:border-white/5">
                <div>
                  <p className="font-bold text-emerald-950 dark:text-white">{item.name}</p>
                  <p className="text-xs text-emerald-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-400">₦{(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-xs text-emerald-600">₦{item.price.toLocaleString()} each</p>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-4 border-t border-emerald-100 dark:border-white/10">
              <span className="text-lg font-bold text-emerald-950 dark:text-white">Total</span>
              <span className="text-2xl font-black text-amber-400">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !member}
              className="w-full py-3 rounded-xl font-bold bg-amber-400 hover:bg-amber-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                'Place Order & Pay'
              )}
            </Button>
            <p className="text-xs text-center text-emerald-600">
              By placing your order, you agree to our Terms and Conditions
            </p>
          </div>
        </Card>

        {/* 👇 Payment modal — opens after order is created */}
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)} // user can dismiss but order stays PENDING
          title="Complete Payment"
          description={`Pay for Order ${orderId ?? ''}`}
          fixedAmount={total}
          defaultEmail={member?.email ?? ''}
          defaultName={member?.username ?? ''}
          defaultPhone={member?.phoneNumber ?? ''}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    );
  };

interface CartProps {
  onStartShopping?: () => void;
  onNavigateToOrders?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onStartShopping, onNavigateToOrders }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const { items, removeFromCart, updateQuantity, isLoading, clearCart } = useCart();
  const { member } = useAuth();

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  // Handle navigation to products page
  const handleStartShopping = () => {
    if (onStartShopping) {
      onStartShopping();
    } else {
      window.location.href = '/products';
    }
  };

  const handleNavigateToOrders = () => {
    if (onNavigateToOrders) {
      onNavigateToOrders();
    } else {
      // Navigate to order history within the dashboard
      // This assumes your Dashboard component accepts a tab prop
      window.location.href = '/dashboard?tab=orders';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Cart...</p>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return <CheckoutComponent
      items={items}
      onBack={() => setShowCheckout(false)}
      onNavigateToOrders={handleNavigateToOrders}
      onOrderPlaced={() => {
        console.log('Order placed successfully');
      }}
    />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb Header */}
      <Card className="p-4 flex items-center space-x-2 text-sm font-bold text-emerald-400 uppercase tracking-widest">
        <Home size={16} className="text-emerald-400" />
        <span>Home</span>
        <span className="text-emerald-200">/</span>
        <ShoppingCart size={16} className="text-amber-400" />
        <span className="text-amber-400">Cart</span>
      </Card>

      {/* Login Warning for Guests */}
      {!member && items.length > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4">
          <p className="text-amber-400 dark:text-amber-400 text-sm text-center">
            Please <button onClick={() => window.location.href = '/login'} className="font-bold underline">login</button> to complete your purchase
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex items-center space-x-3 mb-8">
              <ShoppingCart className="text-amber-400" size={24} />
              <h2 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">Shopping Cart</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-400/5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <th className="text-left py-4 px-6 rounded-l-2xl">Products</th>
                    <th className="text-center py-4 px-6">Price</th>
                    <th className="text-center py-4 px-6">Quantity</th>
                    <th className="text-right py-4 px-6 rounded-r-2xl">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white dark:divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {items.length > 0 ? (
                      items.map((item) => (
                        <motion.tr
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group"
                        >
                          <td className="py-6 px-6">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-rose-500 hover:text-rose-600 transition-colors p-1"
                                aria-label={`Remove ${item.name} from cart`}
                              >
                                <X size={16} />
                              </button>
                              <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/400?text=Product';
                                  }}
                                />
                              </div>
                              <span className="font-bold text-emerald-950 dark:text-white">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6 text-center">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">₦{item.price.toLocaleString()}</span>
                          </td>
                          <td className="py-6 px-6 text-center">
                            <div className="inline-flex items-center border border-emerald-100 dark:border-white/10 rounded-xl overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-2 hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors text-emerald-600"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-10 text-center font-bold text-emerald-950 dark:text-white text-sm">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-2 hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors text-emerald-600"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="py-6 px-6 text-right">
                            <span className="font-black text-emerald-950 dark:text-white">₦{(item.price * item.quantity).toLocaleString()}</span>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20">
                          <div className="flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center">
                              <ShoppingCart size={48} />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">Your cart is empty</h3>
                              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Start adding products to your cart!</p>
                            </div>
                            <Button
                              onClick={handleStartShopping}
                              className="px-8 py-3 rounded-2xl flex items-center space-x-2"
                            >
                              <ShoppingBag size={18} />
                              <span>Start Shopping</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {items.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white dark:border-white/5 flex justify-between">
                <Button variant="secondary" className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">
                  Update Cart
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    clearCart();
                  }}
                  className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-rose-500 hover:bg-rose-50"
                >
                  Clear Cart
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-8 space-y-8">
            <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">Order Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 font-medium">Subtotal</span>
                <span className="font-bold text-emerald-950 dark:text-white">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 font-medium">Shipping</span>
                <span className="font-bold text-emerald-500">Free</span>
              </div>
              <div className="pt-4 border-t border-white dark:border-white/5 flex justify-between items-center">
                <span className="text-lg font-black text-emerald-950 dark:text-white">Total</span>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-950 dark:text-white">₦{total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowCheckout(true)}
              className="w-full py-4 rounded-2xl font-black flex items-center justify-center space-x-3 shadow-xl shadow-amber-400/20"
              disabled={items.length === 0}
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={20} />
            </Button>
          </Card>

          {/* Additional Info */}
          <Card className="p-6 bg-white dark:bg-white/5 border-none">
            <div className="flex items-center space-x-3 text-emerald-600">
              <Trash2 size={18} />
              <p className="text-xs font-medium">Items in cart are not reserved until checkout is complete.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};