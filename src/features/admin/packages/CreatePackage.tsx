import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, Check, Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { packageService } from '@/lib/api/services/package.service';

interface PackageData {
  id?: number | string;
  name: string;
  description?: string;
  price: number;
  bv?: number;
  pv?: number;
  image?: string;
  directCommissionRate?: number;
  binaryCommissionRate?: number;
  dailyCapping?: number;
}

interface CreatePackageProps {
  onBack: () => void;
  editPackage?: PackageData;
}

export const CreatePackage: React.FC<CreatePackageProps> = ({ onBack, editPackage }) => {
  const isEditing = !!editPackage;
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    bv: '',
    pv: '',
    dailyCapping: '',
    directCommissionRate: '',
    binaryCommissionRate: '',
  });

  // pre-fill form when editing
  useEffect(() => {
    if (editPackage) {
      setForm({
        name: editPackage.name ?? '',
        description: editPackage.description ?? '',
        price: String(editPackage.price ?? ''),
        bv: String(editPackage.bv ?? ''),
        pv: String(editPackage.pv ?? ''),
        dailyCapping: String(editPackage.dailyCapping ?? ''),
        directCommissionRate: String(editPackage.directCommissionRate ?? ''),
        binaryCommissionRate: String(editPackage.binaryCommissionRate ?? ''),
      });
      if (editPackage.image) setImagePreview(editPackage.image);
    }
  }, [editPackage]);

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

  const handleAddItem = () => setItems([...items, '']);
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!isEditing && !imageFile) {
      setError('Please upload a package image.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        name: form.name.toUpperCase(),
        description: form.description,
        price: parseFloat(form.price),
        bv: parseFloat(form.bv),
        pv: parseFloat(form.pv),
        dailyCapping: parseFloat(form.dailyCapping),
        directCommissionRate: parseFloat(form.directCommissionRate),
        binaryCommissionRate: parseFloat(form.binaryCommissionRate),
        packageItems: items.filter(i => i.trim() !== ''),
      }));

      if (imageFile) {
        formData.append('file', imageFile);
      } else if (isEditing) {
        // create a dummy blob so the file field isn't empty on update
        formData.append('file', new Blob([], { type: 'image/png' }), 'empty.png');
      }

      if (isEditing && editPackage?.id) {
        await packageService.update(editPackage.id, formData);
      } else {
        await packageService.create(formData);
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} package.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6 relative">
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-emerald-950 rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight uppercase">Success!</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Package {isEditing ? 'updated' : 'created'} successfully.
                </p>
              </div>
              <Button onClick={onBack} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest">
                Back to Package List
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-emerald-700 dark:text-emerald-400" />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight uppercase">
            {isEditing ? 'Edit Package' : 'Create New Package'}
          </h1>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            {isEditing ? 'Update the package details below' : 'Fill in the details below'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      <Card className="p-8 md:p-10 border-none shadow-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Package Name</label>
            <select name="name" value={form.name} onChange={handleChange}
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium">
              <option value="">Select package name</option>
              <option value="FOUNDATION">FOUNDATION</option>
              <option value="CLASSIC">CLASSIC</option>
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
              <option value="PLATINUM">PLATINUM</option>
              <option value="DIAMOND">DIAMOND</option>
              <option value="INFINITY">INFINITY</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Price (₦)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0"
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the benefits..." rows={4}
            className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium resize-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">BV</label>
            <input type="number" name="bv" value={form.bv} onChange={handleChange} placeholder="0"
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">PV</label>
            <input type="number" name="pv" value={form.pv} onChange={handleChange} placeholder="0"
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Daily Capping (₦)</label>
            <input type="number" name="dailyCapping" value={form.dailyCapping} onChange={handleChange} placeholder="0"
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Direct Commission Rate (%)</label>
            <input type="number" name="directCommissionRate" value={form.directCommissionRate} onChange={handleChange} placeholder="0"
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Binary Commission Rate (%)</label>
            <input type="number" name="binaryCommissionRate" value={form.binaryCommissionRate} onChange={handleChange} placeholder="0"
              className="w-full bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Package Items</label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="text" placeholder="Item description" value={item} onChange={(e) => handleItemChange(index, e.target.value)}
                  className="flex-1 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-medium" />
                {items.length > 1 && (
                  <button onClick={() => handleRemoveItem(index)} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleAddItem} className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-100 transition-colors">
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            Package Image {isEditing && <span className="text-emerald-400 normal-case font-medium">(leave empty to keep current)</span>}
          </label>
          <label className="border-2 border-dashed border-emerald-100 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 bg-white/50 dark:bg-white/[0.02] hover:border-amber-400/50 transition-colors cursor-pointer group">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <img src={imagePreview} className="w-32 h-32 object-cover rounded-xl" />
            ) : (
              <>
                <div className="w-10 h-10 bg-emerald-50 dark:bg-white/5 rounded-full flex items-center justify-center text-emerald-400 group-hover:text-amber-400 transition-colors">
                  <Upload size={20} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Click to upload or drag and drop</p>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
              </>
            )}
          </label>
        </div>

        <div className="flex justify-end pt-6 border-t border-emerald-50 dark:border-white/5">
          <Button onClick={handleSubmit} disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-10 py-3 rounded-xl flex items-center space-x-2 font-black uppercase tracking-widest shadow-xl shadow-yellow-600/20 disabled:opacity-80 min-w-[180px] justify-center">
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /><span>{isEditing ? 'Updating...' : 'Creating...'}</span></>
            ) : (
              <><Check size={18} /><span>{isEditing ? 'Update Package' : 'Create Package'}</span></>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
