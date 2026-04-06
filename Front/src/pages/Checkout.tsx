import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
  });

  const totalPrice = getTotalPrice();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    
    setTimeout(() => {
      setIsProcessing(false);
      setOrderPlaced(true);
      clearCart();
      
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }, 2000);
  };

  const { language } = useLanguage();

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-beige/30 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-brand-brown mb-4">
            Votre panier est vide
          </h2>
          <Button onClick={() => navigate('/products')}>
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-beige/30 to-white py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-brand-brown mb-3">
              Commande confirmée !
            </h2>
            <p className="text-gray-600 mb-6">
              Merci pour votre commande. Vous recevrez un email de confirmation sous peu.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers votre tableau de bord...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige/30 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="mb-6 text-brand-brown hover:text-brand-orange"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Button>

        <h1 className="text-3xl font-bold text-brand-brown mb-8">
          Finaliser la commande
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations de contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Mode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-grow cursor-pointer">
                        Carte bancaire
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile" className="flex-grow cursor-pointer">
                        Mobile Money (Airtel/Orange/Mvola)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-grow cursor-pointer">
                        Paiement à la livraison
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </form>
          </div>

          {}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {}
                <div className="space-y-3">
                  {items.map((item) => {
                    const itemPrice = item.priceVariation?.discountedPrice || item.price;
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-gray-500">Qté: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(itemPrice * item.quantity, language)}</p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{formatCurrency(totalPrice, language)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className="text-green-600 font-medium">GRATUIT</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-brand-orange">
                    {formatCurrency(totalPrice, language)}
                  </span>
                </div>

                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white py-6 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">⌛</span>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Confirmer et payer
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  En confirmant, vous acceptez nos conditions générales de vente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
