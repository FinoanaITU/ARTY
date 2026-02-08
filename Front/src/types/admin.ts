/**
 * Types TypeScript pour l'administration
 * Basés sur les schemas Pydantic de Back/app/schemas/admin.py
 */

export enum ValidationType {
  PROFILE = 'profile',
  PRODUCT = 'product',
  WORKSHOP = 'workshop',
  ALL = 'all'
}

export enum ValidationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ValidationAction {
  APPROVE = 'approve',
  REJECT = 'reject'
}

/**
 * Requête de validation (approve/reject)
 */
export interface ValidationRequest {
  action: ValidationAction;
  notes?: string;
}

/**
 * Historique de validation
 */
export interface ValidationHistory {
  id: string;
  artisan_id: string;
  validation_type: string;
  entity_id?: string;
  status: string;
  validated_by?: string;
  validation_notes?: string;
  validated_at?: string;
  created_at: string;
}

/**
 * Item en attente de validation
 */
export interface PendingValidationItem {
  id: string;
  type: ValidationType;
  entity_id?: string;
  artisan_id: string;
  artisan_name: string;
  artisan_email: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  details?: Record<string, any>;
}

/**
 * Response liste des validations en attente
 */
export interface PendingValidationsResponse {
  total: number;
  items: PendingValidationItem[];
  count_by_type: Record<string, number>;
}

/**
 * Statistiques de validation
 */
export interface ValidationStats {
  period: string;
  total_validations: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  approval_rate: number;
  average_response_time_hours?: number;
  by_type: Record<string, Record<string, number>>;
}

/**
 * Response après validation (approve/reject)
 */
export interface ValidationResponse {
  message: string;
  artisan_id?: string;
  product_id?: string;
  workshop_id?: string;
  status?: string;
}

// ============================================
// ANALYTICS TYPES (PHASE 2)
// ============================================

/**
 * Statistiques par rôle utilisateur
 */
export interface UsersByRole {
  buyers: number;
  artisans: number;
  admins: number;
}

/**
 * Statistiques d'entités (produits/ateliers)
 */
export interface EntityStats {
  active?: number;
  pending?: number;
  total: number;
}

/**
 * Statistiques publiées/en attente
 */
export interface PublishedPendingStats {
  published: number;
  pending: number;
  total: number;
}

/**
 * Vue d'ensemble de la plateforme
 */
export interface PlatformOverview {
  total_users: number;
  users_by_role: UsersByRole;
  total_artisans: EntityStats;
  total_products: PublishedPendingStats;
  total_workshops: PublishedPendingStats;
  total_orders: number;
  total_bookings: number;
  pending_validations: number;
}

/**
 * Breakdown quotidien des revenus
 */
export interface DailyRevenueBreakdown {
  date: string;
  revenue: number;
  orders_revenue: number;
  workshops_revenue: number;
}

/**
 * Statistiques de revenus
 */
export interface RevenueStats {
  total_revenue: number;
  product_sales: number;
  workshop_sales: number;
  commission_artizaho: number;
  commission_rate: number;
  period: string;
  start_date?: string;
  end_date?: string;
  revenue_by_category?: Array<{ category: string; revenue: number }>;
  daily_breakdown?: DailyRevenueBreakdown[];
}

/**
 * Statistiques par spécialité
 */
export interface SpecialtyStats {
  specialty: string;
  count: number;
}

/**
 * Statistiques par région
 */
export interface RegionStats {
  region: string;
  count: number;
}

/**
 * Top performer artisan
 */
export interface TopPerformer {
  artisan_id: string;
  artisan_name: string;
  total_revenue: number;
  email: string;
}

/**
 * Statistiques artisans
 */
export interface ArtisanStats {
  total_artisans: number;
  active_artisans: number;
  pending_approval: number;
  by_specialty: SpecialtyStats[];
  by_region: RegionStats[];
  new_this_month: number;
  top_performers: TopPerformer[];
}

/**
 * Statistiques de conversion
 */
export interface ConversionStats {
  product_view_to_sale_rate: number;
  workshop_to_booking_rate: number;
  visitor_to_buyer_conversion: number;
  products_with_sales: number;
  products_with_views: number;
  workshops_with_bookings: number;
  users_with_orders: number;
}

/**
 * Statistiques comportement utilisateurs
 */
export interface UserBehaviorStats {
  avg_order_value: number;
  avg_cart_size: number;
  repeat_customers_rate: number;
  total_customers: number;
  repeat_customers: number;
  payment_method_stats: Record<string, number>;
}

/**
 * Période pour les statistiques
 */
export type StatsPeriod = 'day' | 'week' | 'month' | 'year' | 'all';
