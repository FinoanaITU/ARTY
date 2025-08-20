
export interface CartItem {
  id: string;
  type: 'product' | 'workshop' | 'subscription';
  productId?: number;
  workshopId?: number;
  subscriptionPlanId?: string;
  name: string;
  artisan?: string;
  description?: string;
  price: number;
  quantity: number;
  image: string;
  selectedDate?: Date;
  selectedTime?: string;
  priceVariation?: PriceVariation;
  paymentPlan?: PaymentPlan;
  subscriptionDetails?: {
    duration: string;
    credits: number;
    features: string[];
  };
}

export interface PriceVariation {
  type: 'tourist' | 'local' | 'business' | 'tour_operator' | 'travel_agency';
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
}

export interface PaymentPlan {
  type: 'full' | 'installment';
  depositAmount?: number;
  remainingAmount?: number;
  depositDueDate?: Date;
  remainingDueDate?: Date;
}

export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableUserTypes: string[];
  minAmount?: number;
  expiryDate?: Date;
  isActive: boolean;
}
