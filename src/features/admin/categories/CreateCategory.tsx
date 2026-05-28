import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  Loader2,
  CheckCircle2,
  XCircle,
  Upload
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { categoryService } from '@/lib/api/services/category.service';
import type { Category } from '@/lib/types/category.types';

interface CreateCategoryProps {
  onBack: () => void;
  onSuccess?: () => void;
  editCategory?: Category | null;
}

export const CreateCategory: React.FC<CreateCategoryProps> = ({ 
  onBack, 
  onSuccess,
  editCategory 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name,
        description: editCategory.description || '',
        imageUrl: editCategory.imageUrl || ''
      });
    }
  }, [editCategory]);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (editCategory) {
        // Update existing category
        await categoryService.update(String(editCategory.id), {
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl || undefined
        });
      } else {
        // Create new category
        await categoryService.create({
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl || undefined
        });
      }
      
      setShowSuccessModal(true);
      
      // Auto close modal after 2 seconds and trigger refresh
      setTimeout(() => {
        setShowSuccessModal(false);
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err?.response?.data?.message || 'Failed to save category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6 relative">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl text-center space-y-6 border border-slate-100 dark:border-white/5"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Success!</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  The category has been {editCategory ? 'updated' : 'created'} successfully.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {editCategory ? 'Edit Category' : 'Create New Category'}
        </h1>
      </div>

      <Card className="p-8 md:p-10 border-none shadow-2xl space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 flex items-center space-x-3">
            <XCircle size={20} className="text-rose-500 flex-shrink-0" />
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Category Name *
            </label>
            <input 
              type="text" 
              placeholder="e.g., Fashion and Beauty"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Description
            </label>
            <textarea 
              placeholder="Enter category description..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium resize-none"
            />
            <p className="text-[10px] text-slate-400">
              Optional: A brief description of what this category represents
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Image URL (Optional)
            </label>
            <div className="relative">
              <input 
                type="url" 
                placeholder="https://example.com/category-image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 pl-10 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
              />
              <Upload size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400">
              Add an image URL to display an icon for this category
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={onBack}
            disabled={isLoading}
            className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <Button 
            onClick={handleCreate}
            disabled={isLoading || !formData.name.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 disabled:opacity-80 disabled:cursor-not-allowed min-w-[180px] justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>{editCategory ? 'Update Category' : 'Create Category'}</span>
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
