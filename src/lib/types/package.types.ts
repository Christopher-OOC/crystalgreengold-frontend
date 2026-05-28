// types/package.types.ts
export interface Package {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  bv?: number;
  pv?: number;
  image?: string;
  directCommissionRate?: number;
  binaryCommissionRate?: number;
  dailyCapping?: number;
  quantity?: number;
  items?: string[];
  features?: string[];
  isActive?: boolean;
  createdAt?: string;
}
export interface CreatePackageRequest { 
  name: string; 
  description?: string; 
  price: number; 
  features?: string[];
 }
export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {}

export interface StorePackage {
  id: string;
  storeId: string;
  packageId: string;
  package?: Package;
  activatedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}
