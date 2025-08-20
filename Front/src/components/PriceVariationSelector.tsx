
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { usePriceVariations } from '@/hooks/usePriceVariations';
import { useUser } from '@/contexts/UserContext';

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
  
  // Déterminer le type d'utilisateur automatiquement
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

  // Si showPromoCodeOnly est true, on affiche seulement la section code promo
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
                placeholder="Entrez votre code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!appliedPromoCode}
              />
              {appliedPromoCode ? (
                <Button
                  variant="outline"
                  onClick={removePromoCode}
                  className="text-red-600 hover:text-red-700"
                >
                  Retirer
                </Button>
              ) : (
                <Button
                  onClick={handleApplyPromoCode}
                  disabled={!promoCode.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Appliquer
                </Button>
              )}
            </div>
            {appliedPromoCode && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Tag className="h-3 w-3 mr-1" />
                  Code {appliedPromoCode.code} appliqué
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Affichage normal avec prix simplifié et code promo
  return (
    <div className="space-y-4">
      {/* Affichage du prix final simplifié */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {priceVariation.discountedPrice.toLocaleString()} Ar
          </div>
          {appliedPromoCode && (
            <div className="mt-2">
              <Badge className="bg-green-600 text-white">
                Code promo appliqué
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Code promo */}
      <Card className="border-orange-200">
        <CardContent className="pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code promo (optionnel)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Entrez votre code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!appliedPromoCode}
              />
              {appliedPromoCode ? (
                <Button
                  variant="outline"
                  onClick={removePromoCode}
                  className="text-red-600 hover:text-red-700"
                >
                  Retirer
                </Button>
              ) : (
                <Button
                  onClick={handleApplyPromoCode}
                  disabled={!promoCode.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Appliquer
                </Button>
              )}
            </div>
            {appliedPromoCode && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Tag className="h-3 w-3 mr-1" />
                  Code {appliedPromoCode.code} appliqué
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceVariationSelector;
