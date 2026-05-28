import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '@/lib/config/api';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Building2, 
  ArrowLeft,
  Check,
  UserCircle,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useAuthStore, selectMember } from "@/lib/store/authStore";
import {BANKS} from "@/lib/constants/bank";
import { memberService } from '@/lib/api/services/member.service';
import { formatCurrency } from '@/lib/utils/format';
import { DashboardMetrics } from '@/lib/types/metrics.types';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [receivePayment, setReceivePayment] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState("");
  const member = useAuthStore(selectMember);
  const [oldPassword, setOldPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null); // ← ADD THIS
  
const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/members`);
    setDashboardData(response.data);
    setIsLoading(false);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load dashboard metrics.");
    setIsLoading(false);
  }
};

// ← THIS WAS MISSING
useEffect(() => {
  if (member?.id) {
    fetchData();
  }
}, [member?.id]);

  const joinedDate = member?.registered_on
  ? new Date(member.registered_on).toLocaleDateString("en-NG", {
    year: "numeric",  
      month: "long",
    day: "numeric",
    })
  : "N/A";


  const handleChangePassword = async () => {
  if (!member?.id) return;
  setIsSavingPassword(true);
  try {
    await memberService.changePassword(member.id, {
      oldPassword: oldPassword,   // from input state
      newPassword: newPassword,   // from input state
    });
    alert('Password changed successfully!');
  } catch (err) {
    alert('Failed to change password. Check your old password.');
  } finally {
    setIsSavingPassword(false);
  }
};

  const handleSaveBankDetails = async () => {
    setIsSavingBank(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSavingBank(false);
    alert("Bank details saved successfully!");
  };

  


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading your profile settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Settings Error"
        message={error}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </button>

      {/* Profile Header Card */}
      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        <div className="bg-amber-400 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
                <User size={64} className="text-white" />
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <UserCircle size={20} className="text-amber-400" />
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tight"> {member?.firstName} {member?.lastName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20">
                  {member?.memberType}
                </span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20">
                 {member?.packageId ? member.packageId : 'No Package'}
                </span>
                <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md text-emerald-100 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Personal Information */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-amber-400">
              <User size={20} />
              <h3 className="text-lg font-black tracking-tight text-emerald-950 dark:text-white uppercase">Personal Information</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-emerald-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="font-bold text-emerald-800 dark:text-emerald-100">{member?.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-emerald-400">
                  <UserCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Username</p>
                  <p className="font-bold text-emerald-800 dark:text-emerald-100"> {member?.username}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-emerald-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="font-bold text-emerald-800 dark:text-emerald-100">{member?.phone_number || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-emerald-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Member Since</p>
                  <p className="font-bold text-emerald-800 dark:text-emerald-100"> {joinedDate}</p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Enable Receive Payment</span>
                <button 
                  onClick={() => setReceivePayment(!receivePayment)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${receivePayment ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-emerald-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${receivePayment ? 'translate-x-7' : 'translate-x-0'}`} />
                  <span className="absolute right-2 top-1.5 text-[8px] font-black text-white uppercase">{receivePayment ? 'ON' : ''}</span>
                  <span className="absolute left-2 top-1.5 text-[8px] font-black text-white uppercase">{!receivePayment ? 'OFF' : ''}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Network Statistics */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-amber-400">
              <Building2 size={20} />
              <h3 className="text-lg font-black tracking-tight text-emerald-950 dark:text-white uppercase">Network Statistics</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Available Balance', value: formatCurrency(dashboardData?.available_balance ?? 0),  },
                { label: 'Awaiting Wallet', value: formatCurrency(dashboardData?.awaiting_wallet ?? 0),  },
                { label: 'Binary Left PV', value: String(dashboardData?.binary_left_pv ?? 0),  },
                { label: 'Binary Right PV', value: String(dashboardData?.binary_right_pv ?? 0),  },
                { label: 'Monthly Left PV', value: String(dashboardData?.monthly_left_pv ?? 0),  },
                { label: 'Monthly Right PV', value: String(dashboardData?.monthly_right_pv ?? 0),  },
              ].map((stat, i) => (
                <div key={i} className="p-5 bg-amber-50/50 dark:bg-amber-400/5 rounded-2xl border border-amber-100 dark:border-amber-400/10">
                  <p className="text-[10px] font-black text-amber-400 dark:text-amber-400 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="text-2xl font-black text-emerald-950 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="p-8 md:p-12 border-none shadow-xl">
        <div className="space-y-8">
          <div className="flex items-center space-x-3 text-amber-400">
            <Lock size={20} />
            <h3 className="text-lg font-black tracking-tight text-emerald-950 dark:text-white uppercase">Change Password</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-400 uppercase tracking-widest">Old Password</label>
              <input 
                type="password" 
                disabled={isSavingPassword}
                className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-400 uppercase tracking-widest">New Password</label>
                <input 
                  type="password" 
                  disabled={isSavingPassword}
                  className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-400 uppercase tracking-widest">Confirm New Password</label>
                <input 
                  type="password" 
                  disabled={isSavingPassword}
                  className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleChangePassword}
              isLoading={isSavingPassword}
              className="px-10 py-4 rounded-xl flex items-center space-x-2"
            >
              <Check size={18} />
              <span>Change Password</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Bank Account Details Card */}
      <Card className="p-8 md:p-12 border-none shadow-xl">
        <div className="space-y-8">
          <div className="flex items-center space-x-3 text-amber-400">
            <Building2 size={20} />
            <h3 className="text-lg font-black tracking-tight text-emerald-950 dark:text-white uppercase">Bank Account Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-400 uppercase tracking-widest">Account Name</label>
              <input 
                type="text" 
                disabled={isSavingBank}
                className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-400 uppercase tracking-widest">Bank Name</label>
             <select
  value={selectedBank}
  onChange={(e) => setSelectedBank(e.target.value)}
  disabled={isSavingBank}
  className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all appearance-none font-bold text-emerald-800 dark:text-emerald-100 disabled:opacity-50"
>
  <option value="">Select Bank</option>

  {BANKS.map((bank, index) => (
    <option key={index} value={bank}>
      {bank}
    </option>
  ))}
</select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-emerald-400 uppercase tracking-widest">Account Number</label>
              <input 
                type="text" 
                disabled={isSavingBank}
                className="w-full bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveBankDetails}
              isLoading={isSavingBank}
              className="px-10 py-4 rounded-xl flex items-center space-x-2"
            >
              <Check size={18} />
              <span>Save Bank Details</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
