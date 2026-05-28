import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronLeft, ChevronRight, Package, ShoppingCart, Loader2, Filter } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { productService } from '@/lib/api/services/product.service';
import { getCategoryName, type Product } from '@/lib/types/product.types';

interface PremiumStoreProductsProps {
  storeName: string;
  storeId: string; // memberId of the premium store
  title?: string;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onBuyPackage: () => void;
}

export const PremiumStoreProducts: React.FC<PremiumStoreProductsProps> = ({
  storeName,
  storeId,
  title = 'Premium Store Products',
  onBack,
  onSelectProduct,
  onBuyPackage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('name_asc');

  const fetchProducts = async () => {
    if (!storeId) {
      setError('Invalid store ID. Please go back and try again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getStoreByMember(storeId);
      const productList = Array.isArray(data) ? data : [];
      setProducts(productList);
      const uniqueCategories = ['ALL', ...new Set(productList.map((p) => getCategoryName(p.category)).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err: any) {
      console.error('Error fetching premium store products:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to load products for this store. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  // Filter and sort
  const filteredAndSortedProducts = products
    .filter((product) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower);
      const matchesCategory =
        selectedCategory === 'ALL' || getCategoryName(product.category) === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':  return (a.price || 0) - (b.price || 0);
        case 'price_desc': return (b.price || 0) - (a.price || 0);
        case 'name_asc':   return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':  return (b.name || '').localeCompare(a.name || '');
        default:           return 0;
      }
    });

  // Pagination
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">
            Loading Products...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <ErrorState
          title="Products Error"
          message={error}
          onRetry={fetchProducts}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-amber-500/20">
            <Package size={20} />
            <span className="font-bold">{title}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{storeName}</h2>
            <p className="text-xs text-slate-500">{products.length} products available</p>
          </div>
        </div>
        <Button
          onClick={onBuyPackage}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-amber-500/20"
        >
          Buy a package
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name, description, or SKU..."
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 md:w-48 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-amber-500 transition-all text-sm font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 md:w-40 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-amber-500 transition-all text-sm font-medium"
          >
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </Card>

      {/* Status Banner */}
      <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 py-2 px-6 rounded-lg">
        <p className="text-amber-600 dark:text-amber-400 text-sm font-bold">
          Showing {paginatedProducts.length} of {filteredAndSortedProducts.length} products available
        </p>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No products found</p>
          <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {paginatedProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-xl transition-all duration-500">
                <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-white/5">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={48} className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>PV: {product.pv}</span>
                    </div>
                    <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>BV: {product.bv}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button className="rounded-full p-4 bg-white text-amber-500 hover:bg-amber-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                      <ShoppingCart size={24} />
                    </Button>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest line-clamp-2">
                    {product.name}
                  </h4>
                  {product.category && (
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                      {getCategoryName(product.category)}
                    </p>
                  )}
                  <p className="text-xl font-bold text-amber-500">₦{product.price?.toLocaleString()}</p>
                  {product.stock !== undefined && product.stock > 0 && (
                    <p className="text-[10px] text-green-500 mt-1">In Stock: {product.stock} units</p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-[10px] text-rose-500 mt-1">Out of Stock</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (currentPage <= 4) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = currentPage - 3 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'border border-slate-200 dark:border-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
