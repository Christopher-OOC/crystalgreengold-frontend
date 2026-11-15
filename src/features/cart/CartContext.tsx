import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { cartService } from '@/lib/api/services/cart.service';
import { useAuthStore, selectMember } from '@/lib/store/authStore';

export interface CartItem {
  id: string | number;
  productId: string;
  cartItemId?: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  pv?: number;
  bv?: number;
  storeId?: string;
}

type NewCartItem = Omit<CartItem, 'quantity' | 'productId' | 'cartItemId'> & {
  quantity?: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (item: NewCartItem) => Promise<void>;
  removeFromCart: (id: string | number) => Promise<void>;
  updateQuantity: (id: string | number, delta: number) => void;
  updateCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const responseMessage = (error as any).response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;

    const message = (error as any).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

const mapServerCartToItems = (serverCart: any): CartItem[] => {
  const rawItems = Array.isArray(serverCart)
    ? serverCart
    : (serverCart?.data?.cartItems ?? serverCart?.cartItems ?? serverCart?.items ?? serverCart?.data?.items ?? []);

  return rawItems.map((serverItem: any) => {
    const productId = String(serverItem.product?.id ?? serverItem.productId ?? serverItem.id);
    const cartItemId = Number(serverItem.id);

    return {
      id: serverItem.id ?? productId,
      productId,
      ...(Number.isInteger(cartItemId) ? { cartItemId } : {}),
      name: serverItem.product?.name || serverItem.name || 'Product',
      price: Number(serverItem.product?.price ?? serverItem.unitPrice ?? serverItem.price ?? 0),
      quantity: Number(serverItem.quantity ?? 1),
      image: serverItem.product?.image || serverItem.image || '',
      pv: serverItem.product?.pv ?? serverItem.pv,
      bv: serverItem.product?.bv ?? serverItem.bv,
      storeId: serverItem.storeResponse?.storeId || serverItem.storeId || serverItem.product?.storeId,
    };
  });
};

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

  const refreshCart = useCallback(async () => {
    if (!member?.id) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const serverCart = await cartService.getByMember(member.id);
      setItems(mapServerCartToItems(serverCart));
    } catch (err) {
      console.warn('Failed to fetch cart from server:', err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [member?.id]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (item: NewCartItem) => {
    const qty = item.quantity || 1;

    if (member?.id) {
      try {
        const response = await cartService.addToCart(member.id, {
          productId: String(item.id),
          quantity: qty,
          storeId: item.storeId,
        });
        setItems(mapServerCartToItems(response));
        await refreshCart();
      } catch (err: any) {
        console.error('Failed to sync cart with backend:', err);
        toast.error(getErrorMessage(err, 'Failed to add item to cart. Please try again.'), {
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

  const removeFromCart = useCallback(async (id: string | number) => {
    const item = items.find(candidate => candidate.id === id);
    if (member?.id && item?.cartItemId) {
      try {
        const updatedCart = await cartService.removeItem(member.id, item.cartItemId);
        setItems(mapServerCartToItems(updatedCart));
        return;
      } catch (err) {
        console.error('Failed to remove cart item:', err);
        toast.error(getErrorMessage(err, 'Failed to remove item from cart. Please try again.'));
        return;
      }
    }
    setItems(prev => prev.filter(candidate => candidate.id !== id));
  }, [items, member?.id]);

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
          const serverItem = mapServerCartToItems(serverCart).find(
            cartItem => cartItem.productId === item.productId && cartItem.storeId === item.storeId
          );

          return serverItem
            ? { ...item, id: serverItem.id, cartItemId: serverItem.cartItemId }
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
      const updatedCart = await cartService.update(member.id, { items: itemsToUpdate });
      setItems(mapServerCartToItems(updatedCart));
      toast.success('Cart updated successfully!', {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        iconTheme: { primary: '#f59e0b', secondary: '#FFFAEE' },
      });
    } catch (err: any) {
      console.error('Failed to update cart:', err);
      toast.error(getErrorMessage(err, 'Failed to update cart. Please try again.'), {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
    }
  }, [member?.id, items]);

  const clearCart = useCallback(async () => {
    if (member?.id) {
      try {
        await cartService.clear(member.id);
        setItems([]);
        return;
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
        toast.error(getErrorMessage(err, 'Failed to clear cart. Please try again.'), {
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
        });
        return;
      }
    }

    setItems([]);
  }, [member?.id, refreshCart]);

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
        refreshCart,
        getItemCount,
        getSubtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
