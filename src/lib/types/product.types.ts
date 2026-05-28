// ── Category (inline shape matching Spring Boot response) ────────────────────

export interface ProductCategory {
  id:   number | string;
  name: string;
}

// ── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id:          string | number;
  name:        string;
  description?: string;

  price:        number;
  discountPrice?: number;
  pv?:          number;   // point value — returned by backend
  bv?:          number;   // bonus value — returned by backend

  // image field names — backend uses 'image', some endpoints use 'imageUrl'
  image?:       string;
  imageUrl?:    string;
  images?:      string[];
  sku?:         string;

  // category can be a full object or just a string name
  category?:    ProductCategory | string;
  categoryId?:  string | number;

  storeId?:     string;
  stock?:       number;
  availableQuantity?: number;

  isDiscounted?: boolean;
  isActive?:     boolean;

  createdAt?:   string;
  updatedAt?:   string;
}

// ── Requests ─────────────────────────────────────────────────────────────────

export interface CreateProductRequest {
  name:          string;
  description?:  string;
  price:         number;
  discountPrice?: number;
  categoryId?:   string;
  storeId?:      string;
  stock?:        number;
  imageUrl?:     string;
  images?:       string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Safely get category name regardless of whether it's an object or a string
export function getCategoryName(category: Product['category']): string {
  if (!category) return 'General';
  if (typeof category === 'string') return category;
  return category.name || 'General';
}

// Get image URL — tries 'image' first (backend field), then 'imageUrl', then fallback
export function getProductImage(product: Product, fallback?: string): string {
  return (
    product.image ??
    product.imageUrl ??
    (product.images?.[0]) ??
    fallback ??
    `https://picsum.photos/seed/${product.id}/400/400`
  );
}
