import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useAuthStore, selectMember } from '@/lib/store/authStore';
import { transactionService } from '@/lib/api/services/misc.service';
import { formatCurrency } from '@/lib/utils/format';
import type { Transaction } from '@/lib/types/transaction.types';


export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [displayEntries, setDisplayEntries] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const member = useAuthStore(selectMember);

  const fetchData = async () => {
    if (!member?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionService.getByMember(member.id);
      setTransactions(Array.isArray(data) ? data : []);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch transactions.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [member?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Transaction Load Error"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Transactions</h2>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">View and track all your financial activities</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-emerald-600 whitespace-nowrap">Transaction Type:</label>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all text-sm font-bold text-emerald-800 dark:text-emerald-100"
            >
              <option value="ALL">ALL</option>
              <option value="ACTIVATE_PACKAGE">ACTIVATE_PACKAGE</option>
              <option value="UPGRADE_PACKAGE">UPGRADE_PACKAGE</option>
              <option value="BUY_PACKAGE">BUY_PACKAGE</option>
              <option value="BUY_PRODUCT">BUY_PRODUCT</option>
              <option value="WITHDRAWAL">WITHDRAWAL</option>
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
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Reference ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white dark:divide-white/5">
              {transactions.map((tx, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-5 text-sm font-bold text-emerald-950 dark:text-white">{i + 1}.</td>
                  <td className="px-6 py-5 text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">{tx.reference || 'N/A'}</td>
                  <td className="px-6 py-5 text-sm font-black text-emerald-950 dark:text-white">{formatCurrency(tx.amount)}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${
                      tx.status === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' :
                      tx.status === 'NOT_CONFIRMED' ? 'bg-amber-100 dark:bg-amber-400/10 text-amber-400 dark:text-amber-400' :
                      'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-emerald-400">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-white dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Showing 1 to {transactions.length} of {transactions.length} entries
          </p>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Display</label>
              <select 
                value={displayEntries}
                onChange={(e) => setDisplayEntries(Number(e.target.value))}
                className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-lg py-1 px-3 outline-none text-xs font-bold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">entries</label>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 bg-amber-400 text-white rounded-lg font-bold shadow-lg shadow-amber-400/20 text-xs">
                1
              </button>
              <button className="p-2 rounded-lg border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
