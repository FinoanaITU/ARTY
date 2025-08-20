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