import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, CheckCircle2, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PaymentModal } from '@/shared/ui/PaymentModal';
import { useAuth } from '@/features/auth/AuthContext';
import { orderService } from '@/lib/api/services/order.service';

interface ProductPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  price: string | number; // Allow both string and number
  quantity: number;
}

export const ProductPurchaseModal: React.FC<ProductPurchaseModalProps> = ({ 
  isOpen, 
  onClose, 
  productId,
  productName, 
  price, 
  quantity 
}) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [progress, setProgress] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { member } = useAuth();

  // Helper function to extract numeric price safely
  const getNumericPrice = useMemo(() => {
    if (typeof price === 'number') {
      return price;
    }
    // If it's a string, remove currency symbols and commas
    const numericValue = parseFloat(price.replace(/[^0-9.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }, [price]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    const numericPrice = getNumericPrice;
    const total = numericPrice * quantity;
    return `₦${total.toLocaleString()}`;
  }, [getNumericPrice, quantity]);

  // Format display price (for showing single item price)
  const displayPrice = useMemo(() => {
    if (typeof price === 'number') {
      return `₦${price.toLocaleString()}`;
    }
    return price; // Keep as is if it's already formatted
  }, [price]);

  const handleProceed = () => {
    if (!member) {
      setError('Please login before buying this product.');
      setStep('error');
      return;
    }
    setError(null);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!member) throw new Error('Please login before buying this product.');

    setShowPayment(false);
    setStep('processing');
    setProgress(0);
    setError(null);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress = Math.min(currentProgress + Math.random() * 20, 90);
      setProgress(currentProgress);
    }, 200);

    try {
      await orderService.create(member.id, {
        memberType: member.memberType,
        reference,
        items: [{
          productId,
          productName,
          quantity,
          price: getNumericPrice,
          subtotal: getNumericPrice * quantity,
        }],
        totalAmount: getNumericPrice * quantity,
        status: 'PAID',
      });

      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setStep('success'), 500);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Failed to buy product after payment:', err?.response?.data ?? err);
      setError(getRequestErrorMessage(err, 'Payment was received, but your order could not be created. Please contact support with your payment reference.'));
      setStep('error');
      throw err;
    }
  };

  const handleClose = () => {
    // Reset to initial step when closing
    setStep('confirm');
    setProgress(0);
    setError(null);
    setShowPayment(false);
    onClose();
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 transition-colors z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="p-10 text-center space-y-8">
              {step === 'confirm' && (
                <>
                  <div className="w-24 h-24 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard size={48} className="animate-pulse" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Confirm Purchase</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      You are about to purchase <span className="text-amber-400 font-bold">{quantity}x {productName}</span> for <span className="font-bold text-emerald-950 dark:text-white">{totalPrice}</span>.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-white dark:bg-white/5 border-2 border-amber-400/20 rounded-2xl py-4 px-6 text-center">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-3xl font-black text-amber-400">{totalPrice}</p>
                    </div>
                    <p className="mt-3 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Payment will be processed securely
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      variant="secondary" 
                      onClick={handleClose}
                      className="flex-1 py-4 rounded-2xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleProceed}
                      className="flex-1 py-4 rounded-2xl"
                    >
                      Proceed
                    </Button>
                  </div>
                </>
              )}

              {step === 'processing' && (
                <div className="py-12 space-y-12">
                  <div className="w-24 h-24 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto relative">
                    <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full" />
                    <div 
                      className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"
                    />
                    <DollarSign size={32} />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Processing Order</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      We are verifying your payment...
                    </p>
                  </div>

                  <div className="w-full h-3 bg-emerald-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-amber-400"
                    />
                  </div>
                </div>
              )}

              {step === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 space-y-6"
                >
                  <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Order Placed!</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Your order for {quantity}x {productName} has been placed successfully.
                    </p>
                  </div>
                  <Button onClick={handleClose} className="w-full py-4 rounded-2xl">
                    Back to Shop
                  </Button>
                </motion.div>
              )}

              {step === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 space-y-6"
                >
                  <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Order Failed</h2>
                    <p className="text-rose-500 font-medium">{error}</p>
                  </div>
                  <div className="flex space-x-4">
                    <Button onClick={() => setStep('confirm')} className="flex-1 py-4 rounded-2xl">
                      Try Again
                    </Button>
                    <Button variant="secondary" onClick={handleClose} className="flex-1 py-4 rounded-2xl">
                      Close
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    <PaymentModal
      isOpen={showPayment}
      onClose={() => setShowPayment(false)}
      defaultEmail={member?.email ?? ''}
      defaultName={`${member?.firstName ?? ''} ${member?.lastName ?? ''}`.trim() || (member?.username ?? '')}
      defaultPhone={member?.phoneNumber ?? ''}
      fixedAmount={getNumericPrice * quantity}
      title={`Buy ${productName}`}
      description={`One-time payment for ${quantity}x ${productName}`}
      onPaymentSuccess={handlePaymentSuccess}
    />
    </>
  );
};

function getRequestErrorMessage(err: any, fallback: string) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (err?.message === 'Network Error') return 'Unable to reach the API. Please check the backend connection and try again.';
  if (err?.message) return err.message;
  return fallback;
}
