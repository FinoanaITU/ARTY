/**
 * Types TypeScript pour les produits artisanaux
 * Correspond aux schémas Pydantic du backend
 */

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

export interface ArtisanBasic {
  id: string;
  name: string;
}

export interface ProductOut {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  images: string[];
  artisan: ArtisanBasic;
  materials: string[];
  available_colors: string[];
  dimensions?: ProductDimensions;
  stock: number;
  customizable: boolean;
  production_time_days: number;
  bulk_order_enabled: boolean;
  min_bulk_quantity?: number;
  status: string; 
  rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  artisan: ArtisanBasic;
  stock: number;
  status: string;
  rating?: number;
  review_count: number;
  created_at: string;
}

export interface ProductListResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface CategoryOut {
  name: string;
  subcategories: string[];
}

export interface CategoriesResponse {
  categories: CategoryOut[];
}

export interface ProductCreate {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  materials?: string[];
  available_colors?: string[];
  dimensions?: ProductDimensions;
  stock: number;
  customizable?: boolean;
  production_time_days: number;
  bulk_order_enabled?: boolean;
  min_bulk_quantity?: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  materials?: string[];
  available_colors?: string[];
  dimensions?: ProductDimensions;
  stock?: number;
  customizable?: boolean;
  production_time_days?: number;
  bulk_order_enabled?: boolean;
  min_bulk_quantity?: number;
  status?: string;
}

export interface BulkOrderRequestIn {
  quantity: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company?: string;
  message?: string;
}

export interface BulkOrderRequestOut {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  discount_amount: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company?: string;
  message?: string;
  status: string;
  artisan_notes?: string;
  contacted_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

