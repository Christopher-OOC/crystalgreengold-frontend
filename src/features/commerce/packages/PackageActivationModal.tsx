import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PaymentModal } from '@/shared/ui/PaymentModal';
import { useAuth } from '@/features/auth/AuthContext'; // adjust path
import { memberService } from '@/lib/api/services/member.service'; // adjust path

interface PackageActivationModalProps {
  isOpen: boolean;
  buyFrom: string;
  storeId?: string | null;
  onClose: () => void;
  onViewOrder?: () => void;
  pkgName: string;
  price: number;
  pkgId?: number;
  mode?: 'activate' | 'buy';  // 'activate' or 'buy'
  quantity?: number;  // for buy mode
}

export const PackageActivationModal: React.FC<PackageActivationModalProps> = ({
  isOpen,
  buyFrom,
  storeId = null,
  onClose,
  onViewOrder,
  pkgName,
  price,
  pkgId,
  mode = 'activate',
  quantity = 1,
}) => {
  const { member } = useAuth(); // ✅ get user from context
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [progress, setProgress] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const numericPrice = mode === 'buy' ? price * quantity : price;
  const displayPrice = `₦${numericPrice.toLocaleString()}`;
  const modalTitle = mode === 'buy' ? 'Buy Package' : 'Package Activation';
  const modalDescription = mode === 'buy'
    ? `You are about to buy ${quantity} x ${pkgName} package for ${displayPrice}.`
    : `You are about to pay ${displayPrice} to activate the ${pkgName} package.`;

  const handleProceed = () => {
    setError(null);
    setShowPayment(true); // ✅ open PaymentModal
  };

  const handlePaymentSuccess = async (reference: string) => {
    setShowPayment(false);
    setStep('processing');
    setProgress(0);
    setError(null);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress = Math.min(currentProgress + Math.random() * 15, 90);
      setProgress(currentProgress);
    }, 300);

    try {
      if (!member) throw new Error('Please login before completing this package payment.');
      if (!pkgId) throw new Error('Package details are missing. Please refresh and try again.');

      if (mode === 'buy') {
        await memberService.buyPackage(member.id, {
          packageId: pkgId,
          quantity,
          storeId: storeId ?? null,
          txnReference: reference
        });
      } else {
        await memberService.activatePackage(member.id, {
          packageId: pkgId,
          storeId: storeId ?? null,
          txnReference: reference
        });
      }

      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setStep('success'), 500);
    } catch (err: any) {
      clearInterval(interval);
      console.error(`Package ${mode} failed`, err?.response?.data ?? err);
      setError(getRequestErrorMessage(err, `Payment was received, but the package could not be ${mode === 'buy' ? 'purchased' : 'activated'}. Please contact support with your payment reference.`));
      setStep('error');
      throw err;
    }
  };

  return (
    // ✅ AnimatePresence wraps ONLY the modal, PaymentModal sits outside
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-emerald-950 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="p-10 text-center space-y-8">
                {step === 'confirm' && (
                  <>
                    <div className="w-24 h-24 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                      <DollarSign size={48} className="animate-bounce" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">
                        {modalTitle}
                      </h2>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {mode === 'buy' ? (
                          <>
                            Buy <span className="font-bold text-emerald-950 dark:text-white">{quantity}x</span> {pkgName} package for{' '}
                            <span className="text-amber-400 font-bold">{displayPrice}</span>.
                          </>
                        ) : (
                          <>
                            You are about to pay{' '}
                            <span className="text-amber-400 font-bold">{displayPrice}</span> to activate the{' '}
                            <span className="font-bold text-emerald-950 dark:text-white">{pkgName}</span> package.
                          </>
                        )}
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={price}
                        className="w-full bg-white dark:bg-white/5 border-2 border-amber-400/20 rounded-2xl py-4 px-6 text-center text-2xl font-black text-emerald-950 dark:text-white outline-none focus:border-amber-400 transition-all"
                      />
                      <p className="mt-3 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        Complete payment via Flutterwave
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <Button variant="secondary" onClick={onClose} className="flex-1 py-4 rounded-2xl">
                        Cancel
                      </Button>
                      <Button onClick={handleProceed} className="flex-1 py-4 rounded-2xl">
                        Proceed to Pay
                      </Button>
                    </div>
                  </>
                )}

                {step === 'processing' && (
                  <div className="py-12 space-y-12">
                    <div className="w-24 h-24 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto relative">
                      <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin" />
                      <DollarSign size={32} />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">
                        {mode === 'buy' ? 'Processing Purchase' : 'Activating Package'}
                      </h2>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Please wait while we {mode === 'buy' ? 'complete your purchase' : 'activate your package'}...
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
                      <div className="flex justify-center space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-3 h-3 bg-amber-400 rounded-full"
                          />
                        ))}
                      </div>
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
                      <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">
                        Success!
                      </h2>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Your {mode === 'buy' ? (
                          <>
                            <span className="font-bold text-emerald-950 dark:text-white">{quantity}x</span> {pkgName} package
                            has been purchased successfully!
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-emerald-950 dark:text-white">{pkgName}</span> package
                            has been activated successfully!
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <Button
                        onClick={() => { onViewOrder?.(); onClose(); }}
                        className="w-full py-4 rounded-2xl"
                      >
                        View Order Details
                      </Button>
                      <Button variant="secondary" onClick={onClose} className="w-full py-4 rounded-2xl">
                        Back to Dashboard
                      </Button>
                    </div>
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
                      <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">
                        Action Failed
                      </h2>
                      <p className="text-rose-500 font-medium">
                        {error}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <Button onClick={() => setStep('confirm')} className="w-full py-4 rounded-2xl">
                        Try Again
                      </Button>
                      <Button variant="secondary" onClick={onClose} className="w-full py-4 rounded-2xl">
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

      {/* ✅ PaymentModal lives OUTSIDE AnimatePresence so it renders on top correctly */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        defaultEmail={member?.email ?? ''}
        defaultName={`${member?.firstName ?? ''} ${member?.lastName ?? ''}`}
        defaultPhone={member?.phoneNumber ?? ''}
        fixedAmount={numericPrice}
        title={mode === 'buy' ? `Buy ${pkgName}` : `Activate ${pkgName}`}
        description={mode === 'buy' ? `One-time payment to purchase ${quantity}x ${pkgName}` : `One-time payment to activate your ${pkgName} package`}
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
