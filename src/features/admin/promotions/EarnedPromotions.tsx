import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Gift, Filter, ChevronDown, CheckCircle2, X, Loader2, Calendar, Medal } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';
import { earnedPromoService } from '@/lib/api/services/misc.service';
import type { EarnedPromo } from '@/lib/types/promotion.types';

interface EarnedPromotionsProps {
  onBack: () => void;
}

export const EarnedPromotions: React.FC<EarnedPromotionsProps> = ({ onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [promos, setPromos] = useState<EarnedPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchData = async (page = 1, filter = selectedFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await earnedPromoService.getAll(page, 10, filter);
      setPromos(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load earned promotions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1, selectedFilter); }, [selectedFilter]);

  const handleUpdateReceived = async (id: number, received: boolean) => {
    setUpdatingId(id);
    try {
      await earnedPromoService.updateReceived(id, received);
      setPromos(prev => prev.map(p => p.id === id ? { ...p, hasReceived: received } : p));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Achievements...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Promotion Error" message={error} onRetry={() => fetchData(1, selectedFilter)} onBack={onBack} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col space-y-4">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors font-bold text-sm group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Promotions</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 md:p-10 shadow-xl shadow-orange-500/20">
          <div className="relative z-10 flex items-center space-x-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
              <Gift size={32} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">Earned Promotions</h1>
              <p className="text-orange-100 font-medium">View all promotions earned by members</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-slate-500">
          <Filter size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Filter by Status</span>
        </div>
        <div className="relative">
          <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
            <option value="ALL">All Promotions</option>
            <option value="TRUE">Received</option>
            <option value="FALSE">Not Received</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={20} />
          </div>
        </div>
      </Card>

      {promos.length === 0 ? (
        <Card className="p-20 border-none shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
            <Gift size={64} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No promotions found</h3>
            <p className="text-slate-500 font-medium">No promotions have been earned yet.</p>
          </div>
        </Card>
      ) : (
        <Card noPadding className="overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">S/N</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Promotion</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prize</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target PV</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Earned</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Received</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {promos.map((promo, i) => (
                  <motion.tr key={promo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 text-sm font-black text-slate-400">{i + 1}.</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center text-xs font-black">
                          {promo.member?.firstName?.[0] ?? '?'}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {promo.member?.firstName} {promo.member?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Medal size={14} className="text-amber-500" />
                        <span className="text-sm font-bold">{promo.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">₦{promo.prize?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{promo.targetPv?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                        <Calendar size={14} />
                        <span>{promo.dateEarned ? new Date(promo.dateEarned).toLocaleDateString() : '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        promo.hasReceived
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {promo.hasReceived ? 'Received' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-2">
                        {!promo.hasReceived && (
                          <button onClick={() => handleUpdateReceived(promo.id, true)} disabled={updatingId === promo.id}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50" title="Mark as Received">
                            {updatingId === promo.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          </button>
                        )}
                        {promo.hasReceived && (
                          <button onClick={() => handleUpdateReceived(promo.id, false)} disabled={updatingId === promo.id}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50" title="Mark as Not Received">
                            {updatingId === promo.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 p-4 border-t border-slate-100 dark:border-white/5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => { setCurrentPage(page); fetchData(page, selectedFilter); }}
                  className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                    currentPage === page ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}>
                  {page}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};