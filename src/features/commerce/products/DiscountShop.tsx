import React, { useState, useEffect } from 'react';
import { Package, Search, Info, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';
import { productService } from '@/lib/api/services/product.service';
import { Product, getCategoryName, getProductImage } from '@/lib/types/product.types';

interface DiscountShopProps {
  onSelectProduct?: (product: Product) => void;
}

export const DiscountShop: React.FC<DiscountShopProps> = ({ onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getDiscounted();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load discounted products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading discounted products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Shop Error"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <Card 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        rounded="2xl"
        className="bg-gradient-to-r from-amber-400 to-yellow-600 p-5 text-white shadow-lg shadow-amber-400/20 flex items-center space-x-4 border-none"
      >
        <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20">
          <Package size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Discounted Products</h2>
          <p className="text-white/80 font-bold text-xs">Exclusive deals for our community members!</p>
        </div>
      </Card>

      {/* Search Bar */}
      <Card 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        rounded="xl"
        className="p-1.5 flex items-center focus-within:ring-4 focus-within:ring-amber-400/10 transition-all border-2 border-emerald-950 dark:border-white/10"
      >
        <input 
          type="text" 
          placeholder="Search discounted products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent py-2 px-3 outline-none text-emerald-950 dark:text-white font-black placeholder:text-emerald-400 uppercase text-[10px] tracking-widest"
        />
        <div className="p-2 text-amber-400">
          <Search size={20} />
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product, i) => (
          <motion.div
            key={product.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onSelectProduct?.(product)}
          >
            <Card className="p-0 overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="relative aspect-square bg-white dark:bg-white/5 flex items-center justify-center p-8">
                <img 
                  src={getProductImage(product)} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-widest">
                  PROMO
                </div>
                {product.pv !== undefined && (
                  <div className="absolute top-3 right-3 bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-widest">
                    {product.pv} PV
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    {getCategoryName(product.category)}
                  </p>
                  <h3 className="text-base font-black text-emerald-950 dark:text-white group-hover:text-amber-400 transition-colors truncate tracking-tight uppercase">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-amber-400">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-400">
                    <Info size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">View Details</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50/50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/20 p-12 text-center"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center">
              <Info size={32} />
            </div>
            <p className="text-amber-800 dark:text-amber-200 font-black text-lg uppercase tracking-tight">
              No products found
            </p>
            <p className="text-amber-400/60 dark:text-amber-400/40 text-xs font-bold uppercase tracking-widest max-w-xs">
              Try adjusting your search terms.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
