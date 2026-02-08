/**
 * Types for quote management
 */

export type QuoteType = 'workshop' | 'product' | 'custom';
export type QuoteStatus = 'pending' | 'quoted' | 'approved' | 'rejected' | 'completed';
export type ClientType = 'particulier' | 'entreprise';

/**
 * Quote Request - Input for creating a quote
 */
export interface QuoteRequestIn {
  quote_type: QuoteType;
  title: string;
  description: string;
  quantity: number;
  client_type: ClientType;
  client_name: string;
  client_email: string;
  client_phone: string;
  company_name?: string;
}

/**
 * Quote Update - Input for updating a quote (admin only)
 */
export interface QuoteUpdateIn {
  final_price?: number;
  admin_notes?: string;
  artisan_id?: string;
}

/**
 * Quote - Full quote object returned from API
 */
export interface Quote {
  id: string;
  user_id: string;
  artisan_id?: string | null;
  quote_type: QuoteType;
  title: string;
  description: string;
  quantity: number;
  client_type: ClientType;
  client_name: string;
  client_email: string;
  client_phone: string;
  company_name?: string | null;
  status: QuoteStatus;
  estimated_price?: number | null;
  final_price?: number | null;
  admin_notes?: string | null;
  requested_at: string; // ISO datetime
  quoted_at?: string | null;
  responded_at?: string | null;
  completed_at?: string | null;
}

/**
 * Quote List Response - Paginated list of quotes
 */
export interface QuoteListResponse {
  items: Quote[];
  total: number;
  skip: number;
  limit: number;
  stats?: QuoteStats;
}

/**
 * Quote Stats - Statistics about quotes
 */
export interface QuoteStats {
  total: number;
  pending: number;
  quoted: number;
  approved: number;
  rejected: number;
  completed: number;
  approval_rate?: number; // percentage (0-100)
  conversion_rate?: number; // percentage (0-100)
  average_response_time?: number; // hours
  total_value?: number;
}

/**
 * Quote Summary Response - When creating/updating a quote
 */
export interface QuoteSummaryResponse {
  id: string;
  status: QuoteStatus;
  message: string;
  final_price?: number;
}

/**
 * Quote Conversion Response - When converting quote to order
 */
export interface QuoteConversionResponse {
  order_id: string;
  order_data: {
    title: string;
    description: string;
    quantity: number;
    price: number;
    status: string;
  };
  message: string;
}
