'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeftRight, X } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore, selectMember } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/shared/ui/Button';

interface Props { isOpen: boolean; onClose: () => void; onConverted: (availableBalance: number, tokens: number) => void; }

export const ConvertBalanceToTokensModal: React.FC<Props> = ({ isOpen, onClose, onConverted }) => {
  const member = useAuthStore(selectMember);
  const { toast } = useUIStore();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const available = Number(member?.availableBalance ?? 0);
  const numericAmount = Number(amount);

  const convert = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > available) return;
    setBusy(true);
    try {
      const { data } = await apiClient.post(ENDPOINTS.MEMBERS.CONVERT_BALANCE_TO_TOKENS, { amount: numericAmount });
      const updated = data.data;
      const newAvailable = Number(updated.availableBalance ?? available - numericAmount);
      const newTokens = Number(updated.tokens ?? Number(member?.tokens ?? 0) + numericAmount);
      useAuthStore.getState().updateMember({ availableBalance: newAvailable, tokens: newTokens });
      onConverted(newAvailable, newTokens);
      toast.success('Conversion successful', `${formatCurrency(numericAmount)} added to your token balance.`);
      setAmount('');
      onClose();
    } catch (error: any) {
      toast.error('Conversion failed', error?.response?.data?.message ?? 'Could not convert your balance. Please try again.');
    } finally { setBusy(false); }
  };

  return <AnimatePresence>{isOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <motion.button aria-label="Close conversion dialog" className="absolute inset-0 bg-emerald-950/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !busy && onClose()}/>
    <motion.div role="dialog" aria-modal="true" aria-labelledby="convert-tokens-title" className="relative w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-emerald-950" initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}>
      <div className="mb-5 flex items-start justify-between"><div className="flex items-center gap-3"><ArrowLeftRight className="text-amber-500"/><div><h2 id="convert-tokens-title" className="text-xl font-bold">Convert to tokens</h2><p className="text-sm text-emerald-600">Move funds from available balance to tokens.</p></div></div><button type="button" aria-label="Close" disabled={busy} onClick={onClose}><X size={20}/></button></div>
      <form onSubmit={convert} className="space-y-4">
        <div className="rounded-xl bg-emerald-50 p-3 text-sm dark:bg-white/5">Available balance: <strong>{formatCurrency(available)}</strong><br/>Token balance: <strong>{Number(member?.tokens ?? 0).toLocaleString()}</strong></div>
        <label className="block text-sm font-medium">Amount<input autoFocus required type="number" min="0.01" step="0.01" max={available} value={amount} onChange={event => setAmount(event.target.value)} placeholder="Enter amount" className="mt-1 w-full rounded-xl border border-emerald-100 bg-transparent px-4 py-3 dark:border-white/10"/></label>
        <p className="text-xs text-emerald-600">1 unit of available balance converts to 1 token.</p>
        <Button type="submit" disabled={busy || !numericAmount || numericAmount <= 0 || numericAmount > available} isLoading={busy} className="w-full rounded-xl py-3">Convert balance</Button>
      </form>
    </motion.div>
  </div>}</AnimatePresence>;
};
