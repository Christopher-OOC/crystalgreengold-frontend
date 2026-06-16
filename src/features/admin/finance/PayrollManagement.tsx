import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft,
  DollarSign,
  Download,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Users,
  Building2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';

interface PayrollRecord {
  id: number;
  period: string;
  totalAmount: number;
  membersCount: number;
  status: 'Completed' | 'Pending' | 'Processing';
  generatedDate: string;
}

interface PayrollManagementProps {
  onBack: () => void;
}

export const PayrollManagement: React.FC<PayrollManagementProps> = ({ onBack }) => {
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
            reject(new Error("Failed to load payroll history. Please check your connection."));
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

  const payrollRecords: PayrollRecord[] = [
    { id: 1, period: 'March 1 - March 15, 2026', totalAmount: 45250.50, membersCount: 124, status: 'Completed', generatedDate: '2026-03-12' },
    { id: 2, period: 'February 16 - February 28, 2026', totalAmount: 38900.00, membersCount: 118, status: 'Completed', generatedDate: '2026-02-28' },
    { id: 3, period: 'February 1 - February 15, 2026', totalAmount: 41200.75, membersCount: 120, status: 'Completed', generatedDate: '2026-02-15' },
    { id: 4, period: 'January 16 - January 31, 2026', totalAmount: 35600.00, membersCount: 115, status: 'Completed', generatedDate: '2026-01-31' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Payroll Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Payroll Error"
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
            className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm mb-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Payouts</span>
          </button>
          <h1 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight">Payroll Management</h1>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">History and records of generated payrolls</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
            <Download size={20} />
            <span>Export All</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-xl bg-white dark:bg-emerald-950">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Paid</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">₦160,951.25</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Last 4 periods</p>
        </Card>

        <Card className="p-6 border-none shadow-xl bg-white dark:bg-emerald-950">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Members</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">477</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Unique recipients</p>
        </Card>

        <Card className="p-6 border-none shadow-xl bg-white dark:bg-emerald-950">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Next Run</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">March 31</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Scheduled processing</p>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by period..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-6 py-3 bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-100 transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-white/5 border-b border-emerald-50 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Period</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center">Members</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Generated Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white dark:divide-white/5">
              {payrollRecords.map((record, i) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/50 dark:hover:bg-white/2 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                        <Calendar size={18} />
                      </div>
                      <span className="text-sm font-black text-emerald-950 dark:text-white tracking-tight">{record.period}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{record.membersCount}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-emerald-950 dark:text-white">₦{record.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-emerald-400">{record.generatedDate}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      record.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      record.status === 'Processing' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="View Details">
                        <ChevronRight size={18} />
                      </button>
                      <button className="p-2 text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-lg transition-all" title="Download PDF">
                        <Download size={18} />
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
