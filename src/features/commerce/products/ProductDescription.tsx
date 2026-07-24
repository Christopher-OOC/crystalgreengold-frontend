import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Heart, Minus, Plus, ShoppingCart, Truck, ShieldCheck, DollarSign, CheckCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ProductPurchaseModal } from '@/features/commerce/products/ProductPurchaseModal';
import { useCart } from '@/features/cart/CartContext';

interface Product {
  id?: string | number;
  name: string;
  price: string | number;
  pv?: number;
  bv?: number;
  image?: string;
  imageUrl?: string;
  images?: string[];
  storeId?: string;
  category?: string | { id: number | string; name: string };
  description?: string | { id: number | string; name: string; description?: string };
  availableQuantity?: number;
}

interface ProductDescriptionProps {
  product: Product;
  onBack: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({ 
  product, 
  onBack,
  onAddToCart,
  onBuyNow 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Helper function to safely extract description text
  const getDescriptionText = useMemo(() => {
    if (!product.description) return 'HEALTHY';
    
    // If description is a string, return it
    if (typeof product.description === 'string') {
      return product.description;
    }
    
    // If description is an object, try to extract meaningful text
    if (typeof product.description === 'object') {
      // Try to get description from the object
      if ('description' in product.description && product.description.description) {
        return product.description.description;
      }
      // Try to get name
      if ('name' in product.description && product.description.name) {
        return product.description.name;
      }
      // If all else fails, stringify
      try {
        return JSON.stringify(product.description);
      } catch {
        return 'Description unavailable';
      }
    }
    
    return 'HEALTHY';
  }, [product.description]);

  // Helper function to safely extract category name
  const getCategoryName = useMemo(() => {
    if (!product.category) return 'Health And Wellness';
    
    if (typeof product.category === 'string') {
      return product.category;
    }
    
    if (typeof product.category === 'object' && 'name' in product.category) {
      return product.category.name;
    }
    
    return 'Health And Wellness';
  }, [product.category]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow();
    } else {
      setIsPurchaseModalOpen(true);
    }
  };

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    } else {
      // Parse price if it's a string like "₦7500"
      const numericPrice = typeof product.price === 'string' 
        ? parseFloat(product.price.replace(/[^0-9.-]/g, '')) 
        : product.price;

      addToCart({
        id: String(product.id || product.name),
        name: product.name,
        price: numericPrice || 0,
        image: product.image || product.imageUrl || product.images?.[0] || `https://picsum.photos/seed/${product.id || product.name}/400/400`,
        pv: product.pv ?? 0,
        bv: product.bv ?? 0,
        storeId: product.storeId,
        quantity: quantity
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <span>Home</span>
          <span>/</span>
          <span>Products</span>
          <span>/</span>
          <span className="text-amber-400">{product.name}</span>
        </div>
        <Button 
          onClick={onBack}
          className="bg-amber-400 hover:bg-amber-400 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2"
        >
          <ChevronLeft size={18} />
          <span>BACK TO PRODUCTS</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="p-8 bg-white dark:bg-white/5 flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square w-full max-w-md"
            >
              <img 
                src={product.image || product.imageUrl || product.images?.[0] || `https://picsum.photos/seed/${product.id || product.name}/400/400`} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image';
                }}
              />
              <button className="absolute top-0 right-0 p-3 bg-white dark:bg-emerald-900 rounded-full shadow-lg text-emerald-400 hover:text-rose-500 transition-colors">
                <Heart size={20} />
              </button>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-emerald-950 dark:text-white">{product.name}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-amber-50 dark:bg-amber-400/10 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-400/20 flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="uppercase tracking-widest">Center Product</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  Availability: <span className="text-emerald-500">{product.availableQuantity} In Stock</span>
                </span>
              </div>

              <div className="flex items-center space-x-12 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">PV:</span>
                  <span className="text-sm font-bold text-emerald-950 dark:text-white">{product.pv ?? 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">BV:</span>
                  <span className="text-sm font-bold text-emerald-950 dark:text-white">{product.bv ?? 0}</span>
                </div>
              </div>

              <p className="text-xs font-bold text-emerald-400">
                Category: <span className="text-amber-400">{getCategoryName}</span>
              </p>
            </div>

            <div className="text-4xl font-bold text-amber-400">
              {product.price}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center border border-emerald-100 dark:border-white/10 rounded-xl overflow-hidden">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="p-4 hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors text-emerald-600"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <div className="w-12 text-center font-bold text-emerald-950 dark:text-white">
                  {quantity}
                </div>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="p-4 hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors text-emerald-600"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex-1 flex space-x-3">
                <Button 
                  variant="secondary"
                  onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-xl flex items-center justify-center space-x-3"
                >
                  <ShoppingCart size={20} />
                  <span>CART</span>
                </Button>
                {/* <Button 
                  onClick={handleBuyNow}
                  className="flex-1 py-4 rounded-xl flex items-center justify-center space-x-3"
                >
                  <DollarSign size={20} />
                  <span>BUY NOW</span>
                </Button> */}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center space-x-4">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Free Shipping</p>
                  <p className="text-xs font-bold text-emerald-950 dark:text-white">On all orders</p>
                </div>
              </div>
              <div className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center space-x-4">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Secure Payment</p>
                  <p className="text-xs font-bold text-emerald-950 dark:text-white">100% Protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-emerald-50 dark:border-white/5">
          <div className="flex border-b border-emerald-50 dark:border-white/5">
            <button 
              onClick={() => setActiveTab('description')}
              className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === 'description' ? 'text-amber-400' : 'text-emerald-400 hover:text-emerald-700'
              }`}
            >
              Description
              {activeTab === 'description' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('additional')}
              className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === 'additional' ? 'text-amber-400' : 'text-emerald-400 hover:text-emerald-700'
              }`}
            >
              Additional Information
              {activeTab === 'additional' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>
          </div>
          <div className="p-12">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-emerald-950 dark:text-white">Description</h3>
                {/* FIX: Render the extracted description text, not the object */}
                <p className="text-emerald-600 dark:text-emerald-400 leading-relaxed">
                  {getDescriptionText}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-emerald-950 dark:text-white">Additional Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-emerald-50 dark:border-white/5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Product Name</span>
                    <span className="text-emerald-600 dark:text-emerald-600">{product.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-50 dark:border-white/5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Category</span>
                    <span className="text-emerald-600 dark:text-emerald-600">{getCategoryName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-50 dark:border-white/5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">PV Points</span>
                  <span className="text-emerald-600 dark:text-emerald-600">{product.pv ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-50 dark:border-white/5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">BV Points</span>
                  <span className="text-emerald-600 dark:text-emerald-600">{product.bv ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Stock Status</span>
                    <span className="text-emerald-500 font-bold">{product.availableQuantity || 20} units available</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <ProductPurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        productId={String(product.id || product.name)}
        productName={product.name}
        price={product.price}
        quantity={quantity}
      />
    </div>
  );
};
