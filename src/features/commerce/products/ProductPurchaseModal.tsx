import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface ProductPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  price: string | number; // Allow both string and number
  quantity: number;
}

export const ProductPurchaseModal: React.FC<ProductPurchaseModalProps> = ({ 
  isOpen, 
  onClose, 
  productName, 
  price, 
  quantity 
}) => {
  const [step, setStep] = useState<'confirm' | 'payment' | 'processing' | 'success'>('confirm');
  const [progress, setProgress] = useState(0);

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
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    setStep('processing');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 20;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setStep('success'), 500);
      }
      setProgress(currentProgress);
    }, 200);
  };

  const handleClose = () => {
    // Reset to initial step when closing
    setStep('confirm');
    setProgress(0);
    onClose();
  };

  return (
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

              {step === 'payment' && (
                <>
                  <div className="w-24 h-24 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={48} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">Secure Payment</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                      Please transfer to the account details below!
                    </p>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-emerald-50 dark:border-white/5 text-left space-y-4">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Transfer To:</p>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-emerald-950 dark:text-white">
                        Account Name: <span className="font-medium text-emerald-700 dark:text-emerald-400">crystalgreengold Official</span>
                      </p>
                      <p className="text-sm font-bold text-emerald-950 dark:text-white">
                        Account Number: <span className="font-medium text-emerald-700 dark:text-emerald-400">1002891739</span>
                      </p>
                      <p className="text-sm font-bold text-emerald-950 dark:text-white">
                        Bank: <span className="font-medium text-emerald-700 dark:text-emerald-400">Lotus Bank</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setStep('confirm')}
                      className="flex-1 py-4 rounded-2xl"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleConfirmPayment}
                      className="flex-1 py-4 rounded-2xl"
                    >
                      Confirm Payment
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
