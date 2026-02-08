import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  Tag
} from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalPrice, 
    getItemsByArtisan,
    clearCart,
    getItemCount 
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();
  const itemsByArtisan = getItemsByArtisan();

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode);
      // TODO: Implémenter la validation du code promo avec l'API
    }
  };

  const handleCheckout = () => {
    // TODO: Naviguer vers la page de paiement
    navigate('/checkout');
  };

  const { language } = useLanguage();

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'workshop':
        return <Calendar className="h-4 w-4" />;
      case 'subscription':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const CartItemCard = ({ item }: { item: CartItemType }) => {
    const itemPrice = item.priceVariation?.discountedPrice || item.price;
    const itemTotal = itemPrice * item.quantity;

    return (
      <div className="flex gap-4 p-4 bg-white rounded-lg border border-brand-beige hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={item.image || '/placeholder-product.jpg'}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-md"
          />
        </div>

        {/* Details */}
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {getItemIcon(item.type)}
                  <span className="ml-1 capitalize">{item.type}</span>
                </Badge>
                {item.priceVariation && (
                  <Badge variant="secondary" className="text-xs">
                    -{item.priceVariation.discountPercentage}%
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-brand-brown text-lg">{item.name}</h3>
              {item.artisan && (
                <p className="text-sm text-gray-600 mt-1">Par {item.artisan}</p>
              )}
              {item.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
              )}
              
              {/* Workshop specific details */}
              {item.type === 'workshop' && item.selectedDate && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(item.selectedDate).toLocaleDateString('fr-FR')}
                    {item.selectedTime && ` à ${item.selectedTime}`}
                  </span>
                </div>
              )}

              {/* Payment plan info */}
              {item.paymentPlan && item.paymentPlan.type === 'installment' && (
                <div className="mt-2 text-sm text-brand-orange">
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  Paiement en plusieurs fois
                </div>
              )}
            </div>

            {/* Price section */}
            <div className="text-right">
              {item.priceVariation ? (
                <>
                  <p className="text-sm text-gray-400 line-through">
                    {formatCurrency(item.priceVariation.originalPrice, language)}
                  </p>
                  <p className="text-lg font-bold text-brand-orange">
                    {formatCurrency(itemPrice, language)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-brand-brown">
                  {formatCurrency(itemPrice, language)}
                </p>
              )}
            </div>
          </div>

          {/* Quantity controls and actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <p className="font-bold text-brand-brown">
                Total: {formatCurrency(itemTotal, language)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-beige/30 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-beige/50 mb-6">
              <ShoppingCart className="h-12 w-12 text-brand-brown/50" />
            </div>
            <h2 className="text-2xl font-bold text-brand-brown mb-3">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits artisanaux et ajoutez-les à votre panier
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/products')}
                className="bg-brand-orange hover:bg-brand-orange/90"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Voir les produits
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/workshops')}
                className="border-brand-orange text-brand-orange hover:bg-brand-orange/10"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Découvrir les ateliers
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige/30 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="mb-4 text-brand-brown hover:text-brand-orange"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuer mes achats
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-brown mb-2 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8" />
                Mon Panier
              </h1>
              <p className="text-gray-600">
                {itemCount} article{itemCount > 1 ? 's' : ''} dans votre panier
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-500 border-red-300 hover:bg-red-50 hover:border-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider le panier
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.keys(itemsByArtisan).length > 1 ? (
              // Grouped by artisan
              Object.entries(itemsByArtisan).map(([artisan, artisanItems]) => (
                <Card key={artisan} className="border-brand-beige">
                  <CardHeader className="bg-brand-beige/30">
                    <CardTitle className="text-lg text-brand-brown">
                      {artisan || 'Artisan'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {artisanItems.map(item => (
                      <CartItemCard key={item.id} item={item} />
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              // Simple list
              items.map(item => (
                <CartItemCard key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-brand-beige shadow-lg">
              <CardHeader className="bg-brand-beige/30">
                <CardTitle className="text-xl text-brand-brown">
                  Récapitulatif
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Promo code */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Code promo
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Entrez votre code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-grow"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      variant="outline"
                      size="sm"
                      className="border-brand-orange text-brand-orange hover:bg-brand-orange/10"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {appliedPromo && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Code "{appliedPromo}" appliqué
                    </p>
                  )}
                </div>

                <Separator />

                {/* Price breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                    <span>{formatCurrency(totalPrice, language)}</span>
                  </div>
                  
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>- {formatCurrency(0, language)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Frais de livraison</span>
                    <span className="text-green-600 font-medium">GRATUIT</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-brand-brown">Total</span>
                  <span className="text-2xl font-bold text-brand-orange">
                    {formatCurrency(totalPrice, language)}
                  </span>
                </div>

                {/* Checkout button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white py-6 text-lg font-semibold"
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Passer la commande
                </Button>

                {/* Info */}
                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>✓ Paiement sécurisé</p>
                  <p>✓ Livraison gratuite</p>
                  <p>✓ Satisfaction garantie</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
