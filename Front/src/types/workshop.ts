// Enums matching backend
export type WorkshopType = 'inscription' | 'reservation';
export type WorkshopStatus = 'draft' | 'published' | 'archived' | 'rejected' | 'pending_approval';
export type SkillLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Artisan basic info
export interface ArtisanBasic {
  id: string;
  name: string;
  avatar?: string;
}

// Workshop item for list
export interface WorkshopListItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  category: string;
  skill_level: SkillLevel;
  base_price: number;
  foreign_price?: number;
  duration_minutes: number;
  max_participants: number;
  featured_image_url?: string;
  artisan: ArtisanBasic;
  rating_average: number;
  rating_count: number;
}

// Full workshop details
export interface WorkshopOut {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  artisan_id: string;
  artisan?: ArtisanBasic;
  category: string;
  workshop_type: WorkshopType;
  skill_level: SkillLevel;
  base_price: number;
  foreign_price?: number;
  private_price?: number;
  currency: string;
  min_participants: number;
  max_participants: number;
  duration_minutes: number;
  location: string;
  location_type: string;
  address?: string;
  online_platform?: string;
  online_link?: string;
  materials_included?: string[];
  materials_to_bring?: string[];
  prerequisites?: string;
  what_you_will_learn?: string[];
  program?: Record<string, any>;
  privatization_enabled: boolean;
  privatization_min_participants?: number;
  privatization_max_participants?: number;
  privatization_base_price?: number;
  privatization_price_per_participant?: number;
  featured_image_url?: string;
  gallery_images?: string[];
  status: WorkshopStatus;
  is_featured: boolean;
  requires_approval: boolean;
  cancellation_policy?: string;
  refund_policy?: string;
  tags?: string[];
  total_bookings: number;
  rating_average: number;
  rating_count: number;
  created_at?: string;
  updated_at?: string;
}

// Workshop creation/update input
export interface WorkshopCreate {
  title: string;
  description: string;
  short_description: string;
  category: string;
  workshop_type: WorkshopType;
  skill_level: SkillLevel;
  base_price: number;
  foreign_price?: number;
  min_participants?: number;
  max_participants: number;
  duration_minutes: number;
  location: string;
  location_type?: string;
  address?: string;
  materials_included?: string[];
  materials_to_bring?: string[];
  prerequisites?: string;
  what_you_will_learn?: string[];
  program?: Record<string, any>;
  privatization_enabled?: boolean;
  privatization_min_participants?: number;
  privatization_max_participants?: number;
  privatization_base_price?: number;
  privatization_price_per_participant?: number;
  cancellation_policy?: string;
  refund_policy?: string;
  tags?: string[];
}

export interface WorkshopUpdate extends Partial<WorkshopCreate> {}

// Workshop session
export interface WorkshopSessionOut {
  id: string;
  workshop_id: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  max_participants: number;
  current_bookings: number;
  available_spots: number;
  session_price?: number;
  is_private: boolean;
  status: SessionStatus;
  session_notes?: string;
}

export interface WorkshopSessionCreate {
  start_datetime: string;
  end_datetime: string;
  timezone?: string;
  max_participants?: number;
  session_price?: number;
  is_private?: boolean;
  session_notes?: string;
}

// Workshop booking
export interface WorkshopBookingOut {
  id: string;
  booking_number: string;
  confirmation_code: string;
  session_id: string;
  workshop_id: string;
  user_id: string;
  participants_count: number;
  total_price: number;
  currency: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  special_requests?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkshopBookingCreate {
  session_id: string;
  participants_count: number;
  special_requests?: string;
  participant_names?: string[];
}

// Booking confirmation response
export interface BookingConfirmation {
  booking_id: string;
  confirmation_code: string;
  total_price: number;
  currency: string;
  status: BookingStatus;
  created_at: string;
}

// Availability response
export interface AvailabilityResponse {
  workshop_id: string;
  available_dates: string[];
  booked_dates: string[];
}

// List response wrapper
export interface WorkshopListResponse {
  items: WorkshopListItem[];
  total: number;
  page: number;
  pages: number;
}

// Legacy interface for backward compatibility
export interface Workshop {
  id: string;
  title: string;
  category: string;
  artisan?: {
    id: string;
    name: string;
    specialty: string;
  };
  date?: Date;
  duration: number; // en heures
  description: string;
  learningObjectives: string[];
  includedMaterials: string[];
  program: string[];
  importantInfo: string[];
  basePrice: number; // prix pour les locaux
  foreignPrice?: number; // prix pour les étrangers
  privatizationEnabled: boolean;
  privatizationOptions?: {
    minParticipants: number;
    maxParticipants: number;
    basePrice: number;
    pricePerParticipant: number;
  };
  maxParticipants: number;
  currentParticipants?: number;
  status: 'draft' | 'published' | 'cancelled';
  type: 'inscription' | 'reservation';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkshopFormData {
  title: string;
  category: string;
  artisanId?: string;
  date?: Date;
  duration: number;
  description: string;
  learningObjectives: string[];
  includedMaterials: string[];
  program: string[];
  importantInfo: string[];
  basePrice: number;
  foreignPrice?: number;
  privatizationEnabled: boolean;
  privatizationOptions?: {
    minParticipants: number;
    maxParticipants: number;
    basePrice: number;
    pricePerParticipant: number;
  };
  maxParticipants: number;
  type: 'inscription' | 'reservation';
  location?: string;
}

export interface QuoteRequest {
  id: string;
  workshopId: string;
  workshopTitle: string;
  clientType: 'particulier' | 'entreprise';
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
    company?: string;
    siret?: string;
  };
  eventDetails: {
    participants: number;
    location: string;
    customLocation?: string;
    preferredDate: Date;
    alternativeDate?: Date;
    eventType?: string;
  };
  specialRequirements?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  status: 'pending' | 'quoted' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: 'basic' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  price: number;
  features: string[];
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}