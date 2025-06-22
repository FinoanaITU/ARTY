
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: number;
  name: string;
  price: number;
  minBulkQuantity?: number;
}

interface BulkOrderFormProps {
  product: Product;
  onClose: () => void;
}

const BulkOrderForm = ({ product, onClose }: BulkOrderFormProps) => {
  const [quantity, setQuantity] = useState(product.minBulkQuantity || 5);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const calculateBulkPrice = (qty: number) => {
    let discount = 0;
    if (qty >= 50) discount = 0.25;
    else if (qty >= 20) discount = 0.15;
    else if (qty >= 10) discount = 0.10;
    else if (qty >= 5) discount = 0.05;
    
    return product.price * (1 - discount);
  };

  const unitPrice = calculateBulkPrice(quantity);
  const totalPrice = unitPrice * quantity;
  const savings = (product.price - unitPrice) * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Bulk order submitted:', { product, quantity, customerInfo, totalPrice });
    // Here you would typically send the data to your backend
    alert('Demande de commande en gros envoyée ! Nous vous contacterons bientôt.');
    onClose();
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
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.minBulkQuantity || 5, parseInt(e.target.value) || 0))}
                  min={product.minBulkQuantity || 5}
                />
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix unitaire (avec remise):</span>
                    <span className="font-medium">{unitPrice.toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prix total:</span>
                    <span className="font-bold text-lg">{totalPrice.toLocaleString()} Ar</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Économies:</span>
                      <span className="font-medium">-{savings.toLocaleString()} Ar</span>
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
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                  value={customerInfo.message}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, message: e.target.value}))}
                  placeholder="Détails supplémentaires sur votre commande..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                Envoyer la demande
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOrderForm;
