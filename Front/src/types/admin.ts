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
