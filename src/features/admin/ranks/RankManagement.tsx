import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, ArrowLeft, Edit, Search, Trophy, Loader2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { CreateRank } from '@/features/admin/ranks/CreateRank';
import { rankService } from '@/lib/api/services/rank.service';
import type { Rank } from '@/lib/types/rank.types';

interface RankManagementProps {
  onBack: () => void;
}

export const RankManagement: React.FC<RankManagementProps> = ({ onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranks, setRanks] = useState<Rank[]>([]);

  const fetchRanks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rankService.getAll();
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => a.rankValue - b.rankValue)
        : [];
      setRanks(sorted);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load ranks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRanks(); }, []);

  const filteredRanks = ranks.filter(rank =>
    rank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Ranks', value: ranks.length.toString(), color: 'border-emerald-500' },
    { label: 'Highest Rank Value', value: ranks.length > 0 ? Math.max(...ranks.map(r => r.rankValue)).toString() : '0', color: 'border-emerald-500' },
    { label: 'Total Prize (₦)', value: ranks.reduce((sum, r) => sum + r.prize, 0).toLocaleString(), color: 'border-purple-500' },
    { label: 'Total Qualifying BV', value: ranks.reduce((sum, r) => sum + r.qualifyingBv, 0).toLocaleString(), color: 'border-yellow-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Rank Data...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Rank Error" message={error} onRetry={fetchRanks} onBack={onBack} />;
  }

  if (isCreating) {
    return <CreateRank onBack={() => { setIsCreating(false); fetchRanks(); }} />;
  }

  if (editingRank) {
    return <CreateRank onBack={() => { setEditingRank(null); fetchRanks(); }} initialData={editingRank} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button onClick={onBack} className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm mb-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight">Rank Management</h1>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">Define and manage member ranking levels</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 font-black uppercase tracking-widest">
          <Plus size={20} />
          <span>Create New Rank</span>
        </Button>
      </div>

      <Card className="p-4 border-none shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
          <input type="text" placeholder="Search ranks by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium" />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className={`p-6 border-l-4 ${stat.color} shadow-xl`}>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-emerald-950 dark:text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        {filteredRanks.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={48} className="mx-auto text-emerald-200 mb-4" />
            <p className="text-emerald-600 font-medium">No ranks found.</p>
            <Button onClick={() => setIsCreating(true)} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white">
              Create your first rank
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-white/5 border-b border-emerald-50 dark:border-white/5">
                  <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">#</th>
                  <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">NAME</th>
                  <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">QUALIFYING BV</th>
                  <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">PRIZE (₦)</th>
                  <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">RANK VALUE</th>
                  <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white dark:divide-white/5">
                {filteredRanks.map((rank, i) => (
                  <motion.tr key={rank.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 text-sm font-black text-emerald-400">{i + 1}</td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-tight">{rank.name}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{rank.qualifyingBv?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-emerald-950 dark:text-white">₦{rank.prize?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-black text-sm">
                        {rank.rankValue}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end">
                        <button onClick={() => setEditingRank(rank)}
                          className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-600 transition-colors font-black uppercase tracking-widest text-xs">
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};