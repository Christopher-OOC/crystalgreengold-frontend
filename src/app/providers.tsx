'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/features/auth/AuthContext';
import { CartProvider } from '@/features/cart/CartContext';

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-emerald-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
    </div>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <RouteLoader />;

  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" />
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
