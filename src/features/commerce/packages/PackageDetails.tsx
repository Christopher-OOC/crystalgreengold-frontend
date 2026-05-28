import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  DollarSign, 
  Zap, 
  Gift, 
  CheckCircle2, 
  TrendingUp, 
  Info,
  ShieldCheck,
  Rocket,
  ShoppingCart
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { PackageActivationModal } from '@/features/commerce/packages/PackageActivationModal';

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  bv: number;
  pv: number;
  quantity: number;
  items: number;
  color: string;
}

interface PackageDetailsProps {
  pkg: Package;
  buyFrom: any;
  storeId?: string | null;
  onBack: () => void;
  onViewOrder: () => void;
}

export const PackageDetails: React.FC<PackageDetailsProps> = ({ pkg, buyFrom, storeId = null, onBack, onViewOrder }) => {
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);

  console.log("package", pkg.id);
  console.log("buyFrom", buyFrom);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Packages</span>
      </button>
+
      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        {/* Hero Header */}
        <div className="relative h-64 bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full animate-pulse" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white/10 rounded-full animate-ping" />
          </div>

          {/* Price Badge */}
          <div className="absolute top-6 right-6 bg-amber-400 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-lg">
            ₦{pkg.price.toLocaleString()}
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
            >
              <Rocket size={48} className="text-amber-400" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black text-white tracking-tighter mb-2"
            >
              {pkg.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 text-sm max-w-md font-medium"
            >
              {pkg.description}
            </motion.p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Value Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 flex items-center space-x-4">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Business Value</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{pkg.bv}</p>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-500/5 p-6 rounded-3xl border border-purple-100 dark:border-purple-500/20 flex items-center space-x-4">
              <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Point Value</p>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400">{pkg.pv}</p>
              </div>
            </div>
          </div>

          {/* Package Includes */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-amber-400">
              <Gift size={24} />
              <h2 className="text-xl font-bold">Package Includes</h2>
            </div>
            <div className="flex items-center space-x-3 bg-white dark:bg-white/5 p-4 rounded-2xl border border-emerald-50 dark:border-white/5">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <span className="font-bold text-emerald-800 dark:text-emerald-100">Select</span>
            </div>
          </div>

          {/* Earning Potential */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-500">
              <TrendingUp size={24} />
              <h2 className="text-xl font-bold">Earning Potential</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-emerald-50 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-bl-2xl text-[10px] font-bold">25%</div>
                <h3 className="font-bold text-emerald-950 dark:text-white mb-1">Direct Commission</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Earn on every direct referral you make</p>
              </div>
              <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-emerald-50 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-500 px-3 py-1 rounded-bl-2xl text-[10px] font-bold">12%</div>
                <h3 className="font-bold text-emerald-950 dark:text-white mb-1">Binary Commission</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Earn from your network's performance</p>
              </div>
            </div>
          </div>

          {/* Daily Capping */}
          <div className="bg-emerald-50 dark:bg-emerald-500/5 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <Info size={20} />
              <span className="text-sm font-bold">Daily Capping</span>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₦210000</p>
              <p className="text-xs text-emerald-600/60 dark:text-emerald-400/40 font-medium">Maximum daily earnings limit for this package</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Quantity Selector for Buy */}
            <div className="flex items-center gap-4">
              <span className="font-bold text-emerald-800 dark:text-emerald-100 text-sm">Quantity:</span>
              <div className="flex items-center border border-emerald-100 dark:border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                  className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors font-bold text-emerald-700 dark:text-emerald-200"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-2 text-center font-bold bg-white dark:bg-emerald-900 outline-none"
                />
                <button
                  onClick={() => setBuyQuantity(buyQuantity + 1)}
                  className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors font-bold text-emerald-700 dark:text-emerald-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buy Button */}
              <Button 
                onClick={() => setIsBuyModalOpen(true)}
                className="py-6 rounded-3xl text-lg font-black shadow-2xl shadow-emerald-500/40 flex items-center justify-center space-x-3 bg-emerald-600 hover:bg-emerald-700"
              >
                <ShoppingCart size={24} />
                <div className="text-left">
                  <div className="text-sm">Buy Package</div>
                  <div className="text-xs opacity-90">Qty: {buyQuantity}</div>
                </div>
              </Button>

              {/* Activate Button */}
              <Button 
                onClick={() => setIsActivationModalOpen(true)}
                className="py-6 rounded-3xl text-lg font-black shadow-2xl shadow-amber-400/40 flex items-center justify-center space-x-3"
              >
                <ShieldCheck size={24} />
                <span>Activate Package</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <PackageActivationModal 
        buyFrom={buyFrom}
        storeId={storeId}
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        onViewOrder={onViewOrder}
        pkgName={pkg.name}
        price={pkg.price}
        pkgId={pkg.id}
        mode="activate"
      />

      <PackageActivationModal 
        buyFrom={buyFrom}
        storeId={storeId}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onViewOrder={onViewOrder}
        pkgName={pkg.name}
        price={pkg.price}
        pkgId={pkg.id}
        mode="buy"
        quantity={buyQuantity}
      />
    </div>
  );
};
