import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, ArrowLeft, Edit, Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { CreateProduct } from '@/features/admin/products/CreateProduct';
import { productService } from '@/lib/api/services/product.service';
import { categoryService } from '@/lib/api/services/category.service';
import { useUIStore } from '@/lib/store/uiStore';
import type { Category } from '@/lib/types/category.types';

interface Product {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  pv?: number;
  bv?: number;
  image?: string;
  imageUrl?: string;
  availableQuantity?: number;
  category?: { id: number | string; name: string } | string;
  isDiscounted?: boolean;
  discount?: number;
}

const getProductCategoryName = (category: Product['category']) => {
  if (!category) return '—';
  return typeof category === 'string' ? category : category.name;
};

interface ProductInventoryProps {
  onBack: () => void;
}

export const ProductInventory: React.FC<ProductInventoryProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const hasShownLoadError = useRef(false);
  const { toast } = useUIStore();
  const itemsPerPage = 10;

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      toast.warning('Categories unavailable', 'Product categories could not be loaded right now.');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productService.getAll(currentPage, itemsPerPage, searchQuery, selectedCategory);
      setProducts(result.data);
      setTotalPages(result.totalPages);
      setError(null);
      hasShownLoadError.current = false;
    } catch (err: any) {
      const message = getRequestErrorMessage(err, 'Failed to load products.');
      setProducts([]);
      setTotalPages(1);
      setError(message);
      if (!hasShownLoadError.current) {
        toast.error('Products unavailable', message);
        hasShownLoadError.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(productId);
    try {
      await productService.delete(String(productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  // We are using server-side pagination now
  const paginated = products;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Inventory...</p>
      </div>
    );
  }

  if (isCreating) {
    return <CreateProduct onBack={() => { setIsCreating(false); fetchData(); }} />;
  }

  if (editingProduct) {
    return <CreateProduct onBack={() => { setEditingProduct(null); fetchData(); }} editProduct={editingProduct} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors font-bold text-sm mb-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Product Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your product catalog</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Button onClick={() => setIsCreating(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shrink-0">
            <Plus size={20} />
            <span>Create New Product</span>
          </Button>
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search products by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium" />
          </div>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-xs uppercase tracking-widest text-slate-500 min-w-[200px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Products could not be loaded</p>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
          <Button onClick={fetchData} className="w-full rounded-xl bg-amber-500 px-5 py-2 text-xs font-black uppercase text-white hover:bg-amber-600 sm:w-auto">
            Retry
          </Button>
        </div>
      )}

      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">S/N</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Image</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">PV</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">BV</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-bold">
                    No products found. Create one.
                  </td>
                </tr>
              ) : (
                paginated.map((product, i) => (
                  <motion.tr key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 text-sm font-black text-slate-400">{(currentPage - 1) * itemsPerPage + i + 1}.</td>
                    <td className="px-6 py-5">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                        {(product.image || product.imageUrl) && <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{product.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{product.description?.slice(0, 40)}...</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">₦{product.price?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">{product.pv} PV</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-purple-500/20">{product.bv} BV</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{getProductCategoryName(product.category)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        (product.availableQuantity ?? 0) > 100
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {product.availableQuantity ?? 0} in stock
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => setEditingProduct(product)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="Edit">
                          <Edit size={16} />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
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
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                    : 'border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (err?.message === 'Network Error') return 'Unable to reach the API. Please check the backend connection and try again.';
  return err?.message || fallback;
}
