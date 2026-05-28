import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Calendar, Shield, Trophy, MapPin,
  Camera, Edit3, ExternalLink, CheckCircle2, Award, Users,
  TrendingUp, ArrowLeft, Lock, Building2, Check, CreditCard,
  LayoutDashboard, Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useAuthStore, selectMember } from "@/lib/store/authStore";

interface ProfileProps {
  onBack: () => void;
  onViewAnalysis: () => void;
}

type ProfileTab = 'overview' | 'analysis';

export const Profile: React.FC<ProfileProps> = ({ onBack, onViewAnalysis }) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage] = useState('https://picsum.photos/seed/faith/400/400');

  const member = useAuthStore(selectMember);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call for profile data
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.99) reject(new Error("Failed to load profile data"));
          else resolve(true);
        }, 1000);
      });
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Safe member defaults to prevent uncontrolled → controlled warnings
  const safeMember = {
    firstName: member?.firstName ?? '',
    lastName: member?.lastName ?? '',
    email: member?.email ?? '',
    username: member?.username ?? '',
    memberType: member?.memberType ?? 'REGULAR_MEMBER',
    location: member?.address ?? '',
    joinDate: member?.registered_on ?? '',
    rank: member?.rank ?? 'N/A',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analysis', label: 'Analysis', icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <ErrorState 
          title="Profile Error"
          message={error}
          onRetry={fetchData}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors font-bold text-xs group mb-1"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">My Profile</h2>
          <p className="text-slate-500 font-medium text-xs">
            Manage your personal information and account security
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.id === 'analysis' ? onViewAnalysis() : setActiveSubTab(tab.id as ProfileTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Hero Profile Section */}
            <div className="relative">
              <div className="h-32 md:h-40 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-[24px] shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <div className="px-6 -mt-14 relative z-10">
                <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-[24px] bg-white dark:bg-slate-900 p-1.5 shadow-xl border border-white/10">
                      <div className="w-full h-full rounded-[18px] overflow-hidden relative">
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 pb-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {safeMember.firstName} {safeMember.lastName}
                      </h1>
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded-md uppercase tracking-widest border border-amber-500/20">
                        Pro Member
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-slate-500 dark:text-slate-400 font-medium text-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} className="text-amber-500" />
                        <span>{safeMember.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} className="text-amber-500" />
                        <span>{safeMember.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats & Account Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <Card className="p-4 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Stats</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Referrals', value: '124', icon: Users },
                      { label: 'Success Rate', value: '88%', icon: TrendingUp },
                      { label: 'Rank Points', value: '2,450', icon: Award },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                            <stat.icon size={16} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{stat.label}</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Account Overview</h3>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Status</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{safeMember.firstName} {safeMember.lastName}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{safeMember.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Username</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">@{safeMember.username}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Membership Type</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{safeMember.memberType}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <p className="text-2xl font-black mb-0.5">+24.5%</p>
                    <p className="text-[9px] text-white/70 uppercase tracking-widest font-black">Monthly Growth</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none">
                    <p className="text-2xl font-black mb-0.5">
                      {typeof safeMember.rank === 'string' ? safeMember.rank : safeMember.rank?.name ?? 'N/A'}
                    </p>
                    <p className="text-[9px] text-white/70 uppercase tracking-widest font-black">Next Rank</p>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
