
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { usePriceVariations } from '@/hooks/usePriceVariations';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';

interface PriceVariationSelectorProps {
  basePrice: number;
  onPriceChange: (priceVariation: any) => void;
  showPromoCodeOnly?: boolean;
}

const PriceVariationSelector: React.FC<PriceVariationSelectorProps> = ({
  basePrice,
  onPriceChange,
  showPromoCodeOnly = false
}) => {
  const { user } = useUser();
  const { language } = useLanguage();
  
  
  const getUserType = () => {
    if (!user) return 'tourist';
    if (user.buyerType === 'entreprise') return 'business';
    if (user.locationType === 'local') return 'local';
    return 'tourist';
  };

  const {
    promoCode,
    setPromoCode,
    appliedPromoCode,
    priceVariation,
    applyPromoCode,
    removePromoCode
  } = usePriceVariations(basePrice, getUserType());

  React.useEffect(() => {
    onPriceChange(priceVariation);
  }, [priceVariation, onPriceChange]);

  const handleApplyPromoCode = () => {
    const success = applyPromoCode(promoCode);
    if (!success) {
      alert('Code promo invalide ou conditions non remplies');
    }
  };

  
  if (showPromoCodeOnly) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Code promo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code promo (optionnel)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Disponible bientôt"
                value=""
                disabled={true}
                className="bg-gray-100"
              />
              <Button
                disabled={true}
                className="bg-gray-400"
              >
                Appliquer
              </Button>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Disponible bientôt
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  
  return (
    <div className="space-y-4">
      {}
      <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {formatCurrency(priceVariation.discountedPrice, language)}
          </div>
        </div>
      </div>

      {}
      <Card className="border-orange-200">
        <CardContent className="pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code promo (optionnel)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Disponible bientôt"
                value=""
                disabled={true}
                className="bg-gray-100"
              />
              <Button
                disabled={true}
                className="bg-gray-400"
              >
                Appliquer
              </Button>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Disponible bientôt
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceVariationSelector;
