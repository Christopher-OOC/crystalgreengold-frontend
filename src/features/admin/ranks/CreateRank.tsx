import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { rankService } from '@/lib/api/services/rank.service';
import type { Rank } from '@/lib/types/rank.types';

interface CreateRankProps {
  onBack: () => void;
  initialData?: Rank;
}

export const CreateRank: React.FC<CreateRankProps> = ({ onBack, initialData }) => {
  const isEditing = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    prize: 0,
    qualifyingBv: 0,
    rankValue: 1,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        prize: initialData.prize,
        qualifyingBv: initialData.qualifyingBv,
        rankValue: initialData.rankValue,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { setError('Rank name is required'); return; }
    if (formData.rankValue <= 0) { setError('Rank value must be greater than 0'); return; }

    setIsLoading(true);
    setError(null);
    try {
      if (isEditing && initialData) {
        await rankService.update(initialData.id, formData);
      } else {
        await rankService.create(formData);
      }
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save rank.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6 relative">
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Success!</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Rank {isEditing ? 'updated' : 'created'} successfully.
                </p>
              </div>
              <Button onClick={() => { setShowSuccessModal(false); onBack(); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest">
                Back to Rank List
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
          <p className="text-sm font-medium text-rose-500 flex-1">{error}</p>
          <button onClick={() => setError(null)}><X size={16} className="text-rose-500" /></button>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button onClick={onBack} disabled={isLoading} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            {isEditing ? 'Edit Rank' : 'Create New Rank'}
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Define qualifying criteria and rewards
          </p>
        </div>
      </div>

      <Card className="p-8 md:p-10 border-none shadow-2xl space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g., DIAMOND DIRECTOR" disabled={isLoading}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium disabled:opacity-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualifying BV *</label>
              <input type="number" name="qualifyingBv" value={formData.qualifyingBv} onChange={handleChange}
                placeholder="0" disabled={isLoading}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium disabled:opacity-50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prize (₦) *</label>
              <input type="number" name="prize" value={formData.prize} onChange={handleChange}
                placeholder="0" disabled={isLoading}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium disabled:opacity-50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank Value *</label>
              <input type="number" name="rankValue" value={formData.rankValue} onChange={handleChange}
                placeholder="1" disabled={isLoading}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium disabled:opacity-50" />
              <p className="text-[10px] text-slate-400 italic">Higher = more senior</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-white/5">
          <Button onClick={handleSubmit} disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 disabled:opacity-80 min-w-[180px] justify-center">
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /><span>{isEditing ? 'Updating...' : 'Creating...'}</span></>
            ) : (
              <><Check size={18} /><span>{isEditing ? 'Update Rank' : 'Create Rank'}</span></>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};