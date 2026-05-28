import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { productService } from '@/lib/api/services/product.service';

// ─── Product shape matching your Spring Boot response ─────────────────────────

export interface Product {
  id: string | number;
  name: string;
  price: number;
  pv?: number;
  bv?: number;
  image?: string;
  imageUrl?: string;
  sku?: string;
  category?: { id: number | string; name: string } | string;
  description?: string;
  availableQuantity?: number;
}

interface PaginatedResponse {
  data: Product[];
  metadata?: { totalPages?: number; totalElements?: number };
}

// ─── useProducts — fetches all products via Axios proxy ──────────────────────
// Used by HomePage featured section (first 6) and CompanyProducts (paginated)

export function useProducts(page = 1, search = '') {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use productService with pagination parameters
      const result = await productService.getAll(page, 8, search);
      
      setProducts(result.data);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      // Fallback: If paginated fetch fails, try fetching all
      try {
        const result = await productService.getAll();
        setProducts(result.data);
        setTotalPages(1);
      } catch (fallbackErr: any) {
        const msg =
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'Failed to load products';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, totalPages, loading, error, refetch: fetch };
}

// ─── useDiscountedProducts ────────────────────────────────────────────────────

export function useDiscountedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<Product[]>(ENDPOINTS.PRODUCTS.DISCOUNTED)
      .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load discounted products'))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
