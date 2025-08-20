import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkshopSubscription, SubscriptionPlan, WorkshopCreditUsage } from '@/types/subscription';
import { useUser } from './UserContext';

interface SubscriptionContextType {
  subscription: WorkshopSubscription | null;
  creditUsages: WorkshopCreditUsage[];
  isLoadingSubscription: boolean;
  hasActiveSubscription: boolean;
  canUseCredits: (requiredCredits?: number) => boolean;
  useCredits: (workshopId: number, workshopName: string, artisan: string, creditsUsed?: number) => Promise<boolean>;
  createSubscription: (planId: string) => Promise<boolean>;
  getAvailablePlans: () => SubscriptionPlan[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Plans d'abonnement disponibles
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'explorateur',
    name: 'Explorateur',
    duration: '1 mois',
    credits: 3,
    price: 75000,
    description: '3 savoir-faire différents à découvrir',
    features: ['3 crédits ateliers', 'Accès à tous les ateliers compatibles', 'Calendrier personnalisé'],
    recommended: false
  },
  {
    id: 'apprenti',
    name: 'Artisan Apprenti',
    duration: '2 mois',
    credits: 4,
    price: 120000,
    description: '1 savoir-faire évolutif avec parcours progressif',
    features: ['4 crédits ateliers', 'Parcours évolutif personnalisé', 'Suivi de progression', 'Support prioritaire'],
    recommended: true
  },
  {
    id: 'createur',
    name: 'Créateur Curieux',
    duration: '3 mois',
    credits: 6,
    price: 180000,
    description: 'Parcours multi-savoir-faire complet',
    features: ['6 crédits ateliers', 'Accès illimité aux événements', 'Parcours multi-savoir-faire', 'Bonus matériaux'],
    recommended: false
  }
];

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<WorkshopSubscription | null>(null);
  const [creditUsages, setCreditUsages] = useState<WorkshopCreditUsage[]>([]);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const { user } = useUser();

  // Simuler le chargement de l'abonnement depuis une base de données
  useEffect(() => {
    if (user) {
      setIsLoadingSubscription(true);
      // Simuler un délai de chargement
      setTimeout(() => {
        // Exemple d'abonnement actif pour la démo
        const mockSubscription: WorkshopSubscription = {
          id: 'sub_123',
          planId: 'explorateur',
          planName: 'Explorateur',
          creditsTotal: 3,
          creditsUsed: 0,
          creditsRemaining: 3,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          isActive: true,
          userId: user.id
        };
        setSubscription(mockSubscription);
        setIsLoadingSubscription(false);
      }, 1000);
    } else {
      setSubscription(null);
      setCreditUsages([]);
    }
  }, [user]);

  const hasActiveSubscription = subscription?.isActive && 
    subscription.endDate > new Date() && 
    subscription.creditsRemaining > 0;

  const canUseCredits = (requiredCredits: number = 1): boolean => {
    return hasActiveSubscription && (subscription?.creditsRemaining || 0) >= requiredCredits;
  };

  const useCredits = async (
    workshopId: number, 
    workshopName: string, 
    artisan: string, 
    creditsUsed: number = 1
  ): Promise<boolean> => {
    if (!subscription || !canUseCredits(creditsUsed)) {
      return false;
    }

    try {
      // Créer un nouvel usage de crédit
      const newUsage: WorkshopCreditUsage = {
        id: `usage_${Date.now()}`,
        subscriptionId: subscription.id,
        workshopId,
        workshopName,
        artisan,
        usedDate: new Date(),
        creditsUsed
      };

      // Mettre à jour l'abonnement
      const updatedSubscription = {
        ...subscription,
        creditsUsed: subscription.creditsUsed + creditsUsed,
        creditsRemaining: subscription.creditsRemaining - creditsUsed
      };

      // Simuler la sauvegarde en base de données
      await new Promise(resolve => setTimeout(resolve, 500));

      setSubscription(updatedSubscription);
      setCreditUsages(prev => [...prev, newUsage]);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'utilisation des crédits:', error);
      return false;
    }
  };

  const createSubscription = async (planId: string): Promise<boolean> => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan || !user) return false;

    try {
      // Calculer la date de fin basée sur la durée
      const durationInDays = plan.duration.includes('mois') 
        ? parseInt(plan.duration) * 30 
        : parseInt(plan.duration);

      const newSubscription: WorkshopSubscription = {
        id: `sub_${Date.now()}`,
        planId: plan.id,
        planName: plan.name,
        creditsTotal: plan.credits,
        creditsUsed: 0,
        creditsRemaining: plan.credits,
        startDate: new Date(),
        endDate: new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000),
        isActive: true,
        userId: user.id
      };

      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscription(newSubscription);
      return true;
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      return false;
    }
  };

  const getAvailablePlans = (): SubscriptionPlan[] => {
    return subscriptionPlans;
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      creditUsages,
      isLoadingSubscription,
      hasActiveSubscription,
      canUseCredits,
      useCredits,
      createSubscription,
      getAvailablePlans
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};