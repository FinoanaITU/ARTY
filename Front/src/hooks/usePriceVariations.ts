
import { useState, useEffect } from 'react';
import { PriceVariation, PromoCode } from '@/types/cart';

interface PriceVariationConfig {
  tourist: number; // percentage discount
  local: number;
  business: number;
  tour_operator: number;
  travel_agency: number;
}

const defaultDiscounts: PriceVariationConfig = {
  tourist: 0,
  local: 15,
  business: 20,
  tour_operator: 25,
  travel_agency: 30
};

export const usePriceVariations = (basePrice: number, fixedUserType?: keyof PriceVariationConfig) => {
  const [selectedUserType, setSelectedUserType] = useState<keyof PriceVariationConfig>(fixedUserType || 'tourist');
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);

  // Si un type fixe est fourni, l'utiliser
  useEffect(() => {
    if (fixedUserType) {
      setSelectedUserType(fixedUserType);
    }
  }, [fixedUserType]);

  // Mock promo codes - in real app, fetch from backend
  const availablePromoCodes: PromoCode[] = [
    {
      code: 'LOCAL15',
      type: 'percentage',
      value: 15,
      applicableUserTypes: ['tourist'],
      isActive: true
    },
    {
      code: 'BUSINESS20',
      type: 'percentage',
      value: 20,
      applicableUserTypes: ['tourist', 'local'],
      isActive: true
    },
    {
      code: 'WELCOME5000',
      type: 'fixed',
      value: 5000,
      applicableUserTypes: ['tourist', 'local', 'business'],
      minAmount: 20000,
      isActive: true
    }
  ];

  const calculatePrice = (): PriceVariation => {
    let discount = defaultDiscounts[selectedUserType];
    let finalPrice = basePrice;

    // Apply base discount
    if (discount > 0) {
      finalPrice = basePrice * (1 - discount / 100);
    }

    // Apply promo code if valid
    if (appliedPromoCode) {
      if (appliedPromoCode.type === 'percentage') {
        finalPrice = finalPrice * (1 - appliedPromoCode.value / 100);
      } else {
        finalPrice = Math.max(0, finalPrice - appliedPromoCode.value);
      }
    }

    const totalDiscountPercentage = ((basePrice - finalPrice) / basePrice) * 100;

    return {
      type: selectedUserType,
      originalPrice: basePrice,
      discountedPrice: Math.round(finalPrice),
      discountPercentage: Math.round(totalDiscountPercentage)
    };
  };

  const applyPromoCode = (code: string): boolean => {
    const promo = availablePromoCodes.find(p => 
      p.code === code.toUpperCase() && 
      p.isActive &&
      p.applicableUserTypes.includes(selectedUserType)
    );

    if (promo) {
      const currentPrice = calculatePrice();
      if (promo.minAmount && currentPrice.discountedPrice < promo.minAmount) {
        return false;
      }
      setAppliedPromoCode(promo);
      return true;
    }
    return false;
  };

  const removePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCode('');
  };

  // Fonction pour obtenir le prix final directement
  const getFinalPrice = (): number => {
    return calculatePrice().discountedPrice;
  };

  return {
    selectedUserType,
    setSelectedUserType,
    promoCode,
    setPromoCode,
    appliedPromoCode,
    priceVariation: calculatePrice(),
    applyPromoCode,
    removePromoCode,
    getFinalPrice,
    userTypeLabels: {
      tourist: 'Touriste',
      local: 'Résident local (-15%)',
      business: 'Entreprise (-20%)',
      tour_operator: 'Tour opérateur (-25%)',
      travel_agency: 'Agence de voyage (-30%)'
    }
  };
};
