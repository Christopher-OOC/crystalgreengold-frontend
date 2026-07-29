import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Loader2,
  Send,
  RefreshCw,
  Search,
  User,
  Wallet,
  XCircle,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { fileService, paymentService } from '@/lib/api/services/misc.service';

type PayrollStatus = 'INITIALIZED' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED' | string;

interface PayrollMember {
  memberId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  availableBalance?: number;
  awaitingWallet?: number;
  canReceivePayment?: boolean;
  currentPackage?: {
    name?: string;
  } | null;
  accountDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
    bankType?: string;
    currency?: string;
  } | null;
}

interface PayrollEntry {
  id: number | string;
  member?: PayrollMember | null;
  reason?: string;
  transactionId?: string;
  amount: number;
  status?: PayrollStatus;
}

interface PayoutManagementProps {
  onBack: () => void;
  onNavigateToPayroll: () => void;
}

const formatCurrency = (amount?: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount ?? 0);

const getFullName = (member?: PayrollMember | null) => {
  const fullName = [member?.firstName, member?.lastName].filter(Boolean).join(' ').trim();
  return fullName || member?.username || member?.memberId || 'Unknown member';
};

const getStatusStyles = (status?: PayrollStatus) => {
  const normalized = (status || 'INITIALIZED').toUpperCase();

  if (normalized === 'SENT' || normalized === 'COMPLETED' || normalized === 'PAID' || normalized === 'SUCCESS') {
    return {
      icon: CheckCircle2,
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      label: normalized,
    };
  }

  if (normalized === 'FAILED' || normalized === 'REJECTED') {
    return {
      icon: XCircle,
      className: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      label: normalized,
    };
  }

  return {
    icon: Clock,
    className: 'bg-amber-400/10 text-amber-500 border-amber-400/20',
    label: normalized,
  };
};

export const PayoutManagement: React.FC<PayoutManagementProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isPayConfirmationOpen, setIsPayConfirmationOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payroll = await paymentService.getPayroll();
      const entries = Array.isArray(payroll)
        ? payroll
        : Array.isArray((payroll as any)?.entries)
          ? (payroll as any).entries
          : [];

      setPayrollEntries(entries);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load payroll.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataInBackground = async () => {
    try {
      const payroll = await paymentService.getPayroll();
      const entries = Array.isArray(payroll)
        ? payroll
        : Array.isArray((payroll as any)?.entries)
          ? (payroll as any).entries
          : [];

      setPayrollEntries(entries);
    } catch (err: any) {
      // Silently fail on background refresh to avoid interrupting user
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh payroll data every 1 minute without showing spinner
    const interval = setInterval(() => {
      fetchDataInBackground();
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      //await paymentService.preparePayroll();
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to generate payroll.');
    } finally {
      setIsGenerating(false);
    }
  };

  const payableEntries = useMemo(
    () => payrollEntries.filter(entry => (entry.status || 'INITIALIZED').toUpperCase() === 'INITIALIZED'),
    [payrollEntries],
  );

  const handlePayPayroll = async () => {
    if (!payableEntries.length || isPaying) return;

    setIsPaying(true);
    setError(null);

    try {
      await paymentService.sendPayroll({ entries: payableEntries.map(entry => ({
        id: String(entry.id),
        memberId: entry.member?.memberId || '',
        amount: entry.amount,
        accountNumber: entry.member?.accountDetails?.accountNumber,
        bankCode: entry.member?.accountDetails?.bankCode,
      })) });
      setIsPayConfirmationOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to send payroll payments.');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayrollDownload = async (format: string) => {
    if ((format !== 'normal' && format !== 'flutterwave') || isDownloading) return;

    setDownloadFormat(format);
    setIsDownloading(true);
    setError(null);

    try {
      const blob = await fileService.getPayrollReport(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'flutterwave' ? 'payroll-flutterwave.csv' : 'payroll-report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to download payroll report.');
    } finally {
      setIsDownloading(false);
      setDownloadFormat('');
    }
  };

  const statuses = useMemo(
    () => ['ALL', ...Array.from(new Set(payrollEntries.map(entry => entry.status || 'INITIALIZED')))],
    [payrollEntries],
  );

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return payrollEntries.filter(entry => {
      const member = entry.member;
      const account = member?.accountDetails;
      const matchesStatus = statusFilter === 'ALL' || (entry.status || 'INITIALIZED') === statusFilter;
      const searchable = [
        entry.id,
        entry.transactionId,
        entry.reason,
        member?.memberId,
        member?.firstName,
        member?.lastName,
        member?.username,
        member?.email,
        member?.phoneNumber,
        account?.accountName,
        account?.accountNumber,
        account?.bankName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [payrollEntries, searchQuery, statusFilter]);

  const totalAmount = filteredEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const initializedCount = payrollEntries.filter(
    entry => (entry.status || 'INITIALIZED').toUpperCase() === 'INITIALIZED',
  ).length;
  const pendingCount = payrollEntries.filter(
    entry => (entry.status || '').toUpperCase() === 'PENDING',
  ).length;
  const sentCount = payrollEntries.filter(entry => {
    const status = (entry.status || '').toUpperCase();
    return status === 'SENT' || status === 'PAID' || status === 'SUCCESS';
  }).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">
          Loading Payroll...
        </p>
      </div>
    );
  }

  if (error && payrollEntries.length === 0) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm mb-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight">
            Payroll Payouts
          </h1>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
            Review payroll recipients, bank details, payout amount, and transfer status.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-nowrap sm:justify-end">
          <Button
            onClick={handleGeneratePayroll}
            disabled={isGenerating}
            className="justify-center whitespace-nowrap bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl flex items-center space-x-1.5 font-black uppercase tracking-wider text-[10px] shadow-lg shadow-yellow-500/20"
          >
            {isGenerating ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
            <span>{isGenerating ? 'Generating...' : 'Generate Payroll'}</span>
          </Button>
          <Button
            onClick={() => setIsPayConfirmationOpen(true)}
            disabled={isPaying}
            className="justify-center whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-1.5 font-black uppercase tracking-wider text-[10px] shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isPaying ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            <span>{isPaying ? 'Paying...' : 'Pay'}</span>
          </Button>
          <div
            className="relative flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            <Download size={17} />
            <select
              aria-label="Choose CSV download format"
              value={downloadFormat}
              onChange={(event) => handlePayrollDownload(event.target.value)}
              disabled={isDownloading}
              className="min-w-[118px] appearance-none bg-transparent pr-5 outline-none"
            >
              <option value="" disabled>{isDownloading ? 'Downloading...' : 'Download as'}</option>
              <option value="normal">Normal CSV</option>
              <option value="flutterwave">Flutterwave CSV</option>
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-500">
          {error}
        </div>
      )}

      {isPayConfirmationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-confirmation-title"
        >
          <Card className="w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600">
              <Send size={22} />
            </div>
            <h2 id="pay-confirmation-title" className="text-xl font-black text-emerald-950 dark:text-white">
              Confirm payroll payment
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
              Only recipients with an <span className="font-black">INITIALIZED</span> status will receive a transfer. This will pay {payableEntries.length} recipient{payableEntries.length === 1 ? '' : 's'}.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => setIsPayConfirmationOpen(false)}
                disabled={isPaying}
                className="justify-center border border-emerald-100 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayPayroll}
                disabled={isPaying}
                className="justify-center bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700"
              >
                {isPaying ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                <span>{isPaying ? 'Processing...' : 'OK, Proceed'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Amount</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{formatCurrency(totalAmount)}</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <User className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Recipients</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{filteredEntries.length}</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <Clock className="text-amber-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Initialized</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{initializedCount}</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <Clock className="text-yellow-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Pending</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{pendingCount}</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Completed</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{sentCount}</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
          <input
            type="text"
            placeholder="Search member, transaction ID, bank..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium"
          />
        </div>
        <div className="relative w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full appearance-none px-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-black uppercase tracking-widest text-xs text-emerald-700 dark:text-emerald-300"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-white/5 border-b border-emerald-50 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Account Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Package</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white dark:divide-white/5">
              {filteredEntries.map((entry, index) => {
                const member = entry.member;
                const account = member?.accountDetails;
                const status = getStatusStyles(entry.status);
                const StatusIcon = status.icon;

                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/50 dark:hover:bg-white/2 transition-colors"
                  >
                    <td className="px-6 py-5 min-w-72">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                          <User size={18} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-emerald-950 dark:text-white">{getFullName(member)}</p>
                          <p className="text-xs font-bold text-emerald-600">@{member?.username || 'unknown'}</p>
                          <p className="text-xs text-emerald-500">{member?.email || 'No email'} • {member?.phoneNumber || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-64">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm font-black text-emerald-950 dark:text-white">
                          <Building2 size={14} className="text-emerald-500" />
                          <span>{account?.bankName || 'No bank'}</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-600">{account?.accountName || 'No account name'}</p>
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                          {account?.accountNumber || 'No account number'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-60">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-emerald-950 dark:text-white">{entry.transactionId || 'No transaction ID'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={16} className="text-yellow-500" />
                        <span className="text-sm font-black text-emerald-950 dark:text-white">
                          {formatCurrency(entry.amount, account?.currency || 'NGN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-44">
                      <div className="space-y-1 text-xs font-bold">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          {member?.currentPackage?.name || 'No package'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.className}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="py-16 text-center">
            <Wallet className="mx-auto text-emerald-200 mb-4" size={48} />
            <p className="text-sm font-black text-emerald-950 dark:text-white">No payroll entries found</p>
            <p className="text-xs text-emerald-500 mt-1">Generate payroll or adjust your search filters.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
