import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ArrowLeft,
  Medal,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';

interface EarnedPromotion {
  id: number;
  user: string;
  promotion: string;
  earnedDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  reward: string;
}

interface EarnedPromotionManagementProps {
  onBack: () => void;
}

export const EarnedPromotionManagement: React.FC<EarnedPromotionManagementProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.98) {
            reject(new Error("Failed to load earned promotions. Please try again."));
          } else {
            resolve(true);
          }
        }, 1300);
      });
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const earnedPromotions: EarnedPromotion[] = [
    { id: 1, user: 'Faith Okekeri', promotion: 'New Member Bonus', earnedDate: '2026-03-01', status: 'Approved', reward: 'Double PV' },
    { id: 2, user: 'John Doe', promotion: 'Ramadan Special', earnedDate: '2026-03-05', status: 'Pending', reward: '20% Cashback' },
    { id: 3, user: 'Sarah Smith', promotion: 'Winter Giveaway', earnedDate: '2025-12-25', status: 'Approved', reward: 'Luxury Watch' },
    { id: 4, user: 'Mike Johnson', promotion: 'New Member Bonus', earnedDate: '2026-03-06', status: 'Rejected', reward: 'Double PV' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Achievements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Promotion Error"
        message={error}
        onRetry={fetchData}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors font-bold text-sm mb-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Earned Promotions</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Track and approve member promotion achievements</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search member or promotion..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Earned Promotions Table */}
      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">S/N</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Promotion</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Earned Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {earnedPromotions.map((earned, i) => (
                <motion.tr 
                  key={earned.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-5 text-sm font-black text-slate-400">{i + 1}.</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center text-xs font-black">
                        {earned.user[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{earned.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Medal size={14} className="text-amber-500" />
                      <span className="text-sm font-bold">{earned.promotion}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{earned.reward}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                      <Calendar size={14} />
                      <span>{earned.earnedDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      earned.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      earned.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {earned.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end space-x-2">
                      {earned.status === 'Pending' && (
                        <>
                          <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Approve">
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Reject">
                            <Clock size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all">
                        <Users size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
