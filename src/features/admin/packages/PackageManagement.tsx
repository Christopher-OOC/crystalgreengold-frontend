import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { CreatePackage } from '@/features/admin/packages/CreatePackage';
import { packageService } from '@/lib/api/services/package.service';

interface Package {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  bv?: number;
  pv?: number;
  image?: string;
  directCommissionRate?: number;
  binaryCommissionRate?: number;
  dailyCapping?: number;
}

interface PackageManagementProps {
  onBack: () => void;
}

export const PackageManagement: React.FC<PackageManagementProps> = ({ onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await packageService.getAll();
      setPackages(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load packages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (pkgId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    setDeletingId(pkgId);
    try {
      await packageService.delete(pkgId);
      setPackages(prev => prev.filter(p => p.id !== pkgId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete package.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Packages...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Package Error" message={error} onRetry={fetchData} onBack={onBack} />;
  }

  if (isCreating) {
    return <CreatePackage onBack={() => { setIsCreating(false); fetchData(); }} />;
  }

  if (editingPackage) {
    return <CreatePackage 
      onBack={() => { setEditingPackage(null); fetchData(); }} 
      editPackage={editingPackage}
    />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button onClick={onBack} className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm mb-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight">Package List</h1>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">Manage all available membership packages</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 font-black uppercase tracking-widest">
          <Plus size={20} />
          <span>Create New Package</span>
        </Button>
      </div>

      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-white/5 border-b border-emerald-50 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">PACKAGE</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">PRICE & VALUES</th>
                <th className="px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white dark:divide-white/5">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-emerald-400 font-bold">
                    No packages found. Create one.
                  </td>
                </tr>
              ) : (
                packages.map((pkg, i) => (
                  <motion.tr key={pkg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-white/50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-5 max-w-md">
                      <div className="flex items-start space-x-4">
                        {pkg.image ? (
                          <img src={pkg.image} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-emerald-50 dark:bg-white/5 rounded-xl shrink-0" />
                        )}
                        <div className="space-y-1">
                          <span className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-tight">{pkg.name}</span>
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed">{pkg.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <p className="text-sm font-black text-emerald-950 dark:text-white">₦{pkg.price.toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase tracking-widest border border-emerald-500/20">BV: {pkg.bv}</span>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[8px] font-black rounded uppercase tracking-widest border border-purple-500/20">PV: {pkg.pv}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingPackage(pkg)}
                          className="flex items-center space-x-1 text-emerald-500 hover:text-emerald-600 transition-colors font-black uppercase tracking-widest text-xs px-3 py-2 hover:bg-emerald-500/10 rounded-lg"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          disabled={deletingId === pkg.id}
                          className="flex items-center space-x-1 text-rose-500 hover:text-rose-600 transition-colors font-black uppercase tracking-widest text-xs px-3 py-2 hover:bg-rose-500/10 rounded-lg disabled:opacity-50"
                        >
                          {deletingId === pkg.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
