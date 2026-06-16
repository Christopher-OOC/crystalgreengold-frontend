import React, { useState, useEffect } from 'react';
import { X, Building, User, Phone, Mail, MapPin, Key } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { serviceCenterService } from '@/lib/api/services/service-center.service';
import type { ServiceCenter } from '@/lib/types/service-center.types';

interface CreateServiceCenterModalProps {
  center?: ServiceCenter | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateServiceCenterModal: React.FC<CreateServiceCenterModalProps> = ({
  center, onClose, onSuccess
}) => {
  const isEditing = !!center;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const [formData, setFormData] = useState({
    username: '',
    email: center?.email || '',
    firstName: center?.firstName || '',
    lastName: center?.lastName || '',
    phoneNumber: center?.phoneNumber || '',
    address: center?.address || '',
    businessName: center?.businessName || '',
    sponsorId: '',      // ← MUST be empty string, not 'sddfdddf'
    placementId: '',    // ← MUST be empty string, not 'dfdfdf'
    leg: '' as 'LEFT' | 'RIGHT' | '',
});


  // Token monitoring and restoration
  useEffect(() => {
    console.log('=== CreateServiceCenterModal Mounted ===');
    const initialToken = localStorage.getItem('crystalgreengold_access_token');
    console.log('Initial token in modal:', initialToken ? `${initialToken.substring(0, 30)}...` : 'NULL');
    
    // Check if token exists in Zustand store
    const authStore = localStorage.getItem('crystalgreengold-auth');
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        const storeToken = parsed.state?.accessToken;
        console.log('Token in Zustand store:', storeToken ? `${storeToken.substring(0, 30)}...` : 'NULL');
        
        // If token exists in store but not in localStorage, restore it
        if (storeToken && !initialToken) {
          console.log('⚠️ Restoring token from Zustand store');
          localStorage.setItem('crystalgreengold_access_token', storeToken);
          if (parsed.state?.refreshToken) {
            localStorage.setItem('crystalgreengold_refresh_token', parsed.state.refreshToken);
          }
        }
      } catch (e) {
        console.error('Failed to parse auth store:', e);
      }
    }
    
    // Monitor token changes
    let lastToken = localStorage.getItem('crystalgreengold_access_token');
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('crystalgreengold_access_token');
      if (currentToken !== lastToken) {
        console.log('🔑 Token changed in modal!');
        console.log('Previous:', lastToken ? `${lastToken.substring(0, 30)}...` : 'NULL');
        console.log('Current:', currentToken ? `${currentToken.substring(0, 30)}...` : 'NULL');
        if (!currentToken && lastToken) {
          console.trace('🔴 TOKEN WAS CLEARED in modal!');
        }
        lastToken = currentToken;
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const set = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!isEditing && !formData.username.trim()) { setError('Username is required'); return false; }
    if (!formData.email.trim()) { setError('Email is required'); return false; }
    if (!formData.phoneNumber.trim()) { setError('Phone number is required'); return false; }
    if (!formData.address.trim()) { setError('Address is required'); return false; }
    if (!formData.businessName.trim()) { setError('Business name is required'); return false; }
    return true;
  };

 // In CreateServiceCenterModal.tsx, simplify handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  
  setIsLoading(true);
  setError(null);
  
  try {
    if (isEditing && center) {
      await serviceCenterService.update(center.memberId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        businessName: formData.businessName,
      });
    } else {
      // Create local center - sponsor/placer/leg are included in the request object
      // The service will handle converting them to query params
      await serviceCenterService.create({
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        businessName: formData.businessName,
        sponsorId: formData.sponsorId || undefined,
        placementId: formData.placementId || undefined,
        leg: formData.leg || undefined,
      });
    }
    onSuccess();
  } catch (err: any) {
    console.error('Submit error:', err);
    setError(err?.response?.data?.message || err?.message || 'Failed to save local center.');
  } finally {
    setIsLoading(false);
  }
};

  const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-emerald-900 border border-emerald-100 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all outline-none font-medium text-sm disabled:opacity-50";
  const iconInputClass = "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-emerald-900 border border-emerald-100 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all outline-none font-medium text-sm disabled:opacity-50";
  const labelClass = "block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5";
  const sectionHeaderClass = "flex items-center space-x-2 border-b border-emerald-100 dark:border-white/10 pb-2 mb-4";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0 shadow-2xl border-none">
        <div className="sticky top-0 bg-white dark:bg-emerald-950 border-b border-emerald-100 dark:border-white/10 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-black text-emerald-950 dark:text-white">
              {isEditing ? 'Edit Local Center' : 'Add New Local Center'}
            </h2>
            <p className="text-sm text-emerald-600 mt-1">
              {isEditing ? 'Update local center information' : 'Create a new local center in the network'}
            </p>
          </div>
          <button onClick={onClose} disabled={isLoading}
            className="p-2 hover:bg-emerald-50 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50">
            <X size={20} className="text-emerald-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)}><X size={14} /></button>
            </div>
          )}

          {/* Account Info — create only */}
          {!isEditing && (
            <div>
              <div className={sectionHeaderClass}>
                <Key size={16} className="text-yellow-500" />
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Username *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input type="text" value={formData.username} onChange={(e) => set('username', e.target.value)}
                      disabled={isLoading} placeholder="e.g. sc_lagos" className={iconInputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input type="email" value={formData.email} onChange={(e) => set('email', e.target.value)}
                      disabled={isLoading} placeholder="center@email.com" className={iconInputClass} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-emerald-400 mt-2 italic">
                A default password (admin123) will be assigned. The manager can change it after login.
              </p>
            </div>
          )}

          {/* Personal Info */}
          <div>
            <div className={sectionHeaderClass}>
              <User size={16} className="text-yellow-500" />
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Manager Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input type="text" value={formData.firstName} onChange={(e) => set('firstName', e.target.value)}
                  disabled={isLoading} placeholder="First name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" value={formData.lastName} onChange={(e) => set('lastName', e.target.value)}
                  disabled={isLoading} placeholder="Last name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input type="tel" value={formData.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)}
                    disabled={isLoading} placeholder="+234..." className={iconInputClass} />
                </div>
              </div>
              {isEditing && (
                <div>
                  <label className={labelClass}>Email *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input type="email" value={formData.email} onChange={(e) => set('email', e.target.value)}
                      disabled={isLoading} placeholder="Email" className={iconInputClass} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Info */}
          <div>
            <div className={sectionHeaderClass}>
              <Building size={16} className="text-yellow-500" />
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Business Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Business Name *</label>
                <input type="text" value={formData.businessName} onChange={(e) => set('businessName', e.target.value)}
                  disabled={isLoading} placeholder="e.g. crystalgreengold Lagos Center" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address *</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-3 text-emerald-400" />
                  <textarea rows={2} value={formData.address} onChange={(e) => set('address', e.target.value)}
                    disabled={isLoading} placeholder="Full address"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-emerald-900 border border-emerald-100 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all outline-none font-medium text-sm resize-none disabled:opacity-50" />
                </div>
              </div>
            </div>
          </div>

          {/* MLM Placement — create only */}
          {!isEditing && (
            <div>
              <div className={sectionHeaderClass}>
                <User size={16} className="text-yellow-500" />
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">MLM Placement <span className="normal-case font-normal">(optional)</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Sponsor Username</label>
                  <input type="text" value={formData.sponsorId} onChange={(e) => set('sponsorId', e.target.value)}
                    disabled={isLoading} placeholder="Optional" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Placer Username</label>
                  <input type="text" value={formData.placementId} onChange={(e) => set('placementId', e.target.value)}
                    disabled={isLoading} placeholder="Optional" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Leg</label>
                  <select value={formData.leg} onChange={(e) => set('leg', e.target.value)} disabled={isLoading} className={inputClass}>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-emerald-100 dark:border-white/10">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="px-6 py-2.5 bg-emerald-50 dark:bg-white/5 hover:bg-emerald-100 dark:hover:bg-white/10 text-emerald-800 dark:text-emerald-200 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-80 min-w-[140px] flex items-center justify-center">
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </span>
              ) : (
                <span>{isEditing ? 'Update Center' : 'Create Center'}</span>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
