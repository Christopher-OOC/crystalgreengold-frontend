// src/types/category.types.ts

export interface Category {
  id: number | string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
}