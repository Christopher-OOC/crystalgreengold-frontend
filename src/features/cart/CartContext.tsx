import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { cartService } from '@/lib/api/services/cart.service';
import { useAuthStore, selectMember } from '@/lib/store/authStore';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  pv?: number;
  bv?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const member = useAuthStore(selectMember);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity || 1;

    // Optimistically update local state first for instant UI feedback
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: qty }];
      }
    });

    // Call the backend endpoint
    if (member?.id) {
      try {
        await cartService.addToCart(member.id, {
          productId: String(item.id),
          quantity: qty,
        });
      } catch (err: any) {
        console.error('Failed to sync cart with backend:', err);
        // Don't revert the local state — the item is still usable locally
        // but notify the user so they know something may be off
        toast.error('Cart saved locally but failed to sync with server.', {
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
        });
        return;
      }
    } else {
      console.warn('addToCart: no member ID found, skipping API call.');
    }

    toast.success(`${item.name} added to cart!`, {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      iconTheme: {
        primary: '#f59e0b',
        secondary: '#FFFAEE',
      },
    });
  }, [member?.id]);

  const removeFromCart = useCallback((id: string | number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string | number, delta: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};