import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, SendHorizontal } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { memberService } from '@/lib/api/services/member.service';
import { useAuth } from '@/features/auth/AuthContext';
import { useUIStore } from '@/lib/store/uiStore';

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { member } = useAuth();
  const { toast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    amount: ''
  });

  const handleTransfer = async () => {
    if (!formData.recipient || !formData.amount || !member?.id) return;
    
    setIsLoading(true);
    try {
      await memberService.transferFunds(member.id, {
        recipientUsername: formData.recipient,
        amount: parseFloat(formData.amount),
      });
      
      toast.success('Transfer Successful', `₦${formData.amount} sent to ${formData.recipient}`);
      setFormData({ recipient: '', amount: '' });
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Transaction failed. Please check balance and recipient.';
      toast.error('Transfer Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-emerald-950 rounded-[32px] shadow-2xl overflow-hidden border border-emerald-100 dark:border-white/5"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                    <SendHorizontal size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-950 dark:text-white">Transfer Funds</h2>
                </div>
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 transition-colors disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-emerald-600 dark:text-emerald-400 ml-1">Recipient Username</label>
                  <input 
                    type="text" 
                    placeholder="Enter member username"
                    value={formData.recipient}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                    disabled={isLoading}
                    className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-emerald-950 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-emerald-600 dark:text-emerald-400 ml-1">Amount</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    disabled={isLoading}
                    className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-emerald-950 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleTransfer}
                    isLoading={isLoading}
                    className="w-full py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/20"
                  >
                    <span className="text-lg">Send Money</span>
                    <Send size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
