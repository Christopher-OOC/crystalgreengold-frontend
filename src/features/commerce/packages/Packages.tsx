import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package as PackageIcon, ArrowRight, ChevronLeft, Box, Loader2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';

import { packageService } from '@/lib/api/services/package.service';

interface Package {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  bv?: number;
  pv?: number;
  image?: string;
}

interface PackagesProps {
  onBack: () => void;
  onSelectPackage: (pkg: Package) => void;
  storeId?: string | null;
}

export const Packages: React.FC<PackagesProps> = ({ onBack, onSelectPackage, storeId = null }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await packageService.getAll(storeId ?? null);
      setPackages(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to fetch packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading packages...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Packages Error" message={error} onRetry={fetchData} onBack={onBack} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-full transition-colors text-emerald-600">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-amber-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-amber-400/20">
          <PackageIcon size={20} />
          <span className="font-bold">Center Packages</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {packages.map((pkg, i) => (
          <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card noPadding className="bg-white dark:bg-amber-800 border-none relative overflow-hidden group min-h-[320px] flex flex-col">
              <div className="p-8 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-emerald-950 dark:text-white tracking-tight">{pkg.name}</h3>
                    <p className="text-emerald-600 dark:text-white/70 text-[10px] leading-relaxed max-w-[280px]">{pkg.description}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <p className="text-3xl font-bold text-emerald-950 dark:text-white tracking-tight">₦{pkg.price.toLocaleString()}</p>
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-400/30  dark:bg-amber-800/10 px-2 py-1 rounded-lg border border-white/10 flex items-center space-x-1.5">
                      <div className="w-1 h-1 rounded-full bg-amber-400 " />
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-white/80">{pkg.bv ?? 0} BV</span>
                    </div>
                    <div className="bg-amber-400/30  dark:bg-amber-800/10 px-2 py-1 rounded-lg border border-white/10 flex items-center space-x-1.5">
                      <div className="w-1 h-1 rounded-full bg-amber-400" />
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-white/80">{pkg.pv ?? 0} PV</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 text-right">
                  <div className="flex items-center justify-end space-x-2 text-emerald-950 dark:text-white">
                    <Box size={16} />
                    <span className="text-sm font-bold">1 item</span>
                  </div>
                </div>
              </div>
              <div className="p-4 mt-auto">
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full py-2.5 bg-amber-400 text-white hover:bg-amber-400 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 hover:bg-amber-50 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
