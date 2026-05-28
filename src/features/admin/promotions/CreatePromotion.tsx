import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, Check, Loader2, CheckCircle2, X } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { promotionService } from '@/lib/api/services/promotion.service';
import type { Promotion } from '@/lib/types/promotion.types';

interface CreatePromotionProps {
  onBack: () => void;
  initialData?: Promotion;
}

export const CreatePromotion: React.FC<CreatePromotionProps> = ({ onBack, initialData }) => {
  const isEditing = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    prize: '',
    targetPv: '',
    description: '',
    enabled: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        prize: String(initialData.prize ?? ''),
        targetPv: String(initialData.targetPv ?? ''),
        description: initialData.description ?? '',
        enabled: initialData.enabled ?? true,
      });
      if (initialData.image) setImagePreview(initialData.image);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Promotion name is required.'); return; }
    if (!isEditing && !imageFile) { setError('Please upload a promotion image.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        name: form.name,
        description: form.description,
        prize: parseFloat(form.prize) || 0,
        targetPv: parseFloat(form.targetPv) || 0,
        enabled: form.enabled,
      }));
      if (imageFile) {
        formData.append('file', imageFile);
      } else if (isEditing) {
        formData.append('file', new Blob([], { type: 'image/png' }), 'empty.png');
      }

      if (isEditing && initialData?.id) {
        await promotionService.update(initialData.id, formData);
      } else {
        await promotionService.create(formData);
      }
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} promotion.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6 relative">
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-emerald-950 rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight uppercase">Success!</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">Promotion {isEditing ? 'updated' : 'created'} successfully.</p>
              </div>
              <Button onClick={onBack} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest">
                Back to Promotions
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-emerald-700 dark:text-emerald-400" />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight uppercase">
            {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
          </h1>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Setup a new marketing promotion or incentive</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center space-x-3">
          <p className="text-sm font-medium text-rose-500 flex-1">{error}</p>
          <button onClick={() => setError(null)}><X size={16} className="text-rose-500" /></button>
        </div>
      )}

      <Card className="p-8 md:p-10 border-none shadow-2xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Promotion Image * {isEditing && <span className="normal-case font-medium text-xs">(leave empty to keep current)</span>}
              </label>
              <label className="border-2 border-dashed border-yellow-200 dark:border-yellow-500/20 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 bg-yellow-50/30 dark:bg-yellow-500/5 hover:border-yellow-500 transition-colors cursor-pointer group aspect-video">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Click to upload or drag and drop</p>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">PNG, JPG, JPEG (Max 5MB)</p>
                    </div>
                  </>
                )}
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Promotion Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Summer Sale 2024" disabled={isLoading}
                className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium disabled:opacity-50" />
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enabled" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-emerald-200 text-yellow-600 focus:ring-yellow-500" />
              <label htmlFor="enabled" className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Enabled (visible to members)</label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Prize (₦) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-sm font-bold">₦</span>
                <input type="number" name="prize" value={form.prize} onChange={handleChange} placeholder="500" disabled={isLoading}
                  className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 pl-8 pr-4 outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium disabled:opacity-50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Target PV *</label>
              <input type="number" name="targetPv" value={form.targetPv} onChange={handleChange} placeholder="1000" disabled={isLoading}
                className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium disabled:opacity-50" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the promotion details, terms, and conditions..." rows={6} disabled={isLoading}
                className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium resize-none disabled:opacity-50" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-emerald-50 dark:border-white/5">
          <button onClick={onBack} disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 hover:bg-white transition-all disabled:opacity-50">
            <X size={16} />
            <span>Cancel</span>
          </button>
          <Button onClick={handleSubmit} disabled={isLoading || !form.name}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-10 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-xl shadow-yellow-600/20 disabled:opacity-80 min-w-[200px] justify-center">
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /><span>{isEditing ? 'Updating...' : 'Creating...'}</span></>
            ) : (
              <><Check size={18} /><span>{isEditing ? 'Update Promotion' : 'Create Promotion'}</span></>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}; 