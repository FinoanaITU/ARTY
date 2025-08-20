
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Info } from 'lucide-react';
import { PaymentPlan } from '@/types/cart';

interface PaymentPlanSelectorProps {
  totalPrice: number;
  onPaymentPlanChange: (plan: PaymentPlan) => void;
}

const PaymentPlanSelector: React.FC<PaymentPlanSelectorProps> = ({
  totalPrice,
  onPaymentPlanChange
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'full' | 'installment'>('full');

  const depositAmount = Math.round(totalPrice * 0.5);
  const remainingAmount = totalPrice - depositAmount;

  const paymentPlans: Record<string, PaymentPlan> = {
    full: {
      type: 'full'
    },
    installment: {
      type: 'installment',
      depositAmount,
      remainingAmount,
      depositDueDate: new Date(),
      remainingDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day for workshops
    }
  };

  const handlePlanChange = (plan: 'full' | 'installment') => {
    setSelectedPlan(plan);
    onPaymentPlanChange(paymentPlans[plan]);
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Mode de paiement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedPlan}
          onValueChange={handlePlanChange}
          className="space-y-4"
        >
          {/* Full Payment */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="flex-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Paiement intégral</div>
                  <div className="text-sm text-gray-600">
                    Payez le montant total maintenant
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {totalPrice.toLocaleString()} Ar
                </div>
              </div>
            </Label>
          </div>

          {/* Installment Payment */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="installment" id="installment" />
            <Label htmlFor="installment" className="flex-1 cursor-pointer">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Paiement en 2 fois</div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Recommandé
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">50% à la réservation:</span>
                    <span className="font-medium">{depositAmount.toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">50% le jour J:</span>
                    <span className="font-medium">{remainingAmount.toLocaleString()} Ar</span>
                  </div>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {selectedPlan === 'installment' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">À propos du paiement en 2 fois :</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• 50% sont requis pour confirmer votre réservation</li>
                  <li>• Le solde sera à régler le jour de l'atelier</li>
                  <li>• Paiement accepté en espèces ou par mobile money</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentPlanSelector;
