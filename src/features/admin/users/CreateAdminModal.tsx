// src/components/admin/members/CreateAdminModal.tsx

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, UserCog, Mail, Phone, User, Shield, Crown, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { adminService } from '@/lib/api/services/admin.service';
import type { AdminUser } from '@/lib/api/services/admin.service';

type AdminRole = 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';

interface CreateAdminModalProps {
  admin?: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  admin,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: admin?.username || '',
    email: admin?.email || '',
    firstName: admin?.firstName || '',
    lastName: admin?.lastName || '',
    phoneNumber: admin?.phoneNumber || '',
    password: '',
    confirmPassword: '',
    role: (admin?.roles?.some(r => r.name === 'ROLE_SUPER_ADMIN') ? 'ROLE_SUPER_ADMIN' : 'ROLE_ADMIN') as AdminRole
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!admin && !formData.username) {
      setError('Username is required');
      return;
    }
    if (!admin && !formData.email) {
      setError('Email is required');
      return;
    }
    if (!admin && !formData.password) {
      setError('Password is required');
      return;
    }
    if (!admin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (admin) {
        // Update existing admin
        await adminService.update(admin.memberId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        });
      } else {
        // Create new admin
        await adminService.create({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
        });
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Error saving admin:', err);
      setError(err?.response?.data?.message || 'Failed to save admin user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl"
      >
        <Card className="p-0 overflow-hidden border-none shadow-2xl">
          {/* Header */}
          <div className="relative bg-linear-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <UserCog size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {admin ? 'Edit Admin User' : 'Create New Admin User'}
                </h2>
                <p className="text-yellow-100 text-xs font-medium mt-0.5">
                  {admin ? 'Update admin information' : 'Add a new administrator to the system'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username - only for new admins */}
              {!admin && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                    <User size={12} />
                    <span>Username *</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                    placeholder="admin_username"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <Mail size={12} />
                  <span>Email *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={!!admin}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium disabled:opacity-50"
                  placeholder="admin@example.com"
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <User size={12} />
                  <span>First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                  placeholder="John"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <User size={12} />
                  <span>Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                  placeholder="Doe"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <Phone size={12} />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                  placeholder="+234 800 000 0000"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <Shield size={12} />
                  <span>Admin Role</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                >
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {/* Password - only for new admins */}
              {!admin && (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                      <Lock size={12} />
                      <span>Password *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-700"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                      <Lock size={12} />
                      <span>Confirm Password *</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald-50 dark:border-white/5">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>{admin ? 'Update Admin' : 'Create Admin'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
