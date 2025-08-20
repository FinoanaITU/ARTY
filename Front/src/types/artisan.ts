export interface ArtisanProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  materials: string[];
  availableColors: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  stock: number;
  customizable: boolean;
  productionTime: number; // en jours
  status: 'draft' | 'pending_approval' | 'published' | 'rejected';
  artisanId: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  name: string;
  about: string;
  specialties: string[];
  location: {
    region: string;
    city: string;
    address?: string;
  };
  memberSince: Date;
  experience: string;
  artisanType: 'artizaho' | 'uber'; // Artizaho: petit artisan marque blanche, débutant ateliers | Uber: marque établie, fait déjà des ateliers
  businessInfo: {
    hasExistingBrand: boolean;
    currentSalesChannels: string[]; // ex: Facebook, Instagram, boutique physique
    workshopExperience: 'none' | 'beginner' | 'experienced';
    businessDescription: string;
  };
  certifications?: string[];
  awards?: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  status: 'draft' | 'pending_approval' | 'published' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

export interface UnavailabilityPeriod {
  id: string;
  artisanId: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: 'single' | 'range';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}