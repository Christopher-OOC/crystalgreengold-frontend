import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { cartService } from '@/lib/api/services/cart.service';
import { useAuthStore, selectMember } from '@/lib/store/authStore';

export interface CartItem {
  id: string | number;
  cartItemId?: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  pv?: number;
  bv?: number;
  storeId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  updateCart: () => Promise<void>;
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

  // Load cart from backend on mount, fall back to localStorage
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = localStorage.getItem('cart');
      let localItems: CartItem[] = [];
      if (savedCart) {
        try {
          localItems = JSON.parse(savedCart);
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
        }
      }

      if (member?.id) {
        try {
          const serverCart = await cartService.getByMember(member.id);
          if (serverCart?.items?.length) {
            // Merge server cartItemId into local items
            const merged = serverCart.items.map(serverItem => {
              const local = localItems.find(li => String(li.id) === String(serverItem.productId));
              return {
                id: serverItem.productId,
                cartItemId: Number(serverItem.id),
                name: local?.name || serverItem.product?.name || 'Product',
                price: local?.price || serverItem.unitPrice || 0,
                quantity: serverItem.quantity,
                image: local?.image || serverItem.product?.image || '',
                pv: local?.pv || serverItem.product?.pv,
                bv: local?.bv || serverItem.product?.bv,
                storeId: local?.storeId,
              };
            });
            setItems(merged);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Failed to fetch cart from backend, using local cart:', err);
        }
      }

      // Fallback to local items
      setItems(localItems);
      setIsLoading(false);
    };

    loadCart();
  }, [member?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity || 1;
    let originalItems: CartItem[] = [];

    // Optimistically update local state first for instant UI feedback
    setItems(prevItems => {
      originalItems = prevItems;
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
        const response = await cartService.addToCart(member.id, {
          productId: String(item.id),
          quantity: qty,
          storeId: item.storeId,
        });
        // Update items with cartItemId from the server response
        if (response?.items?.length) {
          setItems(prev => prev.map(localItem => {
            const serverItem = response.items.find(
              si => String(si.productId) === String(localItem.id)
            );
            if (serverItem) {
              return { ...localItem, cartItemId: Number(serverItem.id) };
            }
            return localItem;
          }));
        }
      } catch (err: any) {
        console.error('Failed to sync cart with backend:', err);
        setItems(originalItems);
        toast.error('Failed to add item to cart. Local changes were reverted.', {
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

  const updateCart = useCallback(async () => {
    const buildUpdateItems = (cartItems: CartItem[]) =>
      cartItems
        .map(item => ({
          cartItemId: Number(item.cartItemId),
          quantity: item.quantity,
        }))
        .filter(item => Number.isInteger(item.cartItemId));

    if (!member?.id) {
      console.warn('updateCart: no member ID found, skipping API call.');
      toast.error('Please login to update your cart.', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      return;
    }

    let itemsToUpdate = buildUpdateItems(items);

    if (itemsToUpdate.length !== items.length) {
      try {
        const serverCart = await cartService.getByMember(member.id);
        const syncedItems = items.map(item => {
          const serverItem = serverCart.items?.find(
            cartItem => String(cartItem.productId) === String(item.id)
          );

          return serverItem
            ? { ...item, cartItemId: Number(serverItem.id) }
            : item;
        });

        itemsToUpdate = buildUpdateItems(syncedItems);
        if (itemsToUpdate.length === syncedItems.length) {
          setItems(syncedItems);
        }
      } catch (err) {
        console.warn('updateCart: failed to refresh cart item IDs before update:', err);
      }
    }

    if (itemsToUpdate.length !== items.length) {
      console.warn('updateCart: one or more items are missing a numeric cartItemId.');
      toast.error('Cart is still syncing. Please wait a moment and try updating again.', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      return;
    }

    try {
      await cartService.update(member.id, {
        items: itemsToUpdate,
      });
      toast.success('Cart updated successfully!', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        iconTheme: { primary: '#f59e0b', secondary: '#FFFAEE' },
      });
    } catch (err: any) {
      console.error('Failed to update cart:', err);
      toast.error('Failed to update cart. Please try again.', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
    }
  }, [member?.id, items]);

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
        updateCart,
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
