import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  ArrowLeft,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { CreateCategory } from '@/features/admin/categories/CreateCategory';
import { categoryService } from '@/lib/api/services/category.service';
import type { Category } from '@/lib/types/category.types';

interface CategoryManagementProps {
  onBack: () => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      console.warn('Categories unavailable in admin management.');
      setError(err?.response?.data?.message || 'Failed to load categories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    
    try {
      await categoryService.delete(String(id));
      await fetchCategories(); // Refresh the list
    } catch (err: any) {
      console.warn('Category delete failed.');
      alert(err?.response?.data?.message || 'Failed to delete category. Please try again.');
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCreating || editingCategory) {
    return (
      <CreateCategory 
        onBack={() => {
          setIsCreating(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          setIsCreating(false);
          setEditingCategory(null);
          fetchCategories();
        }}
        editCategory={editingCategory}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Management Error"
        message={error}
        onRetry={fetchCategories}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors font-bold text-sm mb-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Categories</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Organize your products with categories</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
          />
        </div>

        <Button 
          onClick={() => setIsCreating(true)}
          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 font-black uppercase tracking-widest"
        >
          <Plus size={20} />
          <span>Create New Category</span>
        </Button>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No categories found</p>
          <p className="text-slate-400 text-sm mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Create your first category to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6 border-none shadow-xl hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-xl font-black">{category.name.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {category.description}
                    </p>
                  )}
                  {!category.description && (
                    <p className="text-sm text-slate-400 italic">No description provided</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Category ID: {typeof category.id === 'string' ? category.id.slice(0, 8) : category.id}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
