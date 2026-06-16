import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  Store,
  MapPin,
  TrendingUp,
  Package,
  Star,
  Loader2,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import { premiumStoreService } from "@/lib/api/services/premium-store.service";
import type { PremiumStore } from "@/lib/types/premium-store.types";

interface PremiumStoreManagementProps {
  onAddStore?: () => void;
  onEditStore?: (store: PremiumStore) => void;
  onDeleteStore?: (storeId: string) => void;
}

export const PremiumStoreManagement: React.FC<PremiumStoreManagementProps> = ({
  onAddStore,
  onEditStore,
  onDeleteStore,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<PremiumStore[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const fetchPremiumStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await premiumStoreService.getAll();
      setStores(data);
    } catch (err: any) {
      console.warn("State centers unavailable in admin management.");
      setError(
        err?.response?.data?.message || "Failed to load state centers.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumStores();
  }, []);

  const filteredStores = stores.filter((store) => {
    const name = (store.businessName || store.username || "").toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.phoneNumber?.includes(searchQuery) ||
      store.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && store.enabled) ||
      (filterStatus === "INACTIVE" && !store.enabled);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">
          Loading State Centers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Store Error"
        message={error}
        onRetry={fetchPremiumStores}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search state centers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-sm"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl text-sm font-medium outline-none"
          >
            <option value="ALL">All Centers</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <Button
            onClick={onAddStore}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20"
          >
            <Plus size={18} />
            <span>Register Center</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-yellow-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
            Total Centers
          </p>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">
            {stores.length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-emerald-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
            Active
          </p>
          <p className="text-2xl font-black text-emerald-500">
            {stores.filter((s) => s.enabled).length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-rose-500">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
            Inactive
          </p>
          <p className="text-2xl font-black text-rose-500">
            {stores.filter((s) => !s.enabled).length}
          </p>
        </Card>
      </div>

      {filteredStores.length === 0 ? (
        <div className="text-center py-16">
          <Store size={48} className="mx-auto text-emerald-200 mb-4" />
          <p className="text-emerald-600 font-medium">No state centers found</p>
          <Button
            onClick={onAddStore}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest"
          >
            Register your first center
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store, i) => (
            <motion.div
              key={store.memberId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center">
                    <Store size={24} />
                  </div>
                  <div className="flex items-center space-x-1 bg-amber-50 text-amber-400 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    <Star size={10} fill="currentColor" />
                    <span>{store.rating || 5.0}</span>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <h3 className="text-lg font-black text-emerald-950 dark:text-white tracking-tight">
                      {store.businessName || store.username}
                    </h3>
                    <div className="flex items-center space-x-2 text-emerald-600 text-sm font-medium mt-1">
                      <MapPin size={14} className="text-yellow-500" />
                      <span className="truncate">
                        {store.address || "Address not set"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white dark:border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <TrendingUp size={10} />
                        <span>Balance</span>
                      </div>
                      <p className="text-sm font-black text-emerald-950 dark:text-white">
                        ₦{store.availableBalance?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <Package size={10} />
                        <span>Orders</span>
                      </div>
                      <p className="text-sm font-black text-emerald-950 dark:text-white">
                        {store.totalOrders || 0}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-emerald-400 uppercase tracking-widest block">
                        Owner
                      </span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-200">
                        {store.firstName} {store.lastName}
                      </span>
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        store.enabled
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {store.enabled ? "ACTIVE" : "INACTIVE"}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-2">
                    <Button
                      onClick={() => onEditStore?.(store)}
                      className="px-4 py-2 bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center space-x-1"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </Button>
                    <Button
                      onClick={() => onDeleteStore?.(store.memberId)}
                      className="w-10 h-10 bg-emerald-50 dark:bg-white/5 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-100 transition-all"
                    >
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
