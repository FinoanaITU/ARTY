
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  minBulkQuantity?: number;
}

interface BulkOrderFormProps {
  productId: string;
  product: Product;
  onClose: () => void;
}

const BulkOrderForm = ({ productId, product, onClose }: BulkOrderFormProps) => {
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState<number | string>(product.minBulkQuantity || 5);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [bulkOrderData, setBulkOrderData] = useState<{
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    total_amount: number;
  } | null>(null);

  // Calculer les remises selon la grille backend
  const calculateBulkPrice = (qty: number) => {
    let discount = 0;
    if (qty >= 50) discount = 0.25;
    else if (qty >= 20) discount = 0.15;
    else if (qty >= 10) discount = 0.10;
    else if (qty >= 5) discount = 0.05;
    
    const unitPrice = product.price * (1 - discount);
    const subtotal = product.price * qty;
    const discountAmount = subtotal * discount;
    const totalAmount = subtotal - discountAmount;
    
    return {
      unit_price: unitPrice,
      discount_percentage: discount * 100,
      discount_amount: discountAmount,
      total_amount: totalAmount
    };
  };

  // Mettre à jour les calculs quand la quantité change
  React.useEffect(() => {
    const calculated = calculateBulkPrice(quantity);
    setBulkOrderData(calculated);
  }, [quantity, product.price]);

  const unitPrice = bulkOrderData?.unit_price || product.price;
  const totalPrice = bulkOrderData?.total_amount || (product.price * quantity);
  const discountAmount = bulkOrderData?.discount_amount || 0;
  const discountPercentage = bulkOrderData?.discount_percentage || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiService.createBulkOrderRequest(productId, {
        quantity,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        company: customerInfo.company || undefined,
        message: customerInfo.message || undefined
      });
      
      toast.success('Demande de commande en gros envoyée avec succès ! Nous vous contacterons bientôt.');
      onClose();
    } catch (error: any) {
      console.error('Error creating bulk order request:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de l\'envoi de la demande';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commande en gros</CardTitle>
              <CardDescription>{product.name}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity and Pricing */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantité (minimum {product.minBulkQuantity || 5})
                </label>
                <Input
                  type="number"
                  value={quantity as any}
                  onFocus={() => {
                    if (Number(quantity) === (product.minBulkQuantity || 5)) {
                      setQuantity('' as any);
                    }
                  }}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQuantity(v === '' ? '' as any : Math.max(product.minBulkQuantity || 5, parseInt(v) || 0));
                  }}
                  onBlur={() => {
                    if ((quantity as any) === '') {
                      setQuantity(product.minBulkQuantity || 5);
                    }
                  }}
                  min={product.minBulkQuantity || 5}
                />
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix unitaire de base:</span>
                    <span className="font-medium">{formatCurrency(product.price, language)}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise ({discountPercentage.toFixed(0)}%):</span>
                      <span className="font-medium">-{formatCurrency(discountAmount, language)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Prix unitaire (avec remise):</span>
                    <span className="font-medium">{formatCurrency(unitPrice, language)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-semibold">Prix total:</span>
                    <span className="font-bold text-lg">{formatCurrency(totalPrice, language)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Économies totales:</span>
                      <span className="font-medium">-{formatCurrency(discountAmount, language)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk Pricing Tiers */}
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Grille de remises:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span>5-9 pièces: -5%</span>
                  <span>10-19 pièces: -10%</span>
                  <span>20-49 pièces: -15%</span>
                  <span>50+ pièces: -25%</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Informations de contact</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom complet *</label>
                  <Input
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, email: e.target.value}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone *</label>
                  <Input
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Entreprise (optionnel)</label>
                  <Input
                    value={customerInfo.company}
                    onChange={(e) => setCustomerInfo(prev => ({...prev, company: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message (optionnel)</label>
                <Textarea
                  rows={3}
                  value={customerInfo.message}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, message: e.target.value}))}
                  placeholder="Détails supplémentaires sur votre commande..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOrderForm;
