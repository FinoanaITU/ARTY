
export interface CustomBookingRequest {
  workshopId: number;
  preferredDate: Date;
  alternativeDate?: Date;
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
