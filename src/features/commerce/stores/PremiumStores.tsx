import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  Store,
  MapPin,
  Star,
  ArrowRight,
  Filter,
  Phone,
  Loader2,
} from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { premiumStoreService } from "@/lib/api/services/premium-store.service";
import type { PremiumStore } from "@/lib/types/premium-store.types";

interface PremiumStoresProps {
  onSelectStore: (storeName: string, storeId: string) => void;
}

export const PremiumStores: React.FC<PremiumStoresProps> = ({
  onSelectStore,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<PremiumStore[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");

  const fetchPremiumStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await premiumStoreService.getAll();
      setStores(data);
    } catch (err: any) {
      console.warn("Premium stores unavailable.");
      setError(
        getRequestErrorMessage(
          err,
          "Unable to fetch premium store locations. Please check your connection.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumStores();
  }, []);

  // Filter and sort stores
  const filteredAndSortedStores = stores
    .filter((store) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (
          store.businessName?.toLowerCase() ||
          store.username?.toLowerCase() ||
          ""
        ).includes(searchLower) ||
        store.address?.toLowerCase().includes(searchLower) ||
        store.location?.toLowerCase().includes(searchLower) ||
        store.city?.toLowerCase().includes(searchLower) ||
        store.state?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        return (a.businessName || a.username || "").localeCompare(
          b.businessName || b.username || "",
        );
      }
    });

  // Get random placeholder image for stores without images
  const getStoreImage = (store: PremiumStore) => {
    if (store.image) return store.image;
    // Use store ID to generate consistent placeholder
    return `https://picsum.photos/seed/store${store.memberId}/400/300`;
  };

  // Get store display name
  const getStoreName = (store: PremiumStore) => {
    return store.businessName || store.username || "Premium Store";
  };

  // Get store location
  const getStoreLocation = (store: PremiumStore) => {
    if (store.address) return store.address;
    if (store.city && store.state) return `${store.city}, ${store.state}`;
    if (store.city) return store.city;
    if (store.state) return store.state;
    return "Location not specified";
  };

  // Get store rating
  const getStoreRating = (store: PremiumStore) => {
    return store.rating || 5.0;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">
          Finding premium stores near you...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Store Locator Error"
        message={error}
        onRetry={fetchPremiumStores}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950 dark:text-white">
              Premium Stores
            </h2>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm">
              {stores.length} exclusive{" "}
              {stores.length === 1 ? "location" : "locations"} for premium
              products
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all w-64"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl transition-colors ${
              showFilters
                ? "text-amber-400 border-amber-400"
                : "text-emerald-600 hover:text-amber-400"
            }`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-emerald-950 rounded-xl p-4 border border-emerald-100 dark:border-white/10 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
              Sort by:
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy("rating")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  sortBy === "rating"
                    ? "bg-amber-400 text-white"
                    : "bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                }`}
              >
                <Star size={14} className="inline mr-1" />
                Rating
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  sortBy === "name"
                    ? "bg-amber-400 text-white"
                    : "bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                }`}
              >
                Name
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stores Grid */}
      {filteredAndSortedStores.length === 0 ? (
        <div className="text-center py-16">
          <Store size={48} className="mx-auto text-emerald-200 mb-4" />
          <p className="text-emerald-600 font-medium">No premium stores found</p>
          <p className="text-emerald-400 text-sm mt-2">
            Try adjusting your search or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedStores.map((store, i) => (
            <motion.div
              key={store.memberId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                noPadding
                className="group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-emerald-950"
                onClick={() =>
                  onSelectStore(getStoreName(store), store.memberId)
                }
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getStoreImage(store)}
                    alt={getStoreName(store)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <span className="text-white font-bold flex items-center">
                      Visit Store{" "}
                      <ArrowRight
                        size={16}
                        className="ml-2 group-hover:translate-x-2 transition-transform"
                      />
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-emerald-900/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-emerald-950 dark:text-white">
                      {getStoreRating(store)}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-emerald-950 dark:text-white group-hover:text-amber-400 transition-colors">
                      {getStoreName(store)}
                    </h3>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
                        <MapPin size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {getStoreLocation(store)}
                        </span>
                      </div>
                      {store.phoneNumber && (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
                          <Phone size={14} className="mr-1 flex-shrink-0" />
                          <span>{store.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Premium Partner
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-emerald-400">
                        ₦{store.availableBalance?.toLocaleString() || "0"}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        balance
                      </span>
                    </div>
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

function getRequestErrorMessage(err: any, fallback: string) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.status >= 500) return "Premium stores are temporarily unavailable. Please try again later.";
  if (err?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (err?.message === "Network Error") return "Unable to reach the API. Please check the backend connection and try again.";
  return fallback;
}
