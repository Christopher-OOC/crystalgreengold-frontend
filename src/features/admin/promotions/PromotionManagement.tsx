import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, ArrowLeft, Edit, Trash2, Search, Megaphone, Gift, Loader2, Frown } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { CreatePromotion } from '@/features/admin/promotions/CreatePromotion';
import { EarnedPromotions } from '@/features/admin/promotions/EarnedPromotions';
import { promotionService } from '@/lib/api/services/promotion.service';
import type { Promotion } from '@/lib/types/promotion.types';

interface PromotionManagementProps {
  onBack: () => void;
}

export const PromotionManagement: React.FC<PromotionManagementProps> = ({ onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showEarned, setShowEarned] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await promotionService.getAll();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load promotions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this promotion?')) return;
    setDeletingId(id);
    try {
      await promotionService.delete(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete promotion.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = promotions.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Promotions', value: promotions.length.toString(), color: 'border-blue-500' },
    { label: 'Active', value: promotions.filter(p => p.enabled).length.toString(), color: 'border-emerald-500' },
    { label: 'Total Prize (₦)', value: promotions.reduce((s, p) => s + p.prize, 0).toLocaleString(), color: 'border-purple-500' },
    { label: 'Avg Target PV', value: promotions.length > 0 ? (promotions.reduce((s, p) => s + p.targetPv, 0) / promotions.length).toFixed(0) : '0', color: 'border-orange-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Promotions...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Promotion Error" message={error} onRetry={fetchData} onBack={onBack} />;
  }

  if (isCreating) {
    return <CreatePromotion onBack={() => { setIsCreating(false); fetchData(); }} />;
  }

  if (showEarned) {
    return <EarnedPromotions onBack={() => setShowEarned(false)} />;
  }

  if (editingPromotion) {
    return <CreatePromotion onBack={() => { setEditingPromotion(null); fetchData(); }} initialData={editingPromotion} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors font-bold text-sm mb-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Promotions</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowEarned(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl">
            <Gift size={20} className="text-orange-500" />
            <span>Earned Promotions</span>
          </Button>
          <Button onClick={() => setIsCreating(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-xl shadow-orange-600/20">
            <Plus size={20} />
            <span>Create New Promotion</span>
          </Button>
        </div>
      </div>

      <Card className="p-4 border-none shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Search promotions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className={`p-6 border-l-4 ${stat.color} shadow-xl`}>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card noPadding className="overflow-hidden border-none shadow-2xl min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PROMOTION</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">TARGET PV</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">PRIZE</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DESCRIPTION</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">STATUS</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24">
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                        <Frown size={64} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">No promotions found</h3>
                        <p className="text-slate-500 font-medium">Get started by creating a new promotion.</p>
                      </div>
                      <Button onClick={() => setIsCreating(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest">
                        <Plus size={20} />
                        <span>New Promotion</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((promo, i) => (
                  <motion.tr key={promo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-50 dark:border-white/5">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        {promo.image ? (
                          <img src={promo.image} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                            <Megaphone size={18} />
                          </div>
                        )}
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{promo.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{promo.targetPv?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-slate-900 dark:text-white">₦{promo.prize?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">{promo.description}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        promo.enabled
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {promo.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => setEditingPromotion(promo)}
                          className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 transition-colors font-black uppercase tracking-widest text-xs px-3 py-2 hover:bg-orange-500/10 rounded-lg">
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDelete(promo.id)} disabled={deletingId === promo.id}
                          className="flex items-center space-x-1 text-rose-500 hover:text-rose-600 transition-colors font-black uppercase tracking-widest text-xs px-3 py-2 hover:bg-rose-500/10 rounded-lg disabled:opacity-50">
                          {deletingId === promo.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
