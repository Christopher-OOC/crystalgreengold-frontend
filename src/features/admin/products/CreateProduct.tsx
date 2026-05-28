import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { productService } from '@/lib/api/services/product.service';


import { categoryService } from '@/lib/api/services/category.service';
import { packageService } from '@/lib/api/services/package.service';

interface ProductData {
  id?: string | number;
  name: string;
  description?: string;
  price: number;
  pv?: number;
  bv?: number;
  image?: string;
  imageUrl?: string;
  availableQuantity?: number;
  category?: { id: number | string; name: string } | string;
  discount?: number;
}

interface CreateProductProps {
  onBack: () => void;
  editProduct?: ProductData;
}

export const CreateProduct: React.FC<CreateProductProps> = ({ onBack, editProduct }) => {
  const isEditing = !!editProduct;
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const [categories, setCategories] = useState<{ id: number | string; name: string }[]>([]);
  const [packages, setPackages] = useState<{ id: number | string; name: string }[]>([]);

  useEffect(() => {
    categoryService.getAll().then(data => setCategories(data)).catch(() => {});
    packageService.getAll().then(data => setPackages(data)).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    pv: '',
    bv: '',
    availableQuantity: '',
    categoryId: '',
    discount: '0',
    packageId: '0',
    productType: 'regular',
  });

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name ?? '',
        description: editProduct.description ?? '',
        price: String(editProduct.price ?? ''),
        pv: String(editProduct.pv ?? ''),
        bv: String(editProduct.bv ?? ''),
        availableQuantity: String(editProduct.availableQuantity ?? ''),
        categoryId: String(typeof editProduct.category === 'object' ? editProduct.category?.id ?? '' : ''),
        discount: String(editProduct.discount ?? '0'),
        packageId: '0',
        productType: 'regular',
      });
      if (editProduct.image || editProduct.imageUrl) setImagePreview(editProduct.image || editProduct.imageUrl || null);
    }
  }, [editProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!isEditing && !imageFile) {
      setError('Please upload a product image.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Build a robust payload to avoid backend crashes (500 errors)
      const dataPayload: any = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        pv: parseFloat(form.pv) || 0,
        bv: parseFloat(form.bv) || 0,
        availableQuantity: parseInt(form.availableQuantity) || 0,
        productType: form.productType,
      };

      // Only include IDs if they are valid (> 0) to avoid foreign key or lookup failures
      const catId = parseInt(form.categoryId);
      if (catId > 0) dataPayload.categoryId = catId;
      
      if (form.productType === 'discounted') {
        dataPayload.discount = parseFloat(form.discount) || 0;
        const pkgId = parseInt(form.packageId);
        if (pkgId > 0) dataPayload.packageId = pkgId;
      }

      formData.append('data', JSON.stringify(dataPayload));

      if (imageFile) {
        formData.append('file', imageFile);
      }

      if (isEditing && editProduct?.id) {
        await productService.update(String(editProduct.id), formData);
      } else {
        await productService.create(formData);
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6 relative">
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-emerald-950 rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight uppercase">Success!</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">Product {isEditing ? 'updated' : 'created'} successfully.</p>
              </div>
              <Button onClick={onBack} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest">
                Back to Inventory
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-emerald-700 dark:text-emerald-400" />
        </button>
        <h1 className="text-xl font-black text-emerald-950 dark:text-white uppercase tracking-tight">
          {isEditing ? 'Edit Product' : 'Create New Product'}
        </h1>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      <Card className="p-8 md:p-10 border-none shadow-2xl space-y-10">
        <div className="space-y-4">
          <h3 className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-widest border-b border-emerald-100 dark:border-white/10 pb-2">
            Product Image {isEditing && <span className="normal-case font-medium text-emerald-400 text-xs">(leave empty to keep current)</span>}
          </h3>
          <label className="border-2 border-dashed border-emerald-100 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-amber-400/50 transition-colors cursor-pointer group bg-white/50 dark:bg-white/[0.02]">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <img src={imagePreview} className="w-32 h-32 object-cover rounded-xl" />
            ) : (
              <>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-white/5 rounded-full flex items-center justify-center text-emerald-400 group-hover:text-amber-400 transition-colors">
                  <Upload size={24} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Click or drag to upload an image</p>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">PNG, JPG, JPEG (max 5MB)</p>
                </div>
              </>
            )}
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-widest border-b border-emerald-100 dark:border-white/10 pb-2">Basic Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Product Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Premium Organic Tea" disabled={isLoading}
                  className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50" />
              </div>
              <div className="space-y-2">
  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Category *</label>
  <select name="categoryId" value={form.categoryId} onChange={handleChange} disabled={isLoading}
    className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50">
    <option value="">Select a category</option>
    {categories.map(cat => (
      <option key={cat.id} value={cat.id}>{cat.name}</option>
    ))}
  </select>
</div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Price (₦) *</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" disabled={isLoading}
                    className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Product Type *</label>
                  <div className="flex space-x-3">
                    {[
                      { id: 'regular', label: 'Regular' },
                      { id: 'discounted', label: 'Discounted' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm({ ...form, productType: type.id })}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 transition-all font-bold ${
                          form.productType === type.id 
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-600' 
                            : 'bg-white dark:bg-emerald-950 border-emerald-100 dark:border-white/10 text-emerald-400'
                        }`}
                      >
                        {form.productType === type.id && <Check size={16} />}
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {form.productType === 'discounted' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Discount Percentage *</label>
                        <input type="number" name="discount" value={form.discount} onChange={handleChange} placeholder="Enter discount percentage (0-100%)" disabled={isLoading} min="0" max="100"
                          className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Attached Package *</label>
                        <select name="packageId" value={form.packageId} onChange={handleChange} disabled={isLoading}
                          className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50">
                          <option value="0">Select a package</option>
                          {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                          ))}
                        </select>
                        <p className="text-[10px] font-bold text-emerald-400 mt-1">Select the package this discounted product is attached to</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-widest border-b border-emerald-100 dark:border-white/10 pb-2">Inventory & Metrics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">PV *</label>
                  <input type="number" name="pv" value={form.pv} onChange={handleChange} disabled={isLoading}
                    className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">BV *</label>
                  <input type="number" name="bv" value={form.bv} onChange={handleChange} disabled={isLoading}
                    className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Available Quantity *</label>
                <input type="number" name="availableQuantity" value={form.availableQuantity} onChange={handleChange} disabled={isLoading}
                  className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium disabled:opacity-50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter detailed product description..." rows={6} disabled={isLoading}
                  className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium resize-none disabled:opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-8 border-t border-emerald-50 dark:border-white/5">
          <button onClick={onBack} disabled={isLoading}
            className="px-8 py-3 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 hover:bg-white transition-all disabled:opacity-50">
            Cancel
          </button>
          <Button onClick={handleSubmit} isLoading={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-10 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-xl shadow-yellow-600/20 min-w-[180px] justify-center">
            <Check size={18} />
            <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
