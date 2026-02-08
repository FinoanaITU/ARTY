import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import type { ArtisanPayoutOut, MarkPayoutPaidRequest, PaymentTrackingMethod } from '@/types/admin';

interface PayoutTrackerProps {
  payouts: ArtisanPayoutOut[];
  isLoading?: boolean;
  onMarkPaid?: (payoutId: string, payment_method: PaymentTrackingMethod, transaction_ref?: string, notes?: string) => Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'processing':
      return 'bg-blue-100 text-blue-700';
    case 'paid':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'processing':
      return 'En cours';
    case 'paid':
      return 'Payé';
    default:
      return status;
  }
};

const paymentMethods: { value: PaymentTrackingMethod; label: string }[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mvola', label: 'MVola' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' }
];

export const PayoutTracker: React.FC<PayoutTrackerProps> = ({ 
  payouts, 
  isLoading = false,
  onMarkPaid 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentTrackingMethod>('bank_transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null);
  const [openPayoutId, setOpenPayoutId] = useState<string | null>(null);

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const processingPayouts = payouts.filter(p => p.status === 'processing');
  const paidPayouts = payouts.filter(p => p.status === 'paid');

  const handleMarkPayoutPaid = async (payoutId: string) => {
    if (!onMarkPaid) {
      toast({
        title: 'Erreur',
        description: 'La fonction de marquage n\'est pas disponible.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une méthode de paiement.',
        variant: 'destructive'
      });
      return;
    }

    setIsMarkingPaid(payoutId);
    try {
      await onMarkPaid(payoutId, selectedMethod, transactionRef || undefined, notes || undefined);
      toast({
        title: 'Payout marqué comme payé',
        description: 'Le payout a été enregistré avec succès.'
      });
      setOpenPayoutId(null);
      setTransactionRef('');
      setNotes('');
      setSelectedMethod('bank_transfer');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le payout comme payé.',
        variant: 'destructive'
      });
    } finally {
      setIsMarkingPaid(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Chargement des payouts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs for different statuses */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            En attente ({pendingPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            En cours ({processingPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Payés ({paidPayouts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingPayouts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Aucun payout en attente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <Card key={payout.id} className="hover:shadow-lg transition">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">
                            {payout.artisan_name || payout.artisan_id}
                          </h3>
                          <Badge className={getStatusColor(payout.status)}>
                            {getStatusLabel(payout.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Période: {new Date(payout.period_start).toLocaleDateString('fr-FR')} à {new Date(payout.period_end).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                          {payout.net_payout.toLocaleString()} Ar
                        </div>
                        <p className="text-sm text-gray-600">
                          Montant net
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid md:grid-cols-4 gap-4 py-4 bg-gray-50 rounded-lg px-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Ventes totales</p>
                        <p className="font-medium text-gray-900">
                          {payout.total_sales.toLocaleString()} Ar
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Taux de commission</p>
                        <p className="font-medium text-gray-900">
                          {(payout.commission_rate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Commission</p>
                        <p className="font-medium text-red-600">
                          -{payout.commission_amount.toLocaleString()} Ar
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Net à payer</p>
                        <p className="font-medium text-green-600">
                          {payout.net_payout.toLocaleString()} Ar
                        </p>
                      </div>
                    </div>

                    {/* Mark as Paid Dialog */}
                    <Dialog open={openPayoutId === payout.id} onOpenChange={(open) => {
                      if (!open) setOpenPayoutId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setOpenPayoutId(payout.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Marquer comme payé
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enregistrer le paiement</DialogTitle>
                          <DialogDescription>
                            Payout de {payout.artisan_name || payout.artisan_id} pour un montant de {payout.net_payout.toLocaleString()} Ar
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Méthode de paiement
                            </label>
                            <Select 
                              value={selectedMethod} 
                              onValueChange={(value) => setSelectedMethod(value as PaymentTrackingMethod)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method.value} value={method.value}>
                                    {method.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Référence de transaction (optionnel)
                            </label>
                            <Input
                              placeholder="Ex: TXN123456"
                              value={transactionRef}
                              onChange={(e) => setTransactionRef(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Notes (optionnel)
                            </label>
                            <Input
                              placeholder="Informations supplémentaires"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>

                          <Button
                            onClick={() => handleMarkPayoutPaid(payout.id)}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={isMarkingPaid === payout.id}
                          >
                            {isMarkingPaid === payout.id ? 'Enregistrement...' : 'Enregistrer le paiement'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          {processingPayouts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Aucun payout en cours</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {processingPayouts.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {payout.artisan_name || payout.artisan_id}
                          </h3>
                          <Badge className={getStatusColor(payout.status)}>
                            {getStatusLabel(payout.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Période: {new Date(payout.period_start).toLocaleDateString('fr-FR')} à {new Date(payout.period_end).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {payout.net_payout.toLocaleString()} Ar
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          {paidPayouts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Aucun payout payé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paidPayouts.map((payout) => (
                <Card key={payout.id} className="bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {payout.artisan_name || payout.artisan_id}
                          </h3>
                          <Badge className={getStatusColor(payout.status)}>
                            {getStatusLabel(payout.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Période: {new Date(payout.period_start).toLocaleDateString('fr-FR')} à {new Date(payout.period_end).toLocaleDateString('fr-FR')}
                        </p>
                        {payout.paid_at && (
                          <p className="text-sm text-green-700 mt-1">
                            Payé le {new Date(payout.paid_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {payout.net_payout.toLocaleString()} Ar
                        </div>
                        {payout.payment_method && (
                          <p className="text-sm text-gray-600">
                            via {payout.payment_method}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayoutTracker;
