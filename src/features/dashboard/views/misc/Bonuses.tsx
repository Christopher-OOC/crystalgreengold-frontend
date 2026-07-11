import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useAuthStore, selectMember } from '@/lib/store/authStore';
import { bonusService } from '@/lib/api/services/misc.service';
import { formatCurrency } from '@/lib/utils/format';
import type { Bonus } from '@/lib/types/bonus.types';


const commissionTypes = [
  'ALL',
  'DIRECT_REFERRAL',
  'INDIRECT_REFERRAL',
  'BINARY_COMMISSION',
  'MATCHING_COMMISSION',
  'UPGRADE_COMMISSION',
  'UNILEVEL_COMMISSION',
  'REPURCHASE_COMMISSION',
  'SERVICE_CENTER_COMMISSION',
  'PREMIUM_STORE_COMMISSION',
  'CHECK_MARCH_COMMISSION',
  'LEADERSHIP_CELEBRATION_COMMISSION',
  'RANK_COMMISSION',
  'LEADERSHIP_COMMISSION',
  'NEWLY_REGISTERED_COUNTER_COMMISSION',
  'HIGHEST_RANKING_COMMISSION'
];

export const Bonuses: React.FC = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const member = useAuthStore(selectMember);

  const formatBonusType = (type?: string) => {
    if (!type) return 'unknown bonus';
    return type.replace(/_/g, ' ').toLowerCase();
  };

  const fetchData = async () => {
    if (!member?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await bonusService.getByMember(member.id, currentPage, pageSize, typeFilter);
      setBonuses(result.data);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching bonuses:', err);
      setError(err?.response?.data?.message || err.message || "Failed to load bonus data.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [member?.id, currentPage, pageSize, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, pageSize]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading bonuses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Bonus Data Error"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Bonuses & Commissions</h2>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">Track your earnings and rewards</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-emerald-600 whitespace-nowrap">Commission Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-bold text-emerald-800 dark:text-emerald-100"
            >
              {commissionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Card noPadding className="overflow-hidden border-none shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-white/5 border-b border-emerald-50 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">S/N</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">CommissionType</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Earned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white dark:divide-white/5">
              {bonuses.map((bonus, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-6 py-5 text-sm font-bold text-emerald-950 dark:text-white">{(currentPage - 1) * pageSize + i + 1}.</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                      {bonus.commissionType}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                   Bonus earned from {formatBonusType(bonus.commissionType)}
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-emerald-950 dark:text-white">{formatCurrency(bonus.amount)}</td>
                  <td className="px-6 py-5 text-sm font-bold text-emerald-400">
                    {bonus.earnedDate ? new Date(bonus.earnedDate).toLocaleString() : 'N/A'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-white dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Showing {totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalElements)} of {totalElements} entries
          </p>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Display</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-lg py-1 px-3 outline-none text-xs font-bold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">entries</label>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 bg-amber-400 text-white rounded-lg font-bold shadow-lg shadow-amber-400/20 text-xs">
                {currentPage}
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
