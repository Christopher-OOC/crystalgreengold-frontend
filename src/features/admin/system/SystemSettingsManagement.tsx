import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  Settings,
  RefreshCw,
  Info,
  Check,
  Percent,
  Wallet,
  Zap,
  Users,
  Save,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { motion, AnimatePresence } from 'motion/react';
import { adminService, type SystemSetting } from '@/lib/api/services/admin.service';

interface SystemSettingsManagementProps {
  onBack: () => void;
}

type SettingCategory = 'commissions' | 'withdrawals' | 'pv' | 'growth';

interface SettingField {
  id: string;
  name: string;
  label: string;
  value: string;
  category: SettingCategory;
  description: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Maps backend setting names → human-readable metadata
const SETTING_META: Record<string, { label: string; category: SettingCategory; description: string }> = {
  ic1:    { label: 'Indirect Commission Level 1',                  category: 'commissions', description: 'Percentage earned from direct referrals.' },
  ic2:    { label: 'Indirect Commission Level 2',                  category: 'commissions', description: 'Percentage earned from level 2 referrals.' },
  ic3:    { label: 'Indirect Commission Level 3',                  category: 'commissions', description: 'Percentage earned from level 3 referrals.' },
  ic4:    { label: 'Indirect Commission Level 4',                  category: 'commissions', description: 'Percentage earned from level 4 referrals.' },
  ic5:    { label: 'Indirect Commission Level 5',                  category: 'commissions', description: 'Percentage earned from level 5 referrals.' },
  lcf:    { label: 'Leadership Commission Factor',                 category: 'commissions', description: 'Base value for leadership bonus calculations.' },
  loc:    { label: 'Leadership Overall Commission',                category: 'commissions', description: 'Global percentage for leadership pool.' },
  mc1:    { label: 'Matching Commission Level 1',                  category: 'commissions', description: 'Matching bonus for level 1.' },
  mc2:    { label: 'Matching Commission Level 2',                  category: 'commissions', description: 'Matching bonus for level 2.' },
  mc3:    { label: 'Matching Commission Level 3',                  category: 'commissions', description: 'Matching bonus for level 3.' },
  minw:   { label: 'Minimum Withdrawal',                           category: 'withdrawals', description: 'Minimum amount a user can request for payout.' },
  mnrwln: { label: 'Monthly Newly Registered On Weak Leg Number',  category: 'growth',      description: 'Required new members on weak leg for monthly bonus.' },
  mnrwlp: { label: 'Monthly Newly Registered On Weak Leg Price',   category: 'growth',      description: 'Required sales volume on weak leg for monthly bonus.' },
  pcf:    { label: 'Pv Commission Factor',                         category: 'pv',          description: 'Multiplier for PV to currency conversion.' },
  pe:     { label: 'Pv Equivalence',                               category: 'pv',          description: 'Amount of currency equal to 1 PV.' },
};

function mapApiSettings(raw: SystemSetting[]): SettingField[] {
  return raw.map((s) => {
    const meta = SETTING_META[s.name] ?? {
      label: s.name,
      category: 'commissions' as SettingCategory,
      description: s.description ?? '',
    };
    return {
      id: s.id,
      name: s.name,
      label: meta.label,
      value: s.value,
      category: meta.category,
      description: meta.description || s.description || '',
      updatedAt: s.updatedAt,
      updatedBy: s.updatedBy,
    };
  });
}

export const SystemSettingsManagement: React.FC<SystemSettingsManagementProps> = ({ onBack }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | SettingCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingField[]>([]);
  const [lastUpdated, setLastUpdated] = useState<{ date: string; by: string } | null>(null);

  // Track in-progress edits: { [id]: newValue }
  const editsRef = useRef<Record<string, string>>({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    editsRef.current = {};
    try {
      const raw = await adminService.getSettings();
      const mapped = mapApiSettings(raw);
      setSettings(mapped);

      // Pick the most recently updated entry for the sidebar metadata
      const latest = [...mapped].sort((a, b) =>
        (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
      )[0];
      if (latest?.updatedAt) {
        setLastUpdated({
          date: new Date(latest.updatedAt).toLocaleDateString('en-NG', {
            year: 'numeric', month: 'long', day: 'numeric',
          }),
          by: latest.updatedBy ?? 'Admin',
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load system settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async () => {
    const changed = Object.entries(editsRef.current).map(([id, value]) => ({ id, value }));
    if (changed.length === 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }
    setIsSaving(true);
    try {
      await adminService.updateAllSettings(changed);
      // Optimistically update local state
      setSettings(prev =>
        prev.map(s => (editsRef.current[s.id] !== undefined
          ? { ...s, value: editsRef.current[s.id] }
          : s
        ))
      );
      editsRef.current = {};
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { id: 'all',         label: 'All Settings',    icon: Settings },
    { id: 'commissions', label: 'Commissions',      icon: Percent },
    { id: 'withdrawals', label: 'Withdrawals',      icon: Wallet },
    { id: 'pv',          label: 'PV & Points',      icon: Zap },
    { id: 'growth',      label: 'Growth & Goals',   icon: Users },
  ];

  const filteredSettings = activeCategory === 'all'
    ? settings
    : settings.filter(s => s.category === activeCategory);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading System Settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Settings Error"
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
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <Settings size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Business Settings</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={fetchData}
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-xl flex items-center space-x-2 font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={isSaving}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
              activeCategory === cat.id 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl' 
                : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
            }`}
          >
            <cat.icon size={14} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
            {filteredSettings.length === 0 ? (
              <p className="text-slate-400 font-bold text-center py-8">No settings found in this category.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <AnimatePresence mode="popLayout">
                  {filteredSettings.map((field) => (
                    <motion.div 
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                          {field.label}
                        </label>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info size={14} className="text-slate-300" />
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="text"
                          defaultValue={field.value}
                          onChange={(e) => {
                            editsRef.current[field.id] = e.target.value;
                          }}
                          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-xl py-3 px-5 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-black text-slate-800 dark:text-white text-lg"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {field.description}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-2xl bg-blue-600 text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Info size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Info size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">System Guide</h3>
              <p className="text-blue-100 text-sm leading-relaxed font-medium">
                These settings control the core financial and growth logic of the entire Topnivo platform.
              </p>
              <ul className="space-y-3">
                {[
                  'Changes apply globally to all members',
                  'Commission updates affect future calculations',
                  'Withdrawal limits are enforced immediately',
                  'PV factors impact wallet balances'
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm font-bold text-white/90">
                    <Check size={16} className="shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl bg-slate-900 dark:bg-black text-white space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Last Updated</h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <RefreshCw size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="font-black text-lg">
                  {lastUpdated?.date ?? '—'}
                </p>
                <p className="text-xs text-slate-500 font-bold">
                  {lastUpdated?.by ? `by ${lastUpdated.by}` : 'No update history'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 flex items-center space-x-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/40 font-black uppercase tracking-widest text-xs"
          >
            <Check size={20} />
            <span>Settings Updated Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
