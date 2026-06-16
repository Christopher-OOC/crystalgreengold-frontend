import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingBag, ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useCart } from '@/features/cart/CartContext';
import { normalizeProduct } from '@/lib/utils/data-normalization';
import { productService } from '@/lib/api/services/product.service';
import { categoryService } from '@/lib/api/services/category.service';
import type { Category } from '@/lib/types/category.types';

interface Product {
  id: string;
  name: string;
  price: number;
  pv: number;
  bv: number;
  image: string;
  category?: { 
    id: number; 
    name: string;
  } | string;
  description?: string;
  availableQuantity?: number;
}

interface CompanyProductsProps {
  onSelectProduct: (product: any) => void;
  onBuyPackage: () => void;
}

// Helper function to get category name safely
const getCategoryName = (category: Product['category']): string => {
  if (!category) return 'General';
  if (typeof category === 'string') return category;
  return category.name || 'General';
};

export const CompanyProducts: React.FC<CompanyProductsProps> = ({ onSelectProduct, onBuyPackage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.warn('Categories unavailable for product catalog.');
      setCategories([]);
    }
  };


  const fetchData = useCallback(async (page = 1, search = '', categoryId = '') => {
    setIsLoading(true);
    setError(null);
    try {
      // Try fetching with pagination and category filtering
      const result = await productService.getAll(page, 8, search, categoryId);
      
      const productData = (result.data || []).map(normalizeProduct);
      setProducts(productData);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.warn('Product catalog request failed, trying unfiltered fallback.');
      // Fallback: If paginated fetch fails, try fetching all and handle locally
      try {
        const result = await productService.getAll();
        const productData = (result.data || []).map(normalizeProduct);
        setProducts(productData);
        setTotalPages(1); // Client-side fallback usually means 1 page of all results or we'd need more logic
      } catch (fallbackErr: any) {
        console.warn('Product catalog fallback request failed.');
        setProducts([]);
        setTotalPages(1);
        setError(getRequestErrorMessage(fallbackErr, 'Failed to load products.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchData(1, searchQuery, activeCategoryId);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategoryId, fetchData]);

  useEffect(() => {
    fetchData(currentPage, searchQuery, activeCategoryId);
  }, [currentPage, fetchData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setCurrentPage(1);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening product description modal
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      pv: product.pv,
      bv: product.bv,
    });
    
    
    console.log(`Added ${product.name} to cart`);
  };

  // We are using server-side filtering now
  const filtered = products;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading product catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Catalog Error" 
        message={error} 
        onRetry={() => fetchData(currentPage, searchQuery)} 
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-400 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-950 dark:text-white">National Center</h2>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs">Browse and purchase our official products</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={onBuyPackage} 
            className="bg-amber-400 hover:bg-amber-400 text-white px-4 py-1.5 rounded-lg font-bold text-xs"
          >
            Buy a package
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery} 
              onChange={handleSearch}
              className="pl-9 pr-3 py-1.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all w-48 text-xs" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-1 no-scrollbar">
        <button 
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
            activeCategoryId === ''
              ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/20'
              : 'bg-white dark:bg-emerald-950 text-emerald-600 border border-emerald-100 dark:border-white/10 hover:border-amber-400 hover:text-amber-400'
          }`}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button 
            key={category.id} 
            onClick={() => handleCategoryChange(String(category.id))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCategoryId === String(category.id)
                ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/20'
                : 'bg-white dark:bg-emerald-950 text-emerald-600 border border-emerald-100 dark:border-white/10 hover:border-amber-400 hover:text-amber-400'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-emerald-400 font-bold">
          {searchQuery ? 'No products match your search.' : 'No products found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: i * 0.05 }}
              className="group cursor-pointer" 
              onClick={() => onSelectProduct(product)}
            >
              <div className="bg-white dark:bg-emerald-950 rounded-2xl overflow-hidden shadow-sm border border-emerald-50 dark:border-white/5 hover:shadow-xl transition-all duration-500">
                <div className="relative aspect-square overflow-hidden bg-white dark:bg-white/5">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Handle image load error
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-emerald-200 text-4xl ${product.image ? 'hidden' : ''}`}>
                    📦
                  </div>
                  <div className="absolute top-3 right-3 bg-white/80 dark:bg-emerald-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-black text-amber-400 shadow-sm">
                    {product.pv} PV
                  </div>
                  <div 
                    className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    <div className="rounded-full p-3 bg-white text-amber-400 hover:bg-amber-400 hover:text-white transition-all transform translate-y-3 group-hover:translate-y-0 duration-300 cursor-pointer">
                      <ShoppingCart size={20} />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                      {getCategoryName(product.category)}
                    </p>
                    <h3 className="font-bold text-sm text-emerald-950 dark:text-white group-hover:text-amber-400 transition-colors truncate">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white dark:border-white/5">
                    <span className="text-lg font-black text-amber-400">
                      ₦{product.price?.toLocaleString() ?? '0'}
                    </span>
                    <div className="flex items-center space-x-1 text-[9px] font-bold text-emerald-400">
                      <span>BV: {product.bv}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 hover:border-amber-400 transition-all disabled:opacity-50 disabled:hover:border-emerald-100 disabled:hover:text-emerald-400"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button 
                key={pageNum} 
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  currentPage === pageNum 
                    ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/20' 
                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-white/5'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-emerald-100 dark:border-white/10 text-emerald-400 hover:text-amber-400 hover:border-amber-400 transition-all disabled:opacity-50 disabled:hover:border-emerald-100 disabled:hover:text-emerald-400"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

function getRequestErrorMessage(err: any, fallback: string) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.status >= 500) return 'Products are temporarily unavailable. Please try again later.';
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (err?.message === 'Network Error') return 'Unable to reach the API. Please check the backend connection and try again.';
  return fallback;
}
