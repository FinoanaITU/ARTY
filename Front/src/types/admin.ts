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

// ============================================
// PAYMENT TRACKING TYPES (PHASE 3)
// ============================================

export type PaymentTrackingStatus = 'unpaid' | 'partial' | 'paid' | 'pending_collection';
export type PaymentTrackingMethod = 'cash' | 'mvola' | 'orange_money' | 'bank_transfer';
export type PaymentTrackingType = 'product' | 'workshop';
export type ArtisanType = 'artizaho' | 'uber';

export interface PaymentTrackingOut {
  id: string;
  order_id?: string;
  booking_id?: string;
  user_id: string;
  artisan_id: string;
  type: PaymentTrackingType;
  amount_total: number;
  amount_paid: number;
  payment_status: PaymentTrackingStatus;
  payment_method?: PaymentTrackingMethod;
  artisan_type: ArtisanType;
  created_at: string;
  updated_at: string;
  user_name?: string;
  artisan_name?: string;
  order_number?: string;
  booking_number?: string;
}

export interface PaymentTrackingHistoryOut {
  id: string;
  payment_id: string;
  amount: number;
  payment_method: PaymentTrackingMethod;
  transaction_ref?: string;
  notes?: string;
  paid_at: string;
  recorded_by?: string;
  created_at: string;
  recorder_name?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  payment_method: PaymentTrackingMethod;
  transaction_ref?: string;
  notes?: string;
}

export interface PaymentListResponse {
  total: number;
  items: PaymentTrackingOut[];
  total_amount: number;
  total_paid: number;
  total_outstanding: number;
}

export type ArtisanPayoutStatus = 'pending' | 'processing' | 'paid';

export interface ArtisanPayoutOut {
  id: string;
  artisan_id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  commission_rate: number;
  commission_amount: number;
  net_payout: number;
  status: ArtisanPayoutStatus;
  payment_method?: PaymentTrackingMethod;
  payment_ref?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  artisan_name?: string;
  artisan_email?: string;
}

export interface GeneratePayoutRequest {
  artisan_id: string;
  period_start: string;
  period_end: string;
}

export interface MarkPayoutPaidRequest {
  payment_method: PaymentTrackingMethod;
  payment_ref?: string;
  notes?: string;
}

export interface PayoutListResponse {
  total: number;
  items: ArtisanPayoutOut[];
  total_net_payout: number;
  total_commission: number;
}

// ============================================
// SUBSCRIPTION ADMIN TYPES (PHASE 5)
// ============================================

export enum SubscriptionPlanType {
  BASIC = 'basic',
  PLUS = 'plus',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatusType {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum SubscriptionBillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual'
}

export interface SubscriptionOut {
  id: string;
  user_id: string;
  plan: SubscriptionPlanType;
  status: SubscriptionStatusType;
  monthly_price: number;
  billing_cycle: SubscriptionBillingCycle;
  start_date: string;
  end_date: string;
  renewal_date?: string;
  features?: Record<string, any>;
  available_credits: number;
  used_credits: number;
  total_spent: number;
  auto_renew: boolean;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  admin_notes?: string;
  payment_method?: string;
  payment_method_details?: Record<string, any>;
  last_payment_at?: string;
  next_verification_date?: string;
  bonus_credits_added: number;
  times_renewed: number;
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  user_name?: string;
  user_email?: string;
}

export interface SubscriptionListResponse {
  total: number;
  skip: number;
  limit: number;
  subscriptions: SubscriptionOut[];
}

export interface SubscriptionOverviewResponse {
  total_active: number;
  total_by_plan: Record<string, number>;
  total_by_status: Record<string, number>;
  monthly_recurring_revenue: number;
  churned_this_month: number;
  renewal_rate_percent: number;
  timestamp: string;
}

export interface SubscriptionCancelRequest {
  reason?: string;
}

export interface SubscriptionExtendRequest {
  days: number;
  notes?: string;
}

export interface SubscriptionAddCreditsRequest {
  amount: number;
  reason?: string;
}

export interface SubscriptionHistoryOut {
  id: string;
  subscription_id: string;
  action_type: string;
  action_by?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  notes?: string;
  action_at: string;
  actor_name?: string;
}

export interface SubscriptionHistoryResponse {
  total: number;
  skip: number;
  limit: number;
  history: SubscriptionHistoryOut[];
}

export interface SubscriptionStatsResponse {
  total_subscriptions: number;
  total_revenue: number;
  average_subscription_value: number;
  average_lifetime_days: number;
  overview: SubscriptionOverviewResponse;
}
