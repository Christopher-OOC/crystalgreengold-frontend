// src/components/ui/PaymentModal.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Loader2, CheckCircle2, Mail, User, Phone, Wallet } from 'lucide-react';
import { usePaystack } from '@/lib/hooks/usePaystack';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Pre-fill any of these if you already have the user's data
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
  // Fix the amount (e.g. for package purchase) or leave undefined to let user enter it
  fixedAmount?: number;
  title?: string;
  description?: string;
  onPaymentSuccess?: (reference: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  defaultName = '',
  defaultPhone = '',
  fixedAmount,
  title = 'Make Payment',
  description = 'Complete your payment securely via Paystack',
  onPaymentSuccess,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [amount, setAmount] = useState(fixedAmount?.toString() ?? '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  // Sync state with props when they change (e.g. after auth loads)
  React.useEffect(() => {
    if (defaultEmail && !email) setEmail(defaultEmail);
    if (defaultName && !name) setName(defaultName);
    if (defaultPhone && !phone) setPhone(defaultPhone);
  }, [defaultEmail, defaultName, defaultPhone]);

  React.useEffect(() => {
    if (fixedAmount !== undefined) {
      setAmount(fixedAmount.toString());
    }
  }, [fixedAmount]);

  const numericAmount = parseFloat(amount) || 0;
  const isValid = email && (fixedAmount !== undefined ? fixedAmount > 0 : numericAmount > 0);

  const PAYSTACK_KEY =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || '';

  const PAYSTACK_PUBLIC_KEY =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || '';

  const { pay } = usePaystack({
    email,
    amount: numericAmount,
    name,
    phone,
   

    onSuccess: (reference) => {
  setSuccess(true);
  onPaymentSuccess?.(reference); // caller decides what to do with the reference
},
    onClose: () => {
      // user closed the Paystack popup without paying — do nothing
    },
  });

  const handleReset = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-sm';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:w-[480px] bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-50 dark:border-white/10 overflow-hidden"
            style={{ zIndex: 70 }}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="overflow-hidden">
              {/* Top accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-emerald-950 dark:text-white tracking-tight">
                        {title}
                      </h2>
                      <p className="text-xs text-emerald-600 mt-0.5">{description}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {success ? (
                  // ── Success state ──
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-black text-emerald-950 dark:text-white">
                        Payment Successful!
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Your payment of ₦{numericAmount.toLocaleString()} has been confirmed.
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  // ── Form ──
                  <div className="space-y-3">
                    {/* Email */}
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {/* Name */}
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                      <input
                        type="text"
                        placeholder="Full name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                      <input
                        type="tel"
                        placeholder="Phone number (optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {/* Amount — hidden if fixedAmount is set */}
                    {!fixedAmount && (
                      <div className="relative">
                        <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type="number"
                          placeholder="Amount (₦)"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* Fixed amount display */}
                    {fixedAmount && (
                      <div className="rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Amount</span>
                        <span className="text-lg font-black text-yellow-500">
                          ₦{fixedAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {error && (
                      <p className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-500/10 px-4 py-3 rounded-xl">
                        {error}
                      </p>
                    )}

                    {!PAYSTACK_KEY && (
                      <p className="text-xs text-amber-400 font-medium bg-amber-50 dark:bg-amber-400/10 px-4 py-3 rounded-xl">
                        Paystack is not configured. Please set <strong>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</strong> in your environment.
                      </p>
                    )}

                    <button
                      onClick={() => {
                        setIsLaunching(true);
                        console.log('Pay button clicked', { email, amount: numericAmount, PAYSTACK_KEY, payType: typeof pay });
                        if (!pay) {
                          setError('Paystack is not initialized (missing react-paystack or invalid config).');
                          setIsLaunching(false);
                          return;
                        }
                        try {
                          // protect against pay throwing a non-error object
                          const res: unknown = pay?.();
                          // If pay() returned a promise, ensure we stop launching when it resolves/rejects
                          if (res && typeof (res as any).then === 'function') {
                            (res as any)
                              .then(() => setIsLaunching(false))
                              .catch((e: any) => {
                                const msg = e?.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
                                setError(msg);
                                setIsLaunching(false);
                              });
                          } else {
                            // Reset after a delay in case the popup is blocked/closed instantly
                            setTimeout(() => setIsLaunching(false), 3000);
                          }
                        } catch (e: any) {
                          const msg = e?.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
                          setError(msg);
                          setIsLaunching(false);
                        }
                      }}
                      disabled={!isValid || isLaunching || !PAYSTACK_KEY}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20"
                    >
                      {isLaunching ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Launching Paystack...
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          Pay ₦{numericAmount > 0 ? numericAmount.toLocaleString() : '0'}
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10px] text-emerald-400 font-medium">
                      Secured by <span className="font-black text-emerald-700 dark:text-emerald-200">Paystack</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};