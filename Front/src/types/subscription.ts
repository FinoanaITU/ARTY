export interface WorkshopSubscription {
  id: string;
  planId: 'explorateur' | 'apprenti' | 'createur';
  planName: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  userId: string;
}

export interface SubscriptionPlan {
  id: 'explorateur' | 'apprenti' | 'createur';
  name: string;
  duration: string;
  credits: number;
  price: number;
  description: string;
  features: string[];
  recommended: boolean;
}

export interface WorkshopCreditUsage {
  id: string;
  subscriptionId: string;
  workshopId: number;
  workshopName: string;
  artisan: string;
  usedDate: Date;
  creditsUsed: number;
}