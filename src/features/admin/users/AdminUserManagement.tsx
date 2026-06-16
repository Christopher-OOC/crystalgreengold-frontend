import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UserCog, 
  Shield, 
  Mail, 
  Lock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Key,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Crown,
  LogIn
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { adminService } from '@/lib/api/services/admin.service';
import type { AdminUser } from '@/lib/api/services/admin.service';
import { useAuth } from '@/features/auth/AuthContext';

interface AdminUserManagementProps {
  onAddAdmin?: () => void;
  onEditAdmin?: (admin: AdminUser) => void;
  onDeleteAdmin?: (adminId: string) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  onAddAdmin, onEditAdmin, onDeleteAdmin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');
  const { loginAsUser } = useAuth();

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAll();
      setAdmins(data);
    } catch (err: any) {
      console.error('Error fetching admins:', err);
      setError(err?.response?.data?.message || 'Failed to load admin users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin => {
    const name = `${admin.firstName || ''} ${admin.lastName || ''} ${admin.username}`.toLowerCase();
    const matchesSearch = 
      name.includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phoneNumber?.includes(searchQuery);

    const matchesRole = filterRole === 'ALL' ||
      (filterRole === 'ADMIN' && admin.roles?.some(r => r.name === 'ROLE_ADMIN')) ||
      (filterRole === 'SUPER_ADMIN' && admin.roles?.some(r => r.name === 'ROLE_SUPER_ADMIN'));

    return matchesSearch && matchesRole;
  });

  const getAdminRoleDisplay = (admin: AdminUser) => {
    const roles = admin.roles ?? [];
    if (roles.some(r => r.name === 'ROLE_SUPER_ADMIN')) {
      return { text: 'Super Admin', icon: Crown, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-500', borderColor: 'border-purple-100' };
    }
    return { text: 'Admin', icon: Shield, color: 'blue', bgColor: 'bg-emerald-50', textColor: 'text-emerald-500', borderColor: 'border-emerald-100' };
  };

  const getStatusDisplay = (admin: AdminUser) => {
    if (admin.enabled) {
      return { text: 'Active', icon: CheckCircle2, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-500', borderColor: 'border-emerald-100' };
    }
    return { text: 'Inactive', icon: XCircle, color: 'rose', bgColor: 'bg-rose-50', textColor: 'text-rose-500', borderColor: 'border-rose-100' };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Admin Users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Admin Error"
        message={error}
        onRetry={fetchAdmins}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
          <input 
            type="text" 
            placeholder="Search admin users by name, email, or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-sm"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl text-sm font-medium outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin Only</option>
            <option value="SUPER_ADMIN">Super Admin Only</option>
          </select>
          <Button 
            onClick={onAddAdmin}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20"
          >
            <Plus size={18} />
            <span>Add Admin User</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-yellow-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Total Admins</p>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{admins.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-emerald-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Admins</p>
          <p className="text-2xl font-black text-emerald-500">
            {admins.filter(a => a.roles?.some(r => r.name === 'ROLE_ADMIN')).length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Super Admins</p>
          <p className="text-2xl font-black text-purple-500">
            {admins.filter(a => a.roles?.some(r => r.name === 'ROLE_SUPER_ADMIN')).length}
          </p>
        </Card>
      </div>

      {filteredAdmins.length === 0 ? (
        <div className="text-center py-16">
          <UserCog size={48} className="mx-auto text-emerald-200 mb-4" />
          <p className="text-emerald-600 font-medium">No admin users found</p>
          <Button 
            onClick={onAddAdmin} 
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest"
          >
            Add your first admin
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin, i) => {
            const roleInfo = getAdminRoleDisplay(admin);
            const statusInfo = getStatusDisplay(admin);
            const RoleIcon = roleInfo.icon;
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={admin.memberId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6 border-none shadow-xl hover:shadow-2xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 ${roleInfo.bgColor} ${roleInfo.textColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <RoleIcon size={24} />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} flex items-center space-x-1`}>
                      <StatusIcon size={10} />
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-emerald-950 dark:text-white tracking-tight">
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <p className="text-sm text-emerald-600 font-medium mt-1">@{admin.username}</p>
                    </div>

                    <div className="pt-4 border-t border-white dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-emerald-400 uppercase tracking-widest">Role</span>
                        <span className={`font-bold ${roleInfo.textColor}`}>{roleInfo.text}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-emerald-400 uppercase tracking-widest">Email</span>
                        <span className="font-bold text-emerald-600 truncate max-w-37.5">{admin.email}</span>
                      </div>
                      {admin.phoneNumber && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-emerald-400 uppercase tracking-widest">Phone</span>
                          <span className="font-bold text-emerald-600">{admin.phoneNumber}</span>
                        </div>
                      )}
                      {admin.createdAt && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-emerald-400 uppercase tracking-widest">Joined</span>
                          <span className="font-bold text-emerald-600">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {admin.lastLogin && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-emerald-400 uppercase tracking-widest">Last Login</span>
                          <span className="font-bold text-emerald-600">
                            {new Date(admin.lastLogin).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-2">
                      <Button 
                        onClick={() => onEditAdmin?.(admin)}
                        className="px-4 py-2 bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center space-x-1"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        onClick={() => onDeleteAdmin?.(admin.memberId)}
                        className="w-10 h-10 bg-emerald-50 dark:bg-white/5 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <Button 
                        onClick={() => loginAsUser(admin.memberId)}
                        className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-lg flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all"
                        title="Login as user"
                      >
                        <LogIn size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
