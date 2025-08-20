
export interface CustomBookingRequest {
  workshopId: number;
  preferredDate: Date;
  preferredTime?: string;
  alternativeDate?: Date;
  alternativeTime?: string;
  participants: number;
  isPrivate: boolean;
  specialRequirements?: string;
  contactEmail: string;
  contactPhone?: string;
  message?: string;
}

export interface PrivatizationOption {
  minParticipants: number;
  maxParticipants: number;
  basePrice: number;
  pricePerParticipant: number;
  description: string;
}

export interface BookingOption {
  type: 'standard' | 'custom';
  date?: Date;
  time?: string;
  isPrivate: boolean;
  participants: number;
}
