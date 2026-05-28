import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle, 
  X,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  DollarSign,
  ShieldCheck,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

interface CheckoutProps {
  items: any[];
  onBack: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ items, onBack }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [showValidModal, setShowValidModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'none' | 'confirm' | 'secure' | 'processing' | 'success'>('none');
  const [progress, setProgress] = useState(0);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleValidateOrder = () => {
    setIsValidating(true);
    // Simulate validation
    setTimeout(() => {
      setIsValidating(false);
      setIsValidated(true);
      setShowValidModal(true);
    }, 2000);
  };

  const handlePayNow = () => {
    setPaymentStep('confirm');
  };

  const handleConfirmPayment = () => {
    setPaymentStep('processing');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setPaymentStep('success'), 500);
      }
      setProgress(currentProgress);
    }, 300);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ChevronLeft size={20} />
          <span>Back to Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Information */}
        <div className="lg:col-span-2">
          <Card className="p-10 space-y-8">
            <h2 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">Order Information</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-emerald-400" size={18} />
                  <textarea 
                    className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all min-h-[100px]"
                    placeholder="Enter your delivery address"
                    defaultValue="irapada"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input 
                      type="email"
                      defaultValue="faithokekeri2017@gmail.com"
                      className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input 
                      type="tel"
                      defaultValue="09046624920"
                      className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-8 space-y-8">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="text-amber-400" size={24} />
              <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">Order Summary</h3>
            </div>
            
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-white dark:bg-white/5 rounded-2xl">
                  <div className="w-16 h-16 bg-white dark:bg-emerald-900 rounded-xl p-2 flex items-center justify-center shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-emerald-950 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs font-bold text-emerald-400">{item.quantity} x <span className="text-amber-400">₦{item.price.toLocaleString()}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-emerald-50 dark:border-white/5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-600 font-medium">Sub-total</span>
                <span className="font-bold text-emerald-950 dark:text-white">₦{subtotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-600 font-medium">Shipping</span>
                <span className="font-bold text-emerald-500">Free</span>
              </div>
              <div className="pt-4 border-t border-emerald-50 dark:border-white/5 flex justify-between items-center">
                <span className="text-lg font-black text-emerald-950 dark:text-white">Total</span>
                <span className="text-lg font-black text-amber-400">₦{total.toLocaleString()}.00 USD</span>
              </div>
            </div>

            {isValidated ? (
              <Button 
                onClick={handlePayNow}
                className="w-full py-4 rounded-2xl font-black flex items-center justify-center space-x-3 shadow-xl shadow-amber-400/20"
              >
                <DollarSign size={20} />
                <span>Pay Now</span>
              </Button>
            ) : (
              <Button 
                onClick={handleValidateOrder}
                disabled={isValidating}
                className="w-full py-4 rounded-2xl font-black flex items-center justify-center space-x-3 shadow-xl shadow-amber-400/20"
              >
                <CheckCircle size={20} />
                <span>Validate Order</span>
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Validation Loading Modal */}
        {isValidating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-10 text-center"
            >
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-emerald-950 dark:text-white text-left">Validating Order</h2>
                
                <div className="space-y-6">
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium text-left">Checking for order validity...</p>
                  <div className="flex justify-center space-x-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-10 h-10 bg-amber-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Order is Valid Modal */}
        {showValidModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
              onClick={() => setShowValidModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-10"
            >
              <button 
                onClick={() => setShowValidModal(false)}
                className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-emerald-950 dark:text-white">Order is valid!</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Your order has been validated. You can continue with payment!
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payment Confirmation Modal */}
        {paymentStep === 'confirm' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
              onClick={() => setPaymentStep('none')}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-10 text-center"
            >
              <button 
                onClick={() => setPaymentStep('none')}
                className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="w-20 h-20 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign size={40} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">Payment Confirmation</h2>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    You are about to pay <span className="text-amber-400 font-bold">₦{total.toLocaleString()}.00</span>
                  </p>
                </div>

                <div className="relative">
                  <div className="w-full bg-white dark:bg-white/5 border-2 border-amber-400/20 rounded-2xl py-4 px-6 text-center text-2xl font-black text-emerald-950 dark:text-white">
                    {total.toLocaleString()}.00
                  </div>
                  <p className="mt-3 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    This amount will be deducted from your transaction wallet
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setPaymentStep('none')}
                    className="flex-1 py-4 rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setPaymentStep('secure')}
                    className="flex-1 py-4 rounded-2xl"
                  >
                    Proceed
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Secure Payment Modal */}
        {paymentStep === 'secure' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
              onClick={() => setPaymentStep('none')}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-10 text-center"
            >
              <button 
                onClick={() => setPaymentStep('none')}
                className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="w-20 h-20 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck size={40} />
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
                      Account Name: <span className="font-medium text-emerald-700 dark:text-emerald-400">Obaro Don Duke</span>
                    </p>
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">
                      Account Number: <span className="font-medium text-emerald-700 dark:text-emerald-400">1002891739</span>
                    </p>
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">
                      Bank: <span className="font-medium text-emerald-700 dark:text-emerald-400">Lotus Bank</span>
                    </p>
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">
                      For Enquiry Call: <span className="font-medium text-emerald-700 dark:text-emerald-400">(070 6340 2463 )</span>
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setPaymentStep('none')}
                    className="flex-1 py-4 rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmPayment}
                    className="flex-1 py-4 rounded-2xl"
                  >
                    Confirm Payment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Processing Payment Modal */}
        {paymentStep === 'processing' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-10 text-center"
            >
              <div className="space-y-12">
                <div className="w-24 h-24 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full" />
                  <div 
                    className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"
                  />
                  <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Processing Payment</h2>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Please wait while we secure your transaction...
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="w-full h-3 bg-emerald-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-amber-400"
                    />
                  </div>
                  <div className="flex justify-center space-x-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-10 h-10 bg-amber-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        {paymentStep === 'success' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
              onClick={onBack}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-10 text-center"
            >
              <div className="space-y-8">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Success!</h2>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Your payment was successful and your order has been placed.
                  </p>
                </div>
                <Button onClick={onBack} className="w-full py-4 rounded-2xl">
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
