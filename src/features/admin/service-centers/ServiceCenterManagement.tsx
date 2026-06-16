import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Shield, MapPin, Loader2, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { serviceCenterService } from '@/lib/api/services/service-center.service';
import type { ServiceCenter } from '@/lib/types/service-center.types';

interface ServiceCenterManagementProps {
  onAddCenter?: () => void;
  onEditCenter?: (center: ServiceCenter) => void;
  onDeleteCenter?: (centerId: string) => void;
  onBack: () => void;
}

export const ServiceCenterManagement: React.FC<ServiceCenterManagementProps> = ({
  onAddCenter, onEditCenter, onDeleteCenter, onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const fetchServiceCenters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await serviceCenterService.getAll();
      setCenters(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load local centers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchServiceCenters(); }, []);

  const filteredCenters = centers.filter(center => {
    const name = (center.businessName || center.username || '').toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      center.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.phoneNumber?.includes(searchQuery) ||
      center.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && center.enabled) ||
      (filterStatus === 'INACTIVE' && !center.enabled);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Local Centers...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Management Error" message={error} onRetry={fetchServiceCenters} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Admin Panel</span>
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
          <input type="text" placeholder="Search by name, address, or phone..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-sm" />
        </div>
        <div className="flex items-center space-x-3">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl text-sm font-medium outline-none">
            <option value="ALL">All Centers</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <Button onClick={onAddCenter}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20">
            <Plus size={18} />
            <span>Add New Center</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-yellow-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Total Centers</p>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{centers.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-emerald-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Active</p>
          <p className="text-2xl font-black text-emerald-500">{centers.filter(c => c.enabled).length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-rose-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Inactive</p>
          <p className="text-2xl font-black text-rose-500">{centers.filter(c => !c.enabled).length}</p>
        </Card>
      </div>

      {filteredCenters.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={48} className="mx-auto text-emerald-200 mb-4" />
          <p className="text-emerald-600 font-medium">No local centers found</p>
          <Button onClick={onAddCenter} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest">
            Add your first local center
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center, i) => (
            <motion.div key={center.memberId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-6 border-none shadow-xl hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    center.enabled
                      ? 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                      : 'bg-rose-50 text-rose-500 border border-rose-100'
                  }`}>
                    {center.enabled ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-emerald-950 dark:text-white tracking-tight">
                      {center.businessName || center.username}
                    </h3>
                    <div className="flex items-center space-x-2 text-emerald-600 text-sm font-medium mt-1">
                      <MapPin size={14} className="text-yellow-500" />
                      <span className="truncate">{center.address || 'Address not set'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-400 uppercase tracking-widest">Manager</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-200">
                        {[center.firstName, center.lastName].filter(Boolean).join(' ') || center.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-400 uppercase tracking-widest">Phone</span>
                      <span className="font-bold text-emerald-600">{center.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-400 uppercase tracking-widest">Email</span>
                      <span className="font-bold text-emerald-600 truncate max-w-[150px]">{center.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-400 uppercase tracking-widest">Balance</span>
                      <span className="font-black text-emerald-500">₦{center.availableBalance?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-2">
                    <Button onClick={() => onEditCenter?.(center)}
                      className="px-4 py-2 bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center space-x-1">
                      <Edit size={12} />
                      <span>Edit</span>
                    </Button>
                    <Button onClick={() => onDeleteCenter?.(center.memberId)}
                      className="w-10 h-10 bg-emerald-50 dark:bg-white/5 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-100 transition-all">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};