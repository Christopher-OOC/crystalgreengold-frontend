import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  Building2,
  User,
  DollarSign,
  RefreshCw,
  LayoutList,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';

interface Payout {
  id: number;
  user: string;
  amount: number;
  bank: string;
  accountNumber: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Rejected';
}

interface PayoutManagementProps {
  onBack: () => void;
  onNavigateToPayroll: () => void;
}

import { paymentService } from '@/lib/api/services/misc.service';
import type { Payment } from '@/lib/types/payment.types';

export const PayoutManagement: React.FC<PayoutManagementProps> = ({ onBack, onNavigateToPayroll }) => {
  const [view, setView] = useState<'list' | 'process' | 'generating'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Payment[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payroll = await paymentService.getPayroll();
      console.log("PAYROLL RESPONSE:", payroll);
      // If the backend returns an array directly, use it. Otherwise try .entries.
      // We check Array.isArray to avoid payroll.entries resolving to Array.prototype.entries.
      const entries = Array.isArray(payroll) ? payroll : (payroll?.entries || []);
      setPayouts(entries);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load payout requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGeneratePayroll = async () => {
    setView('generating');
    setIsProcessing(true);
    try {
      await paymentService.preparePayroll();
      onNavigateToPayroll();
    } catch(err: any) {
      alert(err.message || 'Failed to generate payroll');
      setView('list');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Payout Requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Payout Error"
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
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {view === 'list' ? 'Payouts' : view === 'process' ? 'Payroll Processing' : 'Generating Payroll'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {view === 'list'
              ? 'Process and manage member withdrawal requests'
              : view === 'process'
                ? 'Generate payroll for the current period'
                : 'Please wait while we process the payroll...'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {view === 'list' ? (
            <>
              <Button
                onClick={() => setView('process')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
              >
                <RefreshCw size={20} />
                <span>Process Payroll</span>
              </Button>
              <Button className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                <Download size={20} />
                <span>Export</span>
              </Button>
            </>
          ) : view === 'process' ? (
            <Button
              onClick={() => setView('list')}
              className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              <LayoutList size={20} />
              <span>View List</span>
            </Button>
          ) : null}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by member or bank..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">
                  <Filter size={16} />
                  <span>Filter Status</span>
                </button>
              </div>
            </div>

            {/* Payouts Table */}
            <Card noPadding className="overflow-hidden border-none shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Details</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {payouts.map((payout, i) => (
                      <motion.tr
                        key={payout.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center text-sm font-black">
                              <User size={18} />
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{payout.accountName || payout.memberId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                              <Building2 size={12} />
                              <span>Bank ID: {payout.bankId}</span>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {payout.accountNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-slate-900 dark:text-white">${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-400">—</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            payout.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            payout.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {payout.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end space-x-2">
                            {(!payout.status || payout.status === 'PENDING') && (
                              <>
                                <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Mark as Paid">
                                  <CheckCircle2 size={18} />
                                </button>
                                <button className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Reject">
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all">
                              <Clock size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        ) : view === 'process' ? (
          <motion.div
            key="process"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center py-12"
          >
            <Card className="max-w-2xl w-full p-12 border-none shadow-2xl space-y-10 text-center">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <DollarSign size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Payroll Processing</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Generate payroll for the current period</p>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-8 text-left space-y-4">
                <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                  <Wallet size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">Payroll Overview</span>
                </div>
                <ul className="space-y-3">
                  {[
                    'Calculates salaries, wages, bonuses, and deductions',
                    'Processes tax withholdings automatically',
                    'Generates pay stubs and direct deposit files'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-3 group">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
                      <span className="text-sm font-bold text-blue-700/70 dark:text-blue-300/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <Button
                  onClick={handleGeneratePayroll}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl flex items-center justify-center space-x-3 font-black uppercase tracking-widest shadow-xl shadow-orange-500/20"
                >
                  <RefreshCw size={20} />
                  <span>Generate Payroll</span>
                </Button>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Pay periods close on the 15th and last day of each month
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 space-y-8"
          >
            <div className="relative">
              <div className="w-32 h-32 border-4 border-orange-500/20 rounded-full" />
              <motion.div
                className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                <DollarSign size={40} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Generating Payroll...</h2>
              <p className="text-slate-500 font-medium">This may take a few moments. Please do not close this window.</p>
            </div>
            <div className="w-64 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
